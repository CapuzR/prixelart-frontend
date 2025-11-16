import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom";

// Hooks and Context
import { useSnackBar } from "@prixpon/context/GlobalContext";
import { ShippingMethod } from "@prixpon/types/order.types";
import { getShippingMethodById, updateShippingMethod } from "@prixpon/api/order.api";

// MUI Components
import {
  Box,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Stack,
  InputAdornment, // Added
} from "@mui/material";
import Title from "@apps/admin/components/Title";
import Grid2 from "@mui/material/Grid";
// --- Type Definitions ---
// Initial State excluding backend-set fields
const initialFormState: Omit<
  ShippingMethod,
  "_id" | "createdOn" | "createdBy"
> = {
  name: "",
  price: "", // Keep as string for input state
  active: true,
};

// Validation Errors Type (same as create)
interface ShippingValidationErrors {
  name?: string;
  price?: string;
}

// --- Component ---
const UpdateShippingMethod: React.FC = () => {
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
    useState<ShippingValidationErrors | null>(null);

  // --- Fetch Data ---
  const fetchMethod = useCallback(async () => {
    if (!id) {
      /* ... error handling ... */ setErrorFetch("ID inválido.");
      setIsLoading(false);
      showSnackBar("ID inválido.");
      navigate("/admin/shipping-method/read");
      return;
    }
    setIsLoading(true);
    setErrorFetch(null);
    setValidationErrors(null);

    try {
      const methodData = (await getShippingMethodById(id)) as ShippingMethod;
      if (!methodData) throw new Error("Método de envío no encontrado.");

      // Populate form state, ensuring price is a string
      setFormData({
        name: methodData.name || "",
        price: String(methodData.price ?? ""), // Ensure price is string for input binding
        active: methodData.active ?? true,
      });
      setOriginalMethodName(methodData.name);
    } catch (err: any) {
      /* ... error handling ... */
      console.error("Failed fetch:", err);
      const message = err.message || "Error al cargar.";
      setErrorFetch(message);
      showSnackBar(message);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, showSnackBar]);

  useEffect(() => {
    fetchMethod();
  }, [fetchMethod]);

  // --- Handlers ---
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear validation error for the specific field on change
    if (
      validationErrors &&
      validationErrors[name as keyof ShippingValidationErrors]
    ) {
      setValidationErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name as keyof ShippingValidationErrors];
        return Object.keys(updatedErrors).length === 0 ? null : updatedErrors;
      });
    }
  };

  // --- Validation (Copied from refactored CreateShippingMethod) ---
  const validateForm = (): boolean => {
    const errors: ShippingValidationErrors = {};
    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio.";
    }
    if (!formData.price.trim()) {
      errors.price = "El precio es obligatorio.";
    } else {
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue < 0) {
        errors.price = "Precio inválido (debe ser >= 0).";
      }
    }
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

    // Prepare payload - only include editable fields, ensure price is number
    const payload: Partial<ShippingMethod> = {
      // Use Partial as we only send editable fields
      name: formData.name,
      active: formData.active,
      // --- Assuming API expects a number for price ---
      // price: parseFloat(formData.price)
      // --- If API expects string formatted to 2 decimals: ---
      price: parseFloat(formData.price).toFixed(2),
    };

    try {
      console.log("Updating Shipping Method Data:", id, payload);
      const response = await updateShippingMethod(id, payload); // Use update API

      if (response) {
        showSnackBar(`Método "${formData.name}" actualizado exitosamente.`);
        navigate("/admin/shipping-method/read");
      } else {
        throw new Error("La actualización no devolvió respuesta.");
      }
    } catch (err: any) {
      console.error("Failed update:", err);
      const message = err.message || "Error al actualizar.";
      // Show general error (e.g., on name field) or use snackbar
      setValidationErrors((prev) => ({ ...(prev || {}), name: message }));
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/shipping-method/read");
  };

  // --- Render Logic ---
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
            <Button onClick={fetchMethod} size="small">
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
            {/* Use noValidate */}
            <Grid2 container spacing={3}>
              {/* Name Input */}
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Nombre del Método"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  variant="outlined"
                  disabled={isSubmitting}
                  error={!!validationErrors?.name} // Use validationErrors state
                  helperText={validationErrors?.name} // Use validationErrors state
                />
              </Grid2>

              {/* Price Input */}
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Precio"
                  name="price"
                  type="number" // Use type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  variant="outlined"
                  disabled={isSubmitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    inputProps: { step: "0.01", min: "0" }, // Add inputProps
                  }}
                  error={!!validationErrors?.price} // Use validationErrors state
                  helperText={validationErrors?.price} // Use validationErrors state
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

export default UpdateShippingMethod;
