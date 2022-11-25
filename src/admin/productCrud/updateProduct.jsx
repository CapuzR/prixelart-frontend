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
import Checkbox from "@material-ui/core/Checkbox";
import { useHistory } from "react-router-dom";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined";
import EditIcon from "@material-ui/icons/Edit";
import Box from "@material-ui/core/Box";
import MDEditor from "@uiw/react-md-editor";
import Variants from "../adminMain/products/variants";
import Backdrop from "@material-ui/core/Backdrop";

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
}));

export default function UpdateAdmin(props) {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));
  const [productId, setProductId] = useState(props?.product?._id);
  const [images, newImages] = useState({ images: [] });
  const [thumbUrl, setThumbUrl] = useState(props.product?.thumbUrl);
  const [imagesList, setImagesList] = useState(props?.product?.sources.images);
  const [active, setActive] = useState(props?.product?.active);
  const [productName, setProductName] = useState(props?.product?.name);
  const [variants, setVariants] = useState(props?.product?.variants);
  const [description, setDescription] = useState(props?.product?.description);
  const [category, setCategory] = useState(props?.product?.category);
  const [considerations, setConsiderations] = useState(
    props?.product?.considerations
  );
  const [fromPublicPrice, setFromPublicPrice] = useState(
    props?.product?.publicPrice?.from
  );
  const [toPublicPrice, setToPublicPrice] = useState(
    props?.product?.publicPrice?.to
  );
  const [fromPrixerPrice, setFromPrixerPrice] = useState(
    props?.product?.prixerPrice?.from
  );
  const [toPrixerPrice, setToPrixerPrice] = useState(
    props?.product?.prixerPrice?.to
  );
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [activeVCrud, setActiveVCrud] = useState("read");
  const [hasSpecialVar, setHasSpecialVar] = useState(
    props?.product?.hasSpecialVar || false
  );
  const [videoUrl, setVideoUrl] = useState("");
  const [imageLoader, setLoadImage] = useState({
    loader: [],
    filename: "Subir imagenes",
  });

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  const [open, setOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [loaDOpen, setLoaDOpen] = useState(false);
  const [mustImage, setMustImages] = useState(false);

  useEffect(() => {
    const indexImage =
      imagesList.length < 1 ? imagesList.indexOf(thumbUrl) : undefined;

    imagesList?.map((url) => {
      url?.type === "images"
        ? imageLoader.loader.push(url.url)
        : setVideoUrl(url.url);
    });

    if (indexImage === -1) {
      imagesList.push(thumbUrl);
      imageLoader.loader.push(thumbUrl);
    }

    return () => {
      localStorage.removeItem("product");
    };
  }, []);

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
    if (imageLoader.loader.length >= 4 || imagesList?.length >= 5) {
      setLoadOpen(true);
      setTimeout(() => {
        setLoadOpen(false);
      }, 3000);
    } else {
      const file = e.target.files[0];
      const resizedString = await convertToBase64(file);
      imageLoader.loader.push(resizedString);
      images.images.push(file);
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
    // const index = url[3].indexOf()
    // sti.replace(index, '?controls=0\"')
    //sti[79]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      images.images.length &&
      imageLoader.loader.length &&
      imagesList.length >= 5
    ) {
      setLoaDOpen(true);
    } else {
      if (images.images.length === 0 && imagesList.length === 0) {
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
          !fromPublicPrice &&
          !toPublicPrice &&
          !fromPrixerPrice &&
          !toPrixerPrice &&
          !images
        ) {
          setErrorMessage("Por favor completa todos los campos requeridos.");
          setSnackBarError(true);
          e.preventDefault();
        } else {
          setLoading(true);
          setButtonState(true);
          const newFormData = new FormData();
          const data = {
            publicPrice: {
              from: fromPublicPrice,
              to: toPublicPrice,
            },
            prixerPrice: {
              from: fromPrixerPrice,
              to: toPrixerPrice,
            },
            specialVars: [
              {
                name: "",
                isSpecialVarVisible: "",
              },
            ],
          };

          const currentVideo =
            typeof imagesList.find((result) => result.type === "video") === "object" ? 
            imagesList.find((result) => result.type === "video") : null;

          newFormData.append("active", active);
          newFormData.append("name", productName);
          newFormData.append("description", description);
          newFormData.append("category", category);
          newFormData.append("variants", JSON.stringify(variants));
          newFormData.append("considerations", considerations);
          newFormData.append("publicPriceFrom", data.publicPrice.from);
          newFormData.append("publicPriceTo", data.publicPrice.to);
          newFormData.append("prixerPriceFrom", data.prixerPrice.from);
          newFormData.append("prixerPriceTo", data.prixerPrice.to);
          newFormData.append("hasSpecialVar", hasSpecialVar);
          imagesList.length > 1
            ? imagesList.map((url) => {
              const indexVideo = imagesList.indexOf(currentVideo);
                if (videoUrl === "" && currentVideo !== null) {
                  imagesList.splice(indexVideo, 1);
                }
                newFormData.append("images", url.url);
              })
            : imagesList.map((url) => {
               const indexVideo = imagesList.indexOf(currentVideo);
                if (videoUrl === "" && currentVideo !== null) {
                  imagesList.splice(indexVideo, 1);
                }
                newFormData.append("images", url.url);
              });
              if(images.images){
                images.images.map((file) => {
                  newFormData.append("newProductImages", file);
                  console.log(file)
                })
              }
          newFormData.append("video", videoUrl);
          const base_url =
            process.env.REACT_APP_BACKEND_URL + `/product/update/${productId}`;
          const response = await axios.put(base_url, newFormData);
          if (response.data.success === false) {
            setLoading(false);
            setButtonState(false);
            setErrorMessage(response.data.message);
            setSnackBarError(true);
          } else {
            setErrorMessage("Actualización de producto exitosa.");
            setSnackBarError(true);
            history.push("/admin/product/read");
          }
        }
      }
    }
  };

  const handleVariantsClick = () => {
    history.push({ pathname: "/admin/product/" + productId + "/variant/read" });
    setShowVariants(true);
    props.setProductEdit(false);
  };

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress />
        </Backdrop>
      }
      {showVariants ? (
        <>
          <Grid container justify="left">
            <Grid item xs={2}>
              <button
                href="#"
                onClick={() => {
                  setShowVariants(false);
                  props.setProductEdit(true);
                }}
              >
                <h2 style={{ color: "rgba(191, 191, 191, 0.5)", marginTop: 0 }}>
                  Productos{" "}
                </h2>
              </button>
            </Grid>
            <Grid item xs={1}>
              <button
                href="#"
                onClick={() => {
                  setShowVariants(true);
                  setActiveVCrud("read");
                }}
              >
                <h2 style={{ color: "#d33f49", marginTop: 0 }}>Variantes</h2>
              </button>
            </Grid>
          </Grid>
          <Variants
            product={props.product}
            activeVCrud={activeVCrud}
            setActiveVCrud={setActiveVCrud}
          />
        </>
      ) : (
        <div>
          <Grid container justify="left">
            <Grid item xs={2} style={{ color: "rgba(191, 191, 191, 0.5)" }}>
              <Title>Productos </Title>
            </Grid>
            <Grid item xs={1}>
              <a onClick={handleVariantsClick}>
                <h2 style={{ color: "rgba(191, 191, 191, 0.5)", marginTop: 0 }}>
                  Variantes
                </h2>
              </a>
            </Grid>
          </Grid>
          <form
            className={classes.form}
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
                    <Button variant="contained" component="label">
                      Upload File
                      <input
                        name="newProductImages"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(a) => {
                          a.preventDefault();
                          loadImage(a);
                        }}
                      />
                    </Button>
                    - O -
                    <Button
                      variant="contained"
                      componenet="label"
                      onClick={handleClickOpen}
                    >
                      Upload video
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
                            // display: "flex",
                            flexDirection: "row",
                          }}
                        >
                          <div
                            style={{
                              // marginBottom: "-32px",
                              // display: "flex",
                              textAlign: "right",
                            }}
                          >
                            <IconButton
                              variant="text"
                              className={classes.buttonImgLoader}
                              style={{
                                color: "#d33f49",
                              }}
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
                                  imagesList.splice(key_id, 1);
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
                                imagesList.splice(key_id, 1);
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
                </Grid>
                <Grid item xs={12}>
                  <Grid container xs={isDesktop ? 12 : 12}>
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
                </Grid>
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
                    <MDEditor
                      value={description}
                      onChange={setDescription}
                      preview="edit"
                      hideToolbar={false}
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
                      rows={2}
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
                      value={fromPublicPrice ? fromPublicPrice : "$"}
                      onChange={(e) => {
                        setFromPublicPrice(e.target.value);
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
                      required
                      fullWidth
                      id="toPublicPrice"
                      label="Hasta"
                      name="toPublicPrice"
                      autoComplete="toPublicPrice"
                      value={toPublicPrice ? toPublicPrice : "$"}
                      onChange={(e) => {
                        setToPublicPrice(e.target.value);
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
                      value={fromPrixerPrice ? fromPrixerPrice : "$"}
                      onChange={(e) => {
                        setFromPrixerPrice(e.target.value);
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
                      required
                      fullWidth
                      id="toPrixerPrice"
                      label="Hasta"
                      name="toPrixerPrice"
                      autoComplete="toPrixerPrice"
                      value={toPrixerPrice ? toPrixerPrice : "$"}
                      onChange={(e) => {
                        setToPrixerPrice(e.target.value);
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
                Actualizar
              </Button>
            </Grid>
          </form>
        </div>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Youtube Url</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Copia y pega la url que quieres mostrar en el carrusel de imagenes
          </DialogContentText>
          <div id="ll"></div>
          <TextField
            onChange={(a) => {
              modifyString(a, a.target.value);
            }}
            value={videoUrl}
            autoFocus
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
        message={"No puedes actualizar un producto sin foto. Agrega 1 o mas"}
        className={classes.snackbar}
      />
    </React.Fragment>
  );
}
