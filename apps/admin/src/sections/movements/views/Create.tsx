import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import Grid2 from "@mui/material/Grid";
// Hooks, Types, Context, API
import { useSnackBar } from "@prixpon/context/GlobalContext";

// MUI Components
import {
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Autocomplete,
  Avatar,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import Title from "@apps/admin/components/Title";
import { User } from "@prixpon/types/user.types";
import { Movement } from "@prixpon/types/movement.types";
import { createMovement } from "@prixpon/api/movement.api";
import { getUsers } from "@prixpon/api/user.api";

type MovementType = "Depósito" | "Retiro";

const movementTypeOptions: MovementType[] = ["Depósito", "Retiro"];

const initialFormState: Pick<
  Movement,
  "description" | "type" | "value" | "destinatary" | "order"
> = {
  description: "",
  type: "Depósito", // Default valid type: 'Depósito' or 'Retiro'
  value: 0,
  destinatary: undefined, // Optional account ID string
  order: undefined, // Optional order ID string
};

// Interface for User options in Autocomplete (for destinatary)
interface UserAccountOption
  extends Pick<
    User,
    "account" | "username" | "firstName" | "lastName" | "avatar"
  > {
  label: string; // Display label
}

const CreateMovement: React.FC = () => {
  // --- Hooks ---
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [userOptions, setUserOptions] = useState<UserAccountOption[]>([]);
  const [selectedDestinatary, setSelectedDestinatary] =
    useState<UserAccountOption | null>(null);

  // --- Fetch Users with Accounts ---
  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      // Assuming getUsers fetches all users or has a filter for those with accounts
      const fetchedUsers = (await getUsers()) as User[];
      const options = fetchedUsers
        // Filter users who have an account ID
        .filter((u) => u.account && u.username)
        .map((u) => ({
          account: u.account!, // We know account exists due to filter
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          avatar: u.prixer?.avatar || u.avatar,
          label: `${u.firstName} ${u.lastName} (${u.username}) - Cuenta: ${u.account}`, // Include account in label for clarity
        }));
      setUserOptions(options);
    } catch (err) {
      console.error("Error loading users:", err);
      showSnackBar("Error al cargar la lista de usuarios destinatarios.");
    } finally {
      setIsLoadingUsers(false);
    }
  }, [showSnackBar]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // --- Handlers ---
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "value" ? Number(value) : value, // Convert value to number
    }));
    if (errorSubmit) setErrorSubmit(null);
  };

  const handleTypeChange = (event: SelectChangeEvent<MovementType>) => {
    // <-- Use SelectChangeEvent
    const value = event.target.value as MovementType; // Get selected value
    setFormData((prevData) => ({
      ...prevData,
      type: value, // Update the type field
    }));
    if (errorSubmit) setErrorSubmit(null); // Clear error on valid selection
  };

  // Handle Autocomplete change for Destinatary selection
  const handleDestinataryChange = (
    event: SyntheticEvent,
    newValue: UserAccountOption | null,
  ) => {
    setSelectedDestinatary(newValue);
    setFormData((prev) => ({
      ...prev,
      // Store the selected user's ACCOUNT ID in the destinatary field
      destinatary: newValue ? newValue.account : undefined,
    }));
    if (errorSubmit) setErrorSubmit(null);
  };

  // Basic form validation
  const validateForm = (): boolean => {
    setErrorSubmit(null);
    if (!formData.description.trim()) {
      const msg = "La descripción es obligatoria.";
      setErrorSubmit(msg);
      showSnackBar(msg);
      return false;
    }
    if (!formData.type.trim()) {
      const msg = "El tipo de movimiento es obligatorio.";
      setErrorSubmit(msg);
      showSnackBar(msg);
      return false;
    }
    if (isNaN(formData.value)) {
      const msg = "El valor debe ser un número.";
      setErrorSubmit(msg);
      showSnackBar(msg);
      return false;
    }
    // Destinatary is optional, so no validation needed unless specifically required
    return true;
  };

  // Handle form submission
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorSubmit(null);

    // Construct payload
    // Backend should set date, createdOn, createdBy
    const payload: Partial<Movement> = {
      description: formData.description,
      type: formData.type,
      value: formData.value,
      destinatary: formData.destinatary, // Send the account ID (or undefined)
      order: formData.order || undefined, // Send order ID if provided
    };

    try {
      console.log("Submitting Movement Data:", payload);
      const response = await createMovement(payload); // API call

      if (response) {
        // Adjust check based on API response
        showSnackBar(
          `Movimiento "${formData.description.substring(0, 20)}..." creado exitosamente.`,
        );
        navigate("/admin/movements/read"); // Adjust route
      } else {
        throw new Error(
          "La creación del movimiento no devolvió una respuesta esperada.",
        );
      }
    } catch (err: any) {
      console.error("Failed to create movement:", err);
      const message = err.message || "Error al crear el movimiento.";
      setErrorSubmit(message);
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/movements/read"); // Adjust route
  };

  // --- Render Logic ---
  return (
    <>
      <Title title="Crear Nuevo Movimiento" />
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid2 container spacing={3}>
            {/* Type - Changed to Select Dropdown */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <FormControl
                fullWidth
                required
                error={!!errorSubmit && !formData.type}
                disabled={isSubmitting}
              >
                <InputLabel id="movement-type-select-label">
                  Tipo de Movimiento
                </InputLabel>
                <Select<MovementType> // Specify the type for better type safety
                  labelId="movement-type-select-label"
                  id="movement-type-select"
                  value={formData.type}
                  label="Tipo de Movimiento" // Important for label positioning
                  onChange={handleTypeChange} // Use the dedicated handler
                >
                  {/* Map the options to MenuItems */}
                  {movementTypeOptions.map((typeOption) => (
                    <MenuItem key={typeOption} value={typeOption}>
                      {typeOption}
                    </MenuItem>
                  ))}
                </Select>
                {/* Optional: Add FormHelperText  */}
                {/* <FormHelperText error={!!errorSubmit && !formData.type}>Seleccione Depósito o Retiro</FormHelperText> */}
              </FormControl>
            </Grid2>

            {/* Value (Remains TextField) */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Valor"
                name="value"
                type="number"
                value={formData.value}
                onChange={handleInputChange}
                required
                fullWidth
                disabled={isSubmitting}
                inputProps={{ step: "0.01" }}
                error={!!errorSubmit && isNaN(formData.value)}
              />
            </Grid2>

            {/* Description (Remains TextField) */}
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
                disabled={isSubmitting}
                error={!!errorSubmit && !formData.description.trim()}
              />
            </Grid2>

            {/* Destinatary (Remains Autocomplete) */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                id="destinatary-user-select"
                options={userOptions}
                value={selectedDestinatary}
                onChange={handleDestinataryChange}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) =>
                  option.account === value.account
                }
                loading={isLoadingUsers}
                disabled={isSubmitting}
                renderOption={(props, option) => (
                  <Box
                    component="li"
                    sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                    {...props}
                  >
                    <Avatar
                      src={option.avatar || undefined}
                      sx={{ width: 24, height: 24, mr: 1 }}
                    />
                    {option.label}
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Destinatario (Usuario Opcional)"
                    helperText="Seleccione si el movimiento es para un usuario específico"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingUsers ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid2>

            {/* Order ID (Remains TextField) */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="ID de Orden (Opcional)"
                name="order"
                value={formData.order || ""}
                onChange={handleInputChange}
                fullWidth
                disabled={isSubmitting}
                helperText="Asociar este movimiento a una orden específica"
              />
            </Grid2>

            {/* Action Buttons (Remain the same) */}
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
                  disabled={isSubmitting || isLoadingUsers}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {isSubmitting ? "Creando..." : "Crear Movimiento"}
                </Button>
              </Stack>
            </Grid2>

            {/* Submission Error Display (Remains the same) */}
            {errorSubmit && (
              <Grid2 size={{ xs: 12 }}>
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errorSubmit}
                </Alert>
              </Grid2>
            )}
          </Grid2>
        </form>
      </Paper>
    </>
  );
};

export default CreateMovement;
