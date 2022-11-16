import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import AppBar from "../../sharedComponents/appBar/appBar";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import Snackbar from "@material-ui/core/Snackbar";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import FloatingAddButton from "../../sharedComponents/floatingAddButton/floatingAddButton";
import ArtUploader from "../../sharedComponents/artUploader/artUploader";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import utils from "../../utils/utils";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Img from "react-cool-img";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Switch from "@material-ui/core/Switch";
import Chip from "@material-ui/core/Chip";
import Modal from "@material-ui/core/Modal";
import MDEditor from "@uiw/react-md-editor";

const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
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
  loading: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
    marginLeft: "50vw",
    marginTop: "50vh",
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    maxWidth: 850,
    flexGrow: 1,
  },
  root: {
    width: "100vw",
  },
  float: {
    position: "relative",
    marginLeft: "87%",
  },
  paper2: {
    position: "absolute",
    width: "80%",
    maxHeight: 450,
    overflowY: "auto",
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: "16px 32px 24px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "justify",
  },
}));

const photoIsos = ["100", "200", "400"];

export default function FullscreePhoto(props) {
  const classes = useStyles();
  const history = useHistory();
  const [ready, setReady] = useState(false);
  const [tiles, setTiles] = useState([]);
  const [updatedTile, setUpdatedTile] = useState([]);
  const [loading, setLoading] = useState(false);
  const [artDataState, setArtDataState] = useState();
  const [snackBar, setSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState(false);
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const [selectedArt, setSelectedArt] = useState(undefined);
  const [hiddenArt, setHiddenArt] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [openV, setOpenV] = useState(false);
  const [disabledReason, setDisabledReason] = useState("");
  const [visible, setVisible] = useState(true);
  let [points, setPoints] = useState(50);
  const [termsAgreeVar, setTermsAgreeVar] = useState(true);
  const [value, setValue] = useState("");

  const propsRank = {
    min: 0,
    max: 100,
  };

  const handleArtEdit = (e, tile) => {
    setLoading(true);
    if (artDataState === tile.artId) {
      if (updatedTile.title !== "" && updatedTile.description !== "") {
        setUpdatedTile(tile);
        setArtDataState("");
        setSnackBarMessage("Arte actualizado correctamente");
        setSnackBar(true);
      } else {
        setSnackBarMessage("Por favor llena los campos requeridos");
        setSnackBar(true);
      }
    } else {
      setArtDataState(tile.artId);
    }
    setLoading(false);
  };

  const handleArtDescriptionEdit = async (e, tile) => {
    let tempTiles = tiles;
    let result = await descriptionEdit(tempTiles, tile, e);
    setTiles(result);
  };

  const handleArtTitleEdit = async (e, tile) => {
    let tempTiles = tiles;
    let result = await titleEdit(tempTiles, tile, e);
    setTiles(result);
  };

  const handleOriginalPhotoHeight = async (e, tile) => {
    let tempTiles = tiles;
    let result = await originalPhotoHeightEdit(tempTiles, tile, e);
    setTiles(result);
  };

  const handleOriginalPhotoWidth = async (e, tile) => {
    let tempTiles = tiles;
    let result = await originalPhotoWidthEdit(tempTiles, tile, e);
    setTiles(result);
  };

  const handleOriginalPhotoPpi = async (e, tile) => {
    let tempTiles = tiles;
    let result = await originalPhotoPpiEdit(tempTiles, tile, e);
    setTiles(result);
  };

  const handleOriginalPhotoIso = async (e, tile) => {
    let tempTiles = tiles;
    let result = await originalPhotoIsoEdit(tempTiles, tile, e);
    setTiles(result);
  };

  // const handleArtTagsEdit = async (e, tile, tags) => {
  //   let tempTiles = tiles;
  //   setNewTag = tile.tags;
  //   let result = await tagsEdit(tempTiles, tile, e, tags);
  //   setTiles(result);
  // };

  const handleArtLocationEdit = async (e, tile) => {
    let tempTiles = tiles;
    let result = await locationEdit(tempTiles, tile, e);
    setTiles(result);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClickVisible = () => {
    setOpenV(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedArt(undefined);
  };
  const handleCloseVisible = () => {
    setOpenV(false);
    setHiddenArt(undefined);
  };
  function tagsEdit(tempTiles, tile, e, tags) {
    console.log(tempTiles);
    return tempTiles.map((item) => {
      const result = tags.trim().split(/\s+/);
      if (item.artId === tile.artId) {
        item.tags = tags;
      }
      console.log(result);
      return item;
    });
  }

  function locationEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.artLocation = e.target.value;
      }
      return item;
    });
  }

  function titleEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.title = e.target.value;
      }
      return item;
    });
  }

  function originalPhotoHeightEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.originalPhotoHeight = e.target.value;
      }
      return item;
    });
  }

  function originalPhotoWidthEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.originalPhotoWidth = e.target.value;
      }
      return item;
    });
  }

  function originalPhotoPpiEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.originalPhotoPpi = e.target.value;
      }
      return item;
    });
  }

  function originalPhotoIsoEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.originalPhotoIso = e.target.value;
      }
      return item;
    });
  }

  function descriptionEdit(tempTiles, tile, e) {
    return tempTiles.map((item) => {
      if (item.artId === tile.artId) {
        item.description = e.target.value;
      }
      return item;
    });
  }

  const maxPrintValues = (tile) => {
    const [maxPrintWidthCm, maxPrintHeightCm] = utils.maxPrintCalc(
      tile.originalPhotoWidth,
      tile.originalPhotoHeight,
      tile.originalPhotoPpi,
      tile.originalPhotoIso
    );

    return maxPrintWidthCm + " x " + maxPrintHeightCm + " cm";
  };

  const navigateToPrixer = (e, prixerUsername) => {
    e.preventDefault();
    history.push({ pathname: "/" + prixerUsername });
  };

  // const copyCodeToClipboard = (e, tile) => {
  //   const el = document.createElement('textarea');
  //   el.value = utils.generateArtMessage(tile, 'copy');
  //   document.body.appendChild(el);
  //   el.select();
  //   document.execCommand('copy');
  //   document.body.removeChild(el);
  // }

  const deleteArt = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/art/delete/" + selectedArt;
    let res = await axios.delete(base_url);
    handleClose();
    setSnackBarMessage("Arte eliminado exitosamente");
    setSnackBar(true);
    readArt();
  };

  const setVisibleArt = async (art, id, event) => {
    setLoading(true);
    if (event.target.checked === true) {
      const base_url = process.env.REACT_APP_BACKEND_URL + "/art/disable/" + id;
      art.visible = visible;
      const response = await axios.put(base_url, art);
      setSnackBarMessage("Arte modificado exitosamente");
      setSnackBar(true);
      setLoading(false);
      setDisabledReason("");
      setHiddenArt(undefined);
    } else {
      const base_url = process.env.REACT_APP_BACKEND_URL + "/art/disable/" + id;
      art.visible = visible;
      art.disabledReason = disabledReason;
      const response = await axios.put(base_url, art);
      handleClose();
      setSnackBarMessage("Arte modificado exitosamente");
      setSnackBar(true);
      setLoading(false);
      setDisabledReason("");
    }
    readArt();
  };

  const rankArt = async (art, id, event) => {
    setLoading(true);
    const URI = process.env.REACT_APP_BACKEND_URL + "/art/rank/" + id;
    art.points = parseInt(points);
    const response = await axios.put(URI, art);
    setSnackBarMessage("Puntuación agregada exitosamente");
    setInterval(() => {
      setLoading(false);
    }, 3000);
    setSnackBar(true);
    setSelectedArt(undefined);
    readArt();
  };

  // const getChecked = () => {
  //   setChecked((check) => !check);
  // };

  const readArt = async () => {
    setLoading(true);
    if (tiles) {
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/art/read-by-prixer";
      const data = {
        username: props.match.params.username,
      };
      await axios.post(base_url, data).then((response) => {
        if (tiles.length !== response.data.arts.length) {
          setTiles(response.data.arts);
          setReady(true);
          if (document.getElementById(props.match.params.artId)) {
            document.getElementById(props.match.params.artId).scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          } else {
            setSnackBarMessage(
              "Arte no encontrado, por favor inténtalo de nuevo."
            );
            setSnackBar(true);
          }
        }
      });
    }
    setLoading(false);
  };
  useEffect(() => {
    readArt();
  }, []);

  useEffect(() => {
    setLoading(true);
    if (artDataState === "") {
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/art/update/" + selectedArt;
      const data = {
        title: updatedTile.title,
        description: updatedTile.description,
        tags: updatedTile.tags,
        category: updatedTile.category,
        artId: updatedTile.artId,
        artType: updatedTile.artType,
        artLocation: updatedTile.artLocation,
      };
      axios
        .put(base_url, data)
        .then((response) => {
          if (response.data.data.success == true) {
            setSnackBarMessage(response.data.data.success);
            setSnackBar(true);
            setSelectedArt(undefined);
          } else {
            setSnackBarMessage(response.data.data.error_message);
            setSnackBar(true);
            setSelectedArt(undefined);
          }
        })
        .catch((error) => {
          // console.log(error);
          setSelectedArt(undefined);
        });
    }
    setLoading(false);
  }, [artDataState]);

  const getTerms = () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/read";
    axios
      .get(base_url)
      .then((response) => {
        setValue(response.data.terms.termsAndConditions);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleSubmit = async (e, Id) => {
    e.preventDefault();
    const formData = new FormData();
    const termsAgree = true;
    formData.append("termsAgree", termsAgree);
    // formData.append(
    //   "username",
    //   JSON.parse(localStorage.getItem("token")).username
    // );
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/prixer/update-terms/" + Id;
    const response = await axios
      .put(
        base_url,
        { termsAgree: true },
        {
          "Content-Type": "multipart/form-data",
        }
      )
      .then((response) => {
        setTermsAgreeVar(true);
      });
  };

  const TermsAgreeModal = () => {
    const GetId = JSON.parse(localStorage.getItem("token")).username;
    const base_url = process.env.REACT_APP_BACKEND_URL + "/prixer/get/" + GetId;
    axios.get(base_url).then((response) => {
      setTermsAgreeVar(response.data.termsAgree);
      getTerms();
    });
  };

  useEffect(() => {
    {
      JSON.parse(localStorage.getItem("token")) && TermsAgreeModal();
    }
  }, []);

  return !ready ? (
    <div className={classes.loading}>
      <CircularProgress />
    </div>
  ) : (
    <>
      <div>
        <AppBar />
      </div>
      <Container component="main" className={classes.paper}>
        <div style={{ marginTop: 55 }}>
          {tiles ? (
            tiles.map((tile) =>
              artDataState !== tile.artId ? (
                <div id={tile.artId} key={tile.artId}>
                  {tile.visible === true ? (
                    <Card style={{ marginTop: 35 }}>
                      <CardActionArea disabled>
                        <Img
                          placeholder="/imgLoading.svg"
                          style={{ backgroundColor: "#eeeeee", width: "100%" }}
                          src={tile.largeThumbUrl || tile.thumbnailUrl}
                          debounce={1000} // Default is 300 (ms)
                          cache
                          error="/imgError.svg"
                          srcSet={
                            tile.smallThumbUrl +
                            " 600w, " +
                            tile.mediumThumbUrl +
                            " 850w, " +
                            tile.largeThumbUrl +
                            " 1300w"
                          }
                          sizes="(min-width: 960px) 1300px, (min-width: 640px) 850px, 600px"
                          alt={tile.title}
                          id={tile.artId}
                        />
                      </CardActionArea>
                      <CardContent>
                        <Grid
                          item
                          container
                          xs={12}
                          sm={12}
                          style={{
                            whiteSpace: "nowrap",
                            padding: 0,
                            margin: 0,
                          }}
                          justify="space-between"
                        >
                          <Typography
                            style={{
                              display: "inline-block",
                              fontSize: "0.8em",
                              paddingLeft: 0,
                            }}
                          >
                            ID: {tile.artId}
                          </Typography>
                          <Grid
                            container
                            spacing={1}
                            style={{
                              flexWrap: "nowrap",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              marginBottom: "-35px",
                            }}
                          >
                            <Grid item>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={(e) =>
                                  navigateToPrixer(e, tile.prixerUsername)
                                }
                              >
                                <Typography
                                  gutterBottom
                                  variant="h7"
                                  component="h2"
                                  style={{
                                    display: "inline-block",
                                    right: 0,
                                    textAlign: "right",
                                    margin: 0,
                                    fontSize: 12,
                                  }}
                                >
                                  Prixer: {tile.prixerUsername}
                                </Typography>
                              </Button>
                            </Grid>
                            <Grid item>
                              {JSON.parse(
                                localStorage.getItem("adminToken")
                              ) && (
                                <Button
                                  size="small"
                                  color="primary"
                                  variant="contained"
                                  disabled
                                >
                                  <Typography>Puntos: {tile.points}</Typography>
                                </Button>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid
                          item
                          container
                          xs={12}
                          sm={12}
                          justify="space-between"
                          style={{ textAlign: "left", padding: 0, margin: 0 }}
                        >
                          <Grid
                            item
                            xs={6}
                            sm={6}
                            style={{ textAlign: "left", padding: 0, margin: 0 }}
                          >
                            <Typography
                              gutterBottom
                              variant="h5"
                              component="h2"
                              style={{ margin: 0 }}
                            >
                              {tile.title}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Grid
                          item
                          container
                          xs={12}
                          sm={12}
                          style={{ textAlign: "left", padding: 0, margin: 0 }}
                        >
                          {tile.artLocation && (
                            <Typography
                              style={{
                                fontSize: "0.8em",
                                paddingBottom: 10,
                                paddingLeft: 3,
                              }}
                            >
                              Ubicación: {tile.artLocation}
                            </Typography>
                          )}
                        </Grid>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          component="p"
                          style={{
                            whiteSpace: "pre-line",
                            fontSize: "1.1em",
                            marginBottom: 10,
                          }}
                        >
                          {tile.description}
                        </Typography>
                        {tile.originalPhotoHeight && tile.originalPhotoWidth && (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                          >
                            Máximo para impresión: {maxPrintValues(tile)}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        {/* <Button size="small" color="primary">
                  Comparte
                </Button> */}
                        <Button
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            window.open(
                              utils.generateWaMessage(tile),
                              "_blank"
                            );
                          }}
                        >
                          <WhatsAppIcon /> Escríbenos
                        </Button>
                        {JSON.parse(localStorage.getItem("token")) &&
                          JSON.parse(localStorage.getItem("token")).username ==
                            tile.prixerUsername && (
                            <Button
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                handleArtEdit(e, tile);
                                setSelectedArt(tile.artId);
                              }}
                            >
                              Editar
                            </Button>
                          )}
                        {JSON.parse(localStorage.getItem("adminToken")) && (
                          <IOSSwitch
                            color="primary"
                            size="normal"
                            checked={tile.visible}
                            onChange={(e) => {
                              setHiddenArt(tile.artId);
                              if (e.target.checked === false) {
                                handleClickVisible();
                                setVisible(e.target.checked);
                              } else {
                                setVisibleArt(tile, tile.artId, e);
                                setVisible(e.target.checked);
                              }
                            }}
                          />
                        )}
                        {JSON.parse(localStorage.getItem("adminToken")) && (
                          <>
                            <FormControl>
                              <Grid
                                container
                                spacing={0.5}
                                flexWrap="nowrap"
                                justifyContent="center"
                                alignItems="center"
                                flexDirection="row"
                              >
                                <Grid item xs={8}>
                                  <TextField
                                    type="number"
                                    variant="outlined"
                                    placeholder="Points"
                                    inputProps={propsRank}
                                    onChange={(e) => {
                                      setPoints(e.target.value);
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={3}>
                                  <Button
                                    color="primary"
                                    variant="outlined"
                                    onClick={(e) => {
                                      rankArt(tile, tile.artId, e);
                                    }}
                                  >
                                    Enviar
                                  </Button>
                                </Grid>
                              </Grid>
                            </FormControl>
                            <Dialog
                              open={hiddenArt === tile.artId}
                              onClose={handleCloseVisible}
                            >
                              <DialogTitle>
                                {"¿Estás seguro de ocultar este arte?"}
                              </DialogTitle>
                              <DialogContent>
                                <DialogContentText
                                  style={{
                                    textAlign: "center",
                                  }}
                                >
                                  Este arte ya no será visible en este perfil y
                                  la página de inicio.
                                </DialogContentText>
                              </DialogContent>
                              <Grid
                                item
                                xs
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <TextField
                                  style={{ width: "95%", marginBottom: "5px" }}
                                  fullWidth
                                  multiline
                                  required
                                  id="disableReason"
                                  label="¿Por qué quieres ocultar este arte?"
                                  variant="outlined"
                                  onChange={(e) => {
                                    setDisabledReason(e.target.value);
                                    // handleArtTitleEdit(e, tile);
                                  }}
                                />
                              </Grid>
                              <DialogActions>
                                <Button
                                  onClick={handleCloseVisible}
                                  color="primary"
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    setVisibleArt(tile, selectedArt, e);
                                    setHiddenArt(undefined);
                                    handleCloseVisible();
                                  }}
                                  background="primary"
                                  style={{
                                    color: "white",
                                    backgroundColor: "#d33f49",
                                  }}
                                >
                                  Aceptar
                                </Button>
                              </DialogActions>
                            </Dialog>
                          </>
                        )}

                        {JSON.parse(localStorage.getItem("token")) &&
                          JSON.parse(localStorage.getItem("token")).username ==
                            tile.prixerUsername && (
                            <Button
                              color="primary"
                              size="small"
                              onClick={(e) => {
                                handleClickOpen(e);
                                setSelectedArt(tile.artId);
                              }}
                            >
                              Eliminar
                            </Button>
                          )}
                        <Dialog
                          open={open}
                          onClose={handleClose}
                          aria-labelledby="alert-dialog-title"
                          aria-describedby="alert-dialog-description"
                        >
                          <DialogTitle id="alert-dialog-title">
                            {"¿Estás seguro de eliminar este arte?"}
                          </DialogTitle>
                          <DialogContent>
                            <DialogContentText
                              id="alert-dialog-description"
                              style={{
                                textAlign: "center",
                              }}
                            >
                              Este arte se eliminará permanentemente de tu
                              perfil.
                            </DialogContentText>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={handleClose} color="primary">
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => {
                                deleteArt(selectedArt);
                                setSelectedArt(undefined);
                              }}
                              background="primary"
                              style={{
                                color: "white",
                                backgroundColor: "#d33f49",
                              }}
                            >
                              Aceptar
                            </Button>
                          </DialogActions>
                        </Dialog>

                        {/* <Button size="small" color="primary" onClick={(e)=>{copyCodeToClipboard(e, tile)}}>
                  <FileCopyIcon/>
                </Button> */}
                      </CardActions>
                    </Card>
                  ) : (
                    JSON.parse(localStorage.getItem("adminToken")) && (
                      <Card style={{ marginTop: 35 }}>
                        <CardActionArea disabled>
                          <Img
                            placeholder="/imgLoading.svg"
                            style={{
                              backgroundColor: "#eeeeee",
                              width: "100%",
                            }}
                            src={tile.largeThumbUrl || tile.thumbnailUrl}
                            debounce={1000} // Default is 300 (ms)
                            cache
                            error="/imgError.svg"
                            srcSet={
                              tile.smallThumbUrl +
                              " 600w, " +
                              tile.mediumThumbUrl +
                              " 850w, " +
                              tile.largeThumbUrl +
                              " 1300w"
                            }
                            sizes="(min-width: 960px) 1300px, (min-width: 640px) 850px, 600px"
                            alt={tile.title}
                            id={tile.artId}
                          />
                        </CardActionArea>
                        <CardContent>
                          <Grid
                            item
                            container
                            xs={12}
                            sm={12}
                            style={{
                              whiteSpace: "nowrap",
                              padding: 0,
                              margin: 0,
                            }}
                            justify="space-between"
                          >
                            <Typography
                              style={{
                                display: "inline-block",
                                fontSize: "0.8em",
                                paddingLeft: 0,
                              }}
                            >
                              ID: {tile.artId}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) =>
                                navigateToPrixer(e, tile.prixerUsername)
                              }
                            >
                              <Typography
                                gutterBottom
                                variant="h7"
                                component="h2"
                                style={{
                                  display: "inline-block",
                                  right: 0,
                                  textAlign: "right",
                                  margin: 0,
                                  fontSize: 12,
                                }}
                              >
                                Prixer: {tile.prixerUsername}
                              </Typography>
                            </Button>
                          </Grid>
                          <Grid
                            item
                            container
                            xs={12}
                            sm={12}
                            justify="space-between"
                            style={{ textAlign: "left", padding: 0, margin: 0 }}
                          >
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              style={{
                                textAlign: "left",
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              <Typography
                                gutterBottom
                                variant="h5"
                                component="h2"
                                style={{ margin: 0 }}
                              >
                                {tile.title}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Grid
                            item
                            container
                            xs={12}
                            sm={12}
                            style={{ textAlign: "left", padding: 0, margin: 0 }}
                          >
                            {tile.artLocation && (
                              <Typography
                                style={{
                                  fontSize: "0.8em",
                                  paddingBottom: 10,
                                  paddingLeft: 3,
                                }}
                              >
                                Ubicación: {tile.artLocation}
                              </Typography>
                            )}
                          </Grid>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="p"
                            style={{
                              whiteSpace: "pre-line",
                              fontSize: "1.1em",
                              marginBottom: 10,
                            }}
                          >
                            {tile.description}
                          </Typography>
                          {tile.originalPhotoHeight && tile.originalPhotoWidth && (
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              component="p"
                            >
                              Máximo para impresión: {maxPrintValues(tile)}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions>
                          {/* <Button size="small" color="primary">
                  Comparte
                </Button> */}
                          <Button
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              window.open(
                                utils.generateWaMessage(tile),
                                "_blank"
                              );
                            }}
                          >
                            <WhatsAppIcon /> Escríbenos
                          </Button>
                          {JSON.parse(localStorage.getItem("adminToken")) && (
                            <IOSSwitch
                              color="primary"
                              size="normal"
                              onChange={(e) => {
                                if (e.target.checked === false) {
                                  handleClickVisible();
                                  setVisible(e.target.checked);
                                  setHiddenArt(tile.artId);
                                } else {
                                  setVisible(e.target.checked);
                                  setVisibleArt(tile, tile.artId, e);
                                }
                              }}
                            ></IOSSwitch>
                          )}
                          {JSON.parse(localStorage.getItem("token")) &&
                            JSON.parse(localStorage.getItem("token"))
                              .username == tile.prixerUsername && (
                              <Button
                                color="primary"
                                size="small"
                                onClick={(e) => {
                                  handleClickOpen(e);
                                  setSelectedArt(tile.artId);
                                }}
                              >
                                Eliminar
                              </Button>
                            )}
                          <Dialog
                            open={open}
                            onClose={handleClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                          >
                            <DialogTitle id="alert-dialog-title">
                              {"¿Estás seguro de eliminar este arte?"}
                            </DialogTitle>
                            <DialogContent>
                              <DialogContentText
                                id="alert-dialog-description"
                                style={{
                                  textAlign: "center",
                                }}
                              >
                                Este arte se eliminará permanentemente de tu
                                perfil.
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleClose} color="primary">
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => {
                                  deleteArt(selectedArt);
                                  setSelectedArt(undefined);
                                }}
                                background="primary"
                                style={{
                                  color: "white",
                                  backgroundColor: "#d33f49",
                                }}
                              >
                                Aceptar
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </CardActions>
                      </Card>
                    )
                  )}
                </div>
              ) : (
                <Card id={tile.artId} key={tile.artId}>
                  <Img
                    placeholder="/imgLoading.svg"
                    style={{ backgroundColor: "#eeeeee", height: "100%" }}
                    src={tile.largeThumbUrl || tile.thumbnailUrl}
                    debounce={1000} // Default is 300 (ms)
                    cache
                    error="/imgError.svg"
                    srcSet={
                      tile.smallThumbUrl +
                      " 600w, " +
                      tile.mediumThumbUrl +
                      " 850w, " +
                      tile.largeThumbUrl +
                      " 1300w"
                    }
                    sizes="(min-width: 960px) 1300px, (min-width: 640px) 850px, 600px"
                    alt={tile.title}
                    id={tile.artId}
                  />
                  <CardContent>
                    <Grid item xs={12} container>
                      <Grid item xs container direction="column">
                        <Grid item xs>
                          <Grid item xs>
                            <TextField
                              fullWidth
                              required
                              id="artTitle"
                              label="Titulo del arte"
                              variant="outlined"
                              value={tile.title}
                              onChange={(e) => {
                                // setTitle(e.target.value);
                                handleArtTitleEdit(e, tile);
                              }}
                            />
                          </Grid>
                          {tile.artType === "Foto" && (
                            <React.Fragment>
                              <Grid
                                item
                                container
                                xs={12}
                                style={{ paddingTop: 15, paddingBottom: 15 }}
                              >
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  style={{ textAlign: "left" }}
                                >
                                  <Typography
                                    style={{
                                      whiteSpace: "pre-line",
                                      fontSize: "1.3em",
                                    }}
                                  >
                                    {" "}
                                    Medida del archivo original{" "}
                                  </Typography>
                                </Grid>
                                {tile.originalPhotoWidth &&
                                  tile.originalPhotoHeight && (
                                    <Grid
                                      item
                                      container
                                      xs={12}
                                      sm={12}
                                      style={{ paddingTop: 15 }}
                                      justify="space-between"
                                    >
                                      <Grid item xs={5} sm={5}>
                                        <TextField
                                          variant="outlined"
                                          fullWidth
                                          id="originalPhotoWidth"
                                          label="Ancho"
                                          type="number"
                                          name="originalPhotoWidth"
                                          autoComplete="originalPhotoWidth"
                                          value={tile.originalPhotoWidth}
                                          onChange={(e) => {
                                            handleOriginalPhotoWidth(e, tile);
                                            if (e.target.value < 2000) {
                                              setSnackBarMessage(
                                                "La foto original debe tener un ancho mayor a 2.000 px."
                                              );
                                              setSnackBar(true);
                                            }
                                          }}
                                        />
                                      </Grid>
                                      <Typography style={{ paddingTop: 13 }}>
                                        {" "}
                                        x{" "}
                                      </Typography>
                                      <Grid item xs={5} sm={5}>
                                        <TextField
                                          variant="outlined"
                                          fullWidth
                                          type="number"
                                          id="originalPhotoHeight"
                                          label="Alto"
                                          name="originalPhotoHeight"
                                          autoComplete="originalPhotoHeight"
                                          value={tile.originalPhotoHeight}
                                          onChange={(e) => {
                                            handleOriginalPhotoHeight(e, tile);
                                            if (e.target.value < 2000) {
                                              setSnackBarMessage(
                                                "La foto original debe tener un alto mayor a 2.000 px."
                                              );
                                              setSnackBar(true);
                                            }
                                          }}
                                        />
                                      </Grid>
                                      <Typography
                                        style={{
                                          paddingTop: 13,
                                          paddingLeft: 2,
                                        }}
                                      >
                                        {" "}
                                        px{" "}
                                      </Typography>
                                    </Grid>
                                  )}
                                <Grid
                                  item
                                  container
                                  xs={12}
                                  sm={12}
                                  style={{ paddingTop: 15 }}
                                  justify="space-between"
                                >
                                  <Grid item xs={5} sm={5}>
                                    <TextField
                                      variant="outlined"
                                      fullWidth
                                      type="number"
                                      id="originalPhotoPpi"
                                      label="PPI"
                                      name="originalPhotoPpi"
                                      autoComplete="originalPhotoPpi"
                                      value={tile.originalPhotoPpi}
                                      onChange={(e) => {
                                        handleOriginalPhotoPpi(e, tile);
                                        if (e.target.value < 100) {
                                          setSnackBarMessage(
                                            "La foto original debe ser mayor a 100 ppi."
                                          );
                                          setSnackBar(true);
                                        }
                                      }}
                                    />
                                  </Grid>
                                  <Grid
                                    item
                                    xs={5}
                                    sm={6}
                                    style={{ paddingLeft: 0 }}
                                  >
                                    <FormControl
                                      variant="outlined"
                                      style={{ width: "100%" }}
                                    >
                                      <InputLabel
                                        id="originalPhotoIsoLabel"
                                        style={{ width: "100%" }}
                                      >
                                        ISO
                                      </InputLabel>
                                      <Select
                                        labelId="originalPhotoIsoLabel"
                                        id="originalPhotoIso"
                                        value={tile.originalPhotoIso}
                                        onChange={(e) => {
                                          handleOriginalPhotoIso(e, tile);
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
                              </Grid>
                              <Grid
                                item
                                container
                                xs={12}
                                justify="space-between"
                              >
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  style={{ textAlign: "left" }}
                                >
                                  <Typography
                                    style={{
                                      whiteSpace: "pre-line",
                                      fontSize: "1.3em",
                                    }}
                                  >
                                    {" "}
                                    Medida máxima para impresión:
                                  </Typography>
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  style={{ textAlign: "left" }}
                                >
                                  <Typography
                                    style={{
                                      whiteSpace: "pre-line",
                                      fontSize: "1.3em",
                                    }}
                                  >
                                    {" "}
                                    {maxPrintValues(tile)}{" "}
                                  </Typography>
                                </Grid>
                              </Grid>
                              <Grid item container xs={12}></Grid>
                            </React.Fragment>
                          )}
                          {/* <Grid item container xs={12} style={{marginBottom: 15}}>
                  <Grid item xs={4} sm={4}>
                    <Typography style={{whiteSpace: 'pre-line', padding: 15, fontSize: '0.7em'}}> Máximo para <br/> impresión (cm) </Typography>
                  </Grid>
                  <Grid item container xs={8} sm={8}>
                    <Grid item xs={5} sm={5}>
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="originalArtWidth"
                        label="Ancho"
                        name="originalArtWidth"
                        autoComplete="originalArtHeight"
                        value={tile.originalArtWidth}
                        onChange={(e)=> {handleArtOriginalWidthEdit(e, tile)}}
                      />
                    </Grid>
                      <Typography style={{padding: 10}}> x </Typography>
                    <Grid item xs={5} sm={5}>
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="originalArtHeight"
                        label="Alto"
                        name="originalArtHeight"
                        autoComplete="originalArtHeight"
                        value={tile.originalArtHeight}
                        onChange={(e)=> {handleArtOriginalHeightEdit(e, tile)}}
                      />
                    </Grid>
                  </Grid>
                </Grid> */}
                          <Grid
                            item
                            xs
                            style={{ marginBottom: 20, marginTop: 20 }}
                          >
                            <TextField
                              multiline
                              rows={2}
                              fullWidth
                              required
                              id="artDescription"
                              variant="outlined"
                              label="Descripción del arte"
                              value={tile.description}
                              onChange={(e) => {
                                handleArtDescriptionEdit(e, tile);
                              }}
                            />
                          </Grid>
                          {/* <Grid item xs={12} sm={12}>
                              <Autocomplete
                                multiple
                                id="tags-filled"
                                options={tile.tags.map((option) => option)}
                                defaultValue={tile.tags}
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
                                    { ...handleArtTagsEdit(value) }
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
                            </Grid> */}
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            style={{ marginBottom: 20, marginTop: 20 }}
                          >
                            <Autocomplete
                              multiple
                              freeSolo
                              id="tags-outlined"
                              options={tile.tags.map((tag) => tag)}
                              value={tile.tags}
                              renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                  <Chip
                                    onDelete={() => {
                                      const newTiles = [...tiles];
                                      newTiles.find(
                                        (item) => item.artId === tile.artId
                                      ).tags = tile.tags.filter(
                                        (tag) => tag !== option
                                      );
                                      setTiles(newTiles);
                                    }}
                                    variant="outlined"
                                    label={option}
                                  />
                                ))
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  variant="outlined"
                                  label="Etiquetas"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.target.value) {
                                      const newTiles = [...tiles];
                                      newTiles
                                        .find(
                                          (item) => item.artId === tile.artId
                                        )
                                        .tags.push(e.target.value);
                                      setTiles(newTiles);
                                    }
                                  }}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              variant="outlined"
                              fullWidth
                              id="artLocation"
                              label="Ubicación"
                              name="artLocation"
                              autoComplete="artLocation"
                              value={tile.artLocation}
                              onChange={(e) => handleArtLocationEdit(e, tile)}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    {/* <Button size="small" color="primary">
                Comparte
                </Button> */}
                    {JSON.parse(localStorage.getItem("token")) &&
                      JSON.parse(localStorage.getItem("token")).username && (
                        <Button
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            // updateArtData(e, tile.artId);
                            handleArtEdit(e, tile);
                          }}
                        >
                          Guardar
                        </Button>
                      )}
                  </CardActions>
                </Card>
              )
            )
          ) : (
            <p>Prueba prueba</p>
          )}
          {openArtFormDialog && (
            <ArtUploader
              openArtFormDialog={openArtFormDialog}
              setOpenArtFormDialog={setOpenArtFormDialog}
            />
          )}
          {JSON.parse(localStorage.getItem("token")) &&
            JSON.parse(localStorage.getItem("token")).username && (
              <Grid className={classes.float}>
                <FloatingAddButton
                  setOpenArtFormDialog={setOpenArtFormDialog}
                />
              </Grid>
            )}
          <Snackbar
            open={snackBar}
            autoHideDuration={2000}
            message={snackBarMessage}
            className={classes.snackbar}
            onClose={() => setSnackBar(false)}
          />
        </div>
        <Modal
          xl={800}
          lg={800}
          md={480}
          sm={360}
          xs={360}
          open={termsAgreeVar === false}
          onClose={termsAgreeVar === true}
        >
          <div className={classes.paper2}>
            <h2 style={{ textAlign: "center", fontWeight: "Normal" }}>
              Hemos actualizado nuestros términos y condiciones y queremos que
              estés al tanto.
            </h2>
            <div>
              <div data-color-mode="light">
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "12px",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                  }}
                >
                  CONVENIO DE RELACIÓN ENTRE LOS ARTISTAS Y LA COMPAÑÍA
                </div>
                <div data-color-mode="light">
                  <MDEditor.Markdown
                    source={value}
                    style={{ textAlign: "justify" }}
                  />
                </div>
              </div>
            </div>
            <div style={{ justifyContent: "center", display: "flex" }}>
              <Button
                onClick={(e) => {
                  handleSubmit(
                    e,
                    JSON.parse(localStorage.getItem("token")).username
                  );
                }}
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submit}
                required
              >
                Acepto los nuevos términos y condiciones
              </Button>
            </div>
          </div>
        </Modal>
      </Container>
    </>
  );
}
