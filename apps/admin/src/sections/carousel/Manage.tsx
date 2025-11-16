import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom"; // If needed for navigation
import Grid2 from "@mui/material/Grid";

// DND Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DropAnimation,
  defaultDropAnimation,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable, // Importado para obtener el tipo de los listeners
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as tus from "tus-js-client";

// MUI Components
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CropIcon from "@mui/icons-material/Crop";

// Hooks, Types, Context, API
import { useSnackBar } from "@prixpon/context/GlobalContext"; // Asegúrate que la ruta sea correcta
import { CarouselItem } from "@prixpon/types/preference.types"; // Asegúrate que la ruta sea correcta
import {
  fetchCarouselImages,
  updateCarouselOrder,
  deleteCarouselItem,
  createCarouselItem,
} from "@prixpon/api-client/preferences.api"; // Asegúrate que la ruta sea correcta

import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Title from "@apps/admin/components/Title"; // Asegúrate que la ruta sea correcta
import ConfirmationDialog from "@components/ConfirmationDialog/ConfirmationDialog"; // Asegúrate que la ruta sea correcta
import { BACKEND_URL } from "@prixpon/api-client/utils.api"; // Asegúrate que la ruta sea correcta

// --- Sortable Item UI Component (Modificado) ---
// Esta es la parte visual del item del carrusel.
// Ahora acepta `dndListeners` para aplicarlos específicamente al handle de arrastre.
interface SortableCarouselItemUIProps {
  item: Omit<CarouselItem, "_id"> & { _id: string };
  isOverlay?: boolean;
  // CAMBIO: Se añade la prop `dndListeners` para recibir los manejadores de eventos de dnd-kit.
  // El tipo se toma de `useSortable` para mayor precisión.
  dndListeners?: ReturnType<typeof useSortable>["listeners"];
}

const SortableCarouselItemUI: React.FC<SortableCarouselItemUIProps> = ({
  item,
  isOverlay,
  dndListeners, // Se recibe la prop dndListeners
}) => (
  <Paper
    elevation={isOverlay ? 4 : 1}
    sx={{
      display: "flex",
      alignItems: "center",
      p: 1,
      // mb: 1, // Se comenta o elimina si el ListItem padre ya maneja el margen inferior
      width: "100%",
      backgroundColor: "background.paper",
    }}
  >
    {/* CAMBIO: Se crea un Box que actúa como el "handle" de arrastre.
        Los `dndListeners` se aplican aquí, junto con los estilos de cursor y touchAction.
        Esto asegura que solo esta área active el arrastre. */}
    <Box
      {...dndListeners} // Aplicar listeners de dnd-kit aquí
      sx={{
        cursor: "grab", // Cursor para indicar que es agarrable
        touchAction: "none", // Necesario para dnd-kit en el handle para interacciones táctiles
        display: "flex", // Para alinear el ícono
        alignItems: "center",
        paddingRight: 1, // Espacio entre el handle y el avatar
        // Si se quisiera un área de agarre más grande sin cambiar el tamaño del ícono,
        // se podría añadir padding a este Box.
      }}
    >
      <DragIndicatorIcon
        sx={{
          color: "action.active",
          // El cursor y touchAction se manejan en el Box padre del handle
        }}
      />
    </Box>
    <ListItemAvatar sx={{ mr: 1 }}>
      <Avatar
        variant="rounded"
        src={item.imageURL}
        alt={`Pos ${item.position}`}
        sx={{ width: 80, height: 45, bgcolor: "grey.200" }}
      />
    </ListItemAvatar>
    <ListItemText
      primary={`Posición: ${item.position}`}
      secondary={item.imageURL.substring(item.imageURL.lastIndexOf("/") + 1)}
      primaryTypographyProps={{ variant: "body2", fontWeight: "medium" }}
      secondaryTypographyProps={{
        variant: "caption",
        noWrap: true,
        title: item.imageURL,
        component: "div",
      }}
    />
  </Paper>
);

// --- Canvas Preview Function (Sin cambios) ---
async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No 2d context");
  }
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);
  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";
  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const rotateRads = (rotate * Math.PI) / 180;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;
  ctx.save();
  ctx.translate(-cropX, -cropY);
  ctx.translate(centerX, centerY);
  ctx.rotate(rotateRads);
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
  ctx.restore();
}

// --- Sortable Item Component (Modificado) ---
// Este componente envuelve SortableCarouselItemUI y le provee la lógica de dnd-kit.
interface SortableCarouselItemProps {
  item: Omit<CarouselItem, "_id"> & { _id: string };
  handleOpenDeleteDialog: (
    item: Omit<CarouselItem, "_id"> & { _id: string },
  ) => void;
  isSavingOrder: boolean;
  isDeleting: boolean;
  itemToDeleteId: string | null;
}

const SortableCarouselItem: React.FC<SortableCarouselItemProps> = ({
  item,
  handleOpenDeleteDialog,
  isSavingOrder,
  isDeleting,
  itemToDeleteId,
}) => {
  const {
    attributes,
    listeners, // Obtenemos los listeners de useSortable
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id!.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : "auto",
  };

  return (
    <ListItem
      ref={setNodeRef} // Necesario para que dnd-kit identifique el nodo
      style={style} // Estilos para transformaciones y transiciones de dnd-kit
      disablePadding
      secondaryAction={
        <Tooltip title="Eliminar Item">
          <span>
            <IconButton
              edge="end"
              aria-label="delete"
              color="error"
              onClick={(e) => {
                // CAMBIO: Mantenemos stopPropagation por si acaso, aunque con el "handle" dedicado
                // podría no ser estrictamente necesario. Ayuda a asegurar que el clic
                // no sea capturado por ningún otro listener en el DOM.
                e.stopPropagation();
                // e.preventDefault(); // Probablemente ya no sea necesario.
                handleOpenDeleteDialog(item);
              }}
              disabled={
                !item._id ||
                isSavingOrder ||
                (isDeleting && itemToDeleteId === item._id.toString())
              }
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      }
      {...attributes} // Atributos de dnd-kit para accesibilidad, etc.
      // CAMBIO: Se eliminan los `{...listeners}` de aquí.
      // Los listeners ahora se pasan al componente SortableCarouselItemUI
      // para ser aplicados solo al "handle" de arrastre.
      sx={{
        p: 0, // Sin padding para el ListItem
        mb: 0.5, // Margen inferior para espaciar los items de la lista
        // CAMBIO: Ya no se necesita `cursor: "grab"` ni `touchAction: "none"` aquí,
        // ya que el "handle" de arrastre está contenido en SortableCarouselItemUI.
      }}
    >
      {/* CAMBIO: Se pasan los `listeners` a `SortableCarouselItemUI`
          para que los aplique internamente al handle de arrastre. */}
      <SortableCarouselItemUI
        item={item}
        isOverlay={isDragging} // Para el estilo del DragOverlay
        dndListeners={listeners} // Se pasan los listeners
      />
    </ListItem>
  );
};
// --- End Sortable Item Component ---

// --- ManageCarousels Component (Lógica principal sin cambios estructurales, solo usa los subcomponentes modificados) ---
const ManageCarousels: React.FC = () => {
  const { showSnackBar } = useSnackBar();
  // const navigate = useNavigate();

  // --- State ---
  const [desktopItems, setDesktopItems] = useState<
    (Omit<CarouselItem, "_id"> & { _id: string })[]
  >([]);
  const [mobileItems, setMobileItems] = useState<
    (Omit<CarouselItem, "_id"> & { _id: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState<
    false | "desktop" | "mobile"
  >(false);
  const [isCreating, setIsCreating] = useState<false | "desktop" | "mobile">(
    false,
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<
    (Omit<CarouselItem, "_id"> & { _id: string }) | null
  >(null);
  const [activeDragItem, setActiveDragItem] = useState<
    (Omit<CarouselItem, "_id"> & { _id: string }) | null
  >(null);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

  // --- File & Cropper State ---
  const [imageSrcForCropper, setImageSrcForCropper] = useState<string | null>(
    null,
  );
  const [originalFileBeforeCrop, setOriginalFileBeforeCrop] =
    useState<File | null>(null);
  const [croppingType, setCroppingType] = useState<"desktop" | "mobile" | null>(
    null,
  );
  const [newDesktopImageFile, setNewDesktopImageFile] = useState<File | null>(
    null,
  );
  const [newMobileImageFile, setNewMobileImageFile] = useState<File | null>(
    null,
  );
  const [desktopFileDisplayName, setDesktopFileDisplayName] = useState<
    string | null
  >(null);
  const [mobileFileDisplayName, setMobileFileDisplayName] = useState<
    string | null
  >(null);

  const [uploadProgress, setUploadProgress] = useState<{
    [key in "desktop" | "mobile"]?: { percentage: number; status: string };
  }>({});

  // Cropper specific state
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- DND Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // CAMBIO OPCIONAL: Se podría añadir una `activationConstraint` si aún hubiera problemas,
      // pero con el "handle" dedicado, usualmente no es necesario.
      // Ejemplo:
      // activationConstraint: {
      //   distance: 8, // El arrastre solo se activa si el puntero se mueve más de 8px
      // },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // --- Fetch Data ---
  const loadItems = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      setErrorFetch(null);
      try {
        const fetchedItems = ((await fetchCarouselImages()) as CarouselItem[])
          .filter((item) => item._id)
          .map((item) => ({ ...item, _id: item._id!.toString() }));
        const desktop = fetchedItems
          .filter((item) => item.type === "desktop")
          .sort((a, b) => a.position - b.position);
        const mobile = fetchedItems
          .filter((item) => item.type === "mobile")
          .sort((a, b) => a.position - b.position);
        const fixPositions = (
          items: (Omit<CarouselItem, "_id"> & { _id: string })[],
        ) => items.map((item, index) => ({ ...item, position: index + 1 }));
        setDesktopItems(fixPositions(desktop));
        setMobileItems(fixPositions(mobile));
      } catch (err: any) {
        const message =
          err.message || "Error al cargar los items del carrusel.";
        setErrorFetch(message);
        showSnackBar(message);
        console.error("Error fetching items:", err);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [showSnackBar],
  );

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // --- Cropper Functions ---
  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
  ) {
    return centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
      mediaWidth,
      mediaHeight,
    );
  }

  const onImageLoadInCropper = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    const aspect = croppingType === "desktop" ? 16 / 9 : 9 / 16;
    setCrop(centerAspectCrop(width, height, aspect));
  };

  const handleInitiateCrop = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "desktop" | "mobile",
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === "desktop") {
        setNewDesktopImageFile(null);
        setDesktopFileDisplayName(file.name);
      } else {
        setNewMobileImageFile(null);
        setMobileFileDisplayName(file.name);
      }
      setOriginalFileBeforeCrop(file);
      setCroppingType(type);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrcForCropper(reader.result?.toString() || null);
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
      setErrorSubmit(null);
    }
    (event.target as HTMLInputElement).value = ""; // Resetear el input para permitir seleccionar el mismo archivo
  };

  const handleConfirmCrop = async () => {
    if (
      !completedCrop ||
      !imgRef.current ||
      !previewCanvasRef.current ||
      !originalFileBeforeCrop ||
      !croppingType
    ) {
      showSnackBar(
        "Error: No se pudo procesar el recorte. Información incompleta.",
      );
      return;
    }
    await canvasPreview(
      imgRef.current,
      previewCanvasRef.current,
      completedCrop,
    );
    previewCanvasRef.current.toBlob(
      (blob) => {
        if (!blob) {
          showSnackBar("Error: No se pudo crear el archivo WebP recortado.");
          setIsCreating(false); // Asegurarse de resetear el estado de creación
          return;
        }
        let originalNameWithoutExtension = originalFileBeforeCrop.name;
        const lastDotIndex = originalFileBeforeCrop.name.lastIndexOf(".");
        if (lastDotIndex > 0) {
          originalNameWithoutExtension = originalFileBeforeCrop.name.substring(
            0,
            lastDotIndex,
          );
        }
        const webpFileName = `${originalNameWithoutExtension}.webp`;
        const croppedWebpFile = new File([blob], webpFileName, {
          type: "image/webp",
        });
        if (croppingType === "desktop") {
          setNewDesktopImageFile(croppedWebpFile);
          setDesktopFileDisplayName(`${croppedWebpFile.name} (WebP)`);
        } else {
          setNewMobileImageFile(croppedWebpFile);
          setMobileFileDisplayName(`${croppedWebpFile.name} (WebP)`);
        }
        showSnackBar("Imagen recortada y convertida a WebP, lista para subir.");
        closeAndResetCropper();
      },
      "image/webp",
      0.85, // Calidad del WebP
    );
  };

  const closeAndResetCropper = () => {
    setCropModalOpen(false);
    setImageSrcForCropper(null);
    setOriginalFileBeforeCrop(null);
    setCroppingType(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (imgRef.current) imgRef.current = null;
  };

  // --- Add Item Handling (TUS Upload) ---
  const handleAddItem = async (type: "desktop" | "mobile") => {
    const fileToUpload =
      type === "desktop" ? newDesktopImageFile : newMobileImageFile;
    if (!fileToUpload) {
      showSnackBar(
        "Por favor, seleccione, recorte y convierta una imagen a WebP primero.",
      );
      return;
    }
    setIsCreating(type);
    setErrorSubmit(null);
    setUploadProgress((prev) => ({
      ...prev,
      [type]: { percentage: 0, status: "Iniciando…" },
    }));

    const upload = new tus.Upload(fileToUpload, {
      endpoint: `${BACKEND_URL}/files`,
      retryDelays: [0, 1000, 3000, 5000],
      metadata: { filename: fileToUpload.name, filetype: fileToUpload.type },
      onError(error) {
        console.error("Tus upload error:", error);
        setUploadProgress((prev) => ({
          ...prev,
          [type]: { percentage: prev[type]?.percentage ?? 0, status: "Error" },
        }));
        setErrorSubmit(
          `Error al subir: ${error.message || "Intente de nuevo."}`,
        );
        setIsCreating(false);
      },
      onProgress(bytesUploaded, bytesTotal) {
        const percentage = Math.floor((bytesUploaded / bytesTotal) * 100);
        setUploadProgress((prev) => ({
          ...prev,
          [type]: { percentage, status: "Subiendo…" },
        }));
      },
      onSuccess: async () => {
        const tusUploadInstance = upload as any;
        let finalS3Url: string | null = null;

        if (tusUploadInstance._req?._xhr?.getResponseHeader) {
          finalS3Url =
            tusUploadInstance._req._xhr.getResponseHeader("x-final-url") ||
            tusUploadInstance._req._xhr.getResponseHeader("X-Final-URL");
        } else if (tusUploadInstance.xhr?.getResponseHeader) {
          finalS3Url =
            tusUploadInstance.xhr.getResponseHeader("x-final-url") ||
            tusUploadInstance.xhr.getResponseHeader("X-Final-URL");
        }
        if (finalS3Url && finalS3Url.startsWith("https://https//")) {
          finalS3Url = finalS3Url.replace("https://https//", "https://");
        }

        const tusEndpointUrl = upload.url;
        let imageUrlToSave: string | undefined =
          finalS3Url || tusEndpointUrl || undefined;

        if (!imageUrlToSave) {
          console.error(
            "ERROR CRÍTICO: No se pudo obtener la URL de la imagen después de la subida TUS.",
          );
          showSnackBar("Error: URL de imagen no disponible para guardar.");
          setErrorSubmit("No se pudo obtener la URL final del archivo.");
          setIsCreating(false);
          return;
        }

        setUploadProgress((prev) => ({
          ...prev,
          [type]: {
            percentage: 100,
            url: imageUrlToSave,
            status: "Finalizado, guardando...",
          },
        }));
        try {
          console.log(
            `Llamando a createCarouselItem con imageURL: ${imageUrlToSave}`,
          );
          await createCarouselItem({ type, imageURL: imageUrlToSave });
          showSnackBar("Item agregado.");
          await loadItems(false);
          if (type === "desktop") {
            setNewDesktopImageFile(null);
            setDesktopFileDisplayName(null);
          } else {
            setNewMobileImageFile(null);
            setMobileFileDisplayName(null);
          }
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[type];
            return newProgress;
          });
        } catch (err: any) {
          console.error(
            "Error de API después de la subida (createCarouselItem):",
            err,
          );
          setErrorSubmit(
            err.message || "Error al guardar el item en la base de datos.",
          );
          setUploadProgress((prev) => ({
            ...prev,
            [type]: { percentage: 100, status: "Error al guardar" },
          }));
        } finally {
          setIsCreating(false);
        }
      },
    });
    upload.start();
  };

  // --- Delete Handling ---
  const handleOpenDeleteDialog = (
    // Esta función debería ser llamada ahora
    item: Omit<CarouselItem, "_id"> & { _id: string },
  ) => {
    // Log para confirmar que se llama (puedes quitarlo después de verificar)
    console.log(
      "ManageCarousels: handleOpenDeleteDialog SE LLAMÓ con el item:",
      item,
    );
    if (!item._id) {
      console.log("ManageCarousels: El item no tiene _id. Retornando.");
      return;
    }
    setItemToDelete(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (isDeleting || isSavingOrder) return; // No cerrar si hay acción en curso
    setDialogOpen(false);
    setItemToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete?._id) return;
    setIsDeleting(true);
    try {
      await deleteCarouselItem(itemToDelete._id);
      showSnackBar(`Item eliminado exitosamente.`);
      await loadItems(false); // Recargar items sin mostrar el spinner global
      handleCloseDialog(); // Cierra el diálogo y resetea itemToDelete
    } catch (err: any) {
      console.error("Error deleting item:", err);
      showSnackBar(err.message || "Error al eliminar.");
      handleCloseDialog(); // Asegurarse de cerrar el diálogo incluso en error
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const items = [...desktopItems, ...mobileItems]; // Considerar si el item puede ser de cualquier lista
    const item = items.find((i) => i._id === active.id);
    setActiveDragItem(item || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over, activatorEvent } = event;

    // Determinar el tipo de carrusel (desktop/mobile) desde el contenedor
    // Es importante que el contenedor tenga el atributo data-carousel-type
    const targetElement = activatorEvent.target as HTMLElement | null;
    const container = targetElement?.closest("[data-carousel-type]");
    const type = container?.getAttribute("data-carousel-type") as
      | "desktop"
      | "mobile"
      | null;

    if (!over || !type || active.id === over.id) {
      return; // No hay destino, no es un tipo válido, o se soltó en el mismo lugar
    }

    const items = type === "desktop" ? desktopItems : mobileItems;
    const setItems = type === "desktop" ? setDesktopItems : setMobileItems;

    const oldIndex = items.findIndex((item) => item._id === active.id);
    const newIndex = items.findIndex((item) => item._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return; // Item no encontrado

    const reorderedItems = arrayMove(items, oldIndex, newIndex);
    const updatedItemsWithPosition = reorderedItems.map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    setItems(updatedItemsWithPosition); // Actualización optimista de la UI

    setIsSavingOrder(type);
    setErrorSubmit(null);
    try {
      const orderedIds = updatedItemsWithPosition.map((item) => item._id);
      await updateCarouselOrder(type, orderedIds);
      showSnackBar(`Orden del carrusel ${type} actualizado.`);
    } catch (err: any) {
      console.error(`Error saving ${type} order:`, err);
      const message = err.message || `Error al guardar orden ${type}.`;
      setErrorSubmit(message);
      showSnackBar(message);
      // Revertir al estado anterior si falla el guardado (recargando los items)
      await loadItems(false);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const dropAnimation: DropAnimation = defaultDropAnimation;

  // --- Render Logic ---
  const renderCarouselList = (
    type: "desktop" | "mobile",
    items: (Omit<CarouselItem, "_id"> & { _id: string })[],
  ) => {
    const currentCroppedFile =
      type === "desktop" ? newDesktopImageFile : newMobileImageFile;
    const displayName =
      type === "desktop" ? desktopFileDisplayName : mobileFileDisplayName;
    const progressData = uploadProgress[type];
    const aspectText = type === "desktop" ? "(16:9)" : "(9:16)";

    return (
      // Es crucial que este Paper tenga el data-carousel-type para que handleDragEnd funcione
      <Paper
        elevation={2}
        sx={{
          p: 2,
          opacity: isSavingOrder === type || isCreating === type ? 0.7 : 1,
        }}
        data-carousel-type={type} // Atributo para identificar el contenedor en handleDragEnd
      >
        <Typography variant="h6" gutterBottom>
          {type === "desktop" ? "Carrusel Desktop" : "Carrusel Mobile"}{" "}
          {aspectText}
        </Typography>
        <Stack direction="column" spacing={1.5} mb={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              component="label"
              size="small"
              disabled={isCreating === type || !!isSavingOrder} // Usar !!isSavingOrder para convertir a booleano
              startIcon={<CropIcon />}
            >
              Seleccionar y Recortar
              <input
                id={`${type}-file-input`}
                type="file"
                hidden
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={(e) => handleInitiateCrop(e, type)}
              />
            </Button>
            {displayName && (
              <Tooltip title={displayName}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "inline-block",
                    maxWidth: 180,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    verticalAlign: "middle",
                  }}
                >
                  {displayName}
                </Typography>
              </Tooltip>
            )}
          </Box>

          {isCreating === type && progressData && (
            <Box sx={{ width: "100%" }}>
              <LinearProgress
                variant={
                  progressData.status.startsWith("Error")
                    ? "determinate" // Mantenemos determinate para mostrar progreso incluso en error
                    : "determinate"
                }
                value={progressData.percentage}
                color={
                  progressData.status.startsWith("Error") ? "error" : "primary"
                }
              />
              <Typography
                variant="caption"
                display="block"
                textAlign="center"
              >{`${progressData.status} ${progressData.percentage}%`}</Typography>
            </Box>
          )}
          {errorSubmit && (isCreating === type || isSavingOrder === type) && (
            <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
              {errorSubmit}
            </Alert>
          )}

          <Button
            variant="contained"
            size="small"
            onClick={() => handleAddItem(type)}
            disabled={
              isCreating === type ||
              !!isSavingOrder || // Usar !!isSavingOrder
              !currentCroppedFile
            }
            startIcon={
              isCreating === type &&
              (!progressData || !progressData.status.startsWith("Error")) ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <AddCircleOutlineIcon />
              )
            }
          >
            Añadir Imagen Recortada
          </Button>
        </Stack>

        {items.length === 0 && !isLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
            No hay items en este carrusel.
          </Typography>
        )}
        <List disablePadding sx={{ minHeight: "100px" }}>
          {" "}
          {/* Altura mínima para el área de drop */}
          <SortableContext
            items={items.map((item) => item._id!.toString())} // Asegúrate que item._id exista
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <SortableCarouselItem
                key={item._id!.toString()}
                item={item}
                handleOpenDeleteDialog={handleOpenDeleteDialog}
                isSavingOrder={isSavingOrder === type} // Pasa booleano específico
                isDeleting={isDeleting}
                itemToDeleteId={itemToDelete?._id?.toString() ?? null}
              />
            ))}
          </SortableContext>
        </List>
        {isSavingOrder === type && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <>
      <Title title="Gestionar Carruseles Principales" />

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {errorFetch && !isLoading && (
        <Alert severity="error" sx={{ m: 2 }}>
          {errorFetch}
          <Button onClick={() => loadItems()} size="small" sx={{ ml: 1 }}>
            Reintentar
          </Button>
        </Alert>
      )}

      {!isLoading && !errorFetch && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragItem(null)} // Resetea el item activo si se cancela el arrastre
        >
          <Grid2 container spacing={3}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              {" "}
              {/* Usar xs y md para Grid v2 */}
              {renderCarouselList("desktop", desktopItems)}
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              {renderCarouselList("mobile", mobileItems)}
            </Grid2>
          </Grid2>
          <DragOverlay dropAnimation={dropAnimation}>
            {activeDragItem ? (
              // SortableCarouselItemUI se usa para el overlay,
              // no necesita listeners de dnd aquí, solo la apariencia.
              <SortableCarouselItemUI item={activeDragItem} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* --- Cropper Modal --- */}
      {imageSrcForCropper && croppingType && (
        <Dialog
          open={cropModalOpen}
          onClose={closeAndResetCropper}
          maxWidth="lg"
          PaperProps={{
            sx: { minWidth: { xs: "90vw", sm: "70vw", md: "50vw" } },
          }}
        >
          <DialogTitle>
            Recortar Imagen: {croppingType} (
            {croppingType === "desktop" ? "16:9" : "9:16"})
          </DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: { xs: 1, sm: 2 },
            }}
          >
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={croppingType === "desktop" ? 16 / 9 : 9 / 16}
              minWidth={100}
              minHeight={100}
              keepSelection
            >
              <img
                alt="Imagen para recortar"
                src={imageSrcForCropper}
                onLoad={onImageLoadInCropper}
                style={{
                  maxHeight: "70vh",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            </ReactCrop>
            <canvas
              ref={previewCanvasRef}
              style={{ display: "none", objectFit: "contain" }} // Escondido, solo para generar el blob
            />
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
            <Button onClick={closeAndResetCropper}>Cancelar</Button>
            <Button
              onClick={handleConfirmCrop}
              variant="contained"
              disabled={
                !completedCrop?.width ||
                !completedCrop?.height ||
                isCreating === croppingType // Deshabilitar si ya se está creando una imagen de este tipo
              }
            >
              Confirmar Recorte
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={
          itemToDelete ? ( // Asegurarse que itemToDelete no sea null
            <>
              ¿Estás seguro de eliminar este item? <br />{" "}
              <Avatar
                variant="rounded"
                src={itemToDelete.imageURL}
                alt={`Imagen ${itemToDelete.position}`}
                sx={{ width: 100, height: "auto", my: 1, bgcolor: "grey.200" }} // bgcolor por si la imagen no carga
              />
            </>
          ) : (
            "Cargando información del item..."
          ) // Mensaje provisional
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        isPerformingAction={isDeleting}
      />
    </>
  );
};

export default ManageCarousels;
