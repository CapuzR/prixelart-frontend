import React, { useState, useEffect, MouseEvent } from "react"
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

interface FormProps {
  openVideo: () => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, images: any) => void
}
export default function ProductForm({ handleSubmit, openVideo }: FormProps) {
  const { state, dispatch } = useProductForm()
  const { showSnackBar } = useSnackBar()

  const [imageLoader, setLoadImage] = useState<any>({
    loader: [],
    filename: "Subir imagenes",
  })
  //   Reducir la anidación en ImageLoader
  const [images, setImages] = useState<any>({ images: [] })
  console.log(images, "nuevas")
  console.log(imageLoader.loader, "prev")

  useEffect(() => {
    // readProduct()
    const prev: any = { loader: [], filename: "Subir imagenes" }
    const indexImage =
      state.sources && state?.thumbUrl && state.sources?.length < 1
        ? state.sources?.indexOf({ type: "image", url: state?.thumbUrl })
        : undefined

    state.sources
      ?.filter(
        (img) =>
          img.url !== undefined && img.url !== null && img.type === "images"
      )
      .forEach((img) => prev.loader.push(img.url)) // : setVideoUrl(img && img.url)
    // )

    if (indexImage === -1 && state.thumbUrl) {
      prev.loader.push(state.thumbUrl)
    }
    setLoadImage(prev)
    // setImagesList(prev)
    // setTimeout(() => {
    //   if (state?.sources.images) {
    //     state?.sources.images.map((element) => {
    //       element.type === "video" && setVideoUrl(element.url)
    //     })
    //   }
    // }, 1000)
  }, [])

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

  const convertToBase64 = (blob: File) => {
    return new Promise((resolve) => {
      var reader = new FileReader()
      reader.onload = function () {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })
  }

  const loadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (imageLoader.loader.length >= 4) {
      return showSnackBar("No puedes agregar más de 4 fotos")
    } else {
      const file = e.target.files?.[0]
      if (!file) return

      const resizedString = await convertToBase64(file)
      if (!resizedString) return

      const newLoader = [...imageLoader.loader, resizedString]
      const newImages = [...images.images, file]

      setLoadImage({ loader: newLoader, filename: file.name })
      newImages.length <= 4 && setImages({ images: newImages })
    }
  }

  const replaceImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault()
    const file = e.target.files?.[0]
    if (file) {
      const resizedString = await convertToBase64(file)
      imageLoader.loader[index] = resizedString
      images.images[index] = file
      setLoadImage({ loader: imageLoader.loader, filename: file.name })
    }
  }

  const isPriceRange = (price: PriceRange | Equation): price is PriceRange => {
    return (price as PriceRange).from !== undefined
  }

  const deleteImg = (e: React.MouseEvent<HTMLButtonElement>, i: number) => {
    e.preventDefault()
    const imageToRemove = imageLoader.loader[i]
    const newLoader = imageLoader.loader.filter(
      (_: any, index: number) => index !== i
    )
    const newImages = images.images.filter((file: any) => {
      return file instanceof File ? true : file.url !== imageToRemove
    })

    setLoadImage({
      loader: newLoader,
      filename: "Subir Imagenes",
    })
    setImages({ images: newImages })
  }
  // const removeImg =
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
            {[
              ...imageLoader.loader,
              ...new Array(4 - imageLoader.loader.length).fill(null),
            ].map((img, i) =>
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
                          const i = imageLoader.loader.indexOf(img)
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
                    {/* <IconButton
                      sx={{ cursor: "pointer", padding: "5px" }}
                      style={{ color: "#d33f49" }}
                      onClick={(d) => {
                        // imageLoader.loader.splice(i, 1)
                        // images.images.splice(i, 1)
                        setLoadImage({
                          loader: [],
                          filename: "Subir Imagenes",
                        })
                        newImages({ images: [] })
                      }}
                    >
                      <HighlightOffOutlinedIcon />
                    </IconButton> */}
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
            {state.video && (
              <>
                <div
                  style={{
                    // width: "25%",
                    marginRight: "4px",
                    flexDirection: "row",
                  }}
                >
                  <div
                    style={{
                      textAlign: "right",
                      display: "flex",
                    }}
                  >
                    <IconButton
                      sx={{ cursor: "pointer", padding: "5px" }}
                      style={{
                        color: "#d33f49",
                      }}
                      onClick={openVideo}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      sx={{
                        cursor: "pointer",
                        padding: "5px",
                        color: "#d33f49",
                      }}
                      name="video"
                      //   onClick={handleChange} cambiar la función
                    >
                      <HighlightOffOutlinedIcon />
                    </IconButton>
                  </div>

                  <Paper elevation={3} style={{ padding: 10 }}>
                    <span
                      key={1}
                      style={{ width: "100%" }}
                      dangerouslySetInnerHTML={{
                        __html: state.video,
                      }}
                    />
                  </Paper>
                </div>
              </>
            )}
          </Grid2>
          <Grid2 container sx={{ width: "100%" }}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Checkbox
                checked={Boolean(state.active)}
                color="primary"
                inputProps={{ "aria-label": "secondary checkbox" }}
                onChange={handleCheck}
              />
              Habilitado / Visible
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <Checkbox
                checked={Boolean(state.hasSpecialVar)}
                color="primary"
                inputProps={{ "aria-label": "secondary checkbox" }}
                onChange={handleCheck}
              />
              ¿Tiene variables especiales?
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <Checkbox
                checked={Boolean(state.autoCertified)}
                color="primary"
                inputProps={{ "aria-label": "secondary checkbox" }}
                onChange={handleCheck}
              />
              ¿Agregar certificado automáticamente?
            </Grid2>
          </Grid2>
          {state.hasSpecialVar && (
            <Grid2 container spacing={2}>
              <Grid2 container style={{ marginTop: 20 }}>
                <h3>Variables especiales</h3>
              </Grid2>
              {/* <>
                {specialVars &&
                  specialVars.map((specialVar, i) => (
                    <Grid2
                      container
                      spacing={2}
                      xs={12}
                      style={{ marginBottom: 10 }}
                    >
                      <Grid2 item xs={12} md={5}>
                        <FormControl
                          className={cx(classes.margin, classes.textField)}
                          variant="outlined"
                          xs={12}
                          fullWidth={true}
                        >
                          <TextField
                            variant="outlined"
                            required
                            fullWidth
                            id={specialVar}
                            label="Nombre"
                            name="specialVar"
                            autoComplete="specialVar"
                            value={specialVar.name}
                            onChange={(e) => {
                              setSpecialVars(
                                specialVar
                                  .slice(0, i)
                                  .concat({
                                    name: e.target.value,
                                    isSpecialVarVisible:
                                      specialVars.isSpecialVarVisible,
                                  })
                                  .concat(specialVars.slice(i + 1))
                              )
                            }}
                          />
                        </FormControl>
                      </Grid2>
                      <Grid2 item xs={12} md={5}>
                        <FormControl
                          className={cx(classes.margin, classes.textField)}
                          variant="outlined"
                          xs={12}
                          fullWidth={true}
                        >
                          <Checkbox
                            variant="outlined"
                            required
                            id="isSpecialVarVisible"
                            label="Visible"
                            name="isSpecialVarVisible"
                            autoComplete="isSpecialVarVisible"
                            value={specialVar.isSpecialVarVisible}
                            onChange={(e) => {
                              setSpecialVars(
                                specialVars
                                  .slice(0, i)
                                  .concat({
                                    name: specialVars.name,
                                    isSpecialVarVisible: e.target.value,
                                  })
                                  .concat(specialVars.slice(i + 1))
                              )
                            }}
                          />
                        </FormControl>
                      </Grid2>
                      <Grid2 item xs={2}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            setSpecialVars(
                              specialVars
                                .slice(0, i)
                                .concat(specialVars.slice(i + 1))
                            )
                          }}
                          disabled={buttonState}
                          style={{ marginTop: 20 }}
                        >
                          -
                        </Button>
                      </Grid2>
                    </Grid2>
                  ))}
                <Button
                  variant="contained"
                  color="default"
                  onClick={() => {
                    setSpecialVars(
                      specialVars.concat({
                        name: "",
                        isSpecialVarVisible: "",
                      })
                    )
                  }}
                  disabled={buttonState}
                  style={{ marginTop: 20 }}
                >
                  +
                </Button>
              </> */}
            </Grid2>
          )}
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
          {/* Cambiar por Select de Categories !!! */}
          {/* O Autocompletar en todo caso */}
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
                // error={state.cost !== undefined && !isAValidPrice(state.cost)}
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
                name="publicPrice.from"
                autoComplete="fromPublicPrice"
                value={
                  isPriceRange(state.publicPrice) ? state.publicPrice.from : ""
                }
                onChange={handleChange}
                // error={
                //   state.publicPrice?.from !== undefined &&
                //   !isAValidPrice(state.publicPrice?.from)
                // }
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
                // required
                fullWidth
                id="toPublicPrice"
                label="Hasta"
                name="publicPrice.to"
                autoComplete="toPublicPrice"
                value={
                  isPriceRange(state.publicPrice) ? state.publicPrice.to : ""
                }
                onChange={handleChange}
                // error={
                //   state.publicPrice?.to !== undefined &&
                //   !isAValidPrice(state.publicPrice?.to)
                // }
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
                name="prixerPrice.from"
                autoComplete="fromPrixerPrice"
                value={
                  isPriceRange(state.prixerPrice) ? state.prixerPrice.from : ""
                }
                onChange={handleChange}
                // error={
                //   state.prixerPrice.from !== undefined &&
                //   !isAValidPrice(state.prixerPrice.from)
                // }
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
                name="prixerPrice.to"
                autoComplete="toPrixerPrice"
                value={
                  isPriceRange(state.prixerPrice) ? state.prixerPrice.to : ""
                }
                onChange={handleChange}
                // error={
                //   state.prixerPrice?.to !== undefined &&
                //   !isAValidPrice(state.prixerPrice?.to)
                // }
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
          onClick={(e) => handleSubmit(e, images)}          //   disabled={buttonState}
          style={{ marginTop: 20 }}
        >
          Guardar
        </Button>
      </Grid2>
    </form>
  )
}
