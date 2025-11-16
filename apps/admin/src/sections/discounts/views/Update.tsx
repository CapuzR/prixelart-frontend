import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// Hooks, Types, Context, API
import { useSnackBar } from "@prixpon/context/GlobalContext";
import {
  AdjustmentMethod,
  ApplicableEntity,
  Discount,
  Entity,
} from "@prixpon/types/discount.types";
import { Product, Variant } from "@prixpon/types/product.types"; // Added Variant
import { fetchProducts } from "@prixpon/api/product.api";
import { fetchDiscountById, updateDiscount } from "@prixpon/api/discount.api";
import Grid2 from "@mui/material/Grid";
// MUI Components
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Autocomplete,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails, // Added Accordion components
  Avatar, // Added Avatar for images
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // Icon for Accordion
import WarningAmberIcon from "@mui/icons-material/WarningAmber"; // Icon for Error Summary
import Title from "@apps/admin/components/Title";

// Date Picker Components & Dayjs
import { DatePicker } from "@mui/lab";
import dayjs, { Dayjs } from "dayjs";
import {
  ADJUSTMENT_METHOD_OPTIONS,
  calculateDiscountedPrice,
  ENTITY_TYPE_OPTIONS,
  formatPrice,
  getProductImageUrl,
  ProductOrVariantOption,
} from "@apps/admin/utils/discountSurchargeUtils";

// --- Constants and Types (Synced with CreateDiscount) ---

interface OverrideFormState extends ApplicableEntity {
  tempId: string;
}

type SingleOverrideErrors = NonNullable<
  DiscountValidationErrors["entityOverrides"]
>[number];

// Updated initial state structure matching CreateDiscount
const initialFormState: Omit<Discount, "_id" | "applicableProducts"> & {
  entityOverrides: OverrideFormState[];
  applicableProducts: [string, string?][];
} = {
  name: "",
  description: "",
  active: true,
  adjustmentMethod: "percentage",
  defaultValue: 0,
  applicableProducts: [],
  applicableArts: [],
  appliesToAllProducts: false,
  appliestoAllArts: false,
  dateRange: undefined,
  entityOverrides: [],
};

interface DiscountValidationErrors {
  name?: string;
  description?: string;
  adjustmentMethod?: string;
  defaultValue?: string;
  applicableProducts?: string;
  priceValidation?: string;
  dateRange?: string;
  startDate?: string;
  endDate?: string;
  entityOverrides?: {
    [index: number]: {
      type?: string;
      id?: string;
      adjustmentMethod?: string;
      customValue?: string;
    };
  };
  summary?: string;
}

// --- Component ---
const UpdateDiscount: React.FC = () => {
  // --- Hooks ---
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [formData, setFormData] = useState(initialFormState);
  const [originalDiscount, setOriginalDiscount] = useState<Discount | null>(
    null,
  );
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true); // For initial discount fetch
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] =
    useState<DiscountValidationErrors | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all fetched products
  const [selectedProductVariants, setSelectedProductVariants] = useState<
    ProductOrVariantOption[]
  >([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  // State for Accordion expansion
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    "applicability",
  ); // Default open

  // --- UPDATED: productVariantOptions includes image URLs (Copied from CreateDiscount) ---
  const productVariantOptions = useMemo((): ProductOrVariantOption[] => {
    const options: ProductOrVariantOption[] = [];
    allProducts.forEach((product) => {
      if (!product._id || !product.variants || product.variants.length === 0)
        return;
      const productIdStr = product._id!.toString();
      const productImageUrl = getProductImageUrl(product);

      // Calculate Price Ranges for "Todo el producto"
      let minPublic = Infinity,
        maxPublic = -Infinity,
        minPrixer = Infinity,
        maxPrixer = -Infinity;
      let validPricesFound = false;
      product.variants.forEach((variant) => {
        /* ... price calculation logic ... */
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
      let priceRangeStr = "(Precios N/A)";
      if (validPricesFound) {
        /* ... formatRange logic ... */
        const formatRange = (
          min: number,
          max: number,
          prefix: string,
        ): string => {
          if (min === Infinity || max === -Infinity)
            return `${prefix}: USD N/A`;
          if (min === max) return `${prefix}: USD ${min.toFixed(2)}`;
          return `${prefix}: USD ${min.toFixed(2)} - USD ${max.toFixed(2)}`;
        };
        priceRangeStr = `(${formatRange(minPublic, maxPublic, "Precio Normal")}, ${formatRange(minPrixer, maxPrixer, "PVM")})`;
      }

      // Add option for the whole product
      options.push({
        id: productIdStr,
        label: `${product.name} (Todo el producto) ${priceRangeStr}`,
        isProduct: true,
        productId: productIdStr,
        productName: product.name,
        imageUrl: productImageUrl,
      });

      // Add options for individual variants
      product.variants.forEach((variant) => {
        /* ... add variant option with price in label ... */
        if (!variant._id) return;
        const variantImageUrl = getProductImageUrl(product, variant);
        const variantPriceStr = `(Precio Normal: ${formatPrice(variant.publicPrice)}, PVM: ${formatPrice(variant.prixerPrice)})`;
        options.push({
          id: `${productIdStr}_${variant._id}`,
          label: `    ↳ ${variant.name || "Variante sin nombre"} ${variantPriceStr}`,
          isProduct: false,
          productId: productIdStr,
          productName: product.name,
          variantId: variant._id,
          variantName: variant.name,
          imageUrl: variantImageUrl,
        });
      });
    });
    return options;
  }, [allProducts]);

  useEffect(() => {
    const loadInitialData = async () => {
      if (!id) {
        setErrorFetch("ID de descuento inválido.");
        setIsLoadingData(false);
        setIsLoadingProducts(false);
        showSnackBar("ID de descuento inválido.");
        navigate("/admin/discount/read");
        return;
      }
      setIsLoadingData(true);
      setIsLoadingProducts(true);
      setErrorFetch(null);
      setValidationErrors(null);

      try {
        // Fetch discount and products concurrently
        const [discountData, productsData] = await Promise.all([
          fetchDiscountById(id),
          fetchProducts(), // Fetch all products
          // Removed Arts fetch
        ]);

        if (!discountData) throw new Error("Descuento no encontrado.");
        setOriginalDiscount(discountData); // Store original discount data

        const validProducts = productsData.filter(
          (p) => p._id && p.variants && p.variants.length > 0,
        );
        setAllProducts(validProducts); // Set products state -> triggers productVariantOptions calculation

        // Populate base form data (excluding applicableProducts/selectedProductVariants initially)
        setFormData({
          name: discountData.name || "",
          description: discountData.description || "",
          active: discountData.active ?? true,
          adjustmentMethod: discountData.adjustmentMethod || "percentage",
          defaultValue: discountData.defaultValue ?? 0,
          appliesToAllProducts:
            discountData.appliesToAllProducts ??
            (discountData.applicableProducts || []).length === 0,
          appliestoAllArts: discountData.appliestoAllArts,
          applicableProducts: [],
          applicableArts: discountData.applicableArts,
          dateRange: discountData.dateRange,
          entityOverrides: (discountData.entityOverrides || []).map((ov) => ({
            ...ov,
            tempId: uuidv4(),
          })),
        });

        // Set initial date picker state
        setStartDate(
          discountData.dateRange?.start
            ? dayjs(discountData.dateRange.start)
            : null,
        );
        setEndDate(
          discountData.dateRange?.end
            ? dayjs(discountData.dateRange.end)
            : null,
        );
      } catch (err: any) {
        console.error("Failed to load initial data:", err);
        setErrorFetch(err.message || "Error al cargar los datos.");
        showSnackBar(err.message || "Error al cargar los datos.");
      } finally {
        setIsLoadingData(false); // Discount data loaded (or failed)
        setIsLoadingProducts(false); // Products loaded (or failed)
      }
    };
    loadInitialData();
  }, [id, navigate, showSnackBar]);

  useEffect(() => {
    // Run only after BOTH discount and products are loaded AND productVariantOptions has been calculated
    if (
      !isLoadingData &&
      !isLoadingProducts &&
      originalDiscount &&
      allProducts.length > 0 &&
      productVariantOptions.length > 0
    ) {
      const initialApplicableVariants = new Set<string>(); // Use set for "productId_variantId"

      if (
        !originalDiscount.appliesToAllProducts &&
        originalDiscount.applicableProducts
      ) {
        originalDiscount.applicableProducts.forEach((savedProdRef) => {
          let productId: string | undefined;
          let variantId: string | undefined;

          // Normalize saved reference (handle [prodId], [prodId, varId], or potentially just prodId string)
          if (Array.isArray(savedProdRef) && savedProdRef.length === 2) {
            productId = savedProdRef[0];
            variantId = savedProdRef[1];
          } else if (Array.isArray(savedProdRef) && savedProdRef.length === 1) {
            productId = savedProdRef[0];
            // Need to expand this product ID to all its variants
          } else if (typeof savedProdRef === "string") {
            productId = savedProdRef; // Assume legacy product ID string
            // Need to expand
          }

          if (productId && variantId) {
            // Specific variant reference
            initialApplicableVariants.add(`${productId}_${variantId}`);
          } else if (productId) {
            // Whole product reference - find product and add all variants
            const product = allProducts.find(
              (p) => p._id!.toString() === productId,
            );
            if (product && product.variants) {
              product.variants.forEach((v) => {
                if (v._id) {
                  initialApplicableVariants.add(`${productId}_${v._id}`);
                }
              });
            }
          }
        });
      }

      // Convert Set back to the required array format for formData
      const finalInitialApplicableProducts: [string, string][] = Array.from(
        initialApplicableVariants,
      ).map((idPair) => {
        const [prodId, varId] = idPair.split("_");
        return [prodId, varId];
      });

      // Find the corresponding ProductOrVariantOption objects for the Autocomplete UI
      const preselectedOptions = productVariantOptions.filter(
        (opt) => !opt.isProduct && initialApplicableVariants.has(opt.id), // Match based on the composite "productId_variantId"
      );

      // Update state
      setFormData((prev) => ({
        ...prev,
        applicableProducts: finalInitialApplicableProducts,
      }));
      setSelectedProductVariants(preselectedOptions);
      // Optionally set initial accordion expansion if there are specific selections
      if (
        finalInitialApplicableProducts.length > 0 ||
        (originalDiscount?.entityOverrides?.length ?? 0 > 0) ||
        originalDiscount?.dateRange
      ) {
        setExpandedAccordion(false); // Collapse default initially if specific stuff exists
      } else {
        setExpandedAccordion("applicability"); // Keep default open otherwise
      }
    }
  }, [
    isLoadingData,
    isLoadingProducts,
    originalDiscount,
    allProducts,
    productVariantOptions,
  ]); // Dependencies

  // --- Handlers (Copied/Adapted from refactored CreateDiscount) ---
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
    const fieldVal = type === "checkbox" ? checked : value;
    setFormData((prevData) => ({ ...prevData, [name]: fieldVal }));
    // Clear validation
    if (
      validationErrors &&
      validationErrors[name as keyof DiscountValidationErrors]
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null;
        const updated = { ...prevErrors };
        delete updated[name as keyof DiscountValidationErrors];
        if (name === "defaultValue" || name === "adjustmentMethod") {
          delete updated.priceValidation;
        }
        return Object.keys(updated).length > 0 ? updated : null;
      });
    }
  };
  const handleSelectChange = (
    event: ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const name = event.target.name as keyof typeof formData;
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [name]: value as AdjustmentMethod | Entity,
    }));
    // Clear validation
    if (
      validationErrors &&
      validationErrors[name as keyof DiscountValidationErrors]
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null;
        const updated = { ...prevErrors };
        delete updated[name as keyof DiscountValidationErrors];
        if (name === "defaultValue" || name === "adjustmentMethod") {
          delete updated.priceValidation;
        }
        return Object.keys(updated).length > 0 ? updated : null;
      });
    }
  };
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: checked };
      if (name === "appliesToAllProducts" && checked) {
        newState.applicableProducts = [];
        setSelectedProductVariants([]);
      }
      // Removed Arts logic
      return newState;
    });
    // Clear validation
    if (
      name === "appliesToAllProducts" &&
      (validationErrors?.applicableProducts ||
        validationErrors?.priceValidation)
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null;
        const updated = { ...prevErrors };
        delete updated.applicableProducts;
        if (checked) delete updated.priceValidation;
        return Object.keys(updated).length > 0 ? updated : null;
      });
    }
  };

  // --- UPDATED Handlers use new option types ---
  const handleProductVariantChange = (
    event: SyntheticEvent,
    newValue: ProductOrVariantOption[],
  ) => {
    setSelectedProductVariants(newValue); // Update visual selection

    const finalApplicableVariants = new Set<string>(); // Use set for unique "productId_variantId"

    newValue.forEach((option) => {
      if (option.isProduct) {
        // Expand whole product selection
        const product = allProducts.find(
          (p) => p._id!.toString() === option.productId,
        );
        if (product?.variants) {
          product.variants.forEach((variant) => {
            if (variant._id)
              finalApplicableVariants.add(`${product._id}_${variant._id}`);
          });
        }
      } else if (option.variantId) {
        // Add specific variant
        finalApplicableVariants.add(`${option.productId}_${option.variantId}`);
      }
    });

    // Convert Set back to array format for formData
    const newApplicableProducts: [string, string][] = Array.from(
      finalApplicableVariants,
    ).map((idPair) => {
      const [prodId, varId] = idPair.split("_");
      return [prodId, varId];
    });

    setFormData((prev) => ({
      ...prev,
      applicableProducts: newApplicableProducts,
    }));

    // Clear validation
    if (
      validationErrors?.applicableProducts ||
      validationErrors?.priceValidation
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null;
        const updated = { ...prevErrors };
        delete updated.applicableProducts;
        delete updated.priceValidation;
        return Object.keys(updated).length > 0 ? updated : null;
      });
    }
  };

  const handleStartDateChange = (newValue: Dayjs | null) => {
    /* ... clear date validation ... */
  };
  const handleEndDateChange = (newValue: Dayjs | null) => {
    /* ... clear date validation ... */
  };
  const handleAddOverride = () => {
    /* ... add override, clear override validation ... */
  };
  const handleOverrideChange = (
    tempId: string,
    field: keyof ApplicableEntity,
    value: string | number | Entity | AdjustmentMethod,
  ) => {
    /* ... update override, clear specific + price validation ... */
  };
  const handleRemoveOverride = (tempIdToRemove: string) => {
    /* ... remove override, clear price validation ... */
  };
  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      /* ... set accordion state ... */
    };

  // --- Validation (Copied/Adapted from refactored CreateDiscount) ---
  const validateForm = (): boolean => {
    const errors: DiscountValidationErrors = {};
    const errorMessages: string[] = [];

    // Basic field checks (Name, Description, Default Value/Method)
    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio.";
      errorMessages.push("Nombre");
    }
    if (!formData.description.trim()) {
      errors.description = "La descripción es obligatoria.";
      errorMessages.push("Descripción");
    }
    const defaultValueNum = Number(formData.defaultValue);
    if (isNaN(defaultValueNum)) {
      errors.defaultValue = "El valor base debe ser un número.";
      errorMessages.push("Valor Base");
    } else if (
      formData.adjustmentMethod === "percentage" &&
      (defaultValueNum < 0 || defaultValueNum > 1)
    ) {
      errors.defaultValue = "Para porcentaje, el valor debe estar entre 0 y 1.";
      errorMessages.push("Valor Base (Porcentaje)");
    } else if (
      formData.adjustmentMethod === "absolute" &&
      defaultValueNum < 0
    ) {
      errors.defaultValue =
        "Para monto absoluto, el valor no puede ser negativo.";
      errorMessages.push("Valor Base (Absoluto)");
    }

    // Product selection check
    if (
      !formData.appliesToAllProducts &&
      formData.applicableProducts.length === 0
    ) {
      errors.applicableProducts =
        "Seleccione productos/variantes o marque 'Aplica a todos'.";
      errorMessages.push("Productos/Variantes");
    }
    // REMOVED Arts selection check

    // Date range check
    /* ... same check as refactored CreateDiscount ... */
    if (startDate && endDate && !startDate.isBefore(endDate)) {
      errors.dateRange =
        "La fecha de inicio debe ser anterior a la fecha de fin.";
      errors.startDate = " ";
      errors.endDate = " ";
      errorMessages.push("Rango de Fechas");
    } else if ((startDate && !endDate) || (!startDate && endDate)) {
      errors.dateRange = "Especifique ambas fechas del rango o ninguna.";
      if (startDate && !endDate) errors.endDate = " ";
      if (!startDate && endDate) errors.startDate = " ";
      errorMessages.push("Rango de Fechas (Incompleto)");
    }

    // --- Price Validation Logic ---
    if (
      !formData.appliesToAllProducts &&
      formData.applicableProducts.length > 0 &&
      !errors.defaultValue
    ) {
      const invalidVariants: string[] = [];
      const variantMap = new Map<string, Variant>();
      allProducts.forEach((p) => {
        if (p._id && p.variants)
          p.variants.forEach((v) => {
            if (v._id) variantMap.set(`${p._id}_${v._id}`, v);
          });
      });

      for (const [productId, variantId] of formData.applicableProducts) {
        const variant = variantMap.get(`${productId}_${variantId}`);
        if (!variant) continue;
        const discountedPublic = calculateDiscountedPrice(
          variant.publicPrice,
          formData.adjustmentMethod,
          defaultValueNum,
        );
        const discountedPrixer = calculateDiscountedPrice(
          variant.prixerPrice,
          formData.adjustmentMethod,
          defaultValueNum,
        );
        if (
          (discountedPublic !== null && discountedPublic <= 0) ||
          (discountedPrixer !== null && discountedPrixer <= 0)
        ) {
          const productName =
            allProducts.find((p) => p._id!.toString() === productId)?.name ||
            "Producto";
          const cleanLabel = `${productName} - ${variant.name || "Variante"}`; // Simpler label for error
          invalidVariants.push(cleanLabel);
        }
      }
      if (invalidVariants.length > 0) {
        errors.priceValidation = `El descuento base resulta en precio ≤ 0 para: ${invalidVariants.slice(0, 2).join(", ")}${invalidVariants.length > 2 ? "..." : ""}.`;
        errorMessages.push("Precios Inválidos");
        errors.applicableProducts = " "; // Mark selector visually
      }
    }
    // --- End Price Validation ---

    // Entity Override Validation
    /* ... same checks as refactored CreateDiscount ... */
    const overrideErrors: DiscountValidationErrors["entityOverrides"] = {};
    let hasOverrideError = false;
    formData.entityOverrides.forEach((ov, index) => {
      const currentErrors: SingleOverrideErrors = {};
      let overrideErrorFields: string[] = [];
      if (!ov.type) {
        currentErrors.type = "Requerido";
        overrideErrorFields.push("Tipo Entidad");
      }
      if (!ov.adjustmentMethod) {
        currentErrors.adjustmentMethod = "Requerido";
        overrideErrorFields.push("Método Excep.");
      }
      const customValueNum = Number(ov.customValue);
      if (
        ov.customValue === undefined ||
        ov.customValue === null ||
        isNaN(customValueNum)
      ) {
        currentErrors.customValue = "Valor numérico requerido.";
        overrideErrorFields.push("Valor Excepción");
      } else if (
        ov.adjustmentMethod === "percentage" &&
        (customValueNum < 0 || customValueNum > 1)
      ) {
        currentErrors.customValue = "Valor entre 0 y 1.";
        overrideErrorFields.push("Valor Excepción (%)");
      } else if (ov.adjustmentMethod === "absolute" && customValueNum < 0) {
        currentErrors.customValue = "Valor no negativo.";
        overrideErrorFields.push("Valor Excepción ($)");
      }
      if (Object.keys(currentErrors).length > 0) {
        overrideErrors[index] = currentErrors;
        if (!hasOverrideError) errorMessages.push(`Excepción(es)`);
        hasOverrideError = true;
      }
    });
    if (hasOverrideError) errors.entityOverrides = overrideErrors;

    // Set final errors and summary
    if (errorMessages.length > 0) {
      const mainErrorFocus = errors.priceValidation
        ? errors.priceValidation
        : `Por favor, corrija los errores marcados (${errorMessages.join(", ")}).`;
      errors.summary = mainErrorFocus;
    }
    setValidationErrors(Object.keys(errors).length > 0 ? errors : null);
    if (Object.keys(errors).length > 0 && !errors.summary) {
      errors.summary = `Por favor, corrija los errores marcados.`;
      setValidationErrors(errors);
    }
    if (Object.keys(errors).length > 0 && errors.summary) {
      if (!errors.priceValidation || Object.keys(errors).length > 1)
        showSnackBar("Por favor, corrija los errores indicados.");
    }

    return Object.keys(errors).length === 0;
  };
  // --- Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !validateForm()) return;
    setIsSubmitting(true);

    // Final overrides preparation (same as CreateDiscount)
    const finalOverrides: ApplicableEntity[] = formData.entityOverrides.map(
      (override: OverrideFormState) => {
        const { tempId, ...rest } = override;
        const overrideData: ApplicableEntity = {
          type: rest.type,
          adjustmentMethod: rest.adjustmentMethod,
          id: rest.id?.trim() || undefined,
          name: rest.name?.trim() || undefined,
          customValue:
            rest.customValue !== undefined &&
            rest.customValue !== null &&
            !isNaN(Number(rest.customValue))
              ? Number(rest.customValue)
              : undefined,
        };
        Object.keys(overrideData).forEach((key) => {
          if (overrideData[key as keyof ApplicableEntity] === undefined) {
            delete overrideData[key as keyof ApplicableEntity];
          }
        });
        return overrideData;
      },
    );

    // Payload construction (REMOVED Arts, applicableProducts uses formData)
    const payload: Omit<Discount, "_id"> = {
      name: formData.name,
      description: formData.description,
      active: formData.active,
      adjustmentMethod: formData.adjustmentMethod,
      defaultValue: Number(formData.defaultValue),
      appliesToAllProducts: formData.appliesToAllProducts,
      applicableProducts: formData.appliesToAllProducts
        ? []
        : formData.applicableProducts, // Use current formData
      appliestoAllArts: formData.appliestoAllArts,
      applicableArts: formData.applicableArts,
      dateRange:
        startDate && endDate
          ? { start: startDate.toDate(), end: endDate.toDate() }
          : undefined,
      entityOverrides: finalOverrides,
    };

    try {
      console.log("Updating Discount Data:", id, payload);
      const response = await updateDiscount(id, payload as Discount); // Cast needed? Check API expected type
      if (response) {
        showSnackBar(`Descuento "${formData.name}" actualizado.`);
        navigate("/admin/discount/read");
      } else {
        throw new Error(
          "La actualización del descuento falló (respuesta vacía).",
        );
      }
    } catch (err: any) {
      console.error("Failed to update discount:", err);
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Error al actualizar el descuento.";
      setValidationErrors((prev) => ({
        ...(prev || {}),
        summary: `Error del servidor: ${message}`,
      }));
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/admin/discount/read");

  const isLoading = isLoadingData || isLoadingProducts;
  // --- Render ---
  return (
    <>
      <Title
        title={`Actualizar Descuento: ${originalDiscount?.name || (id ? "Cargando..." : "Inválido")}`}
      />
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 2 }}>
        {isLoading && !errorFetch && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        )}
        {errorFetch && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <>
                <Button onClick={handleCancel} size="small" color="inherit">
                  Volver
                </Button>
              </>
            }
          >
            {errorFetch}
          </Alert>
        )}
        {!isLoading &&
          !errorFetch &&
          originalDiscount && ( // Render form only when data is ready
            <form onSubmit={handleSubmit} noValidate>
              {/* Error Summary Alert */}
              {validationErrors?.summary && (
                <Alert
                  severity={
                    validationErrors.priceValidation &&
                    Object.keys(validationErrors).length === 1
                      ? "warning"
                      : "error"
                  }
                  icon={<WarningAmberIcon fontSize="inherit" />}
                  sx={{ mb: 3 }}
                >
                  {validationErrors.summary}
                </Alert>
              )}

              <Grid2 container spacing={3}>
                {/* Basic Info & Default Adjustment Fields (Rendered as before) */}
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Nombre del Descuento"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    disabled={isSubmitting}
                    error={!!validationErrors?.name}
                    helperText={validationErrors?.name}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.active}
                        onChange={handleCheckboxChange}
                        name="active"
                        disabled={isSubmitting}
                      />
                    }
                    label="Activo"
                  />
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                  <TextField
                    label="Descripción"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    fullWidth
                    multiline
                    rows={3}
                    disabled={isSubmitting}
                    error={!!validationErrors?.description}
                    helperText={validationErrors?.description}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }} />
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  {/* Adjustment Method Select */}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  {/* Default Value TextField */}
                </Grid2>

                {/* Accordion Sections */}
                <Grid2 size={{ xs: 12 }}>
                  {/* Applicability Accordion */}
                  <Accordion /* ... props ... */>
                    <AccordionSummary /* ... props ... */>
                      <Typography variant="h6">Aplicabilidad Base</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid2 container spacing={2}>
                        {/* Products/Variants Applicability */}
                        <Grid2 size={{ xs: 12 }}>
                          <Box
                            sx={{
                              border: 1,
                              borderColor: (theme) =>
                                validationErrors?.applicableProducts ||
                                validationErrors?.priceValidation
                                  ? theme.palette.error.main
                                  : "divider",
                              borderRadius: 1,
                              p: 2,
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={formData.appliesToAllProducts}
                                  onChange={handleCheckboxChange}
                                  name="appliesToAllProducts"
                                  disabled={isSubmitting}
                                />
                              }
                              label="Aplica a Todos los Productos/Variantes"
                            />
                            {!formData.appliesToAllProducts && (
                              <Autocomplete
                                multiple
                                sx={{ mt: 1 }}
                                id="applicable-products-variants-select"
                                options={productVariantOptions}
                                value={selectedProductVariants} // UI state for selected options
                                onChange={handleProductVariantChange}
                                getOptionLabel={(option) => option.label.trim()} // Uses label with price
                                isOptionEqualToValue={(option, value) =>
                                  option.id === value.id
                                }
                                groupBy={(option) => option.productName}
                                // Show loading indicator only if products are still loading *and* options aren't ready
                                loading={
                                  isLoadingProducts &&
                                  productVariantOptions.length === 0
                                }
                                disabled={isSubmitting || isLoading} // Disable while loading initial data too
                                disableCloseOnSelect
                                renderOption={(props, option, { selected }) => (
                                  <Box
                                    component="li"
                                    sx={{
                                      "& > img": { mr: 2, flexShrink: 0 },
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                    {...props}
                                  >
                                    <Avatar
                                      src={option.imageUrl}
                                      variant="rounded"
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        mr: 1.5,
                                        bgcolor: "grey.200",
                                      }}
                                    >
                                      {option.isProduct ? "P" : "V"}
                                    </Avatar>
                                    <Typography
                                      variant="body2"
                                      component="span"
                                      sx={{
                                        flexGrow: 1,
                                        marginLeft: option.isProduct
                                          ? 0
                                          : "15px",
                                      }}
                                    >
                                      {option.label.trim()}
                                    </Typography>
                                  </Box>
                                )}
                                renderTags={(value, getTagProps) =>
                                  value.map((option, index) => (
                                    <Chip
                                      avatar={
                                        <Avatar
                                          src={option.imageUrl}
                                          sx={{ width: 20, height: 20 }}
                                        >
                                          {option.isProduct ? "P" : "V"}
                                        </Avatar>
                                      }
                                      variant="outlined"
                                      // Use the full label for the chip as well
                                      label={option.label.trim()}
                                      size="small"
                                      {...getTagProps({ index })}
                                      // Add sx for potential overflow
                                      sx={{
                                        maxWidth: "95%", // Prevent excessive width
                                        ".MuiChip-label": {
                                          // Target the label part
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                          display: "inline-block", // Needed for ellipsis
                                        },
                                      }}
                                    />
                                  ))
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Productos o Variantes Específicos"
                                    placeholder={
                                      isLoadingProducts
                                        ? "Cargando Productos..."
                                        : "Seleccionar..."
                                    }
                                    error={
                                      !!validationErrors?.applicableProducts ||
                                      !!validationErrors?.priceValidation
                                    }
                                    helperText={
                                      validationErrors?.applicableProducts &&
                                      validationErrors.applicableProducts !==
                                        " "
                                        ? validationErrors.applicableProducts
                                        : validationErrors?.priceValidation
                                          ? "Ajuste resulta en precios inválidos para seleccíon."
                                          : null
                                    }
                                  />
                                )}
                              />
                            )}
                          </Box>
                        </Grid2>
                        {/* REMOVED Arts Applicability Section */}
                      </Grid2>
                    </AccordionDetails>
                  </Accordion>

                  {/* Date Range Accordion */}
                  <Accordion
                    expanded={expandedAccordion === "dateRange"}
                    onChange={handleAccordionChange("dateRange")}
                    sx={{ "&.Mui-expanded": { margin: "16px 0" } }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="dateRange-content"
                      id="dateRange-header"
                    >
                      <Typography variant="h6" component="div">
                        Rango de Fechas (Opcional)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <DatePicker
                            label="Fecha de Inicio" // Added label
                            value={startDate}
                            onChange={handleStartDateChange}
                            disabled={isSubmitting}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error:
                                  !!validationErrors?.startDate ||
                                  !!validationErrors?.dateRange,
                                helperText:
                                  validationErrors?.startDate ||
                                  validationErrors?.dateRange,
                              },
                            }}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <DatePicker
                            label="Fecha de Fin" // Added label
                            value={endDate}
                            onChange={handleEndDateChange}
                            disabled={isSubmitting}
                            minDate={startDate || undefined}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error:
                                  !!validationErrors?.endDate ||
                                  !!validationErrors?.dateRange,
                                helperText:
                                  validationErrors?.endDate ||
                                  validationErrors?.dateRange,
                              },
                            }}
                          />
                        </Grid2>
                      </Grid2>
                    </AccordionDetails>
                  </Accordion>

                  {/* Entity Overrides Accordion */}
                  <Accordion
                    expanded={expandedAccordion === "overrides"}
                    onChange={handleAccordionChange("overrides")}
                    sx={{ "&.Mui-expanded": { margin: "16px 0" } }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="overrides-content"
                      id="overrides-header"
                    >
                      <Typography variant="h6" component="div">
                        Excepciones Específicas (Opcional)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {formData.entityOverrides.length === 0 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          No se han añadido excepciones.
                        </Typography>
                      )}
                      {formData.entityOverrides.map(
                        (override: OverrideFormState, index) => {
                          const overrideErrors =
                            validationErrors?.entityOverrides?.[index] || {};
                          return (
                            // Wrap each override in outlined Box (copied from CreateDiscount)
                            <Box
                              key={override.tempId}
                              sx={{
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 1,
                                p: 2,
                                mb: 2,
                                position: "relative",
                              }}
                            >
                              <Tooltip title="Eliminar Excepción">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleRemoveOverride(override.tempId)
                                  }
                                  disabled={isSubmitting}
                                  sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                  }}
                                  aria-label="Eliminar Excepción"
                                >
                                  <DeleteIcon color="error" />
                                </IconButton>
                              </Tooltip>
                              <Grid2 container spacing={2}>
                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                  <FormControl
                                    fullWidth
                                    required
                                    error={!!overrideErrors.type}
                                  >
                                    <InputLabel
                                      id={`override-type-label-${index}`}
                                    >
                                      Tipo Entidad
                                    </InputLabel>
                                    <Select
                                      labelId={`override-type-label-${index}`}
                                      label="Tipo Entidad" // Added label prop
                                      name="type"
                                      value={override.type}
                                      onChange={(e) =>
                                        handleOverrideChange(
                                          override.tempId,
                                          "type",
                                          e.target.value as Entity,
                                        )
                                      }
                                      disabled={isSubmitting}
                                    >
                                      {ENTITY_TYPE_OPTIONS.map((opt) => (
                                        <MenuItem
                                          key={opt.value}
                                          value={opt.value}
                                        >
                                          {opt.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                    <FormHelperText>
                                      {overrideErrors.type}
                                    </FormHelperText>
                                  </FormControl>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                  <TextField
                                    label="ID Entidad (Opcional)"
                                    name="id"
                                    value={override.id || ""}
                                    onChange={(e) =>
                                      handleOverrideChange(
                                        override.tempId,
                                        "id",
                                        e.target.value,
                                      )
                                    }
                                    fullWidth
                                    disabled={isSubmitting}
                                    error={!!overrideErrors.id}
                                    helperText={
                                      overrideErrors.id ||
                                      "Dejar vacío si aplica a todo el tipo"
                                    }
                                  />
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                  <FormControl
                                    fullWidth
                                    required
                                    error={!!overrideErrors.adjustmentMethod}
                                  >
                                    <InputLabel
                                      id={`override-method-label-${index}`}
                                    >
                                      Método Excep.
                                    </InputLabel>
                                    <Select
                                      labelId={`override-method-label-${index}`}
                                      label="Método Excep." // Added label prop
                                      name="adjustmentMethod"
                                      value={override.adjustmentMethod}
                                      onChange={(e) =>
                                        handleOverrideChange(
                                          override.tempId,
                                          "adjustmentMethod",
                                          e.target.value as AdjustmentMethod,
                                        )
                                      }
                                      disabled={isSubmitting}
                                    >
                                      {ADJUSTMENT_METHOD_OPTIONS.map((opt) => (
                                        <MenuItem
                                          key={opt.value}
                                          value={opt.value}
                                        >
                                          {opt.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                    <FormHelperText>
                                      {overrideErrors.adjustmentMethod}
                                    </FormHelperText>
                                  </FormControl>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                                  <TextField
                                    label="Valor Excepción" // Added label
                                    name="customValue"
                                    type="number"
                                    value={override.customValue ?? ""}
                                    onChange={(e) =>
                                      handleOverrideChange(
                                        override.tempId,
                                        "customValue",
                                        e.target.value,
                                      )
                                    } // Pass string value
                                    required
                                    fullWidth
                                    disabled={isSubmitting}
                                    error={!!overrideErrors.customValue}
                                    helperText={
                                      overrideErrors.customValue ||
                                      (override.adjustmentMethod ===
                                      "percentage"
                                        ? "Ej: 0.10 para 10%"
                                        : "Ej: 2.50")
                                    }
                                    InputProps={{
                                      inputProps:
                                        override.adjustmentMethod ===
                                        "percentage"
                                          ? { step: "0.01", min: "0", max: "1" }
                                          : { step: "0.01", min: "0" },
                                    }}
                                  />
                                </Grid2>
                              </Grid2>
                            </Box>
                          );
                        },
                      )}
                      <Button
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={handleAddOverride}
                        disabled={isSubmitting}
                        variant="outlined"
                        size="small"
                        sx={{ mt: formData.entityOverrides.length > 0 ? 0 : 2 }}
                      >
                        Añadir Excepción
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                </Grid2>
                {/* --- End Accordion Sections --- */}

                {/* Actions */}
                <Grid2 size={{ xs: 12 }}>
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    spacing={2}
                    sx={{ mt: 3 }}
                  >
                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      startIcon={
                        isSubmitting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : null
                      }
                    >
                      {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </Stack>
                </Grid2>
              </Grid2>
            </form>
          )}
      </Paper>
    </>
  );
};

export default UpdateDiscount;
