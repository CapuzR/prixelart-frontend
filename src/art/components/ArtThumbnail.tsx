import axios from "axios"
import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"

import {
  CardActionArea,
  Typography,
  IconButton,
  Tooltip,
} from "@material-ui/core"
import Img from "react-cool-img"
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart"
import FullscreenPhoto from "../../prixerProfile/fullscreenPhoto/fullscreenPhoto"
import Star from "@material-ui/icons/StarRate"
import StarOutline from "@material-ui/icons/StarOutline"
import { Art } from "../interfaces"
import { setVisibleArt } from "../api"
import { addingToCart } from "../services"
import { queryCreator } from "flow/utils"
import { set } from "react-ga"

export default function ArtThumbnail({
  tile,
  i,
  handleCloseVisible,
  setSelectedArt,
  setIsOpenAssociateProduct,
  handleFullImageClick,
}) {
  const [selectedLocalArt, setSelectedLocalArt] = useState<Art | undefined>(
    undefined
  )
  //Mover estilo a archivos de estilos y eliminar funciones que no se utilizan.
  const hideArt = (tile: Art, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setVisibleArt(tile)
    setSelectedLocalArt(undefined)
    handleCloseVisible()
  }
  const history = useHistory();

  function handleArtSelection(e): void {
    console.log("selectedArt", setSelectedArt);
    if (setSelectedArt) {
      addingToCart(e, tile, setSelectedArt, setIsOpenAssociateProduct)
    } else {
      const queryString = queryCreator(
        undefined,
        undefined,
        tile.artId,
        undefined,
        'producto',
        '1'
      );
  
      history.push({ pathname: '/flow', search: queryString });
    }
  };

  return (
    <div key={i}>
      {JSON.parse(localStorage.getItem("adminToken")) && tile.visible && (
        <Typography
          style={{
            opacity: 0.5,
            fontSize: "0.8rem",
            fontWeight: 100,
            backgroundColor: "#fff",
          }}
        >
          Puntos: {tile.points}
        </Typography>
      )}

      <CardActionArea>
        <Tooltip
          title={
            window.location.search.includes("producto=")
              ? "Asociar al producto"
              : "Agregar al carrito"
          }
        >
          <IconButton
            size="small"
            color="primary"
            onClick={handleArtSelection}
            style={{ position: "absolute", padding: "8px" }}
          >
            <AddShoppingCartIcon />
          </IconButton>
        </Tooltip>
        {tile.exclusive === "exclusive" && (
          <Tooltip title="Arte exclusivo">
            <IconButton
              size="small"
              color="primary"
              style={{ position: "absolute", right: 0 }}
            >
              <Star
                style={{
                  marginRight: "-2.2rem",
                  marginTop: "0.05rem",
                }}
                color="primary"
                fontSize="large"
              />
              <StarOutline
                style={{
                  color: "white",
                }}
                fontSize="large"
              />
            </IconButton>
          </Tooltip>
        )}
        <Img
          draggable={false}
          onClick={(e) => {
            handleFullImageClick(e, tile)
          }}
          placeholder="/imgLoading.svg"
          style={{
            backgroundColor: "#eeeeee",
            width: "100%",
            marginBottom: "7px",
            borderRadius: "4px",
          }}
          src={tile.largeThumbUrl || tile.squareThumbUrl}
          debounce={1000}
          cache
          error="/imgError.svg"
          alt={tile.title}
          id={tile.artId}
          key={tile.artId}
        />
      </CardActionArea>
    </div>
  )
}
