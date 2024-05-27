import React from "react";
import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Title from "../adminMain/Title";
import axios from "axios";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";
import CircularProgress from "@material-ui/core/CircularProgress";
import EditIcon from "@material-ui/icons/Edit";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import clsx from "clsx";
import validations from "../../shoppingCart/validations";
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined";
import Checkbox from "@material-ui/core/Checkbox";
import Backdrop from "@material-ui/core/Backdrop";
import MDEditor from "@uiw/react-md-editor";
import { useHistory } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import InputAdornment from "@material-ui/core/InputAdornment";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  loaderImage: {
    width: "120%",
    border: "2px",
    height: "30vh",
    borderStyle: "groove",
    borderColor: "#d33f49",
    backgroundColor: "#ededed",
    display: "flex",
    flexDirection: "row",
  },
  imageLoad: {
    maxWidth: "100%",
    maxHeight: "100%",
    padding: "5px",
    marginTop: "5px",
  },
  formHead: {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  buttonImgLoader: {
    cursor: "pointer",
    padding: "5px",
  },
  buttonEdit: {
    cursor: "pointer",
    padding: "5px",
  },
}));

export default function CreateProduct() {
  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [active, setActive] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [considerations, setConsiderations] = useState("");
  const [productionTime, setProductionTime] = useState();
  const [images, newImages] = useState({ images: [] });
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [cost, setCost] = useState();
  const [fromPublicPrice, setFromPublicPrice] = useState();
  const [toPublicPrice, setToPublicPrice] = useState();
  const [fromPrixerPrice, setFromPrixerPrice] = useState();
  const [toPrixerPrice, setToPrixerPrice] = useState();
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const [hasSpecialVar, setHasSpecialVar] = useState(false);
  const [specialVars, setSpecialVars] = useState(false);
  const [imageLoader, setLoadImage] = useState({
    loader: [],
    filename: "Subir imagenes",
  });
  const history = useHistory();

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  const [open, setOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [loaDOpen, setLoaDOpen] = useState(false);
  const [mustImage, setMustImages] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  //Preview de imagen antes de enviar
  const convertToBase64 = (blob) => {
    return new Promise((resolve) => {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const loadImage = async (e) => {
    e.preventDefault();
    if (imageLoader.loader.length > 4) {
      setLoadOpen(true);
      setTimeout(() => {
        setLoadOpen(false);
      }, 3000);
    } else {
      const file = e.target.files[0];
      const resizedString = await convertToBase64(file);
      if (imageLoader.loader.length >= 4) {
        return null;
      } else {
        imageLoader.loader.push(resizedString);
        if (images.images.length >= 4) {
          return null;
        } else {
          images.images.push(file);
        }
      }
      setLoadImage({ loader: imageLoader.loader, filename: file.name });
    }
  };

  const replaceImage = async (e, index) => {
    e.preventDefault();
    const file = e.target.files[0];
    const resizedString = await convertToBase64(file);
    imageLoader.loader[index] = resizedString;
    images.images[index] = file;
    setLoadImage({ loader: imageLoader.loader, filename: file.name });
  };

  const modifyString = (a, sti) => {
    const url = sti.split(" ");
    const width = sti.replace("560", "326").replace("315", "326");
    const previewMp4 = sti.replace("1350", "510").replace("494", "350");
    setVideoUrl(width);
    setVideoPreview(previewMp4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.images.length > 4) {
      setLoaDOpen(true);
      setTimeout(() => {
        setLoaDOpen(false);
      }, 3000);
    } else {
      if (images.images.length <= 0 && videoUrl == "") {
        setMustImages(true);
        setTimeout(() => {
          setMustImages(false);
        }, 3000);
      } else {
        if (
          !active &&
          !productName &&
          !description &&
          !category &&
          !considerations &&
          !cost &&
          !fromPublicPrice &&
          !fromPrixerPrice &&
          !images
        ) {
          setErrorMessage("Por favor completa todos los campos requeridos.");
          setSnackBarError(true);
          e.preventDefault();
        } else {
          setLoading(true);
          setButtonState(true);
          const formData = new FormData();
          const data = {
            publicPrice: {
              from: fromPublicPrice.replace(/[,]/gi, "."),
              to: toPublicPrice?.replace(/[,]/gi, "."),
            },
            prixerPrice: {
              from: fromPrixerPrice.replace(/[,]/gi, "."),
              to: toPrixerPrice?.replace(/[,]/gi, "."),
            },
            specialVars: [
              {
                name: "",
                isSpecialVarVisible: "",
              },
            ],
          };
          formData.append("adminToken", localStorage.getItem("adminTokenV"));
          formData.append("active", active);
          formData.append("name", productName);
          formData.append("description", description);
          formData.append("category", category);
          formData.append("considerations", considerations);
          formData.append("productionTime", productionTime);
          formData.append("cost", cost.replace(/[,]/gi, "."));

          formData.append("publicPriceFrom", data.publicPrice.from);
          if (toPublicPrice) {
            formData.append("publicPriceTo", data.publicPrice.to);
          }
          if (fromPrixerPrice) {
            formData.append("prixerPriceFrom", data.prixerPrice.from);
          }
          if (toPrixerPrice) {
            formData.append("prixerPriceTo", data.prixerPrice.to);
          }
          formData.append("hasSpecialVar", hasSpecialVar);
          formData.append("video", videoUrl);
          images.images.map((file) => formData.append("productImages", file));
          const base_url =
            process.env.REACT_APP_BACKEND_URL + "/product/create";
          const response = await axios.post(base_url, formData);
          if (response.data.success === false) {
            setLoading(false);
            setButtonState(false);
            setErrorMessage(response.data.message);
            setSnackBarError(true);
          } else {
            setErrorMessage("Registro de producto exitoso.");
            setSnackBarError(true);
            setActive("");
            setProductName("");
            setDescription("");
            setCategory("");
            setConsiderations("");
            setFromPublicPrice("");
            setToPublicPrice("");
            setFromPrixerPrice("");
            setToPrixerPrice("");
            history.push("/admin/product/read");
          }
        }
      }
    }
  };

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress />
        </Backdrop>
      }
      <Title>Productos</Title>
      <form
        // className={classes.form}
        encType="multipart/form-data"
        noValidate
        onSubmit={handleSubmit}
      >
        <Grid container spacing={2}>
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={12}
              md={4}
              lg={4}
              xl={4}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FormControl variant="outlined">
                <Button
                  variant="contained"
                  component="label"
                  style={{ textTransform: "none" }}
                >
                  Subir imagen
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
                <Button
                  variant="contained"
                  componenet="label"
                  onClick={handleClickOpen}
                  style={{ textTransform: "none", marginTop: 10 }}
                >
                  Subir video
                </Button>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={8}
              lg={8}
              xl={8}
              style={{ display: "flex" }}
            >
              {imageLoader.loader &&
                imageLoader.loader.map((img, key_id) => {
                  return (
                    <div
                      style={{
                        width: "25%",
                        // maxHeight: "200px",
                        marginRight: "4px",
                      }}
                    >
                      <div
                        style={{
                          // marginBottom: "-32px",
                          textAlign: "right",
                        }}
                      >
                        <IconButton
                          variant="text"
                          className={classes.buttonImgLoader}
                          style={{ color: "#d33f49" }}
                          component="label"
                        >
                          <input
                            name="productImages"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(a) => {
                              const i = imageLoader.loader.indexOf(img);
                              replaceImage(a, i);
                            }}
                          />
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          variant="text"
                          className={classes.buttonImgLoader}
                          style={{ color: "#d33f49" }}
                          onClick={(d) => {
                            imageLoader.loader.splice(key_id, 1);
                            images.images.splice(key_id, 1);
                            setLoadImage({
                              loader: imageLoader.loader,
                              filename: "Subir Imagenes",
                            });
                            newImages({ images: images.images });
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
                        }}
                        src={img}
                        alt="+"
                      />
                    </div>
                  );
                })}
              {videoUrl && (
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
                        variant="text"
                        className={classes.buttonImgLoader}
                        style={{
                          color: "#d33f49",
                        }}
                        component="label"
                        onClick={handleClickOpen}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        variant="text"
                        className={classes.buttonImgLoader}
                        style={{ color: "#d33f49" }}
                        onClick={(d) => {
                          setVideoUrl(undefined);
                        }}
                      >
                        <HighlightOffOutlinedIcon />
                      </IconButton>
                    </div>

                    <Paper elevation={3} style={{ padding: 10 }}>
                      <span
                        key={1}
                        style={{ width: "100%" }}
                        dangerouslySetInnerHTML={{
                          __html: videoUrl,
                        }}
                        alt={"video"}
                      />
                    </Paper>
                  </div>
                </>
              )}
            </Grid>
            <Grid container>
              <Grid item xs={12} md={6}>
                <Checkbox
                  checked={active}
                  color="primary"
                  inputProps={{ "aria-label": "secondary checkbox" }}
                  onChange={() => {
                    active ? setActive(false) : setActive(true);
                  }}
                />{" "}
                Habilitado / Visible
              </Grid>
              <Grid item xs={12} md={6}>
                <Checkbox
                  checked={hasSpecialVar}
                  color="primary"
                  inputProps={{ "aria-label": "secondary checkbox" }}
                  onChange={() => {
                    hasSpecialVar
                      ? setHasSpecialVar(false)
                      : setHasSpecialVar(true);
                  }}
                />{" "}
                ¿Tiene variables especiales?
              </Grid>
            </Grid>
            {hasSpecialVar && (
              <Grid container xs={12} spacing={2}>
                <Grid container style={{ marginTop: 20 }}>
                  <h3>Variables especiales</h3>
                </Grid>
                <>
                  {specialVars &&
                    specialVars.map((specialVar, i) => (
                      <Grid
                        container
                        spacing={2}
                        xs={12}
                        style={{ marginBottom: 10 }}
                      >
                        <Grid item xs={12} md={5}>
                          <FormControl
                            className={clsx(classes.margin, classes.textField)}
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
                                );
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <FormControl
                            className={clsx(classes.margin, classes.textField)}
                            variant="outlined"
                            xs={12}
                            fullWidth={true}
                          >
                            <Checkbox
                              variant="outlined"
                              required
                              fullWidth
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
                                );
                              }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid item xs={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              setSpecialVars(
                                specialVars
                                  .slice(0, i)
                                  .concat(specialVars.slice(i + 1))
                              );
                            }}
                            disabled={buttonState}
                            style={{ marginTop: 20 }}
                          >
                            -
                          </Button>
                        </Grid>
                      </Grid>
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
                      );
                    }}
                    disabled={buttonState}
                    style={{ marginTop: 20 }}
                  >
                    +
                  </Button>
                </>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" xs={12} fullWidth={true}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  display="inline"
                  id="productName"
                  label="Nombre"
                  name="productName"
                  autoComplete="productName"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  required
                  display="inline"
                  fullWidth
                  id="category"
                  label="Categoría"
                  name="category"
                  autoComplete="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                data-color-mode="light"
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <InputLabel style={{ marginTop: "-5%" }}>
                  Descripción
                </InputLabel>
                {/* <MDEditor
                  value={description}
                  onChange={setDescription}
                  preview="edit"
                  hideToolbar={false}
                /> */}
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
                  value={description}
                  onChange={setDescription}
                  placeholder="Escribe la descripción aquí..."
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
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
                  value={considerations}
                  onChange={(e) => {
                    setConsiderations(e.target.value);
                  }}
                />
              </FormControl>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
                style={{ marginTop: 20 }}
              >
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Tiempo de producción"
                  value={productionTime}
                  onChange={(e) => {
                    setProductionTime(e.target.value);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">días</InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid container style={{ marginTop: 20 }}>
            <Title>Costo de producción</Title>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={4} md={5}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  value={cost}
                  onChange={(e) => {
                    setCost(e.target.value);
                  }}
                  error={cost !== undefined && !validations.isAValidPrice(cost)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid container style={{ marginTop: 20 }}>
            <Title>PVP</Title>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={4} md={5}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="fromPublicPrice"
                  label="Desde"
                  name="fromPublicPrice"
                  autoComplete="fromPublicPrice"
                  value={fromPublicPrice}
                  onChange={(e) => {
                    setFromPublicPrice(e.target.value);
                  }}
                  error={
                    fromPublicPrice !== undefined &&
                    !validations.isAValidPrice(fromPublicPrice)
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4} md={5}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  // required
                  fullWidth
                  id="toPublicPrice"
                  label="Hasta"
                  name="toPublicPrice"
                  autoComplete="toPublicPrice"
                  value={toPublicPrice}
                  onChange={(e) => {
                    setToPublicPrice(e.target.value);
                  }}
                  error={
                    toPublicPrice !== undefined &&
                    !validations.isAValidPrice(toPublicPrice)
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid container style={{ marginTop: 20 }}>
            <Title>PVM</Title>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={4} md={5}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="fromPrixerPrice"
                  label="Desde"
                  name="fromPrixerPrice"
                  autoComplete="fromPrixerPrice"
                  value={fromPrixerPrice}
                  onChange={(e) => {
                    setFromPrixerPrice(e.target.value);
                  }}
                  error={
                    fromPrixerPrice !== undefined &&
                    !validations.isAValidPrice(fromPrixerPrice)
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={4} md={5}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  // required
                  fullWidth
                  id="toPrixerPrice"
                  label="Hasta"
                  name="toPrixerPrice"
                  autoComplete="toPrixerPrice"
                  value={toPrixerPrice}
                  onChange={(e) => {
                    setToPrixerPrice(e.target.value);
                  }}
                  error={
                    toPrixerPrice !== undefined &&
                    !validations.isAValidPrice(toPrixerPrice)
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={buttonState}
            style={{ marginTop: 20 }}
          >
            Crear
          </Button>
        </Grid>
      </form>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Youtube Url</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Copia y pega la url que quieres mostrar en el carrusel de imagenes
          </DialogContentText>
          <div id="ll"></div>
          <TextField
            onChange={(a) => {
              const div = document.getElementById("ll");
              modifyString(a, a.target.value);
              div.innerHTML = videoPreview;
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
      <Snackbar
        open={snackBarError}
        autoHideDuration={1000}
        message={errorMessage}
        className={classes.snackbar}
      />
      <Snackbar
        open={loadOpen}
        autoHideDuration={1000}
        message={"No puedes colocar mas de 4 fotos"}
        className={classes.snackbar}
      />
      <Snackbar
        open={loaDOpen}
        autoHideDuration={1000}
        message={"No puedes enviar mas de 4 fotos"}
        className={classes.snackbar}
      />
      <Snackbar
        open={mustImage}
        autoHideDuration={1000}
        message={"No puedes crear un producto sin foto, agrega 1 o más"}
        className={classes.snackbar}
      />
    </React.Fragment>
  );
}
