import React from "react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Title from "../../adminMain/Title";
import axios from "axios";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined";
import FormControl from "@material-ui/core/FormControl";
import clsx from "clsx";
import Checkbox from "@material-ui/core/Checkbox";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { nanoid } from "nanoid";
import validations from "../../../shoppingCart/validations";
import Paper from "@material-ui/core/Paper";
const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function CreateVariant(props) {
  const classes = useStyles();
  const [active, setActive] = useState(
    (props.variant && props.variant.active) || false
  );
  const [attributes, setAttributes] = useState(
    (props.variant && props.variant.attributes) || []
  );
  // const [buttonAttState, setButtonAttState] = useState();
  const [variantName, setVariantName] = useState(
    (props.variant && props.variant.name) || ""
  );
  const [description, setDescription] = useState(
    (props.variant && props.variant.description) || ""
  );
  const [category, setCategory] = useState(
    (props.variant && props.variant.category) || ""
  );
  const [considerations, setConsiderations] = useState(
    (props.variant && props.variant.considerations) || ""
  );
  const [publicPriceEq, setPublicPriceEq] = useState(
    (props.variant && props.variant.publicPrice.equation) || ""
  );
  const [fromPublicPrice, setFromPublicPrice] = useState(
    (props.variant && props.variant.publicPrice?.from) || ""
  );
  const [toPublicPrice, setToPublicPrice] = useState(
    (props.variant && props.variant.publicPrice?.to) || ""
  );
  const [prixerPriceEq, setPrixerPriceEq] = useState(
    (props.variant && props.variant.prixerPrice?.equation) || ""
  );
  const [fromPrixerPrice, setFromPrixerPrice] = useState(
    (props.variant && props.variant.prixerPrice?.from) || ""
  );
  const [toPrixerPrice, setToPrixerPrice] = useState(
    (props.variant && props.variant.prixerPrice?.to) || ""
  );
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const history = useHistory();
  const [image, setImage] = useState(props?.variant?.variantImage || []);
  const [videoUrl, setVideoUrl] = useState(
    (props.variant && props.variant?.video) || undefined
  );
  const [videoPreview, setVideoPreview] = useState(undefined);
  const [loadeImage, setLoadImage] = useState({
    loader: [],
  }); //props.variant && props.variant.variantImage ||
  const [errorMessage, setErrorMessage] = useState();
  const [open, setOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [snackBarError, setSnackBarError] = useState(false);
  const [mustImage, setMustImages] = useState(false);

  if (loadeImage.loader[0] === undefined && image[0] !== null) {
    image.map((url) => {
      url.type === "images"
        ? loadeImage.loader.push(url.url)
        : setVideoUrl(url.url);
    });
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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

  const replaceImage = async (e, index) => {
    e.preventDefault();
    const file = e.target.files[0];
    const resizedString = await convertToBase64(file);
    loadeImage.loader[index] = resizedString;
    image[index] = file;
    setImage(image);
    setLoadImage({ loader: loadeImage.loader });
  };

  const loadImage = async (e) => {
    e.preventDefault();
    if (loadeImage.loader.length >= 4 || image?.length >= 5) {
      setLoadOpen(true);
      setTimeout(() => {
        setLoadOpen(false);
      }, 3000);
    } else {
      const file = e.target.files[0];
      const resizedString = await convertToBase64(file);
      loadeImage.loader.push(resizedString);
      image.push(file);
      setImage(image);
      setLoadImage({ loader: loadeImage.loader });
    }
  };

  const modifyString = (a, sti) => {
    const url = sti.split(" ");
    const width = sti.replace("560", "326").replace("315", "326");
    const previewMp4 = sti.replace("1350", "510").replace("494", "350");
    setVideoUrl(width);
    setVideoPreview(previewMp4);
    // const index = url[3].indexOf()
    // sti.replace(index, '?controls=0\"')
    //sti[79]
  };

  const insertVariants = (productData, variants) => {
    let updatedVariants = productData;
    updatedVariants.variants = productData.variants.filter((variant) => {
      if (variant._id !== props.variant._id) return variant;
    });
    // variants._id = props.variant._id;
    updatedVariants.variants.unshift(variants);

    return updatedVariants;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (image === undefined) {
      setMustImages(true);
      setTimeout(() => {
        setMustImages(false);
      }, 3000);
    } else {
      if (
        // !active &&
        !variantName &&
        // !description &&
        // !category &&
        // !considerations &&
        !publicPriceEq &&
        !prixerPriceEq &&
        !image
      ) {
        setErrorMessage("Por favor completa todos los campos requeridos.");
        setSnackBarError(true);
        e.preventDefault();
      } else {
        setLoading(true);
        setButtonState(true);

        // const productData = props.product;
        const formData = new FormData();
        const variants = {
          _id: (props.variant && props.variant._id) || nanoid(6),
          image: image,
          active: active,
          name: variantName,
          description: description,
          category: category,
          considerations: considerations,
          publicPrice: {
            from: fromPublicPrice,
            to: toPublicPrice,
            equation: publicPriceEq,
          },
          prixerPrice: {
            from: fromPrixerPrice,
            to: toPrixerPrice,
            equation: prixerPriceEq,
          },
        };

        variants.attributes = attributes;
        variants.attributes?.map((obj, i) => {
          if (obj.name) {
            formData.append(`attributesName${i}`, obj.name);
          }
          if (obj.value) {
            formData.append(`attributesValue${i}`, obj.value);
          }
        });
        formData.append("variant_id", variants._id);
        let varImages = [];
        image.map((img) => {
          if (img.type === "images") {
            varImages.push(img.url + " ");
          } else if (typeof img.size === "number") {
            formData.append("variantImage", img);
          }
        });
        formData.append("images", varImages);
        if (videoUrl !== undefined) {
          formData.append("video", videoUrl);
        }
        formData.append("variantActive", variants.active);
        formData.append("variantName", variants.name);
        formData.append("variantDescription", variants.description);
        formData.append("variantCategory", variants.category);
        formData.append("variantConsiderations", variants.considerations);
        if (fromPublicPrice) {
          formData.append("variantPublicPriceFrom", variants.publicPrice.from);
        }
        if (toPublicPrice) {
          formData.append("variantPublicPriceTo", variants.publicPrice.to);
        }
        formData.append("variantPublicPriceEq", variants.publicPrice.equation);
        if (fromPrixerPrice) {
          formData.append("variantPrixerPriceFrom", variants.prixerPrice.from);
        }
        if (toPrixerPrice) {
          formData.append("variantPrixerPriceTo", variants.prixerPrice.to);
        }
        if (prixerPriceEq) {
          formData.append(
            "variantPrixerPriceEq",
            variants.prixerPrice.equation
          );
        }
        formData.append("adminToken", localStorage.getItem("adminTokenV"));

        const base_url =
          process.env.REACT_APP_BACKEND_URL +
          "/product/updateVariants/" +
          props.product._id;
        const response = await axios.put(base_url, formData);

        if (response.data.success === false) {
          setLoading(false);
          setButtonState(false);
          setErrorMessage(response.data.message);
          console.log(response.error);
          setSnackBarError(true);
          props.setVariant("");
        } else {
          setErrorMessage("Actualización de producto exitoso.");
          setSnackBarError(true);
          setActive("");
          setImage("");
          setVariantName("");
          setDescription("");
          setCategory("");
          setConsiderations("");
          setPublicPriceEq("");
          setFromPublicPrice("");
          setToPublicPrice("");
          setPrixerPriceEq("");
          setFromPrixerPrice("");
          setToPrixerPrice("");
          props.setVariant("");
          setLoading(false);
          history.push({ pathname: "/admin/product/read" });
        }
      }
    }
  };

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      }
      <Title>Variantes</Title>
      <form noValidate encType="multipart/form-data" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
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
                      name="productImages"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(a) => {
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
                {loadeImage.loader[0] !== null &&
                  loadeImage.loader.map((img, key_id) => {
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
                            style={{ color: "#d33f49" }}
                            component="label"
                          >
                            <input
                              name="productImages"
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(a) => {
                                const i = loadeImage.loader.indexOf(img);
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
                              loadeImage.loader.splice(key_id, 1);
                              image.splice(key_id, 1);
                              setImage(image);
                              setLoadImage({ loader: loadeImage.loader });
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
                            src={img || img.url}
                            alt="Imagen"
                          />
                        </Paper>
                        {/* {videoUrl && (
                          <span
                            key={key_id}
                            style={{ width: "100%" }}
                            dangerouslySetInnerHTML={{
                              __html: videoUrl.replace(/[,]/gi, ""),
                            }}
                          ></span>
                        )} */}
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
              <FormControl variant="outlined" xs={12} fullWidth={true}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  display="inline"
                  id="variantName"
                  label="Nombre"
                  name="variantName"
                  autoComplete="variantName"
                  value={variantName}
                  onChange={(e) => {
                    setVariantName(e.target.value);
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
                  multiline
                  fullWidth
                  minRows={2}
                  id="description"
                  label="Descripción"
                  name="description"
                  autoComplete="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
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
            </Grid>
          </Grid>
          <Grid container style={{ marginTop: 20 }}>
            <h3>Precios </h3>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="publicPriceEquation"
                label="Público"
                name="publicPriceEquation"
                autoComplete="publicPriceEquation"
                value={publicPriceEq}
                onChange={(e) => {
                  setPublicPriceEq(e.target.value);
                }}
                error={
                  publicPriceEq !== undefined &&
                  !validations.isAValidPrice(publicPriceEq)
                }
              />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <TextField
                variant="outlined"
                fullWidth
                required
                id="prixerPriceEq"
                label="Prixers"
                name="prixerPriceEq"
                autoComplete="prixerPriceEq"
                value={prixerPriceEq}
                onChange={(e) => {
                  setPrixerPriceEq(e.target.value);
                }}
                error={
                  prixerPriceEq !== undefined &&
                  prixerPriceEq !== "" &&
                  !validations.isAValidPrice(prixerPriceEq)
                }
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}></Grid>
          <Grid container xs={12} spacing={2}>
            <Grid container style={{ marginTop: 20 }}>
              <h3>Atributos</h3>
            </Grid>
            {attributes &&
              attributes.map((att, i) => (
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
                        id="attribute"
                        label="Nombre"
                        name="attribute"
                        autoComplete="attribute"
                        value={att.name}
                        onChange={(e) => {
                          setAttributes(
                            attributes
                              .slice(0, i)
                              .concat({
                                name: e.target.value,
                                value: att.value,
                              })
                              .concat(attributes.slice(i + 1))
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
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="attributeValue"
                        label="Valor"
                        name="attributeValue"
                        autoComplete="attributeValue"
                        value={att.value}
                        onChange={(e) => {
                          setAttributes(
                            attributes
                              .slice(0, i)
                              .concat({ name: att.name, value: e.target.value })
                              .concat(attributes.slice(i + 1))
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
                        setAttributes(
                          attributes.slice(0, i).concat(attributes.slice(i + 1))
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
            <Grid item xs={12} align="center">
              <Button
                variant="contained"
                color="default"
                onClick={() => {
                  setAttributes(
                    attributes
                      // .slice(0, 0)
                      .concat({ name: "", value: "" })
                  );
                }}
                disabled={buttonState}
                style={{ marginTop: 20 }}
              >
                +
              </Button>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={buttonState}
            style={{ marginTop: 20 }}
          >
            {(props.variant && "Actualizar") || "Crear"}
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
        open={mustImage}
        autoHideDuration={1000}
        message={"No puedes actualizar un variant sin foto. Agrega 1 o mas"}
        className={classes.snackbar}
      />
    </React.Fragment>
  );
}
