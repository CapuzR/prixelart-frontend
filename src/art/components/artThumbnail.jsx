import axios from "axios"
import React, { useState, useEffect } from "react"

import {
  CardActionArea,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core"
// import {} from
import Img from "react-cool-img"
import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart"
import FullscreenPhoto from "../../prixerProfile/fullscreenPhoto/fullscreenPhoto"
import Star from "@material-ui/icons/StarRate"
import StarOutline from "@material-ui/icons/StarOutline"

import { setVisibleArt } from "../api"
import { addingToCart } from "../services"

export default function ArtThumbnail({ tile, i, handleCloseVisible, setSelectedArt, setIsOpenAssociateProduct }) {
  const [selectedLocalArt, setSelectedLocalArt] = useState()

  const hideArt = (tile, selectedArt, e) => {
    e.preventDefault()
    setVisibleArt(tile, selectedArt, e)
    setSelectedLocalArt(undefined)
    handleCloseVisible()
  }

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
            onClick={(e) => {
              addingToCart(e, tile, setSelectedArt, setIsOpenAssociateProduct)
            }}
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

        {/* {props.permissions?.artBan && (
          <IOSSwitch
            color="primary"
            size="normal"
            checked={tile.visible}
            onChange={(e) => {
              if (e.target.checked === false) {
                handleClickVisible()
                setSelectedArt(tile.artId)
                setVisible(e.target.checked)
              } else {
                setVisibleArt(tile)
                setVisible(e.target.checked)
              }
            }}
          />
        )} */}
      </CardActionArea>

      <Dialog
        open={selectedLocalArt === tile.artId}
        onClose={handleCloseVisible}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Estás seguro de ocultar este arte?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            style={{
              textAlign: "center",
            }}
          >
            Este arte ya no será visible en tu perfil y la página de inicio.
          </DialogContentText>
        </DialogContent>
        <div
          item
          xs={12}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TextField
            style={{ width: "95%", marginBottom: "5px" }}
            fullWidth
            multiline
            required
            id="disabledReason"
            label="¿Por qué quieres ocultar este arte?"
            variant="outlined"
            onChange={(e) => {
              setDisabledReason(e.target.value)
            }}
          />
        </div>
        <DialogActions>
          <Button
            onClick={handleCloseVisible}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={(e) => {
              hideArt(tile, selectedArt, e)
            }}
            background="primary"
            style={{
              color: "white",
              backgroundColor: "#d33f49",
            }}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
