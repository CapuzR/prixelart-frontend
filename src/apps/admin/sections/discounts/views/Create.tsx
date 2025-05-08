import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, SyntheticEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Grid2 from '@mui/material/Grid';
// Hooks, Types, Context, API
import { useSnackBar } from 'context/GlobalContext';
import { AdjustmentMethod, ApplicableEntity, Discount, Entity } from 'types/discount.types';
import { Product, Variant } from 'types/product.types';
import { createDiscount } from '@api/discount.api';
import { fetchProducts } from '@api/product.api';

// MUI Components
import {
    Box, Typography, TextField, Button, Paper, FormControlLabel, Checkbox,
    CircularProgress, Alert, Stack, Select, MenuItem, InputLabel, FormControl,
    FormHelperText, Autocomplete, Chip, Divider, InputAdornment,
    Accordion, AccordionSummary, AccordionDetails,
    Avatar,
    Tooltip,
    IconButton
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Icon for Accordion
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Icon for Error Summary
import Title from '@apps/admin/components/Title';

// Date Picker Components
import { DatePicker } from '@mui/lab';
import { Dayjs } from 'dayjs';
import { ADJUSTMENT_METHOD_OPTIONS, calculateDiscountedPrice, ENTITY_TYPE_OPTIONS, formatPrice, getProductImageUrl, ProductOrVariantOption } from '@apps/admin/utils/discountSurchargeUtils';

// --- Constants and Types ---

interface OverrideFormState extends ApplicableEntity {
    tempId: string;
}

type SingleOverrideErrors = NonNullable<DiscountValidationErrors['entityOverrides']>[number];

const initialFormState: Omit<Discount, '_id' | 'applicableProducts'> & {
    entityOverrides: OverrideFormState[];
    applicableProducts: [string, string?][];
} = {
    name: "",
    description: "",
    active: true,
    adjustmentMethod: 'percentage',
    defaultValue: 0,
    applicableProducts: [],
    applicableArts: [],
    appliesToAllProducts: false,
    appliestoAllArts: false,
    dateRange: undefined,
    entityOverrides: [],
};

// --- END UPDATE ---

interface DiscountValidationErrors {
    // Field errors
    name?: string; description?: string; adjustmentMethod?: string; defaultValue?: string;
    applicableProducts?: string; // Error for selection requirement
    priceValidation?: string; // NEW: Error for price <= 0
    dateRange?: string; startDate?: string; endDate?: string;
    // Override errors (indexed)
    entityOverrides?: { [index: number]: { type?: string; id?: string; adjustmentMethod?: string; customValue?: string } };
    // General summary message (optional)
    summary?: string;
}

// --- Component ---
const CreateDiscount: React.FC = () => {
    const navigate = useNavigate();
    const { showSnackBar } = useSnackBar();

    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<DiscountValidationErrors | null>(null);
    const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selectedProductVariants, setSelectedProductVariants] = useState<ProductOrVariantOption[]>([]);
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    // State for Accordion expansion
    const [expandedAccordion, setExpandedAccordion] = useState<string | false>('applicability');

    const productVariantOptions = useMemo((): ProductOrVariantOption[] => {
        const options: ProductOrVariantOption[] = [];
        allProducts.forEach(product => {
            if (!product._id || !product.variants || product.variants.length === 0) return; // Skip products without ID or variants

            const productIdStr = product._id.toString();
            const productImageUrl = getProductImageUrl(product);

            // --- Calculate Price Ranges for "Todo el producto" ---
            let minPublic = Infinity;
            let maxPublic = -Infinity;
            let minPrixer = Infinity;
            let maxPrixer = -Infinity;
            let validPricesFound = false;

            product.variants.forEach(variant => {
                const publicP = parseFloat(variant.publicPrice);
                const prixerP = parseFloat(variant.prixerPrice);

                if (!isNaN(publicP)) {
                    minPublic = Math.min(minPublic, publicP);
                    maxPublic = Math.max(maxPublic, publicP);
                    validPricesFound = true;
                }
                if (!isNaN(prixerP)) {
                    minPrixer = Math.min(minPrixer, prixerP);
                    maxPrixer = Math.max(maxPrixer, prixerP);
                    validPricesFound = true;
                }
            });

            let priceRangeStr = '(Precios N/A)'; // Default if no valid prices
            if (validPricesFound) {
                const formatRange = (min: number, max: number, prefix: string): string => {
                    if (min === Infinity || max === -Infinity) return `${prefix}: USD N/A`; // Handle case where only one price type had valid numbers
                    if (min === max) return `${prefix}: USD ${min.toFixed(2)}`;
                    return `${prefix}: USD ${min.toFixed(2)} - USD ${max.toFixed(2)}`;
                };
                priceRangeStr = `(${formatRange(minPublic, maxPublic, 'Precio Normal')}, ${formatRange(minPrixer, maxPrixer, 'Precio Prixer')})`;
            }
            // --- End Price Range Calculation ---

            // Add option for selecting the whole product with price range
            options.push({
                id: productIdStr,
                label: `${product.name} (Todo el producto) ${priceRangeStr}`, // Append range string
                isProduct: true,
                productId: productIdStr,
                productName: product.name,
                imageUrl: productImageUrl
            });

            // Add options for individual variants with their prices
            product.variants.forEach(variant => {
                if (!variant._id) return;
                const variantImageUrl = getProductImageUrl(product, variant);
                const variantPriceStr = `(Precio Normal: ${formatPrice(variant.publicPrice)}, Precio Prixer: ${formatPrice(variant.prixerPrice)})`;

                options.push({
                    id: `${productIdStr}_${variant._id}`,
                    label: `    ↳ ${variant.name || 'Variante sin nombre'} ${variantPriceStr}`, // Append variant prices
                    isProduct: false,
                    productId: productIdStr,
                    productName: product.name,
                    variantId: variant._id,
                    variantName: variant.name,
                    imageUrl: variantImageUrl
                });
            });
        });
        return options;
    }, [allProducts]);

    // Fetch Products and Arts
    const loadItems = useCallback(async () => {
        setIsLoadingItems(true);
        try {
            // Only fetch products
            const productsData = await fetchProducts() as unknown as Promise<Product[]>;
            setAllProducts((await productsData).filter(p => p._id && p.variants && p.variants.length > 0)); // Ensure products have variants for selection

        } catch (err: any) {
            console.error("Failed to load products:", err);
            const message = err?.response?.data?.message || err.message || "Error al cargar productos.";
            showSnackBar(`Error cargando datos: ${message}`);
        }
        finally {
            setIsLoadingItems(false);
        }
    }, [showSnackBar]);

    useEffect(() => { loadItems(); }, [loadItems]);

    // --- Handlers ---
    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = event.target as HTMLInputElement; // Type assertion
        const { name, value, type } = target;
        const checked = target.checked; // For checkboxes

        const fieldVal = type === "checkbox" ? checked : value;

        setFormData((prevData) => ({
            ...prevData,
            [name]: fieldVal,
        }));

        // Clear specific validation error
        if (validationErrors && validationErrors[name as keyof DiscountValidationErrors]) {
            setValidationErrors(prevErrors => {
                const updated = { ...prevErrors };
                delete updated[name as keyof DiscountValidationErrors];
                return Object.keys(updated).length > 0 ? updated : null;
            });
        }
    };

    const handleSelectChange = (event: ChangeEvent<{ name?: string; value: unknown }>) => {
        const name = event.target.name as keyof typeof formData;
        const value = event.target.value;

        setFormData(prev => ({
            ...prev,
            // Assert value type based on known select fields
            [name]: value as AdjustmentMethod | Entity // Adjust as necessary for other selects
        }));

        // Clear specific validation error
        if (validationErrors && validationErrors[name as keyof DiscountValidationErrors]) {
            setValidationErrors(prevErrors => {
                const updated = { ...prevErrors };
                delete updated[name as keyof DiscountValidationErrors];
                return Object.keys(updated).length > 0 ? updated : null;
            });
        }
    };

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: checked };
            // If "Applies to All Products" is checked, clear specific selections
            if (name === 'appliesToAllProducts' && checked) {
                newState.applicableProducts = [];
                setSelectedProductVariants([]); // Also clear the Autocomplete visual state
            }
            // No need for Arts logic here anymore
            return newState;
        });
        // Clear relevant validation error if checkbox changes state
        if (name === 'appliesToAllProducts' && validationErrors?.applicableProducts) {
            setValidationErrors(prevErrors => {
                if (!prevErrors) return null;
                const updated = { ...prevErrors };
                delete updated.applicableProducts;
                // Also clear price validation if we switch to appliesToAll
                if (checked) delete updated.priceValidation;
                return Object.keys(updated).length > 0 ? updated : null;
            });
        }
    };

    const handleProductVariantChange = (event: SyntheticEvent, newValue: ProductOrVariantOption[]) => { /* ... same as before ... */
        setSelectedProductVariants(newValue);

        const finalApplicableVariants = new Set<string>();

        newValue.forEach(option => {
            if (option.isProduct) {
                const product = allProducts.find(p => p._id!.toString() === option.productId);
                if (product && product.variants) {
                    product.variants.forEach(variant => {
                        if (variant._id) {
                            finalApplicableVariants.add(`${product._id}_${variant._id}`);
                        }
                    });
                }
            } else if (option.variantId) {
                finalApplicableVariants.add(`${option.productId}_${option.variantId}`);
            }
        });

        const newApplicableProducts: [string, string][] = Array.from(finalApplicableVariants).map(idPair => {
            const [prodId, varId] = idPair.split('_');
            return [prodId, varId];
        });

        setFormData(prev => ({ ...prev, applicableProducts: newApplicableProducts }));

        if (validationErrors?.applicableProducts || validationErrors?.priceValidation) {
            setValidationErrors(prevErrors => {
                if (!prevErrors) return null;
                const updated = { ...prevErrors };
                delete updated.applicableProducts;
                delete updated.priceValidation;
                return Object.keys(updated).length > 0 ? updated : null;
            });
        }
    };

    // Date Picker Handlers remain the same
    const handleStartDateChange = (newValue: Dayjs | null) => { /* ... */
        setStartDate(newValue);
        if (validationErrors?.startDate || validationErrors?.endDate || validationErrors?.dateRange) {
            setValidationErrors(prevErrors => { const updated = { ...prevErrors }; delete updated.startDate; delete updated.endDate; delete updated.dateRange; return Object.keys(updated).length > 0 ? updated : null; });
        }
    };
    const handleEndDateChange = (newValue: Dayjs | null) => { /* ... */
        setEndDate(newValue);
        if (validationErrors?.startDate || validationErrors?.endDate || validationErrors?.dateRange) {
            setValidationErrors(prevErrors => { const updated = { ...prevErrors }; delete updated.startDate; delete updated.endDate; delete updated.dateRange; return Object.keys(updated).length > 0 ? updated : null; });
        }
    };


    // --- Entity Override Handlers (remain the same) ---
    const handleAddOverride = () => {
        setFormData(prev => ({
            ...prev,
            entityOverrides: [
                ...prev.entityOverrides,
                { tempId: uuidv4(), type: 'user', adjustmentMethod: 'percentage', customValue: 0, id: '', name: '' }
            ]
        }));
        if (validationErrors?.entityOverrides) {
            setValidationErrors(prevErrors => { if (!prevErrors) return null; const updated = { ...prevErrors }; delete updated.entityOverrides; return Object.keys(updated).length > 0 ? updated : null; });
        }
    };

    const handleOverrideChange = (tempId: string, field: keyof ApplicableEntity, value: string | number | Entity | AdjustmentMethod) => {
        setFormData(prev => ({
            ...prev,
            entityOverrides: prev.entityOverrides.map((ov: OverrideFormState) =>
                ov.tempId === tempId ? { ...ov, [field]: value } : ov
            )
        }));
        // Clear specific override validation error
        if (validationErrors?.entityOverrides) {
            const index = formData.entityOverrides.findIndex((ov: OverrideFormState) => ov.tempId === tempId);
            if (index === -1) return;

            const errorFieldKey = field as keyof SingleOverrideErrors;

            if (validationErrors.entityOverrides[index]?.[errorFieldKey]) {
                setValidationErrors(prevErrors => {
                    if (!prevErrors?.entityOverrides?.[index]) return prevErrors;

                    const updatedOverrides = { ...(prevErrors.entityOverrides) };
                    const specificOverrideErrors = { ...updatedOverrides[index] };

                    delete specificOverrideErrors[errorFieldKey];

                    if (Object.keys(specificOverrideErrors).length === 0) {
                        delete updatedOverrides[index];
                    } else {
                        updatedOverrides[index] = specificOverrideErrors;
                    }

                    const finalOverrides = Object.keys(updatedOverrides).length > 0 ? updatedOverrides : undefined;
                    const newErrors = { ...prevErrors, entityOverrides: finalOverrides };
                    if (!newErrors.entityOverrides) delete newErrors.entityOverrides;
                    // Also clear general price validation if an override changes, as it *might* become valid/invalid
                    delete newErrors.priceValidation;


                    return Object.keys(newErrors).length > 0 ? newErrors : null;
                });
            } else if (field === 'customValue' || field === 'adjustmentMethod') {
                // If value/method changes (even if not previously an error), clear general price validation
                setValidationErrors(prevErrors => {
                    if (!prevErrors) return null;
                    const updated = { ...prevErrors };
                    delete updated.priceValidation;
                    return Object.keys(updated).length > 0 ? updated : null;
                });
            }
        }
    };

    const handleRemoveOverride = (tempIdToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            entityOverrides: prev.entityOverrides.filter((ov: OverrideFormState) => ov.tempId !== tempIdToRemove)
        }));
        // Clear price validation error when an override is removed
        if (validationErrors?.priceValidation || validationErrors?.entityOverrides) {
            setValidationErrors(prevErrors => {
                if (!prevErrors) return null;
                const updated = { ...prevErrors };
                delete updated.priceValidation;
                // Optionally clean up indexed override errors if necessary, though validation handles it
                return Object.keys(updated).length > 0 ? updated : null;
            });
        }
    };

    const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedAccordion(isExpanded ? panel : false);
    };

    // --- Validation ---
    // --- UPDATED: Capture specific error messages for summary ---
    const validateForm = (): boolean => {
        const errors: DiscountValidationErrors = {};
        const errorMessages: string[] = []; // For summary

        if (!formData.name.trim()) { errors.name = "El nombre es obligatorio."; errorMessages.push("Nombre"); }
        if (!formData.description.trim()) { errors.description = "La descripción es obligatoria."; errorMessages.push("Descripción"); }

        const defaultValueNum = Number(formData.defaultValue);
        if (isNaN(defaultValueNum)) { errors.defaultValue = "El valor base debe ser un número."; errorMessages.push("Valor Base"); }
        else if (formData.adjustmentMethod === 'percentage' && (defaultValueNum < 0 || defaultValueNum > 1)) { errors.defaultValue = "Para porcentaje, el valor debe estar entre 0 y 1."; errorMessages.push("Valor Base (Porcentaje)"); }
        else if (formData.adjustmentMethod === 'absolute' && defaultValueNum < 0) { errors.defaultValue = "Para monto absoluto, el valor no puede ser negativo."; errorMessages.push("Valor Base (Absoluto)"); }

        // Check if specific products/variants are required but none selected
        if (!formData.appliesToAllProducts && formData.applicableProducts.length === 0) {
            errors.applicableProducts = "Seleccione productos/variantes o marque 'Aplica a todos'.";
            errorMessages.push("Productos/Variantes");
        }
        // Removed Arts validation

        // Date range validation
        if (startDate && endDate && !startDate.isBefore(endDate)) { errors.dateRange = "La fecha de inicio debe ser anterior a la fecha de fin."; errors.startDate = " "; errors.endDate = " "; errorMessages.push("Rango de Fechas"); }
        else if ((startDate && !endDate) || (!startDate && endDate)) { errors.dateRange = "Especifique ambas fechas del rango o ninguna."; if (startDate && !endDate) errors.endDate = " "; if (!startDate && endDate) errors.startDate = " "; errorMessages.push("Rango de Fechas (Incompleto)"); }

        // --- *** NEW: Price Validation *** ---
        // Only run if appliesToAllProducts is false and variants are selected, AND default value is valid
        if (!formData.appliesToAllProducts && formData.applicableProducts.length > 0 && !errors.defaultValue) {
            const invalidVariants: string[] = [];
            // Create a quick lookup map for variants
            const variantMap = new Map<string, Variant>();
            allProducts.forEach(p => {
                if (p._id && p.variants) {
                    p.variants.forEach(v => {
                        if (v._id) {
                            variantMap.set(`${p._id}_${v._id}`, v);
                        }
                    });
                }
            });

            for (const [productId, variantId] of formData.applicableProducts) {
                const variant = variantMap.get(`${productId}_${variantId}`);
                if (!variant) continue; // Should not happen if data is consistent

                const discountedPublic = calculateDiscountedPrice(variant.publicPrice, formData.adjustmentMethod, defaultValueNum);
                const discountedPrixer = calculateDiscountedPrice(variant.prixerPrice, formData.adjustmentMethod, defaultValueNum);

                // Check if calculation was possible and result is non-positive
                if ((discountedPublic !== null && discountedPublic <= 0) || (discountedPrixer !== null && discountedPrixer <= 0)) {
                    const productName = allProducts.find(p => p._id!.toString() === productId)?.name || 'Producto Desconocido';
                    invalidVariants.push(`${productName} - ${variant.name || 'Variante sin nombre'}`);
                }
            }

            if (invalidVariants.length > 0) {
                errors.priceValidation = `El descuento base resulta en precio 0 o negativo para: ${invalidVariants.slice(0, 2).join(', ')}${invalidVariants.length > 2 ? '...' : ''}.`;
                errorMessages.push("Precios Inválidos"); // Add to summary
                // Also visually mark the product selector as having an issue
                errors.applicableProducts = " "; // Add a space to trigger error state without text
            }
        }
        // --- *** END Price Validation *** ---


        // Entity Override Validation (remains largely the same)
        const overrideErrors: DiscountValidationErrors['entityOverrides'] = {};
        let hasOverrideError = false;
        formData.entityOverrides.forEach((ov, index) => {
            const currentErrors: SingleOverrideErrors = {};
            let overrideErrorFields: string[] = [];
            if (!ov.type) { currentErrors.type = "Requerido"; overrideErrorFields.push("Tipo Entidad"); }
            if (!ov.adjustmentMethod) { currentErrors.adjustmentMethod = "Requerido"; overrideErrorFields.push("Método Excep."); }

            const customValueNum = Number(ov.customValue);
            if (ov.customValue === undefined || ov.customValue === null || isNaN(customValueNum)) { currentErrors.customValue = "Valor numérico requerido."; overrideErrorFields.push("Valor Excepción"); }
            else if (ov.adjustmentMethod === 'percentage' && (customValueNum < 0 || customValueNum > 1)) { currentErrors.customValue = "Valor entre 0 y 1."; overrideErrorFields.push("Valor Excepción (%)"); }
            else if (ov.adjustmentMethod === 'absolute' && customValueNum < 0) { currentErrors.customValue = "Valor no negativo."; overrideErrorFields.push("Valor Excepción ($)"); }

            if (Object.keys(currentErrors).length > 0) {
                overrideErrors[index] = currentErrors;
                if (!hasOverrideError) {
                    errorMessages.push(`Excepción(es)`); // Simpler summary message
                }
                hasOverrideError = true;
            }
        });
        if (hasOverrideError) {
            errors.entityOverrides = overrideErrors;
        }

        // Add summary message if there are errors
        if (errorMessages.length > 0) {
            // Prioritize price validation message if it exists
            const mainErrorFocus = errors.priceValidation ? errors.priceValidation : `Por favor, corrija los errores marcados (${errorMessages.join(', ')}).`;
            errors.summary = mainErrorFocus;
        }

        setValidationErrors(Object.keys(errors).length > 0 ? errors : null);
        if (Object.keys(errors).length > 0 && !errors.summary) { // Ensure summary exists if errors do
            errors.summary = `Por favor, corrija los errores marcados.`;
            setValidationErrors(errors)
        }
        if (Object.keys(errors).length > 0 && errors.summary) {
            // Only show snackbar if it's not just the price validation summary (which is already detailed)
            if (!errors.priceValidation || Object.keys(errors).length > 1) {
                showSnackBar("Por favor, corrija los errores indicados en el formulario.");
            }
        }
        return Object.keys(errors).length === 0;
    };
    // --- END UPDATE ---

    // --- Submission (remains largely the same logic, payload is correct) ---
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        // Construct final overrides (same logic)
        const finalOverrides: ApplicableEntity[] = formData.entityOverrides.map((override: OverrideFormState) => {
            const { tempId, ...rest } = override;
            const overrideData: ApplicableEntity = {
                type: rest.type,
                adjustmentMethod: rest.adjustmentMethod,
                id: rest.id?.trim() || undefined,
                name: rest.name?.trim() || undefined,
                customValue: (rest.customValue !== undefined && rest.customValue !== null && !isNaN(Number(rest.customValue)))
                    ? Number(rest.customValue)
                    : undefined,
            };
            Object.keys(overrideData).forEach(key => {
                if (overrideData[key as keyof ApplicableEntity] === undefined) {
                    delete overrideData[key as keyof ApplicableEntity];
                }
            });
            return overrideData;
        });

        // Construct payload (removed arts, applicableProducts is now guaranteed [prodId, varId])
        const payload: Omit<Discount, '_id' | 'applicableArts'> = { // Adjust Omit<>
            name: formData.name,
            description: formData.description,
            active: formData.active,
            adjustmentMethod: formData.adjustmentMethod,
            defaultValue: Number(formData.defaultValue),
            appliesToAllProducts: formData.appliesToAllProducts,
            appliestoAllArts: false,
            applicableProducts: formData.appliesToAllProducts ? [] : formData.applicableProducts,
            // applicableArts removed
            dateRange: startDate && endDate ? { start: startDate.toDate(), end: endDate.toDate() } : undefined,
            entityOverrides: finalOverrides,
        };


        try {
            console.log("Submitting Discount Data:", payload);
            const response = await createDiscount(payload as Discount); // Cast needed if API expects full Discount type internally
            if (response) {
                showSnackBar(`Descuento "${formData.name}" creado.`);
                navigate("/admin/discount/read");
            } else {
                throw new Error("La creación del descuento falló (respuesta vacía).");
            }
        } catch (err: any) {
            console.error("Failed to create discount:", err);
            const message = err?.response?.data?.message || err.message || "Error al crear el descuento.";
            setValidationErrors(prev => ({ ...(prev || {}), summary: `Error del servidor: ${message}` }));
            showSnackBar(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => navigate("/admin/discount/read");

    // --- Render ---
    return (
        <>
            <Title title="Crear Nuevo Descuento" />
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 2 }}>
                <form onSubmit={handleSubmit} noValidate>
                    {/* Error Summary Alert */}
                    {validationErrors?.summary && (
                        <Alert severity={validationErrors.priceValidation && Object.keys(validationErrors).length === 1 ? "warning" : "error"} icon={<WarningAmberIcon fontSize="inherit" />} sx={{ mb: 3 }}>
                            {validationErrors.summary}
                        </Alert>
                    )}

                    <Grid2 container spacing={3}>
                        {/* Basic Info & Default Adjustment */}
                        <Grid2 size={{ xs: 12, sm: 6 }}><TextField label="Nombre del Descuento" name="name" value={formData.name} onChange={handleInputChange} required fullWidth disabled={isSubmitting} error={!!validationErrors?.name} helperText={validationErrors?.name} /></Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}><FormControlLabel control={<Checkbox checked={formData.active} onChange={handleCheckboxChange} name="active" disabled={isSubmitting} />} label="Activo" /></Grid2>
                        <Grid2 size={{ xs: 12 }}><TextField label="Descripción" name="description" value={formData.description} onChange={handleInputChange} required fullWidth multiline rows={3} disabled={isSubmitting} error={!!validationErrors?.description} helperText={validationErrors?.description} /></Grid2>
                        <Grid2 size={{ xs: 12 }}><Divider sx={{ my: 2 }} /></Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth required error={!!validationErrors?.adjustmentMethod}>
                                <InputLabel id="adjustment-method-label">Método de Ajuste Base</InputLabel>
                                <Select labelId="adjustment-method-label" name="adjustmentMethod" value={formData.adjustmentMethod} label="Método de Ajuste Base" onChange={handleSelectChange as any} disabled={isSubmitting}>
                                    {ADJUSTMENT_METHOD_OPTIONS.map(opt => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                                </Select>
                                <FormHelperText>{validationErrors?.adjustmentMethod}</FormHelperText>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <TextField
                                name="defaultValue" type="number" label="Valor de Ajuste Base" value={formData.defaultValue} onChange={handleInputChange} required fullWidth disabled={isSubmitting}
                                helperText={validationErrors?.defaultValue || (formData.adjustmentMethod === 'percentage' ? "Ej: 0.15 para 15%" : "Ej: 5.00")}
                                error={!!validationErrors?.defaultValue}
                                InputProps={{
                                    endAdornment: formData.adjustmentMethod === 'percentage' ? <InputAdornment position="end">% (Decimal)</InputAdornment> : undefined,
                                    startAdornment: formData.adjustmentMethod === 'absolute' ? <InputAdornment position="start">$</InputAdornment> : undefined,
                                    inputProps: formData.adjustmentMethod === 'percentage' ? { step: "0.01", min: "0", max: "1" } : { step: "0.01", min: "0" }
                                }}
                            />
                        </Grid2>

                        {/* --- Accordion Sections --- */}
                        <Grid2 size={{ xs: 12 }}>
                            {/* Applicability Accordion */}
                            <Accordion
                                expanded={expandedAccordion === 'applicability'}
                                onChange={handleAccordionChange('applicability')}
                                sx={{ '&.Mui-expanded': { margin: '16px 0' } }} // Control margin when expanded
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="applicability-content" id="applicability-header">
                                    <Typography variant="h6" component="div">Aplicabilidad Base</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid2 container spacing={2}>
                                        {/* Products/Variants Applicability */}
                                        <Grid2 size={{ xs: 12 }}>
                                            <Box sx={{ border: 1, borderColor: (theme) => (validationErrors?.applicableProducts || validationErrors?.priceValidation ? theme.palette.error.main : 'divider'), borderRadius: 1, p: 2 }}>
                                                <FormControlLabel control={<Checkbox checked={formData.appliesToAllProducts} onChange={handleCheckboxChange} name="appliesToAllProducts" disabled={isSubmitting} />} label="Aplica a Todos los Productos/Variantes" />
                                                {!formData.appliesToAllProducts && (
                                                    <Autocomplete
                                                        multiple sx={{ mt: 1 }}
                                                        id="applicable-products-variants-select"
                                                        options={productVariantOptions}
                                                        value={selectedProductVariants}
                                                        onChange={handleProductVariantChange}
                                                        getOptionLabel={(option) => option.label.trim()}
                                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                                        groupBy={(option) => option.productName}
                                                        loading={isLoadingItems}
                                                        disabled={isSubmitting}
                                                        disableCloseOnSelect
                                                        renderOption={(props, option, { selected }) => (
                                                            <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 }, display: 'flex', alignItems: 'center' }} {...props}>
                                                                <Avatar src={option.imageUrl} variant="rounded" sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'grey.200' }}>
                                                                    {option.isProduct ? 'P' : 'V'}
                                                                </Avatar>
                                                                <Typography variant="body2" component="span" sx={{ flexGrow: 1, marginLeft: option.isProduct ? 0 : '15px' }}>
                                                                    {option.label.trim()}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        renderTags={(value, getTagProps) =>
                                                            value.map((option, index) => (
                                                                <Chip
                                                                    avatar={<Avatar src={option.imageUrl} sx={{ width: 20, height: 20 }}>{option.isProduct ? 'P' : 'V'}</Avatar>}
                                                                    variant="outlined"
                                                                    // Use the full label for the chip as well
                                                                    label={option.label.trim()}
                                                                    size="small"
                                                                    {...getTagProps({ index })}
                                                                    // Add sx for potential overflow
                                                                    sx={{
                                                                        maxWidth: '95%', // Prevent excessive width
                                                                        '.MuiChip-label': { // Target the label part
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                            display: 'inline-block', // Needed for ellipsis
                                                                        },
                                                                    }}
                                                                />
                                                            ))
                                                        }
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                label="Productos o Variantes Específicos"
                                                                placeholder={isLoadingItems ? "Cargando..." : "Seleccionar..."}
                                                                error={!!validationErrors?.applicableProducts || !!validationErrors?.priceValidation}
                                                                helperText={validationErrors?.applicableProducts && validationErrors.applicableProducts !== " " ? validationErrors.applicableProducts : (validationErrors?.priceValidation ? "Ajuste resulta en precios inválidos para seleccíon." : null)}
                                                            />
                                                        )}
                                                    />
                                                )}
                                            </Box>
                                        </Grid2>
                                    </Grid2>
                                </AccordionDetails>
                            </Accordion>

                            {/* Date Range Accordion */}
                            <Accordion expanded={expandedAccordion === 'dateRange'} onChange={handleAccordionChange('dateRange')} sx={{ '&.Mui-expanded': { margin: '16px 0' } }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="dateRange-content" id="dateRange-header">
                                    <Typography variant="h6" component="div">Rango de Fechas (Opcional)</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid2 container spacing={2}>
                                        <Grid2 size={{ xs: 12, sm: 6 }}>
                                            <DatePicker
                                                label="Fecha de Inicio" // Added label
                                                value={startDate}
                                                onChange={handleStartDateChange}
                                                disabled={isSubmitting}
                                                slotProps={{ textField: { fullWidth: true, error: !!validationErrors?.startDate || !!validationErrors?.dateRange, helperText: validationErrors?.startDate === " " ? (validationErrors?.dateRange || "") : (validationErrors?.startDate || validationErrors?.dateRange) } }}
                                            />
                                        </Grid2>
                                        <Grid2 size={{ xs: 12, sm: 6 }}>
                                            <DatePicker
                                                label="Fecha de Fin" // Added label
                                                value={endDate}
                                                onChange={handleEndDateChange}
                                                disabled={isSubmitting}
                                                minDate={startDate || undefined}
                                                slotProps={{ textField: { fullWidth: true, error: !!validationErrors?.endDate || !!validationErrors?.dateRange, helperText: validationErrors?.endDate === " " ? (validationErrors?.dateRange || "") : (validationErrors?.endDate || validationErrors?.dateRange) } }}
                                            />
                                        </Grid2>
                                    </Grid2>
                                </AccordionDetails>
                            </Accordion>

                            {/* Entity Overrides Accordion */}
                            <Accordion expanded={expandedAccordion === 'overrides'} onChange={handleAccordionChange('overrides')} sx={{ '&.Mui-expanded': { margin: '16px 0' } }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="overrides-content" id="overrides-header">
                                    <Typography variant="h6" component="div">Excepciones Específicas (Opcional)</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {formData.entityOverrides.length === 0 && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No se han añadido excepciones.</Typography>
                                    )}
                                    {formData.entityOverrides.map((override: OverrideFormState, index) => {
                                        const overrideErrors = validationErrors?.entityOverrides?.[index] || {};
                                        return (
                                            <Box key={override.tempId} sx={{ border: 1, borderColor: Object.keys(overrideErrors).length > 0 ? 'error.main' : 'divider', borderRadius: 1, p: 2, mb: 2, position: 'relative' }}>
                                                <Tooltip title="Eliminar Excepción">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveOverride(override.tempId)}
                                                        disabled={isSubmitting}
                                                        sx={{ position: 'absolute', top: 8, right: 8 }}
                                                    >
                                                        <DeleteIcon fontSize='small' />
                                                    </IconButton>
                                                </Tooltip>
                                                <Grid2 container spacing={2}>
                                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                                        <FormControl fullWidth required error={!!overrideErrors.type}>
                                                            <InputLabel id={`override-type-label-${index}`}>Tipo Entidad</InputLabel>
                                                            <Select
                                                                labelId={`override-type-label-${index}`}
                                                                label="Tipo Entidad" // Added label prop
                                                                name="type"
                                                                value={override.type}
                                                                onChange={(e) => handleOverrideChange(override.tempId, 'type', e.target.value as Entity)}
                                                                disabled={isSubmitting}
                                                            >
                                                                {ENTITY_TYPE_OPTIONS.map(opt => (
                                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                                ))}
                                                            </Select>
                                                            <FormHelperText>{overrideErrors.type}</FormHelperText>
                                                        </FormControl>
                                                    </Grid2>
                                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                                        <TextField
                                                            label="ID Entidad (Opcional)"
                                                            name="id"
                                                            value={override.id || ""}
                                                            onChange={(e) => handleOverrideChange(override.tempId, 'id', e.target.value)}
                                                            fullWidth
                                                            disabled={isSubmitting}
                                                            error={!!overrideErrors.id}
                                                            helperText={overrideErrors.id || "Dejar vacío si aplica a todo el tipo"}
                                                        />
                                                    </Grid2>
                                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                                        <FormControl fullWidth required error={!!overrideErrors.adjustmentMethod}>
                                                            <InputLabel id={`override-method-label-${index}`}>Método Excep.</InputLabel>
                                                            <Select
                                                                labelId={`override-method-label-${index}`}
                                                                label="Método Excep." // Added label prop
                                                                name="adjustmentMethod"
                                                                value={override.adjustmentMethod}
                                                                onChange={(e) => handleOverrideChange(override.tempId, 'adjustmentMethod', e.target.value as AdjustmentMethod)}
                                                                disabled={isSubmitting}
                                                            >
                                                                {ADJUSTMENT_METHOD_OPTIONS.map(opt => (
                                                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                                ))}
                                                            </Select>
                                                            <FormHelperText>{overrideErrors.adjustmentMethod}</FormHelperText>
                                                        </FormControl>
                                                    </Grid2>
                                                    <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                                        <TextField
                                                            label="Valor Excepción"
                                                            name="customValue" type="number" value={override.customValue ?? ''}
                                                            onChange={(e) => handleOverrideChange(override.tempId, 'customValue', e.target.value)}
                                                            required fullWidth disabled={isSubmitting} error={!!overrideErrors.customValue}
                                                            helperText={overrideErrors.customValue || (override.adjustmentMethod === 'percentage' ? "Ej: 0.10 para 10%" : "Ej: 2.50")}
                                                            InputProps={{
                                                                inputProps: override.adjustmentMethod === 'percentage' ? { step: "0.01", min: "0", max: "1" } : { step: "0.01", min: "0" },
                                                                endAdornment: override.adjustmentMethod === 'percentage' ? <InputAdornment position="end">%</InputAdornment> : undefined,
                                                                startAdornment: override.adjustmentMethod === 'absolute' ? <InputAdornment position="start">$</InputAdornment> : undefined,

                                                            }} />
                                                    </Grid2>
                                                </Grid2>
                                            </Box>
                                        );
                                    })}
                                    <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddOverride} disabled={isSubmitting} variant="outlined" size="small" sx={{ mt: formData.entityOverrides.length > 0 ? 0 : 2 }}>
                                        Añadir Excepción
                                    </Button>
                                </AccordionDetails>
                            </Accordion>
                        </Grid2>
                        {/* --- End Accordion Sections --- */}


                        {/* Actions */}
                        <Grid2 size={{ xs: 12 }}>
                            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                                <Button type="button" variant="outlined" color="secondary" onClick={handleCancel} disabled={isSubmitting}>Cancelar</Button>
                                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || isLoadingItems} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
                                    {isSubmitting ? "Creando..." : "Crear Descuento"}
                                </Button>
                            </Stack>
                        </Grid2>

                    </Grid2>
                </form >
            </Paper >
        </>
    );
};

export default CreateDiscount;