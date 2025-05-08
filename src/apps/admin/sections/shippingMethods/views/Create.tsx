// src/apps/admin/sections/shipping/views/CreateShippingMethod.tsx 
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// Hooks and Context
import { useSnackBar } from 'context/GlobalContext'; 
import { ShippingMethod } from 'types/order.types'; 
import { createShippingMethod } from '@api/order.api'; 

// MUI Components
import {
  Box, Typography, TextField, Button,  Paper, FormControlLabel, Checkbox,
  CircularProgress, Alert, Stack,
  InputAdornment, // Added
  FormHelperText // Potentially needed if TextField helperText isn't enough
} from '@mui/material';
import Title from '@apps/admin/components/Title'; 

// --- Type Definitions ---
// Initial State excluding backend-set fields
const initialFormState: Omit<ShippingMethod, '_id' | 'createdOn' | 'createdBy'> = {
  name: "",
  price: "", // Keep as string for input binding, parse on submit/validate
  active: true,
};

// Validation Errors Type
interface ShippingValidationErrors {
  name?: string;
  price?: string;
}

// --- Component ---
const CreateShippingMethod: React.FC = () => {
  // --- Hooks ---
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Use validationErrors object state instead of single string
  const [validationErrors, setValidationErrors] = useState<ShippingValidationErrors | null>(null);

  // --- Handlers ---
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear validation error for the specific field on change
    if (validationErrors && validationErrors[name as keyof ShippingValidationErrors]) {
      setValidationErrors(prevErrors => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name as keyof ShippingValidationErrors];
        // Return null if no errors remain, otherwise return the updated object
        return Object.keys(updatedErrors).length === 0 ? null : updatedErrors;
      });
    }
  };

  // --- Validation ---
  const validateForm = (): boolean => {
    const errors: ShippingValidationErrors = {};

    if (!formData.name.trim()) {
      errors.name = "El nombre del método es obligatorio.";
    }
    if (!formData.price.trim()) {
      errors.price = "El precio es obligatorio.";
    } else {
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue < 0) {
        errors.price = "El precio debe ser un número válido y no negativo.";
      }
    }

    setValidationErrors(Object.keys(errors).length > 0 ? errors : null);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  // --- Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      showSnackBar("Por favor, corrija los errores indicados.");
      return;
    }

    setIsSubmitting(true);

    // Prepare payload - Convert price to a formatted string (assuming API expects string)
    const payload = {
      ...formData,
      price: parseFloat(formData.price).toFixed(2)
    };

    try {
      console.log("Submitting Shipping Method Data:", payload);
      const response = await createShippingMethod(payload); // API call

      if (response) {
        showSnackBar(`Método de envío "${formData.name}" creado exitosamente.`);
        navigate("/admin/shipping-method/read"); // Navigate back
      } else {
        throw new Error("La creación no devolvió una respuesta esperada.");
      }
    } catch (err: any) {
      console.error("Failed to create shipping method:", err);
      const message = err.message || "Error al crear el método de envío.";
      // Set general error (e.g., on name field) or use a separate general error state 
      setValidationErrors(prev => ({ ...(prev || {}), name: message }));
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    navigate("/admin/shipping-method/read"); // Navigate back
  };

  // --- Render Logic ---
  return (
    <>
      <Title title="Crear Nuevo Método de Envío" />
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        {/* Use noValidate on form tag when using manual validation */}
        <form onSubmit={handleSubmit} noValidate>
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
                type="number" // Change type to number
                value={formData.price} // Keep binding to string state
                onChange={handleInputChange}
                required
                fullWidth
                variant="outlined"
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { // Add inputProps for number type
                    step: "0.01", // Allow cents
                    min: "0"      // Prevent negative via browser validation/steppers
                  }
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
                    onChange={handleInputChange} // Uses generic handler
                    name="active"
                    disabled={isSubmitting}
                  />
                }
                label="Activo"
              />
            </Grid2>

            {/* Action Buttons */}
            <Grid2 size={{ xs: 12 }}>
              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
                <Button type="button" variant="outlined" color="secondary" onClick={handleCancel} disabled={isSubmitting}>Cancelar</Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
                  {isSubmitting ? "Creando..." : "Crear Método"}
                </Button>
              </Stack>
            </Grid2>

            {/* General Submission Error Display (Optional Fallback) */}
            {/* Could show a general API error here if not attached to a specific field */}
            {validationErrors && validationErrors.name?.includes("Error al crear") && (
              <Grid2 size={{ xs: 12 }}><Alert severity="error" sx={{ mt: 2 }}>{validationErrors.name}</Alert></Grid2>
            )}

          </Grid2>
        </form>
      </Paper>
    </>
  );
};

export default CreateShippingMethod;