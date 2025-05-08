// src/apps/admin/sections/admins/views/UpdateAdmin.tsx (Example Path)
import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, MouseEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Hooks, Context, Types, API 
import { useSnackBar } from 'context/GlobalContext';
import { Admin } from 'types/admin.types';
import { Permissions } from 'types/permissions.types';
import { getRoles, getAdminByUsername, updateAdmin /*, checkUsernameExists, checkEmailExists */ } from '@api/admin.api'; // Assuming updateAdmin takes identifier (username or id) and payload

// MUI Components
import {
  Box, Typography, TextField, Button, Paper, FormControlLabel, CircularProgress, Alert, Stack, Switch, IconButton, InputAdornment,
  Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip // For Modal
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // For permissions icon
import CloseIcon from '@mui/icons-material/Close'; // For modal close
import Grid2 from '@mui/material/Grid'
import Title from '@apps/admin/components/Title';
import { RolePermissionsDetails } from './ReadRoles';
// Import the RolePermissionsDetails component (adjust path)

// Define the initial state structure dynamically from constants
const initialFormState: Omit<Admin, '_id' | 'password'> = {
  firstname: "",
  lastname: "",
  username: "",
  area: "",
  phone: "",
  email: "",
  isSeller: false,
  // Password is handled separately for update
};


const UpdateAdmin: React.FC = () => {
  const { username: usernameParam } = useParams<{ username: string }>(); // Get username from URL
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- Local State ---
  const [formData, setFormData] = useState(initialFormState);
  const [password, setPassword] = useState(''); // New password (optional)
  const [passwordConfirm, setPasswordConfirm] = useState(''); // New password confirm
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [roles, setRoles] = useState<Permissions[]>([]); // Store full Permissions objects
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true); // Combined loading state
  const [errorLoad, setErrorLoad] = useState<string | null>(null); // Fetching error

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null); // API submission errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({}); // Field validation errors

  // State for roles permission preview modal
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [roleToView, setRoleToView] = useState<Permissions | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null); // Store the ID  for update


  // --- Fetch Initial Data (Admin + Roles) ---
  const loadInitialData = useCallback(async () => {
    if (!usernameParam) {
      setErrorLoad("No se proporcionó un nombre de usuario de administrador.");
      setIsLoadingData(false);
      return;
    }
    setIsLoadingData(true);
    setErrorLoad(null);
    setErrorSubmit(null);
    try {
      const [fetchedAdmin, fetchedRoles] = await Promise.all([
        getAdminByUsername(usernameParam), // Assuming this returns full Admin object including _id
        getRoles() as Promise<Permissions[]> // Fetch full roles
      ]);

      if (!fetchedAdmin) {
        throw new Error("Administrador no encontrado.");
      }
      if (!fetchedAdmin._id) {
        throw new Error("ID del administrador no encontrado en los datos recibidos.");
      }

      const { _id, password, ...adminDataToSet } = fetchedAdmin; // Exclude password and _id from initial form data

      // Ensure all keys from constants are present
      const completeFormData = { ...initialFormState, ...adminDataToSet };

      setFormData(completeFormData);
      setAdminId(_id.toString()); // Store the admin ID (as string)
      setRoles(fetchedRoles || []);

    } catch (err: any) {
      const message = err.message || "No se pudieron cargar los datos.";
      setErrorLoad(message);
      showSnackBar(message);
      console.error("Error loading data for update:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [usernameParam, showSnackBar]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);


  // --- Input Handlers (Mostly same as Create) ---
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  // Role change via Autocomplete is handled in its onChange prop

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    // Clear password errors if user starts typing
    if (formErrors.password || formErrors.passwordConfirm) {
      setFormErrors(prev => ({ ...prev, password: '', passwordConfirm: '' }));
    }
  };
  const handlePasswordConfirmChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(event.target.value);
    if (formErrors.passwordConfirm) {
      setFormErrors(prev => ({ ...prev, passwordConfirm: '' }));
    }
  };
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowPasswordConfirm = () => setShowPasswordConfirm((show) => !show);
  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => { event.preventDefault(); };


  // --- Roles Permission Modal Handlers ---
  const handleViewSelectedRolePermissions = () => {
    if (!formData.area) return; // Should be disabled, but double-check

    // Find the full role object based on the selected area name
    const selectedRole = roles.find(role => role.area === formData.area);

    if (selectedRole) {
      setRoleToView(selectedRole);
      setPermissionModalOpen(true);
    } else {
      // Should ideally not happen if formData.area is valid
      showSnackBar("No se encontraron los detalles para el rol seleccionado.");
      console.warn("Could not find role details for selected area:", formData.area);
    }
  };

  // --- Handler to close modal (Keep this) ---
  const handleClosePermissionModal = () => {
    setPermissionModalOpen(false);
    setTimeout(() => setRoleToView(null), 150);
  };

  // --- Validation ---
  const validateField = (name: string, value: any): string => {
    switch (name) {
      // Keep existing validations for other fields
      case 'firstname':
      case 'lastname':
      case 'username': // Keep validating username, even if disabled often
        return value.trim() ? '' : 'Este campo es obligatorio.';
      case 'email':
        if (!value.trim()) return 'El email es obligatorio.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Formato de email inválido.';
      case 'phone':
        if (value && !/^\+?[0-9\s\-()]+$/.test(value)) return 'Formato de teléfono inválido.';
        return '';
      case 'area':
        return value ? '' : 'Debe seleccionar un rol/área.';

      // Password validation (conditional for update)
      case 'password':
        if (!value && !passwordConfirm) return ''; // Okay if both are empty (not updating password)
        if (value && value.length < 6) return 'La nueva contraseña debe tener al menos 6 caracteres.';
        // Add more strength rules 
        return '';
      case 'passwordConfirm':
        if (password && !value) return 'Debe confirmar la nueva contraseña.'; // Required if password has value
        if (password && value !== password) return 'Las contraseñas no coinciden.';
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    // Validate formData fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        errors[key] = error;
        isValid = false;
      }
    });

    // Validate password fields (only if password is being changed)
    if (password) { // Only validate password fields if a new password was entered
      const passwordError = validateField('password', password);
      if (passwordError) {
        errors.password = passwordError;
        isValid = false;
      }
      const passwordConfirmError = validateField('passwordConfirm', passwordConfirm);
      if (passwordConfirmError) {
        errors.passwordConfirm = passwordConfirmError;
        isValid = false;
      }
    } else if (passwordConfirm) {
      // If only confirm is filled, mark password as required
      errors.password = 'Ingrese la nueva contraseña.';
      isValid = false;
    }


    setFormErrors(errors);
    return isValid;
  };


  // --- Handle Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorSubmit(null);

    // Use adminId stored in state for the update call
    if (!adminId || !validateForm()) {
      showSnackBar("Por favor corrija los errores en el formulario.");
      return;
    }

    setIsSubmitting(true);

    // Prepare payload - exclude password if it wasn't changed
    const payload: Partial<Admin> = {
      ...formData, // Include all standard fields from formData
    };
    if (password) { // Only add password to payload if a new one was entered
      payload.password = password;
    }

    try {
      console.log("Updating Admin:", adminId, payload);
      // Assuming updateAdmin uses ID now
      const response = await updateAdmin(adminId, payload);

      if (response) {
        showSnackBar(`Administrador '${formData.username}' actualizado correctamente.`);
        navigate("/admin/admins/read");
      } else {
        throw new Error("La actualización del administrador no devolvió una respuesta esperada.");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      const message = err.response?.data?.message || err.message || "Error al actualizar el administrador.";
      setErrorSubmit(message);
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Cancel ---
  const handleCancel = () => {
    navigate("/admin/admins/read");
  };


  // --- Render Logic ---

  if (isLoadingData) {
    return (<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}> <CircularProgress /> <Typography sx={{ ml: 2 }}>Cargando...</Typography> </Box>);
  }

  if (errorLoad) {
    return (<Box sx={{ p: 2 }}> <Title title="Error" /> <Alert severity="error" sx={{ mb: 2 }}> {errorLoad} <Button onClick={loadInitialData} size="small">Reintentar</Button> <Button onClick={handleCancel} size="small">Volver</Button> </Alert> </Box>);
  }

  return (
    <>
      <Title title={`Editar Admin: ${usernameParam}`} />
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 2 }}>
        <form onSubmit={handleSubmit} noValidate>
          <Grid2 container spacing={3}>

            {/* Fields: firstname, lastname, username, email, phone */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField name="firstname" label="Nombre" value={formData.firstname} onChange={handleInputChange} required fullWidth disabled={isSubmitting} error={!!formErrors.firstname} helperText={formErrors.firstname} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField name="lastname" label="Apellido" value={formData.lastname} onChange={handleInputChange} required fullWidth disabled={isSubmitting} error={!!formErrors.lastname} helperText={formErrors.lastname} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField name="username" label="Nombre de Usuario" value={formData.username} onChange={handleInputChange} required fullWidth disabled={true} error={!!formErrors.username} helperText={formErrors.username || "El nombre de usuario no se puede cambiar."} /> {/* Often disabled for update */}
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField name="email" label="Email" type="email" value={formData.email} onChange={handleInputChange} required fullWidth disabled={isSubmitting} error={!!formErrors.email} helperText={formErrors.email} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField name="phone" label="Teléfono" value={formData.phone} onChange={handleInputChange} fullWidth disabled={isSubmitting} error={!!formErrors.phone} helperText={formErrors.phone} />
            </Grid2>

            {/* Role Autocomplete */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Autocomplete
                  fullWidth // Let Autocomplete take available space in Stack
                  options={roles}
                  getOptionLabel={(option) => option.area || ''}
                  value={roles.find(role => role.area === formData.area) || null}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({ ...prev, area: newValue?.area || '' }));
                    if (formErrors.area) { setFormErrors(prev => ({ ...prev, area: '' })); }
                  }}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  disabled={isLoadingData || isSubmitting}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rol / Área"
                      required
                      error={!!formErrors.area || !!errorLoad}
                      helperText={formErrors.area || errorLoad || ''}
                    />
                  )}
                  // REMOVED renderOption customization
                  ListboxProps={{ style: { maxHeight: 250 } }}
                />
                <Tooltip title={formData.area ? `Ver permisos para ${formData.area}` : "Seleccione un rol para ver sus permisos"}>
                  {/* Wrap IconButton in span for Tooltip when disabled */}
                  <span>
                    <IconButton
                      aria-label="Ver permisos del rol seleccionado"
                      onClick={handleViewSelectedRolePermissions}
                      disabled={!formData.area || isLoadingData || isSubmitting} // Disable if no role selected or loading/submitting
                      sx={{ mt: 1 }} // Add margin top to align better with TextField
                    >
                      <InfoOutlinedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Grid2>

            {/* Password Fields (Optional Update) */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                name="password"
                label="Nueva Contraseña (Opcional)" // Make it clear it's optional
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                // Not 'required' for update unless filled
                fullWidth
                disabled={isSubmitting}
                error={!!formErrors.password}
                helperText={formErrors.password || "Dejar en blanco para no cambiar."}
                InputProps={{ endAdornment: (<InputAdornment position="end"> <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" > {showPassword ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment>), }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                name="passwordConfirm"
                label="Confirmar Nueva Contraseña"
                type={showPasswordConfirm ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={handlePasswordConfirmChange}
                // Required only if password field has value
                fullWidth
                disabled={isSubmitting || !password} // Disable if no new password entered
                error={!!formErrors.passwordConfirm}
                helperText={formErrors.passwordConfirm}
                InputProps={{ endAdornment: (<InputAdornment position="end"> <IconButton aria-label="toggle confirm password visibility" onClick={handleClickShowPasswordConfirm} onMouseDown={handleMouseDownPassword} edge="end" > {showPasswordConfirm ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment>), }}
              />
            </Grid2>

            {/* Seller Status */}
            <Grid2 size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={formData.isSeller} onChange={handleSwitchChange} name="isSeller" disabled={isSubmitting} />}
                label="Es Vendedor"
              />
            </Grid2>

            {/* Submission Error Display */}
            {errorSubmit && (
              <Grid2 size={{ xs: 12 }}>
                <Alert severity="error" sx={{ mt: 1 }}> {errorSubmit} </Alert>
              </Grid2>
            )}

            {/* Action Buttons */}
            <Grid2 size={{ xs: 12 }}>
              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
                <Button type="button" variant="outlined" color="secondary" onClick={handleCancel} disabled={isSubmitting} > Cancelar </Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || isLoadingData} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null} > {isSubmitting ? "Guardando..." : "Guardar Cambios"} </Button>
              </Stack>
            </Grid2>
          </Grid2>
        </form>
      </Paper >

      {/* --- Roles Permission Preview Modal --- */}
      < Dialog open={permissionModalOpen} onClose={handleClosePermissionModal} maxWidth="sm" fullWidth >
        <DialogTitle>
          Permisos para Rol: {roleToView?.area || ''}
          <IconButton aria-label="close" onClick={handleClosePermissionModal} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }} > <CloseIcon /> </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {roleToView ? (<RolePermissionsDetails role={roleToView} />) : (<Typography>Cargando permisos...</Typography>)}
        </DialogContent>
        <DialogActions> <Button onClick={handleClosePermissionModal}>Cerrar</Button> </DialogActions>
      </Dialog >
    </>
  );
};

// No Provider wrapper needed anymore
export default UpdateAdmin;