import React, { useState, useEffect, FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import Grid2 from "@mui/material/Grid2"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import EditIcon from "@mui/icons-material/Edit"
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined"
import Paper from "@mui/material/Paper"
import Checkbox from "@mui/material/Checkbox"
import FormControl from "@mui/material/FormControl"
import InputAdornment from "@mui/material/InputAdornment"
import ReactQuill from "react-quill"
import TextField from "@mui/material/TextField"
import InputLabel from "@mui/material/InputLabel"

import Title from "../../../components/Title"

import { useProductForm } from "@context/ProductContext"
import { PriceRange, Equation } from "../../../../../types/product.types"
import "react-quill/dist/quill.snow.css"
import { useSnackBar } from "@context/GlobalContext"

interface ImageState {
  previews: string[];
  files: File[];
  filename: string;
}

interface FormProps {
  openVideo: () => void
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    images: File[]
  ) => void
}

export default function ProductForm({ handleSubmit, openVideo }: FormProps) {
  const { state, dispatch } = useProductForm()
  const { showSnackBar } = useSnackBar()

  const [imageState, setImageState] = useState<ImageState>({
    previews: [],
    files: [],
    filename: "Subir imagenes"
  })

  useEffect(() => {
    const initialPreviews: string[] = []
    
    if (state.sources?.images) {
      state.sources.images
        .filter((img: { url?: string }) => img.url !== undefined && img.url !== null)
        .forEach((img: { url: string }) => initialPreviews.push(img.url))
    }

    if (state.thumbUrl && !initialPreviews.includes(state.thumbUrl)) {
      initialPreviews.push(state.thumbUrl)
    }

    setImageState(prev => ({
      ...prev,
      previews: initialPreviews
    }))
  }, [state.sources?.images, state.thumbUrl])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const fieldParts = name.split(".")

    if (fieldParts.length > 1) {
      dispatch({
        type: "SET_NESTED_FIELD",
        parentField: fieldParts[0] as keyof typeof state,
        childField: fieldParts[1],
        value: value,
      })
    } else {
      dispatch({
        type: "SET_FIELD",
        field: name as keyof typeof state,
        value: value,
      })
    }
  }

  const handleDescription = (value: string) => {
    dispatch({
      type: "SET_FIELD",
      field: "description",
      value: value,
    })
  }

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "SET_FIELD",
      field: e.target.name as keyof typeof state,
      value: e.target.checked,
    })
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const loadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (imageState.previews.length >= 4) {
      return showSnackBar("No puedes agregar más de 4 fotos")
    }

    const file = e.target.files?.[0]
    if (!file) return

    try {
      const resizedString = await convertToBase64(file)
      setImageState(prev => ({
        previews: [...prev.previews, resizedString],
        files: [...prev.files, file],
        filename: file.name
      }))
    } catch (error) {
      showSnackBar("Error al procesar la imagen")
    }
  }

  const replaceImage = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const resizedString = await convertToBase64(file)
      setImageState(prev => ({
        ...prev,
        previews: prev.previews.map((preview, i) => i === index ? resizedString : preview),
        files: prev.files.map((f, i) => i === index ? file : f),
        filename: file.name
      }))
    } catch (error) {
      showSnackBar("Error al reemplazar la imagen")
    }
  }

  const deleteImg = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    e.preventDefault()
    setImageState(prev => ({
      previews: prev.previews.filter((_, i) => i !== index),
      files: prev.files.filter((_, i) => i !== index),
      filename: "Subir Imagenes"
    }))
  }

  const isPriceRange = (price: PriceRange | Equation): price is PriceRange => {
    return (price as PriceRange).from !== undefined
  }

  return (
    <form encType="multipart/form-data" noValidate>
      <Grid2 container spacing={2}>
        <Grid2 container spacing={3}>
          <Grid2
            size={{
              xs: 12,
              md: 4,
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              component="label"
              style={{ textTransform: "none", width: 120 }}
            >
              Subir imagen
              <input
                name="productImages"
                type="file"
                accept="image/*"
                hidden
                onChange={(a) => {
                  loadImage(a)
                }}
              />
            </Button>
            <Button
              variant="contained"
              onClick={openVideo}
              style={{ textTransform: "none", width: 120 }}
            >
              Subir video
            </Button>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 8,
            }}
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              gap: 4,
            }}
          >
            {imageState.previews.map((img, i) =>
              img ? (
                <div style={{ border: "1px gray solid", borderRadius: 4 }}>
                  <div
                    style={{
                      textAlign: "right",
                    }}
                  >
                    <IconButton
                      sx={{ cursor: "pointer", padding: "5px" }}
                      style={{ color: "#d33f49" }}
                      component="label"
                    >
                      <input
                        name="productImages"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(a) => {
                          replaceImage(a, i)
                        }}
                      />
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      sx={{ cursor: "pointer", padding: "5px" }}
                      style={{ color: "#d33f49" }}
                      onClick={(e) => {
                        deleteImg(e, i)
                      }}
                    >
                      <HighlightOffOutlinedIcon />
                    </IconButton>
                  </div>

                  <img
                    style={{
                      width: "100%",
                      objectFit: "cover",
                    }}
                    src={img}
                    alt="+"
                  />
                </div>
              ) : (
                <div
                  style={{
                    maxHeight: "255px",
                    border: "4px silver dashed",
                    borderRadius: 4,
                    width: "100%",
                    height: "100%",
                  }}
                />
              )
            )}
          </Grid2>
          <Grid2 container sx={{ width: "100%" }}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Checkbox
                checked={Boolean(state.active)}
                color="primary"
                onChange={handleCheck}
              />
              Habilitado / Visible
            </Grid2>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="productName"
                label="Nombre"
                name="name"
                autoComplete="productName"
                value={state.name}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="category"
                label="Categoría"
                name="category"
                autoComplete="category"
                value={state.category}
                onChange={handleChange}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl
              data-color-mode="light"
              variant="outlined"
              fullWidth={true}
            >
              <InputLabel style={{ marginTop: "-5%" }}>Descripción</InputLabel>
              <ReactQuill
                style={{
                  marginBottom: 10,
                  marginTop: 15,
                  maxWidth: 1100,
                  width: "100%",

                  borderRadius: 30,
                }}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ align: [] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                  ],
                }}
                value={state.description}
                onChange={handleDescription}
                placeholder="Escribe la descripción aquí..."
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                required
                fullWidth
                multiline
                minRows={2}
                id="considerations"
                label="Consideraciones"
                name="considerations"
                autoComplete="considerations"
                value={state.considerations}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl
              variant="outlined"
              fullWidth={true}
              style={{ marginTop: 20 }}
            >
              <TextField
                variant="outlined"
                fullWidth
                label="Tiempo de producción"
                name="productionTime"
                value={state.productionTime}
                onChange={handleChange}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">días </InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>
          </Grid2>
        </Grid2>
        <Grid2
          container
          sx={{
            marginTop: 2.5,
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          spacing={2}
        >
          <Title title={"Costo de producción"} />
          <Grid2 size={{ xs: 4, md: 5 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="cost"
                value={state.cost}
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">$ </InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>
          </Grid2>
        </Grid2>
        <Grid2
          container
          sx={{
            marginTop: 2.5,
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          spacing={2}
        >
          <Title title={"PVP"} />
          <Grid2 size={{ xs: 4, md: 5 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="fromPublicPrice"
                label="Desde"
                name="priceRange.from"
                autoComplete="fromPublicPrice"
                value={
                  isPriceRange(state.priceRange) ? state.priceRange.from : ""
                }
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">$ </InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 4, md: 5 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                fullWidth
                id="toPublicPrice"
                label="Hasta"
                name="priceRange.to"
                autoComplete="toPublicPrice"
                value={
                  isPriceRange(state.priceRange) ? state.priceRange.to : ""
                }
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">$ </InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>
          </Grid2>
        </Grid2>
        <Grid2
          container
          sx={{
            marginTop: 2.5,
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
          spacing={2}
        >
          <Title title={"PVM"} />
          <Grid2 size={{ xs: 4, md: 5 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="fromPrixerPrice"
                label="Desde"
                name="priceRange.from"
                autoComplete="fromPrixerPrice"
                value={
                  isPriceRange(state.priceRange) ? state.priceRange.from : ""
                }
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">$ </InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 4, md: 5 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                fullWidth
                id="toPrixerPrice"
                label="Hasta"
                name="priceRange.to"
                autoComplete="toPrixerPrice"
                value={
                  isPriceRange(state.priceRange) ? state.priceRange.to : ""
                }
                onChange={handleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>
          </Grid2>
        </Grid2>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={(e) => handleSubmit(e, imageState.files)}
          style={{ marginTop: 20 }}
        >
          Guardar
        </Button>
      </Grid2>
    </form>
  )
}
