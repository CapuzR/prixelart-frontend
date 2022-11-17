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
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import utils from "../../../utils/utils";
import logo from "../../../logo.svg";

const useStyles = makeStyles((theme) => ({
  loading: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
    marginLeft: "50vw",
    marginTop: "50vh",
  },
  cardMedia: {
    paddingTop: "81.25%",
    borderRadius: "50%",
    margin: "28px",
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardContent: {
    flexGrow: 1,
    marginTop: -10,
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
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  // const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));
  const [state, setState] = useState({
    checkedA: true,
  });

  const readPrixers = async () => {
    try {
      setLoading(true);
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/prixer/read-all-full";

      const response = await axios.get(base_url);
      setTiles(response.data.prixers);
      setBackdrop(false);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  }; //Switch

  const ChangeVisibility = async (e, GetId) => {
    e.preventDefault();
    setLoading(true);
    setState({ ...state, [e.target.name]: e.target.checked });

    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/prixer/update-home/" + GetId;
    const response = await axios.put(
      base_url,
      {
        status:
          e.target.value === "false" || e.target.value === "" ? true : false,
      },
      {
        "Content-Type": "multipart/form-data",
      }
    );
    await readPrixers();
    // console.log(response);
    setLoading(false);
  };

  useEffect(() => {
    readPrixers();
  }, []);

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
          {tiles &&
            tiles
              // .filter((tile) => tile.avatar)
              .map((tile, key_id) =>
                isDesktop ? (
                  <Grid item xs={6} sm={6} md={3}>
                    <Card key={tile._id} className={classes.card}>
                      <CardMedia
                        alt={tile.title}
                        height="100"
                        width="100"
                        image={tile.avatar || "/PrixLogo.png"}
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
                      <Box
                        style={{
                          display: "flex",
                          justifyContent: "end",
                        }}
                        label="Visible"
                      >
                        <Typography
                          color="secondary"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          Visible
                        </Typography>
                        <Switch
                          checked={tile.status}
                          color="primary"
                          onChange={
                            // handleChange
                            (event) =>
                              handleChange(event, tile.state) ||
                              ChangeVisibility(event, tile.prixerId)
                          }
                          name="checkedA"
                          value={tile.status}
                          inputProps={{
                            "aria-label": "secondary checkbox",
                          }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                ) : (
                  <Grid item xs={12} sm={4} md={4}>
                    <Card key={tile._id} className={classes.card}>
                      <CardMedia
                        alt={tile.title}
                        height="100"
                        image={tile.avatar || "/PrixLogo.png"}
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
                          {tile.username} - {tile.specialty}
                        </Typography>
                      </CardContent>
                      <Box
                        style={{
                          display: "flex",
                          justifyContent: "end",
                        }}
                        label="Visible"
                      >
                        <Typography
                          color="secondary"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          Visible
                        </Typography>
                        <Switch
                          checked={tile.status}
                          color="primary"
                          onChange={
                            // handleChange
                            (event) => ChangeVisibility(event, tile.prixerId)
                          }
                          name="checkedA"
                          // defaultValue={tile.status}
                          // defaultChecked={tile.status}
                          value={tile.status}
                          inputProps={{
                            "aria-label": "secondary checkbox",
                          }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                )
              )}
        </Grid>
      </Paper>
    </div>
  );
}
