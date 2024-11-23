import { React, useState, useEffect } from 'react';
import axios from 'axios';
import { makeStyles, useTheme } from '@mui/styles';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import Snackbar from '@mui/material/Snackbar';
import Backdrop from '@mui/material/Backdrop';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DehazeIcon from '@mui/icons-material/Dehaze';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CreateWallet from './createWallet';
import CreateMovement from './createMovement';
import MovementRecord from './movementRecord';
import PrixerInfo from './prixerInfo';
import OrgCommission from './orgCommission';
import RemovePrixer from './destroyPrixer';

const useStyles = makeStyles((theme) => ({
  loading: {
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
    marginLeft: '50vw',
    marginTop: '50vh',
  },
  cardMedia: {
    paddingTop: '81.25%',
    borderRadius: '50%',
    margin: '28px',
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '100%',
  },
  paper: {
    padding: theme.spacing(2),
    margin: '15px',
  },
  snackbar: {
    [theme.breakpoints.down('xs')]: {
      bottom: 90,
    },
    margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      width: '25ch',
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  paper1: {
    position: 'absolute',
    width: '80%',
    maxHeight: '90%',
    overflowY: 'auto',
    backgroundColor: 'white',
    boxShadow: theme.shadows[2],
    padding: '16px 32px 24px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'justify',
    minWidth: 320,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  paper2: {
    position: 'fixed',
    right: '30%',
    top: '38%',
    bottom: '37%',
    left: '40%',
    width: 300,
    backgroundColor: 'white',
    boxShadow: theme.shadows[2],
    padding: '16px 32px 24px',
    textAlign: 'justify',
    minWidth: 320,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  paper3: {
    position: 'fixed',
    right: '40%',
    top: '38%',
    bottom: '37%',
    left: '22%',
    width: 800,
    backgroundColor: 'white',
    boxShadow: theme.shadows[2],
    padding: '16px 32px 24px',
    textAlign: 'justify',
    minWidth: 320,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function Prixers(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = useState(0);

  const [loading, setLoading] = useState(false);
  const [tiles, setTiles] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [org, setOrg] = useState([]);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [state, setState] = useState({
    checkedA: true,
  });
  const [openNewBalance, setOpenNewBalance] = useState(false);
  const [openNewMovement, setOpenNewMovement] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [selectedPrixer, setSelectedPrixer] = useState(undefined);
  const [selectedConsumer, setSelectedConsumer] = useState(undefined);
  const [balance, setBalance] = useState(0);
  const [type, setType] = useState();
  const [date, setDate] = useState(new Date());
  const [accounts, setAccounts] = useState();
  const [message, setMessage] = useState();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openInfo, setOpenInfo] = useState(false);
  const [openComission, setOpenComission] = useState(false);
  const [openDestroy, setOpenDestroy] = useState(false);
  const handleSection = (event, newValue) => {
    setValue(newValue);
  };

  const readPrixers = async () => {
    try {
      const base_url = import.meta.env.VITE_BACKEND_URL + '/prixer/read-all-full';

      const response = await axios.get(base_url);
      let prev = response.data.prixers;
      prev.map((prix) => {
        if (prix !== null) {
          return prix;
        }
      });
      setTiles(prev);
    } catch (error) {
      console.log(error);
    }
  };

  const readConsumers = async () => {
    try {
      const base_url = import.meta.env.VITE_BACKEND_URL + '/consumer/read-prixers';

      const response = await axios.post(base_url, {
        adminToken: localStorage.getItem('adminTokenV'),
      });
      setConsumers(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const readOrg = async () => {
    try {
      const base_url = import.meta.env.VITE_BACKEND_URL + '/organization/read-all-full';

      const response = await axios.get(base_url);
      setOrg(response.data.organizations);
    } catch (error) {
      console.log(error);
    }
  };

  const getBalance = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/account/readAll';
    await axios
      .post(base_url, {
        adminToken: localStorage.getItem('adminTokenV'),
      })
      .then((res) => {
        setAccounts(res.data.accounts);
      });
  };

  const routine = async () => {
    setLoading(true);
    readPrixers();
    readOrg();
    readConsumers();
    getBalance();
    setLoading(false);
  };
  useEffect(() => {
    routine();
  }, []);

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const ChangeVisibility = async (e, prixer) => {
    e.preventDefault();
    setLoading(true);
    setState({ ...state, [e.target.name]: e.target.checked });

    const base_url = import.meta.env.VITE_BACKEND_URL + '/prixer/update-home/' + prixer.prixerId;
    const body = {
      status: e.target.value === 'false' || e.target.value === '' ? true : false,
      adminToken: localStorage.getItem('adminTokenV'),
      account: prixer?.account,
    };
    await axios.put(base_url, body);
    await readPrixers();
    setLoading(false);
  };

  const handleClose = () => {
    setOpenNewBalance(false);
    setOpenNewMovement(false);
    setOpenComission(false);
    setOpenList(false);
    setBalance(0);
    setOpenInfo(false);
    setSelectedPrixer();
    setSelectedConsumer();
    setDate();
    setAnchorEl(null);
    setOpenDestroy(false);
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

  const TurnIntoOrg = async (event, user) => {
    const url = import.meta.env.VITE_BACKEND_URL + '/turn-to-association';
    const data = { username: user };
    const call = await axios.post(url, data);
    if (call.data.success) {
      setOpen(true);
      setMessage('Rol modificado a Organización.');
      let prev = tiles.filter((tile) => tile.username !== user);
      setTiles(prev);
    }
  };

  const TurnIntoPrixer = async (event, user) => {
    const url = import.meta.env.VITE_BACKEND_URL + '/turn-to-prixer';
    const data = { username: user };
    const call = await axios.post(url, data);
    if (call.data.success) {
      setOpen(true);
      setMessage('Rol modificado a Prixer.');
      let prev = org.filter((o) => o.username !== user);
      if (prev[0] === null) {
        setOrg([]);
      } else {
        setOrg(prev);
      }
    }
  };

  // const addrole = async () => {
  //   const url = import.meta.env.VITE_BACKEND_URL + "/prixers/addRole";

  //   await axios.put(url);
  //   setOpen(true);
  //   setMessage("Rol de Prixer agregado a todos los usuarios.");
  // };

  // function handleKeyDown(event) {
  //   if (event.key === "*") {
  //     addrole();
  //   } else return;
  // }
  // document.addEventListener("keydown", handleKeyDown);

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  return (
    <div>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress />
      </Backdrop>
      <Paper className={classes.paper}>
        <Tabs
          value={value}
          onChange={handleSection}
          style={{ width: '70%' }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Prixers" />
          <Tab label="Organizaciones" />
        </Tabs>
        <TabPanel value={value} index={0}>
          <Grid
            container
            spacing={2}
            style={{
              padding: isMobile ? '0px' : '18px',
              display: 'flex',
              textAlign: 'start',
            }}
          >
            {tiles?.length > 0 ? (
              tiles.map((tile) =>
                tile === selectedPrixer ? (
                  <Grid item xs={6} sm={6} md={3}>
                    <Card key={tile?.prixerId} className={classes.card}>
                      <div
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'end',
                          marginBottom: '-25px',
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
                        {props.permissions?.readConsumers && (
                          <Button
                            style={{
                              backgroundColor: '#e5e7e9',
                              textTransform: 'none',
                            }}
                            onClick={() => {
                              setOpenInfo(true);
                              consumers.map((cons) => {
                                if (cons.prixerId === tile.prixerId) {
                                  setSelectedConsumer(cons);
                                }
                              });
                            }}
                          >
                            Ver información
                          </Button>
                        )}
                        {props.permissions?.setPrixerBalance && (
                          <Box
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Typography
                              color="secondary"
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              Cambiar a Organización
                            </Typography>
                            <Switch
                              color="primary"
                              onChange={(event) => TurnIntoOrg(event, tile?.username)}
                              name="checkedA"
                              inputProps={{
                                'aria-label': 'secondary checkbox',
                              }}
                            />
                          </Box>
                        )}
                        {props.permissions?.prixerBan && (
                          <Box
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Typography
                                color="secondary"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                Visible
                              </Typography>
                              <Switch
                                checked={tile?.status}
                                color="primary"
                                onChange={(event) =>
                                  // handleChange(event, tile?.state) ||
                                  ChangeVisibility(event, tile)
                                }
                                name="checkedA"
                                value={tile?.status}
                                inputProps={{
                                  'aria-label': 'secondary checkbox',
                                }}
                              />
                            </Box>
                            <Box
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                              }}
                            >
                              <Button
                                onClick={(e) => {
                                  setSelectedPrixer(tile);
                                  setOpenDestroy(true);
                                }}
                                style={{
                                  backgroundColor: 'rgb(229, 231, 233)',
                                  textTransform: 'none',
                                }}
                              >
                                Eliminar Prixer
                              </Button>
                            </Box>
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
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'end',
                          marginBottom: '-50px',
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
                        image={tile?.avatar || '/PrixLogo.png'}
                        className={classes.cardMedia}
                        title={tile?.title}
                        style={{
                          opacity: tile?.status === true ? '100%' : '50%',
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
                                specialty !== '' &&
                                (tile?.specialtyArt?.length === index + 1
                                  ? specialty
                                  : `${specialty}, `)
                            )}
                        </Typography>
                      </CardContent>
                      {tile?.account !== undefined && props.permissions?.setPrixerBalance ? (
                        <div
                          style={{
                            borderStyle: 'solid',
                            borderWidth: 'thin',
                            borderRadius: '10px',
                            borderColor: '#e5e7e9',
                            margin: '5px',
                            paddingBottom: '5px',
                          }}
                        >
                          <Typography variant="h6" align="center">
                            Balance $
                            {accounts &&
                              accounts
                                ?.find((acc) => acc._id === tile?.account)
                                ?.balance.toLocaleString('de-DE', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                          </Typography>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-evenly',
                            }}
                          >
                            <Button
                              onClick={(e) => {
                                setSelectedPrixer(tile);
                                setType('Depósito');
                                setOpenNewMovement(true);
                              }}
                              style={{
                                width: '40%',
                                backgroundColor: '#e5e7e9',
                                textTransform: 'none',
                              }}
                            >
                              Depósito
                            </Button>
                            <Button
                              onClick={(e) => {
                                setSelectedPrixer(tile);
                                setType('Retiro');
                                setOpenNewMovement(true);
                              }}
                              style={{
                                width: '40%',
                                backgroundColor: '#e5e7e9',
                                textTransform: 'none',
                              }}
                            >
                              Retiro
                            </Button>
                          </div>
                          <div
                            style={{
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              marginTop: 5,
                            }}
                          >
                            <Button
                              style={{ textTransform: 'none' }}
                              onClick={() => {
                                setSelectedPrixer(tile);
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
                              alignSelf: 'center',
                              fontWeight: 'bold',
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
                  display: 'flex',
                  justifyContent: 'center',
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
              padding: isMobile ? '0px' : '18px',
              display: 'flex',
              textAlign: 'start',
            }}
          >
            {org && org.length > 0 ? (
              org.map((tile) =>
                tile === selectedPrixer ? (
                  <Grid item xs={6} sm={6} md={3}>
                    <Card key={tile?._id} className={classes.card}>
                      <div
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'end',
                          marginBottom: '-25px',
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
                        {props.permissions?.readConsumers && (
                          <Button
                            style={{
                              backgroundColor: '#e5e7e9',
                              textTransform: 'none',
                            }}
                            onClick={() => {
                              setOpenInfo(true);
                              consumers?.map((cons) => {
                                if (cons.prixerId === tile.prixerId) {
                                  setSelectedConsumer(cons);
                                }
                              });
                            }}
                          >
                            Ver información
                          </Button>
                        )}
                        {props.permissions?.setPrixerBalance && (
                          <Box
                            style={{
                              display: 'flex',
                              justifyContent: 'end',
                            }}
                          >
                            <Typography
                              color="secondary"
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              Cambiar a Prixer
                            </Typography>
                            <Switch
                              color="primary"
                              onChange={(event) => TurnIntoPrixer(event, tile?.username)}
                              name="checkedA"
                              inputProps={{
                                'aria-label': 'secondary checkbox',
                              }}
                            />
                          </Box>
                        )}
                        {props.permissions?.prixerBan && (
                          <Box
                            style={{
                              display: 'flex',
                              justifyContent: 'end',
                            }}
                          >
                            <Typography
                              color="secondary"
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              Visible
                            </Typography>
                            <Switch
                              checked={tile?.status}
                              color="primary"
                              onChange={(event) =>
                                // handleChange(event, tile?.state) ||
                                ChangeVisibility(event, tile)
                              }
                              name="checkedA"
                              value={tile?.status}
                              inputProps={{
                                'aria-label': 'secondary checkbox',
                              }}
                            />
                          </Box>
                        )}
                        <Button
                          style={{
                            backgroundColor: '#e5e7e9',
                            textTransform: 'none',
                          }}
                          onClick={() => {
                            setOpenComission(true);
                          }}
                        >
                          Definir comisión
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ) : (
                  <Grid item xs={6} sm={6} md={3}>
                    <Card key={tile?._id} className={classes.card}>
                      <div
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'end',
                          marginBottom: '-50px',
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
                        image={tile?.avatar || '/PrixLogo.png'}
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
                                specialty !== '' &&
                                (tile?.specialtyArt?.length === index + 1
                                  ? specialty
                                  : `${specialty}, `)
                            )}
                        </Typography>
                      </CardContent>
                      {tile?.account !== undefined && props.permissions?.setPrixerBalance ? (
                        <div
                          style={{
                            borderStyle: 'solid',
                            borderWidth: 'thin',
                            borderRadius: '10px',
                            borderColor: '#e5e7e9',
                            margin: '5px',
                            paddingBottom: '5px',
                          }}
                        >
                          <Typography variant="h6" align="center">
                            Balance $
                            {accounts &&
                              accounts
                                ?.find((acc) => acc._id === tile?.account)
                                ?.balance.toLocaleString('de-DE', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                          </Typography>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-evenly',
                            }}
                          >
                            <Button
                              onClick={(e) => {
                                setSelectedPrixer(tile);
                                setType('Depósito');
                                setOpenNewMovement(true);
                              }}
                              style={{
                                width: '40%',
                                backgroundColor: '#e5e7e9',
                              }}
                            >
                              Depósito
                            </Button>
                            <Button
                              onClick={(e) => {
                                setSelectedPrixer(tile);
                                setType('Retiro');
                                setOpenNewMovement(true);
                              }}
                              style={{
                                width: '40%',
                                backgroundColor: '#e5e7e9',
                              }}
                            >
                              Retiro
                            </Button>
                          </div>
                          <div
                            style={{
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              textTransform: 'lowercase',
                              marginTop: 5,
                            }}
                          >
                            <Button
                              onClick={() => {
                                setSelectedPrixer(tile);
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
                              alignSelf: 'center',
                              fontWeight: 'bold',
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
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 20,
                  marginBottom: 20,
                  width: '100%',
                }}
              >
                No tenemos asociaciones registradas por ahora.
              </Typography>
            )}
          </Grid>
        </TabPanel>
      </Paper>

      <Modal open={openNewBalance} onClose={handleClose}>
        <CreateWallet
          selectedPrixer={selectedPrixer}
          balance={balance}
          date={date}
          setOpen={setOpen}
          setMessage={setMessage}
          handleClose={handleClose}
          setBalance={setBalance}
          readPrixers={readPrixers}
          readOrg={readOrg}
          getBalance={getBalance}
        />
      </Modal>

      <Modal open={openNewMovement} onClose={handleClose}>
        <CreateMovement
          selectedPrixer={selectedPrixer}
          handleClose={handleClose}
          date={date}
          setDate={setDate}
          balance={balance}
          setBalance={setBalance}
          type={type}
          setOpen={setOpen}
          setMessage={setMessage}
          readPrixers={readPrixers}
          readOrg={readOrg}
          getBalance={getBalance}
        />
      </Modal>

      <Modal open={openList} onClose={handleClose}>
        <MovementRecord selectedPrixer={selectedPrixer} handleClose={handleClose} />
      </Modal>

      <Modal open={openInfo} onClose={handleClose}>
        <PrixerInfo
          selectedPrixer={selectedPrixer}
          selectedConsumer={selectedConsumer}
          handleClose={handleClose}
        />
      </Modal>

      <Modal open={openComission} onClose={handleClose}>
        <OrgCommission
          selectedPrixer={selectedPrixer}
          handleClose={handleClose}
          setOpenComission={setOpenComission}
          setOpen={setOpen}
          setMessage={setMessage}
          readOrg={readOrg}
        />
      </Modal>

      <Modal open={openDestroy} onClose={handleClose}>
        <RemovePrixer
          selectedPrixer={selectedPrixer}
          selectedConsumer={selectedConsumer}
          routine={routine}
          setOpen={setOpen}
          setMessage={setMessage}
          handleClose={handleClose}
        />
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
