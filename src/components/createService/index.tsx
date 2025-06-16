import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useRef,
} from "react"
import axios from "axios"

import { useSnackBar, usePrixerCreator, useUser } from "context/GlobalContext"
import { Service } from "../../types/service.types"
import { PrixResponse } from "../../types/prixResponse.types"

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
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Slide,
  Container,
  Snackbar,
  useMediaQuery,
  CssBaseline,
  Backdrop,
} from "@mui/material"
import Grid2 from '@mui/material/Grid';
import { TransitionProps } from "@mui/material/transitions"
import DeleteIcon from "@mui/icons-material/Delete"
import CloseIcon from "@mui/icons-material/Close"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import { Theme, useTheme } from "@mui/material"
import { makeStyles } from "tss-react/mui"

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
import BrokenImageIcon from "@mui/icons-material/BrokenImage"
import InfoIcon from "@mui/icons-material/Info"
import { v4 as uuidv4 } from "uuid"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"
import Copyright from "@components/Copyright/copyright"
interface ImageUploadState {
  id: string
  url: string
  file?: File
  progress?: number
  error?: string
}

const SERVICE_IMAGE_ASPECT = 0

const serviceAreas = ["Diseño", "Fotografía", "Artes Plásticas", "Otro"]

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function CreateService() {
  const theme = useTheme()
  const { uploadService, setServiceModal } = usePrixerCreator()
  const { user } = useUser()
  const formRef = useRef<HTMLFormElement>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [serviceArea, setServiceArea] = useState("")
  const [location, setLocation] = useState("")
  const [isLocal, setIsLocal] = useState(false)
  const [isRemote, setIsRemote] = useState(false)
  const [priceFrom, setPriceFrom] = useState<number | string>("")
  const [priceTo, setPriceTo] = useState<number | string | undefined>("")
  const [productionTime, setProductionTime] = useState("")
  const [active, setActive] = useState(true)

  const [serviceImages, setServiceImages] = useState<ImageUploadState[]>([])
  const [imageToCropDetails, setImageToCropDetails] = useState<{
    originalFile: File
    tempId: string
  } | null>(null)
  const [imageSrcForCropper, setImageSrcForCropper] = useState<string | null>(
    null
  )
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false)

  const imgRef = useRef<HTMLImageElement | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [backdrop, setBackdrop] = useState(false)
  const { showSnackBar } = useSnackBar()

  useEffect(() => {
    if (uploadService) {
      setTitle("")
      setDescription("")
      setServiceArea("")
      setLocation("")
      setIsLocal(false)
      setIsRemote(false)
      setPriceFrom("")
      setPriceTo("")
      setProductionTime("")
      setActive(true)
      setServiceImages([])
    }
  }, [uploadService])

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

  const onImageLoadInCropper = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget
    const { naturalWidth, naturalHeight } = e.currentTarget
    if (naturalWidth > 0 && naturalHeight > 0) {
      setCrop(
        centerAspectCrop(naturalWidth, naturalHeight, SERVICE_IMAGE_ASPECT)
      )
    } else {
      showSnackBar(
        "Error al cargar imagen para recorte: dimensiones inválidas."
      )
      closeAndResetCropper()
    }
  }

  const openCropperWithFile = (file: File, tempId: string) => {
    setImageToCropDetails({ originalFile: file, tempId })
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImageSrcForCropper(reader.result?.toString() || null)
      setCropModalOpen(true)
    })
    reader.readAsDataURL(file)
  }

  const handleServiceImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      if (serviceImages.length >= 6) {
        showSnackBar("Has alcanzado el límite de 6 imágenes permitidas.")
        return
      }
      const file = event.target.files[0]
      if (file.size > 15 * 1024 * 1024) {
        showSnackBar("El archivo es muy grande. Máximo 15MB.")
        if (event.target) (event.target as HTMLInputElement).value = ""
        return
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        showSnackBar("Formato no permitido. Solo JPG, PNG, WEBP.")
        if (event.target) (event.target as HTMLInputElement).value = ""
        return
      }
      const tempImageId = uuidv4()
      openCropperWithFile(file, tempImageId)
    }
    if (event.target) (event.target as HTMLInputElement).value = ""
  }

  const closeAndResetCropper = () => {
    setCropModalOpen(false)
    setImageSrcForCropper(null)
    setImageToCropDetails(null)
    setCrop(undefined)
    setCompletedCrop(undefined)
    if (imgRef.current) imgRef.current = null
  }

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

  const handleConfirmCropAndUpload = async () => {
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
        const { originalFile, tempId } = imageToCropDetails
        let originalNameWithoutExtension = originalFile.name
        const lastDotIndex = originalFile.name.lastIndexOf(".")
        if (lastDotIndex > 0)
          originalNameWithoutExtension = originalFile.name.substring(
            0,
            lastDotIndex
          )
        const webpFileName = `service_${originalNameWithoutExtension.replace(/[^a-zA-Z0-9.]/g, "_")}_${Date.now()}.webp`
        const croppedWebpFile = new File([blob], webpFileName, {
          type: "image/webp",
        })

        closeAndResetCropper()
        setServiceImages((prev) => [
          ...prev,
          { id: tempId, url: "", file: croppedWebpFile, progress: 0 },
        ])
        startTusUpload(croppedWebpFile, tempId)
      },
      "image/webp",
      0.85
    )
  }

  const startTusUpload = (file: File, imageId: string) => {
    const upload = new tus.Upload(file, {
      endpoint: `${BACKEND_URL}/files`,
      retryDelays: [0, 1000, 3000, 5000],
      metadata: {
        filename: file.name,
        filetype: file.type,
        context: "serviceImage",
        imageId: imageId,
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = Math.floor((bytesUploaded / bytesTotal) * 100)
        setServiceImages((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...img, progress: percentage } : img
          )
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

        if (imageUrl) {
          setServiceImages((prev) =>
            prev.map((img) =>
              img.id === imageId
                ? { ...img, url: imageUrl, progress: 100, file: undefined }
                : img
            )
          )
          showSnackBar(`Imagen de servicio subida.`)
        } else {
          const errorMsg = "Error al obtener URL"
          setServiceImages((prev) =>
            prev.map((img) =>
              img.id === imageId
                ? { ...img, error: errorMsg, file: undefined }
                : img
            )
          )
          showSnackBar(`Error al obtener URL para la imagen.`)
        }
      },
      onError: (error) => {
        const errorMsg = error.message || "Error desconocido"
        setServiceImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, error: errorMsg, file: undefined }
              : img
          )
        )
        showSnackBar(`Error al subir imagen: ${errorMsg}`)
      },
    })
    upload.start()
  }

  const handleRemoveServiceImage = (idToRemove: string) => {
    setServiceImages((prev) => prev.filter((img) => img.id !== idToRemove))
    showSnackBar("Imagen eliminada de la lista.")
  }

  const handleEditorChange = (value: string) => {
    setDescription(value)
  }
  const handleServiceAreaChange = (e: SelectChangeEvent<string>) => {
    setServiceArea(e.target.value)
  }
  const handleClose = () => {
    setServiceModal(false)
  }
  const handleActive = () => {
    setActive(!active)
  }
  const handleIsLocal = () => {
    setIsLocal(!isLocal)
  }
  const handleIsRemote = () => {
    setIsRemote(!isRemote)
  }

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault()
    if (
      !title.trim() ||
      !description.trim() ||
      !serviceArea.trim() ||
      Number(priceFrom) <= 0
    ) {
      showSnackBar(
        "Por favor completa todos los campos obligatorios (Título, Descripción, Área, Precio Desde)."
      )
      return
    }
    if (
      serviceImages.some(
        (img) =>
          img.file && typeof img.progress === "number" && img.progress < 100
      )
    ) {
      showSnackBar("Algunas imágenes aún se están subiendo. Por favor espera.")
      return
    }

    setBackdrop(true)
    setIsSubmitting(true)

    const payload: Partial<Service> = {
      title: title,
      description: description,
      serviceArea: serviceArea,
      isLocal: isLocal,
      isRemote: isRemote,
      location: location,
      productionTime: productionTime,
      publicPrice: { from: Number(priceFrom), to: Number(priceTo) },
      prixer: user ? user._id?.toString() : undefined,
      sources: { images: serviceImages },
      active: active,
    }

    try {
      console.log("Creating New Service Data:")
      const base_url = `${import.meta.env.VITE_BACKEND_URL}/service/create`
      const response = await axios.post<PrixResponse>(base_url, payload, {
        withCredentials: true,
      })

      if (response.data.success) {
        showSnackBar("Servicio creado exitosamente.")
        onClose()
      } else {
        showSnackBar(
          response.data.message ||
          "Error al crear el servicio. Intenta de nuevo."
        )
      }
    } catch (err: any) {
      console.error("Failed to create service:", err)
      showSnackBar(
        err?.response?.data?.message ||
        err.message ||
        "Error desconocido al crear el servicio."
      )
    } finally {
      setBackdrop(false)
      setIsSubmitting(false)
    }
  }

  const onClose = () => setServiceModal(false)

  if (!uploadService) {
    return null
  }

  return (
    <div>
      <Dialog
        open={uploadService}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <Backdrop
          open={backdrop}
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <CircularProgress color="inherit" sx={{ mr: 2 }} />
          <Typography>
            Procesando tu servicio... <br />
            Esto puede tardar, por favor no cierres esta ventana.
          </Typography>
        </Backdrop>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
              Comparte tu Servicio
            </Typography>
            <Button
              autoFocus
              color="inherit"
              type="submit"
              form="create-service-form"
              disabled={
                isSubmitting ||
                serviceImages.some(
                  (img) => img.file && !img.error && img.progress !== 100
                )
              }
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isSubmitting ? "Guardando..." : "Guardar Servicio"}
            </Button>
          </Toolbar>
        </AppBar>
        <Container component="main" maxWidth="md">
          <CssBaseline />

          <form
            onSubmit={handleSubmit}
            noValidate
            ref={formRef}
            id="create-service-form"
            style={{
              width: "100%",
              marginTop: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Grid2 container spacing={2}>
              <Grid2 size={{ sm: 12 }}>
                <TextField
                  variant="outlined"
                  autoFocus
                  required
                  fullWidth
                  label="Título"
                  value={title}
                  placeholder='Ejemplo: "Fotografía de eventos" o "Diseño de logotipos"'
                  onChange={(e) => {
                    setTitle(e.target.value)
                  }}
                />
              </Grid2>

              {/* Sección de Imágenes del Servicio */}
              {/* <Grid2 size={{ xs: 12 }}>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="overline">
                      Imágenes del Servicio (hasta 6)
                    </Typography>
                  </Divider>
                </Grid2> */}
              <Grid2 size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: serviceImages.length > 0 ? 1 : 2,
                    minHeight: serviceImages.length > 0 ? "auto" : 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      serviceImages.length > 0 ? "flex-start" : "center",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {serviceImages.length > 0 ? (
                    serviceImages.map((sImage) => (
                      <Box
                        key={sImage.id}
                        sx={{
                          width: { xs: "calc(50% - 8px)", sm: 120, md: 150 },
                          height: { xs: 100, sm: 120, md: 120 },
                          position: "relative",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {sImage.url ? (
                          <img
                            src={sImage.url}
                            alt="Servicio"
                            style={{
                              width: "100%",
                              height: 150,
                              maxHeight: 370,
                              objectFit: "contain",
                            }}
                          />
                        ) : sImage.file ? (
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
                              {sImage.file.name}
                            </Typography>
                            {typeof sImage.progress === "number" &&
                              sImage.progress < 100 && (
                                <LinearProgress
                                  variant="determinate"
                                  value={sImage.progress}
                                  sx={{ width: "80%", mt: 0.5 }}
                                />
                              )}
                            {sImage.error && (
                              <Typography
                                variant="caption"
                                color="error"
                                sx={{
                                  fontSize: "0.65rem",
                                  textAlign: "center",
                                  mt: 0.5,
                                }}
                              >
                                {sImage.error}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "grey.200",
                            }}
                          >
                            <BrokenImageIcon
                              sx={{ fontSize: 30, color: "grey.400" }}
                            />
                          </Box>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveServiceImage(sImage.id)}
                          disabled={
                            isSubmitting ||
                            (typeof sImage.progress === "number" &&
                              sImage.progress < 100 &&
                              !sImage.error)
                          }
                          sx={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            backgroundColor: "rgba(255,255,255,0.8)",
                            "&:hover": {
                              backgroundColor: "rgba(255,255,255,1)",
                            },
                            p: 0.2,
                          }}
                          color="error"
                        >
                          <DeleteIcon sx={{ fontSize: "1rem" }} />
                        </IconButton>
                      </Box>
                    ))
                  ) : (
                    <Typography
                      sx={{ color: "text.secondary", fontStyle: "italic" }}
                    >
                      Aún no has subido imágenes para tu servicio.
                    </Typography>
                  )}
                  <Typography
                    variant="overline"
                    sx={{ textAlign: "end", width: "100%" }}
                  >
                    {serviceImages.length + "/6"}
                  </Typography>
                </Paper>
              </Grid2>
              <Grid2
                size={{ xs: 12 }}
              //  sm={4} md={3} lg={2}
              >
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleServiceImageSelect}
                  style={{ display: "none" }}
                  id="service-image-input"
                  disabled={isSubmitting || serviceImages.length >= 6}
                />
                <label htmlFor="service-image-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCameraBackIcon />}
                    disabled={isSubmitting || serviceImages.length >= 6}
                    fullWidth
                  >
                    Añadir Imagen
                  </Button>
                </label>
                {serviceImages.length >= 6 && (
                  <FormHelperText sx={{ textAlign: "center" }}>
                    Límite alcanzado
                  </FormHelperText>
                )}
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <FormControl
                  variant="outlined"
                  sx={{ m: 1, width: "100%" }}
                >
                  <InputLabel id="serviceAreaLabel">Tipo</InputLabel>
                  <Select
                    sx={{ width: '100%' }}
                    labelId="serviceAreaLabel"
                    id="serviceArea"
                    value={serviceArea}
                    onChange={handleServiceAreaChange}
                    label="serviceArea"
                  >
                    <MenuItem value="">
                      <em></em>
                    </MenuItem>
                    {serviceAreas.map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <ReactQuill
                  style={{ height: 300, marginBottom: theme.spacing(5) }} // Ajustar altura y margen inferior
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline"],
                      [{ list: "ordered" }, { list: "bullet" }],
                    ],
                  }}
                  value={description}
                  onChange={handleEditorChange}
                  placeholder="Describe tu servicio en detalle: qué incluye, cómo es el proceso, qué puede esperar el cliente..."
                  readOnly={isSubmitting}
                />
              </Grid2>

              <Grid2
                style={{
                  marginTop: isMobile ? 30 : 0,
                  display: "grid2",
                  gridTemplateColumns: "0.5fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                <FormControlLabel
                  sx={{ justifyContent: "center", margin: 0 }}
                  control={
                    <Checkbox
                      checked={active}
                      onChange={() => {
                        handleActive()
                      }}
                    />
                  }
                  label="Activo"
                />
                <FormControlLabel
                  sx={{ justifyContent: "center", margin: 0 }}
                  control={
                    <Checkbox
                      checked={isLocal}
                      onChange={() => {
                        handleIsLocal()
                      }}
                    />
                  }
                  label="¿Trabajas en un sitio específico?"
                />
                <FormControlLabel
                  sx={{ justifyContent: "center", margin: 0 }}
                  control={
                    <Checkbox
                      checked={isRemote}
                      onChange={() => {
                        handleIsRemote()
                      }}
                    />
                  }
                  label="¿Trabajas a domicilio?"
                />
              </Grid2>
              <Grid2 size={{ xs: 6 }}>
                <TextField
                  variant="outlined"
                  fullWidth
                  id="location"
                  label="Ubicación"
                  name="location"
                  autoComplete="location"
                  value={location}
                  placeholder="Si trabajas en algún sitio en específico indica aquí la dirección."
                  onChange={(e) => setLocation(e.target.value)}
                />
              </Grid2>
              <Grid2 size={{ xs: 6 }}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Tiempo de trabajo aproximado"
                  value={productionTime}
                  onChange={(e) => setProductionTime(e.target.value)}
                />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <Typography variant="subtitle1">Valor</Typography>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 10,
                  }}
                >
                  <Grid2 size={{ xs: 6 }}>
                    <TextField
                      // style={{ marginRight: 45 }}
                      required
                      fullWidth
                      variant="outlined"
                      label="Desde"
                      type="Number"
                      value={priceFrom}
                      onChange={(e) => setPriceFrom(Number(e.target.value))}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 6 }}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      label="Hasta"
                      type="Number"
                      value={priceTo}
                      onChange={(e) => setPriceTo(Number(e.target.value))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid2>
                </div>
              </Grid2>
              <Grid2
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <InfoIcon color={"secondary"} />
                <Typography color={"secondary"}>
                  Tu servicio podrá ser encontrado por estos datos.
                </Typography>
              </Grid2>
            </Grid2>
          </form>
          <Box mt={5} mb={4}>
            <Copyright />
          </Box>
        </Container>

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
              Recortar Imagen del Servicio (Aspecto{" "}
              {SERVICE_IMAGE_ASPECT === 16 / 9 ? "16:9" : "Personalizado"})
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
                aspect={SERVICE_IMAGE_ASPECT}
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
                  !completedCrop?.width ||
                  !completedCrop?.height ||
                  isSubmitting
                }
              >
                Confirmar y Subir
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Dialog>
    </div>
  )
}
