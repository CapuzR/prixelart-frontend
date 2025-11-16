// src/apps/admin/sections/payment/views/UpdatePaymentMethod.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import Grid2 from "@mui/material/Grid";
// Hooks, Types, Context, API
import { useSnackBar } from "@prixpon/context/GlobalContext";
import { PaymentMethod } from "@prixpon/types/order.types";
import { getPaymentMethodById, updatePaymentMethod } from "@prixpon/api/order.api";

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
  FormHelperText, // Added
} from "@mui/material";
import Title from "@apps/admin/components/Title";

// --- Type Definitions ---
// Define the initial state structure including instructions
const initialFormState: Pick<
  PaymentMethod,
  "name" | "active" | "instructions"
> = {
  name: "",
  active: true,
  instructions: "", // Add instructions
};

// Validation Errors Type (same as create)
interface PaymentMethodValidationErrors {
  name?: string;
  instructions?: string;
}

// --- Component ---
const UpdatePaymentMethod: React.FC = () => {
  // --- Hooks ---
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [formData, setFormData] = useState(initialFormState);
  const [originalMethodName, setOriginalMethodName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  // Use validationErrors object state
  const [validationErrors, setValidationErrors] =
    useState<PaymentMethodValidationErrors | null>(null);

  // --- Fetch Data ---
  const loadMethod = useCallback(async () => {
    if (!id) {
      /* ... error handling ... */ setErrorFetch("ID inválido.");
      setIsLoading(false);
      showSnackBar("ID inválido.");
      navigate("/admin/payment-method/read");
      return;
    }
    setIsLoading(true);
    setErrorFetch(null);
    setValidationErrors(null);

    try {
      const methodData = (await getPaymentMethodById(id)) as PaymentMethod;
      if (!methodData) throw new Error("Método de pago no encontrado.");

      // Populate form state including instructions
      setFormData({
        name: methodData.name || "",
        active: methodData.active ?? true,
        instructions: methodData.instructions || "", // Populate instructions
      });
      setOriginalMethodName(methodData.name);
    } catch (err: any) {
      /* ... error handling ... */
      console.error("Failed load:", err);
      const message = err.message || "Error al cargar.";
      setErrorFetch(message);
      showSnackBar(message);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, showSnackBar]);

  useEffect(() => {
    loadMethod();
  }, [loadMethod]);

  // --- Handlers ---
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    // ... Same logic as refactored CreatePaymentMethod ...
    const target = event.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = type === "checkbox" ? target.checked : undefined;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (
      validationErrors &&
      validationErrors[name as keyof PaymentMethodValidationErrors]
    ) {
      setValidationErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name as keyof PaymentMethodValidationErrors];
        return Object.keys(updatedErrors).length === 0 ? null : updatedErrors;
      });
    }
  };

  // --- Validation (Copied from refactored CreatePaymentMethod) ---
  const validateForm = (): boolean => {
    const errors: PaymentMethodValidationErrors = {};
    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio.";
    }
    // Add instructions validation
    // if (formData.instructions && formData.instructions.length > 500) { errors.instructions = "Máx 500 caracteres."; }

    setValidationErrors(Object.keys(errors).length > 0 ? errors : null);
    return Object.keys(errors).length === 0;
  };

  // --- Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !validateForm()) {
      showSnackBar("Por favor, corrija los errores indicados.");
      return;
    }
    setIsSubmitting(true);

    // Prepare payload including only editable fields
    const payload: Pick<PaymentMethod, "name" | "active" | "instructions"> = {
      name: formData.name.trim(),
      active: formData.active,
      instructions: formData.instructions?.trim() || undefined, // Clean and add instructions
    };

    try {
      console.log("Updating Payment Method Data:", id, payload);
      const response = await updatePaymentMethod(
        id,
        payload as Partial<PaymentMethod>,
      ); // Use update API, might need cast

      if (response) {
        showSnackBar(`Método "${formData.name}" actualizado exitosamente.`);
        navigate("/admin/payment-method/read"); // Adjust route
      } else {
        throw new Error("La actualización no devolvió respuesta.");
      }
    } catch (err: any) {
      console.error("Failed update:", err);
      const message = err.message || "Error al actualizar.";
      setValidationErrors((prev) => ({ ...(prev || {}), name: message })); // Show general error on name field
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/admin/payment-method/read"); // Adjust route

  // --- Render ---
  return (
    <>
      <Title
        title={`Actualizar Método: ${originalMethodName || (id ? "Cargando..." : "Inválido")}`}
      />
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        )}
        {errorFetch && !isLoading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorFetch}
            <Button onClick={loadMethod} size="small">
              Reintentar
            </Button>
            <Button onClick={handleCancel} size="small" color="secondary">
              Volver
            </Button>
          </Alert>
        )}
        {!isLoading && !errorFetch && (
          <form onSubmit={handleSubmit} noValidate>
            {" "}
            {/* Added noValidate */}
            <Grid2 container spacing={3}>
              {/* Name Input */}
              <Grid2 size={{ xs: 12 }}>
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
              </Grid2>

              {/* Instructions Input */}
              <Grid2 size={{ xs: 12 }}>
                <TextField
                  label="Instrucciones (Opcional)"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  disabled={isSubmitting}
                  error={!!validationErrors?.instructions} // Use validation state
                  helperText={validationErrors?.instructions} // Use validation state
                />
              </Grid2>

              {/* Active Checkbox */}
              <Grid2 size={{ xs: 12 }}>
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
              </Grid2>

              {/* Action Buttons */}
              <Grid2 size={{ xs: 12 }}>
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
                    disabled={isSubmitting || isLoading}
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

              {/* Fallback Error Display */}
              {validationErrors &&
                validationErrors.name &&
                validationErrors.name !== "El nombre es obligatorio." && (
                  <Grid2 size={{ xs: 12 }}>
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {validationErrors.name}
                    </Alert>
                  </Grid2>
                )}
            </Grid2>
          </form>
        )}
      </Paper>
    </>
  );
};

export default UpdatePaymentMethod;
