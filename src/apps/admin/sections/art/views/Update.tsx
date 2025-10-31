import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom";

// Hooks, Types, Context, API
import { useSnackBar } from "context/GlobalContext";
import { Art } from "types/art.types";
import { User } from "types/user.types";
import { fetchAllPrixers } from "@api/prixer.api";
import { fetchArtByObjectId, updateArt } from "@api/art.api";

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
  Autocomplete,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText, // Added for Selects
} from "@mui/material";
import Title from "@apps/admin/components/Title";
import Grid2 from "@mui/material/Grid";

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
  prixerUsername: "",
  tags: [],
  visible: true,
  status: "Available",
  category: "",
  comission: 0.15,
  exclusive: "false", // Keep as string for Select
  imageUrl: "",
  artLocation: "",
  artType: "",
  points: 0, // Or "" if you prefer for optional number fields
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
  prixer?: string;
  imageUrl?: string;
  artLocation?: string;
  artType?: string;
  category?: string;
  comission?: string;
  exclusive?: string;
  status?: string;
  points?: string;
  tags?: string;
}

// Constants for Select options
const STATUS_OPTIONS = [
  { value: "Available", label: "Disponible" },
  { value: "Pending", label: "Pendiente" },
  { value: "Draft", label: "Borrador" },
  { value: "Sold", label: "Vendido" },
  { value: "Rejected", label: "Rechazado" },
];

const EXCLUSIVE_OPTIONS = [
  { value: "false", label: "No" },
  { value: "true", label: "Sí" },
];

// --- Component ---

const UpdateArt: React.FC = () => {
  // --- Hooks ---
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [formData, setFormData] = useState(initialFormState);
  const [originalArtTitle, setOriginalArtTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] =
    useState<ArtValidationErrors | null>(null); // Updated error state
  const [prixerOptions, setPrixerOptions] = useState<UserOption[]>([]);
  const [selectedPrixer, setSelectedPrixer] = useState<UserOption | null>(null);
  // No need for tagsInput state when using Autocomplete

  // --- Fetch Art Data AND Prixers ---
  const loadData = useCallback(async () => {
    if (!id) {
      /* ... error handling ... */ setErrorFetch("ID inválido.");
      setIsLoading(false);
      showSnackBar("ID inválido.");
      navigate("/admin/art/read");
      return;
    }
    setIsLoading(true);
    setErrorFetch(null);
    setValidationErrors(null);

    try {
      const [artData, fetchedUsers] = await Promise.all([
        fetchArtByObjectId(id) as Promise<Art>,
        fetchAllPrixers() as Promise<User[]>,
      ]);

      if (!artData) throw new Error("Obra de arte no encontrada.");

      // Populate Prixer options
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

      // Populate form data, including new fields and conversions
      setFormData({
        title: artData.title || "",
        description: artData.description || "",
        prixerUsername: artData.prixerUsername || "",
        tags: artData.tags || [],
        visible: artData.visible ?? true,
        status: artData.status || "Available",
        category: artData.category || "",
        comission: artData.comission ?? 0.15,
        // --- Convert boolean/string 'exclusive' from API to string "true"/"false" for Select ---
        exclusive: String(artData.exclusive) === "true" ? "true" : "false",
        // --- Populate new fields ---
        imageUrl: artData.imageUrl || "",
        artLocation: artData.artLocation || "",
        artType: artData.artType || "",
        points: artData.points ?? 0, // Default to 0 if null/undefined
      });
      setOriginalArtTitle(artData.title);

      // Set the initially selected Prixer
      const currentOwner = options.find(
        (opt) => opt.username === artData.prixerUsername,
      );
      setSelectedPrixer(currentOwner || null);
    } catch (err: any) {
      /* ... error handling ... */
      console.error("Failed to load data:", err);
      setErrorFetch(err.message || "Error al cargar.");
      showSnackBar(err.message || "Error al cargar.");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, showSnackBar]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Handlers ---
  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }
    >,
  ) => {
    // ... Same as refactored CreateArt ...
    const target = event.target as any;
    const name = target.name as keyof typeof initialFormState;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (
      validationErrors &&
      validationErrors[name as keyof ArtValidationErrors]
    ) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };

  const handlePrixerChange = (
    event: SyntheticEvent,
    newValue: UserOption | null,
  ) => {
    // ... Same as refactored CreateArt ...
    setSelectedPrixer(newValue);
    setFormData((prev) => ({
      ...prev,
      prixerUsername: newValue ? newValue.username : "",
    }));
    if (validationErrors?.prixer) {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        prixer: undefined,
      }));
    }
  };

  // Handler for Tags Autocomplete
  const handleTagsChange = (event: SyntheticEvent, newValue: string[]) => {
    // ... Same as refactored CreateArt ...
    const uniqueTags = Array.from(
      new Set(newValue.map((tag) => tag.trim()).filter((tag) => tag)),
    );
    setFormData((prev) => ({ ...prev, tags: uniqueTags }));
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
    // else if (!/^https?:\/\/.+\..+/.test(formData.imageUrl))
    //   errors.imageUrl = 'Formato de URL inválido.';

    if (
      isNaN(Number(formData.comission)) ||
      Number(formData.comission) < 10 ||
      Number(formData.comission) > 50
    )
      errors.comission = "La comisión debe ser un número entre 50 y 10.";
    if (!formData.status) errors.status = "El estado es obligatorio.";
    if (!formData.exclusive) errors.exclusive = "Debe indicar si es exclusivo.";

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
    if (!id || !validateForm() || !selectedPrixer?._id) {
      if (!selectedPrixer?._id && !validationErrors?.prixer) {
        setValidationErrors((prev) => ({
          ...prev,
          prixer: "Error interno: ID del Prixer no encontrado.",
        }));
        showSnackBar("Error interno: ID del Prixer no encontrado.");
      }
      return;
    }
    setIsSubmitting(true);

    // Prepare payload including new fields and correct types
    const payload: Partial<Art> = {
      title: formData.title,
      description: formData.description,
      prixerUsername: formData.prixerUsername, // Keep for reference / potentially used by backend
      userId: selectedPrixer._id.toString(), // Send updated user ID if owner changed
      tags: formData.tags,
      visible: formData.visible,
      status: formData.status,
      category: formData.category || undefined, // Send undefined if empty
      comission: Number(formData.comission), // Ensure it's sent as a number
      exclusive: formData.exclusive, // Send string "true"/"false"
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
      console.log("Updating Art Data:", id, payload);
      const response = await updateArt(id, payload);
      if (response) {
        showSnackBar(`Arte "${formData.title}" actualizado exitosamente.`);
        navigate("/admin/art/read");
      } else {
        throw new Error("La actualización no devolvió una respuesta esperada.");
      }
    } catch (err: any) {
      console.error("Failed to update art:", err);
      const message = err.message || "Error al actualizar el arte.";
      setValidationErrors((prev) => ({
        ...prev,
        title: prev?.title || message,
      })); // Show near top
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/admin/art/read");

  // --- Render Logic ---
  return (
    <>
      <Title
        title={`Actualizar Arte: ${originalArtTitle || (id ? "Cargando..." : "Inválido")}`}
      />
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        {/* Loading Indicator */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        )}
        {/* Fetch Error Display */}
        {errorFetch && !isLoading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorFetch}
            <Button onClick={loadData} size="small" sx={{ ml: 1 }}>
              Reintentar
            </Button>
            <Button
              onClick={handleCancel}
              size="small"
              color="secondary"
              sx={{ ml: 1 }}
            >
              Volver
            </Button>
          </Alert>
        )}

        {/* Form Render */}
        {!isLoading && !errorFetch && (
          <form onSubmit={handleSubmit} noValidate>
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
                  id="prixer-owner-select-update"
                  options={prixerOptions}
                  value={selectedPrixer}
                  onChange={handlePrixerChange}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.username === value.username
                  }
                  loading={isLoading}
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
                            {isLoading ? (
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
                {formData.imageUrl && !validationErrors?.imageUrl && (
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
                  label="Tipo de Arte"
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
                  label="Ubicación del Arte"
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
                  label="Comisión (Ej: 10)"
                  name="comission"
                  type="number"
                  value={formData.comission}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  disabled={isSubmitting}
                  inputProps={{ step: "1", min: "10", max: "50" }}
                  //   error={!!validationErrors?.comission}
                  helperText={validationErrors?.comission}
                />
              </Grid2>

              {/* Tags Input (Autocomplete) */}
              <Grid2 size={{ xs: 12 }}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
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
                validationErrors.title &&
                !validationErrors.description /* etc */ &&
                validationErrors.title !== "El título es obligatorio." && (
                  <Grid2 size={{ xs: 12 }}>
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {validationErrors.title}
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

export default UpdateArt;
