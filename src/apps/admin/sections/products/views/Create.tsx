import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useRef,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// Hooks, Types, Context, API
import { useSnackBar } from "context/GlobalContext"; // Asegúrate que la ruta sea correcta
import { Product, Variant, VariantAttribute } from "types/product.types"; // Asegúrate que la ruta sea correcta
import { createProduct, fetchUniqueProductionLines } from "@api/product.api"; // Asegúrate que la ruta sea correcta

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
  Avatar,
  Stack,
  Divider,
  IconButton,
  Chip,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormHelperText,
  Autocomplete,
  createFilterOptions,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Title from "@apps/admin/components/Title"; // Asegúrate que la ruta sea correcta
import Grid2 from "@mui/material/Grid"; // Usando Grid2 como en tu código original

// Image Upload Imports
import * as tus from "tus-js-client";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { BACKEND_URL } from "@api/utils.api"; // Asegúrate que la ruta sea correcta
import PhotoCameraBackIcon from "@mui/icons-material/PhotoCameraBack";
import BrokenImageIcon from "@mui/icons-material/BrokenImage"; // Icono estándar para imagen rota

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  defaultDropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy, // Estrategia para listas horizontales
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator"; // Si aún no lo tienes
interface AttributeType {
  id: string;
  name: string;
}

// Estado para una imagen individual (usado tanto para imágenes principales como de variante)
interface ImageUploadState {
  id: string; // ID único para la instancia de la imagen
  url: string; // URL final de la imagen, vacía hasta que se suba
  file?: File; // Archivo original o recortado, se limpia después de la subida
  progress?: number; // Progreso de subida (0-100)
  error?: string; // Mensaje de error si la subida falla
}

// Modificación para que FormVariant.variantImage use ImageUploadState
interface FormVariant
  extends Omit<Variant, "_id" | "attributes" | "variantImage"> {
  tempId: string;
  attributes: { [attributeName: string]: string };
  variantNameManuallyEdited: boolean;
  variantImage: ImageUploadState | null; // Puede ser null si no hay imagen, o un objeto con el estado de la imagen
}

interface FormState
  extends Pick<
    Product,
    | "name"
    | "description"
    | "category"
    | "productionTime"
    | "cost"
    | "coordinates"
    | "mockUp"
    | "active"
    | "autoCertified"
    | "bestSeller"
    | "hasSpecialVar"
  > {
  attributeTypes: AttributeType[];
  variants: FormVariant[];
  productionLines: string[];
}

interface ValidationErrors {
  product?: {
    [key in keyof Omit<
      FormState,
      "variants" | "attributeTypes" | "productionLines"
    >]?: string;
  };
  attributeTypes?: { [index: number]: { name?: string } };
  variants?: {
    [tempId: string]: {
      [key in
        | keyof Omit<FormVariant, "variantImage">
        | "attributeValues"
        | "variantImage"]?: string;
    };
  };
}

// --- Initial State ---
const initialAttributeTypeState: AttributeType = { id: uuidv4(), name: "" };

const initialVariantState = (attributeTypes: AttributeType[]): FormVariant => {
  const attributes: { [attributeName: string]: string } = {};
  attributeTypes.forEach((at) => {
    attributes[at.name] = "";
  });
  return {
    tempId: uuidv4(),
    name: "",
    variantImage: null, // Imagen de variante inicializada a null
    attributes: attributes,
    publicPrice: "",
    prixerPrice: "",
    variantNameManuallyEdited: false,
  };
};

const initialFormState: FormState = {
  name: "",
  description: "",
  category: "",
  productionTime: "",
  cost: "",
  coordinates: "",
  mockUp: "",
  active: true,
  autoCertified: false,
  bestSeller: false,
  hasSpecialVar: false,
  attributeTypes: [{ ...initialAttributeTypeState }],
  variants: [],
  productionLines: [],
};

// --- Helper Functions ---
const generateVariantName = (attributes: {
  [attributeName: string]: string;
}): string => {
  return Object.values(attributes)
    .filter((val) => val.trim())
    .join(" / ");
};

const PRODUCT_IMAGE_ASPECT = 1 / 1; // Aspect ratio para imágenes (ej: cuadrado). Ajusta según necesidad.

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

// --- Component ---
const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] =
    useState<ValidationErrors | null>(null);
  const [errorVariantId, setErrorVariantId] = useState<string | null>(null);

  const [activeDraggedImageId, setActiveDraggedImageId] = useState<
    string | null
  >(null);
  // Estado para imágenes principales del producto
  const [productImages, setProductImages] = useState<ImageUploadState[]>([]);

  // Estado global para el cropper y la imagen que se está procesando
  const [imageToCropDetails, setImageToCropDetails] = useState<{
    originalFile: File;
    targetType: "productMainImage" | "variantImage";
    targetId: string; // ID temporal de la imagen principal o tempId de la variante
  } | null>(null);

  const [imageSrcForCropper, setImageSrcForCropper] = useState<string | null>(
    null,
  );
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [allProductionLines, setAllProductionLines] = useState<string[]>([]);
  const [isLoadingLines, setIsLoadingLines] = useState<boolean>(true);

  useEffect(() => {
    const loadLines = async () => {
      try {
        const lines = await fetchUniqueProductionLines();
        setAllProductionLines(lines);
      } catch (error) {
        showSnackBar("Error al cargar las líneas de producción existentes.");
      } finally {
        setIsLoadingLines(false);
      }
    };
    loadLines();
  }, [showSnackBar]);

  // --- Manejadores de Recorte e Imagen ---
  const onImageLoadInCropper = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, PRODUCT_IMAGE_ASPECT));
  };

  const openCropperWithFile = (
    file: File,
    targetType: "productMainImage" | "variantImage",
    targetId: string,
  ) => {
    setImageToCropDetails({ originalFile: file, targetType, targetId });
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrcForCropper(reader.result?.toString() || null);
      setCropModalOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const handleProductMainImageSelect = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const tempImageId = uuidv4();
      openCropperWithFile(file, "productMainImage", tempImageId);
    }
    if (event.target) {
      (event.target as HTMLInputElement).value = "";
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Pequeño delay para evitar conflictos con clics si es necesario,
      // o una distancia mínima para activar el arrastre.
      activationConstraint: {
        distance: 5, // El arrastre solo se activa si el puntero se mueve más de 5px
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Puedes definir esto dentro de UpdateProduct.tsx o en un archivo separado

  interface SortableProductImageProps {
    image: ImageUploadState; // Tu tipo existente para el estado de la imagen
    isSubmitting: boolean;
    onRemove: (id: string) => void;
    isOverlay?: boolean; // Para dar un estilo diferente al elemento que se muestra mientras se arrastra
  }

  const SortableProductImage: React.FC<SortableProductImageProps> = ({
    image,
    isSubmitting,
    onRemove,
    isOverlay,
  }) => {
    const {
      attributes, // Props para accesibilidad y roles
      listeners, // Manejadores de eventos para iniciar el arrastre
      setNodeRef, // Ref para el nodo DOM del elemento arrastrable
      transform, // Propiedades CSS para la posición durante el arrastre
      transition, // Propiedades CSS para la animación al soltar
      isDragging, // Booleano que indica si este item específico se está arrastrando
    } = useSortable({ id: image.id }); // `id` debe ser único y estable para cada imagen

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging && !isOverlay ? "none" : transition, // Evita la transición en el elemento original si se usa un overlay
      opacity: isDragging && !isOverlay ? 0.5 : 1, // Atenúa el elemento original
      zIndex: isDragging ? 100 : "auto",
      cursor: isOverlay ? "grabbing" : "grab", // Cambia el cursor visualmente
      touchAction: "none", // Importante para PointerSensor en dispositivos táctiles
    };

    return (
      <Box
        ref={setNodeRef} // Asigna la ref al elemento raíz del item arrastrable
        style={style}
        sx={{
          width: { xs: "calc(50% - 8px)", sm: 100, md: 120 }, // Ajusta según tu diseño
          height: { xs: 100, sm: 100, md: 120 },
          position: "relative",
          border: "1px solid",
          borderColor: isOverlay ? "primary.main" : "divider", // Resalta si es el overlay
          borderRadius: 1,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isOverlay ? "0px 5px 15px rgba(0,0,0,0.3)" : "none",
          backgroundColor: "background.paper", // Para que el overlay tenga fondo
          flexShrink: 0, // Evita que los items se encojan en el contenedor flex
          m: 0.5, // Un pequeño margen entre items
        }}
      >
        {/* Contenido visual de la imagen (URL, progreso, placeholder) */}
        {image.url ? (
          <img
            src={image.url}
            alt="Producto"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : image.file ? (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              bgcolor: "grey.100",
              p: 0.5,
            }}
          >
            <Typography
              variant="caption"
              noWrap
              sx={{
                width: "100%",
                fontSize: "0.65rem",
                textAlign: "center",
                wordBreak: "break-all",
              }}
            >
              {image.file.name}
            </Typography>
            {typeof image.progress === "number" && image.progress < 100 && (
              <LinearProgress
                variant="determinate"
                value={image.progress}
                sx={{ width: "80%", mt: 0.5 }}
              />
            )}
            {image.error && (
              <Typography
                variant="caption"
                color="error"
                sx={{ fontSize: "0.65rem", textAlign: "center", mt: 0.5 }}
              >
                {image.error}
              </Typography>
            )}
          </Box>
        ) : (
          <BrokenImageIcon sx={{ fontSize: 30, color: "grey.400" }} />
        )}

        {/* Solo mostrar controles si no es el elemento del DragOverlay */}
        {!isOverlay && (
          <>
            <IconButton
              size="small"
              // Aplicar stopPropagation para evitar que el clic active el arrastre
              onClick={(e) => {
                e.stopPropagation();
                onRemove(image.id);
              }}
              disabled={
                isSubmitting ||
                (typeof image.progress === "number" &&
                  image.progress < 100 &&
                  !image.error)
              }
              sx={{
                position: "absolute",
                top: 2,
                right: 2,
                backgroundColor: "rgba(255,255,255,0.8)",
                "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                p: 0.2,
              }}
              color="error"
            >
              <DeleteIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
            {/* Handle para arrastrar (el icono) */}
            <Box
              {...attributes} // Props de accesibilidad de dnd-kit
              {...listeners} // Manejadores para iniciar el arrastre
              sx={{
                position: "absolute",
                bottom: 2,
                left: 2,
                cursor: "grab", // El cursor ya está en el Box principal, pero es bueno tenerlo aquí también
                touchAction: "none",
                color: "action.active",
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "50%",
                padding: "2px",
                display: "flex",
                "&:hover": { color: "text.primary" },
              }}
            >
              <DragIndicatorIcon sx={{ fontSize: "1rem" }} />
            </Box>
          </>
        )}
      </Box>
    );
  };

  // Dentro de const UpdateProduct: React.FC = () => {
  // ...

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDraggedImageId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDraggedImageId(null); // Limpia el ID activo
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setProductImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        // arrayMove es una función de @dnd-kit/sortable que reordena el array
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // También necesitarás una referencia a la imagen que se está arrastrando para el DragOverlay
  const activeDraggedImage = activeDraggedImageId
    ? productImages.find((img) => img.id === activeDraggedImageId)
    : null;

  // ...
  // }

  const handleVariantImageSelect = (
    event: ChangeEvent<HTMLInputElement>,
    variantTempId: string,
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // Usamos el variantTempId como targetId para la imagen de variante
      openCropperWithFile(file, "variantImage", variantTempId);
    }
    if (event.target) {
      (event.target as HTMLInputElement).value = "";
    }
  };

  const closeAndResetCropper = () => {
    setCropModalOpen(false);
    setImageSrcForCropper(null);
    setImageToCropDetails(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (imgRef.current) imgRef.current = null;
  };

  const handleConfirmCropAndUpload = async () => {
    if (
      !completedCrop ||
      !imgRef.current ||
      !previewCanvasRef.current ||
      !imageToCropDetails
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
          return;
        }
        const { originalFile, targetType, targetId } = imageToCropDetails;
        let originalNameWithoutExtension = originalFile.name;
        const lastDotIndex = originalFile.name.lastIndexOf(".");
        if (lastDotIndex > 0) {
          originalNameWithoutExtension = originalFile.name.substring(
            0,
            lastDotIndex,
          );
        }
        const webpFileName = `${originalNameWithoutExtension}_${Date.now()}.webp`;
        const croppedWebpFile = new File([blob], webpFileName, {
          type: "image/webp",
        });

        closeAndResetCropper();

        const newImageStateEntry: ImageUploadState = {
          id: targetId, // Este ID es el tempImageId para main o variantTempId para variante
          url: "",
          file: croppedWebpFile,
          progress: 0,
          error: undefined,
        };

        if (targetType === "productMainImage") {
          setProductImages((prev) => [...prev, newImageStateEntry]);
          startTusUpload(croppedWebpFile, targetId, "productMainImage");
        } else if (targetType === "variantImage") {
          setFormData((prev) => ({
            ...prev,
            variants: prev.variants.map((v) =>
              v.tempId === targetId
                ? { ...v, variantImage: newImageStateEntry }
                : v,
            ),
          }));
          startTusUpload(croppedWebpFile, targetId, "variantImage");
        }
      },
      "image/webp",
      0.85,
    );
  };

  const startTusUpload = (
    file: File,
    targetId: string,
    targetType: "productMainImage" | "variantImage",
  ) => {
    const upload = new tus.Upload(file, {
      endpoint: `${BACKEND_URL}/files`,
      retryDelays: [0, 1000, 3000, 5000],
      metadata: { filename: file.name, filetype: file.type },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = Math.floor((bytesUploaded / bytesTotal) * 100);
        if (targetType === "productMainImage") {
          setProductImages((prev) =>
            prev.map((img) =>
              img.id === targetId ? { ...img, progress: percentage } : img,
            ),
          );
        } else if (targetType === "variantImage") {
          setFormData((prev) => ({
            ...prev,
            variants: prev.variants.map((v) =>
              v.tempId === targetId && v.variantImage
                ? {
                    ...v,
                    variantImage: { ...v.variantImage, progress: percentage },
                  }
                : v,
            ),
          }));
        }
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
        const imageUrl = finalS3Url || upload.url;

        if (imageUrl) {
          if (targetType === "productMainImage") {
            setProductImages((prev) =>
              prev.map((img) =>
                img.id === targetId
                  ? { ...img, url: imageUrl, progress: 100, file: undefined }
                  : img,
              ),
            );
          } else if (targetType === "variantImage") {
            setFormData((prev) => ({
              ...prev,
              variants: prev.variants.map((v) =>
                v.tempId === targetId && v.variantImage
                  ? {
                      ...v,
                      variantImage: {
                        ...v.variantImage,
                        url: imageUrl,
                        progress: 100,
                        file: undefined,
                      },
                    }
                  : v,
              ),
            }));
          }
          showSnackBar(`Imagen ${file.name} subida correctamente.`);
        } else {
          const errorMsg = "Error al obtener URL";
          if (targetType === "productMainImage") {
            setProductImages((prev) =>
              prev.map((img) =>
                img.id === targetId
                  ? { ...img, error: errorMsg, file: undefined }
                  : img,
              ),
            );
          } else if (targetType === "variantImage") {
            setFormData((prev) => ({
              ...prev,
              variants: prev.variants.map((v) =>
                v.tempId === targetId && v.variantImage
                  ? {
                      ...v,
                      variantImage: {
                        ...v.variantImage,
                        error: errorMsg,
                        file: undefined,
                      },
                    }
                  : v,
              ),
            }));
          }
          showSnackBar(`Error al obtener URL para ${file.name}.`);
        }
      },
      onError: (error) => {
        const errorMsg = error.message || "Error desconocido";
        if (targetType === "productMainImage") {
          setProductImages((prev) =>
            prev.map((img) =>
              img.id === targetId
                ? { ...img, error: errorMsg, file: undefined }
                : img,
            ),
          );
        } else if (targetType === "variantImage") {
          setFormData((prev) => ({
            ...prev,
            variants: prev.variants.map((v) =>
              v.tempId === targetId && v.variantImage
                ? {
                    ...v,
                    variantImage: {
                      ...v.variantImage,
                      error: errorMsg,
                      file: undefined,
                    },
                  }
                : v,
            ),
          }));
        }
        showSnackBar(`Error al subir ${file.name}: ${errorMsg}`);
      },
    });
    upload.start();
  };

  const handleRemoveProductMainImage = (idToRemove: string) => {
    setProductImages((prev) => prev.filter((img) => img.id !== idToRemove));
    showSnackBar("Imagen principal eliminada de la lista.");
  };

  const handleRemoveVariantImage = (variantTempId: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.tempId === variantTempId ? { ...v, variantImage: null } : v,
      ),
    }));
    showSnackBar("Imagen de variante eliminada.");
    if (validationErrors?.variants?.[variantTempId]?.variantImage) {
      setValidationErrors((currentErrors) => {
        if (!currentErrors?.variants || !currentErrors.variants[variantTempId])
          return currentErrors;
        const newVariantErrors = { ...currentErrors.variants[variantTempId] };
        delete newVariantErrors.variantImage;
        const updatedVariantsErrors = {
          ...currentErrors.variants,
          [variantTempId]: newVariantErrors,
        };
        if (Object.keys(newVariantErrors).length === 0)
          delete updatedVariantsErrors[variantTempId];
        return {
          ...currentErrors,
          variants:
            Object.keys(updatedVariantsErrors).length > 0
              ? updatedVariantsErrors
              : undefined,
        };
      });
    }
  };

  // --- Handlers for Product, Attribute, Variant fields ---
  const handleProductInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (
      validationErrors?.product?.[name as keyof ValidationErrors["product"]]
    ) {
      setValidationErrors((prev) => ({
        ...prev,
        product: { ...prev?.product, [name]: undefined },
      }));
    }
  };

  const handleAttributeTypeNameChange = (id: string, value: string) => {
    let oldName = "";
    setFormData((prev) => {
      const updatedTypes = prev.attributeTypes.map((at) => {
        if (at.id === id) {
          oldName = at.name;
          return { ...at, name: value };
        }
        return at;
      });
      let updatedVariants = prev.variants;
      if (oldName && oldName !== value && value.trim()) {
        // Solo renombrar si el nuevo nombre es válido
        updatedVariants = prev.variants.map((variant) => {
          const newAttributes = { ...variant.attributes };
          if (Object.prototype.hasOwnProperty.call(newAttributes, oldName)) {
            newAttributes[value] = newAttributes[oldName];
            delete newAttributes[oldName];
          } else {
            newAttributes[value] = ""; // Si el viejo nombre no existía, inicializar el nuevo
          }
          const newName = !variant.variantNameManuallyEdited
            ? generateVariantName(newAttributes)
            : variant.name;
          return { ...variant, attributes: newAttributes, name: newName };
        });
      } else if (oldName && !value.trim()) {
        // Si el nuevo nombre es vacío, revertir o manejar
        // Podrías optar por no permitir nombres vacíos o limpiar las variantes
        // Por ahora, si se borra el nombre, los atributos de variante con ese nombre viejo se mantendrán
        // hasta que se defina un nuevo nombre válido para ese tipo de atributo.
      }
      return {
        ...prev,
        attributeTypes: updatedTypes,
        variants: updatedVariants,
      };
    });

    setValidationErrors((prev) => {
      if (!prev?.attributeTypes) return prev;
      const typeIndex = formData.attributeTypes.findIndex((at) => at.id === id); // Usar formData para el índice actual
      if (typeIndex !== -1 && prev.attributeTypes?.[typeIndex]?.name) {
        const newAttributeErrors = { ...prev.attributeTypes };
        delete newAttributeErrors[typeIndex].name;
        if (Object.keys(newAttributeErrors[typeIndex] || {}).length === 0) {
          delete newAttributeErrors[typeIndex];
        }
        return {
          ...prev,
          attributeTypes:
            Object.keys(newAttributeErrors).length > 0
              ? newAttributeErrors
              : undefined,
        };
      }
      return prev;
    });
  };

  const handleAddAttributeType = () => {
    setFormData((prev) => ({
      ...prev,
      attributeTypes: [
        ...prev.attributeTypes,
        { ...initialAttributeTypeState, id: uuidv4() },
      ],
      // No añadir clave vacía a las variantes aquí, se manejará cuando se escriba el nombre del atributo
    }));
  };

  const handleRemoveAttributeType = (idToRemove: string) => {
    let nameToRemove = "";
    setFormData((prev) => {
      const typeToRemove = prev.attributeTypes.find(
        (at) => at.id === idToRemove,
      );
      nameToRemove = typeToRemove?.name.trim() || ""; // Usar nombre trimado
      const updatedTypes = prev.attributeTypes.filter(
        (at) => at.id !== idToRemove,
      );
      let updatedVariants = prev.variants;
      if (nameToRemove) {
        updatedVariants = prev.variants.map((variant) => {
          const newAttributes = { ...variant.attributes };
          delete newAttributes[nameToRemove];
          const newName = !variant.variantNameManuallyEdited
            ? generateVariantName(newAttributes)
            : variant.name;
          return { ...variant, attributes: newAttributes, name: newName };
        });
      }
      if (updatedTypes.length === 0 && updatedVariants.length > 0) {
        showSnackBar(
          "No se puede eliminar el último tipo de atributo si existen variantes. Elimine las variantes primero o añada otro tipo de atributo.",
        );
        return prev;
      }
      return {
        ...prev,
        attributeTypes: updatedTypes,
        variants: updatedVariants,
      };
    });
  };

  const handleVariantInputChange = (
    tempId: string,
    field: keyof Omit<FormVariant, "attributes" | "tempId" | "variantImage">,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.tempId === tempId
          ? {
              ...variant,
              [field]: value,
              variantNameManuallyEdited:
                field === "name" ? true : variant.variantNameManuallyEdited,
            }
          : variant,
      ),
    }));
    if (validationErrors?.variants?.[tempId]?.[field]) {
      setValidationErrors((prev) => {
        if (!prev?.variants || !prev.variants[tempId]) return prev;
        const newVariantErrors = { ...prev.variants[tempId] };
        delete newVariantErrors[field];
        const updatedVariantsErrors = {
          ...prev.variants,
          [tempId]: newVariantErrors,
        };
        if (Object.keys(newVariantErrors).length === 0)
          delete updatedVariantsErrors[tempId];
        return {
          ...prev,
          variants:
            Object.keys(updatedVariantsErrors).length > 0
              ? updatedVariantsErrors
              : undefined,
        };
      });
    }
  };

  const handleVariantAttributeValueChange = (
    tempId: string,
    attributeName: string,
    value: string,
  ) => {
    if (!attributeName) return; // No hacer nada si el nombre del atributo es vacío (ej. tipo de atributo aún no nombrado)
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) => {
        if (variant.tempId === tempId) {
          const updatedAttributes = {
            ...variant.attributes,
            [attributeName]: value,
          };
          const newName = !variant.variantNameManuallyEdited
            ? generateVariantName(updatedAttributes)
            : variant.name;
          return { ...variant, attributes: updatedAttributes, name: newName };
        }
        return variant;
      }),
    }));
    if (validationErrors?.variants?.[tempId]?.attributeValues) {
      setValidationErrors((prev) => {
        if (!prev?.variants || !prev.variants[tempId]) return prev;
        const newVariantErrors = { ...prev.variants[tempId] };
        delete newVariantErrors.attributeValues;
        const updatedVariantsErrors = {
          ...prev.variants,
          [tempId]: newVariantErrors,
        };
        if (Object.keys(newVariantErrors).length === 0)
          delete updatedVariantsErrors[tempId];
        return {
          ...prev,
          variants:
            Object.keys(updatedVariantsErrors).length > 0
              ? updatedVariantsErrors
              : undefined,
        };
      });
    }
  };

  const handleAddVariant = () => {
    const validAttributeTypes = formData.attributeTypes.filter((at) =>
      at.name.trim(),
    );
    if (
      validAttributeTypes.length === 0 &&
      formData.attributeTypes.length > 0
    ) {
      showSnackBar(
        "Defina nombres para los tipos de atributo antes de añadir variantes, o elimine los tipos de atributo vacíos.",
      );
      // Podrías enfocar el primer tipo de atributo sin nombre
      const firstEmptyAttrIndex = formData.attributeTypes.findIndex(
        (at) => !at.name.trim(),
      );
      if (firstEmptyAttrIndex !== -1) {
        setValidationErrors((prev) => ({
          ...prev,
          attributeTypes: {
            ...prev?.attributeTypes,
            [firstEmptyAttrIndex]: { name: "Este nombre es requerido" },
          },
        }));
      }
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, initialVariantState(validAttributeTypes)],
    }));
    setErrorVariantId(null);
  };

  const handleRemoveVariant = (tempIdToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter(
        (variant) => variant.tempId !== tempIdToRemove,
      ),
    }));
    if (errorVariantId === tempIdToRemove) {
      setErrorVariantId(null);
    }
  };

  const handleCopyVariant = (tempIdToCopy: string) => {
    const variantToCopy = formData.variants.find(
      (v) => v.tempId === tempIdToCopy,
    );
    if (!variantToCopy) return;
    const newVariant: FormVariant = {
      ...JSON.parse(JSON.stringify(variantToCopy)),
      tempId: uuidv4(),
      name: `${variantToCopy.name || "Variante"} (Copia)`,
      variantNameManuallyEdited: true,
      variantImage: variantToCopy.variantImage
        ? JSON.parse(JSON.stringify(variantToCopy.variantImage))
        : null,
    };
    if (newVariant.variantImage) {
      // Si se copia una imagen, resetear su estado de subida/archivo
      newVariant.variantImage.file = undefined;
      newVariant.variantImage.progress = undefined;
      newVariant.variantImage.error = undefined;
      // La URL se mantiene, asumiendo que es la misma imagen. Si se quiere forzar nueva subida, poner URL a ''
    }
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
    setErrorVariantId(null);
  };

  // --- Validation ---
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      product: {},
      attributeTypes: {},
      variants: {},
    };
    let firstErrorVariantId: string | null = null;
    let hasErrors = false;

    if (!formData.name.trim()) {
      errors.product!.name = "Nombre es obligatorio.";
      hasErrors = true;
    }
    if (!formData.description.trim()) {
      errors.product!.description = "Descripción es obligatoria.";
      hasErrors = true;
    }
    if (!formData.category.trim()) {
      errors.product!.category = "Categoría es obligatoria.";
      hasErrors = true;
    }
    if (
      formData.cost &&
      (isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) < 0)
    ) {
      errors.product!.cost = "Costo debe ser número positivo.";
      hasErrors = true;
    }

    const definedAttributeNames = new Set<string>();
    let hasEmptyAttributeTypeName = false;
    formData.attributeTypes.forEach((at, index) => {
      const trimmedName = at.name.trim();
      if (!trimmedName) {
        if (!errors.attributeTypes![index]) errors.attributeTypes![index] = {};
        errors.attributeTypes![index].name =
          "Nombre de atributo no puede estar vacío.";
        hasErrors = true;
        hasEmptyAttributeTypeName = true;
      } else if (definedAttributeNames.has(trimmedName)) {
        if (!errors.attributeTypes![index]) errors.attributeTypes![index] = {};
        errors.attributeTypes![index].name = "Nombre de atributo duplicado.";
        hasErrors = true;
      } else {
        definedAttributeNames.add(trimmedName);
      }
    });

    if (
      formData.variants.length > 0 &&
      definedAttributeNames.size === 0 &&
      !hasEmptyAttributeTypeName
    ) {
      // Si hay variantes pero NINGÚN tipo de atributo definido (todos eliminados o nunca añadidos)
      showSnackBar(
        "Debe definir al menos un tipo de atributo si tiene variantes.",
      );
      // Podrías añadir un error general o al primer tipo de atributo si existiera uno vacío
      if (
        formData.attributeTypes.length > 0 &&
        !errors.attributeTypes![0]?.name
      ) {
        if (!errors.attributeTypes![0]) errors.attributeTypes![0] = {};
        errors.attributeTypes![0].name = "Defina un tipo de atributo.";
      }
      hasErrors = true;
    }

    formData.variants.forEach((variant) => {
      let variantHasError = false;
      if (!errors.variants![variant.tempId])
        errors.variants![variant.tempId] = {};

      if (!variant.name.trim()) {
        errors.variants![variant.tempId].name =
          "Nombre Variante es obligatorio.";
        hasErrors = true;
        variantHasError = true;
      }
      if (
        !variant.publicPrice ||
        isNaN(parseFloat(variant.publicPrice)) ||
        parseFloat(variant.publicPrice) < 0
      ) {
        errors.variants![variant.tempId].publicPrice =
          "Precio Público debe ser número positivo.";
        hasErrors = true;
        variantHasError = true;
      }
      if (
        !variant.prixerPrice ||
        isNaN(parseFloat(variant.prixerPrice)) ||
        parseFloat(variant.prixerPrice) < 0
      ) {
        errors.variants![variant.tempId].prixerPrice =
          "PVM debe ser número positivo.";
        hasErrors = true;
        variantHasError = true;
      }

      if (variant.variantImage?.error) {
        errors.variants![variant.tempId].variantImage =
          `Error en imagen: ${variant.variantImage.error}`;
        hasErrors = true;
        variantHasError = true;
      }
      // Ejemplo: Hacer imagen de variante obligatoria
      // if (!variant.variantImage?.url && !variant.variantImage?.file) {
      //   errors.variants![variant.tempId].variantImage = "Imagen de variante es obligatoria.";
      //   hasErrors = true; variantHasError = true;
      // }

      let attributeValueError = false;
      definedAttributeNames.forEach((attrName) => {
        if (!variant.attributes[attrName]?.trim()) {
          attributeValueError = true;
        }
      });
      if (attributeValueError && definedAttributeNames.size > 0) {
        // Solo si hay atributos definidos para validar
        errors.variants![variant.tempId].attributeValues =
          "Todos los valores de atributo definidos son obligatorios.";
        hasErrors = true;
        variantHasError = true;
      }

      if (variantHasError && !firstErrorVariantId) {
        firstErrorVariantId = variant.tempId;
      }
    });

    setValidationErrors(hasErrors ? errors : null);
    setErrorVariantId(firstErrorVariantId);
    if (hasErrors) {
      showSnackBar("Por favor, corrija los errores indicados.");
      if (firstErrorVariantId) {
        // Intentar hacer scroll al acordeón de la variante con error
        const errorAccordion = document.getElementById(
          `variant-${firstErrorVariantId}-header`,
        );
        errorAccordion?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    return !hasErrors;
  };

  // --- Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setValidationErrors(null);

    const uploadedImageUrls = productImages
      .filter((img) => img.url && !img.error)
      .map((img) => ({ url: img.url }));
    const validAttributeTypeNames = formData.attributeTypes
      .map((at) => at.name.trim())
      .filter((name) => name);

    const finalVariants: Variant[] = formData.variants.map((formVariant) => {
      const attributesArray: VariantAttribute[] = validAttributeTypeNames.map(
        (attrName) => ({
          name: attrName,
          value: formVariant.attributes[attrName] || "",
        }),
      );
      const {
        tempId,
        variantNameManuallyEdited,
        attributes,
        variantImage,
        ...restOfVariant
      } = formVariant;
      return {
        ...restOfVariant,
        _id: uuidv4(),
        publicPrice: String(restOfVariant.publicPrice),
        prixerPrice: String(restOfVariant.prixerPrice),
        attributes: attributesArray,
        variantImage: variantImage?.url || undefined,
      };
    });

    const payload: Partial<Product> = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      productionTime: formData.productionTime || undefined,
      cost: formData.cost || undefined,
      coordinates: formData.coordinates || undefined,
      mockUp: formData.mockUp || undefined,
      active: formData.active,
      autoCertified: formData.autoCertified,
      bestSeller: formData.bestSeller,
      hasSpecialVar: formData.hasSpecialVar,
      variants: finalVariants,
      sources: { images: uploadedImageUrls },
      thumbUrl:
        uploadedImageUrls.length > 0 ? uploadedImageUrls[0].url : undefined,
      productionLines: formData.productionLines,
    };

    try {
      console.log("Submitting Product Data:", JSON.stringify(payload, null, 2));
      const response = await createProduct(payload);
      if (response) {
        showSnackBar(`Producto "${formData.name}" creado exitosamente.`);
        navigate("/admin/products/read");
      } else {
        throw new Error(
          "La creación del producto falló o no devolvió respuesta.",
        );
      }
    } catch (err: any) {
      console.error("Failed to create product:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Error desconocido al crear el producto.";
      setValidationErrors({ product: { name: errorMessage } });
      showSnackBar(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/admin/products/read");
  const filter = createFilterOptions<string | { inputValue?: string }>();

  // --- Render ---
  return (
    <>
      <Title title="Crear Nuevo Producto" />
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 2 }}>
        <form onSubmit={handleSubmit} noValidate ref={formRef}>
          <Grid2 container spacing={3}>
            {/* Detalles del Producto */}
            <Grid2 size={{ xs: 12 }}>
              <Typography variant="h6">Detalles del Producto</Typography>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nombre del Producto"
                name="name"
                value={formData.name}
                onChange={handleProductInputChange}
                required
                fullWidth
                disabled={isSubmitting}
                error={!!validationErrors?.product?.name}
                helperText={validationErrors?.product?.name}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Categoría"
                name="category"
                value={formData.category}
                onChange={handleProductInputChange}
                required
                fullWidth
                disabled={isSubmitting}
                error={!!validationErrors?.product?.category}
                helperText={validationErrors?.product?.category}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="overline">
                  Imágenes Principales del Producto
                </Typography>
              </Divider>
            </Grid2>
            <Grid2 size={{ sm: 4, md: 3, lg: 2 }}>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleProductMainImageSelect}
                style={{ display: "none" }}
                id="product-main-image-input"
              />
              <label htmlFor="product-main-image-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraBackIcon />}
                  disabled={isSubmitting}
                  fullWidth
                >
                  Añadir Imagen Principal
                </Button>
              </label>
            </Grid2>
            <Grid2 size={{ sm: 8, md: 9, lg: 10 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: productImages.length > 0 ? 1 : 2,
                  minHeight: 210,
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    productImages.length > 0 ? "flex-start" : "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {productImages.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart} // Necesitarás definir esta función
                    onDragEnd={handleDragEnd} // Necesitarás definir esta función
                    onDragCancel={() => setActiveDraggedImageId(null)}
                  >
                    <SortableContext
                      items={productImages.map((img) => img.id)} // Array de IDs únicos
                      strategy={horizontalListSortingStrategy} // Estrategia para horizontal
                    >
                      {productImages.map((pImage) => (
                        <SortableProductImage
                          key={pImage.id} // dnd-kit usa el id de useSortable, pero React aún necesita una key
                          image={pImage}
                          isSubmitting={isSubmitting}
                          onRemove={handleRemoveProductMainImage}
                        />
                      ))}
                    </SortableContext>
                    {/* DragOverlay se renderiza fuera de SortableContext pero dentro de DndContext */}
                    <DragOverlay dropAnimation={defaultDropAnimation}>
                      {activeDraggedImageId && activeDraggedImage ? (
                        <SortableProductImage
                          image={activeDraggedImage}
                          isSubmitting={isSubmitting} // Pasar props necesarias para el estilo del overlay
                          onRemove={() => {}} // onRemove no es relevante para el overlay
                          isOverlay // Prop para indicar que es el overlay
                        />
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                ) : (
                  <Typography
                    sx={{ color: "text.secondary", fontStyle: "italic" }}
                  >
                    No hay imágenes principales para este producto.
                  </Typography>
                )}
              </Paper>
            </Grid2>

            {/* Otros Campos del Producto */}
            <Grid2 size={{ xs: 12 }}>
              <TextField
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleProductInputChange}
                required
                fullWidth
                multiline
                rows={3}
                disabled={isSubmitting}
                error={!!validationErrors?.product?.description}
                helperText={validationErrors?.product?.description}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Tiempo de Producción (días)"
                name="productionTime"
                type="number"
                value={formData.productionTime}
                onChange={handleProductInputChange}
                fullWidth
                disabled={isSubmitting}
                inputProps={{ min: "0" }}
                error={!!validationErrors?.product?.productionTime}
                helperText={validationErrors?.product?.productionTime}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Costo ($) (Opcional)"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleProductInputChange}
                fullWidth
                disabled={isSubmitting}
                inputProps={{ step: "0.01", min: "0" }}
                error={!!validationErrors?.product?.cost}
                helperText={validationErrors?.product?.cost}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <Autocomplete
                multiple
                freeSolo
                id="production-lines-autocomplete"
                options={allProductionLines}
                value={formData.productionLines}
                loading={isLoadingLines}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    productionLines: newValue,
                  }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Líneas de Producción"
                    placeholder="Seleccione o añada nuevas líneas"
                    helperText="Puede crear nuevas líneas escribiendo y presionando Enter."
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Mockup URL (Opcional)"
                name="mockUp"
                type="url"
                value={formData.mockUp}
                onChange={handleProductInputChange}
                fullWidth
                disabled={isSubmitting}
                error={!!validationErrors?.product?.mockUp}
                helperText={validationErrors?.product?.mockUp}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Coordenadas (Opcional)"
                name="coordinates"
                value={formData.coordinates}
                onChange={handleProductInputChange}
                fullWidth
                disabled={isSubmitting}
                error={!!validationErrors?.product?.coordinates}
                helperText={validationErrors?.product?.coordinates}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                alignItems="center"
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.active}
                      onChange={handleProductInputChange}
                      name="active"
                    />
                  }
                  label="Activo"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.autoCertified}
                      onChange={handleProductInputChange}
                      name="autoCertified"
                    />
                  }
                  label="Auto Certificado"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.bestSeller}
                      onChange={handleProductInputChange}
                      name="bestSeller"
                    />
                  }
                  label="Más Vendido"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasSpecialVar}
                      onChange={handleProductInputChange}
                      name="hasSpecialVar"
                    />
                  }
                  label="Variante Especial"
                />
              </Stack>
            </Grid2>

            {/* Definición de Tipos de Atributo */}
            <Grid2 size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="overline">
                  Definir Tipos de Atributos
                </Typography>
              </Divider>
            </Grid2>
            {formData.attributeTypes.map((attrType, index) => (
              <Grid2
                size={{ xs: 12 }}
                container
                spacing={1}
                key={attrType.id}
                sx={{ mb: 1, pl: { xs: 0, sm: 2 } }}
              >
                {" "}
                <Grid2 size={{ xs: 10, sm: 5 }}>
                  {" "}
                  <TextField
                    label={`Nombre Atributo #${index + 1}`}
                    value={attrType.name}
                    onChange={(e) =>
                      handleAttributeTypeNameChange(attrType.id, e.target.value)
                    }
                    required
                    fullWidth
                    size="small"
                    disabled={isSubmitting}
                    error={!!validationErrors?.attributeTypes?.[index]?.name}
                    helperText={validationErrors?.attributeTypes?.[index]?.name}
                  />{" "}
                </Grid2>{" "}
                <Grid2
                  size={{ xs: 2, sm: 1 }}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  {" "}
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveAttributeType(attrType.id)}
                    disabled={
                      isSubmitting ||
                      (formData.attributeTypes.length === 1 &&
                        formData.variants.length > 0)
                    }
                    sx={{
                      color:
                        formData.attributeTypes.length === 1 &&
                        formData.variants.length > 0
                          ? "grey.400"
                          : "error.main",
                    }}
                  >
                    {" "}
                    <Tooltip title="Eliminar Tipo Atributo">
                      <DeleteIcon fontSize="inherit" />
                    </Tooltip>{" "}
                  </IconButton>{" "}
                </Grid2>{" "}
              </Grid2>
            ))}
            <Grid2 size={{ xs: 12 }}>
              <Button
                size="small"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddAttributeType}
                disabled={isSubmitting}
              >
                Añadir Tipo de Atributo
              </Button>
            </Grid2>

            {/* Sección de Variantes */}
            <Grid2 size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="overline">
                  Variantes del Producto
                </Typography>
              </Divider>
            </Grid2>
            {formData.variants.map((variant, vIndex) => {
              const variantErrors =
                validationErrors?.variants?.[variant.tempId];
              const isErrorExpanded = errorVariantId === variant.tempId;
              const currentVariantImage = variant.variantImage;
              return (
                <Grid2 size={{ xs: 12 }} key={variant.tempId}>
                  <Accordion
                    sx={{
                      border: 1,
                      borderColor: variantErrors ? "error.main" : "divider",
                      "&:before": { display: "none" },
                    }}
                    TransitionProps={{ unmountOnExit: true }}
                    defaultExpanded={
                      isErrorExpanded ||
                      formData.variants.length === 1 ||
                      vIndex === 0
                    }
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`variant-${variant.tempId}-content`}
                      id={`variant-${variant.tempId}-header`}
                      sx={{
                        "& .MuiAccordionSummary-content": {
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        {currentVariantImage?.url && (
                          <Avatar
                            src={currentVariantImage.url}
                            variant="rounded"
                            sx={{ width: 32, height: 32, mr: 1 }}
                          />
                        )}
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "medium" }}
                        >
                          {variant.name || `Variante #${vIndex + 1}`}
                        </Typography>
                        <Chip
                          label={`$${variant.publicPrice || "?.??"}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Box>
                        <Tooltip title="Duplicar Variante">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyVariant(variant.tempId);
                            }}
                            disabled={isSubmitting}
                            sx={{ mr: 0.5 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar Variante">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveVariant(variant.tempId);
                            }}
                            disabled={isSubmitting}
                            sx={{ color: "error.main" }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid2 container spacing={2}>
                        <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
                          <TextField
                            label="Nombre Variante"
                            value={variant.name}
                            onChange={(e) =>
                              handleVariantInputChange(
                                variant.tempId,
                                "name",
                                e.target.value,
                              )
                            }
                            required
                            fullWidth
                            size="small"
                            disabled={isSubmitting}
                            error={!!variantErrors?.name}
                            helperText={
                              variantErrors?.name ||
                              (variant.variantNameManuallyEdited
                                ? "Nombre editado manualmente"
                                : "Nombre generado automáticamente")
                            }
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
                          <TextField
                            label="Precio Público ($)"
                            name="publicPrice"
                            type="number"
                            value={variant.publicPrice}
                            onChange={(e) =>
                              handleVariantInputChange(
                                variant.tempId,
                                "publicPrice",
                                e.target.value,
                              )
                            }
                            required
                            fullWidth
                            size="small"
                            disabled={isSubmitting}
                            inputProps={{ step: "0.01", min: "0" }}
                            error={!!variantErrors?.publicPrice}
                            helperText={variantErrors?.publicPrice}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
                          <TextField
                            label="PVM ($)"
                            name="prixerPrice"
                            type="number"
                            value={variant.prixerPrice}
                            onChange={(e) =>
                              handleVariantInputChange(
                                variant.tempId,
                                "prixerPrice",
                                e.target.value,
                              )
                            }
                            required
                            fullWidth
                            size="small"
                            disabled={isSubmitting}
                            inputProps={{ step: "0.01", min: "0" }}
                            error={!!variantErrors?.prixerPrice}
                            helperText={variantErrors?.prixerPrice}
                          />
                        </Grid2>

                        {/* Sección para la imagen de la variante */}
                        <Grid2 size={{ xs: 12, md: 4 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                            }}
                          >
                            {currentVariantImage &&
                            (currentVariantImage.url ||
                              currentVariantImage.file) ? (
                              <Box
                                sx={{
                                  width: 88,
                                  height: 88,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  borderRadius: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  overflow: "hidden",
                                  position: "relative",
                                  flexShrink: 0,
                                }}
                              >
                                {currentVariantImage.url ? (
                                  <img
                                    src={currentVariantImage.url}
                                    alt={`Variante ${variant.name}`}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : currentVariantImage.file ? (
                                  <Box
                                    sx={{
                                      width: "100%",
                                      height: "100%",
                                      p: 0.5,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexDirection: "column",
                                      bgcolor: "grey.100",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      noWrap
                                      sx={{
                                        width: "100%",
                                        fontSize: "0.6rem",
                                        textAlign: "center",
                                      }}
                                    >
                                      {currentVariantImage.file.name}
                                    </Typography>
                                    {typeof currentVariantImage.progress ===
                                      "number" &&
                                      currentVariantImage.progress < 100 && (
                                        <LinearProgress
                                          variant="determinate"
                                          value={currentVariantImage.progress}
                                          sx={{ width: "80%", mt: 0.5 }}
                                        />
                                      )}
                                  </Box>
                                ) : (
                                  <BrokenImageIcon
                                    sx={{ fontSize: 24, color: "grey.400" }}
                                  />
                                )}
                                {currentVariantImage.error && (
                                  <Tooltip title={currentVariantImage.error}>
                                    <Alert
                                      severity="error"
                                      sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        p: 0.2,
                                        fontSize: "0.6rem",
                                        justifyContent: "center",
                                      }}
                                      icon={false}
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  width: 88,
                                  height: 88,
                                  border: "1px dashed",
                                  borderColor: "divider",
                                  borderRadius: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  bgcolor: "action.hover",
                                }}
                              >
                                <BrokenImageIcon
                                  sx={{ fontSize: 24, color: "grey.400" }}
                                />
                              </Box>
                            )}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp, image/gif"
                                onChange={(e) =>
                                  handleVariantImageSelect(e, variant.tempId)
                                }
                                style={{ display: "none" }}
                                id={`variant-image-input-${variant.tempId}`}
                              />
                              <label
                                htmlFor={`variant-image-input-${variant.tempId}`}
                              >
                                <Button
                                  variant="outlined"
                                  component="span"
                                  color="secondary"
                                  startIcon={<PhotoCameraBackIcon />}
                                  disabled={
                                    isSubmitting ||
                                    (!!currentVariantImage?.file &&
                                      typeof currentVariantImage?.progress ===
                                        "number" &&
                                      currentVariantImage.progress < 100)
                                  }
                                  size="small"
                                  // sx={{ mb: 0.5 }}
                                  // color="gray"
                                >
                                  {currentVariantImage?.url ||
                                  currentVariantImage?.file
                                    ? "Cambiar"
                                    : "Añadir"}
                                </Button>
                              </label>
                              {(currentVariantImage?.url ||
                                currentVariantImage?.file) && (
                                <Button
                                  variant="outlined"
                                  component="span"
                                  size="small"
                                  color="secondary"
                                  onClick={() =>
                                    handleRemoveVariantImage(variant.tempId)
                                  }
                                  startIcon={<DeleteIcon />}
                                  disabled={
                                    isSubmitting ||
                                    (!!currentVariantImage?.file &&
                                      typeof currentVariantImage?.progress ===
                                        "number" &&
                                      currentVariantImage.progress < 100)
                                  }
                                  // variant="text"
                                  // sx={{ display: "block" }}
                                >
                                  Quitar
                                </Button>
                              )}
                            </Box>
                          </Box>
                          {variantErrors?.variantImage && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                              {variantErrors.variantImage}
                            </FormHelperText>
                          )}
                        </Grid2>

                        {/* Attribute Values Section */}
                        <Grid2 size={{ xs: 12 }}>
                          <Typography
                            variant="body2"
                            sx={{ mt: 1, mb: 0.5, fontWeight: "medium" }}
                          >
                            Valores de Atributos:
                          </Typography>
                        </Grid2>
                        {formData.attributeTypes
                          .filter((at) => at.name.trim())
                          .map((attrType) => (
                            <Grid2
                              size={{ xs: 12, sm: 6, md: 4 }}
                              key={`${variant.tempId}-${attrType.id}`}
                            >
                              <TextField
                                label={attrType.name}
                                value={variant.attributes[attrType.name] || ""}
                                onChange={(e) =>
                                  handleVariantAttributeValueChange(
                                    variant.tempId,
                                    attrType.name,
                                    e.target.value,
                                  )
                                }
                                required
                                fullWidth
                                size="small"
                                disabled={isSubmitting}
                                error={
                                  !!variantErrors?.attributeValues &&
                                  !variant.attributes[attrType.name]?.trim()
                                }
                                helperText={
                                  !!variantErrors?.attributeValues &&
                                  !variant.attributes[attrType.name]?.trim()
                                    ? "Valor requerido"
                                    : ""
                                }
                              />
                            </Grid2>
                          ))}
                        {variantErrors?.attributeValues && (
                          <Grid2 size={{ xs: 12 }}>
                            <FormHelperText error>
                              {variantErrors.attributeValues}
                            </FormHelperText>
                          </Grid2>
                        )}
                      </Grid2>
                    </AccordionDetails>
                  </Accordion>
                </Grid2>
              );
            })}
            <Grid2 size={{ xs: 12 }}>
              <Button
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddVariant}
                disabled={
                  isSubmitting ||
                  (formData.attributeTypes.filter((at) => at.name.trim())
                    .length === 0 &&
                    formData.attributeTypes.length > 0)
                }
              >
                Añadir Variante
              </Button>
              {formData.attributeTypes.filter((at) => at.name.trim()).length ===
                0 &&
                formData.attributeTypes.length > 0 && (
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ ml: 2 }}
                  >
                    Defina nombres para los tipos de atributos primero.
                  </Typography>
                )}
            </Grid2>

            {/* Acciones Finales */}
            {validationErrors?.product?.name && !formData.name.trim()
              ? null
              : validationErrors?.product?.name && (
                  <Grid2 size={{ xs: 12 }}>
                    <Alert severity="error" sx={{ mt: 2 }}>
                      Error: {validationErrors.product.name}
                    </Alert>
                  </Grid2>
                )}
            <Grid2 size={{ xs: 12 }}>
              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={2}
                sx={{ mt: 3 }}
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
                  disabled={
                    isSubmitting ||
                    productImages.some(
                      (img) =>
                        img.file &&
                        typeof img.progress === "number" &&
                        img.progress < 100,
                    ) ||
                    formData.variants.some(
                      (v) =>
                        v.variantImage?.file &&
                        typeof v.variantImage?.progress === "number" &&
                        v.variantImage.progress < 100,
                    )
                  }
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {isSubmitting ? "Creando..." : "Crear Producto"}
                </Button>
              </Stack>
            </Grid2>
          </Grid2>
        </form>
      </Paper>

      {/* Modal de Recorte Global */}
      {imageSrcForCropper && imageToCropDetails && (
        <Dialog
          open={cropModalOpen}
          onClose={closeAndResetCropper}
          maxWidth="lg"
          PaperProps={{
            sx: { minWidth: { xs: "90vw", sm: "70vw", md: "50vw" } },
          }}
        >
          <DialogTitle>
            Recortar Imagen (Aspecto{" "}
            {PRODUCT_IMAGE_ASPECT === 1
              ? "1:1"
              : `${(PRODUCT_IMAGE_ASPECT * 16).toFixed(0)}:16`}
            )
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
              aspect={PRODUCT_IMAGE_ASPECT}
              minWidth={100}
              minHeight={100}
              keepSelection
            >
              <img
                alt="Recortar"
                src={imageSrcForCropper}
                onLoad={onImageLoadInCropper}
                style={{
                  maxHeight: "70vh",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            </ReactCrop>
            <canvas ref={previewCanvasRef} style={{ display: "none" }} />
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
            <Button onClick={closeAndResetCropper} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmCropAndUpload}
              variant="contained"
              disabled={
                !completedCrop?.width || !completedCrop?.height || isSubmitting
              }
            >
              Confirmar y Subir
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default CreateProduct;
