import React, { useState, ChangeEvent, FormEvent, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// Hooks, Types, Context, API
import { useSnackBar } from 'context/GlobalContext';
import { User } from 'types/user.types'; // Assuming Prixer is also in user.types or imported separately
import { createUser } from '@api/user.api';
import { isAValidEmail, isAValidPassword, isAValidUsername } from 'utils/validations';
import Grid2 from '@mui/material/Grid';
// MUI Components
import {
    Box, Typography, TextField, Button, Paper, FormControlLabel, Checkbox,
    CircularProgress, Alert, Stack, Select, MenuItem, InputLabel, FormControl,
    OutlinedInput, InputAdornment, IconButton, Divider, FormGroup, FormHelperText,
    Autocomplete, // Use for Roles, Specialties, potentially Country
    Chip,
    Link, // For Terms link
    Avatar // For previews
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Title from '@apps/admin/components/Title';

// Date Picker & Dayjs
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs'; // Import Dayjs type
import { Prixer } from 'types/prixer.types';
import { PickerChangeHandlerContext, DateValidationError } from '@mui/x-date-pickers';

// --- Constants and Options ---
// Define Roles - fetch if dynamic
const AVAILABLE_ROLES = ['consumer', 'prixer', 'seller']; // Allow multi-select potentially, but restrict admin creation maybe
const AVAILABLE_GENDERS = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'];
// Define or fetch Specialties
const AVAILABLE_SPECIALTIES = ["Ilustración", "Diseño", "Fotografía", "Artes Plásticas"];

// --- Type Definitions ---
// Define separate structures for validation errors for clarity
interface UserBaseValidationErrors {
    username?: string; firstName?: string; lastName?: string; email?: string; password?: string; confirmPassword?: string; role?: string; active?: string; avatar?: string; phone?: string; country?: string; city?: string; birthdate?: string; gender?: string; address?: string; billingAddress?: string; shippingAddress?: string;
}
interface PrixerValidationErrors {
    specialty?: string; description?: string; instagram?: string; twitter?: string; facebook?: string; phone?: string; avatar?: string;
}
interface UserValidationErrors extends UserBaseValidationErrors {
    prixer?: PrixerValidationErrors; // Nested errors for Prixer part
}

// --- Initial State ---
const initialUserFormState: Partial<User> = { // Use Partial<User> for easier initialization
    username: "", firstName: "", lastName: "", email: "", password: "", active: true, role: ['consumer'], // Default role array
    avatar: "", phone: "", country: "", city: "", birthdate: undefined, gender: "", address: "", billingAddress: "", shippingAddress: "",
    // Social links are duplicated in User and Prixer, decide where they belong primarily
    instagram: "", facebook: "", twitter: "",
};

const initialPrixerFormState: Pick<Prixer, 'specialty' | 'description' | 'instagram' | 'twitter' | 'facebook' | 'phone' | 'avatar'> = {
    specialty: [], description: "", instagram: "", twitter: "", facebook: "", phone: "", avatar: "",
};

// --- Component ---
const CreateUser: React.FC = () => {
    // --- Hooks ---
    const navigate = useNavigate();
    const { showSnackBar } = useSnackBar();

    // --- State ---
    const [userFormData, setUserFormData] = useState<Partial<User>>(initialUserFormState);
    const [prixerFormData, setPrixerFormData] = useState(initialPrixerFormState);
    const [birthdateValue, setBirthdateValue] = useState<Dayjs | null>(null); // State for DatePicker
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<UserValidationErrors | null>(null); // Updated error state

    // Determine if the Prixer role is selected
    const isPrixerRoleSelected = userFormData.role?.includes('prixer');

    // --- Handlers ---

    // Generic handler for most User text/select/checkbox inputs
    const handleUserInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
        const target = event.target as any;
        const name = target.name as keyof User;
        const value = target.type === 'checkbox' ? target.checked : target.value;

        setUserFormData((prevData) => ({ ...prevData, [name]: value, }));

        // Clear validation error for this field
        if (validationErrors && validationErrors[name as keyof UserBaseValidationErrors]) {
            setValidationErrors(prevErrors => { const updated = { ...prevErrors }; delete updated[name as keyof UserBaseValidationErrors]; return Object.keys(updated).length > 0 ? updated : null; });
        }
    };

    // Handler for Role Autocomplete (allows multiple)
    const handleRolesChange = (event: SyntheticEvent, newValue: string[]) => {
        const hadPrixerBefore = userFormData.role?.includes('prixer');
        const hasPrixerNow = newValue.includes('prixer');

        setUserFormData(prev => ({ ...prev, role: newValue }));

        // Reset Prixer form only if the 'prixer' role was just removed
        if (hadPrixerBefore && !hasPrixerNow) {
            setPrixerFormData(initialPrixerFormState);
            // Clear any existing prixer validation errors
            if (validationErrors?.prixer) {
                setValidationErrors(prev => { const updated = { ...prev }; delete updated.prixer; return Object.keys(updated).length > 0 ? updated : null; });
            }
        }
        // Clear general role error
        if (validationErrors?.role) {
            setValidationErrors(prev => { const updated = { ...prev }; delete updated.role; return Object.keys(updated).length > 0 ? updated : null; });
        }
    };


    // Generic handler for Prixer text/checkbox inputs
    const handlePrixerInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = event.target as HTMLInputElement;
        const { name, value, type } = target;
        const checked = target.checked;
        setPrixerFormData((prevData) => ({ ...prevData, [name]: type === "checkbox" ? checked : value, }));
        // Clear specific prixer validation error
        if (validationErrors?.prixer && validationErrors.prixer[name as keyof PrixerValidationErrors]) {
            setValidationErrors(prevErrors => {
                const updatedPrixerErrors = { ...(prevErrors?.prixer || {}) };
                delete updatedPrixerErrors[name as keyof PrixerValidationErrors];
                const updated = { ...prevErrors, prixer: Object.keys(updatedPrixerErrors).length > 0 ? updatedPrixerErrors : undefined };
                if (!updated.prixer) delete updated.prixer; // Clean up prixer key if empty
                return Object.keys(updated).length > 0 ? updated : null;
            });
        }
    };

    // Handler for Specialty Autocomplete
    const handleSpecialtyChange = (event: SyntheticEvent, newValue: string[]) => {
        setPrixerFormData(prev => ({ ...prev, specialty: newValue }));
        if (validationErrors?.prixer?.specialty) {
            setValidationErrors(prevErrors => { const updatedPrixerErrors = { ...(prevErrors?.prixer || {}) }; delete updatedPrixerErrors.specialty; const updated = { ...prevErrors, prixer: Object.keys(updatedPrixerErrors).length > 0 ? updatedPrixerErrors : undefined }; if (!updated.prixer) delete updated.prixer; return Object.keys(updated).length > 0 ? updated : null; });
        }
    };

    // Handler for Date Picker
    const handleBirthdateChange = (newValue: unknown, context: PickerChangeHandlerContext<DateValidationError>) => {

        const dayjsValue = newValue ? dayjs(newValue as Date | Dayjs) : null;

        if (dayjsValue && !dayjsValue.isValid()) {
            console.error("Invalid date received from DatePicker:", newValue);
            setBirthdateValue(null);
        } else {
            setBirthdateValue(dayjsValue);
        }

        if (validationErrors?.birthdate) {
            setValidationErrors(prevErrors => {
                if (!prevErrors) return null;
                const updated = { ...prevErrors };
                delete updated.birthdate;
                return Object.keys(updated).length > 0 ? updated : null;
            });
        }
    };

    // --- Validation ---
    const validateForm = (): boolean => {
        const errors: UserValidationErrors = {};

        // User Validation
        if (!userFormData.username?.trim() && isPrixerRoleSelected) errors.username = "Nombre de usuario obligatorio.";
        else if (userFormData.username && isPrixerRoleSelected && !isAValidUsername(userFormData.username)) errors.username = "Formato inválido (letras, números, guión bajo).";
        if (!userFormData.firstName?.trim()) errors.firstName = "Nombre obligatorio.";
        if (!userFormData.lastName?.trim()) errors.lastName = "Apellido obligatorio.";
        if (!userFormData.role || userFormData.role.length === 0) errors.role = "Seleccione al menos un rol.";
        // Add validation for other User fields if they become required (e.g., phone, address)

        // Prixer Validation (only if role is selected)
        if (userFormData.role?.includes('prixer')) {
            const prixerErrors: PrixerValidationErrors = {};
            if (!prixerFormData.description?.trim()) prixerErrors.description = "Descripción de Prixer obligatoria.";
            if (!prixerFormData.specialty || prixerFormData.specialty.length === 0) prixerErrors.specialty = "Seleccione al menos una especialidad.";
            // Add other required Prixer field validations here (e.g., phone)
            // if (!prixerFormData.phone?.trim()) prixerErrors.phone = "Teléfono de Prixer obligatorio.";

            if (Object.keys(prixerErrors).length > 0) {
                errors.prixer = prixerErrors;
            }
        }

        setValidationErrors(Object.keys(errors).length > 0 ? errors : null);
        if (Object.keys(errors).length > 0) { showSnackBar("Por favor, corrija los errores indicados."); }
        return Object.keys(errors).length === 0;
    };

    // --- Submission ---
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        const payload: User = {
            username: userFormData.username!,
            firstName: userFormData.firstName!,
            lastName: userFormData.lastName!,
            email: userFormData.email!.toLowerCase(),
            active: userFormData.active!,
            role: userFormData.role!,
            // Optional User fields
            avatar: userFormData.avatar?.trim() || undefined,
            phone: userFormData.phone?.trim() || undefined,
            country: userFormData.country?.trim() || undefined,
            city: userFormData.city?.trim() || undefined,
            birthdate: birthdateValue ? birthdateValue.toDate() : undefined, // Convert Dayjs to Date
            gender: userFormData.gender || undefined,
            address: userFormData.address?.trim() || undefined,
            billingAddress: userFormData.billingAddress?.trim() || undefined,
            shippingAddress: userFormData.shippingAddress?.trim() || undefined,
            instagram: userFormData.instagram?.trim() || undefined,
            facebook: userFormData.facebook?.trim() || undefined,
            twitter: userFormData.twitter?.trim() || undefined,
            ci: userFormData.ci?.trim() || undefined,
            account: userFormData.account?.trim() || undefined,
        };

        // Conditionally add Prixer details
        if (payload.role?.includes('prixer')) {
            payload.prixer = {
                // Fields from prixerFormData
                specialty: prixerFormData.specialty,
                description: prixerFormData.description,
                termsAgree: false, // Ensure boolean
                // Optional fields from prixerFormData
                instagram: prixerFormData.instagram?.trim() || undefined,
                twitter: prixerFormData.twitter?.trim() || undefined,
                facebook: prixerFormData.facebook?.trim() || undefined,
                phone: prixerFormData.phone?.trim() || undefined,
                avatar: prixerFormData.avatar?.trim() || undefined,
                // Default status 
                status: true, // Example default
            };
            // Decide if User top-level social/phone should be overridden by Prixer ones if both exist
            // Example: payload.phone = payload.prixer.phone || payload.phone;
        }

        try {
            const response = await createUser(payload);
            if (response.success) { showSnackBar(`Usuario "${payload.firstName}" creado.`); navigate("/admin/users/read"); }
            else { throw new Error("La creación falló."); }
        } catch (err: any) {
            console.error("Failed create:", err); const message = err.response?.data?.message || err.message || "Error al crear."; setValidationErrors(prev => ({ ...(prev || {}), username: (prev?.username || message) })); showSnackBar(message); // Show near username field
        } finally { setIsSubmitting(false); }
    };

    const handleCancel = () => { navigate("/admin/users/read"); };

    // --- Render Logic ---
    return (
        <>
            <Title title="Crear Nuevo Usuario" />
            <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
                <form onSubmit={handleSubmit} noValidate>
                    <Grid2 container spacing={3}>

                        {/* --- User Fields --- */}
                        <Grid2 size={{ xs: 12 }}><Typography variant="h6">Información del Usuario</Typography></Grid2>
                        {isPrixerRoleSelected && ( <Grid2 size={{ xs: 12, sm: 6 }}><TextField label="Nombre de Usuario" name="username" required value={userFormData.username} onChange={handleUserInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.username} helperText={validationErrors?.username || "Solo letras, números y guiones bajos."} /></Grid2>)}
                        <Grid2 size={{ xs: 12, sm: 6 }}><TextField label="Nombre" name="firstName" value={userFormData.firstName} onChange={handleUserInputChange} required fullWidth disabled={isSubmitting} error={!!validationErrors?.firstName} helperText={validationErrors?.firstName} /></Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}><TextField label="Apellido" name="lastName" value={userFormData.lastName} onChange={handleUserInputChange} required fullWidth disabled={isSubmitting} error={!!validationErrors?.lastName} helperText={validationErrors?.lastName} /></Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}><TextField label="Email" name="email" type="email" value={userFormData.email} onChange={handleUserInputChange}  fullWidth disabled={isSubmitting} error={!!validationErrors?.email} helperText={validationErrors?.email} /></Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}><TextField label="Teléfono Usuario" name="phone" value={userFormData.phone} onChange={handleUserInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.phone} helperText={validationErrors?.phone} /></Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                                multiple id="user-roles-select" options={AVAILABLE_ROLES} value={userFormData.role || []} onChange={handleRolesChange} disableCloseOnSelect
                                getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)} // Capitalize
                                renderTags={(value: readonly string[], getTagProps) => value.map((option: string, index: number) => (<Chip label={option.charAt(0).toUpperCase() + option.slice(1)} size="small" {...getTagProps({ index })} />))}
                                renderInput={(params) => (<TextField {...params} label="Rol(es)" required error={!!validationErrors?.role} helperText={validationErrors?.role} />)}
                                disabled={isSubmitting}
                            />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}><FormControlLabel control={<Checkbox checked={userFormData.active} onChange={handleUserInputChange} name="active" disabled={isSubmitting} />} label="Usuario Activo" /></Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}></Grid2> {/* Spacer */}

                        {/* Contact Info */}
                        <Grid2 size={{ xs: 12 }}><Divider sx={{ my: 2 }}><Typography variant="overline">Información Adicional (Opcional)</Typography></Divider></Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}></Grid2> {/* Spacer */}

                        {/* Address Info */}
                        <Grid2 size={{ xs: 12 }}><TextField label="Dirección Principal" name="address" value={userFormData.address} onChange={handleUserInputChange} fullWidth multiline rows={2} disabled={isSubmitting} error={!!validationErrors?.address} helperText={validationErrors?.address} /></Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}><TextField label="Dirección de Facturación" name="billingAddress" value={userFormData.billingAddress} onChange={handleUserInputChange} fullWidth multiline rows={2} disabled={isSubmitting} error={!!validationErrors?.billingAddress} helperText={validationErrors?.billingAddress || "Opcional, si es diferente a la principal"} /></Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}><TextField label="Dirección de Envío" name="shippingAddress" value={userFormData.shippingAddress} onChange={handleUserInputChange} fullWidth multiline rows={2} disabled={isSubmitting} error={!!validationErrors?.shippingAddress} helperText={validationErrors?.shippingAddress || "Opcional, si es diferente a la principal"} /></Grid2>

                        {/* Demographics */}
                        <Grid2 size={{ xs: 12, sm: 4 }}><TextField label="País" name="country" value={userFormData.country} onChange={handleUserInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.country} helperText={validationErrors?.country} /></Grid2>
                        <Grid2 size={{ xs: 12, sm: 4 }}><TextField label="Ciudad" name="city" value={userFormData.city} onChange={handleUserInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.city} helperText={validationErrors?.city} /></Grid2>
                        <Grid2 size={{ xs: 12, sm: 4 }}>
                            <DatePicker label="Fecha de Nacimiento" value={birthdateValue} onChange={handleBirthdateChange} disabled={isSubmitting} slotProps={{ textField: { fullWidth: true, error: !!validationErrors?.birthdate, helperText: validationErrors?.birthdate, } }} />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth error={!!validationErrors?.gender}>
                                <InputLabel>Género</InputLabel>
                                <Select name="gender" value={userFormData.gender} label="Género" onChange={handleUserInputChange as any} disabled={isSubmitting}>
                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                    {AVAILABLE_GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                                </Select>
                                <FormHelperText>{validationErrors?.gender}</FormHelperText>
                            </FormControl>
                        </Grid2>
                        {/* Add CI, Account, Social Links for User  here */}

                        {/* --- Conditional Prixer Fields --- */}
                        {isPrixerRoleSelected && (
                            <Grid2 size={{ xs: 12 }} component={Paper} variant="outlined" sx={{ p: 2, mt: 3, mb: 1 }}>
                                <Grid2 container spacing={3}>
                                    <Grid2 size={{ xs: 12 }}><Typography variant="h6">Detalles del Prixer</Typography></Grid2>
                                    <Grid2 size={{ xs: 12 }}><TextField label="Descripción / Bio" name="description" value={prixerFormData.description} onChange={handlePrixerInputChange} required={isPrixerRoleSelected} fullWidth multiline rows={4} disabled={isSubmitting} error={!!validationErrors?.prixer?.description} helperText={validationErrors?.prixer?.description} /></Grid2>
                                    <Grid2 size={{ xs: 12 }}>
                                        <Autocomplete
                                            multiple id="prixer-specialties" options={AVAILABLE_SPECIALTIES} value={prixerFormData.specialty || []} onChange={handleSpecialtyChange} disableCloseOnSelect freeSolo={false} // Assuming fixed list
                                            getOptionLabel={(option) => option}
                                            renderTags={(value: readonly string[], getTagProps) => value.map((option: string, index: number) => (<Chip label={option} size="small" {...getTagProps({ index })} />))}
                                            renderInput={(params) => (<TextField {...params} label="Especialidades" required={isPrixerRoleSelected} error={!!validationErrors?.prixer?.specialty} helperText={validationErrors?.prixer?.specialty || "Seleccione al menos una"} />)}
                                            disabled={isSubmitting}
                                        />
                                    </Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6 }}><TextField label="Teléfono Prixer" name="phone" value={prixerFormData.phone} onChange={handlePrixerInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.prixer?.phone} helperText={validationErrors?.prixer?.phone} /></Grid2>
                                    <Grid2 size={{ xs: 12, sm: 6 }}><TextField label="URL Avatar Prixer" name="avatar" type="url" value={prixerFormData.avatar} onChange={handlePrixerInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.prixer?.avatar} helperText={validationErrors?.prixer?.avatar} /></Grid2>
                                    {prixerFormData.avatar && !validationErrors?.prixer?.avatar && (<Grid2 size={{ xs: 12 }}><Box sx={{ mt: -2, mb: 1 }}><Avatar src={prixerFormData.avatar} sx={{ width: 60, height: 60 }} /></Box></Grid2>)}
                                    <Grid2 size={{ xs: 12, sm: 4 }}><TextField label="Instagram" name="instagram" value={prixerFormData.instagram} onChange={handlePrixerInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.prixer?.instagram} helperText={validationErrors?.prixer?.instagram} /></Grid2>
                                    <Grid2 size={{ xs: 12, sm: 4 }}><TextField label="Twitter" name="twitter" value={prixerFormData.twitter} onChange={handlePrixerInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.prixer?.twitter} helperText={validationErrors?.prixer?.twitter} /></Grid2>
                                    <Grid2 size={{ xs: 12, sm: 4 }}><TextField label="Facebook" name="facebook" value={prixerFormData.facebook} onChange={handlePrixerInputChange} fullWidth disabled={isSubmitting} error={!!validationErrors?.prixer?.facebook} helperText={validationErrors?.prixer?.facebook} /></Grid2>
                                </Grid2>
                            </Grid2>
                        )}
                        {/* --- End Conditional Prixer Fields --- */}

                        {/* Action Buttons */}
                        <Grid2 size={{ xs: 12 }}>
                            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
                                <Button type="button" variant="outlined" color="secondary" onClick={handleCancel} disabled={isSubmitting}>Cancelar</Button>
                                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
                                    {isSubmitting ? "Creando..." : "Crear Usuario"}
                                </Button>
                            </Stack>
                        </Grid2>

                        {/* General Error Fallback */}
                        {validationErrors && Object.keys(validationErrors).length > 0 && !validationErrors.username && !validationErrors.password /*...etc*/ && (
                            <Grid2 size={{ xs: 12 }}><Alert severity="error" sx={{ mt: 2 }}>Error general al crear usuario. Verifique los campos.</Alert></Grid2>
                        )}

                    </Grid2>
                </form>
            </Paper>
        </>
    );
};

export default CreateUser;
