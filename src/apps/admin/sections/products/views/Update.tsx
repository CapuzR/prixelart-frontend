// src/apps/admin/sections/products/views/UpdateProduct.tsx
import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Hooks, Types, Context, API
import { useSnackBar } from 'context/GlobalContext';
import { Product, Variant, VariantAttribute } from 'types/product.types';
import { fetchProductDetails, updateProduct } from '@api/product.api';

// MUI Components
import {
  Box, Typography, TextField, Button, Paper, FormControlLabel, Checkbox,
  CircularProgress, Alert, Stack, Divider, IconButton, Tooltip, Chip,
  Accordion, AccordionSummary, AccordionDetails, FormHelperText
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Title from '@apps/admin/components/Title';
import Grid2 from '@mui/material/Grid';
// --- Type Enhancements for Form State (Copied from CreateProduct, added _id to FormVariant) ---

interface AttributeType {
  id: string;
  name: string;
}

interface FormVariant extends Omit<Variant, '_id' | 'attributes'> {
  tempId: string;
  _id?: string; // Original DB ID if it exists
  attributes: { [attributeName: string]: string };
  variantNameManuallyEdited: boolean;
}

interface FormState extends Pick<Product, 'name' | 'description' | 'category' | 'productionTime' | 'cost' | 'coordinates' | 'mockUp' | 'active' | 'autoCertified' | 'bestSeller' | 'hasSpecialVar'> {
  attributeTypes: AttributeType[];
  variants: FormVariant[];
}

interface ValidationErrors {
  product?: { [key in keyof Omit<FormState, 'variants' | 'attributeTypes'>]?: string };
  attributeTypes?: { [index: number]: { name?: string } };
  variants?: { [tempId: string]: { [key in keyof FormVariant | 'attributeValues']?: string } };
}

// --- Initial State ---

const initialAttributeTypeState: AttributeType = { id: uuidv4(), name: '' };

// Slightly different initial variant state for Update (includes _id)
const initialVariantStateForUpdate = (attributeTypes: AttributeType[]): FormVariant => {
  const attributes: { [attributeName: string]: string } = {};
  attributeTypes.forEach(at => {
    attributes[at.name] = '';
  });
  return {
    tempId: uuidv4(),
    _id: undefined, // New variants don't have DB ID yet
    name: '',
    variantImage: '',
    attributes: attributes,
    publicPrice: '',
    prixerPrice: '',
    variantNameManuallyEdited: false,
  };
};

const initialFormState: FormState = {
  name: "", description: "", category: "", productionTime: "", cost: "",
  coordinates: "", mockUp: "", active: true, autoCertified: false,
  bestSeller: false, hasSpecialVar: false, attributeTypes: [], variants: [],
};

// --- Helper Function ---
const generateVariantName = (attributes: { [attributeName: string]: string }): string => {
  return Object.values(attributes).filter(val => val.trim()).join(' / ');
};

// --- Component ---
const UpdateProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [originalProductName, setOriginalProductName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors | null>(null);
  const [errorVariantId, setErrorVariantId] = useState<string | null>(null);


  // --- Fetch Product Data ---
  const loadProduct = useCallback(async () => {
    if (!id) {
      setErrorFetch("No se proporcionó ID del producto."); setIsLoading(false);
      showSnackBar("ID inválido."); navigate("/admin/products/read"); return;
    }
    setIsLoading(true); setErrorFetch(null); setValidationErrors(null); setErrorVariantId(null);

    try {
      const productData = await fetchProductDetails(id) as Product;
      if (!productData) throw new Error("Producto no encontrado.");

      // 1. Derive Attribute Types from *all* variants
      const attributeNameSet = new Set<string>();
      (productData.variants || []).forEach(variant => {
        (variant.attributes || []).forEach(attribute => {
          if (attribute.name) { // Ensure name exists
            attributeNameSet.add(attribute.name.trim());
          }
        });
      });
      const derivedAttributeTypes: AttributeType[] = Array.from(attributeNameSet)
        .filter(name => name) // Filter out any potential empty names
        .map(name => ({ id: uuidv4(), name: name }));

      // 2. Transform Variants into FormVariant structure
      const transformedVariants: FormVariant[] = (productData.variants || []).map(v => {
        const attributesMap: { [attributeName: string]: string } = {};
        // Ensure all defined types have at least an empty entry
        derivedAttributeTypes.forEach(at => attributesMap[at.name] = '');
        // Populate with actual values from the variant
        (v.attributes || []).forEach(a => {
          if (a.name && attributeNameSet.has(a.name.trim())) { // Only include valid, defined attributes
            attributesMap[a.name.trim()] = a.value || '';
          }
        });

        return {
          _id: v._id, // Keep original DB ID
          tempId: v._id || uuidv4(), // Use DB ID for tempId if available
          name: v.name || '',
          variantImage: v.variantImage || '',
          publicPrice: v.publicPrice || '',
          prixerPrice: v.prixerPrice || '',
          attributes: attributesMap,
          variantNameManuallyEdited: true, // Assume existing names are final
        };
      });

      // 3. Populate form data
      setFormData({
        name: productData.name || "",
        description: productData.description || "",
        category: productData.category || "",
        productionTime: productData.productionTime || "",
        cost: productData.cost || "",
        coordinates: productData.coordinates || "",
        mockUp: productData.mockUp || "",
        active: productData.active ?? true,
        autoCertified: productData.autoCertified ?? false,
        bestSeller: productData.bestSeller ?? false,
        hasSpecialVar: productData.hasSpecialVar ?? false,
        attributeTypes: derivedAttributeTypes.length > 0 ? derivedAttributeTypes : [{ ...initialAttributeTypeState }], // Ensure at least one empty type if none derived
        variants: transformedVariants,
      });
      setOriginalProductName(productData.name);

    } catch (err: any) {
      console.error("Failed to load product:", err);
      setErrorFetch(err.message || "Error al cargar los datos del producto.");
      showSnackBar(err.message || "Error al cargar datos.");
    } finally { setIsLoading(false); }
  }, [id, navigate, showSnackBar]);

  useEffect(() => { loadProduct(); }, [loadProduct]); // Load data on mount and ID change

  // --- Handlers (Copied/Adapted from refactored CreateProduct) ---

  const handleProductInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (validationErrors?.product?.[name as keyof ValidationErrors['product']]) {
      setValidationErrors(prev => ({ ...prev, product: { ...prev?.product, [name]: undefined } }));
    }
  };

  const handleAttributeTypeNameChange = (id: string, value: string) => {
    let oldName = '';
    setFormData(prev => {
      const updatedTypes = prev.attributeTypes.map(at => {
        if (at.id === id) { oldName = at.name; return { ...at, name: value }; }
        return at;
      });
      let updatedVariants = prev.variants;
      if (oldName && oldName !== value) {
        updatedVariants = prev.variants.map(variant => {
          const newAttributes = { ...variant.attributes };
          if (Object.prototype.hasOwnProperty.call(newAttributes, oldName)) {
            newAttributes[value] = newAttributes[oldName]; delete newAttributes[oldName];
          } else { newAttributes[value] = ''; }
          const newName = !variant.variantNameManuallyEdited ? generateVariantName(newAttributes) : variant.name;
          return { ...variant, attributes: newAttributes, name: newName };
        });
      }
      return { ...prev, attributeTypes: updatedTypes, variants: updatedVariants };
    });
    setValidationErrors(prev => { /* ... clear specific error ... */
      if (!prev?.attributeTypes) return prev;
      const typeIndex = formData.attributeTypes.findIndex(at => at.id === id);
      if (typeIndex !== -1 && prev.attributeTypes?.[typeIndex]?.name) {
        const newAttributeErrors = { ...prev.attributeTypes };
        if (newAttributeErrors[typeIndex]) delete newAttributeErrors[typeIndex].name;
        if (Object.keys(newAttributeErrors[typeIndex] || {}).length === 0) delete newAttributeErrors[typeIndex];
        return { ...prev, attributeTypes: Object.keys(newAttributeErrors).length > 0 ? newAttributeErrors : undefined };
      } return prev;
    });
  };

  const handleAddAttributeType = () => {
    const newTypeId = uuidv4();
    setFormData(prev => ({
      ...prev, attributeTypes: [...prev.attributeTypes, { id: newTypeId, name: '' }],
      variants: prev.variants.map(v => ({ ...v, attributes: { ...v.attributes, ['']: '' } })) // Name will update via handleAttributeTypeNameChange
    }));
    // Focus the new input?
  };

  const handleRemoveAttributeType = (idToRemove: string) => {
    let nameToRemove = '';
    setFormData(prev => {
      const typeToRemove = prev.attributeTypes.find(at => at.id === idToRemove); nameToRemove = typeToRemove?.name || '';
      const updatedTypes = prev.attributeTypes.filter(at => at.id !== idToRemove);
      let updatedVariants = prev.variants;
      if (nameToRemove) {
        updatedVariants = prev.variants.map(variant => {
          const newAttributes = { ...variant.attributes }; delete newAttributes[nameToRemove];
          const newName = !variant.variantNameManuallyEdited ? generateVariantName(newAttributes) : variant.name;
          return { ...variant, attributes: newAttributes, name: newName };
        });
      }
      if (updatedTypes.length === 0 && updatedVariants.length > 0) {
        showSnackBar("No se puede eliminar el último tipo de atributo si existen variantes."); return prev;
      }
      return { ...prev, attributeTypes: updatedTypes, variants: updatedVariants };
    });
  };

  const handleVariantInputChange = (tempId: string, field: keyof Omit<FormVariant, 'attributes' | 'tempId' | '_id'>, value: string) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.map(v => v.tempId === tempId ? { ...v, [field]: value, variantNameManuallyEdited: field === 'name' ? true : v.variantNameManuallyEdited } : v) }));
    if (validationErrors?.variants?.[tempId]?.[field]) { /* ... clear specific error ... */
      setValidationErrors(prev => { if (!prev?.variants?.[tempId]) return prev; const newVarErrors = { ...prev.variants[tempId] }; delete newVarErrors[field]; return { ...prev, variants: { ...prev.variants, [tempId]: newVarErrors } }; });
    }
  };

  const handleVariantAttributeValueChange = (tempId: string, attributeName: string, value: string) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.map(v => { if (v.tempId === tempId) { const attrs = { ...v.attributes, [attributeName]: value }; const newName = !v.variantNameManuallyEdited ? generateVariantName(attrs) : v.name; return { ...v, attributes: attrs, name: newName }; } return v; }) }));
    if (validationErrors?.variants?.[tempId]?.attributeValues) { /* ... clear general attribute error ... */
      setValidationErrors(prev => { if (!prev?.variants?.[tempId]) return prev; const newVarErrors = { ...prev.variants[tempId] }; delete newVarErrors.attributeValues; return { ...prev, variants: { ...prev.variants, [tempId]: newVarErrors } }; });
    }
  };

  const handleAddVariant = () => {
    const validAttributeTypes = formData.attributeTypes.filter(at => at.name.trim());
    if (validAttributeTypes.length === 0) { showSnackBar("Defina al menos un nombre de atributo válido."); setValidationErrors(prev => ({ ...prev, attributeTypes: { ...prev?.attributeTypes, [0]: { name: 'Defina un nombre' } } })); return; }
    setFormData(prev => ({ ...prev, variants: [...prev.variants, initialVariantStateForUpdate(validAttributeTypes)] }));
    setErrorVariantId(null);
  };

  const handleRemoveVariant = (tempIdToRemove: string) => {
    // Optional: Add confirmation dialog here
    const variantToRemove = formData.variants.find(v => v.tempId === tempIdToRemove);
    const confirmMsg = variantToRemove?._id
      ? `¿Está seguro de eliminar esta variante existente (${variantToRemove.name})? Esto la eliminará permanentemente.`
      : `¿Está seguro de eliminar esta nueva variante (${variantToRemove?.name || 'sin nombre'})?`;

    if (window.confirm(confirmMsg)) {
      setFormData(prev => ({ ...prev, variants: prev.variants.filter(v => v.tempId !== tempIdToRemove) }));
      if (errorVariantId === tempIdToRemove) setErrorVariantId(null);
    }
  };

  const handleCopyVariant = (tempIdToCopy: string) => {
    const variantToCopy = formData.variants.find(v => v.tempId === tempIdToCopy); if (!variantToCopy) return;
    const newVariant: FormVariant = {
      ...JSON.parse(JSON.stringify(variantToCopy)), _id: undefined, // Copied variant is NEW
      tempId: uuidv4(), name: `${variantToCopy.name} (Copia)`, variantNameManuallyEdited: true,
    };
    setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
    setErrorVariantId(null);
  };

  // --- Validation (Copied from refactored CreateProduct) ---
  const validateForm = (): boolean => {
    const errors: ValidationErrors = { product: {}, attributeTypes: {}, variants: {} };
    let firstErrorVariantId: string | null = null;
    let hasErrors = false;

    // Product Details Validation...
    if (!formData.name.trim()) { errors.product!.name = "Nombre es obligatorio."; hasErrors = true; }
    if (!formData.description.trim()) { errors.product!.description = "Descripción es obligatoria."; hasErrors = true; }
    if (!formData.category.trim()) { errors.product!.category = "Categoría es obligatoria."; hasErrors = true; }
    if (formData.cost && (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) < 0)) { errors.product!.cost = "Costo debe ser número positivo."; hasErrors = true; }

    // Attribute Types Validation...
    const definedAttributeNames = new Set<string>();
    formData.attributeTypes.forEach((at, index) => {
      const trimmedName = at.name.trim();
      if (!trimmedName) {
        if (!errors.attributeTypes![index]) errors.attributeTypes![index] = {}; errors.attributeTypes![index].name = "Nombre no puede estar vacío."; hasErrors = true;
      } else if (definedAttributeNames.has(trimmedName)) {
        if (!errors.attributeTypes![index]) errors.attributeTypes![index] = {}; errors.attributeTypes![index].name = "Nombre duplicado."; hasErrors = true;
      } else { definedAttributeNames.add(trimmedName); }
    });
    if (formData.attributeTypes.length === 0 || definedAttributeNames.size === 0) {
      if (formData.variants.length > 0) { showSnackBar("Debe definir tipos de atributo válidos."); hasErrors = true; }
      else if (formData.attributeTypes.length > 0 && !errors.attributeTypes![0]?.name) { if (!errors.attributeTypes![0]) errors.attributeTypes![0] = {}; errors.attributeTypes![0].name = "Defina un tipo de atributo."; hasErrors = true; }
    }

    // Variants Validation...
    if (formData.variants.length === 0 && definedAttributeNames.size > 0) {
      // Allow submitting with no variants, maybe show info message?
    }
    formData.variants.forEach((variant) => {
      let variantHasError = false;
      if (!variant.name.trim()) { if (!errors.variants![variant.tempId]) errors.variants![variant.tempId] = {}; errors.variants![variant.tempId].name = "Nombre Variante obligatorio."; hasErrors = true; variantHasError = true; }
      if (isNaN(parseFloat(variant.publicPrice)) || parseFloat(variant.publicPrice) < 0) { if (!errors.variants![variant.tempId]) errors.variants![variant.tempId] = {}; errors.variants![variant.tempId].publicPrice = "Precio Público inválido."; hasErrors = true; variantHasError = true; }
      if (isNaN(parseFloat(variant.prixerPrice)) || parseFloat(variant.prixerPrice) < 0) { if (!errors.variants![variant.tempId]) errors.variants![variant.tempId] = {}; errors.variants![variant.tempId].prixerPrice = "Precio Prixer inválido."; hasErrors = true; variantHasError = true; }

      let attributeValueError = false;
      definedAttributeNames.forEach(attrName => { if (!variant.attributes[attrName]?.trim()) { attributeValueError = true; } });
      if (attributeValueError) { if (!errors.variants![variant.tempId]) errors.variants![variant.tempId] = {}; errors.variants![variant.tempId].attributeValues = "Valores de atributo obligatorios."; hasErrors = true; variantHasError = true; }

      if (variantHasError && !firstErrorVariantId) firstErrorVariantId = variant.tempId;
    });

    setValidationErrors(hasErrors ? errors : null);
    setErrorVariantId(firstErrorVariantId);

    if (hasErrors) { showSnackBar("Por favor, corrija los errores indicados."); formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    return !hasErrors;
  };

  // --- Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !validateForm()) return;
    setIsSubmitting(true); setValidationErrors(null);

    // Prepare payload (Adapted from refactored CreateProduct, includes _id)
    const validAttributeTypeNames = formData.attributeTypes.map(at => at.name.trim()).filter(name => name);
    const finalVariants: Variant[] = formData.variants.map(formVariant => {
      const attributesArray: VariantAttribute[] = validAttributeTypeNames.map(attrName => ({ name: attrName, value: formVariant.attributes[attrName] || '' }));
      const { tempId, variantNameManuallyEdited, attributes, ...restOfVariant } = formVariant;
      return {
        _id: restOfVariant._id, // Include original _id (will be undefined for new variants)
        name: restOfVariant.name,
        variantImage: restOfVariant.variantImage || undefined,
        publicPrice: String(restOfVariant.publicPrice),
        prixerPrice: String(restOfVariant.prixerPrice),
        attributes: attributesArray,
      };
    });

    let productData: Product | null = null;
    try { productData = await fetchProductDetails(id); } catch { /* ignore error here */ }

    // Prepare payload (Adapted from refactored CreateProduct, includes _id)
    const payload: Partial<Product> = {
      name: formData.name, description: formData.description, category: formData.category,
      productionTime: formData.productionTime || undefined, cost: formData.cost || undefined,
      coordinates: formData.coordinates || undefined, mockUp: formData.mockUp || undefined,
      active: formData.active, autoCertified: formData.autoCertified, bestSeller: formData.bestSeller,
      hasSpecialVar: formData.hasSpecialVar, variants: finalVariants,
      // Sources assumed handled elsewhere
      sources: productData?.sources || { images: [] }, // Preserve existing sources  by backend, or send empty
    };


    try {
      console.log("Updating Product Data:", id, JSON.stringify(payload, null, 2));
      const response = await updateProduct(id, payload);
      if (response) { showSnackBar(`Producto "${formData.name}" actualizado.`); navigate("/admin/products/read"); }
      else { throw new Error("La actualización falló o no devolvió respuesta."); }
    } catch (err: any) {
      console.error("Failed to update product:", err);
      const errorMessage = err?.response?.data?.message || err.message || "Error desconocido al actualizar.";
      setValidationErrors({ product: { name: errorMessage } }); // Show general error
      showSnackBar(errorMessage);
    } finally { setIsSubmitting(false); }
  };

  const handleCancel = () => navigate("/admin/products/read");

  // --- Render ---
  return (
    <>
      <Title title={`Actualizar Producto: ${originalProductName || (id ? 'Cargando...' : 'Inválido')}`} />
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        {isLoading && (<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>)}
        {errorFetch && !isLoading && (<Alert severity="error" sx={{ mb: 2 }}>{errorFetch}
          <Button onClick={loadProduct} size="small" sx={{ ml: 2 }}>Reintentar</Button>
          <Button onClick={handleCancel} size="small" color="secondary">Volver</Button>
        </Alert>)}

        {!isLoading && !errorFetch && formData && (
          <form onSubmit={handleSubmit} noValidate ref={formRef}>
            <Grid2 container spacing={3}>
              {/* --- Product Details (with new fields) --- */}
              <Grid2 size={{ xs: 12 }}><Typography variant="h6">Detalles del Producto</Typography></Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}><TextField label="Nombre del Producto" name="name" value={formData.name} onChange={handleProductInputChange} required fullWidth disabled={isSubmitting} error={!!validationErrors?.product?.name} helperText={validationErrors?.product?.name} /></Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}><TextField label="Categoría" name="category" value={formData.category} onChange={handleProductInputChange} required fullWidth disabled={isSubmitting} error={!!validationErrors?.product?.category} helperText={validationErrors?.product?.category} /></Grid2>
              <Grid2 size={{ xs: 12 }}><TextField label="Descripción" name="description" value={formData.description} onChange={handleProductInputChange} required fullWidth multiline rows={4} disabled={isSubmitting} error={!!validationErrors?.product?.description} helperText={validationErrors?.product?.description} /></Grid2>
              <Grid2 size={{ xs: 12, sm: 4 }}><TextField label="Tiempo de Producción (días)" name="productionTime" type="number" value={formData.productionTime} onChange={handleProductInputChange} fullWidth disabled={isSubmitting} inputProps={{ min: "0" }} error={!!validationErrors?.product?.productionTime} helperText={validationErrors?.product?.productionTime} /></Grid2>
              <Grid2 size={{ xs: 12, sm: 4 }}><TextField label="Costo ($) (Opcional)" name="cost" type="number" value={formData.cost} onChange={handleProductInputChange} fullWidth disabled={isSubmitting} inputProps={{ step: "0.01", min: "0" }} error={!!validationErrors?.product?.cost} helperText={validationErrors?.product?.cost} /></Grid2>
              <Grid2 size={{ xs: 12, sm: 4 }}><TextField label="Mockup URL (Opcional)" name="mockUp" type="url" value={formData.mockUp} onChange={handleProductInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.product?.mockUp} helperText={validationErrors?.product?.mockUp} /></Grid2>
              <Grid2 size={{ xs: 12 }}><TextField label="Coordenadas (Opcional)" name="coordinates" value={formData.coordinates} onChange={handleProductInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.product?.coordinates} helperText={validationErrors?.product?.coordinates} /></Grid2>
              <Grid2 size={{ xs: 12 }}><Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center"><FormControlLabel control={<Checkbox checked={formData.active} onChange={handleProductInputChange} name="active" disabled={isSubmitting} />} label="Activo" /><FormControlLabel control={<Checkbox checked={formData.autoCertified} onChange={handleProductInputChange} name="autoCertified" disabled={isSubmitting} />} label="Auto Certificado" /><FormControlLabel control={<Checkbox checked={formData.bestSeller} onChange={handleProductInputChange} name="bestSeller" disabled={isSubmitting} />} label="Más Vendido" /><FormControlLabel control={<Checkbox checked={formData.hasSpecialVar} onChange={handleProductInputChange} name="hasSpecialVar" disabled={isSubmitting} />} label="Variante Especial" /></Stack></Grid2>

              {/* --- Attribute Type Definition --- */}
              <Grid2 size={{ xs: 12 }}><Divider sx={{ my: 2 }}><Typography variant="overline">Definir Tipos de Atributos</Typography></Divider></Grid2>
              {formData.attributeTypes.map((attrType, index) => (<Grid2 size={{ xs: 12 }} container spacing={1} key={attrType.id} sx={{ mb: 1, pl: 2 }}><Grid2 size={{ xs: 10, sm: 5 }}><TextField label={`Nombre Atributo #${index + 1}`} value={attrType.name} onChange={(e) => handleAttributeTypeNameChange(attrType.id, e.target.value)} required fullWidth size="small" disabled={isSubmitting} error={!!validationErrors?.attributeTypes?.[index]?.name} helperText={validationErrors?.attributeTypes?.[index]?.name} /></Grid2><Grid2 size={{ xs: 2, sm: 1 }} sx={{ display: 'flex', alignItems: 'center' }}><IconButton size="small" onClick={() => handleRemoveAttributeType(attrType.id)} disabled={isSubmitting || (formData.attributeTypes.length <= 1 && formData.variants.length > 0)} sx={{ color: (formData.attributeTypes.length <= 1 && formData.variants.length > 0) ? 'grey.400' : 'error.main' }}><Tooltip title="Eliminar Tipo Atributo"><DeleteIcon fontSize="inherit" /></Tooltip></IconButton></Grid2></Grid2>))}
              <Grid2 size={{ xs: 12 }}><Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={handleAddAttributeType} disabled={isSubmitting}>Añadir Tipo de Atributo</Button></Grid2>

              {/* --- Variants Section (Accordion UI) --- */}
              <Grid2 size={{ xs: 12 }}><Divider sx={{ my: 2 }}><Typography variant="overline">Variantes del Producto</Typography></Divider></Grid2>
              {formData.variants.map((variant, vIndex) => {
                const variantErrors = validationErrors?.variants?.[variant.tempId];
                const isErrorExpanded = errorVariantId === variant.tempId;
                return (
                  <Grid2 size={{ xs: 12 }} key={variant.tempId}>
                    <Accordion sx={{ border: 1, borderColor: variantErrors ? 'error.main' : 'divider', '&:before': { display: 'none' } }} TransitionProps={{ unmountOnExit: true }} defaultExpanded={isErrorExpanded}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`variant-${variant.tempId}-content`} id={`variant-${variant.tempId}-header`} sx={{ '& .MuiAccordionSummary-content': { justifyContent: 'space-between', alignItems: 'center' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>{variant.name || `Variante #${vIndex + 1}`}</Typography>
                          <Chip label={`$${variant.publicPrice || '?.??'}`} size="small" variant="outlined" />
                          {variant._id && <Chip label="Existente" size="small" color="info" variant="outlined" sx={{ ml: 1 }} />}
                        </Box>
                        <Box>
                          <Tooltip title="Duplicar Variante"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleCopyVariant(variant.tempId); }} disabled={isSubmitting} sx={{ mr: 1 }}><ContentCopyIcon fontSize='inherit' /></IconButton></Tooltip>
                          <Tooltip title="Eliminar Variante"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRemoveVariant(variant.tempId); }} disabled={isSubmitting} sx={{ color: 'error.main' }}><DeleteIcon fontSize='inherit' /></IconButton></Tooltip>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid2 container spacing={2}>
                          <Grid2 size={{ xs: 12, sm: 6, md: 8 }}><TextField label="Nombre Variante" value={variant.name} onChange={(e) => handleVariantInputChange(variant.tempId, 'name', e.target.value)} required fullWidth size="small" disabled={isSubmitting} error={!!variantErrors?.name} helperText={variantErrors?.name || (variant.variantNameManuallyEdited ? "Nombre editado manualmente" : "Nombre generado automáticamente")} /></Grid2>
                          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}><TextField label="Precio Público ($)" name="publicPrice" type="number" value={variant.publicPrice} onChange={(e) => handleVariantInputChange(variant.tempId, 'publicPrice', e.target.value)} required fullWidth size="small" disabled={isSubmitting} inputProps={{ step: "0.01", min: "0" }} error={!!variantErrors?.publicPrice} helperText={variantErrors?.publicPrice} /></Grid2>
                          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}><TextField label="Precio Prixer ($)" name="prixerPrice" type="number" value={variant.prixerPrice} onChange={(e) => handleVariantInputChange(variant.tempId, 'prixerPrice', e.target.value)} required fullWidth size="small" disabled={isSubmitting} inputProps={{ step: "0.01", min: "0" }} error={!!variantErrors?.prixerPrice} helperText={variantErrors?.prixerPrice} /></Grid2>
                          <Grid2 size={{ xs: 12 }}><TextField label="URL Imagen Variante (Opcional)" type="url" value={variant.variantImage} onChange={(e) => handleVariantInputChange(variant.tempId, 'variantImage', e.target.value)} fullWidth size="small" disabled={isSubmitting} error={!!variantErrors?.variantImage} helperText={variantErrors?.variantImage} /></Grid2>

                          <Grid2 size={{ xs: 12 }}><Typography variant="body2" sx={{ mt: 1, mb: 0.5, fontWeight: 'medium' }}>Valores de Atributos:</Typography></Grid2>
                          {formData.attributeTypes.filter(at => at.name.trim()).map((attrType) => (<Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={attrType.id}><TextField label={attrType.name} value={variant.attributes[attrType.name] || ''} onChange={(e) => handleVariantAttributeValueChange(variant.tempId, attrType.name, e.target.value)} required fullWidth size="small" disabled={isSubmitting} error={!!variantErrors?.attributeValues && !(variant.attributes[attrType.name]?.trim())} helperText={(!!variantErrors?.attributeValues && !(variant.attributes[attrType.name]?.trim())) ? "Valor requerido" : ""} /></Grid2>))}
                          {variantErrors?.attributeValues && <Grid2 size={{ xs: 12 }}><FormHelperText error>{variantErrors.attributeValues}</FormHelperText></Grid2>}
                        </Grid2>
                      </AccordionDetails>
                    </Accordion>
                  </Grid2>
                );
              })}
              <Grid2 size={{ xs: 12 }}>
                <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddVariant} disabled={isSubmitting || formData.attributeTypes.filter(at => at.name.trim()).length === 0}>Añadir Nueva Variante</Button>
                {formData.attributeTypes.filter(at => at.name.trim()).length === 0 && <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>Defina tipos de atributos primero.</Typography>}
              </Grid2>
              {/* --- End Variants Section --- */}

              {/* --- General Error Display & Actions --- */}
              {validationErrors?.product?.name && !formData.name.trim() ? null : validationErrors?.product?.name && <Grid2 size={{ xs: 12 }}><Alert severity="error" sx={{ mt: 2 }}>Error: {validationErrors.product.name}</Alert></Grid2>}
              <Grid2 size={{ xs: 12 }}>
                <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                  <Button type="button" variant="outlined" color="secondary" onClick={handleCancel} disabled={isSubmitting}>Cancelar</Button>
                  <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || isLoading} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>{isSubmitting ? "Guardando..." : "Guardar Cambios"}</Button>
                </Stack>
              </Grid2>
            </Grid2>
          </form>
        )}
      </Paper >
    </>
  );
};

export default UpdateProduct;