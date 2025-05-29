import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// Hooks, Context, Types, API 
import { useSnackBar } from 'context/GlobalContext';
import { Admin } from 'types/admin.types'; // Assuming this path
import { Permissions } from 'types/permissions.types'; // To get Role type  for fetching
import { getRoles, createAdmin /*, checkUsernameExists, checkEmailExists */ } from '@api/admin.api'; // Adjust API functions
import Grid2 from '@mui/material/Grid';
// MUI Components
import {
  Typography, TextField, Button, Paper, FormControlLabel, CircularProgress, Alert, Stack, Switch, IconButton, InputAdornment,
  Autocomplete,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';

import Title from '@apps/admin/components/Title';
import { RolePermissionsDetails } from './ReadRoles';

// Initial state for the form
const initialAdminState: Omit<Admin, '_id' | 'password'> & { password?: string } = { // Exclude _id, handle password separately
  firstname: "",
  lastname: "",
  username: "",
  area: "", // Will hold the selected role name/ID
  phone: "",
  email: "",
  isSeller: false,
  // password field is handled separately with confirmation
};

const CreateAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [formData, setFormData] = useState(initialAdminState);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [roles, setRoles] = useState<Permissions[]>([]);// For role dropdown
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [errorFetchingRoles, setErrorFetchingRoles] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null); // API submission errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({}); // Field validation errors
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [roleToView, setRoleToView] = useState<Permissions | null>(null);

  // --- Fetch Roles for Dropdown ---
  const fetchRoles = useCallback(async () => {
    setIsLoadingRoles(true);
    setErrorFetchingRoles(null);
    try {
      // Assuming getRoles() fetches {_id, area} for all roles
      const fetchedRoles = await getRoles();
      setRoles(fetchedRoles || []);
    } catch (err: any) {
      console.error("Failed to fetch roles:", err);
      setErrorFetchingRoles("No se pudieron cargar los roles disponibles.");
      showSnackBar("Error al cargar roles.");
    } finally {
      setIsLoadingRoles(false);
    }
  }, [showSnackBar]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // --- Input Handlers ---
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error for this field on change
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: '', passwordConfirm: '' })); // Clear both password errors
    }
  };

  const handlePasswordConfirmChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPasswordConfirm(event.target.value);
    if (formErrors.passwordConfirm) {
      setFormErrors(prev => ({ ...prev, passwordConfirm: '' }));
    }
  };

  // --- Password Visibility Toggle ---
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowPasswordConfirm = () => setShowPasswordConfirm((show) => !show);
  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent focus loss
  };

  // --- Handler to open modal ---
  const handleViewSelectedRolePermissions = () => {
    if (!formData.area) return;
    const selectedRole = roles.find(role => role.area === formData.area);
    if (selectedRole) {
      setRoleToView(selectedRole);
      setPermissionModalOpen(true);
    } else {
      showSnackBar("No se encontraron los detalles para el rol seleccionado.");
      console.warn("Could not find role details for selected area:", formData.area);
    }
  };

  // Handler to close modal (Keep as is)
  const handleClosePermissionModal = () => {
    setPermissionModalOpen(false);
    setTimeout(() => setRoleToView(null), 150);
  };

  // --- Validation ---
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'firstname':
      case 'lastname':
      case 'username':
        return value.trim() ? '' : 'Este campo es obligatorio.';
      case 'email':
        if (!value.trim()) return 'El email es obligatorio.';
        // Basic email regex
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Formato de email inválido.';
      case 'phone':
        // Example: Basic validation (optional field?) - Adjust if required
        if (value && !/^\+?[0-9\s\-()]+$/.test(value)) return 'Formato de teléfono inválido.';
        return ''; // Or make required: return value.trim() ? '' : 'Teléfono es obligatorio';
      case 'area':
        return value ? '' : 'Debe seleccionar un rol/área.';
      case 'password':
        if (!value) return 'La contraseña es obligatoria.';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'; // Example rule
        // Add more strength rules if desired
        return '';
      case 'passwordConfirm':
        if (!value) return 'Debe confirmar la contraseña.';
        return password === value ? '' : 'Las contraseñas no coinciden.';
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

    // Validate password fields
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

    setFormErrors(errors);
    return isValid;
  };


  // --- Handle Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorSubmit(null); // Clear previous submission errors

    if (!validateForm()) {
      showSnackBar("Por favor corrija los errores en el formulario.");
      return;
    }

    setIsSubmitting(true);

    const adminData: Omit<Admin, '_id'> = {
      ...formData,
      password: password, // Add the validated password
    };

    try {
      console.log("Creating Admin:", adminData);
      const response = await createAdmin(adminData); // Call your API function

      if (response) { // Adjust based on API response
        showSnackBar(`Administrador "${formData.firstname} ${formData.lastname}" creado exitosamente.`);
        navigate("/admin/admins/read"); // Navigate to admin list on success
      } else {
        throw new Error("La creación del administrador no devolvió una respuesta esperada.");
      }
    } catch (err: any) {
      console.error("Failed to create admin:", err);
      // Extract specific error message (e.g., for duplicate username/email) if API provides it
      const message = err.response?.data?.message || err.message || "Error al crear el administrador.";
      setErrorSubmit(message); // Show API error in Alert
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Cancel ---
  const handleCancel = () => {
    navigate("/admin/admins/read"); // Navigate back to list
  };


  // --- Render Logic ---
  return (
    <>
      <Title title="Crear Nuevo Administrador" />
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 2 }}>
        <form onSubmit={handleSubmit} noValidate>
          <Grid2 container spacing={3}>

            {/* Personal Info */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                name="firstname"
                label="Nombre"
                value={formData.firstname}
                onChange={handleInputChange}
                required
                fullWidth
                disabled={isSubmitting}
                error={!!formErrors.firstname}
                helperText={formErrors.firstname}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                name="lastname"
                label="Apellido"
                value={formData.lastname}
                onChange={handleInputChange}
                required
                fullWidth
                disabled={isSubmitting}
                error={!!formErrors.lastname}
                helperText={formErrors.lastname}
              />
            </Grid2>

            {/* Credentials */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                name="username"
                label="Nombre de Usuario"
                value={formData.username}
                onChange={handleInputChange}
                required
                fullWidth
                disabled={isSubmitting}
                error={!!formErrors.username}
                helperText={formErrors.username || "Este será el nombre para iniciar sesión."}
              // Add onBlur={handleUsernameCheck} for async validation if implemented
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                fullWidth
                disabled={isSubmitting}
                error={!!formErrors.email}
                helperText={formErrors.email}
              // Add onBlur={handleEmailCheck} for async validation if implemented
              />
            </Grid2>

            {/* Contact & Role */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                name="phone"
                label="Teléfono" // Consider label: Teléfono (Opcional)
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                disabled={isSubmitting}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Autocomplete
                  fullWidth
                  options={roles}
                  getOptionLabel={(option) => option.area || ''}
                  value={roles.find(role => role.area === formData.area) || null}
                  onChange={(event, newValue) => {
                    setFormData(prev => ({ ...prev, area: newValue?.area || '' }));
                    if (formErrors.area) { setFormErrors(prev => ({ ...prev, area: '' })); }
                  }}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  disabled={isLoadingRoles || isSubmitting}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rol / Área"
                      required
                      error={!!formErrors.area || !!errorFetchingRoles}
                      helperText={formErrors.area || errorFetchingRoles || (isLoadingRoles ? 'Cargando roles...' : '')}
                    />
                  )}
                  // REMOVED renderOption
                  ListboxProps={{ style: { maxHeight: 250 } }}
                />
                <Tooltip title={formData.area ? `Ver permisos para ${formData.area}` : "Seleccione un rol para ver sus permisos"}>
                  {/* Wrap IconButton in span for Tooltip when disabled */}
                  <span>
                    <IconButton
                      aria-label="Ver permisos del rol seleccionado"
                      onClick={handleViewSelectedRolePermissions} // Use the new handler
                      disabled={!formData.area || isLoadingRoles || isSubmitting} // Disable if no role selected or loading/submitting
                      sx={{ mt: 1 }} // Align button vertically
                    >
                      <InfoOutlinedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Grid2>

            {/* Password Fields */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                name="password"
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                required
                fullWidth
                disabled={isSubmitting}
                error={!!formErrors.password}
                helperText={formErrors.password || "Mínimo 6 caracteres."}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {/* Optional: Add Password Strength Meter Here */}
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                name="passwordConfirm"
                label="Confirmar Contraseña"
                type={showPasswordConfirm ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={handlePasswordConfirmChange}
                required
                fullWidth
                disabled={isSubmitting}
                error={!!formErrors.passwordConfirm}
                helperText={formErrors.passwordConfirm}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowPasswordConfirm}
                        onMouseDown={handleMouseDownPassword} // Reuse same mouse down handler
                        edge="end"
                      >
                        {showPasswordConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid2>

            {/* Seller Status */}
            <Grid2 size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isSeller}
                    onChange={handleSwitchChange}
                    name="isSeller"
                    disabled={isSubmitting}
                  />
                }
                label="Es Vendedor" // Clarify purpose
              />
            </Grid2>


            {/* Submission Error Display */}
            {errorSubmit && (
              <Grid2 size={{ xs: 12 }}>
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errorSubmit}
                </Alert>
              </Grid2>
            )}

            {/* Action Buttons */}
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
                  disabled={isSubmitting || isLoadingRoles} // Disable if roles still loading or submitting
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isSubmitting ? "Creando..." : "Crear Administrador"}
                </Button>
              </Stack>
            </Grid2>
          </Grid2>
        </form>
      </Paper >

      <Dialog open={permissionModalOpen} onClose={handleClosePermissionModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Permisos para Rol: {roleToView?.area || ''}
          <IconButton /* ... close button ... */ >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {roleToView ? (
            <RolePermissionsDetails role={roleToView} />
          ) : (
            <Typography>No se seleccionó ningún rol para ver.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissionModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateAdmin;