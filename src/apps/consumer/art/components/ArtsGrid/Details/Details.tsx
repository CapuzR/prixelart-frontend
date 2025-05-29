import React, { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import CardContent from "@mui/material/CardContent"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import Grid2 from "@mui/material/Grid"
import Box from "@mui/material/Box"
import Tooltip from "@mui/material/Tooltip"
import Chip from "@mui/material/Chip"
import Paper from "@mui/material/Paper"
import Skeleton from "@mui/material/Skeleton"
import Star from "@mui/icons-material/StarRate"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import PhotoSizeSelectActualIcon from "@mui/icons-material/PhotoSizeSelectActual"
import LabelIcon from "@mui/icons-material/Label"
import BrokenImageIcon from "@mui/icons-material/BrokenImage"

import Img from "react-cool-img"

import { useLoading } from "context/GlobalContext"

import utils from "utils/utils.js"
import { Art } from "../../../../../../types/art.types"
import { fetchArt } from "@api/art.api"
import Grid from "@mui/material/Grid"

const ArtDetail: React.FC = () => {
  const { artId } = useParams<{ artId: string }>()
  const navigate = useNavigate()
  const { setLoading, loading } = useLoading() // Assuming loading is also from context
  const [art, setArt] = useState<Art | null>(null)
  const [artLoadingError, setArtLoadingError] = useState<string | null>(null)

  const maxPrintValues = useCallback((tile: Art) => {
    if (
      !tile.originalPhotoWidth ||
      !tile.originalPhotoHeight ||
      !tile.originalPhotoPpi
    ) {
      return "N/A"
    }
    const [w, h] = utils.maxPrintCalc(
      Number(tile.originalPhotoWidth),
      Number(tile.originalPhotoHeight),
      Number(tile.originalPhotoPpi),
      tile.originalPhotoIso // Assuming originalPhotoIso might be optional or can be handled by maxPrintCalc
    )
    return `${w} x ${h} cm`
  }, [])

  const navigateToPrixer = (
    e: React.MouseEvent<HTMLButtonElement>,
    username: string
  ) => {
    e.preventDefault()
    navigate(`/prixer/${username}`)
  }

  useEffect(() => {
    const loadArt = async () => {
      if (artId) {
        setLoading(true)
        setArtLoadingError(null)
        try {
          const data = await fetchArt(artId)
          setArt(data)
          if (!data) {
            setArtLoadingError(
              "Art not found. It might have been moved or deleted."
            )
          }
        } catch (error) {
          console.error("Failed to fetch art:", error)
          setArtLoadingError(
            "An error occurred while fetching the art details. Please try again later."
          )
          setArt(null)
        } finally {
          setLoading(false)
        }
      } else {
        setArtLoadingError("No Art ID provided.")
        setLoading(false)
      }
    }

    loadArt()
  }, [artId, setLoading])

  useEffect(() => {
    if (art && artId) {
      // Scroll after art is loaded and component has rendered
      const timer = setTimeout(() => {
        document
          .getElementById(`art-detail-${artId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 500) // Slight delay to ensure rendering
      return () => clearTimeout(timer)
    }
  }, [art, artId]) // Dependency on art ensures this runs after art is set

  if (loading && !art && !artLoadingError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, mt: { xs: 2, md: 4 } }}>
        <Grid2 container spacing={4}>
          <Grid2 size={{ xs: 12, md: 7 }}>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 5 }}>
            <Skeleton variant="text" sx={{ fontSize: "2rem" }} />
            <Skeleton variant="text" sx={{ fontSize: "1rem", width: "50%" }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={100}
              sx={{ my: 2 }}
            />
            <Skeleton
              variant="text"
              sx={{ fontSize: "0.9rem", width: "70%" }}
            />
            <Skeleton
              variant="text"
              sx={{ fontSize: "0.9rem", width: "60%" }}
            />
            <Skeleton
              variant="text"
              sx={{ fontSize: "0.9rem", width: "65%" }}
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              <Skeleton variant="rounded" width={80} height={32} />
              <Skeleton variant="rounded" width={80} height={32} />
              <Skeleton variant="rounded" width={80} height={32} />
            </Box>
          </Grid2>
        </Grid2>
      </Container>
    )
  }

  if (artLoadingError) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          py: 4,
          mt: { xs: 2, md: 4 },
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 200px)", // Adjust as needed
        }}
      >
        <BrokenImageIcon
          sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
        />
        <Typography variant="h5" gutterBottom>
          Oops!
        </Typography>
        <Typography color="textSecondary">{artLoadingError}</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 3 }}>
          Go Back
        </Button>
      </Container>
    )
  }

  if (!art) {
    // This case should ideally be covered by loading or error state,
    // but as a fallback:
    return (
      <Container sx={{ py: 4, mt: { xs: 2, md: 4 }, textAlign: "center" }}>
        <Typography>No art data available.</Typography>
      </Container>
    )
  }

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{ py: 4, mt: { xs: 8, md: 10 } }}
        id={`art-detail-${art.artId}`}
      >
        <Paper elevation={3} sx={{ overflow: "hidden" }}>
          <Grid2 container spacing={{ xs: 0, md: 0 }}>
            <Grid2
              size={{ xs: 12, md: 7 }}
              sx={{
                position: "relative",
                backgroundColor: "#f0f0f0",
                justifyContent: "center",
                alignItems: "center",
                display: "flex",
              }}
            >
              {art.exclusive === "exclusive" && (
                <Tooltip title="Arte Exclusivo">
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      zIndex: 1,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      borderRadius: "50%",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Star sx={{ color: "gold" }} fontSize="medium" />
                  </Box>
                </Tooltip>
              )}
              <Img
                placeholder="/imgLoading.svg"
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
                src={art.largeThumbUrl || art.mediumThumbUrl || art.imageUrl}
                debounce={300}
                cache
                error="/imgError.svg"
                alt={art.title}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 5 }}>
              <CardContent
                sx={{
                  p: { xs: 2, md: 3 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  color="secondary"
                  sx={{ fontWeight: "bold" }}
                >
                  {art.title}
                </Typography>
                <Grid2
                  sx={{
                    display: "flex",
                    justifyContent: "left",
                    alignItems: "center",
                    mb: 2,
                    gap: 1,
                  }}
                >
                  <Typography variant="subtitle1" color="secondary">
                    {"Prixer: "}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={(e) => navigateToPrixer(e, art.prixerUsername)}
                    sx={{
                      textTransform: "none",
                      padding: "0px 14px",
                      fontSize: "1.1rem",
                      ":hover": {
                        backgroundColor: "#404e5c",
                        color: "#fff",
                      },
                    }}
                  >
                    {art.prixerUsername}
                  </Button>
                </Grid2>
                {art.description && (
                  <Typography
                    gutterBottom
                    component="p"
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ whiteSpace: "pre-line", mb: 3, fontSize: "1rem" }}
                  >
                    {art.description}
                  </Typography>
                )}
                <Box sx={{ mb: 3 }}>
                  {art.artLocation && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <LocationOnIcon
                        sx={{ mr: 1.5, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {art.artLocation}
                      </Typography>
                    </Box>
                  )}
                  {art.createdOn && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarTodayIcon
                        sx={{ mr: 1.5, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Creado el:{" "}
                        {new Date(art.createdOn).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>
                  )}
                  {art.originalPhotoHeight &&
                    art.originalPhotoWidth &&
                    art.originalPhotoPpi && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <PhotoSizeSelectActualIcon
                          sx={{ mr: 1.5, color: "text.secondary" }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Máx. Impresión: {maxPrintValues(art)}
                        </Typography>
                      </Box>
                    )}
                </Box>
                {art.tags && art.tags.length > 0 && (
                  <Box sx={{ mb: 3, display: "flex" }}>
                    <LabelIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {art.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}
                <Typography
                  variant="caption"
                  color="text.disabled"
                  component="p"
                  sx={{ margin: "auto 0 0 ", textAlign: "right" }}
                >
                  ID: {art.artId}
                </Typography>
              </CardContent>
            </Grid2>
          </Grid2>
        </Paper>
      </Container>
    </>
  )
}

export default ArtDetail
