import {
  Avatar,
  Box,
  Button,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import { Service } from "types/service.types"
import Grid2 from "@mui/material/Grid"
import CloseIcon from "@mui/icons-material/Close"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import LanguageIcon from "@mui/icons-material/Language"
import BusinessIcon from "@mui/icons-material/Business"
import ScheduleIcon from "@mui/icons-material/Schedule"
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported"
import StorefrontIcon from "@mui/icons-material/Storefront"
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import { useEffect, useState } from "react"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"
import util from "@utils/utils"
interface ServiceDetailsModalProps {
  open: boolean
  onClose: () => void
  service: Service | null
  prixerUsername?: string
  prixerAvatar?: string
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  open,
  onClose,
  service,
  prixerUsername,
  prixerAvatar,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    if (open && service) {
      setCurrentImageIndex(0)
    }
  }, [open, service])

  if (!service) return null

  const images = service.sources.images || []
  const hasImages = images.length > 0
  const hasMultipleImages = images.length > 1

  const priceString =
    service.publicPrice.to &&
    service.publicPrice.from !== service.publicPrice.to
      ? `$${service.publicPrice.from.toFixed(2)} - $${service.publicPrice.to.toFixed(2)}`
      : `$${service.publicPrice.from.toFixed(2)}`

  const goToPrixerPage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (prixerUsername) {
      navigate(`/prixer/${prixerUsername}`)
      onClose()
    }
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
        }}
      >
        {service.title}
        <IconButton
          aria-label="cerrar"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 2, md: 3 } }}>
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: { xs: 250, sm: 350, md: 400 },
                maxHeight: "500px",
                overflow: "hidden",
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: !hasImages ? "grey.200" : "transparent",
              }}
            >
              {hasImages ? (
                <Box
                  sx={{
                    display: "flex",
                    height: "100%",
                    transform: `translateX(-${currentImageIndex * 100}%)`,
                    transition: "transform 0.4s ease-in-out",
                  }}
                >
                  {images.map((image, index) => (
                    <CardMedia
                      key={image.url + index}
                      component="img"
                      image={image.url}
                      alt={`Imagen ${index + 1} de ${service.title}`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "grey.500",
                  }}
                >
                  <ImageNotSupportedIcon
                    sx={{ fontSize: { xs: 60, md: 80 } }}
                  />
                </Box>
              )}

              {/* Navigation Arrows and Counter */}
              {hasMultipleImages && (
                <>
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: 8,
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                      },
                      zIndex: 1,
                    }}
                    aria-label="Imagen anterior"
                    size="small"
                  >
                    <ArrowBackIosNewIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: "absolute",
                      top: "50%",
                      right: 8,
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                      },
                      zIndex: 1,
                    }}
                    aria-label="Siguiente imagen"
                    size="small"
                  >
                    <ArrowForwardIosIcon fontSize="inherit" />
                  </IconButton>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "rgba(0,0,0,0.4)",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "0.75rem",
                      zIndex: 1,
                    }}
                  >
                    {currentImageIndex + 1} / {images.length}
                  </Box>
                </>
              )}
            </Box>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              color="primary.main"
              fontWeight="bold"
            >
              {priceString}
            </Typography>

            {prixerUsername && (
              <Button
                size="small"
                onClick={goToPrixerPage}
                startIcon={
                  prixerAvatar ? (
                    <Avatar src={prixerAvatar} sx={{ width: 24, height: 24 }} />
                  ) : (
                    <StorefrontIcon />
                  )
                }
                sx={{
                  textTransform: "none",
                  mb: 2,
                  p: 0.5,
                  "&:hover": { bgcolor: "action.hover" },
                }}
                aria-label={`Ver perfil de ${prixerUsername}`}
                title={`Ver perfil de ${prixerUsername}`}
              >
                <Typography variant="body2" color="text.secondary">
                  Por: {prixerUsername}
                </Typography>
              </Button>
            )}

            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 0, mb: 2, flexWrap: "wrap", gap: 0.5 }}
            >
              {service.isRemote && (
                <Chip
                  icon={<LanguageIcon fontSize="small" />}
                  label="Remoto"
                  size="small"
                  variant="outlined"
                />
              )}
              {service.isLocal && (
                <Chip
                  icon={<LocationOnIcon fontSize="small" />}
                  label={
                    service.location ? `Local: ${service.location}` : "Local"
                  }
                  size="small"
                  variant="outlined"
                  title={service.location || "Local"}
                />
              )}
              {service.productionTime && (
                <Chip
                  icon={<ScheduleIcon fontSize="small" />}
                  label={`Tiempo: ${service.productionTime}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {service.serviceArea && (
                <Chip
                  icon={<BusinessIcon fontSize="small" />}
                  label={`Área: ${service.serviceArea}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: "medium" }}
            >
              Descripción:
            </Typography>
            <Box
              component="div"
              sx={{
                fontSize: (theme) => theme.typography.body2.fontSize,
                color: "text.primary",
                mb: 2,
                "& p": { marginBlockStart: "0.5em", marginBlockEnd: "0.5em" },
                "& ol, & ul": {
                  marginBlockStart: "0.5em",
                  marginBlockEnd: "0.5em",
                  paddingInlineStart: "20px",
                },
                "& li": { marginBottom: "0.25em" },
                maxHeight: "300px",
                overflowY: "auto",
                pr: 1,
              }}
              dangerouslySetInnerHTML={{ __html: service.description }}
            />
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: "flex-end" }}>
        <Button 
          onClick={() => {
            window.open(util.generateLikeServiceMessage(service), "_blank")
          }}
          color="primary"
          variant="contained"
          size="small"
        >
          Contactar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ServiceDetailsModal
