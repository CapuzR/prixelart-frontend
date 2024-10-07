import React, { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import axios from "axios";
import { useHistory } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Grid from "@material-ui/core/Grid";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import DirectionsBikeIcon from "@material-ui/icons/DirectionsBike";
import BusinessIcon from "@material-ui/icons/Business";
import EditIcon from "@material-ui/icons/Edit";
import { TextField } from "@material-ui/core";
import clsx from "clsx";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import Switch from "@material-ui/core/Switch";
import InputAdornment from "@material-ui/core/InputAdornment";
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined";
import AddIcon from "@material-ui/icons/Add";
import Snackbar from "@material-ui/core/Snackbar";
import DeleteIcon from "@material-ui/icons/Delete";
import utils from "../../utils/utils";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
    position: "absolute",
    marginLeft: "-8vh",
  },
  switchBase: {
    padding: 1,
    "&$checked": {
      transform: "translateX(16px)",
      color: theme.palette.common.white,
      "& + $track": {
        backgroundColor: "primary",
        opacity: 1,
        border: "none",
      },
    },
    "&$focusVisible $thumb": {
      color: "#52d869",
      border: "6px solid #fff",
    },
  },
  thumb: {
    width: 24,
    height: 24,
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[400],
    opacity: 1,
    transition: theme.transitions.create(["background-color", "border"]),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    // marginBottom: "20px",
  },
  img: {
    [theme.breakpoints.down("sm")]: {
      maxHeight: 180,
    },
    [theme.breakpoints.up("sm")]: {
      minHeight: 300,
      maxHeight: 300,
    },
    [theme.breakpoints.up("lg")]: {
      // minHeight: 300,
      // maxHeight: 450,
      minWidth: 300,
    },
    [theme.breakpoints.up("xl")]: {
      minHeight: 450,
      maxHeight: 450,
    },
  },
  imagen: {
    objectFit: "fill",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  paper2: {
    position: "absolute",
    width: "80%",
    maxHeight: "90%",
    overflowY: "auto",
    backgroundColor: "white",
    boxShadow: theme.shadows[2],
    padding: "16px 32px 24px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "justify",
    minWidth: 320,
    borderRadius: 10,
    marginTop: "12px",
    display: "flex",
    flexDirection: "row",
  },
  padding: {
    padding: 0,
  },
  textField: {
    width: "25ch",
  },
  form: {
    width: "40%",
    marginTop: 10,
  },
  buttonImgLoader: {
    cursor: "pointer",
    padding: "5px",
    color: "#d33f49",
  },
  buttonEdit: {
    cursor: "pointer",
    padding: "5px",
  },
}));

export default function SoloService(props) {
  const classes = useStyles();
  const [tile, setTile] = useState(undefined);
  const history = useHistory();
  const globalParams = new URLSearchParams(window.location.pathname);
  const service = globalParams.get("/service");
  const [backdrop, setBackdrop] = useState(true);
  const theme = useTheme();
  const [snackBar, setSnackBar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));
  const isTab = useMediaQuery(theme.breakpoints.up("xs"));
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const isnDesk = useMediaQuery(theme.breakpoints.down("md"));
  const serviceAreas = ["Diseño", "Fotografía", "Artes Plásticas", "Otro"];
  const [serviceOnEdit, setServiceOnEdit] = useState(); //Data inicial
  const [showFullDescription, setShowFullDescription] = useState([]);
  const [images, setImages] = useState([]); // Imágenes visaulizadas
  const [newImg, setNewImg] = useState([]);

  const toggleDescription = (index) => {
    const updatedShowFullDescription = [...showFullDescription];
    updatedShowFullDescription[index] = !updatedShowFullDescription[index];
    setShowFullDescription(updatedShowFullDescription);
  };

  const getService = async () => {
    setBackdrop(true);

    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/service/readService/" + service;
    await axios
      .get(base_url)
      .then((response) => {
        if (response.data.success === true) {
          setTile([response.data.service]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
    setBackdrop(false);
  };

  useEffect(() => {
    getService();
  }, []);

  const updateService = async () => {
    var formData = new FormData();
    formData.append("_id", serviceOnEdit._id);
    formData.append("title", serviceOnEdit.title);
    formData.append("description", serviceOnEdit.description);
    formData.append("serviceArea", serviceOnEdit.serviceArea);
    formData.append("isLocal", serviceOnEdit.isLocal);
    formData.append("isRemote", serviceOnEdit.isRemote);
    if (serviceOnEdit.location !== ("" || undefined)) {
      formData.append("location", serviceOnEdit.location);
    }
    if (serviceOnEdit.productionTime !== ("" || undefined)) {
      formData.append("productionTime", serviceOnEdit.productionTime);
    }
    formData.append("priceFrom", serviceOnEdit.publicPrice.from);
    if (serviceOnEdit.publicPrice.to !== ("" || undefined)) {
      formData.append("priceTo", serviceOnEdit.publicPrice.to);
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
    formData.append("active", serviceOnEdit.active || true);

    if (serviceOnEdit.sources.images.length > 0) {
      serviceOnEdit.sources.images.map((file) =>
        formData.append("images", file.url)
      );
    }

    if (newImg.length > 0) {
      newImg.map((file) => formData.append("newServiceImages", file));
    }

    const base_url =
      process.env.REACT_APP_BACKEND_URL +
      "/service/updateMyService/" +
      serviceOnEdit._id;
    const data = await axios.put(base_url, formData, {
      "Content-Type": "multipart/form-data",
    });
    if (data.data.success) {
      setBackdrop(false);
      setSnackBarMessage(data.data.message);
      setSnackBar(true);
      getMyServices();
    } else {
      setSnackBarMessage(
        "Por favor vuelve a intentarlo, puede que exista algún inconveniente de conexión. Si aún no lo has hecho por favor inicia sesión."
      );
      setSnackBar(true);
    }
  };

  const deleteService = async (id) => {
    const url =
      process.env.REACT_APP_BACKEND_URL + "/service/deleteService/" + id;
    const serviceToDelete = await axios.put(url);
    if (serviceToDelete.data.success) {
      setSnackBarMessage(serviceToDelete.data.message);
      setSnackBar(true);
      getMyServices();
    }
  };

  const checkImages = async (tile) => {
    const prevImg = [];
    await tile?.sources.images.map((images) => {
      prevImg.push(images.url);
    });
    setImages(prevImg);
  };

  const adjustPrice = async (type, e) => {
    const newPrice = serviceOnEdit.publicPrice;
    if (type === "from") {
      newPrice.from = e;
    } else {
      newPrice.to = e;
    }
    setServiceOnEdit({ ...serviceOnEdit, publicPrice: newPrice });
  };

  const loadNewImage = async (e) => {
    e.preventDefault();
    if (images.length === 6) {
      setSnackBar(true);
      setSnackBarMessage("Has alcanzado el máximo de imágenes (6).");
    } else {
      const file = e.target.files[0];
      const resizedString = await convertToBase64(file);
      setImages([...images, { name: file.name, url: resizedString }]);
      setNewImg([...newImg, file]);
    }
  };

  const replaceImage = async (e, x, index) => {
    const filteredPrev = serviceOnEdit.sources.images.filter(
      (prev) => prev.url !== x
    );
    setServiceOnEdit({ ...serviceOnEdit, sources: { images: filteredPrev } });

    const file = e.target.files[0];
    const resizedString = await convertToBase64(file);
    const prevImg = [...images];
    prevImg[index] = resizedString;
    setImages(prevImg);

    if (newImg.length > 0) {
      const filteredNewImg = newImg.filter((img) => img.name !== x.name);
      setNewImg([...filteredNewImg, file]);
    } else {
      setNewImg([...newImg, file]);
    }
  };

  const deleteImg = async (x, i2) => {
    const filteredPrev = serviceOnEdit.sources.images.filter(
      (prev) => prev.url !== x
    );
    setServiceOnEdit({ ...serviceOnEdit, sources: { images: filteredPrev } });
    if (newImg.length > 0) {
      const filteredNewImg = newImg.filter((img) => img.name !== x.name);
      setNewImg(filteredNewImg);
    }
    const filteredImg = images.filter((img) => img !== x);
    setImages(filteredImg);
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

  const closeAd = () => {
    setSnackBar(false);
  };

  const handleChangeIsLocal = () => {
    setServiceOnEdit({
      ...serviceOnEdit,
      isLocal: !serviceOnEdit.isLocal,
    });
  };

  const handleChangeIsRemote = () => {
    setServiceOnEdit({
      ...serviceOnEdit,
      isRemote: !serviceOnEdit.isRemote,
    });
  };

  const RenderHTML = ({ htmlString }) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  const handleEditorChange = (value) => {
    setServiceOnEdit({
      ...serviceOnEdit,
      description: value,
    });
  };

  const setVisibleService = async (service, event) => {
    setLoading(true);
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/service/disable/" + service._id;
    service.visible = event;
    const response = await axios.put(
      base_url,
      { visible: event, adminToken: localStorage.getItem("adminTokenV") },
      { withCredentials: true }
    );
    setSnackBarMessage("Servicio modificado exitosamente");
    getServices();
    setSnackBar(true);
    setLoading(false);
  };

  const checkPhone = async (service) => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/prixer/read";
    const prixer = await axios.post(base_url, { username: service.prixer });
    console.log(prixer);
    await window.open(
      utils.generateServiceMessage(service, prixer.data.phone),
      "_blank"
    );
  };

  const settings = {
    slidesToShow: (isDesktop && 1) || (isMobile && 1) || (isTab && 1),
    slidesToScroll: 1,
    swipeToSlide: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 1000,
    infinite: true,
    dots: true,
  };

  return (
    <>
      {/* <AppBar /> */}

      <div className={classes.root}>
        <Backdrop className={classes.backdrop} open={backdrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>

      <Grid
        container
        style={{ justifyContent: "center", marginBottom: 20, marginTop: 80 }}
      >
        {tile ? (
          tile?.map((tile, i) => (
            <Grid item xs={12} md={10} lg={8} key={i}>
              <Paper elevation={3} style={{ padding: 20 }}>
                {props.permissions?.artBan && (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent: "end",
                    }}
                  >
                    <IOSSwitch
                      color="primary"
                      size="normal"
                      checked={tile?.visible}
                      onChange={(e) => {
                        setVisibleService(tile, e.target.checked);
                      }}
                    />
                  </div>
                )}
                <Grid
                  container
                  style={{ display: "flex", flexDirection: "row" }}
                >
                  {isnDesk &&
                  JSON.parse(localStorage.getItem("token")) &&
                  JSON.parse(localStorage.getItem("token")).username ===
                    tile?.prixer &&
                  openEdit === i ? (
                    <Button
                      style={{
                        backgroundColor: "#d33f49",
                        color: "white",
                        padding: 8,
                        marginLeft: 10,
                      }}
                      onClick={() => {
                        updateService();
                        setOpenEdit(false);
                      }}
                    >
                      Guardar
                    </Button>
                  ) : (
                    JSON.parse(localStorage.getItem("token")) &&
                    JSON.parse(localStorage.getItem("token")).username ===
                      tile?.prixer &&
                    isnDesk && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "end",
                          marginTop: -15,
                          marginBottom: -15,
                          width: "100%",
                        }}
                      >
                        <IconButton
                          component="span"
                          color="primary"
                          onClick={() => {
                            setOpenEdit(i);
                            setServiceOnEdit(tile);
                            checkImages(tile);
                          }}
                          variant="contained"
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          component="span"
                          color="primary"
                          onClick={() => {
                            deleteService(tile?._id);
                          }}
                          variant="contained"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    )
                  )}
                  <Grid
                    item
                    xs={12}
                    md={4}
                    style={{ marginBottom: isMobile && 15 }}
                  >
                    {openEdit === i ? (
                      <>
                        <FormControl
                          className={clsx(classes.margin, classes.textField)}
                          variant="outlined"
                          style={{
                            width: "90%",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Switch
                            checked={serviceOnEdit.active}
                            onChange={(e) => {
                              setServiceOnEdit({
                                ...serviceOnEdit,
                                active: e.target.value,
                              });
                            }}
                            color="primary"
                          />
                          <Typography color="secondary">Activo</Typography>
                        </FormControl>
                        <Slider {...settings}>
                          {images?.map((img, i2) => (
                            <div
                              key={i2}
                              style={{
                                borderRadius: 30,
                                maxHeight: 100,
                                marginRight: 10,
                                width: "90%",
                              }}
                            >
                              <div
                                style={{
                                  marginBottom: "-50px",
                                  marginRight: 10,
                                  textAlign: "right",
                                }}
                              >
                                <IconButton
                                  className={classes.buttonImgLoader}
                                  component="label"
                                >
                                  <input
                                    name="serviceImages"
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(a) => {
                                      replaceImage(a, img, i2);
                                    }}
                                  />
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  className={classes.buttonImgLoader}
                                  onClick={(d) => {
                                    deleteImg(img, i2);
                                  }}
                                >
                                  <HighlightOffOutlinedIcon />
                                </IconButton>
                              </div>
                              <div
                                style={{
                                  backgroundImage:
                                    img?.url !== undefined
                                      ? `url(${img.url})`
                                      : `url(${img})`,
                                  height:
                                    (isDesktop && 260) ||
                                    (isMobile && 180) ||
                                    (isTab && 260),
                                  marginRight: 10,
                                  backgroundSize: "cover",
                                  borderRadius: 10,
                                  backgroundPosition: "back",
                                  margin: "16px 10px 0px 10px",
                                }}
                              />
                            </div>
                          ))}
                        </Slider>
                        <Button
                          className={classes.buttonImgLoader}
                          style={{ marginTop: 20, display: "flex" }}
                          component="label"
                        >
                          <input
                            name="serviceImages"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(a) => {
                              loadNewImage(a);
                            }}
                          />
                          <AddIcon fontSize="large" />
                        </Button>
                      </>
                    ) : (
                      <Slider {...settings}>
                        {tile?.sources?.images?.map((img, i2) => (
                          <div
                            key={img._id}
                            style={{
                              borderRadius: 30,
                              maxHeight: 100,
                              marginRight: 10,
                              width: "100%",
                            }}
                          >
                            <div
                              style={{
                                backgroundImage: `url(${img.url})`,
                                height:
                                  (isDesktop && 260) ||
                                  (isMobile && 180) ||
                                  (isTab && 260),
                                marginRight: 10,
                                width: "100%",
                                backgroundSize: "cover",
                                borderRadius: 10,
                                backgroundPosition: "back",
                                marginTop: 15,
                              }}
                            />
                          </div>
                        ))}
                      </Slider>
                    )}
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={8}
                    style={{ paddingLeft: isMobile ? 0 : 20, paddingTop: 10 }}
                  >
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {openEdit === i ? (
                        <TextField
                          variant="outlined"
                          required
                          fullWidth
                          label="Título"
                          value={serviceOnEdit.title}
                          onChange={(e) => {
                            setServiceOnEdit({
                              ...serviceOnEdit,
                              title: e.target.value,
                            });
                          }}
                        />
                      ) : (
                        <Typography variant="h5" color="secondary">
                          {tile?.title}
                        </Typography>
                      )}
                      {JSON.parse(localStorage.getItem("token")) &&
                      JSON.parse(localStorage.getItem("token")).username ===
                        tile?.prixer &&
                      !isnDesk &&
                      openEdit === i ? (
                        <Button
                          style={{
                            backgroundColor: "#d33f49",
                            color: "white",
                            padding: 8,
                            marginLeft: 10,
                          }}
                          onClick={() => {
                            updateService();
                            setOpenEdit(false);
                          }}
                        >
                          Guardar
                        </Button>
                      ) : (
                        JSON.parse(localStorage.getItem("token")) &&
                        JSON.parse(localStorage.getItem("token")).username ===
                          tile?.prixer &&
                        !isnDesk && (
                          <div>
                            <IconButton
                              component="span"
                              color="primary"
                              onClick={() => {
                                setOpenEdit(i);
                                setServiceOnEdit(tile);
                                checkImages(tile);
                              }}
                              variant="contained"
                            >
                              <EditIcon />
                            </IconButton>

                            <IconButton
                              component="span"
                              color="primary"
                              onClick={() => {
                                deleteService(tile?._id);
                              }}
                              variant="contained"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        )
                      )}
                    </div>
                    <Button
                      size="small"
                      style={{
                        backgroundColor: "gainsboro",
                        color: "#404e5c",
                        textTransform: "none",
                        padding: "1px 5px",
                      }}
                      onClick={() => {
                        history.push({ pathname: "/prixer=" + tile?.prixer });
                      }}
                    >
                      de {tile?.prixer}
                    </Button>
                    {openEdit === i ? (
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <FormControl
                          variant="outlined"
                          className={classes.form}
                        >
                          <InputLabel required>Tipo</InputLabel>
                          <Select
                            fullWidth
                            label="Tipo"
                            required
                            value={serviceOnEdit.serviceArea}
                            onChange={(e) => {
                              setServiceOnEdit({
                                ...serviceOnEdit,
                                serviceArea: e.target.value,
                              });
                            }}
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
                        <FormControl
                          variant="outlined"
                          className={classes.form}
                        >
                          <TextField
                            variant="outlined"
                            required
                            label="Tiempo de trabajo aproximado"
                            value={serviceOnEdit.productionTime}
                            onChange={(e) => {
                              setServiceOnEdit({
                                ...serviceOnEdit,
                                productionTime: e.target.value,
                              });
                            }}
                          />
                        </FormControl>
                      </div>
                    ) : (
                      <Typography
                        variant="subtitle2"
                        color="secondary"
                        style={{ paddingBottom: 15 }}
                      >
                        ({tile?.serviceArea})
                      </Typography>
                    )}
                    {openEdit === i ? (
                      <ReactQuill
                        style={{ height: 300, marginBottom: 30, marginTop: 15 }}
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, 4, 5, 6, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ align: [] }],
                            [{ list: "ordered" }, { list: "bullet" }],
                          ],
                        }}
                        value={serviceOnEdit.description}
                        onChange={handleEditorChange}
                        placeholder="Escribe la descripción aquí..."
                      />
                    ) : (
                      <>
                        <RenderHTML
                          htmlString={
                            // showFullDescription[i]
                            //   ?
                            tile?.description
                            //   : `${tile?.description.slice(0, 450)}...`
                          }
                        />
                        {/* {tile?.description.length > 450 && (
                          <Button
                            style={{
                              color: "dimgray",
                            }}
                            onClick={() => toggleDescription(i)}
                          >
                            {showFullDescription[i] ? "Ver menos" : "Ver más"}
                          </Button>
                        )} */}
                      </>
                    )}
                    <div
                      style={{
                        paddingTop: 10,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        paddingBottom: 10,
                      }}
                    >
                      {openEdit === i ? (
                        <>
                          <FormControl
                            className={clsx(classes.margin, classes.textField)}
                            variant="outlined"
                            style={{
                              width: "90%",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Switch
                              checked={serviceOnEdit.isLocal}
                              onChange={handleChangeIsLocal}
                              color="primary"
                            />
                            <Typography color="secondary">
                              ¿Trabajas en algún local?
                            </Typography>
                          </FormControl>
                          <FormControl
                            className={clsx(classes.margin, classes.textField)}
                            variant="outlined"
                            style={{
                              width: "90%",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Switch
                              checked={serviceOnEdit.isRemote}
                              onChange={handleChangeIsRemote}
                              color="primary"
                            />
                            <Typography color="secondary">
                              ¿Trabajas a domicilio?
                            </Typography>
                          </FormControl>
                        </>
                      ) : (
                        <>
                          {tile?.isRemote && (
                            <>
                              <DirectionsBikeIcon
                                color="secondary"
                                style={{ paddingRight: 5 }}
                              />
                              <Typography variant="body2" color="secondary">
                                Disponible para trabajar en locaciones
                              </Typography>
                            </>
                          )}

                          {tile?.isLocal && tile?.location && (
                            <>
                              <BusinessIcon
                                color="secodary"
                                style={{ paddingRight: 5 }}
                              />
                              <Typography variant="body2" color="secondary">
                                {tile?.location}
                              </Typography>
                            </>
                          )}
                        </>
                      )}
                    </div>
                    {openEdit === i && serviceOnEdit.isLocal === true && (
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        label="Ubicación"
                        value={serviceOnEdit.location}
                        onChange={(e) => {
                          setServiceOnEdit({
                            ...serviceOnEdit,
                            location: e.target.value,
                          });
                        }}
                        style={{ marginTop: 10 }}
                        minRows={3}
                      />
                    )}

                    {openEdit !== i && tile?.productionTime && (
                      <Typography variant="body2" color="secondary">
                        {tile?.productionTime}
                      </Typography>
                    )}
                    {openEdit === i ? (
                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <TextField
                          variant="outlined"
                          required
                          label="Valor desde"
                          type="Number"
                          value={serviceOnEdit?.publicPrice?.from}
                          onChange={(e) => {
                            adjustPrice("from", e.target.value);
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          variant="outlined"
                          label="Valor hasta"
                          type="Number"
                          value={serviceOnEdit.publicPrice?.to}
                          onChange={(e) => {
                            adjustPrice("to", e.target.value);
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          }}
                        />
                      </div>
                    ) : (
                      <Typography
                        variant="body2"
                        color="secondary"
                        style={{ paddingTop: 10 }}
                      >
                        Valor desde ${tile?.publicPrice.from}
                        {tile?.publicPrice.to &&
                          "  hasta $" + tile?.publicPrice.to}
                      </Typography>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "end",
                        alignContent: "end",
                      }}
                    >
                      <Button
                        style={{
                          backgroundColor: "gainsboro",
                          padding: 8,
                          marginLeft: 10,
                          marginTop: 20,
                        }}
                        color="secondary"
                        onClick={(e) => {
                          window.open(
                            utils.generateLikeServiceMessage(tile),
                            "_blank"
                          );
                        }}
                      >
                        Compartir
                      </Button>
                      {JSON.parse(localStorage.getItem("token")) ? (
                        JSON.parse(localStorage.getItem("token")).username !==
                          tile?.prixer && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "end",
                              alignContent: "end",
                            }}
                          >
                            <Button
                              style={{
                                backgroundColor: "#d33f49",
                                color: "white",
                                padding: 8,
                                marginLeft: 10,
                                marginTop: 20,
                              }}
                              onClick={(e) => {
                                checkPhone(tile);
                              }}
                            >
                              Contactar
                            </Button>
                          </div>
                        )
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "end",
                            alignContent: "end",
                          }}
                        >
                          <Button
                            style={{
                              backgroundColor: "#d33f49",
                              color: "white",
                              padding: 8,
                              marginLeft: 10,
                              marginTop: 20,
                            }}
                            onClick={(e) => {
                              checkPhone(tile);
                            }}
                          >
                            Contactar
                          </Button>
                        </div>
                      )}
                    </div>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))
        ) : (
          <Typography
            variant="h4"
            color="secondary"
            align="center"
            style={{
              paddingTop: 30,
            }}
          >
            No ha cargado el servicio aún.
          </Typography>
        )}
      </Grid>

      <Snackbar
        open={snackBar}
        autoHideDuration={5000}
        message={snackBarMessage}
        onClose={closeAd}
      />
    </>
  );
}
