import React from "react";
import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Title from "../adminMain/Title";
import axios from "axios";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
import clsx from "clsx";
import { useHistory } from "react-router-dom";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined";
import EditIcon from "@material-ui/icons/Edit";
import MDEditor from "@uiw/react-md-editor";
import Variants from "../adminMain/products/variants";
import Backdrop from "@material-ui/core/Backdrop";
import validations from "../../shoppingCart/validations";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import Paper from "@material-ui/core/Paper";
import { Typography } from "@material-ui/core";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Slider from "@material-ui/core/Slider";
import Checkbox from "@material-ui/core/Checkbox";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  form: {
    height: 550,
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
    width: "100%",
    height: "95%",
    padding: "15px",
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
  paper: {
    padding: theme.spacing(2),
    margin: "auto",
    width: "100%",
  },
}));

export default function UpdateMockup(props) {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState(0);
  const [preview, setPreview] = useState(0);
  const [randomArt, setArt] = useState(0);
  const [corner, setCorner] = useState(0);
  const [topLeft, setTopLeft] = useState({ x: 0, y: 0 });
  const [topRight, setTopRight] = useState({ x: 0, y: 0 });
  const [bottomLeft, setBottomLeft] = useState({ x: 0, y: 0 });
  const [bottomRight, setBottomRight] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [perspective, setPerspective] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [skewX, setSkewX] = useState(0);
  const [skewY, setSkewY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  console.log(translateX);
  const handleWidth = (event, newValue) => {
    setWidth(newValue);
  };
  const handleHeight = (event, newValue) => {
    setHeight(newValue);
  };

  const handlePerspective = (event, newValue) => {
    setPerspective(newValue);
  };

  const handleRotateX = (event, newValue) => {
    setRotateX(newValue);
  };

  const handleRotateY = (event, newValue) => {
    setRotateY(newValue);
  };

  const handleTranslateX = (event, newValue) => {
    setTranslateX(newValue);
  };

  const handleSkewX = (event, newValue) => {
    setSkewX(newValue);
  };

  const handleSkewY = (event, newValue) => {
    setSkewY(newValue);
  };

  // const handleSkew = async (type, value) => {
  //   const prev = skew;
  //   if (type === "X") {
  //     skew.x = value;
  //   } else {
  //     skew.y = value;
  //   }
  //   setSkew({ ...skew, prev });
  // };

  const handleCorner = (event) => {
    setCorner(event.target.value);
  };

  const getRandomArt = async () => {
    const url = process.env.REACT_APP_BACKEND_URL + "/art/random";
    const response = axios.get(url);
    setArt((await response).data.arts);
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
    const file = e.target.files[0];
    const resizedString = await convertToBase64(file);
    setImages(file);
    setPreview(resizedString);
  };

  const checkImages = async () => {
    if (props.product.mockupImg) {
      setPreview(props.product.mockup);
    }
  };

  useEffect(() => {
    checkImages();
    getRandomArt();
  }, []);

  const handleImageClick = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    handleCornerChange(offsetX, offsetY);
  };

  const handleCornerChange = (newX, newY) => {
    switch (corner) {
      case "topLeft":
        setTopLeft({ x: newX, y: newY });
        break;
      case "topRight":
        setTopRight({ x: newX, y: newY });
        break;
      case "bottomLeft":
        setBottomLeft({ x: newX, y: newY });
        break;
      case "bottomRight":
        setBottomRight({ x: newX, y: newY });
        break;
      default:
        break;
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   setLoading(true);
  //   const newFormData = new FormData();

  //   newFormData.append("adminToken", localStorage.getItem("adminTokenV"));
  //   newFormData.append("active", active);
  //   newFormData.append("name", productName);
  //   newFormData.append("description", description);
  //   newFormData.append("category", category);
  //   newFormData.append("thumbUrl", thumbUrl);

  //   newFormData.append("variants", JSON.stringify(variants));
  //   newFormData.append("considerations", considerations);
  //   if (productionTime !== undefined && productionTime !== "") {
  //     newFormData.append("productionTime", productionTime);
  //   }
  //   newFormData.append(
  //     "publicPriceFrom",
  //     data.publicPrice.from.replace(/[,]/gi, ".")
  //   );
  //   if (toPublicPrice) {
  //     newFormData.append(
  //       "publicPriceTo",
  //       data.publicPrice.to.replace(/[,]/gi, ".")
  //     );
  //   }
  //   if (fromPrixerPrice) {
  //     newFormData.append(
  //       "prixerPriceFrom",
  //       data.prixerPrice.from.replace(/[,]/gi, ".")
  //     );
  //   }
  //   if (toPrixerPrice) {
  //     newFormData.append(
  //       "prixerPriceTo",
  //       data.prixerPrice.to.replace(/[,]/gi, ".")
  //     );
  //   }
  //   newFormData.append("hasSpecialVar", hasSpecialVar);
  //   if (imagesList[0] !== undefined && imagesList.length > 0) {
  //     const images = [];

  //     imagesList?.map((img) => {
  //       img !== null && typeof img !== "string" && images.push(img.url + " ");
  //     });
  //     newFormData.append("images", images);
  //   } else newFormData.append("images", []);
  //   if (images.images) {
  //     images.images.map((file) => {
  //       newFormData.append("newProductImages", file);
  //     });
  //   }
  //   if (videoUrl) {
  //     newFormData.append("video", videoUrl);
  //   }
  //   const base_url =
  //     process.env.REACT_APP_BACKEND_URL + `/product/update/${productId}`;
  //   const response = await axios.put(base_url, newFormData, {
  //     withCredentials: true,
  //   });
  //   if (response.data.success === false) {
  //     setLoading(false);
  //     setErrorMessage(response.data.message);
  //     setSnackBarError(true);
  //   } else {
  //     setErrorMessage("Actualización de producto exitosa.");
  //     setSnackBarError(true);
  //   }
  // };

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress />
        </Backdrop>
      }

      <form
        encType="multipart/form-data"
        noValidate
        // onSubmit={handleSubmit}
      >
        <Grid
          container
          spacing={2}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {preview ? (
            <Paper
              className={classes.paper}
              style={{
                height: 480,
                width: "100%",
                backgroundColor: "gainsboro",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
              elevation={3}
            >
              <Grid item md={6}>
                <FormControl
                  // component="fieldset"
                  style={{ width: "90%" }}
                  // className={classes.formControl}
                >
                  <FormLabel component="legend">
                    Selecciona el punto a definir:
                  </FormLabel>
                  <RadioGroup value={corner} onChange={handleCorner}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <FormControlLabel
                        value="topLeft"
                        control={<Radio />}
                        label="Superior izquierda"
                      />
                      <Typography variant="subtitle2" color="secondary">
                        x: {topLeft.x}, y: {topLeft.y}
                      </Typography>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <FormControlLabel
                        value="topRight"
                        control={<Radio />}
                        label="Superior derecha"
                      />
                      <Typography variant="subtitle2" color="secondary">
                        x: {topRight.x}, y: {topRight.y}
                      </Typography>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                      <FormControlLabel
                        value="bottomLeft"
                        control={<Radio />}
                        label="Inferior izquierda"
                      />
                      <Typography variant="subtitle2" color="secondary">
                        x: {bottomLeft.x}, y: {bottomLeft.y}
                      </Typography>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                      <FormControlLabel
                        value="bottomRight"
                        control={<Radio />}
                        label="Inferior derecha"
                      />
                      <Typography variant="subtitle2" color="secondary">
                        x: {bottomRight.x}, y: {bottomRight.y}
                      </Typography>
                    </div>
                  </RadioGroup>
                  <Grid
                    container
                    spacing={2}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography>Ancho</Typography>
                    <Grid item md>
                      <Slider
                        value={width}
                        onChange={handleWidth}
                        max={1000}
                        min={0}
                        defaultValue={250}
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    spacing={2}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography>Alto</Typography>
                    <Grid item md>
                      <Slider
                        value={height}
                        onChange={handleHeight}
                        max={1000}
                        min={0}
                        defaultValue={250}
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    spacing={2}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography>Perspectiva</Typography>
                    <Grid item md>
                      <Slider
                        value={perspective}
                        onChange={handlePerspective}
                        max={500}
                        min={-500}
                        defaultValue={0}
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    spacing={2}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography>Rotación horizontal</Typography>
                    <Grid item md>
                      <Slider
                        value={rotateX}
                        onChange={handleRotateX}
                        max={360}
                        min={-360}
                        defaultValue={0}
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    spacing={2}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography>Rotación vertical</Typography>
                    <Grid item md>
                      <Slider
                        value={rotateY}
                        onChange={handleRotateY}
                        max={360}
                        min={-360}
                        defaultValue={0}
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    spacing={2}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography>Desplazamiento horizontal</Typography>
                    <Grid item md>
                      <Slider
                        value={translateX}
                        onChange={handleTranslateX}
                        max={300}
                        min={-300}
                        defaultValue={0}
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    spacing={2}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography>Oblicuidad X</Typography>
                    <Grid item md>
                      <Slider
                        value={skewX}
                        onChange={handleSkewX}
                        max={300}
                        min={-300}
                        defaultValue={0}
                      />
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    spacing={2}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography>Oblicuidad Y</Typography>

                    <Grid item md>
                      <Slider
                        value={skewY}
                        onChange={handleSkewY}
                        max={300}
                        min={-300}
                        defaultValue={0}
                      />
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>
              <Grid item md={6}>
                <div style={{ width: 350, height: 350 }}>
                  <div
                    style={{
                      backgroundImage: "url(" + preview + ")",
                      width: 350,
                      height: 350,
                      backgroundSize: "cover",
                      borderRadius: 5,
                      marginTop: 5,
                      marginRight: 10,
                    }}
                    onClick={handleImageClick}
                  />
                  {topLeft.x !== 0 &&
                    topLeft.y !== 0 &&
                    topRight.x !== 0 &&
                    topRight.y !== 0 &&
                    bottomLeft.x !== 0 &&
                    bottomLeft.y !== 0 &&
                    bottomRight.x !== 0 &&
                    bottomRight.y !== 0 && (
                      <div
                        style={{
                          width: 350,
                          height: 350,
                          borderRadius: 5,
                          marginTop: -345,
                          marginRight: 10,
                        }}
                      >
                        <img
                          src={randomArt.largeThumbUrl}
                          alt="Imagen Superpuesta"
                          style={{
                            position: "relative",
                            top: `${topLeft.y}px`,
                            left: `${topLeft.x}px`,
                            width: `${width}px`,
                            height: `${height}px`,
                            transformOrigin: "top left",
                            objectFit: "cover",
                            transform: `perspective(${perspective}px) rotateX(${rotateX}deg) skew(${skewX}deg, ${skewY}deg) translateX(${translateX}px) rotateY(${rotateY}deg)`,
                          }}
                        />
                      </div>
                    )}
                </div>
              </Grid>
            </Paper>
          ) : (
            <Typography variant="h5" color="secondary" style={{ padding: 20 }}>
              No hay imagen seleccionada
            </Typography>
          )}

          <Button
            variant="contained"
            component="label"
            color="primary"
            style={{ marginTop: 10 }}
          >
            {preview ? "Cambiar imagen" : "Subir imagen"}
            <input
              name="newMockupImage"
              type="file"
              accept="image/*"
              hidden
              onChange={(a) => {
                a.preventDefault();
                loadImage(a);
              }}
            />
          </Button>

          {preview !== undefined && (
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={{ marginTop: 20 }}
            >
              Actualizar
            </Button>
          )}
        </Grid>
      </form>

      <Snackbar
        open={snackBarError}
        autoHideDuration={1000}
        message={errorMessage}
        className={classes.snackbar}
      />
    </React.Fragment>
  );
}
