import React, { useState, useEffect, useCallback } from "react"
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
  Paper,
} from "@mui/material"

import Grid2 from "@mui/material/Grid"

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import StorefrontIcon from "@mui/icons-material/Storefront"
import { Service } from "types/service.types"
import { fetchActiveServices } from "@api/service.api"
import { fetchAllPrixersActive } from "@api/prixer.api"
import ServiceCardMui from "./components/ServiceCardMui"
import { User } from "types/user.types"
import ServiceDetailsModal from "./components/ServiceDetailsModal"

import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"


const AllServicesDisplay: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [rawServices, setRawServices] = useState<Service[]>([])
  const [prixerDetailsMap, setPrixerDetailsMap] = useState<
    Map<string, { username: string; avatar?: string }>
  >(new Map())
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedServiceForModal, setSelectedServiceForModal] =
    useState<Service | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const handleOpenModal = (service: Service) => {
    setSelectedServiceForModal(service)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedServiceForModal(null)
  }

  const loadAllData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [fetchedServices, fetchedUsers] = await Promise.all([
        fetchActiveServices(),
        fetchAllPrixersActive() as Promise<User[]>,
      ])

      const newPrixerDetailsMap = new Map<
        string,
        { username: string; avatar?: string }
      >()
      fetchedUsers.forEach((user) => {
        if (user?.prixer?._id) {
          newPrixerDetailsMap.set(user.prixer._id.toString(), {
            username: user.username,
            avatar: user.prixer.avatar || user.avatar,
          })
        }
      })
      setPrixerDetailsMap(newPrixerDetailsMap)

      const displayableServices = fetchedServices.filter((service) => {
        const isActiveAndVisible =
          service.active &&
          (service.visible === true || service.visible === undefined)
        if (!isActiveAndVisible) return false

        const prixerIdString =
          typeof service.prixer === "string"
            ? service.prixer
            : (service.prixer as any)?._id?.toString()

        return prixerIdString ? newPrixerDetailsMap.has(prixerIdString) : false
      })

      setRawServices(displayableServices)
    } catch (err) {
      console.error("Failed to load services or prixer data:", err)
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: "70vh" }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando servicios...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon fontSize="inherit" />}
          action={
            <Button color="inherit" size="small" onClick={loadAllData}>
              RETRY
            </Button>
          }
          sx={{ justifyContent: "center" }}
        >
          {error}
        </Alert>
      </Container>
    )
  }

  const servicesToDisplay = rawServices
    .map((service) => {
      const prixerIdString =
        typeof service.prixer === "string"
          ? service.prixer
          : (service.prixer as any)?._id?.toString()
      const prixerDetails = prixerIdString
        ? prixerDetailsMap.get(prixerIdString)
        : undefined

      if (!prixerDetails) {
        console.warn(
          `Skipping service "${service.title}" due to missing prixer details for ID: ${prixerIdString}`
        )
        return null
      }

      return (
        <Grid2
          size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
          key={
            service._id
              ? service._id.toString()
              : `${service.title}-${prixerIdString}`
          }
        >
          <ServiceCardMui
            service={service}
            username={prixerDetails.username}
            avatar={prixerDetails.avatar}
            onViewDetails={handleOpenModal}
          />
        </Grid2>
      )
    })
    .filter(Boolean)

  if (servicesToDisplay.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Paper elevation={0} sx={{ p: 4, backgroundColor: "transparent" }}>
          <StorefrontIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {" "}
            No hay servicios en este momento{" "}
          </Typography>
          <Typography color="text.secondary">
            Ha ocurrido un error al cargar los servicios. Por favor, inténtalo
            de nuevo más tarde.
          </Typography>
        </Paper>
      </Container>
    )
  }

  const selectedPrixerDetails = selectedServiceForModal?.prixer
    ? prixerDetailsMap.get(
        typeof selectedServiceForModal.prixer === "string"
          ? selectedServiceForModal.prixer
          : (selectedServiceForModal.prixer as any)?._id?.toString()
      )
    : undefined

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        gutterBottom
        align="center"
        sx={{ mb: 1, fontWeight: 600 }}
      >
        Servicios
      </Typography>
      <Typography
        variant={isMobile ? "body2" : "h6"}
        color="text.secondary"
        align="center"
        sx={{ mb: 6 }}
      >
        Explora nuestros servicios disponibles y descubre lo que tenemos para
        ofrecerte.
      </Typography>

      <Grid2 container spacing={3}>
        {servicesToDisplay}
      </Grid2>

      {/* Render the Modal */}
      <ServiceDetailsModal
        open={isModalOpen}
        onClose={handleCloseModal}
        service={selectedServiceForModal}
        prixerUsername={selectedPrixerDetails?.username}
        prixerAvatar={selectedPrixerDetails?.avatar}
      />
    </Container>
  )
}

export default AllServicesDisplay
