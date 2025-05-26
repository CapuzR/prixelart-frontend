// src/components/ArtUploader/ArtUploader.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  FormEvent,
  useRef,
  forwardRef,
} from "react"
import { useNavigate } from "react-router-dom"

import { useSnackBar, usePrixerCreator, useUser } from "context/GlobalContext"
import { Art } from "../../../types/art.types"

import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormHelperText,
  Select,
  SelectChangeEvent,
  MenuItem,
  InputLabel,
  FormControl,
  Autocomplete,
  Chip,
  InputAdornment,
  Slide,
  Container,
  Snackbar,
} from "@mui/material"
import { TransitionProps } from "@mui/material/transitions"
import DeleteIcon from "@mui/icons-material/Delete"
// import Title from '@apps/admin/components/Title'; // Asumiendo que este componente es para el Dialog
import Grid2 from "@mui/material/Grid"

import BrokenImageIcon from "@mui/icons-material/BrokenImage"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import InfoIcon from "@mui/icons-material/Info"
import CloseIcon from "@mui/icons-material/Close"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"

import axios from "axios"
import { PrixResponse } from "types/prixResponse.types"

import * as tus from "tus-js-client"
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { BACKEND_URL } from "@api/utils.api"
import PhotoCameraBackIcon from "@mui/icons-material/PhotoCameraBack"
import util from "@utils/utils"
import { nanoid } from "nanoid"
interface ImageUploadState {
  id: string
  url: string
  file?: File
  progress?: number
  error?: string
}

type SourceImageFieldName = "sourceArtImage"

const ART_IMAGE_FIELD_CONFIG: Record<
  SourceImageFieldName,
  { aspect: number; label: string; artFieldName: keyof Pick<Art, "imageUrl"> }
> = {
  sourceArtImage: {
    label: "Original",
    aspect: 0,
    artFieldName: "imageUrl",
  }, // square: { label: "1:1 Cuadrado", aspect: 1 / 1, artFieldName: "" },
  // horizontal1: { label: "16:9 Horizontal", aspect: 16 / 9, artFieldName: "" },
  // vertical1: { label: "9:16 Vertical", aspect: 9 / 16, artFieldName: "" },
  // horizontal2: { label: "4:3 Horizontal", aspect: 4 / 3, artFieldName: "" },
  // vertical2: { label: "3:4 Vertical", aspect: 3 / 4, artFieldName: "" },
  // horizonta3: { label: "3:2 Horizontal", aspect: 3 / 2, artFieldName: "" },
  // vertical3: { label: "2:3 Vertical", aspect: 2 / 3, artFieldName: "" },
}

interface ArtFormDataState
  extends Pick<
    Art,
    | "title"
    | "description"
    | "category"
    | "tags"
    | "artType"
    | "originalPhotoWidth"
    | "originalPhotoHeight"
    | "originalPhotoIso"
    | "originalPhotoPpi"
    | "artLocation"
    | "exclusive"
    | "comission"
    | "crops"
  > {
  artist?: string
  year?: string
  medium?: string
  dimensions?: string
}

interface ArtValidationErrors {
  [key: string]: string | undefined
  mainImage?: string
  detailImage1?: string
  detailImage2?: string
}

// --- Initial State ---
const initialArtFormDataState: ArtFormDataState = {
  title: "",
  artist: "",
  year: "",
  medium: "",
  dimensions: "",
  description: "",
  tags: ["arte"],
  category: "",
  artType: "",
  originalPhotoWidth: "0",
  originalPhotoHeight: "0",
  originalPhotoIso: "0",
  originalPhotoPpi: "0",
  artLocation: "",
  exclusive: "standard",
  comission: 10,
  crops: [],
}

const photoIsos: string[] = ["100", "200", "400", "800", "1600", "3200"]
const artTypesList: string[] = [
  "Diseño",
  "Foto",
  "Pintura",
  "Arte plástica",
  "Ilustración Digital",
]
const categoriesList: string[] = [
  "Abstracto",
  "Animales",
  "Arquitectura",
  "Atardecer",
  "Bodegón",
  "Cacao",
  "Café",
  "Carros",
  "Ciudades",
  "Comida",
  "Conceptual",
  "Edificios",
  "Escultura",
  "Fauna",
  "Figura Humana",
  "Flora",
  "Fotoperiodismo",
  "Lanchas, barcos o yates",
  "Macro",
  "Minimalista",
  "Montañas",
  "Naturaleza",
  "Navidad",
  "Paisaje Urbano",
  "Paisaje",
  "Personajes célebres",
  "Personajes religiosos",
  "Pintura Digital",
  "Playas",
  "Puentes",
  "Retrato",
  "Surrealista",
  "Transportes",
  "Vehículos",
  "Viajes",
]
const preTags: string[] = [
  "arte",
  "fotografia",
  "pintura",
  "diseño",
  "abstracto",
]

async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("No 2d context")
  }
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const pixelRatio = window.devicePixelRatio || 1
  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)
  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = "high"
  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY
  const rotateRads = (rotate * Math.PI) / 180
  const centerX = image.naturalWidth / 2
  const centerY = image.naturalHeight / 2
  ctx.save()
  ctx.translate(-cropX, -cropY)
  ctx.translate(centerX, centerY)
  ctx.rotate(rotateRads)
  ctx.scale(scale, scale)
  ctx.translate(-centerX, -centerY)
  ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight)
  ctx.restore()
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  if (aspect <= 0) {
    return {
      unit: "%",
      width: 100,
      height: 100,
      x: 0,
      y: 0,
    }
  }
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 100,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function ArtUploader() {
  const navigate = useNavigate()
  const { showSnackBar: showSnackBarFromContext } = useSnackBar()
  const showSnackBarRef = useRef(showSnackBarFromContext)
  const { uploadArt, setArtModal } = usePrixerCreator()
  const { user } = useUser()

  useEffect(() => {
    showSnackBarRef.current = showSnackBarFromContext
  }, [showSnackBarFromContext])

  const formRef = useRef<HTMLFormElement>(null)

  const [formData, setFormData] = useState<ArtFormDataState>(
    initialArtFormDataState
  )

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [validationErrors, setValidationErrors] =
    useState<ArtValidationErrors | null>(null)

  const [maxPrintHeightCm, setMaxPrintHeightCm] = useState<string>("")
  const [maxPrintWidthCm, setMaxPrintWidthCm] = useState<string>("")
  const [requiredPhotoMeta, setRequiredPhotoMeta] = useState<boolean>(false)
  const [sourceImageState, setSourceImageState] =
    useState<ImageUploadState | null>(null)

  // Actualizar imageStateSetters e imageStates
  const imageStateSetters: Record<
    SourceImageFieldName,
    React.Dispatch<React.SetStateAction<ImageUploadState | null>>
  > = {
    sourceArtImage: setSourceImageState,
  }
  const imageStates: Record<SourceImageFieldName, ImageUploadState | null> = {
    sourceArtImage: sourceImageState,
  }

  const [imageToCropDetails, setImageToCropDetails] = useState<{
    originalFile: File
    targetField: SourceImageFieldName
  } | null>(null)
  const [imageSrcForCropper, setImageSrcForCropper] = useState<string | null>(
    null
  )
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (uploadArt) {
      setFormData(initialArtFormDataState)
      setValidationErrors(null)
      setMaxPrintHeightCm("")
      setMaxPrintWidthCm("")
      setRequiredPhotoMeta(false)
    }
  }, [uploadArt])

  useEffect(() => {
    if (formData.artType === "Foto") {
      handleMaxPrintCalc()
    } else {
      setMaxPrintWidthCm("")
      setMaxPrintHeightCm("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.originalPhotoWidth,
    formData.originalPhotoHeight,
    formData.originalPhotoPpi,
    formData.originalPhotoIso,
    formData.artType,
  ])

  // --- Manejadores de Recorte e Imagen ---
  const onImageLoadInCropper = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget
    const { width, height } = e.currentTarget
    if (imageToCropDetails) {
      const aspect =
        ART_IMAGE_FIELD_CONFIG[imageToCropDetails.targetField].aspect
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  const openCropperWithFile = (
    file: File,
    targetField: SourceImageFieldName
  ) => {
    setImageToCropDetails({ originalFile: file, targetField })
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImageSrcForCropper(reader.result?.toString() || null)
      setCropModalOpen(true)
    })
    reader.readAsDataURL(file)
  }

  const handleFileSelectForField = (
    event: ChangeEvent<HTMLInputElement>,
    fieldName: SourceImageFieldName
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      if (file.size > 15 * 1024 * 1024) {
        showSnackBarRef.current("El archivo es muy grande. Máximo 15MB.")
        if (event.target) (event.target as HTMLInputElement).value = ""
        return
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        showSnackBarRef.current("Formato no permitido. Solo JPG, PNG, WEBP.")
        if (event.target) (event.target as HTMLInputElement).value = ""
        return
      }
      openCropperWithFile(file, fieldName)
    }
    // No resetear event.target.value aquí si se quiere mantener la selección en caso de error de validación antes del cropper
  }

  const closeAndResetCropper = () => {
    setCropModalOpen(false)
    setImageSrcForCropper(null)
    setImageToCropDetails(null)
    setCrop(undefined)
    setCompletedCrop(undefined)
    if (imgRef.current) imgRef.current = null
  }

  const handleConfirmCropAndUpload = async () => {
    const showSnackBar = showSnackBarRef.current
    if (
      !completedCrop ||
      !imgRef.current ||
      !previewCanvasRef.current ||
      !imageToCropDetails
    ) {
      showSnackBar("Error: No se pudo procesar el recorte.")
      return
    }
    await canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop)
    previewCanvasRef.current.toBlob(
      (blob) => {
        if (!blob) {
          showSnackBar("Error: No se pudo crear el archivo WebP.")
          return
        }
        const { originalFile, targetField } = imageToCropDetails
        let originalNameWithoutExtension = originalFile.name
        const lastDotIndex = originalFile.name.lastIndexOf(".")
        if (lastDotIndex > 0)
          originalNameWithoutExtension = originalFile.name.substring(
            0,
            lastDotIndex
          )
        const webpFileName = `${targetField}_${originalNameWithoutExtension.replace(/[^a-zA-Z0-9.]/g, "_")}_${Date.now()}.webp`
        const croppedWebpFile = new File([blob], webpFileName, {
          type: "image/webp",
        })

        closeAndResetCropper()
        const setImageState = imageStateSetters[targetField]
        if (setImageState) {
          setImageState({
            id: targetField,
            url: "",
            file: croppedWebpFile,
            progress: 0,
            error: undefined,
          })
          startTusUpload(croppedWebpFile, targetField)
        }
      },
      "image/webp",
      0.85
    )
  }

  const startTusUpload = (file: File, targetField: SourceImageFieldName) => {
    const showSnackBar = showSnackBarRef.current
    const setImageState = imageStateSetters[targetField]
    const upload = new tus.Upload(file, {
      endpoint: `${BACKEND_URL}/files`,
      retryDelays: [0, 1000, 3000, 5000],
      metadata: {
        filename: file.name,
        filetype: file.type,
        context: "artPieceImage",
        field: targetField,
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = Math.floor((bytesUploaded / bytesTotal) * 100)
        if (setImageState)
          setImageState((prev) =>
            prev ? { ...prev, progress: percentage } : null
          )
      },
      onSuccess: async () => {
        const tusUploadInstance = upload as any
        let finalS3Url: string | null = null
        if (tusUploadInstance._req?._xhr?.getResponseHeader) {
          finalS3Url =
            tusUploadInstance._req._xhr.getResponseHeader("x-final-url") ||
            tusUploadInstance._req._xhr.getResponseHeader("X-Final-URL")
        } else if (tusUploadInstance.xhr?.getResponseHeader) {
          finalS3Url =
            tusUploadInstance.xhr.getResponseHeader("x-final-url") ||
            tusUploadInstance.xhr.getResponseHeader("X-Final-URL")
        }
        if (finalS3Url && finalS3Url.startsWith("https://https//")) {
          finalS3Url = finalS3Url.replace("https://https//", "https://")
        }
        const imageUrl = finalS3Url || upload.url

        if (imageUrl && setImageState) {
          setImageState((prev) =>
            prev
              ? { ...prev, url: imageUrl, progress: 100, file: undefined }
              : null
          )
          showSnackBar(
            `Imagen para ${ART_IMAGE_FIELD_CONFIG[targetField].label} subida.`
          )
        } else {
          const errorMsg = "Error al obtener URL"
          if (setImageState)
            setImageState((prev) =>
              prev ? { ...prev, error: errorMsg, file: undefined } : null
            )
          showSnackBar(
            `Error al obtener URL para ${ART_IMAGE_FIELD_CONFIG[targetField].label}.`
          )
        }
      },
      onError: (error) => {
        const errorMsg = error.message || "Error desconocido"
        if (setImageState)
          setImageState((prev) =>
            prev ? { ...prev, error: errorMsg, file: undefined } : null
          )
        showSnackBar(
          `Error al subir para ${ART_IMAGE_FIELD_CONFIG[targetField].label}: ${errorMsg}`
        )
      },
    })
    upload.start()
  }

  const handleRemoveImageField = (fieldName: SourceImageFieldName) => {
    const setImageState = imageStateSetters[fieldName]
    if (setImageState) {
      setImageState(null)
      showSnackBarRef.current(
        `Imagen para ${ART_IMAGE_FIELD_CONFIG[fieldName].label} eliminada.`
      )
    }
  }

  const handleInputChange = (
    event:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>,
    fieldName?: keyof ArtFormDataState
  ) => {
    let name: keyof ArtFormDataState | string
    let value: string | boolean

    if ("target" in event && event.target && "name" in event.target) {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement
      name = target.name as keyof ArtFormDataState

      if (target instanceof HTMLInputElement && target.type === "checkbox") {
        value = target.checked
      } else {
        value = target.value
      }
    } else if (fieldName && "target" in event) {
      name = fieldName
      value = (event as SelectChangeEvent<string>).target.value
    } else {
      console.error(
        "ArtUploader - handleInputChange: Evento no manejado o fieldName faltante para Select.",
        event
      )
      return
    }

    setFormData((prev) => ({ ...prev, [name as string]: value }))

    if (validationErrors?.[name as string]) {
      setValidationErrors((prev) => {
        if (!prev) return null
        const newErrors = { ...prev }
        delete newErrors[name as string]
        return Object.keys(newErrors).length > 0 ? newErrors : null
      })
    }
  }

  const handleTagsChange = (
    event: React.SyntheticEvent,
    newValue: string[]
  ) => {
    setFormData((prev) => ({ ...prev, tags: newValue }))
  }

  const handleMaxPrintCalc = () => {
    const showSnackBar = showSnackBarRef.current
    const widthNum = parseInt(formData?.originalPhotoWidth, 10)
    const heightNum = parseInt(formData?.originalPhotoHeight, 10)
    const ppiNum = parseInt(formData?.originalPhotoPpi, 10)

    if (
      widthNum > 0 &&
      heightNum > 0 &&
      ppiNum > 0 &&
      formData.originalPhotoIso
    ) {
      const [widthCm, heightCm] = util.maxPrintCalc(
        widthNum,
        heightNum,
        ppiNum,
        formData.originalPhotoIso
      )
      setMaxPrintWidthCm(String(widthCm))
      setMaxPrintHeightCm(String(heightCm))
    } else if (formData.artType === "Foto") {
      if (
        !formData.originalPhotoIso &&
        widthNum > 0 &&
        heightNum > 0 &&
        ppiNum > 0
      )
        showSnackBar("Indica el ISO.")
      else if (
        formData.originalPhotoIso &&
        (!widthNum || !heightNum) &&
        ppiNum > 0
      )
        showSnackBar("Indica Ancho y Alto (px).")
      else if (
        formData.originalPhotoIso &&
        widthNum > 0 &&
        heightNum > 0 &&
        !ppiNum
      )
        showSnackBar("Indica los PPI.")
    }
  }

  const validateForm = (): boolean => {
    const showSnackBar = showSnackBarRef.current
    const errors: ArtValidationErrors = {}
    let hasErrors = false

    if (!formData.title.trim()) {
      errors.title = "Título es obligatorio."
      hasErrors = true
    }
    // TODO: undo the comment
    // if (!formData.description.trim() || formData.description.length < 20) {
    //   errors.description =
    //     "Descripción detallada es obligatoria (mín. 20 caracteres)."
    //   hasErrors = true
    // }
    if (!formData.category?.trim()) {
      errors.category = "Categoría principal es obligatoria."
      hasErrors = true
    }
    if (!formData.artType?.trim()) {
      errors.artType = "Tipo de arte es obligatorio."
      hasErrors = true
    }
    if (!formData.tags || formData.tags.length === 0) {
      errors.tags = "Añade al menos una etiqueta."
      hasErrors = true
    }

    if (formData.artType === "Foto") {
      if (!formData.originalPhotoWidth) {
        errors.originalPhotoWidth = "Ancho (px) es obligatorio para fotos."
        hasErrors = true
      }
      if (!formData.originalPhotoHeight) {
        errors.originalPhotoHeight = "Alto (px) es obligatorio para fotos."
        hasErrors = true
      }
      if (!formData.originalPhotoPpi) {
        errors.originalPhotoPpi = "PPI es obligatorio para fotos."
        hasErrors = true
      }
      if (!formData.originalPhotoIso) {
        errors.originalPhotoIso = "ISO es obligatorio para fotos."
        hasErrors = true
      }
    }

    setValidationErrors(hasErrors ? errors : null)
    if (hasErrors) {
      showSnackBar("Por favor, corrija los errores indicados.")
      const firstErrorKey = Object.keys(errors)[0]
      const errorElement =
        document.getElementsByName(firstErrorKey)[0] ||
        document.getElementById(`image-input-${firstErrorKey}`)
      errorElement?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    return !hasErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const showSnackBar = showSnackBarRef.current
    if (!validateForm()) return
    setIsSubmitting(true)
    setValidationErrors(null)

    const payload: Partial<Art> = {
      ...formData,
      imageUrl: sourceImageState?.url || "",
      artId: nanoid(7),
      prixerUsername: user?.username,
      userId: user ? user._id?.toString() : undefined, // TODO: add this value on backend
      status: "Active",
      visible: true,
    }

    try {
      console.log(
        "Creating New Art Piece Data:",
        JSON.stringify(payload, null, 2)
      )
      const base_url = `${import.meta.env.VITE_BACKEND_URL}/art/create`
      const response = await axios.post<PrixResponse>(base_url, payload, {
        withCredentials: true,
      })
      if (response && response.data.success) {
        showSnackBar(`Obra "${formData.title}" creada exitosamente.`)
        onClose()
      } else {
        throw new Error(`La creación de la obra falló o no devolvió respuesta.`)
      }
    } catch (err: any) {
      console.error(`Failed to create art piece:`, err)
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        `Error desconocido al crear la obra.`
      setValidationErrors({ title: errorMessage })
      showSnackBar(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderImageField = (fieldName: SourceImageFieldName) => {
    const imageState = imageStates[fieldName]
    const config = ART_IMAGE_FIELD_CONFIG[fieldName]
    const errorHelperText = validationErrors?.[fieldName]

    return (
      <Grid2
        size={{ xs: 12 }}
        key={fieldName}
        sx={{ display: "flex", flexDirection: "column" }}
      >
        <Typography
          variant="subtitle2"
          gutterBottom
          color="secondary"
          style={{ alignSelf: "center" }}
        >
          {config.label}
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: 150 * (1 / config.aspect),
              maxHeight: 370,
              border: `1px dashed ${errorHelperText ? "red" : "grey.400"}`,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
              bgcolor:
                imageState?.url || imageState?.file
                  ? "transparent"
                  : "action.hover",
            }}
          >
            {imageState?.url ? (
              <img
                src={imageState.url}
                alt={config.label}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : imageState?.file ? (
              <Box
                sx={{
                  textAlign: "center",
                  p: 1,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  display="block"
                  noWrap
                  sx={{ maxWidth: "90%", wordBreak: "break-all" }}
                >
                  {imageState.file.name}
                </Typography>
                {typeof imageState.progress === "number" &&
                  imageState.progress < 100 && (
                    <LinearProgress
                      variant="determinate"
                      value={imageState.progress}
                      sx={{ width: "80%", mx: "auto", mt: 1 }}
                    />
                  )}
              </Box>
            ) : (
              <BrokenImageIcon sx={{ fontSize: 48, color: "grey.400" }} />
            )}
            {imageState?.error && (
              <Tooltip title={imageState.error}>
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
                    zIndex: 1,
                  }}
                  icon={false}
                />
              </Tooltip>
            )}
          </Box>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ width: "100%", mt: "auto", pt: 1 }}
          >
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => handleFileSelectForField(e, fieldName)}
              style={{ display: "none" }}
              id={`image-input-${fieldName}`}
              disabled={
                isSubmitting ||
                (!!imageState?.file &&
                  typeof imageState?.progress === "number" &&
                  imageState.progress < 100)
              }
            />
            <label htmlFor={`image-input-${fieldName}`}>
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCameraBackIcon />}
                disabled={
                  isSubmitting ||
                  (!!imageState?.file &&
                    typeof imageState?.progress === "number" &&
                    imageState.progress < 100)
                }
                size="small"
                color="secondary"
              >
                {imageState?.url || imageState?.file
                  ? "Cambiar"
                  : "Seleccionar"}
              </Button>
            </label>
            {(imageState?.url || imageState?.file) && (
              <Button
                size="small"
                color="error"
                variant="text"
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveImageField(fieldName)}
                disabled={
                  isSubmitting ||
                  (!!imageState?.file &&
                    typeof imageState?.progress === "number" &&
                    imageState.progress < 100)
                }
              >
                Quitar
              </Button>
            )}
          </Stack>
          {errorHelperText && (
            <FormHelperText error sx={{ textAlign: "center", mt: 0.5 }}>
              {errorHelperText}
            </FormHelperText>
          )}
        </Paper>
      </Grid2>
    )
  }

  // --- Render ---
  if (!open) {
    return null
  }

  const onClose = () => setArtModal(false)

  return (
    <Dialog open={uploadArt} onClose={onClose} TransitionComponent={Transition}>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Button
            sx={{ marginLeft: "auto" }}
            color="inherit"
            type="submit"
            form="art-uploader-form"
            disabled={
              isSubmitting ||
              Object.values(imageStates).some(
                (imgState) =>
                  imgState?.file &&
                  typeof imgState?.progress === "number" &&
                  imgState.progress < 100
              )
            }
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {isSubmitting ? "Creando..." : "Crear Obra"}
          </Button>
        </Toolbar>
      </AppBar>
      <Container
        component="main"
        maxWidth="lg"
        sx={{ py: 3, overflowY: "auto" }}
      >
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 } }}>
          <form
            onSubmit={handleSubmit}
            noValidate
            ref={formRef}
            id="art-uploader-form"
          >
            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12 }}>
                <TextField
                  label="Título de la Obra"
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
              {renderImageField("sourceArtImage")}
              <Grid2 size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="overline">
                    Detalles Adicionales
                  </Typography>
                </Divider>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <FormControl
                  fullWidth
                  required
                  error={!!validationErrors?.artType}
                >
                  <InputLabel id="artType-label">Tipo de Arte</InputLabel>
                  <Select
                    labelId="artType-label"
                    name="artType"
                    value={formData.artType}
                    label="Tipo de Arte"
                    onChange={(e) => {
                      handleInputChange(e, "artType")
                      setRequiredPhotoMeta(e.target.value === "Foto")
                    }}
                  >
                    <MenuItem value="">_Selecciona un tipo</MenuItem>
                    {artTypesList.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors?.artType && (
                    <FormHelperText>{validationErrors.artType}</FormHelperText>
                  )}
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <FormControl
                  fullWidth
                  required
                  error={!!validationErrors?.category}
                >
                  <InputLabel id="category-label">
                    Categoría Principal
                  </InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category}
                    label="Categoría Principal"
                    onChange={(e) => handleInputChange(e, "category")}
                  >
                    <MenuItem value="">Selecciona una categoría</MenuItem>
                    {categoriesList.sort().map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors?.category && (
                    <FormHelperText>{validationErrors.category}</FormHelperText>
                  )}
                </FormControl>
              </Grid2>
              {formData.artType === "Foto" && (
                <React.Fragment>
                  <Grid2 size={{ xs: 12 }}>
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ mt: 2, fontWeight: "bold" }}
                    >
                      Detalles de la Fotografía Original
                    </Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="Ancho (px)"
                      name="originalPhotoWidth"
                      type="number"
                      value={formData.originalPhotoWidth}
                      onChange={handleInputChange}
                      fullWidth
                      required={requiredPhotoMeta}
                      disabled={isSubmitting}
                      InputProps={{ inputProps: { min: 0 } }}
                      error={!!validationErrors?.originalPhotoWidth}
                      helperText={validationErrors?.originalPhotoWidth}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="Alto (px)"
                      name="originalPhotoHeight"
                      type="number"
                      value={formData.originalPhotoHeight}
                      onChange={handleInputChange}
                      fullWidth
                      required={requiredPhotoMeta}
                      disabled={isSubmitting}
                      InputProps={{ inputProps: { min: 0 } }}
                      error={!!validationErrors?.originalPhotoHeight}
                      helperText={validationErrors?.originalPhotoHeight}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="PPI"
                      name="originalPhotoPpi"
                      type="number"
                      value={formData.originalPhotoPpi}
                      onChange={handleInputChange}
                      fullWidth
                      required={requiredPhotoMeta}
                      disabled={isSubmitting}
                      InputProps={{ inputProps: { min: 0 } }}
                      helperText="Píxeles por pulgada"
                      error={!!validationErrors?.originalPhotoPpi}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl
                      fullWidth
                      required={requiredPhotoMeta}
                      error={!!validationErrors?.originalPhotoIso}
                    >
                      <InputLabel id="iso-label">ISO</InputLabel>
                      <Select
                        labelId="iso-label"
                        name="originalPhotoIso"
                        value={formData.originalPhotoIso}
                        label="ISO"
                        onChange={(e) =>
                          handleInputChange(e, "originalPhotoIso")
                        }
                      >
                        <MenuItem value="">_Selecciona ISO</MenuItem>
                        {photoIsos.map((iso) => (
                          <MenuItem key={iso} value={iso}>
                            {iso}
                          </MenuItem>
                        ))}
                      </Select>
                      {validationErrors?.originalPhotoIso && (
                        <FormHelperText>
                          {validationErrors.originalPhotoIso}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid2>
                  {maxPrintWidthCm && maxPrintHeightCm && (
                    <Grid2
                      size={{ xs: 12 }}
                      sx={{ textAlign: "center", my: 1 }}
                    >
                      <Typography variant="body2">
                        Impresión de alta calidad estimada:{" "}
                        <Typography
                          component="span"
                          variant="subtitle2"
                          color="primary"
                        >
                          {maxPrintWidthCm} x {maxPrintHeightCm} cm
                        </Typography>
                      </Typography>
                    </Grid2>
                  )}
                </React.Fragment>
              )}

              <Grid2 size={{ xs: 12 }}>
                <Autocomplete
                  multiple
                  id="tags-autocomplete"
                  options={preTags}
                  freeSolo
                  value={formData.tags}
                  onChange={handleTagsChange}
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
                      variant="outlined"
                      label="Etiquetas (Tags)"
                      placeholder="Añade etiquetas relevantes"
                      helperText="Ayuda a encontrar tu arte. Presiona Enter para añadir."
                      error={!!validationErrors?.tags}
                    />
                  )}
                />
                {validationErrors?.tags && (
                  <FormHelperText error>{validationErrors.tags}</FormHelperText>
                )}
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <TextField
                  label="Ubicación (Ciudad, País)"
                  name="artLocation"
                  value={formData.artLocation}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={isSubmitting}
                  error={!!validationErrors?.artLocation}
                  helperText={validationErrors?.artLocation}
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <TextField
                  label="Descripción / Inspiración"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  multiline
                  rows={4}
                  disabled={isSubmitting}
                  // error={!!validationErrors?.description}
                  helperText={
                    validationErrors?.description ||
                    `${formData.description.length}/1000 (mín. 20)`
                  }
                  inputProps={{ maxLength: 1000 }}
                />
              </Grid2>

              <Grid2 size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!validationErrors?.exclusive}>
                  <InputLabel id="exclusivity-label">Exclusividad</InputLabel>
                  <Select
                    labelId="exclusivity-label"
                    name="exclusive"
                    value={formData.exclusive}
                    label="Exclusividad"
                    onChange={(e) => {
                      handleInputChange(e, "exclusive")
                      if (e.target.value === "standard")
                        setFormData((p) => ({ ...p, comission: 10 }))
                    }}
                  >
                    <MenuItem value="standard">
                      Estándar (Comisión fija 10%)
                    </MenuItem>
                    <MenuItem value="exclusive">
                      Exclusivo en Plataforma
                    </MenuItem>
                    {/* <MenuItem value="private">Privado (No visible)</MenuItem> */}
                  </Select>
                  {validationErrors?.exclusive && (
                    <FormHelperText>
                      {validationErrors.exclusive}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Tu Comisión por Venta"
                  type="number"
                  name="comission"
                  value={formData.comission}
                  onChange={(e) => {
                    let val = parseInt(e.target.value, 10)
                    if (isNaN(val)) val = 10
                    if (val < 10) val = 10
                    if (val > 70) val = 70
                    handleInputChange(
                      {
                        target: { name: "comission", value: String(val) },
                      } as any,
                      "comission"
                    )
                  }}
                  disabled={formData.exclusive === "standard"}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                    inputProps: { min: 10, max: 70 },
                  }}
                  helperText={
                    formData.exclusive === "standard"
                      ? "Comisión fija para Estándar"
                      : "Define tu comisión (10%-70%)"
                  }
                  error={!!validationErrors?.comission}
                />
              </Grid2>

              {validationErrors?.title && !formData.title.trim()
                ? null
                : validationErrors?.title && (
                    <Grid2 size={{ xs: 12 }}>
                      <Alert severity="error" sx={{ mt: 2 }}>
                        Error General: {validationErrors.title}
                      </Alert>
                    </Grid2>
                  )}
            </Grid2>
          </form>
        </Paper>
      </Container>

      {imageSrcForCropper && imageToCropDetails && (
        <Dialog
          open={cropModalOpen}
          onClose={closeAndResetCropper}
          maxWidth="lg"
          PaperProps={{
            sx: { minWidth: { xs: "90vw", sm: "70vw", md: "50vw" } },
          }}
        >
          <DialogTitle style={{ alignSelf: "center" }}>
            Recortar{" "}
            {ART_IMAGE_FIELD_CONFIG[imageToCropDetails.targetField].label}
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
              aspect={
                ART_IMAGE_FIELD_CONFIG[imageToCropDetails.targetField].aspect
              }
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
      <Snackbar
        open={!!validationErrors?.title} // Mostrar si hay error general de validación
        autoHideDuration={6000}
        onClose={() => {
          if (validationErrors?.title)
            setValidationErrors((prev) => ({ ...prev, title: undefined }))
        }}
        message={validationErrors?.title}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: 90, sm: 24 } }}
      />
    </Dialog>
  )
}
