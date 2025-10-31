// src/apps/admin/sections/testimonials/views/ReadTestimonials.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// --- DND Imports ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// --- End DND Imports ---

// MUI Components
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Stack,
  Chip,
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"; // Icon for drag handle

// Hooks, Types, API
import { useSnackBar } from "context/GlobalContext";
import { Testimonial } from "types/testimonial.types";
// --- API: Assume a new function exists to update order ---
import {
  readAllTestimonial,
  deleteTestimonial,
  updateTestimonialOrder,
} from "@api/testimonial.api";

import Title from "@apps/admin/components/Title";
import ConfirmationDialog from "@components/ConfirmationDialog/ConfirmationDialog";

// --- Sortable Row Component ---
interface SortableTestimonialRowProps {
  testimonial: Testimonial;
  handleUpdate: (id: string) => void;
  handleOpenDeleteDialog: (testimonial: Testimonial) => void;
  isDeleting: boolean;
  testimonialToDeleteId: string | null;
}

const SortableTestimonialRow: React.FC<SortableTestimonialRowProps> = ({
  testimonial,
  handleUpdate,
  handleOpenDeleteDialog,
  isDeleting,
  testimonialToDeleteId,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Use this to style the row while dragging
  } = useSortable({ id: testimonial._id!.toString() }); // Use the unique _id for dnd-kit

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1, // Style when dragging
    backgroundColor: isDragging ? "action.hover" : "inherit", // Highlight when dragging
    cursor: isDragging ? "grabbing" : "grab", // Change cursor
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      hover
      key={testimonial._id?.toString()}
      sx={{
        "&:last-child td, &:last-child th": { border: 0 },
        // Add a class or style for the drag handle cell
      }}
    >
      {/* Drag Handle Cell */}
      <TableCell
        sx={{ width: "5%", cursor: "grab", touchAction: "none" }}
        {...attributes}
        {...listeners}
      >
        <Tooltip title="Arrastrar para reordenar">
          <DragIndicatorIcon sx={{ verticalAlign: "middle" }} />
        </Tooltip>
      </TableCell>
      {/* Original Cells */}
      <TableCell sx={{ fontWeight: "medium", width: "5%" }}>
        {testimonial.position}
      </TableCell>
      <TableCell sx={{ width: "10%" }}>
        <Avatar
          src={testimonial.avatar}
          alt={testimonial.name}
          sx={{ width: 40, height: 40 }}
          imgProps={{ loading: "lazy" }}
        />
      </TableCell>
      <TableCell component="th" scope="row" sx={{ width: "25%" }}>
        {testimonial.name}
        {testimonial.footer && (
          <Typography variant="caption" display="block" color="text.secondary">
            {testimonial.footer}
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ width: "15%" }}>{testimonial.type}</TableCell>
      <TableCell sx={{ width: "15%" }}>
        <Chip
          icon={testimonial.status ? <CheckCircleIcon /> : <CancelIcon />}
          label={testimonial.status ? "Activo" : "Inactivo"}
          color={testimonial.status ? "success" : "default"}
          size="small"
          variant="outlined"
        />
      </TableCell>
      <TableCell align="right" sx={{ width: "10%" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
          <Tooltip title="Editar Testimonio">
            <span>
              <IconButton
                aria-label="edit"
                color="primary"
                onClick={() => handleUpdate(testimonial._id!.toString())}
                disabled={!testimonial._id || isDeleting}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Eliminar Testimonio">
            <span>
              <IconButton
                aria-label="delete"
                color="error"
                onClick={() => handleOpenDeleteDialog(testimonial)}
                disabled={
                  !testimonial._id ||
                  (isDeleting &&
                    testimonialToDeleteId === testimonial._id.toString())
                }
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
};
// --- End Sortable Row Component ---

const ReadTestimonials: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSavingOrder, setIsSavingOrder] = useState<boolean>(false); // State for saving order
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [testimonialToDelete, setTestimonialToDelete] =
    useState<Testimonial | null>(null);

  // --- DND Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor), // Use pointer sensor for mouse/touch
    useSensor(KeyboardSensor, {
      // Use keyboard sensor for accessibility
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // --- Fetch Data ---
  const loadTestimonials = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      setError(null);
      try {
        const fetchedTestimonials = (
          (await readAllTestimonial()) as Testimonial[]
        )
          .filter((t) => t._id && t.position != null) // Ensure position is not null/undefined
          .sort((a, b) => a.position - b.position); // Sort by position

        // --- Data Integrity Check: Ensure positions are sequential ---
        let expectedPosition = 1;
        let needsReorder = false;
        for (const t of fetchedTestimonials) {
          if (t.position !== expectedPosition) {
            console.warn(
              `Testimonial "${t.name}" has position ${t.position}, expected ${expectedPosition}. Data inconsistency detected.`,
            );
            needsReorder = true;
          }
          expectedPosition++;
        }
        // --- End Check ---

        setTestimonials(fetchedTestimonials);
      } catch (err: any) {
        const message = err.message || "Error al cargar los testimonios.";
        setError(message);
        showSnackBar(message);
        console.error("Error fetching testimonials:", err);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [showSnackBar],
  );

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  // --- Delete Handling ---
  const handleOpenDeleteDialog = (testimonial: Testimonial) => {
    if (!testimonial._id) {
      showSnackBar("No se puede eliminar: Falta ID.");
      return;
    }
    setTestimonialToDelete(testimonial);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    if (isDeleting || isSavingOrder) return;
    setDialogOpen(false);
    setTestimonialToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!testimonialToDelete?._id) {
      showSnackBar("Error: Testimonio no seleccionado o falta ID.");
      setIsDeleting(false);
      handleCloseDialog();
      return;
    }
    setIsDeleting(true);
    try {
      await deleteTestimonial(testimonialToDelete._id.toString());
      showSnackBar(`Testimonio "${testimonialToDelete.name}" eliminado.`);
      await loadTestimonials(false);
      handleCloseDialog();
    } catch (err: any) {
      console.error("Error deleting testimonial:", err);
      showSnackBar(err.message || "Error al eliminar.");
      handleCloseDialog();
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Update Handling ---
  const handleUpdate = (testimonialId: string) => {
    if (!testimonialId) {
      showSnackBar("No se puede actualizar: Falta ID.");
      return;
    }
    navigate(`/admin/testimonials/update/${testimonialId}`);
  };
  // --- Create Handling ---
  const handleCreate = () => {
    navigate("/admin/testimonials/create");
  };

  // --- Drag End Handling ---
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = testimonials.findIndex(
        (t) => String(t._id) === active.id,
      );
      const newIndex = testimonials.findIndex((t) => String(t._id) === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedTestimonials = arrayMove(testimonials, oldIndex, newIndex);
      const updatedTestimonialsWithPosition = reorderedTestimonials.map(
        (t, index) => ({ ...t, position: index + 1 }),
      );
      setTestimonials(updatedTestimonialsWithPosition); // Optimistic UI update

      setIsSavingOrder(true);
      setError(null);
      try {
        const orderedIds = updatedTestimonialsWithPosition
          .filter((t) => t._id)
          .map((t) => t._id!.toString());
        await updateTestimonialOrder(orderedIds);
        showSnackBar("Orden de testimonios actualizado.");
      } catch (err: any) {
        console.error("Error saving testimonial order:", err);
        showSnackBar(err.message || "Error al guardar el nuevo orden.");
        setError("No se pudo guardar el orden. Recargando...");
        await loadTestimonials(false); // Revert/Refetch on error
      } finally {
        setIsSavingOrder(false);
      }
    }
  };

  // --- Render Logic ---
  const renderContent = () => {
    // Loading state handled above table
    if (isLoading) return null;

    // Error state when list is empty
    if (error && testimonials.length === 0) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
          <Button
            onClick={() => loadTestimonials()}
            size="small"
            sx={{ ml: 1 }}
          >
            Reintentar
          </Button>
        </Alert>
      );
    }

    // Empty state
    if (!isLoading && testimonials.length === 0 && !error) {
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          No se encontraron testimonios. Puede crear uno nuevo.
        </Alert>
      );
    }

    // Table content
    return (
      <TableContainer
        component={Paper}
        sx={{ mt: 2, opacity: isSavingOrder ? 0.7 : 1 }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={testimonials
              .filter((t) => t._id)
              .map((t) => t._id!.toString())}
            strategy={verticalListSortingStrategy}
          >
            <Table sx={{ minWidth: 650 }} aria-label="testimonials table">
              <TableHead
                sx={{ backgroundColor: (theme) => theme.palette.action.hover }}
              >
                <TableRow>
                  <TableCell sx={{ width: "5%" }}></TableCell>{" "}
                  {/* Drag Handle */}
                  <TableCell sx={{ fontWeight: "bold", width: "5%" }}>
                    Pos.
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "10%" }}>
                    Avatar
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "25%" }}>
                    Nombre
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                    Tipo
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "15%" }}>
                    Estado
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", width: "10%" }}
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testimonials.map((testimonial) => (
                  <SortableTestimonialRow
                    key={testimonial._id?.toString()}
                    testimonial={testimonial}
                    handleUpdate={handleUpdate}
                    handleOpenDeleteDialog={handleOpenDeleteDialog}
                    isDeleting={isDeleting}
                    testimonialToDeleteId={
                      testimonialToDelete?._id?.toString() ?? null
                    }
                  />
                ))}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </TableContainer>
    );
  };

  return (
    <>
      <Title title="Gestionar Testimonios" />

      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        mb={2}
        mt={1}
      >
        {isSavingOrder && <CircularProgress size={24} sx={{ mr: 2 }} />}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          disabled={isLoading || isDeleting || isSavingOrder}
        >
          Crear Testimonio
        </Button>
      </Stack>

      {/* --- Loading Indicator (Restored) --- */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 3,
          }}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Cargando testimonios...</Typography>
        </Box>
      )}

      {/* --- Warning Alert (Restored) --- */}
      {/* Display general fetch error here , even if list has old data */}
      {error && !isLoading && testimonials.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No se pudo actualizar la lista: {error}
          {/* Optional: Add retry button here too if appropriate */}
          {/* <Button onClick={() => loadTestimonials(false)} size="small" sx={{ ml: 1 }}>Reintentar Actualización</Button> */}
        </Alert>
      )}

      {/* Render Table or Empty/Error State */}
      {renderContent()}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={
          <>
            ¿Estás seguro de que deseas eliminar el testimonio de{" "}
            <strong>{testimonialToDelete?.name || ""}</strong>? Esto puede
            afectar el orden.
          </>
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        isPerformingAction={isDeleting}
      />
    </>
  );
};

export default ReadTestimonials;
