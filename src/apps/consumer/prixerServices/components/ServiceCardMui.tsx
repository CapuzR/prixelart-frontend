import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Tooltip,
  Stack,
  Fade,
  Avatar,
  IconButton,
} from "@mui/material";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import LanguageIcon from "@mui/icons-material/Language";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Service } from "types/service.types";

const ServiceCardMui: React.FC<{
  service: Service;
  username: string;
  avatar?: string;
  onViewDetails: (service: Service) => void;
}> = ({ service, avatar, username, onViewDetails }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [service]);

  const images = service.sources.images || [];
  // primaryImage is no longer needed here as we render all images for sliding

  const priceString =
    service.publicPrice.to &&
    service.publicPrice.from !== service.publicPrice.to
      ? `$${service.publicPrice.from.toFixed(2)} - $${service.publicPrice.to.toFixed(2)}`
      : `$${service.publicPrice.from.toFixed(2)}`;

  const goToPrixer = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/prixer/${username}`);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
  };

  const hasMultipleImages = images.length > 1;
  const hasImages = images.length > 0;

  return (
    <Fade in timeout={500}>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: (theme) => theme.shadows[8],
          },
          position: "relative",
          opacity: !service.active || service.visible === false ? 0.65 : 1,
          filter:
            !service.active || service.visible === false
              ? "grayscale(60%)"
              : "none",
        }}
      >
        <Box // This Box is the main clickable area for the image section
          sx={{
            position: "relative",
            height: 350, // Define the height of the image viewport
            overflow: "hidden", // Crucial for the sliding effect
            cursor: hasImages ? "pointer" : "default", // Clickable only if there are images
            backgroundColor: !hasImages ? "grey.200" : undefined, // Background for placeholder
          }}
          onClick={(e) => {
            // Only trigger onViewDetails if clicking the container itself,
            // not the arrows, and if there are images.
            if (hasImages && e.target === e.currentTarget) {
              onViewDetails(service);
            }
          }}
        >
          {hasImages ? (
            <Box // This Box is the slider that moves
              sx={{
                display: "flex",
                height: "100%",
                // Calculate the translation based on the current image index
                transform: `translateX(-${currentImageIndex * 100}%)`,
                transition: "transform 0.4s ease-in-out", // Sliding animation
              }}
            >
              {images.map((image, index) => (
                <CardMedia
                  key={image.url + index} // Use image.id if available, otherwise combine url and index
                  component="img"
                  image={image.url}
                  alt={`Image ${index + 1} for ${service.title}`}
                  sx={{
                    width: "100%", // Each image takes the full width of the viewport
                    height: "100%",
                    objectFit: "contain",
                    flexShrink: 0, // Prevent images from shrinking
                  }}
                />
              ))}
            </Box>
          ) : (
            // Placeholder when no images are available
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "grey.500",
              }}
            >
              <ImageNotSupportedIcon sx={{ fontSize: 60 }} />
            </Box>
          )}

          {/* Navigation Arrows and Counter - positioned above the image viewport */}
          {hasMultipleImages && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 8,
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                  },
                  zIndex: 1, // Ensure arrows are above images
                }}
                aria-label="Previous image"
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
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                  },
                  zIndex: 1, // Ensure arrows are above images
                }}
                aria-label="Next image"
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
                  zIndex: 1, // Ensure counter is above images
                }}
              >
                {currentImageIndex + 1} / {images.length}
              </Box>
            </>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, pb: 0, cursor: "default" }}>
          <Tooltip title={service.title} placement="top">
            <Typography
              gutterBottom
              variant="h6"
              noWrap
              component="div"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(service);
              }}
              sx={{ cursor: "pointer" }}
            >
              {service.title}
            </Typography>
          </Tooltip>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{ mt: 1, mb: 1, flexWrap: "wrap", gap: 0.5 }}
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
                  service.location
                    ? `${service.location.substring(0, 15)}${service.location.length > 15 ? "…" : ""}`
                    : "Local"
                }
                size="small"
                variant="outlined"
                title={service.location || "Local"}
              />
            )}
            {service.productionTime && (
              <Chip
                label={service.productionTime}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
          <Typography
            variant="h6"
            color="primary.main"
            sx={{ mt: 1, fontWeight: "bold" }}
          >
            {priceString}
          </Typography>
        </CardContent>

        <CardActions
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            pt: 1,
            cursor: "default",
          }}
        >
          <Button
            size="small"
            onClick={goToPrixer}
            startIcon={
              avatar ? (
                <Avatar src={avatar} sx={{ width: 24, height: 24 }} />
              ) : (
                <StorefrontIcon />
              )
            }
            sx={{ textTransform: "none" }}
            aria-label={`Ver perfil de ${username}`}
            title={`Ver perfil de ${username}`}
          >
            <Typography variant="body2" noWrap sx={{ maxWidth: "110px" }}>
              {username}
            </Typography>
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(service);
            }}
            disabled={!service.active || service.visible === false}
          >
            Ver Más
          </Button>
        </CardActions>
      </Card>
    </Fade>
  );
};

export default ServiceCardMui;
