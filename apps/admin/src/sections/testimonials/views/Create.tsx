import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

// Hooks and Context
import { useSnackBar } from "@prixpon/context/GlobalContext";
import { Testimonial } from "@prixpon/types/testimonial.types";
import { createTestimonial, readAllTestimonial } from "@prixpon/api/testimonial.api";
import Grid2 from "@mui/material/Grid";
// MUI Components
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Stack, // For button layout
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import Title from "@apps/admin/components/Title";

// Define the initial state structure for the form
// Omitting _id, createdOn, createdBy (assuming backend handles these)
const initialFormState: Omit<Testimonial, "_id"> = {
  name: "",
  type: "", // E.g., 'Customer', 'Partner' - consider making this a select if types are fixed
  value: "", // The testimonial text itself
  avatar: "", // URL or identifier for the avatar image
  footer: "", // Optional footer text
  position: 1, // Default to position 1, will be adjusted based on fetched data
  status: true, // Default to active
};

// Interface for position options in the dropdown
interface PositionOption {
  value: number;
  label: string;
  name?: string; // Name of the testimonial it will be placed after
}

const CreateTestimonial: React.FC = () => {
  // --- Hooks ---
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [isLoadingPositions, setIsLoadingPositions] = useState<boolean>(true);
  const [positionOptions, setPositionOptions] = useState<PositionOption[]>([]);

  // --- Fetch existing testimonials to determine positions ---
  const loadPositionOptions = useCallback(async () => {
    setIsLoadingPositions(true);
    try {
      // Fetch only necessary fields (_id, name, position) and sort by position
      const existingTestimonials = (
        (await readAllTestimonial()) as Testimonial[]
      )
        .filter((t) => t._id && t.position) // Ensure required fields exist
        .sort((a, b) => a.position - b.position);

      const options: PositionOption[] = [
        { value: 1, label: "Al Inicio (Posición 1)" },
      ];

      existingTestimonials.forEach((t, index) => {
        // Add option to place *after* this testimonial
        options.push({
          value: t.position + 1, // Position will be one greater than the current item
          label: `Después de "${t.name}" (Posición ${t.position + 1})`,
          name: t.name, // Store name for reference
        });
      });

      // Ensure positions are unique and sequential in the options
      const uniqueOptions = options
        .reduce((acc, current) => {
          if (!acc.some((item) => item.value === current.value)) {
            acc.push(current);
          }
          return acc;
        }, [] as PositionOption[])
        .sort((a, b) => a.value - b.value);

      setPositionOptions(uniqueOptions);

      // Set default position to be at the end if testimonials exist
      if (existingTestimonials.length > 0) {
        // Find the highest current position + 1
        const lastPosition =
          Math.max(...existingTestimonials.map((t) => t.position), 0) + 1;
        setFormData((prev) => ({ ...prev, position: lastPosition }));
      } else {
        setFormData((prev) => ({ ...prev, position: 1 })); // Default to 1 if none exist
      }
    } catch (err) {
      console.error("Error loading testimonial positions:", err);
      showSnackBar("Error al cargar posiciones existentes.");
      // Provide a default option if loading fails
      setPositionOptions([{ value: 1, label: "Al Inicio (Posición 1)" }]);
      setFormData((prev) => ({ ...prev, position: 1 }));
    } finally {
      setIsLoadingPositions(false);
    }
  }, [showSnackBar]);

  useEffect(() => {
    loadPositionOptions();
  }, [loadPositionOptions]);

  // --- Handlers ---
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target as HTMLInputElement;
    const { name, value, type } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? target.checked : value,
    }));
    if (errorSubmit) setErrorSubmit(null);
  };

  const handleSelectChange = (
    event: ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const name = event.target.name as keyof typeof formData;
    // Ensure value is treated as a number for position
    const value =
      name === "position" ? Number(event.target.value) : event.target.value;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errorSubmit) setErrorSubmit(null);
  };

  const validateForm = (): boolean => {
    setErrorSubmit(null);
    if (!formData.name.trim()) {
      const message = "El nombre es obligatorio.";
      setErrorSubmit(message);
      showSnackBar(message);
      return false;
    }
    if (!formData.type.trim()) {
      const message = "El tipo es obligatorio.";
      setErrorSubmit(message);
      showSnackBar(message);
      return false;
    }
    if (!formData.value.trim()) {
      const message = "El contenido del testimonio (valor) es obligatorio.";
      setErrorSubmit(message);
      showSnackBar(message);
      return false;
    }
    if (!formData.avatar.trim()) {
      // Basic check, could validate URL format
      const message = "La URL del avatar es obligatoria.";
      setErrorSubmit(message);
      showSnackBar(message);
      return false;
    }
    if (!formData.position || formData.position < 1) {
      const message = "Debe seleccionar una posición válida.";
      setErrorSubmit(message);
      showSnackBar(message);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorSubmit(null);

    // Ensure position is a number
    const payload = {
      ...formData,
      position: Number(formData.position),
    };

    try {
      console.log("Submitting Testimonial Data:", payload);
      // API call needs to handle position insertion correctly
      const response = await createTestimonial(payload);

      if (response) {
        // Adjust check based on API
        showSnackBar(`Testimonio "${formData.name}" creado exitosamente.`);
        navigate("/admin/testimonials/read"); // Adjust route
      } else {
        throw new Error(
          "La creación del testimonio no devolvió una respuesta esperada.",
        );
      }
    } catch (err: any) {
      console.error("Failed to create testimonial:", err);
      const message = err.message || "Error al crear el testimonio.";
      setErrorSubmit(message);
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/testimonials/read"); // Adjust route
  };

  // --- Render Logic ---
  return (
    <>
      <Title title="Crear Nuevo Testimonio" />
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        {isLoadingPositions ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 3,
            }}
          >
            <CircularProgress size={24} />
            <Typography sx={{ ml: 2 }}>Cargando posiciones...</Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid2 container spacing={3}>
              {/* Name */}
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Nombre"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  disabled={isSubmitting}
                  error={!!errorSubmit && !formData.name.trim()}
                />
              </Grid2>
              {/* Type */}
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Tipo (Ej: Cliente, Partner)"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  disabled={isSubmitting}
                  error={!!errorSubmit && !formData.type.trim()}
                />
              </Grid2>
              {/* Value (Testimonial Text) */}
              <Grid2 size={{ xs: 12 }}>
                <TextField
                  label="Testimonio (Valor)"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  multiline
                  rows={4}
                  disabled={isSubmitting}
                  error={!!errorSubmit && !formData.value.trim()}
                />
              </Grid2>
              {/* Avatar URL */}
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="URL del Avatar"
                  name="avatar"
                  type="url"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  disabled={isSubmitting}
                  error={!!errorSubmit && !formData.avatar.trim()}
                />
              </Grid2>
              {/* Footer (Optional) */}
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Pie de página (Opcional)"
                  name="footer"
                  value={formData.footer}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={isSubmitting}
                />
              </Grid2>

              {/* Position Select */}
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <FormControl
                  fullWidth
                  required
                  error={
                    !!errorSubmit &&
                    (!formData.position || formData.position < 1)
                  }
                >
                  <InputLabel id="testimonial-position-label">
                    Posición
                  </InputLabel>
                  <Select
                    labelId="testimonial-position-label"
                    id="testimonial-position-select"
                    name="position"
                    value={formData.position}
                    label="Posición"
                    onChange={handleSelectChange as any}
                    disabled={isSubmitting || isLoadingPositions}
                  >
                    {positionOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!errorSubmit &&
                    (!formData.position || formData.position < 1) && (
                      <FormHelperText>
                        Debe seleccionar una posición válida
                      </FormHelperText>
                    )}
                </FormControl>
              </Grid2>

              {/* Status Checkbox */}
              <Grid2
                size={{ xs: 12, sm: 6 }}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.status}
                      onChange={handleInputChange}
                      name="status"
                      disabled={isSubmitting}
                    />
                  }
                  label="Activo (Visible)"
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
                    disabled={isSubmitting || isLoadingPositions}
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : null
                    }
                  >
                    {isSubmitting ? "Creando..." : "Crear Testimonio"}
                  </Button>
                </Stack>
              </Grid2>

              {/* Submission Error Display */}
              {errorSubmit && (
                <Grid2 size={{ xs: 12 }}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errorSubmit}
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

export default CreateTestimonial;
