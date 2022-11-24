//[]      17. Búsqueda de Prixers.
//[]      16. Filtros para las búsquedas (Por etiqueta).

import React, { useState, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import axios from "axios";
import { useHistory } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Img from "react-cool-img";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import utils from "../../utils/utils";
import SearchBar from "../../sharedComponents/searchBar/searchBar.jsx";

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
    marginBottom: "20px",
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
}));

export default function Grid(props) {
  const classes = useStyles();
  const [tiles, setTiles] = useState([]);
  const history = useHistory();
  let globalParams = new URLSearchParams(window.location.search);
  const [searchValue, setSearchValue] = useState(
    globalParams.get("name") || null
  );
  const [categoryValue, setCategoryValue] = useState(
    globalParams.get("categorie") || null
  );
  const [backdrop, setBackdrop] = useState(true);
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [snackBar, setSnackBar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState(false);
  const [selectedArt, setSelectedArt] = useState(undefined);
  const [open, setOpen] = useState(false);
  const [openV, setOpenV] = useState(false);
  const [disabledReason, setDisabledReason] = useState("");
  const [visible, setVisible] = useState(true);
  const [visibles, setVisibles] = useState([]);
  const [artTagsI, setArtTagsI] = useState([]);

  const handleClickVisible = () => {
    setOpenV(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedArt(undefined);
  };
  const handleCloseVisible = () => {
    setOpenV(false);
    setSelectedArt(undefined);
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
      setSelectedArt(undefined);
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
  };

  useEffect(() => {
    if (props.prixerUsername || globalParams.get("prixer")) {
      if (searchValue) {
        const base_url =
          process.env.REACT_APP_BACKEND_URL + "/art/read-by-username-by-query";
        const params = {
          text: searchValue,
          username: props.prixerUsername || globalParams.get("prixer"),
        };
        axios.get(base_url, { params }).then((response) => {
          setTiles(utils.shuffle(response.data.arts));
          response.data.arts.map((bool) =>
            visibles.push({
              id: bool.artId,
              visible: bool.visible,
            })
          );
          setBackdrop(false);
        });
      } else {
        const base_url =
          process.env.REACT_APP_BACKEND_URL + "/art/read-by-prixer";
        const body = {
          username: props.prixerUsername || globalParams.get("prixer"),
        };
        axios.post(base_url, body).then((response) => {
          setTiles(utils.shuffle(response.data.arts));
          setBackdrop(false);
        });
      }
    } else if (searchValue && categoryValue) {
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/art/read-by-query-and-category";
      const params = {
        text: searchValue,
        category: categoryValue,
      };
      axios.get(base_url, { params }).then((response) => {
        setTiles(utils.shuffle(response.data.arts));
        setBackdrop(false);
      });
    } else if (searchValue) {
      const base_url = process.env.REACT_APP_BACKEND_URL + "/art/read-by-query";
      const params = {
        text: searchValue,
      };
      axios.get(base_url, { params }).then((response) => {
        setTiles(utils.shuffle(response.data.arts));
        setBackdrop(false);
      });
    } else if (categoryValue) {
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/art/read-by-category";
      const params = {
        category: categoryValue,
      };
      axios.get(base_url, { params }).then((response) => {
        setTiles(utils.shuffle(response.data.arts));
        setBackdrop(false);
      });
    } else {
      const base_url = process.env.REACT_APP_BACKEND_URL + "/art/read-all";
      axios.get(base_url).then((response) => {
        setTiles(response.data.arts);
        // getTags(response);
        setBackdrop(false);
      });
    }
  }, [searchValue, categoryValue]);

  const getTags = (response) => {
    const readedArts = response.data.arts;
    const filter = readedArts.filter((arts) => {
      const artTags = arts.tags[0];
      let collection = [].push(artTags);
      return collection;
    });
    console.log(filter);
  };

  const handleFullImage = (e, tile) => {
    history.push({
      pathname: "/" + tile.prixerUsername + "/art/" + e.target.id,
    });
  };

  const searchPhotos = (e, queryValue, categories) => {
    setSearchValue(queryValue);
    setCategoryValue(categories);
    if (props.prixerUsername || globalParams.get("prixer")) {
      if (globalParams.get("prixer")) {
        history.push({
          pathname:
            "/galeria/s?prixer=" +
            globalParams.get("prixer") +
            "&name=" +
            queryValue,
        });
      } else {
        history.push({
          pathname:
            "/galeria/s?prixer=" + props.prixerUsername + "&name=" + queryValue,
        });
      }
    } else {
      if (queryValue == null) {
        history.push({
          pathname: "/galeria/s?categorie=" + categories,
        });
      } else if (categories !== "") {
        history.push({
          pathname:
            "/galeria/s?categorie=" + categories + "&name=" + queryValue,
        });
      } else {
        history.push({ pathname: "/galeria/s?name=" + queryValue });
      }
    }
    e.preventDefault();
  };

  const msnry = new Masonry(".grid", {
    columnWidth: 200,
    itemSelector: ".grid-item",
  });
  return (
    <>
      <div className={classes.root}>
        <Backdrop className={classes.backdrop} open={backdrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <SearchBar
            searchPhotos={searchPhotos}
            searchValue={3}
            setSearchValue={setSearchValue}
          />
        </div>
      </div>
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1080: 4 }}
      >
        <Masonry style={{ columnGap: "7px" }}>
          {tiles ? (
            tiles.map((tile) =>
              tile.visible ? (
                <div>
                  {JSON.parse(localStorage.getItem("adminToken")) &&
                  tile.visible ? (
                    <Button
                      size="small"
                      color="primary"
                      variant="contained"
                      style={{
                        position: "absolute",
                        marginTop: "10px",
                        marginLeft: "10px",
                        color: "#fff",
                      }}
                      disabled
                    >
                      <Typography
                        style={{
                          opacity: 0.5,
                          fontSize: "0.8rem",
                          fontWeight: 100,
                        }}
                      >
                        Puntos: {tile.points}
                      </Typography>
                    </Button>
                  ) : (
                    ""
                  )}
                  <Img
                    onClick={(e) => {
                      handleFullImage(e, tile);
                    }}
                    placeholder="/imgLoading.svg"
                    style={{
                      backgroundColor: "#eeeeee",
                      width: "100%",
                      marginBottom: "7px",
                      borderRadius: "4px",
                      // objectFit: "cover",
                    }}
                    src={tile.squareThumbUrl}
                    debounce={1000}
                    cache
                    error="/imgError.svg"
                    // srcSet={tile.smallThumbUrl + ' 600w, ' + tile.mediumThumbUrl + ' 850w, ' + tile.largeThumbUrl + ' 1300w'}
                    // sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 400px, 200px"
                    // sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 200px, (min-width: 375px) 80px"
                    alt={tile.title}
                    id={tile.artId}
                    key={tile.artId}
                  />
                  {JSON.parse(localStorage.getItem("adminToken")) && (
                    <IOSSwitch
                      color="primary"
                      size="normal"
                      checked={tile.visible}
                      onChange={(e) => {
                        if (e.target.checked === false) {
                          handleClickVisible();
                          setSelectedArt(tile.artId);
                          setVisible(e.target.checked);
                        } else {
                          setVisibleArt(tile, tile.artId, e);
                          setVisible(e.target.checked);
                        }
                      }}
                    />
                  )}
                  <Dialog
                    open={selectedArt === tile.artId}
                    onClose={handleCloseVisible}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-title">
                      {"¿Estás seguro de ocultar este arte?"}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText
                        id="alert-dialog-description"
                        style={{
                          textAlign: "center",
                        }}
                      >
                        Este arte ya no será visible en tu perfil y la página de
                        inicio.
                      </DialogContentText>
                    </DialogContent>
                    <div
                      item
                      xs={12}
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
                        id="disabledReason"
                        label="¿Por qué quieres ocultar este arte?"
                        variant="outlined"
                        onChange={(e) => {
                          setDisabledReason(e.target.value);
                        }}
                      />
                    </div>
                    <DialogActions>
                      <Button onClick={handleCloseVisible} color="primary">
                        Cancelar
                      </Button>
                      <Button
                        onClick={(e) => {
                          setVisibleArt(tile, selectedArt, e);
                          setSelectedArt(undefined);
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
                </div>
              ) : (
                JSON.parse(localStorage.getItem("adminToken")) && (
                  <div>
                    <Img
                      onClick={(e) => {
                        handleFullImage(e, tile);
                      }}
                      placeholder="/imgLoading.svg"
                      style={{
                        backgroundColor: "#eeeeee",
                        width: "100%",
                        marginBottom: "7px",
                        borderRadius: "4px",
                        // objectFit: "cover",
                      }}
                      src={tile.squareThumbUrl}
                      debounce={1000}
                      cache
                      error="/imgError.svg"
                      // srcSet={tile.smallThumbUrl + ' 600w, ' + tile.mediumThumbUrl + ' 850w, ' + tile.largeThumbUrl + ' 1300w'}
                      // sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 400px, 200px"
                      // sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 200px, (min-width: 375px) 80px"
                      alt={tile.title}
                      id={tile.artId}
                      key={tile.artId}
                    />
                    {JSON.parse(localStorage.getItem("adminToken")) && (
                      <IOSSwitch
                        color="primary"
                        size="normal"
                        onChange={(e) => {
                          if (e.target.checked === false) {
                            setVisible(e.target.checked);
                            setSelectedArt(tile.artId);
                          } else {
                            setVisible(e.target.checked);
                            setVisibleArt(tile, tile.artId, e);
                          }
                        }}
                      ></IOSSwitch>
                    )}
                  </div>
                )
              )
            )
          ) : (
            <h1>Pronto encontrarás todo el arte que buscas.</h1>
          )}
        </Masonry>
      </ResponsiveMasonry>
    </>
  );
}
