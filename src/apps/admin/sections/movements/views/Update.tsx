import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Grid2 from '@mui/material/Grid';
// Hooks, Types, Context, API 
import { useSnackBar } from '@context/UIContext';

// MUI Components
import {
    Box, TextField, Button, Paper,
    CircularProgress, Alert, Stack, Autocomplete, Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import Title from '@apps/admin/components/Title';
import { User } from 'types/user.types';
import { Movement } from 'types/movement.types';
import { getUsers } from '@api/user.api';
import { fetchMovementById, updateMovement } from '@api/movement.api';

type MovementType = 'Depósito' | 'Retiro';

const movementTypeOptions: MovementType[] = ['Depósito', 'Retiro'];

// Initial form state (same as create)
const initialFormState: Pick<Movement, 'description' | 'type' | 'value' | 'destinatary' | 'order'> = {
    description: "", type: "Depósito", value: 0, destinatary: undefined, order: undefined,
};

// Interface for User options (same as create)
interface UserAccountOption extends Pick<User, 'account' | 'username' | 'firstName' | 'lastName' | 'avatar'> {
    label: string;
}


const UpdateMovement: React.FC = () => {
    // --- Hooks ---
    const { id } = useParams<{ id: string }>(); // Get Movement ID
    const navigate = useNavigate();
    const { showSnackBar } = useSnackBar();

    // --- State ---
    const [formData, setFormData] = useState(initialFormState);
    const [originalMovementDesc, setOriginalMovementDesc] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true); // Combined loading
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorFetch, setErrorFetch] = useState<string | null>(null);
    const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
    const [userOptions, setUserOptions] = useState<UserAccountOption[]>([]);
    const [selectedDestinatary, setSelectedDestinatary] = useState<UserAccountOption | null>(null);

    // --- Fetch Movement Data AND Users ---
    const loadData = useCallback(async () => {
        if (!id) {
            setErrorFetch("No se proporcionó ID del movimiento."); setIsLoading(false);
            showSnackBar("ID inválido."); navigate("/admin/movements/read"); return;
        }
        setIsLoading(true); setErrorFetch(null);

        try {
            // Fetch concurrently
            const [movementData, fetchedUsers] = await Promise.all([
                fetchMovementById(id) as Promise<Movement>,
                getUsers() as Promise<User[]> // Fetch users for dropdown
            ]);

            if (!movementData) throw new Error("Movimiento no encontrado.");

            // Populate User options
            const options = fetchedUsers
                .filter(u => u.account && u.username)
                .map(u => ({
                    account: u.account!, username: u.username, firstName: u.firstName, lastName: u.lastName, avatar: u.avatar,
                    label: `${u.firstName} ${u.lastName} (${u.username}) - Cuenta: ${u.account}`
                }));
            setUserOptions(options);

            // Populate form data
            const { _id, date, createdOn, createdBy, item, ...movementFormData } = movementData; // Exclude non-form fields
            setFormData({
                description: movementFormData.description || "",
                type: movementFormData.type || "",
                value: movementFormData.value ?? 0,
                destinatary: movementFormData.destinatary || undefined,
                order: movementFormData.order || undefined,
            });
            setOriginalMovementDesc(movementData.description);

            // Set the initially selected Destinatary
            const currentDestinatary = options.find(opt => opt.account === movementData.destinatary);
            setSelectedDestinatary(currentDestinatary || null);

        } catch (err: any) {
            console.error("Failed to load data:", err);
            setErrorFetch(err.message || "Error al cargar los datos.");
            showSnackBar(err.message || "Error al cargar datos.");
        } finally { setIsLoading(false); }
    }, [id, navigate, showSnackBar]);

    useEffect(() => { loadData(); }, [loadData]);

    // --- Handlers (Same as CreateMovement) ---
    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { /* ... */
        const { name, value } = event.target;
        setFormData((prevData) => ({ ...prevData, [name]: name === 'value' ? Number(value) : value }));
        if (errorSubmit) setErrorSubmit(null);
    };

    // --- Validation (Same as CreateMovement) ---
    const validateForm = (): boolean => {
        setErrorSubmit(null);
        // Only validate description as it's the only required editable field
        if (!formData.description.trim()) {
            const msg = "La descripción es obligatoria.";
            setErrorSubmit(msg);
            showSnackBar(msg);
            return false;
        }
        // Removed checks for type and value
        return true;
    };

    // --- Submission ---
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!id || !validateForm()) return;
        setIsSubmitting(true); setErrorSubmit(null);

        // Prepare payload with ONLY editable fields: description and order
        // NOTE: If 'item' handling were added, include it here too.
        const payload: Partial<Pick<Movement, 'description' | 'order' /* | 'item' */>> = {
            description: formData.description,
            order: formData.order || undefined, // Send undefined/null if empty or handled by backend
            // item: /* logic to include item data if applicable */
        };

        // Exclude non-editable fields (type, value, destinatary) from the update payload
        console.log("Updating Movement Data:", id, payload); // Log the restricted payload

        try {
            const response = await updateMovement(id, payload); // API call with restricted payload
            if (response) {
                showSnackBar(`Movimiento actualizado exitosamente.`);
                navigate("/admin/movements/read");
            } else { throw new Error("La actualización del movimiento no devolvió una respuesta esperada."); }
        } catch (err: any) {
            console.error("Failed to update movement:", err);
            const message = err.message || "Error al actualizar el movimiento.";
            setErrorSubmit(message);
            showSnackBar(message);
        } finally { setIsSubmitting(false); }
    };

    const handleCancel = () => navigate("/admin/movements/read"); // Adjust route

    // --- Render ---
    return (
        <>
            <Title title={`Actualizar Movimiento: ${originalMovementDesc.substring(0, 30)}...`} />
            <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
                {isLoading && (<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>)}
                {errorFetch && !isLoading && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorFetch}
                        <Button onClick={loadData} size="small" sx={{ ml: 1 }}>Reintentar</Button>
                        <Button onClick={handleCancel} size="small" color="secondary" sx={{ ml: 1 }}>Volver</Button>
                    </Alert>
                )}
                {!isLoading && !errorFetch && (
                    <form onSubmit={handleSubmit}>
                        <Grid2 container spacing={3}>
                            {/* Type - Disabled */}
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth required disabled={true}> {/* Always disabled */}
                                    <InputLabel id="movement-type-select-label">Tipo de Movimiento</InputLabel>
                                    <Select<MovementType>
                                        labelId="movement-type-select-label"
                                        id="movement-type-select"
                                        value={formData.type}
                                        label="Tipo de Movimiento"
                                        readOnly
                                    >
                                        {/* Still need options to render the selected value correctly */}
                                        {movementTypeOptions.map((typeOption) => (
                                            <MenuItem key={typeOption} value={typeOption}>
                                                {typeOption}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid2>

                            {/* Value - Disabled */}
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Valor"
                                    name="value"
                                    type="number"
                                    value={formData.value}
                                    required
                                    fullWidth
                                    disabled={true}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                            </Grid2>

                            {/* Description - Editable */}
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
                                    disabled={isSubmitting || isLoading}
                                    error={!!errorSubmit && !formData.description.trim()}
                                />
                            </Grid2>

                            {/* Destinatary - Disabled */}
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <Autocomplete
                                    id="destinatary-user-select-update"
                                    options={userOptions}
                                    value={selectedDestinatary} // Display fetched value
                                    getOptionLabel={(option) => option.label}
                                    isOptionEqualToValue={(option, value) => option.account === value.account}
                                    disabled={true}
                                    readOnly
                                    renderOption={(props, option) => (
                                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                            <Avatar src={option.avatar || undefined} sx={{ width: 24, height: 24, mr: 1 }} />
                                            {option.label}
                                        </Box>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Destinatario (Usuario Opcional)"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <>
                                                        {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid2>

                            {/* Order ID - Editable */}
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="ID de Orden (Opcional)"
                                    name="order"
                                    value={formData.order || ''}
                                    onChange={handleInputChange}
                                    fullWidth
                                    disabled={isSubmitting || isLoading}
                                />
                            </Grid2>

                            {/* Action Buttons (No change needed) */}
                            <Grid2 size={{ xs: 12 }}>
                                <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
                                    <Button type="button" variant="outlined" color="secondary" onClick={handleCancel} disabled={isSubmitting}>Cancelar</Button>
                                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || isLoading} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}>
                                        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                                    </Button>
                                </Stack>
                            </Grid2>

                            {/* Submission Error Display */}
                            {errorSubmit && (
                                <Grid2 size={{ xs: 12 }}>
                                    <Alert severity="error" sx={{ mt: 2 }}>{errorSubmit}</Alert>
                                </Grid2>
                            )}
                        </Grid2>
                    </form>
                )}
            </Paper >
        </>
    );
};

export default UpdateMovement;