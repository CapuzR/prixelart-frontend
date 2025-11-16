import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { useSnackBar } from "@prixpon/context/GlobalContext";
import {
  AdjustmentMethod,
  ApplicableEntity,
  Surcharge,
  Entity,
} from "@prixpon/types/surcharge.types";
import { Product } from "@prixpon/types/product.types";
import { fetchSurchargeById, updateSurcharge } from "@prixpon/api-client/surcharge.api";
import { fetchProducts } from "@prixpon/api-client/product.api";

// MUI Components (Copied from CreateDiscount/Refactored CreateSurcharge)
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
  InputAdornment,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"; // Icon for Accordion
import WarningAmberIcon from "@mui/icons-material/WarningAmber"; // Icon for Error Summary
import Title from "@apps/admin/components/Title";
import Grid2 from "@mui/material/Grid";
import { DatePicker } from "@mui/lab";
import dayjs, { Dayjs } from "dayjs"; // Import dayjs
import {
  ADJUSTMENT_METHOD_OPTIONS,
  ENTITY_TYPE_OPTIONS,
  formatPrice,
  getProductImageUrl,
  ProductOrVariantOption,
} from "@apps/admin/utils/discountSurchargeUtils";

// --- Constants and Types (Adopted from Refactored CreateSurcharge) ---

interface OverrideFormState extends ApplicableEntity {
  tempId: string;
}
interface RecipientFormState extends ApplicableEntity {
  tempId: string;
}

interface SurchargeFormState
  extends Omit<
    Surcharge,
    | "_id"
    | "applicableProducts"
    | "entityOverrides"
    | "recipients"
    | "dateRange"
  > {
  entityOverrides: OverrideFormState[];
  recipients: RecipientFormState[];
  appliesToAllProducts: boolean;
  applicableProducts: [string, string][]; // Correct type: always variant-specific
}

const initialFormState: SurchargeFormState = {
  name: "",
  description: "",
  active: true,
  adjustmentMethod: "percentage",
  defaultValue: 0,
  appliesToAllProducts: false,
  applicableProducts: [],
  appliestoAllArts: false,
  applicableArts: [],
  entityOverrides: [],
  recipients: [],
};

// --- Option Interfaces from CreateDiscount (with images) ---
interface ImageItemOption {
  // For Arts
  id: string;
  label: string;
  imageUrl?: string;
}

// --- ValidationErrors type  ---
interface SurchargeValidationErrors {
  name?: string;
  description?: string;
  adjustmentMethod?: string;
  defaultValue?: string;
  applicableProducts?: string;
  applicableArts?: string;
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
  recipients?: {
    [index: number]: {
      type?: string;
      id?: string;
      adjustmentMethod?: string;
      customValue?: string;
    };
  };
  summary?: string;
}

// --- Helper type for single errors ---
type SingleRuleErrors = NonNullable<
  SurchargeValidationErrors["entityOverrides"]
>[number]; // Can reuse

// --- Component ---
const UpdateSurcharge: React.FC = () => {
  // --- Hooks ---
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [formData, setFormData] =
    useState<SurchargeFormState>(initialFormState); // Use specific form state type
  const [originalSurcharge, setOriginalSurcharge] = useState<Surcharge | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true); // Combined loading state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] =
    useState<SurchargeValidationErrors | null>(null); // Use specific validation type
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  // State for fetched items and options (Adopted from Refactored CreateSurcharge)
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // State for Autocomplete selections (Adopted from Refactored CreateSurcharge)
  const [selectedProductVariants, setSelectedProductVariants] = useState<
    ProductOrVariantOption[]
  >([]);

  // State for Date Pickers (Adopted from Refactored CreateSurcharge)
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  // State for Accordion (Adopted from Refactored CreateSurcharge)
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    "applicability",
  ); // Default expanded section

  const productVariantOptions = useMemo((): ProductOrVariantOption[] => {
    // ... Same logic as refactored CreateSurcharge (generates labels with prices) ...
    const options: ProductOrVariantOption[] = [];
    allProducts.forEach((product) => {
      if (!product._id || !product.variants || product.variants.length === 0)
        return;
      const productIdStr = product._id.toString();
      const productImageUrl = getProductImageUrl(product);

      // Calculate Price Ranges for "Todo el producto"
      let minPublic = Infinity,
        maxPublic = -Infinity,
        minPrixer = Infinity,
        maxPrixer = -Infinity;
      let validPricesFound = false;
      product.variants.forEach((variant) => {
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
        const formatRange = (
          min: number,
          max: number,
          prefix: string,
        ): string => {
          if (min === Infinity || max === -Infinity)
            return `${prefix}: ${formatPrice(null)}`; // Use formatPrice
          if (min === max) return `${prefix}: ${formatPrice(min.toString())}`;
          return `${prefix}: ${formatPrice(min.toString())} - ${formatPrice(max.toString())}`;
        };
        priceRangeStr = `(${formatRange(minPublic, maxPublic, "Precio Normal")}, ${formatRange(minPrixer, maxPrixer, "PVM")})`;
      }

      options.push({
        id: productIdStr,
        label: `${product.name} (Todo el producto) ${priceRangeStr}`,
        isProduct: true,
        productId: productIdStr,
        productName: product.name,
        imageUrl: productImageUrl,
      });

      product.variants.forEach((variant) => {
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
        setErrorFetch("ID de recargo inválido.");
        setIsLoadingData(false);
        setIsLoadingProducts(false);
        showSnackBar("ID de recargo inválido.");
        navigate("/admin/surcharges/read");
        return;
      }
      setIsLoadingData(true);
      setIsLoadingProducts(true);
      setErrorFetch(null);
      setValidationErrors(null);

      try {
        // Fetch surcharge and products concurrently (REMOVED Arts)
        const [surchargeData, productsData] = await Promise.all([
          fetchSurchargeById(id),
          fetchProducts(),
          // Removed Arts fetch
        ]);

        if (!surchargeData) throw new Error("Recargo no encontrado.");
        setOriginalSurcharge(surchargeData); // Store original

        const validProducts = productsData.filter(
          (p) => p._id && p.variants && p.variants.length > 0,
        );
        setAllProducts(validProducts); // Set products -> triggers productVariantOptions calculation

        // Populate base form data (excluding selection states for now)
        setFormData((prev) => ({
          // Use previous state to avoid race conditions
          ...prev, // Keep potential defaults if fetch fails partially? Or rely on initialFormState
          name: surchargeData.name || "",
          description: surchargeData.description || "",
          active: surchargeData.active ?? true,
          adjustmentMethod: surchargeData.adjustmentMethod || "percentage",
          defaultValue: surchargeData.defaultValue ?? 0,
          appliesToAllProducts:
            surchargeData.appliesToAllProducts ??
            (surchargeData.applicableProducts || []).length === 0, // Default true if empty
          appliestoAllArts: surchargeData.appliestoAllArts,
          applicableProducts: [],
          applicableArts: [],
          entityOverrides: (surchargeData.entityOverrides || []).map((ov) => ({
            ...ov,
            tempId: uuidv4(),
          })),
          recipients: (surchargeData.recipients || []).map((rec) => ({
            ...rec,
            tempId: uuidv4(),
          })),
        }));

        // Set initial date picker state
        setStartDate(
          surchargeData.dateRange?.start
            ? dayjs(surchargeData.dateRange.start)
            : null,
        );
        setEndDate(
          surchargeData.dateRange?.end
            ? dayjs(surchargeData.dateRange.end)
            : null,
        );
      } catch (err: any) {
        console.error("Failed to load initial data:", err);
        setErrorFetch(err.message || "Error al cargar los datos.");
        showSnackBar(err.message || "Error al cargar los datos.");
      } finally {
        setIsLoadingData(false); // Surcharge data loaded (or failed)
        setIsLoadingProducts(false); // Products loaded (or failed)
      }
    };
    loadInitialData();
  }, [id, navigate, showSnackBar]);

  useEffect(() => {
    // Run only after BOTH surcharge and products are loaded AND productVariantOptions has been calculated
    if (
      !isLoadingData &&
      !isLoadingProducts &&
      originalSurcharge &&
      allProducts.length > 0 &&
      productVariantOptions.length > 0
    ) {
      const initialApplicableVariantIds = new Set<string>(); // Stores "productId_variantId"

      if (
        !originalSurcharge.appliesToAllProducts &&
        originalSurcharge.applicableProducts
      ) {
        originalSurcharge.applicableProducts.forEach((savedProdRef) => {
          // --- Logic to expand [prodId] or handle [prodId, varId] ---
          let productId: string | undefined;
          let variantId: string | undefined;

          // Handle different possible structures in fetched data (robustness)
          if (
            Array.isArray(savedProdRef) &&
            savedProdRef.length === 2 &&
            savedProdRef[0] &&
            savedProdRef[1]
          ) {
            productId = savedProdRef[0];
            variantId = savedProdRef[1];
          } else if (
            Array.isArray(savedProdRef) &&
            savedProdRef.length === 1 &&
            savedProdRef[0]
          ) {
            productId = savedProdRef[0]; // Whole product marker
          } else if (typeof savedProdRef === "string") {
            productId = savedProdRef; // Legacy? Treat as whole product
          }
          // --- End Normalization ---

          if (productId && variantId) {
            initialApplicableVariantIds.add(`${productId}_${variantId}`);
          } else if (productId) {
            // Expand whole product
            const product = allProducts.find(
              (p) => p._id!.toString() === productId,
            );
            if (product?.variants) {
              product.variants.forEach((v) => {
                if (v._id)
                  initialApplicableVariantIds.add(`${productId}_${v._id}`);
              });
            }
          }
        });
      }

      // Convert Set back to the required array format for formData
      const finalInitialApplicableProducts: [string, string][] = Array.from(
        initialApplicableVariantIds,
      ).map((idPair) => {
        const [prodId, varId] = idPair.split("_");
        return [prodId, varId];
      });

      // Find the corresponding ProductOrVariantOption objects for the Autocomplete UI
      // Match based on the composite "productId_variantId"
      const preselectedOptions = productVariantOptions.filter(
        (opt) => !opt.isProduct && initialApplicableVariantIds.has(opt.id),
      );

      // Update FORM DATA and UI selection state TOGETHER
      setFormData((prev) => ({
        ...prev,
        applicableProducts: finalInitialApplicableProducts, // Set the source of truth
      }));
      setSelectedProductVariants(preselectedOptions); // Set the UI state

      // Set initial accordion expansion based on content
      if (
        finalInitialApplicableProducts.length > 0 ||
        (originalSurcharge?.entityOverrides?.length ?? 0 > 0) ||
        (originalSurcharge?.recipients?.length ?? 0 > 0) ||
        originalSurcharge?.dateRange
      ) {
        setExpandedAccordion(false); // Start collapsed if details exist
      } else {
        setExpandedAccordion("applicability"); // Default open otherwise
      }
    }
  }, [
    isLoadingData,
    isLoadingProducts,
    originalSurcharge,
    allProducts,
    productVariantOptions,
  ]); // Dependencies

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked; // For checkboxes
    const fieldVal = type === "checkbox" ? checked : value;
    setFormData((prevData) => ({ ...prevData, [name]: fieldVal }));
    if (
      validationErrors &&
      validationErrors[name as keyof SurchargeValidationErrors]
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null;
        const updated = { ...prevErrors };
        delete updated[name as keyof SurchargeValidationErrors];
        const keys = Object.keys(updated).filter((k) => k !== "summary");
        return keys.length > 0 || updated.summary ? updated : null;
      });
    }
  };
  const handleSelectChange = (
    event: ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const name = event.target.name as keyof SurchargeFormState;
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [name]: value as AdjustmentMethod | Entity,
    }));
    if (
      validationErrors &&
      validationErrors[name as keyof SurchargeValidationErrors]
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null;
        const updated = { ...prevErrors };
        delete updated[name as keyof SurchargeValidationErrors];
        const keys = Object.keys(updated).filter((k) => k !== "summary");
        return keys.length > 0 || updated.summary ? updated : null;
      });
    }
  };
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: checked };
      if (name === "appliesToAllProducts" && checked) {
        newState.applicableProducts = []; // Clear the data model
        setSelectedProductVariants([]); // Clear the UI state
      }
      // Removed Arts logic
      return newState;
    });
    // Clear applicableProducts validation if appliesToAllProducts is checked/unchecked
    if (
      name === "appliesToAllProducts" &&
      validationErrors?.applicableProducts
    ) {
      setValidationErrors((prev) =>
        prev ? { ...prev, applicableProducts: undefined } : null,
      );
    }
  };
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
        // Ensure it's a variant option
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

    // UPDATE THE SOURCE OF TRUTH (formData)
    setFormData((prev) => ({
      ...prev,
      applicableProducts: newApplicableProducts,
    }));

    // Clear validation
    if (validationErrors?.applicableProducts) {
      setValidationErrors((prev) =>
        prev ? { ...prev, applicableProducts: undefined } : null,
      );
    }
  };

  const handleStartDateChange = (newValue: Dayjs | null) => {
    setStartDate(newValue);
    if (
      validationErrors?.startDate ||
      validationErrors?.endDate ||
      validationErrors?.dateRange
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null;
        const updated = { ...prevErrors };
        delete updated.startDate;
        delete updated.endDate;
        delete updated.dateRange;
        const keys = Object.keys(updated).filter((k) => k !== "summary");
        return keys.length > 0 || updated.summary ? updated : null;
      });
    }
  };
  const handleEndDateChange = (newValue: Dayjs | null) => {
    setEndDate(newValue);
    if (
      validationErrors?.startDate ||
      validationErrors?.endDate ||
      validationErrors?.dateRange
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null;
        const updated = { ...prevErrors };
        delete updated.startDate;
        delete updated.endDate;
        delete updated.dateRange;
        const keys = Object.keys(updated).filter((k) => k !== "summary");
        return keys.length > 0 || updated.summary ? updated : null;
      });
    }
  };
  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false);
    };
  // Override and Recipient Handlers (identical logic to refactored CreateSurcharge)
  const handleAddOverride = () => {
    setFormData((prev) => ({
      ...prev,
      entityOverrides: [
        ...prev.entityOverrides,
        {
          tempId: uuidv4(),
          type: "user",
          adjustmentMethod: "percentage",
          customValue: 0,
          id: "",
          name: "",
        },
      ],
    }));
    if (validationErrors?.entityOverrides) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null;
        const updated = { ...prevErrors };
        delete updated.entityOverrides;
        const keys = Object.keys(updated).filter((k) => k !== "summary");
        return keys.length > 0 || updated.summary ? updated : null;
      });
    }
  };
  const handleOverrideChange = (
    tempId: string,
    field: keyof ApplicableEntity,
    value: string | number | Entity | AdjustmentMethod,
  ) => {
    setFormData((prev) => ({
      ...prev,
      entityOverrides: prev.entityOverrides.map((ov: OverrideFormState) =>
        ov.tempId === tempId ? { ...ov, [field]: value } : ov,
      ),
    }));
    if (validationErrors?.entityOverrides) {
      const index = formData.entityOverrides.findIndex(
        (ov) => ov.tempId === tempId,
      );
      if (index === -1) return;
      const errorFieldKey = field as keyof SingleRuleErrors;
      if (validationErrors.entityOverrides[index]?.[errorFieldKey]) {
        setValidationErrors((prevErrors) => {
          /*... clear specific error logic ...*/ if (
            !prevErrors?.entityOverrides?.[index]
          )
            return prevErrors;
          const updatedOverrides = { ...prevErrors.entityOverrides };
          const specificOverrideErrors = { ...updatedOverrides[index] };
          delete specificOverrideErrors[errorFieldKey];
          if (Object.keys(specificOverrideErrors).length === 0) {
            delete updatedOverrides[index];
          } else {
            updatedOverrides[index] = specificOverrideErrors;
          }
          const finalOverrides =
            Object.keys(updatedOverrides).length > 0
              ? updatedOverrides
              : undefined;
          const newErrors = { ...prevErrors, entityOverrides: finalOverrides };
          if (!newErrors.entityOverrides) delete newErrors.entityOverrides;
          const keys = Object.keys(newErrors).filter((k) => k !== "summary");
          return keys.length > 0 || newErrors.summary ? newErrors : null;
        });
      }
    }
  };
  const handleRemoveOverride = (tempIdToRemove: string) => {
    const indexToRemove = formData.entityOverrides.findIndex(
      (ov) => ov.tempId === tempIdToRemove,
    );
    setFormData((prev) => ({
      ...prev,
      entityOverrides: prev.entityOverrides.filter(
        (ov) => ov.tempId !== tempIdToRemove,
      ),
    }));
    if (validationErrors?.entityOverrides && indexToRemove !== -1) {
      setValidationErrors((prevErrors) => {
        /*... clear/shift override errors ...*/ if (
          !prevErrors?.entityOverrides
        )
          return prevErrors;
        const currentOverrideErrors = { ...prevErrors.entityOverrides };
        const updatedOverrideErrors: SurchargeValidationErrors["entityOverrides"] =
          {};
        let errorFound = false;
        Object.keys(currentOverrideErrors).forEach((keyIndexStr) => {
          const keyIndex = parseInt(keyIndexStr, 10);
          if (keyIndex === indexToRemove) return;
          const newIndex = keyIndex > indexToRemove ? keyIndex - 1 : keyIndex;
          updatedOverrideErrors[newIndex] = currentOverrideErrors[keyIndex];
          errorFound = true;
        });
        const finalOverrides = errorFound ? updatedOverrideErrors : undefined;
        const newErrors = { ...prevErrors, entityOverrides: finalOverrides };
        if (!newErrors.entityOverrides) delete newErrors.entityOverrides;
        const keys = Object.keys(newErrors).filter((k) => k !== "summary");
        return keys.length > 0 || newErrors.summary ? newErrors : null;
      });
    }
  };
  const handleAddRecipient = () => {
    setFormData((prev) => ({
      ...prev,
      recipients: [
        ...prev.recipients,
        {
          tempId: uuidv4(),
          type: "user",
          adjustmentMethod: "percentage",
          customValue: 0,
          id: "",
          name: "",
        },
      ],
    }));
    if (validationErrors?.recipients) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null;
        const updated = { ...prevErrors };
        delete updated.recipients;
        const keys = Object.keys(updated).filter((k) => k !== "summary");
        return keys.length > 0 || updated.summary ? updated : null;
      });
    }
  };
  const handleRecipientChange = (
    tempId: string,
    field: keyof ApplicableEntity,
    value: string | number | Entity | AdjustmentMethod,
  ) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.map((rec: RecipientFormState) =>
        rec.tempId === tempId ? { ...rec, [field]: value } : rec,
      ),
    }));
    if (validationErrors?.recipients) {
      const index = formData.recipients.findIndex(
        (rec) => rec.tempId === tempId,
      );
      if (index === -1) return;
      const errorFieldKey = field as keyof SingleRuleErrors;
      if (validationErrors.recipients[index]?.[errorFieldKey]) {
        setValidationErrors((prevErrors) => {
          /*... clear specific error logic ...*/ if (
            !prevErrors?.recipients?.[index]
          )
            return prevErrors;
          const updatedRecipients = { ...prevErrors.recipients };
          const specificRecipientErrors = { ...updatedRecipients[index] };
          delete specificRecipientErrors[errorFieldKey];
          if (Object.keys(specificRecipientErrors).length === 0) {
            delete updatedRecipients[index];
          } else {
            updatedRecipients[index] = specificRecipientErrors;
          }
          const finalRecipients =
            Object.keys(updatedRecipients).length > 0
              ? updatedRecipients
              : undefined;
          const newErrors = { ...prevErrors, recipients: finalRecipients };
          if (!newErrors.recipients) delete newErrors.recipients;
          const keys = Object.keys(newErrors).filter((k) => k !== "summary");
          return keys.length > 0 || newErrors.summary ? newErrors : null;
        });
      }
    }
  };
  const handleRemoveRecipient = (tempIdToRemove: string) => {
    const indexToRemove = formData.recipients.findIndex(
      (rec) => rec.tempId === tempIdToRemove,
    );
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter(
        (rec) => rec.tempId !== tempIdToRemove,
      ),
    }));
    if (validationErrors?.recipients && indexToRemove !== -1) {
      setValidationErrors((prevErrors) => {
        /*... clear/shift recipient errors ...*/ if (!prevErrors?.recipients)
          return prevErrors;
        const currentRecipientErrors = { ...prevErrors.recipients };
        const updatedRecipientErrors: SurchargeValidationErrors["recipients"] =
          {};
        let errorFound = false;
        Object.keys(currentRecipientErrors).forEach((keyIndexStr) => {
          const keyIndex = parseInt(keyIndexStr, 10);
          if (keyIndex === indexToRemove) return;
          const newIndex = keyIndex > indexToRemove ? keyIndex - 1 : keyIndex;
          updatedRecipientErrors[newIndex] = currentRecipientErrors[keyIndex];
          errorFound = true;
        });
        const finalRecipients = errorFound ? updatedRecipientErrors : undefined;
        const newErrors = { ...prevErrors, recipients: finalRecipients };
        if (!newErrors.recipients) delete newErrors.recipients;
        const keys = Object.keys(newErrors).filter((k) => k !== "summary");
        return keys.length > 0 || newErrors.summary ? newErrors : null;
      });
    }
  };

  // --- Validation (Adopted from Refactored CreateSurcharge) ---
  const validateForm = (): boolean => {
    const errors: SurchargeValidationErrors = {};
    const errorMessages: string[] = [];

    // Basic field validation
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

    // Applicability validation - **Uses selection state**
    if (
      !formData.appliesToAllProducts &&
      selectedProductVariants.length === 0
    ) {
      errors.applicableProducts =
        "Seleccione productos/variantes o marque 'Aplica a todos'.";
      errorMessages.push("Productos/Variantes");
    }

    // Date Range validation
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

    // Entity Overrides Validation
    const overrideErrors: SurchargeValidationErrors["entityOverrides"] = {};
    let hasOverrideError = false;
    formData.entityOverrides.forEach((ov, index) => {
      /* ... override validation logic ... */
      const currentErrors: SingleRuleErrors = {};
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
        if (!hasOverrideError) {
          errorMessages.push(
            `Excepción #${index + 1} (${overrideErrorFields.join(", ")})`,
          );
        }
        hasOverrideError = true;
      }
    });
    if (hasOverrideError) {
      errors.entityOverrides = overrideErrors;
    }

    // Recipients Validation
    const recipientErrors: SurchargeValidationErrors["recipients"] = {};
    let hasRecipientError = false;
    formData.recipients.forEach((rec, index) => {
      /* ... recipient validation logic ... */
      const currentErrors: SingleRuleErrors = {};
      let recipientErrorFields: string[] = [];
      if (!rec.type) {
        currentErrors.type = "Requerido";
        recipientErrorFields.push("Tipo Entidad");
      }
      if (!rec.id?.trim()) {
        currentErrors.id = "ID Requerido";
        recipientErrorFields.push("ID Entidad");
      }
      if (!rec.adjustmentMethod) {
        currentErrors.adjustmentMethod = "Requerido";
        recipientErrorFields.push("Método Dest.");
      }
      const customValueNum = Number(rec.customValue);
      if (
        rec.customValue === undefined ||
        rec.customValue === null ||
        isNaN(customValueNum)
      ) {
        currentErrors.customValue = "Valor numérico requerido.";
        recipientErrorFields.push("Valor Destinatario");
      } else if (
        rec.adjustmentMethod === "percentage" &&
        (customValueNum < 0 || customValueNum > 1)
      ) {
        currentErrors.customValue = "Valor entre 0 y 1.";
        recipientErrorFields.push("Valor Destinatario (%)");
      } else if (rec.adjustmentMethod === "absolute" && customValueNum < 0) {
        currentErrors.customValue = "Valor no negativo.";
        recipientErrorFields.push("Valor Destinatario ($)");
      }
      if (Object.keys(currentErrors).length > 0) {
        recipientErrors[index] = currentErrors;
        if (!hasRecipientError) {
          errorMessages.push(
            `Destinatario #${index + 1} (${recipientErrorFields.join(", ")})`,
          );
        }
        hasRecipientError = true;
      }
    });
    if (hasRecipientError) {
      errors.recipients = recipientErrors;
    }

    // Add summary message
    if (errorMessages.length > 0) {
      errors.summary = `Por favor, corrija los errores en los siguientes campos: ${errorMessages.join(", ")}.`;
    }

    setValidationErrors(Object.keys(errors).length > 0 ? errors : null);
    if (Object.keys(errors).length > 0) {
      showSnackBar(
        "Por favor, corrija los errores indicados en el formulario.",
      );
    }
    return Object.keys(errors).length === 0;
  };
  // --- END Validation ---

  // --- Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !validateForm()) return; // Ensure ID exists for update
    setIsSubmitting(true);

    // Clean overrides (same as CreateSurcharge)
    const finalOverrides: ApplicableEntity[] = formData.entityOverrides.map(
      (ov) => {
        const { tempId, ...rest } = ov;
        const data: ApplicableEntity = {
          ...rest,
          id: rest.id?.trim() || undefined,
          customValue:
            rest.customValue !== undefined && !isNaN(Number(rest.customValue))
              ? Number(rest.customValue)
              : undefined,
        };
        Object.keys(data).forEach(
          (k) =>
            data[k as keyof ApplicableEntity] === undefined &&
            delete data[k as keyof ApplicableEntity],
        );
        return data;
      },
    );
    // Clean recipients (same as CreateSurcharge)
    const finalRecipients: ApplicableEntity[] = formData.recipients.map(
      (rec) => {
        const { tempId, ...rest } = rec;
        const data: ApplicableEntity = {
          ...rest,
          id: rest.id,
          customValue:
            rest.customValue !== undefined && !isNaN(Number(rest.customValue))
              ? Number(rest.customValue)
              : undefined,
        };
        Object.keys(data).forEach(
          (k) =>
            data[k as keyof ApplicableEntity] === undefined &&
            delete data[k as keyof ApplicableEntity],
        );
        return data;
      },
    );

    // **Derive applicableProducts/Arts from selection state for payload**
    const finalApplicableProducts = formData.appliesToAllProducts
      ? []
      : selectedProductVariants.map(
          (opt) =>
            (opt.isProduct
              ? [opt.productId]
              : [opt.productId, opt.variantId]) as [string, string?],
        );

    // Construct payload using combined form data and derived arrays
    const payload: Omit<Surcharge, "_id"> = {
      name: formData.name,
      description: formData.description,
      active: formData.active,
      adjustmentMethod: formData.adjustmentMethod,
      defaultValue: Number(formData.defaultValue),
      appliesToAllProducts: formData.appliesToAllProducts,
      appliestoAllArts: formData.appliestoAllArts,
      applicableProducts: finalApplicableProducts,
      applicableArts: formData.applicableArts,
      dateRange:
        startDate && endDate
          ? { start: startDate.toDate(), end: endDate.toDate() }
          : undefined,
      entityOverrides: finalOverrides,
      recipients: finalRecipients,
    };

    try {
      console.log("Updating Surcharge Data:", id, payload);
      const response = await updateSurcharge(id, payload); // Use update API
      if (response) {
        showSnackBar(`Recargo "${formData.name}" actualizado correctamente.`);
        navigate("/admin/surcharges/read"); // Adjust route
      } else {
        throw new Error(
          "La actualización del recargo falló (respuesta vacía).",
        );
      }
    } catch (err: any) {
      console.error("Failed to update surcharge:", err);
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Error al actualizar el recargo.";
      setValidationErrors((prev) => ({
        ...(prev || {}),
        summary: `Error del servidor: ${message}`,
      }));
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/admin/surcharges/read"); // Adjust route

  // --- Render  ---
  return (
    <>
      {/* --- Update Title --- */}
      <Title
        title={`Actualizar Recargo: ${originalSurcharge?.name || (id ? "Cargando..." : "Inválido")}`}
      />
      {/* --- End Title Update --- */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 2 }}>
        {/* Loading and Error States */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        )}
        {errorFetch && !isLoading && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Stack direction="row" spacing={1}>
                <Button onClick={handleCancel} size="small" color="inherit">
                  Volver
                </Button>
              </Stack>
            }
          >
            {errorFetch}
          </Alert>
        )}
        {/* Form Content (only rendered when not loading and no fetch error) */}
        {!isLoading && !errorFetch && (
          <form onSubmit={handleSubmit} noValidate>
            {/* --- Error Summary Alert --- */}
            {validationErrors?.summary && (
              <Alert
                severity="error"
                icon={<WarningAmberIcon fontSize="inherit" />}
                sx={{ mb: 3 }}
              >
                {validationErrors.summary}
              </Alert>
            )}
            {/* --- END Error Summary --- */}

            <Grid2 container spacing={3}>
              {/* Basic Info & Default Adjustment (Always Visible) */}
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Nombre del Recargo"
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
                {" "}
                <FormControl
                  fullWidth
                  required
                  error={!!validationErrors?.adjustmentMethod}
                >
                  <InputLabel id="adj-m-lbl">Método Base</InputLabel>
                  <Select
                    labelId="adj-m-lbl"
                    name="adjustmentMethod"
                    value={formData.adjustmentMethod}
                    label="Método Base"
                    onChange={handleSelectChange as any}
                    disabled={isSubmitting}
                  >
                    {ADJUSTMENT_METHOD_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {validationErrors?.adjustmentMethod}
                  </FormHelperText>
                </FormControl>{" "}
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                {" "}
                <TextField
                  label="Valor Base"
                  name="defaultValue"
                  type="number"
                  value={formData.defaultValue}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  disabled={isSubmitting}
                  helperText={
                    validationErrors?.defaultValue ||
                    (formData.adjustmentMethod === "percentage"
                      ? "Ej: 0.15 para 15%"
                      : "Ej: 5.00")
                  }
                  error={!!validationErrors?.defaultValue}
                  InputProps={{
                    endAdornment:
                      formData.adjustmentMethod === "percentage" ? (
                        <InputAdornment position="end">
                          % (Decimal)
                        </InputAdornment>
                      ) : undefined,
                    startAdornment:
                      formData.adjustmentMethod === "absolute" ? (
                        <InputAdornment position="start">$</InputAdornment>
                      ) : undefined,
                    inputProps:
                      formData.adjustmentMethod === "percentage"
                        ? { step: "0.01", min: "0", max: "1" }
                        : { step: "0.01", min: "0" },
                  }}
                />{" "}
              </Grid2>

              {/* --- Accordion Sections --- */}
              <Grid2 size={{ xs: 12 }}>
                {/* Applicability Accordion */}
                <Accordion
                  expanded={expandedAccordion === "applicability"}
                  onChange={handleAccordionChange("applicability")}
                  sx={{ "&.Mui-expanded": { margin: "16px 0" } }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="applicability-content"
                    id="applicability-header"
                  >
                    {" "}
                    <Typography variant="h6" component="div">
                      Aplicabilidad Base
                    </Typography>{" "}
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid2 container spacing={2}>
                      {/* Products/Variants Applicability */}
                      <Grid2 size={{ xs: 12 }}>
                        <Box
                          sx={{
                            border: 1,
                            borderColor: "divider",
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
                              id="prod-var-select"
                              options={productVariantOptions} // With prices
                              value={selectedProductVariants} // UI state
                              onChange={handleProductVariantChange} // Updates formData
                              getOptionLabel={(o) => o.label.trim()}
                              isOptionEqualToValue={(o, v) => o.id === v.id}
                              groupBy={(o) => o.productName}
                              loading={
                                isLoadingProducts &&
                                productVariantOptions.length === 0
                              }
                              disabled={isSubmitting || isLoading}
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
                                      marginLeft: option.isProduct ? 0 : "15px",
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
                                    isLoading ? "Cargando..." : "Seleccionar..."
                                  }
                                  error={!!validationErrors?.applicableProducts}
                                  helperText={
                                    validationErrors?.applicableProducts &&
                                    validationErrors.applicableProducts !== " "
                                      ? validationErrors.applicableProducts
                                      : null
                                  }
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
                    {" "}
                    <Typography variant="h6" component="div">
                      Rango de Fechas (Opcional)
                    </Typography>{" "}
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid2 container spacing={2}>
                      <Grid2 size={{ xs: 12, sm: 6 }}>
                        {" "}
                        <DatePicker
                          label="Fecha de Inicio"
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
                        />{" "}
                      </Grid2>
                      <Grid2 size={{ xs: 12, sm: 6 }}>
                        {" "}
                        <DatePicker
                          label="Fecha de Fin"
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
                        />{" "}
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
                    {" "}
                    <Typography variant="h6" component="div">
                      Excepciones Específicas (Opcional)
                    </Typography>{" "}
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
                    {formData.entityOverrides.map((override, index) => {
                      const overrideErrors =
                        validationErrors?.entityOverrides?.[index] || {};
                      return (
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
                                color: "error.main",
                              }}
                              aria-label="Eliminar Excepción"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                              <FormControl
                                fullWidth
                                required
                                error={!!overrideErrors.type}
                              >
                                <InputLabel id={`ov-t-lbl-${index}`}>
                                  Tipo
                                </InputLabel>
                                <Select
                                  labelId={`ov-t-lbl-${index}`}
                                  label="Tipo"
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
                                    <MenuItem key={opt.value} value={opt.value}>
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
                                label="ID (Opc)"
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
                                helperText={overrideErrors.id || "Vacío=Todos"}
                              />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                              <FormControl
                                fullWidth
                                required
                                error={!!overrideErrors.adjustmentMethod}
                              >
                                <InputLabel id={`ov-m-lbl-${index}`}>
                                  Método
                                </InputLabel>
                                <Select
                                  labelId={`ov-m-lbl-${index}`}
                                  label="Método"
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
                                    <MenuItem key={opt.value} value={opt.value}>
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
                                label="Valor Excep."
                                name="customValue"
                                type="number"
                                value={override.customValue ?? ""}
                                onChange={(e) =>
                                  handleOverrideChange(
                                    override.tempId,
                                    "customValue",
                                    e.target.value,
                                  )
                                }
                                required
                                fullWidth
                                disabled={isSubmitting}
                                error={!!overrideErrors.customValue}
                                helperText={
                                  overrideErrors.customValue ||
                                  (override.adjustmentMethod === "percentage"
                                    ? "Ej: 0.10"
                                    : "Ej: 2.50")
                                }
                                InputProps={{
                                  inputProps:
                                    override.adjustmentMethod === "percentage"
                                      ? { step: "0.01", min: "0", max: "1" }
                                      : { step: "0.01", min: "0" },
                                }}
                              />
                            </Grid2>
                          </Grid2>
                        </Box>
                      );
                    })}
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

                {/* Recipients Accordion */}
                <Accordion
                  expanded={expandedAccordion === "recipients"}
                  onChange={handleAccordionChange("recipients")}
                  sx={{ "&.Mui-expanded": { margin: "16px 0" } }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="recipients-content"
                    id="recipients-header"
                  >
                    {" "}
                    <Typography variant="h6" component="div">
                      Destinatarios del Recargo (Opcional)
                    </Typography>{" "}
                  </AccordionSummary>
                  <AccordionDetails>
                    {formData.recipients.length === 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        No se han añadido destinatarios. Si no se añaden, el
                        recargo no se distribuirá.
                      </Typography>
                    )}
                    {formData.recipients.map((recipient, index) => {
                      const recipientErrors =
                        validationErrors?.recipients?.[index] || {};
                      return (
                        <Box
                          key={recipient.tempId}
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            p: 2,
                            mb: 2,
                            position: "relative",
                          }}
                        >
                          <Tooltip title="Eliminar Destinatario">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleRemoveRecipient(recipient.tempId)
                              }
                              disabled={isSubmitting}
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                color: "error.main",
                              }}
                              aria-label="Eliminar Destinatario"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                              <FormControl
                                fullWidth
                                required
                                error={!!recipientErrors.type}
                              >
                                <InputLabel id={`rec-t-lbl-${index}`}>
                                  Tipo
                                </InputLabel>
                                <Select
                                  labelId={`rec-t-lbl-${index}`}
                                  label="Tipo"
                                  name="type"
                                  value={recipient.type}
                                  onChange={(e) =>
                                    handleRecipientChange(
                                      recipient.tempId,
                                      "type",
                                      e.target.value as Entity,
                                    )
                                  }
                                  disabled={isSubmitting}
                                >
                                  {ENTITY_TYPE_OPTIONS.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                                <FormHelperText>
                                  {recipientErrors.type}
                                </FormHelperText>
                              </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                              <TextField
                                label="ID Entidad"
                                name="id"
                                value={recipient.id || ""}
                                onChange={(e) =>
                                  handleRecipientChange(
                                    recipient.tempId,
                                    "id",
                                    e.target.value,
                                  )
                                }
                                fullWidth
                                required
                                disabled={isSubmitting}
                                error={!!recipientErrors.id}
                                helperText={
                                  recipientErrors.id || "ID requerido"
                                }
                              />
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                              <FormControl
                                fullWidth
                                required
                                error={!!recipientErrors.adjustmentMethod}
                              >
                                <InputLabel id={`rec-m-lbl-${index}`}>
                                  Método
                                </InputLabel>
                                <Select
                                  labelId={`rec-m-lbl-${index}`}
                                  label="Método"
                                  name="adjustmentMethod"
                                  value={recipient.adjustmentMethod}
                                  onChange={(e) =>
                                    handleRecipientChange(
                                      recipient.tempId,
                                      "adjustmentMethod",
                                      e.target.value as AdjustmentMethod,
                                    )
                                  }
                                  disabled={isSubmitting}
                                >
                                  {ADJUSTMENT_METHOD_OPTIONS.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                                <FormHelperText>
                                  {recipientErrors.adjustmentMethod}
                                </FormHelperText>
                              </FormControl>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                              <TextField
                                label="Valor Dest."
                                name="customValue"
                                type="number"
                                value={recipient.customValue ?? ""}
                                onChange={(e) =>
                                  handleRecipientChange(
                                    recipient.tempId,
                                    "customValue",
                                    e.target.value,
                                  )
                                }
                                required
                                fullWidth
                                disabled={isSubmitting}
                                error={!!recipientErrors.customValue}
                                helperText={
                                  recipientErrors.customValue ||
                                  (recipient.adjustmentMethod === "percentage"
                                    ? "Ej: 0.10"
                                    : "Ej: 2.50")
                                }
                                InputProps={{
                                  inputProps:
                                    recipient.adjustmentMethod === "percentage"
                                      ? { step: "0.01", min: "0", max: "1" }
                                      : { step: "0.01", min: "0" },
                                }}
                              />
                            </Grid2>
                          </Grid2>
                        </Box>
                      );
                    })}
                    <Button
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={handleAddRecipient}
                      disabled={isSubmitting}
                      variant="outlined"
                      size="small"
                      sx={{ mt: formData.recipients.length > 0 ? 0 : 2 }}
                    >
                      Añadir Destinatario
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
                  {/* --- Update Button Text --- */}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={
                      isSubmitting || isLoading /* Disable if loading data */
                    }
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : null
                    }
                  >
                    {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  {/* --- End Button Text Update --- */}
                </Stack>
              </Grid2>
            </Grid2>
          </form>
        )}{" "}
        {/* End Form Content Render */}
      </Paper>
    </>
  );
};

export default UpdateSurcharge; // Rename export
