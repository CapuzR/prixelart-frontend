import React, { useState } from "react"

import Title from "../../../components/Title"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Grid2 from "@mui/material/Grid2"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import { useHistory } from "react-router-dom"
import "react-quill/dist/quill.snow.css"
import ViewListIcon from "@mui/icons-material/ViewList"
import ProductForm from "../components/ProductForm"
import { Tooltip } from "@mui/material"

import { useProductForm } from "@context/ProductContext"
import { useSnackBar, useLoading } from "@context/GlobalContext"

import { createProduct } from "../api"

export default function CreateProduct() {
  const { state, dispatch } = useProductForm()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const history = useHistory()

  const [open, setOpen] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoPreview, setVideoPreview] = useState("")

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const modifyString = (a, sti) => {
    const url = sti.split(" ")
    const width = sti.replace("560", "326").replace("315", "326")
    const previewMp4 = sti.replace("1350", "510").replace("494", "350")
    setVideoUrl(width)
    setVideoPreview(previewMp4)
  }

  const handleProductAction = (action: string) => {
    history.push({ pathname: "/admin/product/" + action })
  }

  const handleSubmit = async (e, images) => {
    e.preventDefault()
    if (images.images.length > 4) {
      showSnackBar("No puedes enviar mas de 4 fotos")
    } else {
      if (images.images.length <= 0) {
        showSnackBar("No puedes crear un producto sin foto, agrega 1 o más")
      } else {
        if (
          !state.name &&
          !state.cost &&
          !state.publicPrice?.to &&
          !state.prixerPrice?.to &&
          images.images.length > 1
        ) {
          showSnackBar("Por favor completa todos los campos requeridos.")
        } else {
          setLoading(true)
          const formData = new FormData()
          const data = {
            specialVars: [
              {
                name: "",
                isSpecialVarVisible: "",
              },
            ],
          }
          formData.append("active", state.active.toString())
          formData.append("name", state.name)
          formData.append("description", state.description)
          formData.append("category", state.category.toString())
          formData.append("considerations", state.considerations)
          formData.append("productionTime", state.productionTime)
          formData.append("cost", state.cost.toString())
          formData.append("publicPriceFrom", state.publicPrice?.from.toString())
          formData.append("publicPriceTo", state.publicPrice?.to.toString())
          formData.append("prixerPriceFrom", state.prixerPrice?.from.toString())
          formData.append("prixerPriceTo", state.prixerPrice?.to.toString())
          formData.append("hasSpecialVar", state.hasSpecialVar.toString())
          formData.append("autoCertified", state.autoCertified.toString())

          formData.append("video", videoUrl)
          images.images.map((file) => formData.append("productImages", file))

          const response = await createProduct(formData)
          if (response.success === false) {
            showSnackBar(response.data.message)
          } else {
            showSnackBar("Registro de producto exitoso.")
            dispatch({
              type: "RESET_FORM",
            })
            history.push({ pathname: "/admin/product/read" })
          }
        }
      }
    }
  }

  return (
    <React.Fragment>
      <Grid2 container padding={3}>
        <Grid2
          size={{ xs: 12 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Title title="Crear producto" />
          <Tooltip title="Volver al listado">
            <IconButton
              color="default"
              onClick={() => {
                handleProductAction("read")
              }}
              style={{ marginRight: "10px" }}
            >
              <ViewListIcon />
            </IconButton>
          </Tooltip>
        </Grid2>
        <ProductForm handleSubmit={handleSubmit} openVideo={handleClickOpen} />
      </Grid2>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Youtube Url</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Copia y pega la url que quieres mostrar en el carrusel de imagenes
          </DialogContentText>
          <div id="ll"></div>
          <TextField
            onChange={(a) => {
              const div = document.getElementById("ll")
              modifyString(a, a.target.value)
              div.innerHTML = videoPreview
            }}
            value={videoUrl}
            label="Url"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
