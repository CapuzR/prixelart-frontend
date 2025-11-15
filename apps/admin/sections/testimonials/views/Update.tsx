import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom";

// Hooks and Context
import { useSnackBar } from "context/GlobalContext";
import { Testimonial } from "types/testimonial.types";
import {
  getTestimonialById,
  updateTestimonial,
  readAllTestimonial,
} from "@api/testimonial.api";

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
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import Title from "@apps/admin/components/Title";
import Grid2 from "@mui/material/Grid";
// Initial form state (similar to create)
const initialFormState: Partial<Testimonial> = {
  name: "",
  type: "",
  value: "",
  avatar: "",
  footer: "",
  position: 1,
  status: true,
};

// Interface for position options
interface PositionOption {
  value: number;
  label: string;
  name?: string;
}

const UpdateTestimonial: React.FC = () => {
  // --- Hooks ---
  const { id } = useParams<{ id: string }>(); // Get ID from URL
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [formData, setFormData] = useState(initialFormState);
  const [originalTestimonialName, setOriginalTestimonialName] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true); // Combined loading state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [positionOptions, setPositionOptions] = useState<PositionOption[]>([]);

  // --- Fetch Data (Testimonial to Edit AND Positions) ---
  const loadData = useCallback(async () => {
    if (!id) {
      setErrorFetch("No se proporcionó ID del testimonio.");
      setIsLoading(false);
      showSnackBar("ID inválido.");
      navigate("/admin/testimonials/read");
      return;
    }

    setIsLoading(true);
    setErrorFetch(null);
    let fetchedTestimonial: Testimonial | null = null;
    let existingTestimonials: Testimonial[] = [];

    try {
      // Fetch concurrently
      [fetchedTestimonial, existingTestimonials] = await Promise.all([
        getTestimonialById(id) as Promise<Testimonial>,
        readAllTestimonial() as Promise<Testimonial[]>,
      ]);

      if (!fetchedTestimonial) throw new Error("Testimonio no encontrado.");

      // Populate form data
      const { _id, ...testimonialFormData } = fetchedTestimonial;
      setFormData(testimonialFormData);
      setOriginalTestimonialName(fetchedTestimonial.name);

      // --- Generate Position Options (excluding the current testimonial) ---
      const sortedExisting = existingTestimonials
        .filter((t) => t._id?.toString() !== id && t._id && t.position) // Exclude self, ensure valid
        .sort((a, b) => a.position - b.position);

      const options: PositionOption[] = [
        { value: 1, label: "Al Inicio (Posición 1)" },
      ];

      sortedExisting.forEach((t) => {
        options.push({
          value:
            t.position +
            (fetchedTestimonial && t.position >= fetchedTestimonial.position
              ? 0
              : 1), // Adjust value based on original position
          label: `Después de "${t.name}" (Posición ${t.position + (fetchedTestimonial && t.position >= fetchedTestimonial.position ? 0 : 1)})`,
          name: t.name,
        });
      });

      // Ensure unique and sorted options
      const uniqueOptions = options
        .reduce((acc, current) => {
          if (!acc.some((item) => item.value === current.value))
            acc.push(current);
          return acc;
        }, [] as PositionOption[])
        .sort((a, b) => a.value - b.value);

      // Add option for the current position if it's not 1
      if (
        fetchedTestimonial &&
        fetchedTestimonial.position !== 1 &&
        !uniqueOptions.some((o) => o.value === fetchedTestimonial!.position)
      ) {
        const currentPosLabel = `Mantener Posición Actual (${fetchedTestimonial.position})`;
        uniqueOptions.push({
          value: fetchedTestimonial.position,
          label: currentPosLabel,
        });
        uniqueOptions.sort((a, b) => a.value - b.value);
      }

      setPositionOptions(uniqueOptions);
    } catch (err: any) {
      console.error("Failed to load data:", err);
      const message = err.message || "Error al cargar los datos.";
      setErrorFetch(message);
      showSnackBar(message);
      // Don't set position options if fetch failed
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, showSnackBar]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Handlers ---
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target;
    const name = target.name;
    const value =
      target.type === "checkbox"
        ? (target as HTMLInputElement).checked
        : target.value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errorSubmit) setErrorSubmit(null);
  };

  const handleSelectChange = (
    event: ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const name = event.target.name as keyof typeof formData;
    const value =
      name === "position" ? Number(event.target.value) : event.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorSubmit) setErrorSubmit(null);
  };

  const validateForm = (): boolean => {
    // Same validation as Create form
    setErrorSubmit(null);
    if (!(formData.name && formData.name.trim())) {
      const message = "El nombre es obligatorio.";
      setErrorSubmit(message);
      showSnackBar(message);
      return false;
    }
    if (!formData.type || !formData.type.trim()) {
      const message = "El tipo es obligatorio.";
      setErrorSubmit(message);
      showSnackBar(message);
      return false;
    }
    if (!formData.value?.trim()) {
      const message = "El contenido (valor) es obligatorio.";
      setErrorSubmit(message);
      showSnackBar(message);
      return false;
    }
    if (!formData.avatar?.trim()) {
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
    if (!id || !validateForm()) return;

    setIsSubmitting(true);
    setErrorSubmit(null);

    const payload = { ...formData, position: Number(formData.position) };

    try {
      console.log("Updating Testimonial Data:", id, payload);
      // API needs to handle position updates and reordering
      const response = await updateTestimonial(id, payload);

      if (response) {
        // Adjust check based on API
        showSnackBar(`Testimonio "${formData.name}" actualizado exitosamente.`);
        navigate("/admin/testimonials/read"); // Adjust route
      } else {
        throw new Error("La actualización no devolvió una respuesta esperada.");
      }
    } catch (err: any) {
      console.error("Failed to update testimonial:", err);
      const message = err.message || "Error al actualizar el testimonio.";
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
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }}
      >
        <CircularProgress />{" "}
        <Typography sx={{ ml: 2 }}>Cargando datos...</Typography>
      </Box>
    );
  }

  if (errorFetch) {
    return (
      <Box sx={{ p: 2 }}>
        <Title title="Error al Cargar Testimonio" />
        <Alert severity="error" sx={{ mt: 2 }}>
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
      </Box>
    );
  }

  return (
    <>
      <Title title={`Actualizar Testimonio: ${originalTestimonialName}`} />
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid2 container spacing={3}>
            {/* Fields are the same as Create form */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nombre"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                required
                fullWidth
                disabled={isSubmitting}
                error={!!errorSubmit && !(formData.name || "").trim()}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tipo"
                name="type"
                value={formData.type || ""}
                onChange={handleInputChange}
                required
                fullWidth
                disabled={isSubmitting}
                error={!!errorSubmit && !(formData.type || "").trim()}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                label="Testimonio (Valor)"
                name="value"
                value={formData.value || ""}
                onChange={handleInputChange}
                required
                fullWidth
                multiline
                rows={4}
                disabled={isSubmitting}
                error={!!errorSubmit && !(formData.value || "").trim()}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="URL del Avatar"
                name="avatar"
                type="url"
                value={formData.avatar || ""}
                onChange={handleInputChange}
                required
                fullWidth
                disabled={isSubmitting}
                error={
                  !!errorSubmit && !(formData.avatar && formData.avatar.trim())
                }
              />
            </Grid2>
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
                  !!errorSubmit && (!formData.position || formData.position < 1)
                }
              >
                <InputLabel id="testimonial-position-label">
                  Posición
                </InputLabel>
                <Select
                  labelId="testimonial-position-label"
                  name="position"
                  value={formData.position}
                  label="Posición"
                  onChange={handleSelectChange as any}
                  disabled={isSubmitting || positionOptions.length === 0} // Disable if no options loaded
                >
                  {positionOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                  {/* Add a fallback option  */}
                  {positionOptions.length === 0 && (
                    <MenuItem value={formData.position}>
                      Posición Actual ({formData.position})
                    </MenuItem>
                  )}
                </Select>
                {!!errorSubmit &&
                  (!formData.position || formData.position < 1) && (
                    <FormHelperText>
                      Debe seleccionar una posición válida
                    </FormHelperText>
                  )}
                {positionOptions.length === 0 && !isLoading && (
                  <FormHelperText>
                    No se pudieron cargar las opciones de posición.
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
      </Paper>
    </>
  );
};

export default UpdateTestimonial;
