import React, { useState, ChangeEvent, FormEvent } from "react"
import { useNavigate } from "react-router-dom"

// Hooks, Types, Context, API
import { useSnackBar } from "context/GlobalContext"
import { PaymentMethod } from "types/order.types"
import { createPaymentMethod } from "@api/order.api"

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
  FormHelperText,
  Grid,
} from "@mui/material"
import Title from "@apps/admin/components/Title"

// --- Type Definitions ---
// Define the initial state structure including optional instructions
const initialFormState: Pick<
  PaymentMethod,
  "name" | "active" | "instructions"
> = {
  name: "",
  active: true, // Default to active
  instructions: "", // Add instructions field
}

// Validation Errors Type
interface PaymentMethodValidationErrors {
  name?: string
  instructions?: string // Add instructions error type
}

// --- Component ---
const CreatePaymentMethod: React.FC = () => {
  // --- Hooks ---
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()

  // --- State ---
  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  // Use validationErrors object state
  const [validationErrors, setValidationErrors] =
    useState<PaymentMethodValidationErrors | null>(null)

  // --- Handlers ---
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.target as HTMLInputElement
    const { name, value, type } = target
    const checked = type === "checkbox" ? target.checked : undefined

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Clear validation error for the specific field on change
    if (
      validationErrors &&
      validationErrors[name as keyof PaymentMethodValidationErrors]
    ) {
      setValidationErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors }
        delete updatedErrors[name as keyof PaymentMethodValidationErrors]
        return Object.keys(updatedErrors).length === 0 ? null : updatedErrors
      })
    }
  }

  // --- Validation ---
  const validateForm = (): boolean => {
    const errors: PaymentMethodValidationErrors = {}

    if (!formData.name.trim()) {
      errors.name = "El nombre del método de pago es obligatorio."
    }
    // Add validation for instructions  (e.g., length limit)
    // if (formData.instructions && formData.instructions.length > 500) {
    //     errors.instructions = "Las instrucciones son demasiado largas (máx 500 caracteres).";
    // }

    setValidationErrors(Object.keys(errors).length > 0 ? errors : null)
    return Object.keys(errors).length === 0
  }

  // --- Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateForm()) {
      showSnackBar("Por favor, corrija los errores indicados.")
      return
    }

    setIsSubmitting(true)

    // Prepare payload including instructions
    const payload: Pick<PaymentMethod, "name" | "active" | "instructions"> = {
      name: formData.name.trim(),
      active: formData.active,
      // Include instructions, send undefined if empty/whitespace only
      instructions: formData.instructions?.trim() || undefined,
    }

    try {
      console.log("Submitting Payment Method Data:", payload)
      const response = await createPaymentMethod(payload as PaymentMethod) // API call, might need cast

      if (response) {
        showSnackBar(`Método de pago "${formData.name}" creado exitosamente.`)
        navigate("/admin/payment-method/read") // Adjust route
      } else {
        throw new Error(
          "La creación del método de pago no devolvió una respuesta esperada."
        )
      }
    } catch (err: any) {
      console.error("Failed to create payment method:", err)
      const message = err.message || "Error al crear el método de pago."
      // Show error related to name field or a general alert
      setValidationErrors((prev) => ({ ...(prev || {}), name: message }))
      showSnackBar(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => navigate("/admin/payment-method/read") // Adjust route

  // --- Render ---
  return (
    <>
      <Title title="Crear Nuevo Método de Pago" />
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit} noValidate>
          {" "}
          {/* Added noValidate */}
          <Grid container spacing={3}>
            {/* Name Input */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Nombre del Método"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                disabled={isSubmitting}
                error={!!validationErrors?.name} // Use validation state
                helperText={validationErrors?.name} // Use validation state
              />
            </Grid>

            {/* Instructions Input */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Instrucciones (Opcional)"
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4} // Adjust rows
                variant="outlined"
                disabled={isSubmitting}
                error={!!validationErrors?.instructions} // Use validation state
                helperText={validationErrors?.instructions} // Use validation state
              />
            </Grid>

            {/* Active Checkbox */}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.active}
                    onChange={handleInputChange}
                    name="active"
                    disabled={isSubmitting}
                  />
                }
                label="Activo"
              />
            </Grid>

            {/* Action Buttons */}
            <Grid size={{ xs: 12 }}>
              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={2}
                sx={{ mt: 2 }}
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
                  {isSubmitting ? "Creando..." : "Crear Método"}
                </Button>
              </Stack>
            </Grid>

            {/* General Submission Error Display (Fallback) */}
            {validationErrors &&
              validationErrors.name &&
              validationErrors.name !==
                "El nombre del método de pago es obligatorio." && (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {validationErrors.name}
                  </Alert>
                </Grid>
              )}
          </Grid>
        </form>
      </Paper>
    </>
  )
}

export default CreatePaymentMethod
