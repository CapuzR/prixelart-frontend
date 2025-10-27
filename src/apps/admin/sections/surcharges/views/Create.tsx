import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
  useMemo,
} from "react"
import { useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

// Hooks, Types, Context, API
import { useSnackBar } from "@context/UIContext"
// --- Import Surcharge specific types ---
import {
  AdjustmentMethod,
  ApplicableEntity,
  Surcharge,
  Entity,
} from "types/surcharge.types"
import { Product } from "types/product.types" // Use detailed Product/Variant
import { createSurcharge } from "@api/surcharge.api"
import { fetchProducts } from "@api/product.api"

// MUI Components (Keep all imports from CreateDiscount)
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
  AccordionDetails, // Added Accordion components
  Avatar,
} from "@mui/material"
import Grid2 from "@mui/material/Grid"

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import DeleteIcon from "@mui/icons-material/Delete"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore" // Icon for Accordion
import WarningAmberIcon from "@mui/icons-material/WarningAmber" // Icon for Error Summary
import Title from "@apps/admin/components/Title"

// Date Picker Components & Dayjs
import { Dayjs } from "dayjs" // Assuming dayjs is used
import {
  ADJUSTMENT_METHOD_OPTIONS,
  ENTITY_TYPE_OPTIONS,
  formatPrice,
  getProductImageUrl,
  ProductOrVariantOption,
} from "@apps/admin/utils/discountSurchargeUtils"
import { DatePicker } from "@mui/lab"

// --- Constants and Types ---

interface OverrideFormState extends ApplicableEntity {
  tempId: string
}

interface RecipientFormState extends ApplicableEntity {
  tempId: string
}

// --- Updated initial state type for Surcharge ---
const initialFormState: Omit<Surcharge, "_id" | "applicableProducts"> & {
  entityOverrides: OverrideFormState[]
  recipients: RecipientFormState[] // Add recipients
  applicableProducts: [string, string?][]
} = {
  name: "",
  description: "",
  active: true,
  adjustmentMethod: "percentage",
  defaultValue: 0,
  applicableProducts: [],
  appliesToAllProducts: false,
  appliestoAllArts: false,
  dateRange: undefined,
  entityOverrides: [],
  recipients: [],
}

// --- Updated ValidationErrors type for Surcharge ---
interface SurchargeValidationErrors {
  name?: string
  description?: string
  adjustmentMethod?: string
  defaultValue?: string
  applicableProducts?: string // For selection requirement
  dateRange?: string
  startDate?: string
  endDate?: string
  entityOverrides?: {
    [index: number]: {
      type?: string
      id?: string
      adjustmentMethod?: string
      customValue?: string
    }
  }
  recipients?: {
    [index: number]: {
      type?: string
      id?: string
      adjustmentMethod?: string
      customValue?: string
    }
  } // Add recipients errors
  summary?: string
}

// --- Define helper type for single errors ---
type SingleRuleErrors = NonNullable<
  SurchargeValidationErrors["entityOverrides"]
>[number] // Can reuse for recipients structure

// --- Component ---
const CreateSurcharge: React.FC = () => {
  // Rename component
  // --- Hooks ---
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()

  // --- State ---
  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [validationErrors, setValidationErrors] =
    useState<SurchargeValidationErrors | null>(null) // Use new type
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  // --- Adopted State from CreateDiscount ---
  const [selectedProductVariants, setSelectedProductVariants] = useState<
    ProductOrVariantOption[]
  >([])
  const [startDate, setStartDate] = useState<Dayjs | null>(null)
  const [endDate, setEndDate] = useState<Dayjs | null>(null)
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    "applicability"
  ) // Default expanded section

  // --- productVariantOptions useMemo (from CreateDiscount) ---
  const productVariantOptions = useMemo((): ProductOrVariantOption[] => {
    // ... Same logic as refactored CreateDiscount/UpdateDiscount ...
    // Calculates price ranges/values and puts them in the label
    const options: ProductOrVariantOption[] = []
    allProducts.forEach((product) => {
      if (!product._id || !product.variants || product.variants.length === 0)
        return
      const productIdStr = product._id.toString()
      const productImageUrl = getProductImageUrl(product)

      // Calculate Price Ranges for "Todo el producto"
      let minPublic = Infinity,
        maxPublic = -Infinity,
        minPrixer = Infinity,
        maxPrixer = -Infinity
      let validPricesFound = false
      product.variants.forEach((variant) => {
        const publicP = parseFloat(variant.publicPrice)
        const prixerP = parseFloat(variant.prixerPrice)
        if (!isNaN(publicP)) {
          minPublic = Math.min(minPublic, publicP)
          maxPublic = Math.max(maxPublic, publicP)
          validPricesFound = true
        }
        if (!isNaN(prixerP)) {
          minPrixer = Math.min(minPrixer, prixerP)
          maxPrixer = Math.max(maxPrixer, prixerP)
          validPricesFound = true
        }
      })
      let priceRangeStr = "(Precios N/A)"
      if (validPricesFound) {
        const formatRange = (
          min: number,
          max: number,
          prefix: string
        ): string => {
          if (min === Infinity || max === -Infinity) return `${prefix}: USD N/A`
          if (min === max) return `${prefix}: USD ${min.toFixed(2)}`
          return `${prefix}: USD ${min.toFixed(2)} - USD ${max.toFixed(2)}`
        }
        priceRangeStr = `(${formatRange(minPublic, maxPublic, "Precio Normal")}, ${formatRange(minPrixer, maxPrixer, "PVM")})`
      }

      options.push({
        id: productIdStr,
        label: `${product.name} (Todo el producto) ${priceRangeStr}`,
        isProduct: true,
        productId: productIdStr,
        productName: product.name,
        imageUrl: productImageUrl,
      })

      // Add options for individual variants
      product.variants.forEach((variant) => {
        if (!variant._id) return
        const variantImageUrl = getProductImageUrl(product, variant)
        const variantPriceStr = `(Precio Normal: ${formatPrice(variant.publicPrice)}, PVM: ${formatPrice(variant.prixerPrice)})`
        options.push({
          id: `${productIdStr}_${variant._id}`,
          label: `    ↳ ${variant.name || "Variante sin nombre"} ${variantPriceStr}`,
          isProduct: false,
          productId: productIdStr,
          productName: product.name,
          variantId: variant._id,
          variantName: variant.name,
          imageUrl: variantImageUrl,
        })
      })
    })
    return options
  }, [allProducts])

  // --- Fetch Products and Arts (Adopted from CreateDiscount) ---
  const loadItems = useCallback(async () => {
    setIsLoadingItems(true)
    try {
      // Only fetch products
      const productsData = (await fetchProducts()) as unknown as Promise<
        Product[]
      >
      setAllProducts(
        (await productsData).filter(
          (p) => p._id && p.variants && p.variants.length > 0
        )
      )
    } catch (err: any) {
      console.error("Error loading products:", err)
      showSnackBar(err.message || "Error al cargar productos.")
    } finally {
      setIsLoadingItems(false)
    }
  }, [showSnackBar])
  useEffect(() => {
    loadItems()
  }, [loadItems])

  // --- Handlers (Base handlers mostly same as CreateDiscount) ---
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.target as HTMLInputElement
    const { name, value, type } = target
    const checked = target.checked // For checkboxes

    const fieldVal = type === "checkbox" ? checked : value

    setFormData((prevData) => ({
      ...prevData,
      [name]: fieldVal,
    }))

    // Clear specific validation error
    if (
      validationErrors &&
      validationErrors[name as keyof SurchargeValidationErrors]
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null
        const updated = { ...prevErrors }
        delete updated[name as keyof SurchargeValidationErrors]
        // Check if any top-level keys remain besides summary
        const keys = Object.keys(updated).filter((k) => k !== "summary")
        return keys.length > 0 || updated.summary ? updated : null
      })
    }
  }

  const handleSelectChange = (
    event: ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const name = event.target.name as keyof typeof formData
    const value = event.target.value

    setFormData((prev) => ({
      ...prev,
      // Assert value type based on known select fields
      [name]: value as AdjustmentMethod | Entity, // Adjust as necessary for other selects
    }))

    // Clear specific validation error
    if (
      validationErrors &&
      validationErrors[name as keyof SurchargeValidationErrors]
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null
        const updated = { ...prevErrors }
        delete updated[name as keyof SurchargeValidationErrors]
        const keys = Object.keys(updated).filter((k) => k !== "summary")
        return keys.length > 0 || updated.summary ? updated : null
      })
    }
  }

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target
    setFormData((prev) => {
      const newState = { ...prev, [name]: checked }
      if (name === "appliesToAllProducts" && checked) {
        newState.applicableProducts = []
        setSelectedProductVariants([])
      }
      // Removed Arts logic
      return newState
    })
    // Clear validation
    if (
      name === "appliesToAllProducts" &&
      validationErrors?.applicableProducts
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null
        const updated = { ...prevErrors }
        delete updated.applicableProducts
        return Object.keys(updated).length > 0 ? updated : null
      })
    }
  }

  // --- Product/Variant Handler (from CreateDiscount) ---
  const handleProductVariantChange = (
    event: SyntheticEvent,
    newValue: ProductOrVariantOption[]
  ) => {
    setSelectedProductVariants(newValue) // Update visual selection

    const finalApplicableVariants = new Set<string>() // Use set for unique "productId_variantId"

    newValue.forEach((option) => {
      if (option.isProduct) {
        // Expand whole product selection
        const product = allProducts.find(
          (p) => p._id!.toString() === option.productId
        )
        if (product?.variants) {
          product.variants.forEach((variant) => {
            if (variant._id)
              finalApplicableVariants.add(`${product._id}_${variant._id}`)
          })
        }
      } else if (option.variantId) {
        // Add specific variant
        finalApplicableVariants.add(`${option.productId}_${option.variantId}`)
      }
    })

    // Convert Set back to array format for formData
    const newApplicableProducts: [string, string][] = Array.from(
      finalApplicableVariants
    ).map((idPair) => {
      const [prodId, varId] = idPair.split("_")
      return [prodId, varId]
    })

    setFormData((prev) => ({
      ...prev,
      applicableProducts: newApplicableProducts,
    }))

    // Clear validation
    if (validationErrors?.applicableProducts) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null
        const updated = { ...prevErrors }
        delete updated.applicableProducts
        return Object.keys(updated).length > 0 ? updated : null
      })
    }
  }

  // --- Date Picker Handlers ---
  const handleStartDateChange = (newValue: Dayjs | null) => {
    setStartDate(newValue)
    // Clear date-related errors
    if (
      validationErrors?.startDate ||
      validationErrors?.endDate ||
      validationErrors?.dateRange
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null
        const updated = { ...prevErrors }
        delete updated.startDate
        delete updated.endDate
        delete updated.dateRange
        const keys = Object.keys(updated).filter((k) => k !== "summary")
        return keys.length > 0 || updated.summary ? updated : null
      })
    }
  }
  const handleEndDateChange = (newValue: Dayjs | null) => {
    setEndDate(newValue)
    // Clear date-related errors
    if (
      validationErrors?.startDate ||
      validationErrors?.endDate ||
      validationErrors?.dateRange
    ) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null
        const updated = { ...prevErrors }
        delete updated.startDate
        delete updated.endDate
        delete updated.dateRange
        const keys = Object.keys(updated).filter((k) => k !== "summary")
        return keys.length > 0 || updated.summary ? updated : null
      })
    }
  }

  // --- Entity Override Handlers (identical to CreateDiscount) ---
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
    }))
    // Clear general override errors container if present
    if (validationErrors?.entityOverrides) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null
        const updated = { ...prevErrors }
        delete updated.entityOverrides // Remove the container
        const keys = Object.keys(updated).filter((k) => k !== "summary")
        return keys.length > 0 || updated.summary ? updated : null
      })
    }
  }

  const handleOverrideChange = (
    tempId: string,
    field: keyof ApplicableEntity,
    value: string | number | Entity | AdjustmentMethod
  ) => {
    setFormData((prev) => ({
      ...prev,
      entityOverrides: prev.entityOverrides.map((ov: OverrideFormState) =>
        ov.tempId === tempId ? { ...ov, [field]: value } : ov
      ),
    }))
    // Clear validation error for the specific field within the specific override
    if (validationErrors?.entityOverrides) {
      const index = formData.entityOverrides.findIndex(
        (ov: OverrideFormState) => ov.tempId === tempId
      )
      if (index === -1) return

      const errorFieldKey = field as keyof SingleRuleErrors

      if (validationErrors.entityOverrides[index]?.[errorFieldKey]) {
        setValidationErrors((prevErrors) => {
          if (!prevErrors?.entityOverrides?.[index]) return prevErrors // Guard

          const updatedOverrides = { ...prevErrors.entityOverrides }
          const specificOverrideErrors = { ...updatedOverrides[index] }

          delete specificOverrideErrors[errorFieldKey]

          if (Object.keys(specificOverrideErrors).length === 0) {
            delete updatedOverrides[index]
          } else {
            updatedOverrides[index] = specificOverrideErrors
          }

          const finalOverrides =
            Object.keys(updatedOverrides).length > 0
              ? updatedOverrides
              : undefined
          const newErrors = { ...prevErrors, entityOverrides: finalOverrides }
          if (!newErrors.entityOverrides) delete newErrors.entityOverrides // Clean up if empty

          const keys = Object.keys(newErrors).filter((k) => k !== "summary")
          return keys.length > 0 || newErrors.summary ? newErrors : null
        })
      }
    }
  }

  const handleRemoveOverride = (tempIdToRemove: string) => {
    // Find index *before* removing from state
    const indexToRemove = formData.entityOverrides.findIndex(
      (ov: OverrideFormState) => ov.tempId === tempIdToRemove
    )

    setFormData((prev) => ({
      ...prev,
      entityOverrides: prev.entityOverrides.filter(
        (ov: OverrideFormState) => ov.tempId !== tempIdToRemove
      ),
    }))

    // Clear errors related to the removed index and shift subsequent errors
    if (validationErrors?.entityOverrides && indexToRemove !== -1) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors?.entityOverrides) return prevErrors

        const currentOverrideErrors = { ...prevErrors.entityOverrides }
        const updatedOverrideErrors: SurchargeValidationErrors["entityOverrides"] =
          {}
        let errorFound = false

        Object.keys(currentOverrideErrors).forEach((keyIndexStr) => {
          const keyIndex = parseInt(keyIndexStr, 10)
          if (keyIndex === indexToRemove) return // Skip removed

          const newIndex = keyIndex > indexToRemove ? keyIndex - 1 : keyIndex
          updatedOverrideErrors[newIndex] = currentOverrideErrors[keyIndex]
          errorFound = true
        })

        const finalOverrides = errorFound ? updatedOverrideErrors : undefined
        const newErrors = { ...prevErrors, entityOverrides: finalOverrides }
        if (!newErrors.entityOverrides) delete newErrors.entityOverrides // Clean up if empty

        const keys = Object.keys(newErrors).filter((k) => k !== "summary")
        return keys.length > 0 || newErrors.summary ? newErrors : null
      })
    }
  }

  // --- NEW: Recipient Handlers (Similar to Overrides) ---
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
    }))
    // Clear general recipient errors container
    if (validationErrors?.recipients) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null
        const updated = { ...prevErrors }
        delete updated.recipients
        return Object.keys(updated).length > 0 ? updated : null
      })
    }
  }

  const handleRecipientChange = (
    tempId: string,
    field: keyof ApplicableEntity,
    value: string | number | Entity | AdjustmentMethod
  ) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.map((rec: RecipientFormState) =>
        rec.tempId === tempId ? { ...rec, [field]: value } : rec
      ),
    }))
    // Clear validation error for the specific field within the specific recipient
    if (validationErrors?.recipients) {
      const index = formData.recipients.findIndex(
        (rec: RecipientFormState) => rec.tempId === tempId
      )
      if (index === -1) return

      const errorFieldKey = field as keyof SingleRuleErrors // Reuse error type

      if (validationErrors.recipients[index]?.[errorFieldKey]) {
        setValidationErrors((prevErrors) => {
          if (!prevErrors?.recipients?.[index]) return prevErrors // Guard

          const updatedRecipients = { ...prevErrors.recipients }
          const specificRecipientErrors = { ...updatedRecipients[index] }

          delete specificRecipientErrors[errorFieldKey]

          if (Object.keys(specificRecipientErrors).length === 0) {
            delete updatedRecipients[index]
          } else {
            updatedRecipients[index] = specificRecipientErrors
          }

          const finalRecipients =
            Object.keys(updatedRecipients).length > 0
              ? updatedRecipients
              : undefined
          const newErrors = { ...prevErrors, recipients: finalRecipients }
          if (!newErrors.recipients) delete newErrors.recipients // Clean up if empty

          const keys = Object.keys(newErrors).filter((k) => k !== "summary")
          return keys.length > 0 || newErrors.summary ? newErrors : null
        })
      }
    }
  }

  const handleRemoveRecipient = (tempIdToRemove: string) => {
    // Find index *before* removing from state
    const indexToRemove = formData.recipients.findIndex(
      (rec: RecipientFormState) => rec.tempId === tempIdToRemove
    )

    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter(
        (rec: RecipientFormState) => rec.tempId !== tempIdToRemove
      ),
    }))

    // Clear errors related to the removed index and shift subsequent errors
    if (validationErrors?.recipients && indexToRemove !== -1) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors?.recipients) return prevErrors

        const currentRecipientErrors = { ...prevErrors.recipients }
        const updatedRecipientErrors: SurchargeValidationErrors["recipients"] =
          {}
        let errorFound = false

        Object.keys(currentRecipientErrors).forEach((keyIndexStr) => {
          const keyIndex = parseInt(keyIndexStr, 10)
          if (keyIndex === indexToRemove) return // Skip removed

          const newIndex = keyIndex > indexToRemove ? keyIndex - 1 : keyIndex
          updatedRecipientErrors[newIndex] = currentRecipientErrors[keyIndex]
          errorFound = true
        })

        const finalRecipients = errorFound ? updatedRecipientErrors : undefined
        const newErrors = { ...prevErrors, recipients: finalRecipients }
        if (!newErrors.recipients) delete newErrors.recipients // Clean up if empty

        const keys = Object.keys(newErrors).filter((k) => k !== "summary")
        return keys.length > 0 || newErrors.summary ? newErrors : null
      })
    }
  }
  // --- End Recipient Handlers ---

  // --- Accordion Handler (from CreateDiscount) ---
  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false)
    }

  // --- Validation (Adopted from CreateDiscount, adds Recipients) ---
  const validateForm = (): boolean => {
    const errors: SurchargeValidationErrors = {} // Use Surcharge type
    const errorMessages: string[] = [] // For summary

    // Basic field validation
    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio."
      errorMessages.push("Nombre")
    }
    if (!formData.description.trim()) {
      errors.description = "La descripción es obligatoria."
      errorMessages.push("Descripción")
    }

    const defaultValueNum = Number(formData.defaultValue)
    if (isNaN(defaultValueNum)) {
      errors.defaultValue = "El valor base debe ser un número."
      errorMessages.push("Valor Base")
    } else if (
      formData.adjustmentMethod === "percentage" &&
      (defaultValueNum < 0 || defaultValueNum > 1)
    ) {
      errors.defaultValue = "Para porcentaje, el valor debe estar entre 0 y 1."
      errorMessages.push("Valor Base (Porcentaje)")
    } else if (
      formData.adjustmentMethod === "absolute" &&
      defaultValueNum < 0
    ) {
      errors.defaultValue =
        "Para monto absoluto, el valor no puede ser negativo."
      errorMessages.push("Valor Base (Absoluto)")
    }

    // Applicability validation
    if (
      !formData.appliesToAllProducts &&
      formData.applicableProducts?.length === 0
    ) {
      errors.applicableProducts =
        "Seleccione productos/variantes o marque 'Aplica a todos'."
      errorMessages.push("Productos/Variantes")
    }

    // Date Range validation
    if (startDate && endDate && !startDate.isBefore(endDate)) {
      errors.dateRange =
        "La fecha de inicio debe ser anterior a la fecha de fin."
      errors.startDate = " "
      errors.endDate = " "
      errorMessages.push("Rango de Fechas")
    } else if ((startDate && !endDate) || (!startDate && endDate)) {
      errors.dateRange = "Especifique ambas fechas del rango o ninguna."
      if (startDate && !endDate) errors.endDate = " "
      if (!startDate && endDate) errors.startDate = " "
      errorMessages.push("Rango de Fechas (Incompleto)")
    }

    // Entity Overrides Validation
    const overrideErrors: SurchargeValidationErrors["entityOverrides"] = {}
    let hasOverrideError = false
    formData.entityOverrides.forEach((ov, index) => {
      const currentErrors: SingleRuleErrors = {}
      let overrideErrorFields: string[] = []
      if (!ov.type) {
        currentErrors.type = "Requerido"
        overrideErrorFields.push("Tipo Entidad")
      }
      // ID is optional for overrides
      if (!ov.adjustmentMethod) {
        currentErrors.adjustmentMethod = "Requerido"
        overrideErrorFields.push("Método Excep.")
      }

      const customValueNum = Number(ov.customValue)
      if (
        ov.customValue === undefined ||
        ov.customValue === null ||
        isNaN(customValueNum)
      ) {
        currentErrors.customValue = "Valor numérico requerido."
        overrideErrorFields.push("Valor Excepción")
      } else if (
        ov.adjustmentMethod === "percentage" &&
        (customValueNum < 0 || customValueNum > 1)
      ) {
        currentErrors.customValue = "Valor entre 0 y 1."
        overrideErrorFields.push("Valor Excepción (%)")
      } else if (ov.adjustmentMethod === "absolute" && customValueNum < 0) {
        currentErrors.customValue = "Valor no negativo."
        overrideErrorFields.push("Valor Excepción ($)")
      }

      if (Object.keys(currentErrors).length > 0) {
        overrideErrors[index] = currentErrors
        if (!hasOverrideError) {
          errorMessages.push(
            `Excepción #${index + 1} (${overrideErrorFields.join(", ")})`
          )
        } // Add first override error group to summary
        hasOverrideError = true
      }
    })
    if (hasOverrideError) {
      errors.entityOverrides = overrideErrors
    }

    // --- NEW: Recipients Validation ---
    const recipientErrors: SurchargeValidationErrors["recipients"] = {}
    let hasRecipientError = false
    formData.recipients.forEach((rec, index) => {
      const currentErrors: SingleRuleErrors = {} // Reuse same error structure type
      let recipientErrorFields: string[] = []
      if (!rec.type) {
        currentErrors.type = "Requerido"
        recipientErrorFields.push("Tipo Entidad")
      }
      // --- Mandatory ID check for recipients ---
      if (!rec.id?.trim()) {
        currentErrors.id = "ID Requerido"
        recipientErrorFields.push("ID Entidad")
      }
      // --- End Mandatory ID check ---
      if (!rec.adjustmentMethod) {
        currentErrors.adjustmentMethod = "Requerido"
        recipientErrorFields.push("Método Dest.")
      }

      const customValueNum = Number(rec.customValue)
      if (
        rec.customValue === undefined ||
        rec.customValue === null ||
        isNaN(customValueNum)
      ) {
        currentErrors.customValue = "Valor numérico requerido."
        recipientErrorFields.push("Valor Destinatario")
      } else if (
        rec.adjustmentMethod === "percentage" &&
        (customValueNum < 0 || customValueNum > 1)
      ) {
        currentErrors.customValue = "Valor entre 0 y 1."
        recipientErrorFields.push("Valor Destinatario (%)")
      } else if (rec.adjustmentMethod === "absolute" && customValueNum < 0) {
        currentErrors.customValue = "Valor no negativo."
        recipientErrorFields.push("Valor Destinatario ($)")
      }

      if (Object.keys(currentErrors).length > 0) {
        recipientErrors[index] = currentErrors
        if (!hasRecipientError) {
          errorMessages.push(
            `Destinatario #${index + 1} (${recipientErrorFields.join(", ")})`
          )
        } // Add first recipient error group to summary
        hasRecipientError = true
      }
    })
    if (hasRecipientError) {
      errors.recipients = recipientErrors
    }
    // --- End Recipients Validation ---

    // Add summary message if there are errors
    if (errorMessages.length > 0) {
      errors.summary = `Por favor, corrija los errores en los siguientes campos: ${errorMessages.join(", ")}.`
    }

    setValidationErrors(Object.keys(errors).length > 0 ? errors : null)
    if (Object.keys(errors).length > 0) {
      showSnackBar("Por favor, corrija los errores indicados en el formulario.")
    }
    return Object.keys(errors).length === 0
  }
  // --- END Validation Update ---

  // --- Submission (Adds Recipients) ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    // Clean overrides (same logic)
    const finalOverrides: ApplicableEntity[] = formData.entityOverrides.map(
      (override: OverrideFormState) => {
        const { tempId, ...rest } = override
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
        }
        Object.keys(overrideData).forEach((key) => {
          if (overrideData[key as keyof ApplicableEntity] === undefined) {
            delete overrideData[key as keyof ApplicableEntity]
          }
        })
        return overrideData
      }
    )

    // Clean recipients
    const finalRecipients: ApplicableEntity[] = formData.recipients.map(
      (rec: RecipientFormState) => {
        const { tempId, ...rest } = rec
        const recipientData: ApplicableEntity = {
          type: rest.type,
          adjustmentMethod: rest.adjustmentMethod,
          id: rest.id, // Keep ID (mandatory)
          name: rest.name?.trim() || undefined,
          customValue: Number(rest.customValue), // Ensure number
        }
        Object.keys(recipientData).forEach((key) => {
          if (recipientData[key as keyof ApplicableEntity] === undefined)
            delete recipientData[key as keyof ApplicableEntity]
        })
        return recipientData
      }
    )

    // Construct Surcharge payload (REMOVED Arts, uses correct applicableProducts, adds recipients)
    const payload: Omit<Surcharge, "_id"> = {
      name: formData.name,
      description: formData.description,
      active: formData.active,
      adjustmentMethod: formData.adjustmentMethod,
      defaultValue: Number(formData.defaultValue),
      appliesToAllProducts: formData.appliesToAllProducts,
      applicableProducts: formData.appliesToAllProducts
        ? []
        : formData.applicableProducts, // Correct format
      appliestoAllArts: false,
      dateRange:
        startDate && endDate
          ? { start: startDate.toDate(), end: endDate.toDate() }
          : undefined,
      entityOverrides: finalOverrides,
      recipients: finalRecipients, // Add recipients
    }

    try {
      // Use createSurcharge API
      const response = await createSurcharge(payload)
      if (response) {
        showSnackBar(`Recargo "${formData.name}" creado.`)
        navigate("/admin/surcharges/read") // Adjust route
      } else {
        throw new Error("La creación del recargo falló (respuesta vacía).")
      }
    } catch (err: any) {
      console.error("Failed to create surcharge:", err)
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Error al crear el recargo."
      setValidationErrors((prev) => ({
        ...(prev || {}),
        summary: `Error del servidor: ${message}`,
      }))
      showSnackBar(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => navigate("/admin/surcharges/read") // Adjust route

  // --- Render (Adopted from CreateDiscount, adds Recipients section) ---
  return (
    <>
      {/* --- Update Title --- */}
      <Title title="Crear Nuevo Recargo" />
      {/* --- End Title Update --- */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 2 }}>
        {" "}
        {/* Adjusted padding */}
        <form onSubmit={handleSubmit} noValidate>
          {/* --- Error Summary Alert (from CreateDiscount) --- */}
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
            </Grid2>{" "}
            {/* Divider */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <FormControl
                fullWidth
                required
                error={!!validationErrors?.adjustmentMethod}
              >
                <InputLabel id="adjustment-method-label">
                  Método de Ajuste Base
                </InputLabel>
                <Select
                  labelId="adjustment-method-label"
                  name="adjustmentMethod"
                  value={formData.adjustmentMethod}
                  label="Método de Ajuste Base"
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
              </FormControl>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Valor Base" // Added label here
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
              />
            </Grid2>
            {/* --- Accordion Sections --- */}
            <Grid2 size={{ xs: 12 }}>
              {/* Applicability Accordion (Adopted from CreateDiscount) */}
              <Accordion
                expanded={expandedAccordion === "applicability"}
                onChange={handleAccordionChange("applicability")}
                sx={{ "&.Mui-expanded": { margin: "16px 0" } }} // Control margin when expanded
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="applicability-content"
                  id="applicability-header"
                >
                  <Typography variant="h6" component="div">
                    Aplicabilidad Base
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid2 container spacing={2}>
                    {/* Products/Variants Applicability */}
                    <Grid2 size={{ xs: 12 }}>
                      <Box
                        sx={{
                          border: 1,
                          borderColor: (theme) =>
                            validationErrors?.applicableProducts
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
                            value={selectedProductVariants}
                            onChange={handleProductVariantChange}
                            getOptionLabel={(option) => option.label.trim()}
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            groupBy={(option) => option.productName}
                            loading={isLoadingItems}
                            disabled={isSubmitting}
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
                                  isLoadingItems
                                    ? "Cargando..."
                                    : "Seleccionar..."
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

              {/* Date Range Accordion (Adopted from CreateDiscount) */}
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
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
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
                      />
                    </Grid2>
                  </Grid2>
                </AccordionDetails>
              </Accordion>

              {/* Entity Overrides Accordion (Adopted from CreateDiscount) */}
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
                        validationErrors?.entityOverrides?.[index] || {}
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
                                <InputLabel id={`override-type-label-${index}`}>
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
                                      e.target.value as Entity
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
                                label="ID Entidad (Opcional)"
                                name="id"
                                value={override.id || ""}
                                onChange={(e) =>
                                  handleOverrideChange(
                                    override.tempId,
                                    "id",
                                    e.target.value
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
                                      e.target.value as AdjustmentMethod
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
                                label="Valor Excep." // Added label prop
                                name="customValue"
                                type="number"
                                value={override.customValue ?? ""}
                                onChange={(e) =>
                                  handleOverrideChange(
                                    override.tempId,
                                    "customValue",
                                    e.target.value
                                  )
                                }
                                required
                                fullWidth
                                disabled={isSubmitting}
                                error={!!overrideErrors.customValue}
                                helperText={
                                  overrideErrors.customValue ||
                                  (override.adjustmentMethod === "percentage"
                                    ? "Ej: 0.10 para 10%"
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
                      )
                    }
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

              {/* --- NEW: Recipients Accordion Section --- */}
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
                  <Typography variant="h6" component="div">
                    Destinatarios del Recargo (Opcional)
                  </Typography>
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
                  {formData.recipients.map(
                    (recipient: RecipientFormState, index) => {
                      const recipientErrors =
                        validationErrors?.recipients?.[index] || {}
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
                            {/* Type */}
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                              <FormControl
                                fullWidth
                                required
                                error={!!recipientErrors.type}
                              >
                                <InputLabel
                                  id={`recipient-type-label-${index}`}
                                >
                                  Tipo Entidad
                                </InputLabel>
                                <Select
                                  labelId={`recipient-type-label-${index}`}
                                  label="Tipo Entidad" // Added label prop
                                  name="type"
                                  value={recipient.type}
                                  onChange={(e) =>
                                    handleRecipientChange(
                                      recipient.tempId,
                                      "type",
                                      e.target.value as Entity
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
                            {/* ID (Mandatory for Recipient) */}
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                              <TextField
                                label="ID Entidad"
                                name="id"
                                value={recipient.id || ""}
                                onChange={(e) =>
                                  handleRecipientChange(
                                    recipient.tempId,
                                    "id",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                required // Make ID required
                                disabled={isSubmitting}
                                error={!!recipientErrors.id}
                                helperText={
                                  recipientErrors.id ||
                                  "ID del destinatario es obligatorio"
                                }
                              />
                            </Grid2>
                            {/* Method */}
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                              <FormControl
                                fullWidth
                                required
                                error={!!recipientErrors.adjustmentMethod}
                              >
                                <InputLabel
                                  id={`recipient-method-label-${index}`}
                                >
                                  Método Dest.
                                </InputLabel>
                                <Select
                                  labelId={`recipient-method-label-${index}`}
                                  label="Método Dest." // Added label prop
                                  name="adjustmentMethod"
                                  value={recipient.adjustmentMethod}
                                  onChange={(e) =>
                                    handleRecipientChange(
                                      recipient.tempId,
                                      "adjustmentMethod",
                                      e.target.value as AdjustmentMethod
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
                            {/* Value */}
                            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                              <TextField
                                label="Valor Dest." // Added label prop
                                name="customValue"
                                type="number"
                                value={recipient.customValue ?? ""}
                                onChange={(e) =>
                                  handleRecipientChange(
                                    recipient.tempId,
                                    "customValue",
                                    e.target.value
                                  )
                                }
                                required
                                fullWidth
                                disabled={isSubmitting}
                                error={!!recipientErrors.customValue}
                                helperText={
                                  recipientErrors.customValue ||
                                  (recipient.adjustmentMethod === "percentage"
                                    ? "Ej: 0.10 para 10%"
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
                      )
                    }
                  )}
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
              {/* --- End Recipients Section --- */}
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
                  disabled={isSubmitting || isLoadingItems}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {isSubmitting ? "Creando..." : "Crear Recargo"}
                </Button>
                {/* --- End Button Text Update --- */}
              </Stack>
            </Grid2>
          </Grid2>
        </form>
      </Paper>
    </>
  )
}

export default CreateSurcharge // Rename export
