import React, { useEffect, useState } from "react"
import { Theme } from "@mui/material"
import { makeStyles } from "tss-react/mui"

import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import CloseIcon from "@mui/icons-material/Close"
import Slide from "@mui/material/Slide"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import utils from "../../../utils/utils.js"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import Tooltip from "@mui/material/Tooltip"
import Backdrop from "@mui/material/Backdrop"
import CircularProgress from "@mui/material/CircularProgress"
import AspectRatioSelector from "./AspectRatioSelector"
import Cropper from "react-easy-crop"
import axios from "axios"
import { SelectChangeEvent } from "@mui/material/Select"

import Copyright from "@components/Copyright/copyright"

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
import Chip from "@mui/material/Chip"
import Autocomplete from "@mui/lab/Autocomplete"
import InfoIcon from "@mui/icons-material/Info"
import InputAdornment from "@mui/material/InputAdornment"
import { useSnackBar } from "@context/GlobalContext.js"

interface uploaderProps {
  setOpenArtFormDialog: (x: boolean) => void
  openArtFormDialog: boolean
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
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
  }
})

const photoIsos = ["100", "200", "400"]

const artTypes = ["Diseño", "Foto", "Pintura", "Arte plástica"]

// const useValues = [
//   'Impresión',
//   'Catálogo',
//   'Privado para clientes',
// ];

const categories = [
  "Abstracto",
  "Animales",
  "Arquitectura",
  "Atardecer",
  "Cacao",
  "Café",
  "Carros",
  "Ciudades",
  "Comida",
  "Edificios",
  "Escultura",
  "Fauna",
  "Flora",
  "Lanchas, barcos o yates",
  "Montañas",
  "Naturaleza",
  "Navidad",
  "Personajes célebres",
  "Personajes religiosos",
  "Pintura",
  "Playas",
  "Puentes",
  "Retrato",
  "Surrealista",
  "Transportes",
  "Vehículos",
]

const Transition = React.forwardRef(function Transition(props: any, ref) {
  return (
    <Slide direction="up" ref={ref} {...props}>
      {props.children}
    </Slide>
  )
})

const aspectRatios = [
  {
    id: 1,
    name: "1:1",
    aspect: 1,
    thumb: "",
    crop: { x: 0, y: 0 },
    zoom: 1,
    cropped: false,
  },
  {
    id: 2,
    name: "3:1",
    aspect: 3,
    thumb: "",
    crop: { x: 0, y: 0 },
    zoom: 1,
    cropped: false,
  },
  {
    id: 3,
    name: "2:1",
    aspect: 2,
    thumb: "",
    crop: { x: 0, y: 0 },
    zoom: 1,
    cropped: false,
  },
  {
    id: 4,
    name: "3:2",
    aspect: 3 / 2,
    thumb: "",
    crop: { x: 0, y: 0 },
    zoom: 1,
    cropped: false,
  },
  {
    id: 5,
    name: "2:3",
    aspect: 2 / 3,
    thumb: "",
    crop: { x: 0, y: 0 },
    zoom: 1,
    cropped: false,
  },
  {
    id: 6,
    name: "1:2",
    aspect: 1 / 2,
    thumb: "",
    crop: { x: 0, y: 0 },
    zoom: 1,
    cropped: false,
  },
]

export default function ArtUploader({
  setOpenArtFormDialog,
  openArtFormDialog,
}: uploaderProps) {
  const { classes } = useStyles()
  const { showSnackBar } = useSnackBar()
  const prixerToken = localStorage.getItem("token")
  const prixerData = prixerToken ? JSON.parse(prixerToken) : null

  const [title, setTitle] = useState("")
  const [artUrl, setArtUrl] = useState<File | undefined>()
  // const [thumbnailUrl, setThumbnailUrl] = useState();
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState(["foto", "arte"])
  const preTags = ["arte"]
  const [publicId, setPublicId] = useState("")
  const [originalPhotoHeight, setOriginalPhotoHeight] = useState(0)
  const [originalPhotoWidth, setOriginalPhotoWidth] = useState(0)
  const [originalPhotoIso, setOriginalPhotoIso] = useState(0)
  const [originalPhotoPpi, setOriginalPhotoPpi] = useState(0)
  const [maxPrintHeightCm, setMaxPrintHeightCm] = useState(0)
  const [maxPrintWidthCm, setMaxPrintWidthCm] = useState(0)
  const [artType, setArtType] = useState("")
  const [location, setLocation] = useState("")
  const [exclusive, setExclusive] = useState("standard")
  const [comission, setComission] = useState(10)
  const [requiredPhoto, setRequiredPhoto] = useState(false)
  const [uploaded, setUploaded] = useState("")
  const [mimeType, setMimeType] = useState("")
  const [backdrop, setBackdrop] = useState(false)
  const [croppedArt, setCroppedArt] = useState(aspectRatios)
  const [uploadedArtMeta, setUploadedArtMeta] = useState({
    width: 0,
    height: 0,
    size: 0,
  })
  const [allowExclusive, setAllowExclusive] = useState(false)
  const [disabledReason, setDisabledReason] = useState("")
  const [visible, setVisible] = useState(true)
  //Error states.
  const [snackBarAction, setSnackBarAction] = useState<React.ReactNode>(null)
  const [snackBarError, setSnackBarError] = useState(false)

  useEffect(() => {
    if (artType === "Foto") {
      handleMaxPrintCalc()
    }
  }, [
    originalPhotoWidth,
    originalPhotoHeight,
    originalPhotoPpi,
    originalPhotoIso,
  ])

  const handleArtTypeChange = (e: SelectChangeEvent<string>) => {
    if (!e.target.value) {
      setRequiredPhoto(false)
      showSnackBar("Por favor indica a qué categoría pertenece el arte.")
    } else {
      if (e.target.value === "Foto") {
        setRequiredPhoto(true)
      }
      setArtType(e.target.value)
    }
  }

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setCategory(e.target.value)
  }

  const handleExclusive = (e: SelectChangeEvent<string>) => {
    setExclusive(e.target.value)
    if (e.target.value === "standard") {
      setComission(10)
    }
  }
  const handleClose = () => {
    setOpenArtFormDialog(false)
  }

  const handleMaxPrintCalc = () => {
    if (
      originalPhotoWidth &&
      originalPhotoHeight &&
      originalPhotoPpi &&
      originalPhotoIso
    ) {
      const [widthCm, heightCm] = utils.maxPrintCalc(
        originalPhotoWidth,
        originalPhotoHeight,
        originalPhotoPpi,
        originalPhotoIso
      )
      setMaxPrintWidthCm(widthCm)
      setMaxPrintHeightCm(heightCm)
    } else if (
      !originalPhotoIso &&
      originalPhotoWidth &&
      originalPhotoHeight &&
      originalPhotoPpi
    ) {
      showSnackBar("Por favor indica a el ISO de la foto. ")
      setSnackBarAction(
        <Button
          target="_blank"
          style={{ color: "#fff" }}
          href="https://www.ionos.es/digitalguide/paginas-web/diseno-web/que-son-los-datos-exif/#:~:text=los%20datos%20EXIF.-,EXIF%20con%20el%20bot%C3%B3n%20derecho%20del%20rat%C3%B3n,de%20archivo%20y%20el%20nombre)."
        >
          Aprende cómo
        </Button>
      )
    } else if (
      originalPhotoIso &&
      (!originalPhotoWidth || !originalPhotoHeight) &&
      originalPhotoPpi
    ) {
      showSnackBar("Por favor indica a el Ancho y Alto de la foto. ")
      setSnackBarAction(
        <Button
          target="_blank"
          style={{ color: "#fff" }}
          href="https://www.ionos.es/digitalguide/paginas-web/diseno-web/que-son-los-datos-exif/#:~:text=los%20datos%20EXIF.-,EXIF%20con%20el%20bot%C3%B3n%20derecho%20del%20rat%C3%B3n,de%20archivo%20y%20el%20nombre)."
        >
          Aprende cómo
        </Button>
      )
    } else if (
      originalPhotoIso &&
      originalPhotoWidth &&
      originalPhotoHeight &&
      !originalPhotoPpi
    ) {
      showSnackBar("Por favor indica a los PPI de la foto. ")
      setSnackBarAction(
        <Button
          target="_blank"
          style={{ color: "#fff" }}
          href="https://www.ionos.es/digitalguide/paginas-web/diseno-web/que-son-los-datos-exif/#:~:text=los%20datos%20EXIF.-,EXIF%20con%20el%20bot%C3%B3n%20derecho%20del%20rat%C3%B3n,de%20archivo%20y%20el%20nombre)."
        >
          Aprende cómo
        </Button>
      )
    } else {
      showSnackBar("Por favor completa los campos requeridos.")
      setSnackBarAction(
        <Button
          target="_blank"
          style={{ color: "#fff" }}
          href="https://www.ionos.es/digitalguide/paginas-web/diseno-web/que-son-los-datos-exif/#:~:text=los%20datos%20EXIF.-,EXIF%20con%20el%20bot%C3%B3n%20derecho%20del%20rat%C3%B3n,de%20archivo%20y%20el%20nombre)."
        >
          Aprende cómo
        </Button>
      )
    }
  }

  // const allCrops = () => {
  //   const sum = croppedArt.reduce((prev, art, i) => {
  //     if (art.cropped) {
  //       return prev + 1;
  //     } else {
  //       return prev + 0;
  //     }
  //   }, 0);
  //   if (sum == croppedArt.length) {
  //     return [null, true];
  //   } else {
  //     return [croppedArt.length - sum, false];
  //   }
  // };

  const handleSubmit = async () => {
    try {
      if (title && description && category && tags) {
        if (
          (artType === "Foto" &&
            originalPhotoWidth &&
            originalPhotoHeight &&
            originalPhotoPpi &&
            originalPhotoIso) ||
          (artType !== undefined && artType !== "Foto")
        ) {
          setBackdrop(true)
          await newArtPost()
        } else {
          showSnackBar("Por favor indica ancho, alto, PPI e ISO de la foto. ")
        }
      } else {
        showSnackBar("Por favor completa el todos los campos.")
      }
    } catch (err) {
      console.log(err)
      setBackdrop(false)
      setOpenArtFormDialog(false)
      showSnackBar(
        "Ocurrió un error inesperado, por favor valida e inicia sesión."
      )
    }
  }

  const getMimeType = (img: any) => {
    const fileReader = new FileReader()

    fileReader.onloadend = function (e) {
      const result = e.target?.result // Asegura que `result` existe

      if (result instanceof ArrayBuffer) {
        const arr = new Uint8Array(result).subarray(0, 4)
        let header = ""

        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16)
        }

        let type = "unknown"
        switch (header) {
          case "89504e47":
            type = "image/png"
            break
          case "ffd8ffe0":
          case "ffd8ffe1":
          case "ffd8ffe2":
          case "ffd8ffe3":
          case "ffd8ffe8":
            type = "image/jpeg"
            break
        }

        setMimeType(type)
      }
    }

    fileReader.readAsArrayBuffer(img)
  }

  // function blobToFile(theBlob, fileName) {
  //   //A Blob() is almost a File() - it's just missing the two properties below which we will add
  //   theBlob.lastModifiedDate = new Date();
  //   theBlob.name = fileName;
  //   return theBlob;
  // }

  const handleArtChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let artMeta: any = {}
    if (!e.target.files) return
    getMimeType(e.target.files[0])
    if (e.target.files && e.target.files[0]) {
      if (mimeType === "unknow") {
        e.target.value = ""
        showSnackBar(
          "Disculpa, pero el formato de tu arte no está permitido por los momentos."
        )
        console.log("error, file format not allowed")
      } else if (e.target.files[0].size >= 5120000) {
        showSnackBar(
          "Disculpa, el arte que subiste es muy grande. El máximo por los momentos es de 5 MB."
        )
      } else {
        var img = new Image()
        var objectUrl = URL.createObjectURL(e.target.files[0])
        img.onload = function () {
          if (img.width <= 900 && img.height <= 900) {
            showSnackBar(
              "Disculpa, tanto el ancho como el alto de tu arte es menor al establecido. Por favor sube un arte con mayor resolución."
            )
          } else if (img.width <= 750) {
            showSnackBar(
              "Disculpa, el ancho de tu arte es menor al establecido. Por favor sube un arte con mayor resolución."
            )
          } else if (img.height <= 900) {
            showSnackBar(
              "Disculpa, el alto de tu arte es menor al establecido. Por favor sube un arte con mayor resolución."
            )
          } else {
            artMeta.width = img.width
            artMeta.height = img.height
            setUploadedArtMeta(artMeta)
            setUploaded(objectUrl)
          }
        }
        img.src = objectUrl
        setArtUrl(e.target.files[0])
        artMeta.size = e.target.files[0].size
      }
    }
  }

  // const removeCrops = () => {
  //   croppedArt.map((n) => {
  //     delete n.thumb;
  //   });
  // };

  const verifyStandardArts = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/art/read-by-prixer"
    const body = {
      username: prixerData.username,
    }
    axios.post(base_url, body).then((response) => {
      if (response.data.arts.length > 5) {
        setAllowExclusive(true)
      }
    })
  }

  useEffect(() => {
    if (prixerData.role === "Prixer") {
      verifyStandardArts()
    } else {
      setAllowExclusive(true)
    }
  }, [])

  async function newArtPost() {
    var formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("category", category)
    formData.append("tags", JSON.stringify(tags))
    formData.append("uploadedArtMeta", JSON.stringify(uploadedArtMeta))
    formData.append("crops", JSON.stringify(croppedArt))
    formData.append("userId", prixerData.id)
    formData.append("prixerUsername", prixerData.username)
    formData.append("status", "Active")
    formData.append("publicId", publicId)
    formData.append("artType", artType)
    formData.append("originalPhotoWidth", originalPhotoWidth.toString())
    formData.append("originalPhotoHeight", originalPhotoHeight.toString())
    formData.append("originalPhotoIso", originalPhotoIso.toString())
    formData.append("originalPhotoPpi", originalPhotoPpi.toString())
    formData.append("artLocation", location)
    formData.append("disabledReason", disabledReason)
    formData.append("visible", visible.toString())
    formData.append("exclusive", exclusive)
    formData.append("comission", comission.toString())
    formData.append("imageUrl", JSON.stringify(artUrl))

    const base_url = import.meta.env.VITE_BACKEND_URL + "/art/create"
    const data = await axios.post(base_url, formData)
    if (data.data.success) {
      setOpenArtFormDialog(false)
      setBackdrop(false)
      window.location.reload()
    } else {
      showSnackBar(
        "Por favor vuelve a intentarlo, puede que exista algún inconveniente de conexión. Si aún no lo has hecho por favor inicia sesión."
      )
    }
  }

  return (
    <div>
      <Dialog
        open={openArtFormDialog}
        onClose={handleClose}
        // TransitionComponent={Transition}
        slots={{ transition: Transition }}
      >
        <Backdrop open={backdrop}>
          <CircularProgress color="inherit" />
          <p>
            Esto puede tardar unos pocos minutos <br /> no cierres esta ventana
            aún.
          </p>
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
              Comparte tu Arte
            </Typography>
            <Button autoFocus color="inherit" onClick={handleSubmit}>
              Guardar
            </Button>
          </Toolbar>
        </AppBar>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <form className={classes.form} noValidate>
              <Grid2 container spacing={2}>
                <Grid2>
                  <Paper
                    variant="outlined"
                    style={{
                      textAlign: "center",
                      // hover: { background: "#000000" },
                    }}
                  >
                    <div style={{ padding: "5%" }}>
                      <input
                        type="file"
                        id="inputfile"
                        accept="image/jpeg, image/jpg, image/webp, image/png"
                        onChange={handleArtChange}
                        style={{ display: "none" }}
                      />
                      {!uploaded ? (
                        <label htmlFor="inputfile">
                          <Tooltip
                            title={
                              "Carga tu arte con un mínimo de 1080px tanto de ancho como de alto. Tu Arte debe pesar máximo 5Mb y estar en formato .jpeg o .png"
                            }
                          >
                            <Button
                              variant="contained"
                              color="primary"
                              component="span"
                              startIcon={<CloudUploadIcon />}
                            >
                              Cargar arte
                            </Button>
                          </Tooltip>
                        </label>
                      ) : (
                        <AspectRatioSelector
                          art={uploaded}
                          croppedArt={croppedArt}
                          setCroppedArt={setCroppedArt}
                        />
                      )}
                    </div>
                  </Paper>
                </Grid2>
                <Grid2>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="title"
                    label="Título"
                    name="title"
                    autoComplete="title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                    }}
                  />
                </Grid2>
                <Grid2>
                  <FormControl
                    variant="outlined"
                    className={classes.form}
                    fullWidth
                  >
                    <InputLabel required id="artTypeLabel">
                      Tipo
                    </InputLabel>
                    <Select
                      labelId="artTypeLabel"
                      id="artType"
                      value={artType}
                      onChange={handleArtTypeChange}
                      label="artType"
                    >
                      <MenuItem value="">
                        <em></em>
                      </MenuItem>
                      {artTypes.map((n) => (
                        <MenuItem key={n} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>
                {artType !== "Diseño" && (
                  <React.Fragment>
                    <Grid2 container>
                      <Grid2 size={{ xs: 4, sm: 4 }}>
                        <Typography
                          style={{
                            whiteSpace: "pre-line",
                            padding: 15,
                            fontSize: "0.7em",
                          }}
                        >
                          Medida del archivo <br /> original en px
                        </Typography>
                      </Grid2>
                      <Grid2 size={{ xs: 8, sm: 8 }}>
                        <Grid2 size={{ xs: 5, sm: 5 }}>
                          <TextField
                            variant="outlined"
                            fullWidth
                            required={requiredPhoto}
                            id="originalPhotoWidth"
                            label="Ancho"
                            type="number"
                            name="originalPhotoWidth"
                            autoComplete="originalPhotoWidth"
                            value={originalPhotoWidth}
                            onChange={(e) => {
                              setOriginalPhotoWidth(Number(e.target.value))
                              if (Number(e.target.value) < 2000) {
                                showSnackBar(
                                  "La foto original debe tener un ancho mayor a 2.000 px."
                                )
                              }
                            }}
                          />
                        </Grid2>
                        <Typography style={{ padding: 10 }}> x </Typography>
                        <Grid2 size={{ xs: 5, sm: 5 }}>
                          <TextField
                            variant="outlined"
                            fullWidth
                            required={requiredPhoto}
                            type="number"
                            id="originalPhotoHeight"
                            label="Alto"
                            name="originalPhotoHeight"
                            autoComplete="originalPhotoHeight"
                            value={originalPhotoHeight}
                            onChange={(e) => {
                              setOriginalPhotoHeight(Number(e.target.value))
                              if (Number(e.target.value) < 2000) {
                                showSnackBar(
                                  "La foto original debe tener un alto mayor a 2.000 px."
                                )
                              }
                            }}
                          />
                        </Grid2>
                      </Grid2>
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                      <Grid2 size={{ xs: 6 }} style={{ marginRight: "10px" }}>
                        <TextField
                          variant="outlined"
                          fullWidth
                          required={requiredPhoto}
                          type="number"
                          id="originalPhotoPpi"
                          label="PPI"
                          name="originalPhotoPpi"
                          autoComplete="originalPhotoPpi"
                          value={originalPhotoPpi}
                          onChange={(e) => {
                            setOriginalPhotoPpi(Number(e.target.value))
                            if (Number(e.target.value) < 100) {
                              showSnackBar(
                                "La foto original debe ser mayor a 100 ppi."
                              )
                            }
                          }}
                        />
                      </Grid2>
                      <Grid2 size={{ xs: 6, sm: 6 }}>
                        <FormControl
                          variant="outlined"
                          className={classes.form}
                        >
                          <InputLabel
                            required={requiredPhoto}
                            id="originalPhotoIsoLabel"
                          >
                            ISO
                          </InputLabel>
                          <Select
                            labelId="originalPhotoIsoLabel"
                            id="originalPhotoIso"
                            value={originalPhotoIso}
                            onChange={(e) => {
                              setOriginalPhotoIso(Number(e.target.value))
                            }}
                            label="originalPhotoIso"
                          >
                            <MenuItem value="">
                              <em></em>
                            </MenuItem>
                            {photoIsos.map((n) => (
                              <MenuItem key={n} value={n}>
                                {n}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid2>
                    </Grid2>
                    {originalPhotoIso &&
                      originalPhotoWidth &&
                      originalPhotoHeight && (
                        <Grid2 container>
                          <Grid2
                            size={{
                              xs: 6,
                            }}
                            style={{ textAlign: "center" }}
                          >
                            <Typography
                              style={{
                                whiteSpace: "pre-line",
                                padding: 15,
                                fontSize: "1em",
                              }}
                            >
                              {" "}
                              Medida máxima <br /> para impresión
                            </Typography>
                          </Grid2>
                          <Grid2
                            size={{
                              xs: 6,
                            }}
                            style={{ textAlign: "center" }}
                          >
                            <Typography
                              style={{
                                whiteSpace: "pre-line",
                                padding: 15,
                                fontSize: "1.5em",
                              }}
                            >
                              {maxPrintWidthCm} x {maxPrintHeightCm} cm
                            </Typography>
                          </Grid2>
                        </Grid2>
                      )}
                  </React.Fragment>
                )}

                <Grid2>
                  <FormControl variant="outlined" className={classes.form}>
                    <InputLabel required>Categoría</InputLabel>
                    <Select value={category} onChange={handleCategoryChange}>
                      <MenuItem value="">
                        <em></em>
                      </MenuItem>
                      {categories.map((n) => (
                        <MenuItem key={n} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>
                <Grid2>
                  <Autocomplete
                    multiple
                    id="tags-filled"
                    options={preTags.map((option) => option)}
                    defaultValue={preTags}
                    freeSolo
                    onChange={(event, newValue) => setTags(newValue)} // Actualiza el estado correctamente
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Etiquetas"
                      />
                    )}
                  />
                </Grid2>
                <Grid2>
                  <TextField
                    autoComplete="description"
                    required
                    name="description"
                    variant="outlined"
                    fullWidth
                    id="description"
                    label="Descripción"
                    autoFocus
                    multiline
                    minRows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Grid2>
                {allowExclusive && (
                  <Grid2
                    container
                    spacing={2}
                    style={{ justifyContent: "center" }}
                  >
                    <Grid2 size={{ xs: 12, md: 5 }}>
                      <FormControl variant="outlined" className={classes.form}>
                        <InputLabel required id="artTypeLabel">
                          Exclusividad
                        </InputLabel>
                        <Select
                          value={exclusive}
                          onChange={handleExclusive}
                          label="artType"
                        >
                          <MenuItem value="standard">Estándar</MenuItem>
                          <MenuItem value={"exclusive"}>Exclusivo</MenuItem>
                          <MenuItem value={"private"}>Privado</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 5 }}>
                      <TextField
                        variant="outlined"
                        fullWidth
                        label="Comisión"
                        disabled={exclusive === "standard"}
                        value={comission}
                        type="number"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                %
                              </InputAdornment>
                            ),
                          },
                          htmlInput: {
                            min: 10,
                          },
                        }}
                        onChange={(e) => setComission(Number(e.target.value))}
                      />
                    </Grid2>
                  </Grid2>
                )}
                <Grid2>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="location"
                    label="Ubicación"
                    name="location"
                    autoComplete="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Grid2>
                <Grid2
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <InfoIcon color={"secondary"} />
                  <Typography color={"secondary"}>
                    Tu arte podrá ser encontrado por estos datos.
                  </Typography>
                </Grid2>
              </Grid2>
            </form>
          </div>
          <Box mt={5}>
            <Copyright />
          </Box>
          {/* <Snackbar
            textalign={"center"}
            open={snackBarError}
            autoHideDuration={5000}
            message={errorMessage}
            className={classes.snackbar}
            action={snackBarAction}
            onClose={() => {
              setSnackBarError(false)
              setSnackBarAction(false)
            }}
          /> */}
        </Container>
      </Dialog>
    </div>
  )
}
