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
import { Button } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import TextField from "@material-ui/core/TextField";
// import validations from "../../shoppingCart/validations";
import SaveIcon from "@material-ui/icons/Save";
import Fab from "@material-ui/core/Fab";

import { nanoid } from "nanoid";

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
  paper2: {
    position: "fixed",
    right: "40%",
    top: "38%",
    bottom: "37%",
    left: "40%",
    width: 310,
    backgroundColor: "white",
    boxShadow: theme.shadows[2],
    padding: "16px 32px 24px",
    textAlign: "justify",
    minWidth: 320,
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
  },
}));

export default function Prixers(props) {
  const classes = useStyles();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [tiles, setTiles] = useState([]);
  const [backdrop, setBackdrop] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  // const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));
  const [state, setState] = useState({
    checkedA: true,
  });
  const [openNewBalance, setOpenNewBalance] = useState(false);
  const [selectedPrixer, setSelectedPrixer] = useState();
  const [balance, setBalance] = useState(0);
  const [message, setMessage] = useState();
  const [open, setOpen] = useState(false);
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
    const body = {
      status:
        e.target.value === "false" || e.target.value === "" ? true : false,
      adminToken: localStorage.getItem("adminTokenV"),
    };
    const response = await axios.put(base_url, body, {
      "Content-Type": "multipart/form-data",
    });
    await readPrixers();
    setLoading(false);
  };

  useEffect(() => {
    readPrixers();
  }, []);

  const openNewAccount = () => {
    const data = {
      _id: nanoid(24),
      balance: balance || 0,
      email: selectedPrixer.email,
    };
    const base_url = process.env.REACT_APP_BACKEND_URL + "/account/create";
    axios.post(base_url, data, {
      "Content-Type": "multipart/form-data",
    });
    setOpen(true);
    setMessage("Cartera creada y balance actualizado exitosamente.");
    handleClose();
    setSelectedPrixer();
    setBalance(0);
  };

  const handleClose = () => {
    setOpenNewBalance(false);
  };

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
                            tile.specialtyArt?.map(
                              (specialty, index) =>
                                specialty !== "" &&
                                (tile.specialtyArt?.length === index + 1
                                  ? specialty
                                  : `${specialty}, `)
                            )}
                        </Typography>
                      </CardContent>
                      {tile.account ? (
                        <Typography>{tile.account}</Typography>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          style={{
                            width: 160,
                            alignSelf: "center",
                            fontWeight: "bold",
                          }}
                          onClick={(e) => {
                            // openNewAccount(tile);
                            setSelectedPrixer(tile);
                            setOpenNewBalance(true);
                          }}
                        >
                          Crear Cartera
                        </Button>
                      )}
                      {props.permissions?.prixerBan && (
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
                      )}
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
                      {props.permissions?.prixerBan && (
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
                      )}
                    </Card>
                  </Grid>
                )
              )}
        </Grid>
      </Paper>
      <Modal open={openNewBalance}>
        <Grid container className={classes.paper2}>
          <Grid
            item
            style={{
              width: "100%",
              display: "flex",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "100%",

                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography>
                Balance de
                {selectedPrixer?.firstName + " " + selectedPrixer?.lastName}:
              </Typography>

              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </div>
          </Grid>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <TextField
              variant="outlined"
              value={props.dollarValue}
              onChange={(e) => {
                setBalance(e.target.value);
              }}
              type={"number"}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                openNewAccount();
              }}
              style={{ marginRight: 10, marginLeft: 10, marginTop: 5 }}
            >
              Guardar
            </Button>
          </div>
        </Grid>
      </Modal>
      <Snackbar
        open={open}
        autoHideDuration={1000}
        message={message}
        className={classes.snackbar}
      />
    </div>
  );
}
