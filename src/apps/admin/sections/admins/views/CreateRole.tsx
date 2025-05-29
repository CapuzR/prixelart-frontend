import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

// Hooks and Context 
import { useSnackBar } from "context/GlobalContext";
import { Permissions } from "types/permissions.types";
import { createRole } from "@api/admin.api";

// MUI Components
import {
  Box, Typography, TextField, Button, Paper, FormControlLabel,
  Checkbox, CircularProgress, Divider, FormGroup, Alert, Accordion,
  AccordionSummary, AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Icon for Accordion

import Title from "@apps/admin/components/Title"; // Optional: Use Title component
import { permissionGroups, permissionLabels } from "../roles/roles";
import Grid2 from "@mui/material/Grid";
// Define the initial state structure
const initialPermissionsState: Omit<Permissions, '_id'> = {
  area: "",
  // Initialize all boolean permission keys from constants (ensures all are present)
  ...permissionGroups.flatMap(g => g.items).reduce((acc, item) => {
    acc[item.key] = false;
    return acc;
  }, {} as Record<keyof Omit<Permissions, '_id' | 'area'>, boolean>) // Ensure type safety
};


const CreateRole: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- Local State ---
  const [formData, setFormData] = useState<Omit<Permissions, '_id'>>(initialPermissionsState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null); // For API/general submit errors
  const [nameTouched, setNameTouched] = useState<boolean>(false); // Track if name field was touched
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false); // Control accordions

  // --- Handle Accordion Change ---
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  // --- Handle Individual Checkbox/Input Change ---
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear API error if user starts typing/checking
    if (errorSubmit && errorSubmit !== "El nombre del Área/Rol es obligatorio.") {
      setErrorSubmit(null);
    }
    // Clear name validation error if user types something
    if (name === 'area' && errorSubmit === "El nombre del Área/Rol es obligatorio." && value.trim()) {
      setErrorSubmit(null);
    }
  };

  // --- Handle Name Field Blur ---
  const handleNameBlur = () => {
    setNameTouched(true); // Mark field as touched
  };

  // --- Handle Group Toggle (Select/Deselect All in Group) ---
  const handleGroupToggle = (groupItems: { key: keyof Omit<Permissions, '_id' | 'area'> }[], checked: boolean) => {
    setFormData(prevData => {
      const newData = { ...prevData };
      groupItems.forEach(item => {
        newData[item.key] = checked;
      });
      return newData;
    });
    // Clear API error if user interacts
    if (errorSubmit && errorSubmit !== "El nombre del Área/Rol es obligatorio.") {
      setErrorSubmit(null);
    }
  };

  // --- Form Validation ---
  const validateForm = (): boolean => {
    if (!formData.area.trim()) {
      // Don't set errorSubmit here, rely on nameHasError for TextField display
      return false;
    }
    return true;
  };


  // --- Handle Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameTouched(true); // Ensure field is marked touched on submit attempt

    if (!validateForm()) {
      // Validation failed (name empty), TextField will show error based on nameHasError
      return;
    }

    setIsSubmitting(true);
    setErrorSubmit(null); // Clear previous API errors

    try {
      const response = await createRole(formData);

      // Handle potential variations in API response 
      // Assuming successful creation implies a valid response object
      if (response) {
        showSnackBar(`Área/Rol "${formData.area}" creado exitosamente.`);
        setFormData(initialPermissionsState); // Reset form on success
        navigate("/admin/admins/roles/read");
      } else {
        // This case might indicate a successful call but unexpected empty response
        console.warn("Role creation response was empty or unexpected.");
        // Optionally show a generic success or specific warning
        showSnackBar(`Área/Rol "${formData.area}" creado, pero la respuesta fue inesperada.`);
        setFormData(initialPermissionsState);
        navigate("/admin/admins/roles/read");
        // Or throw an error if an empty response is truly an error condition:
        // throw new Error("La creación del rol no devolvió una respuesta esperada.");
      }

    } catch (err: any) {
      console.error("Failed to create role:", err);
      const message = err.response?.data?.message || err.message || "Error al crear el Área/Rol. Intente nuevamente.";
      setErrorSubmit(message); // Display API error in the Alert
      showSnackBar(message); // Also show transient snackbar
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Cancel ---
  const handleCancel = () => {
    setFormData(initialPermissionsState);
    setErrorSubmit(null);
    setNameTouched(false);
    setExpandedAccordion(false); // Reset accordion state
    navigate("/admin/admins/roles/read");
  };

  // --- Derived State for Validation ---
  // Determine if the name field should display an error
  const nameHasError = nameTouched && !formData.area.trim();

  // --- Render Logic ---
  return (
    <>
      <Title title="Crear Nueva Área/Rol" />
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 2 }}> {/* Responsive padding */}
        <form onSubmit={handleSubmit} noValidate> {/* Added noValidate to rely on controlled validation */}
          <Grid2 container spacing={3}>
            {/* Area Name Input */}
            <Grid2 size={{ xs: 12 }}>
              <TextField
                label="Nombre del Área/Rol"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                onBlur={handleNameBlur} // Validate feedback on blur
                required // Use for semantics and potential browser hints
                fullWidth
                variant="outlined"
                disabled={isSubmitting}
                error={nameHasError} // Control error display
                helperText={nameHasError ? "El nombre del Área/Rol es obligatorio." : ""}
                InputLabelProps={{ shrink: true }} // Keep label shrunk
              />
            </Grid2>

            <Grid2 size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }}><Typography variant="overline">Permisos</Typography></Divider>
            </Grid2>

            {/* Permissions Accordions */}
            {permissionGroups.map((group) => {
              // Determine checked/indeterminate state for the group's master checkbox
              const groupKeys = group.items.map(item => item.key);
              const checkedCount = groupKeys.reduce((count, key) => count + (formData[key] ? 1 : 0), 0);
              const allChecked = groupKeys.length > 0 && checkedCount === groupKeys.length; // Handle empty groups
              const someChecked = checkedCount > 0 && !allChecked;

              return (
                <Grid2 size={{ xs: 12, md: 6, lg: 4 }} key={group.title}>
                  <Accordion
                    square // Use square variant for better fit in grid? Optional.
                    elevation={1} // Lower elevation for nested feel
                    expanded={expandedAccordion === group.title}
                    onChange={handleAccordionChange(group.title)}
                    disabled={isSubmitting}
                    sx={{ '&:before': { display: 'none' } }} // Remove top border duplication
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`${group.title}-content`}
                      id={`${group.title}-header`}
                      sx={{
                        // Better alignment and click handling
                        flexDirection: 'row-reverse', // Icon on left
                        '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                          transform: 'rotate(180deg)',
                        },
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                          marginLeft: 1, // Space between icon and content
                        },
                      }}
                    >
                      {/* Group Toggle Checkbox and Label */}
                      <FormControlLabel
                        onClick={(event) => event.stopPropagation()} // IMPORTANT: Prevent accordion toggle on label/check click
                        onFocus={(event) => event.stopPropagation()} // Prevent focus triggering toggle
                        control={
                          <Checkbox
                            checked={allChecked}
                            indeterminate={someChecked}
                            onChange={(e) => handleGroupToggle(group.items, e.target.checked)}
                            size="small"
                            disabled={isSubmitting || groupKeys.length === 0} // Disable if no items
                          />
                        }
                        // Use Typography for better control over label styling
                        label={<Typography variant="body2" sx={{ fontWeight: 500 }}>{group.title}</Typography>}
                        sx={{ mr: 'auto' }} // Push to the left
                      />
                      {/* Optional: Display count like (3/5) */}
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        {`(${checkedCount}/${groupKeys.length})`}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 1, px: 2 }}>
                      {/* Indent permissions within the group */}
                      <FormGroup sx={{ pl: { xs: 1, sm: 2 } }}>
                        {group.items.map((item) => (
                          <FormControlLabel
                            key={item.key}
                            control={
                              <Checkbox
                                checked={formData[item.key]}
                                onChange={handleInputChange}
                                name={item.key}
                                size="small"
                                disabled={isSubmitting}
                              />
                            }
                            // Use pre-defined label from mapping, fallback to item label
                            label={permissionLabels[item.key] || item.label}
                            // Adjust label style for readability
                            sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                          />
                        ))}
                        {group.items.length === 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ pl: 2, fontStyle: 'italic' }}>
                            (No hay permisos en este grupo)
                          </Typography>
                        )}
                      </FormGroup>
                    </AccordionDetails>
                  </Accordion>
                </Grid2>
              );
            })}

            {/* Submission Error Display (Only shows API errors now) */}
            {errorSubmit && (
              <Grid2 size={{ xs: 12 }}>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errorSubmit}
                </Alert>
              </Grid2>
            )}


            {/* Buttons Section */}
            <Grid2 size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary" // Or theme default
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
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isSubmitting ? "Creando..." : "Crear Área/Rol"}
                </Button>
              </Box>
            </Grid2>
          </Grid2>
        </form>
      </Paper>
    </>
  );
};

export default CreateRole;