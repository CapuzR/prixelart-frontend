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
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Modal from "@material-ui/core/Modal";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import DehazeIcon from "@material-ui/icons/Dehaze";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { nanoid } from "nanoid";
import Toolbar from "@material-ui/core/Toolbar";
import { SelectAllOutlined } from "@material-ui/icons";

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
  paper1: {
    position: "absolute",
    width: 800,
    maxHeight: "90%",
    overflowY: "auto",
    right: "33%",
    top: "10%",
    left: "25%",
    backgroundColor: "white",
    boxShadow: theme.shadows[2],
    padding: "16px 32px 24px",
    textAlign: "justify",
    minWidth: 320,
    borderRadius: 10,
  },
  paper2: {
    position: "fixed",
    right: "30%",
    top: "38%",
    bottom: "37%",
    left: "40%",
    width: 300,
    backgroundColor: "white",
    boxShadow: theme.shadows[2],
    padding: "16px 32px 24px",
    textAlign: "justify",
    minWidth: 320,
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
  },
  paper3: {
    position: "fixed",
    right: "40%",
    top: "38%",
    bottom: "37%",
    left: "22%",
    width: 800,
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
  const [value, setValue] = useState(0);

  const [loading, setLoading] = useState(false);
  const [tiles, setTiles] = useState([]);
  const [org, setOrg] = useState([]);

  const [backdrop, setBackdrop] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  // const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));
  const [state, setState] = useState({
    checkedA: true,
  });
  const [openNewBalance, setOpenNewBalance] = useState(false);
  const [openNewMovement, setOpenNewMovement] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [selectedPrixer, setSelectedPrixer] = useState(undefined);
  const [balance, setBalance] = useState(0);
  const [type, setType] = useState();
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState();
  const [accounts, setAccounts] = useState();
  const [movements, setMovements] = useState();
  const [message, setMessage] = useState();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleSection = (event, newValue) => {
    setValue(newValue);
  };

  const readPrixers = async () => {
    try {
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/prixer/read-all-full";

      const response = await axios.get(base_url);
      setTiles(response.data.prixers);
    } catch (error) {
      console.log(error);
    }
  };

  const readOrg = async () => {
    try {
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/organization/read-all-full";

      const response = await axios.get(base_url);
      setOrg(response.data.organizations);
    } catch (error) {
      console.log(error);
    }
  };

  const getBalance = () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/account/readAll";
    axios
      .post(base_url, {
        adminToken: localStorage.getItem("adminTokenV"),
      })
      .then((res) => {
        setAccounts(res.data.accounts);
      });
  };

  const getMovements = async (account) => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/movement/readByPrixer";
    axios
      .post(base_url, {
        adminToken: localStorage.getItem("adminTokenV"),
        _id: account,
      })
      .then((res) => {
        setMovements(res.data.movements);
      });
  };

  useEffect(() => {
    setLoading(true);

    readPrixers();
    readOrg();
    getBalance();
    setBackdrop(false);
    setLoading(false);
  }, []);

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  }; //Switch

  const ChangeVisibility = async (e, prixer) => {
    e.preventDefault();
    setLoading(true);
    setState({ ...state, [e.target.name]: e.target.checked });

    const base_url =
      process.env.REACT_APP_BACKEND_URL +
      "/prixer/update-home/" +
      prixer.prixerId;
    const body = {
      status:
        e.target.value === "false" || e.target.value === "" ? true : false,
      adminToken: localStorage.getItem("adminTokenV"),
      account: prixer?.account,
    };
    await axios.put(base_url, body);
    await readPrixers();
    setLoading(false);
  };

  const openNewAccount = () => {
    let ID;
    const data = {
      _id: nanoid(24),
      balance: 0,
      email: selectedPrixer.email,
      adminToken: localStorage.getItem("adminTokenV"),
    };
    const base_url = process.env.REACT_APP_BACKEND_URL + "/account/create";
    axios.post(base_url, data).then((response) => {
      if (response.status === 200 && balance > 0) {
        ID = response.data.createAccount.newAccount._id;
        const data2 = {
          _id: nanoid(),
          createdOn: new Date(),
          createdBy: JSON.parse(localStorage.getItem("adminToken")).username,
          date: date,
          destinatary: ID,
          description: "Saldo inicial",
          type: "Depósito",
          value: balance,
          adminToken: localStorage.getItem("adminTokenV"),
        };
        const base_url2 =
          process.env.REACT_APP_BACKEND_URL + "/movement/create";
        axios.post(base_url2, data2);
      }
    });

    setOpen(true);
    setMessage("Cartera creada y balance actualizado exitosamente.");
    handleClose();
    setSelectedPrixer();
    setBalance(0);
    setTimeout(() => {
      readPrixers();
      getBalance();
    }, 1000);
  };

  const createPayMovement = () => {
    const data = {
      _id: nanoid(),
      createdOn: new Date(),
      createdBy: JSON.parse(localStorage.getItem("adminToken")).username,
      date: date,
      destinatary: selectedPrixer.account,
      description: description,
      type: type,
      value: balance,
      adminToken: localStorage.getItem("adminTokenV"),
    };
    const url = process.env.REACT_APP_BACKEND_URL + "/movement/create";
    axios.post(url, data);
    setOpen(true);
    setMessage("Balance actualizado exitosamente.");
    handleClose();
    setSelectedPrixer();
    setBalance(0);
    setTimeout(() => {
      readPrixers();
      getBalance();
    }, 1000);
  };

  const handleClose = () => {
    setOpenNewBalance(false);
    setOpenNewMovement(false);
    setOpenList(false);
    setBalance(0);
    setSelectedPrixer();
    setDate();
    setDescription();
    setMovements();
    setAnchorEl(null);
  };

  function TabPanel(props) {
    const { children, value, index } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  if (movements) {
    const july = movements.filter(
      (mov) =>
        mov.date?.substring(5, 7) === "07" ||
        mov.createdOn.substring(5, 7) === "07"
    );
    let comissions = [];
    july.map(
      (mov) =>
        mov.description.substring(0, 20) === "Comisión de la orden" &&
        comissions.push(mov.value)
    );
    console.log(
      comissions?.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      )
    );
  }

  const TurnIntoOrg = async (event, user) => {
    const url = process.env.REACT_APP_BACKEND_URL + "/turn-to-association";
    const data = { username: user };
    const call = await axios.post(url, data);
    if (call.data.success) {
      setOpen(true);
      setMessage("Rol modificado a Organización.");
      let prev = tiles.filter((tile) => tile.username !== user);
      setTiles(prev);
    }
  };

  const TurnIntoPrixer = async (event, user) => {
    const url = process.env.REACT_APP_BACKEND_URL + "/turn-to-prixer";
    const data = { username: user };
    const call = await axios.post(url, data);
    if (call.data.success) {
      setOpen(true);
      setMessage("Rol modificado a Prixer.");
      let prev = org.filter((o) => o.username !== user);
      if (prev[0] === null) {
        setOrg([]);
      } else {
        setOrg(prev);
      }
    }
  };

  const addrole = async () => {
    const url = process.env.REACT_APP_BACKEND_URL + "/prixers/addRole";

    await axios.put(url);
    setOpen(true);
    setMessage("Rol de Prixer agregado a todos los usuarios.");
  };

  function handleKeyDown(event) {
    if (event.key === "*") {
      addrole();
    } else return;
  }
  document.addEventListener("keydown", handleKeyDown);

  return (
    <div>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress />
      </Backdrop>
      <Paper className={classes.paper}>
        <Tabs
          value={value}
          onChange={handleSection}
          style={{ width: "70%" }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Prixers" />
          <Tab label="Asociaciones" />
        </Tabs>
        <TabPanel value={value} index={0}>
          <Grid
            container
            spacing={2}
            style={{
              padding: isMobile ? "0px" : "18px",
              display: "flex",
              textAlign: "start",
            }}
          >
            {tiles.length > 0 ? (
              tiles.map((tile) =>
                tile === selectedPrixer ? (
                  <Grid item xs={6} sm={6} md={3}>
                    <Card key={tile?._id} className={classes.card}>
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "end",
                          marginBottom: "-25px",
                        }}
                      >
                        <IconButton
                          aria-controls="simple-menu"
                          aria-haspopup="true"
                          onClick={(e) => {
                            setSelectedPrixer(undefined);
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </div>

                      <CardContent className={classes.cardContent}>
                        <Typography gutterBottom variant="h5" component="h2">
                          {tile?.firstName} {tile?.lastName}
                        </Typography>
                        {props.permissions?.setPrixerBalance && (
                          <Box
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              color="secondary"
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              Cambiar a Organización
                            </Typography>
                            <Switch
                              color="primary"
                              onChange={(event) =>
                                TurnIntoOrg(event, tile?.username)
                              }
                              name="checkedA"
                              inputProps={{
                                "aria-label": "secondary checkbox",
                              }}
                            />
                          </Box>
                        )}
                        {props.permissions?.prixerBan && (
                          <Box
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              color="secondary"
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              Visible
                            </Typography>
                            <Switch
                              checked={tile?.status}
                              color="primary"
                              onChange={(event) =>
                                handleChange(event, tile?.state) ||
                                ChangeVisibility(event, tile)
                              }
                              name="checkedA"
                              value={tile?.status}
                              inputProps={{
                                "aria-label": "secondary checkbox",
                              }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ) : (
                  <Grid item xs={6} sm={6} md={3}>
                    <Card key={tile?._id} className={classes.card}>
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "end",
                          marginBottom: "-50px",
                        }}
                      >
                        <IconButton
                          aria-controls="simple-menu"
                          aria-haspopup="true"
                          onClick={(e) => {
                            setSelectedPrixer(tile);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </div>
                      <CardMedia
                        alt={tile?.title}
                        height="100"
                        width="100"
                        image={tile?.avatar || "/PrixLogo.png"}
                        className={classes.cardMedia}
                        title={tile?.title}
                        style={{
                          opacity: tile.status === true ? "100%" : "50%",
                        }}
                      />
                      <CardContent className={classes.cardContent}>
                        <Typography gutterBottom variant="h5" component="h2">
                          {tile?.firstName} {tile?.lastName}
                        </Typography>
                        <Typography
                          gutterBottom
                          variant="h6"
                          component="h6"
                          style={{ fontSize: 16 }}
                        >
                          {tile?.username} -
                          {tile?.specialty ||
                            tile?.specialtyArt?.map(
                              (specialty, index) =>
                                specialty !== "" &&
                                (tile?.specialtyArt?.length === index + 1
                                  ? specialty
                                  : `${specialty}, `)
                            )}
                        </Typography>
                      </CardContent>
                      {tile?.account !== undefined &&
                      props.permissions?.setPrixerBalance ? (
                        <div
                          style={{
                            borderStyle: "solid",
                            borderWidth: "thin",
                            borderRadius: "10px",
                            borderColor: "#e5e7e9",
                            margin: "5px",
                            paddingBottom: "5px",
                          }}
                        >
                          <Typography variant="h6" align="center">
                            Balance $
                            {accounts &&
                              accounts
                                ?.find((acc) => acc._id === tile?.account)
                                ?.balance.toLocaleString("de-DE", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                          </Typography>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-evenly",
                            }}
                          >
                            <Button
                              onClick={(e) => {
                                setSelectedPrixer(tile);
                                setType("Depósito");
                                setOpenNewMovement(true);
                              }}
                              style={{
                                width: "40%",
                                backgroundColor: "#e5e7e9",
                              }}
                            >
                              Depósito
                            </Button>
                            <Button
                              onClick={(e) => {
                                setSelectedPrixer(tile);
                                setType("Retiro");
                                setOpenNewMovement(true);
                              }}
                              style={{
                                width: "40%",
                                backgroundColor: "#e5e7e9",
                              }}
                            >
                              Retiro
                            </Button>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "center",
                              textTransform: "lowercase",
                              marginTop: 5,
                            }}
                          >
                            <Button
                              onClick={() => {
                                setSelectedPrixer(tile);
                                getMovements(tile?.account);
                                setOpenList(true);
                              }}
                            >
                              <DehazeIcon />
                              Detalles
                            </Button>
                          </div>
                        </div>
                      ) : (
                        props.permissions?.setPrixerBalance && (
                          <Button
                            variant="contained"
                            color="primary"
                            style={{
                              width: 160,
                              alignSelf: "center",
                              fontWeight: "bold",
                            }}
                            onClick={(e) => {
                              setSelectedPrixer(tile);
                              setOpenNewBalance(true);
                            }}
                          >
                            Crear Cartera
                          </Button>
                        )
                      )}
                    </Card>
                  </Grid>
                )
              )
            ) : (
              <Typography
                variant="h6"
                color="secondary"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 20,
                  marginBottom: 20,
                }}
              >
                No se han cargado los Prixers aún.
              </Typography>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Grid
            container
            spacing={2}
            style={{
              padding: isMobile ? "0px" : "18px",
              display: "flex",
              textAlign: "start",
            }}
          >
            {org && org.length > 0 ? (
              org.map((tile) =>
                tile === selectedPrixer ? (
                  <Grid item xs={6} sm={6} md={3}>
                    <Card key={tile?._id} className={classes.card}>
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "end",
                          marginBottom: "-25px",
                        }}
                      >
                        <IconButton
                          aria-controls="simple-menu"
                          aria-haspopup="true"
                          onClick={(e) => {
                            setSelectedPrixer(undefined);
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </div>

                      <CardContent className={classes.cardContent}>
                        <Typography gutterBottom variant="h5" component="h2">
                          {tile?.firstName} {tile?.lastName}
                        </Typography>
                        {props.permissions?.setPrixerBalance && (
                          <Box
                            style={{
                              display: "flex",
                              justifyContent: "end",
                            }}
                          >
                            <Typography
                              color="secondary"
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              Cambiar a Prixer
                            </Typography>
                            <Switch
                              color="primary"
                              onChange={(event) =>
                                TurnIntoPrixer(event, tile?.username)
                              }
                              name="checkedA"
                              inputProps={{
                                "aria-label": "secondary checkbox",
                              }}
                            />
                          </Box>
                        )}
                        {props.permissions?.prixerBan && (
                          <Box
                            style={{
                              display: "flex",
                              justifyContent: "end",
                            }}
                          >
                            <Typography
                              color="secondary"
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              Visible
                            </Typography>
                            <Switch
                              checked={tile?.status}
                              color="primary"
                              onChange={(event) =>
                                handleChange(event, tile?.state) ||
                                ChangeVisibility(event, tile)
                              }
                              name="checkedA"
                              value={tile?.status}
                              inputProps={{
                                "aria-label": "secondary checkbox",
                              }}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ) : (
                  <Grid item xs={6} sm={6} md={3}>
                    <Card key={tile?._id} className={classes.card}>
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "end",
                          marginBottom: "-50px",
                        }}
                      >
                        <IconButton
                          aria-controls="simple-menu"
                          aria-haspopup="true"
                          onClick={(e) => {
                            setSelectedPrixer(tile);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </div>
                      <CardMedia
                        alt={tile?.title}
                        height="100"
                        width="100"
                        image={tile?.avatar || "/PrixLogo.png"}
                        className={classes.cardMedia}
                        title={tile?.title}
                      />
                      <CardContent className={classes.cardContent}>
                        <Typography gutterBottom variant="h5" component="h2">
                          {tile?.firstName} {tile?.lastName}
                        </Typography>
                        <Typography
                          gutterBottom
                          variant="h6"
                          component="h6"
                          style={{ fontSize: 16 }}
                        >
                          {tile?.username} -
                          {tile?.specialty ||
                            tile?.specialtyArt?.map(
                              (specialty, index) =>
                                specialty !== "" &&
                                (tile?.specialtyArt?.length === index + 1
                                  ? specialty
                                  : `${specialty}, `)
                            )}
                        </Typography>
                      </CardContent>
                      {tile?.account !== undefined &&
                      props.permissions?.setPrixerBalance ? (
                        <div
                          style={{
                            borderStyle: "solid",
                            borderWidth: "thin",
                            borderRadius: "10px",
                            borderColor: "#e5e7e9",
                            margin: "5px",
                            paddingBottom: "5px",
                          }}
                        >
                          <Typography variant="h6" align="center">
                            Balance $
                            {accounts &&
                              accounts
                                ?.find((acc) => acc._id === tile?.account)
                                ?.balance.toLocaleString("de-DE", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                          </Typography>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-evenly",
                            }}
                          >
                            <Button
                              onClick={(e) => {
                                setSelectedPrixer(tile);
                                setType("Depósito");
                                setOpenNewMovement(true);
                              }}
                              style={{
                                width: "40%",
                                backgroundColor: "#e5e7e9",
                              }}
                            >
                              Depósito
                            </Button>
                            <Button
                              onClick={(e) => {
                                setSelectedPrixer(tile);
                                setType("Retiro");
                                setOpenNewMovement(true);
                              }}
                              style={{
                                width: "40%",
                                backgroundColor: "#e5e7e9",
                              }}
                            >
                              Retiro
                            </Button>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "center",
                              textTransform: "lowercase",
                              marginTop: 5,
                            }}
                          >
                            <Button
                              onClick={() => {
                                setSelectedPrixer(tile);
                                getMovements(tile?.account);
                                setOpenList(true);
                              }}
                            >
                              <DehazeIcon />
                              Detalles
                            </Button>
                          </div>
                        </div>
                      ) : (
                        props.permissions?.setPrixerBalance && (
                          <Button
                            variant="contained"
                            color="primary"
                            style={{
                              width: 160,
                              alignSelf: "center",
                              fontWeight: "bold",
                            }}
                            onClick={(e) => {
                              setSelectedPrixer(tile);
                              setOpenNewBalance(true);
                            }}
                          >
                            Crear Cartera
                          </Button>
                        )
                      )}
                    </Card>
                  </Grid>
                )
              )
            ) : (
              <Typography
                variant="h6"
                color="secondary"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 20,
                  marginBottom: 20,
                  width: "100%",
                }}
              >
                No tenemos asociaciones registradas por ahora.
              </Typography>
            )}
          </Grid>
        </TabPanel>
      </Paper>

      <Modal open={openNewBalance} onClose={handleClose}>
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
                {" " +
                  selectedPrixer?.firstName +
                  " " +
                  selectedPrixer?.lastName}
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
              value={balance}
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
      <Modal open={openNewMovement} onClose={handleClose}>
        <Grid container className={classes.paper3}>
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
              <Typography variant="h6">
                {type} de
                {" " +
                  selectedPrixer?.firstName +
                  " " +
                  selectedPrixer?.lastName}
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
              width: "100%",
            }}
          >
            <Grid
              container
              style={{
                display: "flex",
              }}
            >
              <Grid item sm={3} style={{ flexBasis: "0" }}>
                <TextField
                  variant="outlined"
                  label="Fecha"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                  }}
                  type={"date"}
                />
              </Grid>
              <Grid
                item
                sm={6}
                style={{ paddingRight: "-20px", marginLeft: "10px" }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  label="descripción"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                />
              </Grid>
              <Grid item sm={3} style={{ marginLeft: "10px" }}>
                <TextField
                  variant="outlined"
                  label="Monto"
                  value={balance}
                  onChange={(e) => {
                    setBalance(e.target.value);
                  }}
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => {
                // openNewAccount();
                createPayMovement();
              }}
              style={{ marginRight: 10, marginLeft: 10, marginTop: 5 }}
            >
              Guardar
            </Button>
          </div>
        </Grid>
      </Modal>
      <Modal open={openList} onClose={handleClose}>
        <Grid container className={classes.paper1}>
          <div
            style={{
              display: "flex",
              width: "100%",

              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              Historial de
              {" " + selectedPrixer?.firstName + " " + selectedPrixer?.lastName}
            </Typography>

            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </div>

          {movements?.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Fecha efectiva</TableCell>
                  <TableCell align="center">Descripción</TableCell>
                  <TableCell align="center">Monto</TableCell>
                  <TableCell align="center">Fecha</TableCell>
                  <TableCell align="center">Creado por</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movements.map((mov) => (
                  <TableRow>
                    <TableCell>
                      {mov?.date?.substring(0, 10) ||
                        mov.createdOn.substring(0, 10)}
                    </TableCell>
                    <TableCell>{mov.description}</TableCell>
                    <TableCell>
                      {mov.type === "Retiro" && "-"}$
                      {mov.value.toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell align="center">
                      {mov.createdOn.substring(0, 10)}
                    </TableCell>
                    <TableCell align="center">{mov.createdBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography style={{ display: "flex", justifyContent: "center" }}>
              Aún no hay movimientos registrados para este Prixer.
            </Typography>
          )}
        </Grid>
      </Modal>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        message={message}
        className={classes.snackbar}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
