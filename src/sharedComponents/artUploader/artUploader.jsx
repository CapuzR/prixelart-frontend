import React, { useEffect, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import utils from "../../utils/utils.js";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Tooltip from "@material-ui/core/Tooltip";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import AspectRatioSelector from "./aspectRatioSelector";
import Cropper from "react-easy-crop";

import { useState } from "react";
import axios from "axios";

import Copyright from "../Copyright/copyright";

//material-ui
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import Snackbar from "@material-ui/core/Snackbar";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Chip from "@material-ui/core/Chip";
import Autocomplete from "@material-ui/lab/Autocomplete";

const useStyles = makeStyles((theme) => ({
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
  snackbar: {
    [theme.breakpoints.down("xs")]: {
      bottom: 90,
    },
    margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      width: "25ch",
    },
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
}));

const photoIsos = ["100", "200", "400"];

const artTypes = ["Diseño", "Foto"];

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
  "Fauna",
  "Flora",
  "Lanchas, barcos o yates",
  "Montañas",
  "Naturaleza",
  "Navidad",
  "Playas",
  "Puentes",
  "Surrealista",
  "Transportes",
  "Vehículos",
];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
];

export default function ArtUploader(props) {
  const classes = useStyles();

  const [title, setTitle] = useState("");
  const [artUrl, setArtUrl] = useState();
  const [thumbnailUrl, setThumbnailUrl] = useState();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState(["foto", "arte"]);
  const preTags = ["arte", "prixelart"];
  const [publicId, setPublicId] = useState("");
  const [originalPhotoHeight, setOriginalPhotoHeight] = useState("");
  const [originalPhotoWidth, setOriginalPhotoWidth] = useState("");
  const [originalPhotoIso, setOriginalPhotoIso] = useState("");
  const [originalPhotoPpi, setOriginalPhotoPpi] = useState("");
  const [maxPrintHeightCm, setMaxPrintHeightCm] = useState("");
  const [maxPrintWidthCm, setMaxPrintWidthCm] = useState("");
  const [artType, setArtType] = useState("");
  const [location, setLocation] = useState("");
  const [requiredPhoto, setRequiredPhoto] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [mimeType, setMimeType] = useState("");
  const [backdrop, setBackdrop] = useState(false);
  const [croppedArt, setCroppedArt] = useState(aspectRatios);
  const [uploadedArtMeta, setUploadedArtMeta] = useState({
    width: 0,
    height: 0,
    size: 0,
  });
  const [disabledReason, setDisabledReason] = useState("");
  const [visible, setVisible] = useState(true);
  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarAction, setSnackBarAction] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  useEffect(() => {
    if (artType === "Foto") {
      handleMaxPrintCalc();
    }
  }, [
    originalPhotoWidth,
    originalPhotoHeight,
    originalPhotoPpi,
    originalPhotoIso,
  ]);

  const handleArtTypeChange = (e) => {
    if (!e.target.value) {
      setRequiredPhoto(false);
      setErrorMessage("Por favor indica a qué categoría pertenece el arte.");
      setSnackBarError(true);
    } else {
      if (e.target.value === "Foto") {
        setRequiredPhoto(true);
      }
      setArtType(e.target.value);
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleClose = () => {
    props.setOpenArtFormDialog(false);
  };

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
      );
      setMaxPrintWidthCm(widthCm);
      setMaxPrintHeightCm(heightCm);
    } else if (
      !originalPhotoIso &&
      originalPhotoWidth &&
      originalPhotoHeight &&
      originalPhotoPpi
    ) {
      setErrorMessage("Por favor indica a el ISO de la foto. ");
      setSnackBarAction(
        <Button
          target="_blank"
          style={{ color: "#fff" }}
          href="https://www.ionos.es/digitalguide/paginas-web/diseno-web/que-son-los-datos-exif/#:~:text=los%20datos%20EXIF.-,EXIF%20con%20el%20bot%C3%B3n%20derecho%20del%20rat%C3%B3n,de%20archivo%20y%20el%20nombre)."
        >
          Aprende cómo
        </Button>
      );
      setSnackBarError(true);
    } else if (
      originalPhotoIso &&
      (!originalPhotoWidth || !originalPhotoHeight) &&
      originalPhotoPpi
    ) {
      setErrorMessage("Por favor indica a el Ancho y Alto de la foto. ");
      setSnackBarAction(
        <Button
          target="_blank"
          style={{ color: "#fff" }}
          href="https://www.ionos.es/digitalguide/paginas-web/diseno-web/que-son-los-datos-exif/#:~:text=los%20datos%20EXIF.-,EXIF%20con%20el%20bot%C3%B3n%20derecho%20del%20rat%C3%B3n,de%20archivo%20y%20el%20nombre)."
        >
          Aprende cómo
        </Button>
      );
      setSnackBarError(true);
    } else if (
      originalPhotoIso &&
      originalPhotoWidth &&
      originalPhotoHeight &&
      !originalPhotoPpi
    ) {
      setErrorMessage("Por favor indica a los PPI de la foto. ");
      setSnackBarAction(
        <Button
          target="_blank"
          style={{ color: "#fff" }}
          href="https://www.ionos.es/digitalguide/paginas-web/diseno-web/que-son-los-datos-exif/#:~:text=los%20datos%20EXIF.-,EXIF%20con%20el%20bot%C3%B3n%20derecho%20del%20rat%C3%B3n,de%20archivo%20y%20el%20nombre)."
        >
          Aprende cómo
        </Button>
      );
      setSnackBarError(true);
    } else {
      setErrorMessage("Por favor completa los campos requeridos.");
      setSnackBarAction(
        <Button
          target="_blank"
          style={{ color: "#fff" }}
          href="https://www.ionos.es/digitalguide/paginas-web/diseno-web/que-son-los-datos-exif/#:~:text=los%20datos%20EXIF.-,EXIF%20con%20el%20bot%C3%B3n%20derecho%20del%20rat%C3%B3n,de%20archivo%20y%20el%20nombre)."
        >
          Aprende cómo
        </Button>
      );
      setSnackBarError(true);
    }
  };

  const allCrops = () => {
    const sum = croppedArt.reduce((prev, art, i) => {
      if (art.cropped) {
        return prev + 1;
      } else {
        return prev + 0;
      }
    }, 0);
    if (sum == croppedArt.length) {
      return [null, true];
    } else {
      return [croppedArt.length - sum, false];
    }
  };

  const handleSubmit = async () => {
    try {
      // const [pendingCrops, isCrops] = allCrops();
      // if (!isCrops) {
      //   setErrorMessage(
      //     "Por favor realiza los " +
      //       pendingCrops +
      //       " recortes restantes de tu arte antes de continuar."
      //   );
      //   if (pendingCrops == 1) {
      //     setErrorMessage(
      //       "Tu arte está casi listo, solo falta realizar " +
      //         pendingCrops +
      //         " recorte para continuar."
      //     );
      //   }
      //   setSnackBarError(true);
      // } else {
      if (title && description && category && tags) {
        if (
          artType === "Diseño" ||
          (originalPhotoWidth &&
            originalPhotoHeight &&
            originalPhotoPpi &&
            originalPhotoIso)
        ) {
          setBackdrop(true);
          await newArtPost();
        } else {
          setErrorMessage(
            "Por favor indica ancho, alto, PPI e ISO de la foto. "
          );
          setSnackBarError(true);
        }
      } else {
        setErrorMessage("Por favor completa el todos los campos.");
        setSnackBarError(true);
      }
      // }
    } catch (err) {
      console.log(err);
      setBackdrop(false);
      props.setOpenArtFormDialog(false);
      setErrorMessage(
        "Ocurrió un error inesperado, por favor valida e inicia sesión."
      );
      setSnackBarError(true);
    }
  };

  const getMimeType = (img) => {
    const fileReader = new FileReader();
    let type = "";
    fileReader.onloadend = function (e) {
      const arr = new Uint8Array(e.target.result).subarray(0, 4);
      let header = "";
      for (var i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }

      switch (header) {
        case "89504e47":
          type = "image/png";
          break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
          type = "image/jpeg";
          break;
        default:
          type = "unknown";
          break;
      }
      setMimeType(type);
    };
    fileReader.readAsArrayBuffer(img);
  };

  function blobToFile(theBlob, fileName) {
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
  }

  const handleArtChange = async (e) => {
    let artMeta = {};
    getMimeType(e.target.files[0]);
    if (e.target.files && e.target.files[0]) {
      if (mimeType === "unknow") {
        e.target.value = "";
        setSnackBarError(true);
        setErrorMessage(
          "Disculpa, pero el formato de tu arte no está permitido por los momentos."
        );
        console.log("error, file format not allowed");
      } else if (e.target.files[0].size >= 5120000) {
        setSnackBarError(true);
        setErrorMessage(
          "Disculpa, el arte que subiste es muy grande. El máximo por los momentos es de 5 MB."
        );
      } else {
        var img = new Image();
        var objectUrl = URL.createObjectURL(e.target.files[0]);
        img.onload = function () {
          if (img.width <= 900 && img.height <= 900) {
            setSnackBarError(true);
            setErrorMessage(
              "Disculpa, tanto el ancho como el alto de tu arte es menor al establecido. Por favor sube un arte con mayor resolución."
            );
          } else if (img.width <= 900) {
            setSnackBarError(true);
            setErrorMessage(
              "Disculpa, el ancho de tu arte es menor al establecido. Por favor sube un arte con mayor resolución."
            );
          } else if (img.height <= 900) {
            setSnackBarError(true);
            setErrorMessage(
              "Disculpa, el alto de tu arte es menor al establecido. Por favor sube un arte con mayor resolución."
            );
          } else {
            artMeta.width = img.width;
            artMeta.height = img.height;
            setUploadedArtMeta(artMeta);
            setUploaded(objectUrl);
          }
        };
        img.src = objectUrl;
        setArtUrl(e.target.files[0]);
        artMeta.size = e.target.files[0].size;
      }
    }
  };

  const removeCrops = () => {
    croppedArt.map((n) => {
      delete n.thumb;
    });
  };

  async function newArtPost() {
    var formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("tags", tags);
    formData.append("uploadedArtMeta", uploadedArtMeta);
    formData.append("crops", JSON.stringify(croppedArt));
    formData.append("userId", JSON.parse(localStorage.getItem("token")).id);
    formData.append(
      "prixerUsername",
      JSON.parse(localStorage.getItem("token")).username
    );
    formData.append("status", "Active");
    formData.append("publicId", publicId);
    formData.append("artType", artType);
    formData.append("originalPhotoWidth", originalPhotoWidth);
    formData.append("originalPhotoHeight", originalPhotoHeight);
    formData.append("originalPhotoIso", originalPhotoIso);
    formData.append("originalPhotoPpi", originalPhotoPpi);
    formData.append("artLocation", location);
    formData.append("imageUrl", artUrl);
    formData.append("disabledReason", disabledReason);
    formData.append("visible", visible);
    const base_url = process.env.REACT_APP_BACKEND_URL + "/art/create";
    const data = await axios.post(base_url, formData, {
      "Content-Type": "multipart/form-data",
    });
    if (data.data.success) {
      props.setOpenArtFormDialog(false);
      setBackdrop(false);
      window.location.reload();
    } else {
      setErrorMessage(
        "Por favor vuelve a intentarlo, puede que exista algún inconveniente de conexión. Si aún no lo has hecho por favor inicia sesión."
      );
      setSnackBarError(true);
    }
  }

  return (
    <div>
      <Dialog
        xs={12}
        open={props.openArtFormDialog}
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
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    style={{
                      textAlign: "center",
                      hover: { background: "#000000" },
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
                </Grid>
                <Grid item xs={12}>
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
                      setTitle(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <FormControl
                    variant="outlined"
                    className={classes.form}
                    xs={12}
                    sm={12}
                    md={12}
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
                </Grid>
                {artType === "Foto" && (
                  <React.Fragment>
                    <Grid item container xs={12}>
                      <Grid item xs={4} sm={4}>
                        <Typography
                          style={{
                            whiteSpace: "pre-line",
                            padding: 15,
                            fontSize: "0.7em",
                          }}
                        >
                          {" "}
                          Medida del archivo <br /> original en px{" "}
                        </Typography>
                      </Grid>
                      <Grid item container xs={8} sm={8}>
                        <Grid item xs={5} sm={5}>
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
                              setOriginalPhotoWidth(e.target.value);
                              if (e.target.value < 2000) {
                                setErrorMessage(
                                  "La foto original debe tener un ancho mayor a 2.000 px."
                                );
                                setSnackBarError(true);
                              }
                            }}
                          />
                        </Grid>
                        <Typography style={{ padding: 10 }}> x </Typography>
                        <Grid item xs={5} sm={5}>
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
                              setOriginalPhotoHeight(e.target.value);
                              if (e.target.value < 2000) {
                                setErrorMessage(
                                  "La foto original debe tener un alto mayor a 2.000 px."
                                );
                                setSnackBarError(true);
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item container xs={12}>
                      <Grid item xs={6} sm={6}>
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
                            setOriginalPhotoPpi(e.target.value);
                            if (e.target.value < 100) {
                              setErrorMessage(
                                "La foto original debe ser mayor a 100 ppi."
                              );
                              setSnackBarError(true);
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={6}>
                        <FormControl
                          variant="outlined"
                          className={classes.form}
                          xs={12}
                          sm={12}
                          md={12}
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
                              setOriginalPhotoIso(e.target.value);
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
                      </Grid>
                    </Grid>
                    {originalPhotoIso &&
                      originalPhotoWidth &&
                      originalPhotoHeight && (
                        <Grid item container xs={12}>
                          <Grid
                            item
                            xs={6}
                            sm={6}
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
                          </Grid>
                          <Grid
                            item
                            xs={6}
                            sm={6}
                            style={{ textAlign: "center" }}
                          >
                            <Typography
                              style={{
                                whiteSpace: "pre-line",
                                padding: 15,
                                fontSize: "1.5em",
                              }}
                            >
                              {" "}
                              {maxPrintWidthCm} x {maxPrintHeightCm} cm{" "}
                            </Typography>
                          </Grid>
                        </Grid>
                      )}
                  </React.Fragment>
                )}
                <Grid item xs={12} sm={12}>
                  <FormControl
                    variant="outlined"
                    className={classes.form}
                    xs={12}
                    sm={12}
                    md={12}
                  >
                    <InputLabel required id="categoryLabel">
                      Categoría
                    </InputLabel>
                    <Select
                      labelId="categoryLabel"
                      id="category"
                      value={category}
                      onChange={handleCategoryChange}
                      label="category"
                    >
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
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Autocomplete
                    multiple
                    id="tags-filled"
                    options={preTags.map((option) => option)}
                    defaultValue={preTags}
                    freeSolo
                    renderTags={(value, getTagProps) =>
                      value.map(
                        (option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                          />
                        ),
                        { ...setTags(value) }
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Etiquetas"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
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
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
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
                </Grid>
              </Grid>
            </form>
          </div>
          <Box mt={5}>
            <Copyright />
          </Box>
          <Snackbar
            textalign={"center"}
            open={snackBarError}
            autoHideDuration={5000}
            message={errorMessage}
            className={classes.snackbar}
            action={snackBarAction}
            onClose={() => {
              setSnackBarError(false);
              setSnackBarAction(false);
            }}
          />
        </Container>
      </Dialog>
    </div>
  );
}
