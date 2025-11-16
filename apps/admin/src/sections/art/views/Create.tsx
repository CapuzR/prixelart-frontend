// src/apps/admin/sections/art/views/CreateArt.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
} from "react";
import { useNavigate } from "react-router-dom";

// Hooks, Types, Context, API
import { useSnackBar } from "@prixpon/context/GlobalContext";
import { Art } from "@prixpon/types/art.types";
import { createArt } from "@prixpon/api-client/art.api";
import { fetchAllPrixers } from "@prixpon/api-client/prixer.api";
import { User } from "@prixpon/types/user.types";
import Grid2 from "@mui/material/Grid";
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
  Autocomplete, // For Prixer and Tags
  Chip, // For Tags Autocomplete render
  Avatar,
  FormControl, // For Select components
  InputLabel, // For Select components
  Select, // For Select components
  MenuItem, // For Select components
  FormHelperText, // For validation messages
} from "@mui/material";
import Title from "@apps/admin/components/Title";

// Define the initial state structure including new fields
const initialFormState: Pick<
  Art,
  | "title"
  | "description"
  | "prixerUsername"
  | "tags"
  | "visible"
  | "status"
  | "category"
  | "comission"
  | "exclusive"
  | "imageUrl"
  | "artLocation"
  | "artType"
  | "points"
> = {
  title: "",
  description: "",
  prixerUsername: "", // Set via Autocomplete selection logic
  tags: [],
  visible: true,
  status: "Available", // Default status
  category: "",
  comission: 0.15, // Default commission
  exclusive: "false", // Default value as string for Select component
  imageUrl: "", // Added
  artLocation: "", // Added
  artType: "", // Added
  points: 0, // Added (or use "" or undefined if optional and needs distinction)
};

// Interface for User options in Autocomplete
interface UserOption
  extends Pick<User, "_id" | "username" | "firstName" | "lastName" | "avatar"> {
  label: string;
}

// Interface for validation errors
interface ArtValidationErrors {
  title?: string;
  description?: string;
  prixer?: string; // Error for prixer selection itself
  imageUrl?: string;
  artLocation?: string;
  artType?: string;
  category?: string;
  comission?: string;
  exclusive?: string;
  status?: string;
  points?: string;
  tags?: string; // General tag error
}

// --- Define constants for Select options ---
const STATUS_OPTIONS = [
  { value: "Available", label: "Disponible" },
  { value: "Pending", label: "Pendiente" },
  { value: "Draft", label: "Borrador" },
  { value: "Sold", label: "Vendido" }, // Example status
  { value: "Rejected", label: "Rechazado" }, // Example status
];

const EXCLUSIVE_OPTIONS = [
  { value: "false", label: "No" },
  { value: "true", label: "Sí" },
];

const CreateArt: React.FC = () => {
  // --- Hooks ---
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] =
    useState<ArtValidationErrors | null>(null); // Use object for specific errors
  const [isLoadingPrixers, setIsLoadingPrixers] = useState<boolean>(true);
  const [prixerOptions, setPrixerOptions] = useState<UserOption[]>([]);
  const [selectedPrixer, setSelectedPrixer] = useState<UserOption | null>(null);
  // Tag input state is now handled by the Autocomplete component's value prop (formData.tags)

  // --- Fetch Prixers ---
  const loadPrixers = useCallback(async () => {
    /* ... same as before ... */
    setIsLoadingPrixers(true);
    try {
      const fetchedUsers = (await fetchAllPrixers()) as User[];
      const options = fetchedUsers
        .filter((u) => u.username && u._id)
        .map((u) => ({
          _id: u._id,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          avatar: u.avatar,
          label:
            `${u.firstName || ""} ${u.lastName || ""} (${u.username})`.trim(),
        }));
      setPrixerOptions(options);
    } catch (err) {
      console.error("Error loading prixers:", err);
      showSnackBar("Error al cargar Prixers.");
    } finally {
      setIsLoadingPrixers(false);
    }
  }, [showSnackBar]);

  useEffect(() => {
    loadPrixers();
  }, [loadPrixers]);

  // --- Handlers ---
  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }
    >,
  ) => {
    const target = event.target as any; // Need 'any' for Select compatibility
    const name = target.name as keyof typeof initialFormState;
    const value = target.type === "checkbox" ? target.checked : target.value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear validation error for the specific field on change
    if (
      validationErrors &&
      validationErrors[name as keyof ArtValidationErrors]
    ) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined, // Clear the error message
      }));
    }
  };

  const handlePrixerChange = (
    event: SyntheticEvent,
    newValue: UserOption | null,
  ) => {
    setSelectedPrixer(newValue);
    setFormData((prev) => ({
      ...prev,
      prixerUsername: newValue ? newValue.username : "", // Keep username for display/reference
    }));
    // Clear validation error for prixer selection
    if (validationErrors?.prixer) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        prixer: undefined,
      }));
    }
  };

  // Handler for Tags Autocomplete
  const handleTagsChange = (event: SyntheticEvent, newValue: string[]) => {
    // Filter out duplicates and trim whitespace just in case
    const uniqueTags = Array.from(
      new Set(newValue.map((tag) => tag.trim()).filter((tag) => tag)),
    );
    setFormData((prev) => ({ ...prev, tags: uniqueTags }));
    // Clear general tags error
    if (validationErrors?.tags) {
      setValidationErrors((prevErrors) => ({ ...prevErrors, tags: undefined }));
    }
  };

  // --- Validation ---
  const validateForm = (): boolean => {
    const errors: ArtValidationErrors = {};

    if (!formData.title.trim()) errors.title = "El título es obligatorio.";
    if (!formData.description.trim())
      errors.description = "La descripción es obligatoria.";
    if (!selectedPrixer)
      errors.prixer = "Debe seleccionar un Prixer propietario.";
    if (!formData.imageUrl.trim())
      errors.imageUrl = "La URL de la imagen es obligatoria.";
    // Basic URL format check (can be enhanced)
    else if (!/^https?:\/\/.+\..+/.test(formData.imageUrl))
      errors.imageUrl = "Formato de URL inválido.";

    if (
      isNaN(Number(formData.comission)) ||
      Number(formData.comission) < 0 ||
      Number(formData.comission) > 1
    )
      errors.comission = "La comisión debe ser un número entre 0 y 1.";
    if (!formData.status) errors.status = "El estado es obligatorio."; // Should be handled by Select default
    if (!formData.exclusive) errors.exclusive = "Debe indicar si es exclusivo."; // Handled by Select default

    // Optional fields validation (points) - CORRECTED LOGIC
    const pointsValue = formData.points; // Store value to avoid repeating formData.points

    // Check only if a value exists (is not null, undefined, or empty string)
    if (pointsValue !== null && pointsValue !== undefined) {
      // Now, try converting to a number and check validity
      const pointsAsNumber = Number(pointsValue);
      if (isNaN(pointsAsNumber) || pointsAsNumber < 0) {
        errors.points = "Los puntos deben ser un número no negativo.";
      }
    }
    // --- End of corrected points validation ---

    setValidationErrors(Object.keys(errors).length > 0 ? errors : null);
    if (Object.keys(errors).length > 0) {
      showSnackBar("Por favor, corrija los errores indicados.");
    }
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  // --- Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm() || !selectedPrixer?._id) {
      if (!selectedPrixer?._id && !validationErrors?.prixer) {
        // Set error specifically if validation passed but ID is somehow missing
        setValidationErrors((prev) => ({
          ...prev,
          prixer: "Error interno: ID del Prixer no encontrado.",
        }));
        showSnackBar("Error interno: ID del Prixer no encontrado.");
      }
      return; // Stop submission if validation fails or prixer ID missing
    }

    setIsSubmitting(true);

    const payload: Partial<Art> = {
      title: formData.title,
      description: formData.description,
      prixerUsername: formData.prixerUsername, // Keep for reference  by backend/logging
      userId: selectedPrixer._id.toString(), // Use the actual ID from the selected object
      tags: formData.tags,
      visible: formData.visible,
      status: formData.status,
      category: formData.category || undefined, // Send undefined if empty
      comission: Number(formData.comission), // Ensure it's sent as a number
      exclusive: formData.exclusive, // Send as string "true" / "false" as per original code
      imageUrl: formData.imageUrl,
      artLocation: formData.artLocation || undefined, // Send undefined if empty
      artType: formData.artType || undefined, // Send undefined if empty

      // Corrected points assignment: Convert to Number or undefined
      points: (() => {
        const pointsValue = formData.points;
        // Check if it's empty, null, or undefined first
        if (pointsValue === null || pointsValue === undefined) {
          return undefined; // Treat empty/null/undefined as undefined for the payload
        }
        // Try converting to number
        const pointsAsNumber = Number(pointsValue);
        // Return the number only if it's not NaN (validation ensures non-negativity)
        return !isNaN(pointsAsNumber) ? pointsAsNumber : undefined;
      })(), // Immediately invoke the function to get the value
    };

    try {
      console.log("Submitting Art Data:", payload);
      const response = await createArt(payload);
      if (response) {
        navigate("/admin/art/read");
        showSnackBar(`Arte "${formData.title}" creado exitosamente.`);
      } else {
        throw new Error(
          "La creación del arte no devolvió una respuesta esperada.",
        );
      }
    } catch (err: any) {
      console.error("Failed to create art:", err);
      const message = err.message || "Error al crear el arte.";
      // Show general error if specific field error isn't caught by validation
      setValidationErrors((prev) => ({
        ...prev,
        title: prev?.title || message,
      })); // Show near top
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/art/read");
  };

  // --- Render Logic ---
  return (
    <>
      <Title title="Crear Nuevo Arte" />
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit} noValidate>
          {" "}
          {/* Use noValidate with manual validation */}
          <Grid2 container spacing={3}>
            {/* Title */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Título del Arte"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                fullWidth
                disabled={isSubmitting}
                error={!!validationErrors?.title}
                helperText={validationErrors?.title}
              />
            </Grid2>

            {/* Owner (Prixer) Selection */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                id="prixer-owner-select"
                options={prixerOptions}
                value={selectedPrixer}
                onChange={handlePrixerChange}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) =>
                  option.username === value.username
                }
                loading={isLoadingPrixers}
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
                    label="Propietario (Prixer)"
                    required
                    error={!!validationErrors?.prixer}
                    helperText={validationErrors?.prixer}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoadingPrixers ? (
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

            {/* Image URL */}
            <Grid2 size={{ xs: 12 }}>
              <TextField
                label="URL de la Imagen Principal"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                required
                fullWidth
                type="url"
                disabled={isSubmitting}
                error={!!validationErrors?.imageUrl}
                helperText={validationErrors?.imageUrl}
              />
              {/* Image Preview */}
              {formData.imageUrl &&
                !validationErrors?.imageUrl && ( // Only show preview if URL is present and seems valid
                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      maxWidth: 250,
                      maxHeight: 250,
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={formData.imageUrl}
                      alt="Previsualización"
                      style={{
                        display: "block",
                        width: "100%",
                        height: "auto",
                        objectFit: "contain",
                        maxHeight: 230,
                      }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                      onLoad={(e) => (e.currentTarget.style.display = "block")}
                    />
                  </Box>
                )}
            </Grid2>

            {/* Description */}
            <Grid2 size={{ xs: 12 }}>
              <TextField
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                fullWidth
                multiline
                rows={4}
                disabled={isSubmitting}
                error={!!validationErrors?.description}
                helperText={validationErrors?.description}
              />
            </Grid2>

            {/* Art Type & Location */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tipo de Arte (Ej: Fotografía)"
                name="artType"
                value={formData.artType}
                onChange={handleInputChange}
                fullWidth
                disabled={isSubmitting}
                error={!!validationErrors?.artType}
                helperText={validationErrors?.artType}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Ubicación del Arte (Ej: Galería)"
                name="artLocation"
                value={formData.artLocation}
                onChange={handleInputChange}
                fullWidth
                disabled={isSubmitting}
                error={!!validationErrors?.artLocation}
                helperText={validationErrors?.artLocation}
              />
            </Grid2>

            {/* Category */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Categoría"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                fullWidth
                disabled={isSubmitting}
                error={!!validationErrors?.category}
                helperText={validationErrors?.category}
              />
            </Grid2>

            {/* Commission */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Comisión (Ej: 0.15 para 15%)"
                name="comission"
                type="number"
                value={formData.comission}
                onChange={handleInputChange}
                required
                fullWidth
                disabled={isSubmitting}
                inputProps={{ step: "0.01", min: "0", max: "1" }}
                error={!!validationErrors?.comission}
                helperText={validationErrors?.comission}
              />
            </Grid2>

            {/* Tags Input (Using Autocomplete) */}
            <Grid2 size={{ xs: 12 }}>
              <Autocomplete
                multiple
                freeSolo
                options={[]} // No predefined suggestions in this example
                value={formData.tags}
                onChange={handleTagsChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Etiquetas"
                    placeholder="Escriba o pegue etiquetas (presione Enter)"
                    helperText={validationErrors?.tags}
                    error={!!validationErrors?.tags}
                  />
                )}
                disabled={isSubmitting}
              />
            </Grid2>

            {/* Status (Select) */}
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <FormControl
                fullWidth
                required
                error={!!validationErrors?.status}
              >
                <InputLabel id="status-select-label">Estado</InputLabel>
                <Select
                  labelId="status-select-label"
                  label="Estado"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange as any}
                  disabled={isSubmitting}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{validationErrors?.status}</FormHelperText>
              </FormControl>
            </Grid2>

            {/* Exclusive (Select) */}
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <FormControl
                fullWidth
                required
                error={!!validationErrors?.exclusive}
              >
                <InputLabel id="exclusive-select-label">Exclusivo</InputLabel>
                <Select
                  labelId="exclusive-select-label"
                  label="Exclusivo"
                  name="exclusive"
                  value={formData.exclusive}
                  onChange={handleInputChange as any}
                  disabled={isSubmitting}
                >
                  {EXCLUSIVE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{validationErrors?.exclusive}</FormHelperText>
              </FormControl>
            </Grid2>

            {/* Points */}
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Puntos (Opcional)"
                name="points"
                type="number"
                value={formData.points}
                onChange={handleInputChange}
                fullWidth
                disabled={isSubmitting}
                inputProps={{ min: "0" }}
                error={!!validationErrors?.points}
                helperText={validationErrors?.points}
              />
            </Grid2>

            {/* Visible Checkbox */}
            <Grid2
              size={{ xs: 12 }}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.visible}
                    onChange={handleInputChange}
                    name="visible"
                    disabled={isSubmitting}
                  />
                }
                label="Visible en Tienda"
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
                  disabled={isSubmitting || isLoadingPrixers}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {isSubmitting ? "Creando..." : "Crear Arte"}
                </Button>
              </Stack>
            </Grid2>

            {/* General Submission Error Display (if validation passed but API failed) */}
            {validationErrors &&
              !validationErrors.title &&
              !validationErrors.description /* etc */ &&
              validationErrors.prixer?.includes("Error interno") && (
                <Grid2 size={{ xs: 12 }}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {validationErrors.prixer}
                  </Alert>
                </Grid2>
              )}
            {validationErrors &&
              validationErrors.title &&
              validationErrors.title !== "El título es obligatorio." &&
              !validationErrors.description /* etc */ && ( // Crude check for general API error shown near title
                <Grid2 size={{ xs: 12 }}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {validationErrors.title}
                  </Alert>
                </Grid2>
              )}
          </Grid2>
        </form>
      </Paper>
    </>
  );
};

export default CreateArt;
