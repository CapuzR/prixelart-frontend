import { React, useState, useEffect } from "react";
import axios from "axios";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Snackbar from "@material-ui/core/Snackbar";
import Backdrop from "@material-ui/core/Backdrop";
import PrixerGrid from "../../../sharedComponents/prixerGrid/prixerGrid";

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
    padding: theme.spacing(2),
    margin: "15px",
  },
  snackbar: {
    [theme.breakpoints.down("xs")]: {
      bottom: 90,
    },
    margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      width: "25ch",
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function Prixers() {
  const classes = useStyles();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [tiles, setTiles] = useState([]);
  const [backdrop, setBackdrop] = useState(true); // borrar
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  //   const readPrixers = async () => {
  //     const base_url = process.env.REACT_APP_BACKEND_URL + "/prixers/read-all";
  //     const res = await axios
  //       .get(base_url)
  //       .then((response) => {
  //         setTiles(response.data.prixers);
  //         setBackdrop(false);
  //       })
  //       .catch((error) => console.log(error));
  //   };
  //   useEffect(() => {
  //     readPrixers();
  //   }, []);

  return (
    <div>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress />
      </Backdrop>
      <Paper className={classes.paper}>
        <AppBar position="static">
          <Typography
            style={{
              display: "flex",
              alignContent: "center",
              padding: "10px 40px",
            }}
            variant="h6"
            className={classes.title}
          >
            Prixers
          </Typography>
        </AppBar>

        <Grid
          container
          spacing={2}
          style={{
            padding: isMobile ? "0px" : "18px",
            display: "flex",
            textAlign: "start",
          }}
        >
          <PrixerGrid />
        </Grid>
      </Paper>
    </div>
  );
}
