import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CardActionArea,
  Typography,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import Img from "react-cool-img";
import Star from "@mui/icons-material/StarRate";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { queryCreator } from "@apps/consumer/flow/helpers";
import { Art } from "../../../../types/art.types";

interface ArtThumbnailProps {
  tile: Art;
  handleFullImageClick: (e: React.MouseEvent<HTMLElement>, tile: Art) => void;
  onArtSelect?: (art: Art) => void;
  originalPhotoWidth?: string;
  originalPhotoHeight?: string;
}

export default function ArtThumbnail({
  tile,
  handleFullImageClick,
  onArtSelect,
  originalPhotoWidth,
  originalPhotoHeight,
}: ArtThumbnailProps) {
  const navigate = useNavigate();

  function handleArtSelection(e: React.MouseEvent<HTMLButtonElement>): void {
    e.stopPropagation();
    const queryString = queryCreator(
      undefined,
      undefined,
      tile.artId?.toString(),
      undefined,
    );
    navigate({ pathname: "/crear-prix", search: queryString });
  }

  const adminToken = localStorage.getItem("adminToken");

  const imageSrc =
    tile.mediumThumbUrl ||
    tile.largeThumbUrl ||
    tile.squareThumbUrl ||
    tile.imageUrl ||
    "/imgError.svg";

  let aspectRatioStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#eeeeee",
  };

  if (
    originalPhotoWidth &&
    originalPhotoHeight &&
    !isNaN(Number(originalPhotoWidth)) &&
    !isNaN(Number(originalPhotoHeight)) &&
    Number(originalPhotoHeight) > 0
  ) {
    aspectRatioStyle.aspectRatio = `${originalPhotoWidth} / ${originalPhotoHeight}`;
  }

  return (
    <div
      style={{ marginBottom: "7px", borderRadius: "4px", overflow: "hidden" }}
    >
      {adminToken && JSON.parse(adminToken) && tile.visible && (
        <Typography
          style={{
            opacity: 0.5,
            fontSize: "0.8rem",
            fontWeight: 100,
            backgroundColor: "#fff",
            padding: "2px 4px",
            textAlign: "right",
          }}
        >
          Puntos: {tile.points}
        </Typography>
      )}

      <CardActionArea
        onClick={(e) => handleFullImageClick(e, tile)}
        aria-label={`Ver detalles de ${tile.title}`}
        sx={{ position: "relative" }}
      >
        <Box sx={aspectRatioStyle}>
          <Img
            draggable={false}
            placeholder="/imgLoading.svg"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            src={imageSrc}
            debounce={300}
            cache
            error="/imgError.svg"
            alt={tile.title || "Arte"}
          />
        </Box>

        {/* Overlaid Icons */}
        <Box
          sx={{ position: "absolute", top: 0, left: 0, width: "100%", p: 0.5 }}
        >
          {!onArtSelect && (
            <Tooltip title="Agregar al carrito">
              <IconButton
                size="small"
                color="primary"
                onClick={handleArtSelection}
                aria-label="Agregar al carrito"
                sx={{
                  backgroundColor: "rgba(255,255,255,0.7)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
                }}
              >
                <AddShoppingCartIcon />
              </IconButton>
            </Tooltip>
          )}

          {tile.exclusive === "exclusive" && (
            <Tooltip title="Arte exclusivo">
              <IconButton
                size="small"
                color="primary"
                aria-label="Arte exclusivo"
                sx={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  backgroundColor: "rgba(255,255,255,0.7)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
                  padding: "4px",
                }}
              >
                <Star color="primary" fontSize="medium" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardActionArea>
    </div>
  );
}
