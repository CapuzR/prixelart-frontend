// src/apps/admin/sections/roles/views/UpdateAdminRole.tsx
import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Hooks, Context, Types, API 
import { useSnackBar } from 'context/GlobalContext';
import { Permissions } from 'types/permissions.types';
import { getRoleById, updateRole } from '@api/admin.api';

// MUI Components
import {
  Box, Typography, TextField, Button, Paper, FormControlLabel,
  Checkbox, CircularProgress, Divider, FormGroup, Alert, Stack, Accordion,
  AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Icon for Accordion
import Title from '@apps/admin/components/Title';
import { permissionGroups, permissionLabels } from '../roles/roles';
import Grid2 from '@mui/material/Grid';

// Define the initial state structure dynamically from constants
// This ensures all permission keys are present even before data loads
const initialPermissionsState: Omit<Permissions, '_id'> = {
  area: "",
  ...permissionGroups.flatMap(g => g.items).reduce((acc, item) => {
    acc[item.key] = false;
    return acc;
  }, {} as Record<keyof Omit<Permissions, '_id' | 'area'>, boolean>)
};


const UpdateAdminRole: React.FC = () => {
  // --- Hooks ---
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [formData, setFormData] = useState<Omit<Permissions, '_id'>>(initialPermissionsState);
  const [originalRoleName, setOriginalRoleName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading initial data
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Submitting update
  const [errorFetch, setErrorFetch] = useState<string | null>(null); // Error fetching data
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null); // Error submitting update
  const [nameTouched, setNameTouched] = useState<boolean>(false); // Track if name field was touched
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false); // Control accordions


  // --- Fetch Role Data ---
  const fetchRole = useCallback(async () => {
    if (!id) {
      setErrorFetch("No se proporcionó ID del rol.");
      setIsLoading(false);
      showSnackBar("ID de rol inválido.");
      navigate("/admin/admins/roles/read");
      return;
    }

    setIsLoading(true);
    setErrorFetch(null);
    setErrorSubmit(null); // Clear submit errors from previous attempts if refetching
    try {
      const roleData = await getRoleById(id) as Permissions;
      if (roleData) {
        const { _id, ...roleFormData } = roleData;
        // IMPORTANT: Ensure all keys from constants are present in the state
        // Merge fetched data with the initial state structure
        const completeFormData = { ...initialPermissionsState, ...roleFormData };
        setFormData(completeFormData);
        setOriginalRoleName(roleData.area);
      } else {
        throw new Error("Rol no encontrado.");
      }
    } catch (err: any) {
      console.error("Failed to fetch role:", err);
      const message = err.message || "Error al cargar los datos del rol.";
      setErrorFetch(message);
      showSnackBar(message);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, showSnackBar]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]); // fetchRole dependency includes 'id'


  // --- Handlers ---

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear API error if user starts editing
    if (errorSubmit && errorSubmit !== "El nombre del Área/Rol es obligatorio.") {
      setErrorSubmit(null);
    }
    // Clear name validation error if user types something valid
    if (name === 'area' && errorSubmit === "El nombre del Área/Rol es obligatorio." && value.trim()) {
      setErrorSubmit(null);
    }
  };

  const handleNameBlur = () => {
    setNameTouched(true);
  };

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
    setNameTouched(true); // Mark as touched on submit attempt

    if (!id || !validateForm()) {
      return; // Stop if validation fails or ID is missing
    }

    setIsSubmitting(true);
    setErrorSubmit(null); // Clear previous API errors

    try {
      console.log("Updating Role Data:", id, formData);
      const response = await updateRole(id, formData);

      if (response) {
        showSnackBar(`Área/Rol "${formData.area}" actualizado exitosamente.`);
        navigate("/admin/admins/roles/read");
      } else {
        throw new Error("La actualización del rol no devolvió una respuesta esperada.");
      }
    } catch (err: any) {
      console.error("Failed to update role:", err);
      const message = err.response?.data?.message || err.message || "Error al actualizar el Área/Rol.";
      setErrorSubmit(message); // Display API error in the Alert
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Cancel ---
  const handleCancel = () => {
    navigate("/admin/admins/roles/read");
  };

  // --- Derived State for Validation ---
  const nameHasError = nameTouched && !formData.area.trim();

  // --- Render Logic ---

  // Loading State
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3, minHeight: '200px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando datos del rol...</Typography>
      </Box>
    );
  }

  // Fetch Error State
  if (errorFetch) {
    return (
      <Box sx={{ p: 2 }}>
        <Title title="Error al Cargar Rol" />
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorFetch}
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button onClick={fetchRole} size="small" variant="outlined">Reintentar</Button>
            <Button onClick={handleCancel} size="small" color="secondary">Volver a la lista</Button>
          </Stack>
        </Alert>
      </Box>
    );
  }

  // Main Form Render
  return (
    <>
      <Title title={`Actualizar Rol: ${originalRoleName}`} />
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 2 }}>
        <form onSubmit={handleSubmit} noValidate>
          <Grid2 container spacing={3}>
            {/* Area Name Input */}
            <Grid2 size={{ xs: 12 }}>
              <TextField
                label="Nombre del Área/Rol"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                onBlur={handleNameBlur}
                required
                fullWidth
                variant="outlined"
                disabled={isSubmitting} // Only disable during submit, not initial load
                error={nameHasError}
                helperText={nameHasError ? "El nombre del Área/Rol es obligatorio." : ""}
                InputLabelProps={{ shrink: true }}
              />
            </Grid2>

            <Grid2 size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }}><Typography variant="overline">Permisos</Typography></Divider>
            </Grid2>

            {/* Permissions Accordions */}
            {permissionGroups.map((group) => {
              const groupKeys = group.items.map(item => item.key);
              const checkedCount = groupKeys.reduce((count, key) => count + (formData[key] ? 1 : 0), 0);
              const allChecked = groupKeys.length > 0 && checkedCount === groupKeys.length;
              const someChecked = checkedCount > 0 && !allChecked;

              return (
                <Grid2 size={{ xs: 12, md: 6, lg: 4 }} key={group.title}>
                  <Accordion
                    square
                    elevation={1}
                    expanded={expandedAccordion === group.title}
                    onChange={handleAccordionChange(group.title)}
                    // Disable accordion during initial load AND submission
                    disabled={isLoading || isSubmitting}
                    sx={{ '&:before': { display: 'none' } }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`${group.title}-content`}
                      id={`${group.title}-header`}
                      sx={{
                        flexDirection: 'row-reverse',
                        '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                          transform: 'rotate(180deg)',
                        },
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                          marginLeft: 1,
                        },
                      }}
                    >
                      <FormControlLabel
                        onClick={(event) => event.stopPropagation()}
                        onFocus={(event) => event.stopPropagation()}
                        control={
                          <Checkbox
                            checked={allChecked}
                            indeterminate={someChecked}
                            onChange={(e) => handleGroupToggle(group.items, e.target.checked)}
                            size="small"
                            // Disable checkbox during initial load/submit or if group is empty
                            disabled={isLoading || isSubmitting || groupKeys.length === 0}
                          />
                        }
                        label={<Typography variant="body2" sx={{ fontWeight: 500 }}>{group.title}</Typography>}
                        sx={{ mr: 'auto' }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        {`(${checkedCount}/${groupKeys.length})`}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 1, px: 2 }}>
                      <FormGroup sx={{ pl: { xs: 1, sm: 2 } }}>
                        {group.items.map((item) => (
                          <FormControlLabel
                            key={item.key}
                            control={
                              <Checkbox
                                // Use `?? false` as safe fallback for checked prop
                                checked={formData[item.key] ?? false}
                                onChange={handleInputChange}
                                name={item.key}
                                size="small"
                                // Disable checkbox during initial load AND submission
                                disabled={isLoading || isSubmitting}
                              />
                            }
                            label={permissionLabels[item.key] || item.label}
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
              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
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
                  disabled={isSubmitting || isLoading} // Disable if loading data OR submitting
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </Stack>
            </Grid2>
          </Grid2>
        </form>
      </Paper >
    </>
  );
};

export default UpdateAdminRole;