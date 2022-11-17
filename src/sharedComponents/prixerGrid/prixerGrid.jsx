import React, { useState, useEffect } from "react";
import { useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import { useHistory } from "react-router-dom";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import utils from "../../utils/utils";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    // maxWidth: "70%",
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: "100%",
    height: "auto",
  },
  img: {
    width: "100%",
    height: "100%",
  },
  icon: {
    color: "rgba(255, 255, 255, 0.54)",
  },
  cardGrid: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    paddingTop: "81.25%",
    borderRadius: "50%",
    margin: "28px",
  },
  cardContent: {
    flexGrow: 1,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function PrixerGrid(props) {
  const theme = useTheme();
  const classes = useStyles();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));
  const [tiles, setTiles] = useState([]);
  const history = useHistory();
  const [backdrop, setBackdrop] = useState(true);

  useEffect(() => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/prixer/read-all-full-v2";

    axios.get(base_url).then((response) => {
      setTiles(utils.shuffle(response.data.prixers));
      setBackdrop(false);
    });
  }, []);

  return (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container spacing={1}>
        {tiles &&
          tiles
            .filter((tile) => tile.avatar) //quitar?
            .map(
              (tile) =>
                tile.status && (
                  // isDesktop ? (
                  <Grid item key={tile._id} xs={6} sm={6} md={3}>
                    <Card className={classes.card}>
                      <CardMedia
                        alt={tile.title}
                        height="100"
                        image={tile.avatar}
                        className={classes.cardMedia}
                        title={tile.title}
                      />
                      <CardContent className={classes.cardContent}>
                        <Typography gutterBottom variant="h5" component="h2">
                          {tile.firstName} {tile.lastName}
                        </Typography>
                        <Typography
                          gutterBottom
                          variant="h6"
                          component="h6"
                          style={{ fontSize: 16 }}
                        >
                          {tile.username} -
                          {tile.specialty ||
                            tile.specialtyArt?.map((specialty, index) =>
                              tile.specialtyArt?.length === index + 1
                                ? specialty
                                : `${specialty}, `
                            )}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          color="primary"
                          onClick={(e) =>
                            history.push({ pathname: "/" + tile.username })
                          }
                        >
                          Explorar
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                )
            )}
      </Grid>
    </div>
  );
}
