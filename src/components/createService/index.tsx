import React, { useEffect, useState } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import CloseIcon from "@mui/icons-material/Close"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import Backdrop from "@mui/material/Backdrop"
import CircularProgress from "@mui/material/CircularProgress"
import useMediaQuery from "@mui/material/useMediaQuery"

import axios from "axios"

import Copyright from "../Copyright/copyright"

//material-ui
import Grid2 from "@mui/material/Grid2"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Snackbar from "@mui/material/Snackbar"
import InputLabel from "@mui/material/InputLabel"
import FormControl from "@mui/material/FormControl"
import TextField from "@mui/material/TextField"
import CssBaseline from "@mui/material/CssBaseline"
import Paper from "@mui/material/Paper"
import FormControlLabel from "@mui/material/FormControlLabel"
import Checkbox from "@mui/material/Checkbox"
import InputAdornment from "@mui/material/InputAdornment"
import InfoIcon from "@mui/icons-material/Info"
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined"
import EditIcon from "@mui/icons-material/Edit"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { Theme, useTheme } from "@mui/material"
import { makeStyles } from "tss-react/mui"
import Slide from "@mui/material/Slide"
import { SelectChangeEvent } from "@mui/material/Select"
import { useSnackBar, useLoading } from "@context/GlobalContext"

interface CSProps {
  setOpenServiceFormDialog: (x: boolean) => void
  setCreatedService: (x: boolean) => void
  openServiceFormDialog: boolean
}
const useStyles = makeStyles()((theme: Theme) => {
  return {
    img: {
      maxWidth: "80vw",
      maxHeight: "300px",
      width: "100%",
      height: "100%",
      objectFit: "cover",
      objectPosition: "50% 50%",
    },
    formControl: {
      margin: theme.spacing(1),
      width: "100%",
    },
    form: {
      width: "100%",
      marginTop: theme.spacing(0),
    },
    paper: {
      marginTop: theme.spacing(3),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    appBar: {
      position: "relative",
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: theme.palette.primary.main,
    },
  }
})

const serviceAreas = ["Diseño", "Fotografía", "Artes Plásticas", "Otro"]

const Transition = React.forwardRef(function Transition(props: any, ref) {
  return (
    <Slide direction="up" ref={ref} {...props}>
      {props.children}
    </Slide>
  )
})

export default function CreateService({
  setOpenServiceFormDialog,
  setCreatedService,
  openServiceFormDialog,
}: CSProps) {
  const { classes } = useStyles()
  const theme = useTheme()

  const isMobile = useMediaQuery(theme.breakpoints.down("xs"))

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [serviceArea, setServiceArea] = useState("")
  const [location, setLocation] = useState("")
  const [mimeType, setMimeType] = useState("")
  const [backdrop, setBackdrop] = useState(false)
  const [isLocal, setIsLocal] = useState(false)
  const [isRemote, setIsRemote] = useState(false)
  const [priceFrom, setPriceFrom] = useState(0)
  const [priceTo, setPriceTo] = useState(0)
  const [productionTime, setProductionTime] = useState("")
  const [disabledReason, setDisabledReason] = useState("")
  const [active, setActive] = useState(true)
  const [imageLoader, setLoadImage] = useState<any>([])
  const [images, setImages] = useState<File[]>([])
  //Error states.
  const [snackBarAction, setSnackBarAction] = useState(false)
  const [snackBarError, setSnackBarError] = useState(false)
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  // const prixerUsername = new URLSearchParams(window.location)
  //   .get("pathname")
  //   .replace(/[/]/gi, "")

  const handleEditorChange = (value: string) => {
    setDescription(value)
  }

  const handleServiceAreaChange = (e: SelectChangeEvent<string>) => {
    if (!e.target.value) {
      showSnackBar("Por favor indica a qué categoría pertenece el arte.")
    } else {
      setServiceArea(e.target.value)
    }
  }

  const handleClose = () => {
    setOpenServiceFormDialog(false)
  }

  const handleSubmit = async () => {
    try {
      if (title && description && serviceArea && priceFrom > 0) {
        await newService()
      } else {
        showSnackBar("Por favor completa los campos requeridos.")
      }
    } catch (err) {
      console.log(err)
      setBackdrop(false)
      setOpenServiceFormDialog(false)
      showSnackBar(
        "Ocurrió un error inesperado, por favor valida e inicia sesión."
      )
    }
  }

  const handleIsLocal = () => {
    setIsLocal(!isLocal)
  }

  const handleIsRemote = () => {
    setIsRemote(!isRemote)
  }

  async function newService() {
    var formData = new FormData()

    const prixer = localStorage.getItem("token")
    const prixerData = prixer ? JSON.parse(prixer) : null

    const ID =
      prixerData.role === "Organization"
        ? prixerData.orgId
        : prixerData.prixerId

    formData.append("title", title)
    formData.append("description", description)
    formData.append("serviceArea", serviceArea)
    formData.append("isLocal", isLocal.toString())
    formData.append("isRemote", isRemote.toString())
    formData.append("location", location)
    formData.append("productionTime", productionTime)
    formData.append("priceFrom", priceFrom.toString())
    formData.append("priceTo", priceTo.toString())
    formData.append("userId", prixerData.id)
    formData.append("prixerUsername", prixerData.username)
    formData.append("prixer", ID)
    formData.append("active", active.toString())

    images.map((file) => formData.append("serviceImages", file))

    const base_url = import.meta.env.VITE_BACKEND_URL + "/service/create"
    const create = await axios.post(base_url, formData)
    if (create.data.success) {
      setOpenServiceFormDialog(false)
      setCreatedService(true)
      showSnackBar("Servicio creado exitosamente.")
    } else {
      showSnackBar(
        "Por favor vuelve a intentarlo, puede que exista algún inconveniente de conexión. Si aún no lo has hecho por favor inicia sesión."
      )
    }
  }

  const replaceImage = async (e: any, index: number) => {
    if (e !== undefined) {
      const file: File = e.target.files[0]
      const resizedString = await convertToBase64(file)
      const prevImg = [...imageLoader]
      prevImg[index] = resizedString
      setLoadImage(prevImg)

      const newImgs: File[] = [...images]
      newImgs.splice(index, 1, file)
      setImages(newImgs)
    }
  }

  const convertToBase64 = (blob: any) => {
    return new Promise((resolve) => {
      var reader = new FileReader()
      reader.onload = function () {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })
  }

  const deleteImage = (X: any, i: number) => {
    if (imageLoader.length === 1) {
      setLoadImage([])
      setImages([])
    } else if (imageLoader.length > 1) {
      const newImg = imageLoader.filter((img: any) => img !== X)
      setLoadImage(newImg)
      const newImgs = [...images]
      newImgs.splice(i, 1)
      setImages(newImgs)
    }
  }

  const loadImage = async (e: any) => {
    e.preventDefault()

    const file = e.target.files[0]
    const resizedString: any = await convertToBase64(file)
    if (imageLoader.length === 0) {
      setLoadImage([resizedString])
      setImages([file])
    } else if (imageLoader.length === 6) {
      setSnackBarError(true)
      showSnackBar("Has alcanzado el límite de imágenes permitidas.")
    } else {
      setLoadImage([...imageLoader, resizedString])
      setImages([...images, file])
    }
  }

  return (
    <div>
      <Dialog
        open={openServiceFormDialog}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <Backdrop className={classes.backdrop} open={backdrop}>
          <CircularProgress color="inherit" />
          <p>Esto puede tardar unos pocos minutos.</p>
        </Backdrop>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Comparte tu Servicio
            </Typography>
            <Button autoFocus color="inherit" onClick={handleSubmit}>
              Guardar
            </Button>
          </Toolbar>
        </AppBar>
        <Container component="main" maxWidth="md">
          <CssBaseline />
          <div className={classes.paper}>
            <form className={classes.form} noValidate>
              <Grid2 container spacing={2}>
                <Grid2>
                  <TextField
                    variant="outlined"
                    autoFocus
                    required
                    fullWidth
                    label="Título"
                    value={title}
                    placeholder='Ejemplo: "Fotografía de eventos" o "Diseño de logotipos"'
                    onChange={(e) => {
                      setTitle(e.target.value)
                    }}
                  />
                </Grid2>
                <Grid2>
                  <Paper
                    variant="outlined"
                    style={{
                      textAlign: "center",
                      hover: { background: "#000000" },
                    }}
                  >
                    <Grid2 style={{ display: "flex" }}>
                      {imageLoader &&
                        imageLoader.map((img: string, i: number) => {
                          return (
                            <div
                              style={{
                                width: "25%",
                                marginRight: "4px",
                              }}
                            >
                              <div
                                style={{
                                  textAlign: "right",
                                }}
                              >
                                <IconButton
                                  style={{ color: "#d33f49", marginRight: -15 }}
                                  component="label"
                                >
                                  <input
                                    name="productImages"
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(a) => {
                                      // const i = imageLoader.indexOf(img);
                                      replaceImage(a, i)
                                    }}
                                  />
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  style={{
                                    color: "#d33f49",
                                    marginRight: -5,
                                  }}
                                  onClick={() => {
                                    deleteImage(img, i)
                                  }}
                                >
                                  <HighlightOffOutlinedIcon />
                                </IconButton>
                              </div>

                              <img
                                style={{
                                  width: "100%",
                                  // height: "200px",
                                  objectFit: "contain",
                                  marginTop: -35,
                                }}
                                src={img}
                                alt="+"
                              />
                            </div>
                          )
                        })}
                    </Grid2>
                    <Grid2
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: 10,
                      }}
                    >
                      <FormControl variant="outlined">
                        <Button
                          variant="contained"
                          component="label"
                          color="primary"
                        >
                          Subir foto
                          <input
                            name="productImages"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(a) => {
                              a.preventDefault()
                              loadImage(a)
                            }}
                          />
                        </Button>
                      </FormControl>
                    </Grid2>
                  </Paper>
                </Grid2>

                <Grid2>
                  <FormControl variant="outlined" className={classes.form}>
                    <InputLabel id="serviceAreaLabel">Tipo</InputLabel>
                    <Select
                      labelId="serviceAreaLabel"
                      id="serviceArea"
                      value={serviceArea}
                      onChange={handleServiceAreaChange}
                      label="serviceArea"
                    >
                      <MenuItem value="">
                        <em></em>
                      </MenuItem>
                      {serviceAreas.map((n) => (
                        <MenuItem key={n} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2>
                  {/* <TextField
                    autoComplete="description"
                    required
                    name="description"
                    variant="outlined"
                    fullWidth
                    id="description"
                    label="Descripción"
                    multiline
                    minRows={3}
                    maxRows={18}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  /> */}
                  <ReactQuill
                    style={{ height: 300, marginBottom: 30 }}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, 4, 5, 6, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ align: [] }],
                        [{ list: "ordered" }, { list: "bullet" }],
                      ],
                    }}
                    value={description}
                    onChange={handleEditorChange}
                    placeholder="Escribe la descripción aquí..."
                  />
                </Grid2>

                <Grid2 style={{ marginTop: isMobile ? 30 : 0 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isLocal}
                        onChange={() => {
                          handleIsLocal()
                        }}
                      />
                    }
                    label="¿Trabajas en un sitio específico?"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isRemote}
                        onChange={() => {
                          handleIsRemote()
                        }}
                      />
                    }
                    label="¿Trabajas a domicilio?"
                  />
                </Grid2>
                <Grid2>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="location"
                    label="Ubicación"
                    name="location"
                    autoComplete="location"
                    value={location}
                    placeholder="Si trabajas en algún sitio en específico indica aquí la dirección."
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Grid2>
                <Grid2>
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Tiempo de trabajo aproximado"
                    value={productionTime}
                    onChange={(e) => setProductionTime(e.target.value)}
                  />
                </Grid2>
                <Grid2>
                  <Typography variant="subtitle1">Valor</Typography>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <Grid2 size={{ xs: 5 }}>
                      <TextField
                        // style={{ marginRight: 45 }}
                        required
                        variant="outlined"
                        label="Desde"
                        type="Number"
                        value={priceFrom}
                        onChange={(e) => setPriceFrom(Number(e.target.value))}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 5 }}>
                      <TextField
                        variant="outlined"
                        label="Hasta"
                        type="Number"
                        value={priceTo}
                        onChange={(e) => setPriceTo(Number(e.target.value))}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                      />
                    </Grid2>
                  </div>
                </Grid2>
                <Grid2
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <InfoIcon color={"secondary"} />
                  <Typography color={"secondary"}>
                    Tu servicio podrá ser encontrado por estos datos.
                  </Typography>
                </Grid2>
              </Grid2>
            </form>
          </div>
          <Box mt={5} mb={4}>
            <Copyright />
          </Box>
          <Snackbar
            open={snackBarError}
            autoHideDuration={5000}
            // message={errorMessage}
            action={snackBarAction}
            onClose={() => {
              setSnackBarError(false)
              setSnackBarAction(false)
            }}
          />
        </Container>
      </Dialog>
    </div>
  )
}
