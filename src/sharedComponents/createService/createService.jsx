import React, { useEffect } from "react";
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
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

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
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import InputAdornment from "@material-ui/core/InputAdornment";
import InfoIcon from "@material-ui/icons/Info";
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined";
import EditIcon from "@material-ui/icons/Edit";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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

const serviceAreas = ["Diseño", "Fotografía", "Artes Plásticas", "Otro"];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CreateService(props) {
  const classes = useStyles();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [serviceArea, setServiceArea] = useState();
  const [location, setLocation] = useState();
  const [requiredPhoto, setRequiredPhoto] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [backdrop, setBackdrop] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [isRemote, setIsRemote] = useState(false);
  const [priceFrom, setPriceFrom] = useState(0);
  const [priceTo, setPriceTo] = useState();
  const [productionTime, setProductionTime] = useState();
  const [disabledReason, setDisabledReason] = useState("");
  const [active, setActive] = useState(true);
  const [imageLoader, setLoadImage] = useState([]);
  const [images, setImages] = useState([]);
  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarAction, setSnackBarAction] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  const prixerUsername = new URLSearchParams(window.location)
    .get("pathname")
    .replace(/[/]/gi, "");

  const handleEditorChange = (value) => {
    setDescription(value);
  };

  const handleServiceAreaChange = (e) => {
    if (!e.target.value) {
      setRequiredPhoto(false);
      setErrorMessage("Por favor indica a qué categoría pertenece el arte.");
      setSnackBarError(true);
    } else {
      if (e.target.value === "Foto") {
        setRequiredPhoto(true);
      }
      setServiceArea(e.target.value);
    }
  };

  const handleClose = () => {
    props.setOpenServiceFormDialog(false);
  };

  const handleSubmit = async () => {
    try {
      if (title && description && serviceArea && priceFrom > 0) {
        await newService();
      } else {
        setErrorMessage("Por favor completa los campos requeridos.");
        setSnackBarError(true);
      }
    } catch (err) {
      console.log(err);
      setBackdrop(false);
      props.setOpenServiceFormDialog(false);
      setErrorMessage(
        "Ocurrió un error inesperado, por favor valida e inicia sesión."
      );
      setSnackBarError(true);
    }
  };

  const handleIsLocal = () => {
    setIsLocal(!isLocal);
  };

  const handleIsRemote = () => {
    setIsRemote(!isRemote);
  };

  async function newService() {
    var formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("serviceArea", serviceArea);
    formData.append("isLocal", isLocal);
    formData.append("isRemote", isRemote);
    if (location !== ("" || undefined)) {
      formData.append("location", location);
    }
    if (productionTime !== ("" || undefined)) {
      formData.append("productionTime", productionTime);
    }
    formData.append("priceFrom", priceFrom);
    if (priceTo !== ("" || undefined)) {
      formData.append("priceTo", priceTo);
    }
    formData.append("userId", JSON.parse(localStorage.getItem("token")).id);
    formData.append(
      "prixerUsername",
      JSON.parse(localStorage.getItem("token")).username
    );
    formData.append(
      "prixer",
      JSON.parse(localStorage.getItem("token")).prixerId
    );
    formData.append("active", active);

    images.map((file) => formData.append("serviceImages", file));

    const base_url = process.env.REACT_APP_BACKEND_URL + "/service/create";
    const create = await axios.post(base_url, formData, {
      "Content-Type": "multipart/form-data",
    });
    if (create.data.success) {
      setBackdrop(false);
      props.setOpenServiceFormDialog(false);
      props.setCreatedService(true);
      setSnackBarError(true);
      setErrorMessage("Servicio creado exitosamente.");
    } else {
      setSnackBarError(true);
      setErrorMessage(
        "Por favor vuelve a intentarlo, puede que exista algún inconveniente de conexión. Si aún no lo has hecho por favor inicia sesión."
      );
    }
  }

  const replaceImage = async (e, index) => {
    const file = e.target.files[0];
    const resizedString = await convertToBase64(file);
    const prevImg = [...imageLoader];
    prevImg[index] = resizedString;
    setLoadImage(prevImg);

    const newImgs = [...images];
    newImgs.splice(index, 1, file);
    setImages(newImgs);
  };

  const convertToBase64 = (blob) => {
    return new Promise((resolve) => {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const deleteImage = (X, i) => {
    if (imageLoader.length === 1) {
      setLoadImage([]);
      setImages([]);
    } else if (imageLoader.length > 1) {
      const newImg = imageLoader.filter((img) => img !== X);
      setLoadImage(newImg);
      const newImgs = [...images];
      newImgs.splice(i, 1);
      setImages(newImgs);
    }
  };

  const loadImage = async (e) => {
    e.preventDefault();

    const file = e.target.files[0];
    const resizedString = await convertToBase64(file);
    if (imageLoader.length === 0) {
      setLoadImage([resizedString]);
      setImages([file]);
    } else if (imageLoader.length === 6) {
      setSnackBarError(true);
      setErrorMessage("Has alcanzado el límite de imágenes permitidas.");
    } else {
      setLoadImage([...imageLoader, resizedString]);
      setImages([...images, file]);
    }
  };

  return (
    <div>
      <Dialog
        xs={12}
        lg={12}
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
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    autoFocus
                    required
                    fullWidth
                    label="Título"
                    value={title}
                    placeholder='Ejemplo: "Fotografía de eventos" o "Diseño de logotipos"'
                    onChange={(e) => {
                      setTitle(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    style={{
                      textAlign: "center",
                      hover: { background: "#000000" },
                    }}
                  >
                    <Grid item xs={12} sm={12} style={{ display: "flex" }}>
                      {imageLoader &&
                        imageLoader.map((img, i) => {
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
                                  variant="text"
                                  className={classes.buttonImgLoader}
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
                                      replaceImage(a, i);
                                    }}
                                  />
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  variant="text"
                                  className={classes.buttonImgLoader}
                                  style={{
                                    color: "#d33f49",
                                    marginRight: -5,
                                  }}
                                  onClick={() => {
                                    deleteImage(img, i);
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
                          );
                        })}
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={12}
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
                              a.preventDefault();
                              loadImage(a);
                            }}
                          />
                        </Button>
                      </FormControl>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={12}>
                  <FormControl
                    variant="outlined"
                    className={classes.form}
                    xs={12}
                    sm={12}
                    md={12}
                  >
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
                </Grid>

                <Grid item xs={12} sm={12}>
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
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={12}
                  style={{ marginTop: isMobile && 30 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isLocal}
                        onChange={() => {
                          handleIsLocal();
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
                          handleIsRemote();
                        }}
                      />
                    }
                    label="¿Trabajas a domicilio?"
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
                    placeholder="Si trabajas en algún sitio en específico indica aquí la dirección."
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    label="Tiempo de trabajo aproximado"
                    value={productionTime}
                    onChange={(e) => setProductionTime(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fullWidth>
                    Valor
                  </Typography>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <Grid item xs={5}>
                      <TextField
                        // style={{ marginRight: 45 }}
                        required
                        variant="outlined"
                        label="Desde"
                        type="Number"
                        value={priceFrom}
                        onChange={(e) => setPriceFrom(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        variant="outlined"
                        label="Hasta"
                        type="Number"
                        value={priceTo}
                        onChange={(e) => setPriceTo(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </div>
                </Grid>
                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <InfoIcon color={"secondary"} />
                  <Typography color={"secondary"}>
                    Tu servicio podrá ser encontrado por estos datos.
                  </Typography>
                </Grid>
              </Grid>
            </form>
          </div>
          <Box mt={5} mb={4}>
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
