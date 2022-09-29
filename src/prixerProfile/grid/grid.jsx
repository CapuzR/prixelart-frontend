//[]      17. Búsqueda de Prixers.
//[]      21. Términos y condiciones.
//[]      16. Filtros para las búsquedas (Por etiqueta).
//[]      25. Editar datos de la imagen en la tarjeta del grid grande.

import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import axios from "axios";
import { useHistory } from "react-router-dom";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Img from "react-cool-img";

import utils from "../../utils/utils";
import SearchBar from "../../sharedComponents/searchBar/searchBar.jsx";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    // maxWidth: 850,
    paddingTop: 15,
  },
  img: {
    [theme.breakpoints.down("sm")]: {
      maxHeight: 180,
    },
    [theme.breakpoints.up("sm")]: {
      minHeight: 300,
      maxHeight: 450,
    },
    [theme.breakpoints.up("lg")]: {
      minHeight: 350,
      maxHeight: 450,
    },
    [theme.breakpoints.up("xl")]: {
      minHeight: 450,
      maxHeight: 450,
    },
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
  const [backdrop, setBackdrop] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

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
    } else if (searchValue) {
      const base_url = process.env.REACT_APP_BACKEND_URL + "/art/read-by-query";
      const params = {
        text: searchValue,
      };
      axios.get(base_url, { params }).then((response) => {
        setTiles(utils.shuffle(response.data.arts));
        setBackdrop(false);
      });
    } else {
      const base_url = process.env.REACT_APP_BACKEND_URL + "/art/read-all";
      axios.get(base_url).then((response) => {
        setTiles(utils.shuffle(response.data.arts));
        setBackdrop(false);
      });
    }
  }, [searchValue]);

  const handleFullImage = (e, tile) => {
    history.push({
      pathname: "/" + tile.prixerUsername + "/art/" + e.target.id,
    });
  };

  const searchPhotos = (e, queryValue) => {
    setSearchValue(queryValue);
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
      history.push({ pathname: "/galeria/s?name=" + queryValue });
    }
    e.preventDefault();
  };

  return (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <SearchBar
          searchPhotos={searchPhotos}
          searchValue={3}
          setSearchValue={setSearchValue}
        />
      </div>
      <GridList
        cellSize={"auto"}
        className={classes.gridList}
        cols={isDesktop ? 4 : 2}
      >
        {tiles ? (
          tiles.map((tile) => (
            <GridListTile
              style={{ width: isDesktop ? "300px" : "50%" }}
              key={tile.artId}
              cols={1}
              onClick={(e) => {
                handleFullImage(e, tile);
              }}
              className={classes.img}
            >
              <Img
                placeholder="/imgLoading.svg"
                style={{ backgroundColor: "#eeeeee", height: "100%" }}
                src={tile.squareThumbUrl}
                debounce={1000}
                cache
                error="/imgError.svg"
                // srcSet={tile.smallThumbUrl + ' 600w, ' + tile.mediumThumbUrl + ' 850w, ' + tile.largeThumbUrl + ' 1300w'}
                // sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 400px, 200px"
                sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 200px, (min-width: 375px) 80px"
                alt={tile.title}
                id={tile.artId}
              />
            </GridListTile>
          ))
        ) : (
          <h1>Pronto encontrarás todo el arte que buscas.</h1>
        )}
      </GridList>
    </div>
  );
}
