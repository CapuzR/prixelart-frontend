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
import MDEditor from "@uiw/react-md-editor";
import Variants from "../adminMain/products/variants";
import Backdrop from "@material-ui/core/Backdrop";
import validations from "../../shoppingCart/validations";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import Paper from "@material-ui/core/Paper";

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
    props?.product?.considerations || undefined
  );
  const [productionTime, setProductionTime] = useState(
    props.product?.productionTime || undefined
  );
  const [fromPublicPrice, setFromPublicPrice] = useState(
    props?.product?.publicPrice?.from
  );
  const [toPublicPrice, setToPublicPrice] = useState(
    props?.product?.publicPrice?.to || undefined
  );
  const [fromPrixerPrice, setFromPrixerPrice] = useState(
    props?.product?.prixerPrice?.from
  );
  const [toPrixerPrice, setToPrixerPrice] = useState(
    props?.product?.prixerPrice?.to || undefined
  );
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [activeVCrud, setActiveVCrud] = useState("read");
  const [hasSpecialVar, setHasSpecialVar] = useState(
    props?.product?.hasSpecialVar || false
  );
  const [videoUrl, setVideoUrl] = useState(props?.product?.sources.video);
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
    readProduct();
    const indexImage =
      imagesList?.length < 1 ? imagesList?.indexOf(thumbUrl) : undefined;

    imagesList?.map((url) => {
      url?.type === "images"
        ? imageLoader.loader.push(url && url.url)
        : setVideoUrl(url && url.url);
    });

    if (indexImage === -1) {
      imagesList.push(thumbUrl);
      imageLoader.loader.push(thumbUrl);
    }
    setTimeout(() => {
      if (props.product?.sources.images) {
        props?.product?.sources.images.map((element) => {
          element.type === "video" && setVideoUrl(element.url);
        });
      }
    }, 1000);
    return () => {
      localStorage.removeItem("product");
    };
  }, []);

  const readProduct = () => {
    const base_url2 = process.env.REACT_APP_BACKEND_URL + "/product/read";
    axios.post(base_url2, { _id: props.product._id }).then((response) => {
      let product = response.data.products[0];
      props.setProduct(product);
      localStorage.setItem("product", JSON.stringify(product));
    });
  };

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
      setLoadImage({
        loader: imageLoader.loader,
        filename: file.name.replace(/[,]/gi, ""),
      });
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
    const width = sti.replace("560", "326").replace("315", "326");
    setVideoUrl(width);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      images.images.length &&
      imageLoader.loader.length &&
      imagesList?.length >= 5
    ) {
      setLoaDOpen(true);
    } else {
      if (images?.images.length === 0 && imagesList?.length === 0) {
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
          // !fromPrixerPrice &&
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
          newFormData.append("adminToken", localStorage.getItem("adminTokenV"));
          newFormData.append("active", active);
          newFormData.append("name", productName);
          newFormData.append("description", description);
          newFormData.append("category", category);
          newFormData.append("thumbUrl", thumbUrl);

          newFormData.append("variants", JSON.stringify(variants));
          newFormData.append("considerations", considerations);
          if (productionTime !== undefined && productionTime !== "") {
            newFormData.append("productionTime", productionTime);
          }
          newFormData.append(
            "publicPriceFrom",
            data.publicPrice.from.replace(/[,]/gi, ".")
          );
          if (toPublicPrice) {
            newFormData.append(
              "publicPriceTo",
              data.publicPrice.to.replace(/[,]/gi, ".")
            );
          }
          if (fromPrixerPrice) {
            newFormData.append(
              "prixerPriceFrom",
              data.prixerPrice.from.replace(/[,]/gi, ".")
            );
          }
          if (toPrixerPrice) {
            newFormData.append(
              "prixerPriceTo",
              data.prixerPrice.to.replace(/[,]/gi, ".")
            );
          }
          newFormData.append("hasSpecialVar", hasSpecialVar);
          if (imagesList[0] !== undefined && imagesList.length > 0) {
            const images = [];

            imagesList?.map((img) => {
              img !== null &&
                typeof img !== "string" &&
                images.push(img.url + " ");
            });
            newFormData.append("images", images);
          } else newFormData.append("images", []);
          if (images.images) {
            images.images.map((file) => {
              newFormData.append("newProductImages", file);
            });
          }
          if (videoUrl) {
            newFormData.append("video", videoUrl);
          }
          const base_url =
            process.env.REACT_APP_BACKEND_URL + `/product/update/${productId}`;
          const response = await axios.put(base_url, newFormData, {
            withCredentials: true,
          });
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
          <Grid container justifyContent="left">
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
          <Grid container justifyContent="left">
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
                  xs={11}
                  sm={11}
                  md={7}
                  lg={7}
                  xl={7}
                  style={{ display: "flex" }}
                >
                  {imageLoader.loader &&
                    imageLoader.loader.map((img, key_id) => {
                      return (
                        <div
                          style={{
                            width: "25%",
                            marginRight: "4px",
                            flexDirection: "row",
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
                                  imagesList?.splice(key_id, 1);
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
                                imagesList?.splice(key_id, 1);
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
                          <Paper elevation={3} style={{ padding: 10 }}>
                            <img
                              style={{
                                width: "100%",
                                objectFit: "contain",
                              }}
                              src={img}
                              alt="Imagen"
                            />
                          </Paper>
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
                <IconButton
                  variant="text"
                  className={classes.buttonImgLoader}
                  style={{
                    color: "#d33f49",
                    width: 40,
                    height: 40,
                  }}
                  onClick={(e) => {
                    setImagesList([]);
                    setLoadImage({ loader: [], filename: "Subir imagenes" });
                  }}
                >
                  <DeleteOutlineIcon style={{ width: 30, height: 30 }} />
                </IconButton>
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
                      />
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
                      label="Consideraciones"
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
                        toPublicPrice !== "" &&
                        toPublicPrice !== null &&
                        !validations.isAValidPrice(toPublicPrice)
                      }
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
                        fromPrixerPrice !== "" &&
                        fromPrixerPrice !== null &&
                        !validations.isAValidPrice(fromPrixerPrice)
                      }
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
                        toPrixerPrice !== "" &&
                        toPrixerPrice !== null &&
                        !validations.isAValidPrice(toPrixerPrice)
                      }
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
