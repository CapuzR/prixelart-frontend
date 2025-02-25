import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/styles';
import { makeStyles } from '@mui/styles';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';

import { nanoid } from 'nanoid';
import {
  UnitPrice,
  getPVP,
  getPVM,
  getTotalUnitsPVM,
  getTotalUnitsPVP,
  getComissionv2,
} from '../../../consumer/checkout/pricesFunctions.jsx';
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
  },
  form: {
    height: 'auto',
    // padding: "15px",
  },
  gridInput: {
    display: 'flex',
    width: '100%',
    marginBottom: '12px',
  },
  textField: {
    marginRight: '8px',
  },

  toolbar: {
    paddingRight: 24,
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'none',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 'auto',
    overflow: 'none',
  },
  fab: {
    right: 0,
    position: 'absolute',
  },
  paper2: {
    position: 'absolute',
    width: '85%',
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
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'row',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  base: {
    width: '70px',
    height: '37px',
    padding: '0px',
  },
  switchBase: {
    color: 'silver',
    padding: '1px',
    '&$checked': {
      '& + $track': {
        backgroundColor: 'silver',
      },
    },
  },
  thumb: {
    color: '#d33f49',
    width: '30px',
    height: '30px',
    margin: '2px',
    '&:before': {
      content: "'$'",
      fontSize: '18px',
      color: 'white',
      display: 'flex',
      marginTop: '3px',
      justifyContent: 'center',
    },
  },
  thumbTrue: {
    color: '#d33f49',
    width: '30px',
    height: '30px',
    margin: '2px',
    '&:before': {
      content: "'Bs'",
      fontSize: '18px',
      color: 'white',
      display: 'flex',
      marginTop: '3px',
      justifyContent: 'center',
    },
  },
  track: {
    borderRadius: '20px',
    backgroundColor: 'silver',
    opacity: '1 !important',
    '&:after, &:before': {
      color: 'black',
      fontSize: '18px',
      position: 'absolute',
      top: '6px',
    },
    '&:after': {
      content: "'$'",
      left: '8px',
    },
    '&:before': {
      content: "'Bs'",
      right: '7px',
    },
  },
  checked: {
    color: '#d33f49 !important',
    transform: 'translateX(35px) !important',
    padding: '1px',
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
}));
export default function PayComission(props) {
  const classes = useStyles();
  const theme = useTheme();
  // const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  // const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [shippingData, setShippingData] = useState();
  const [selectedPrixer, setSelectedPrixer] = useState();
  const [shippingMethod, setShippingMethod] = useState();
  const [selectedConsumer, setSelectedConsumer] = useState();
  const [consumerType, setConsumerType] = useState('Particular');
  const [consumer, setConsumer] = useState(undefined);
  const [comissions, setComissions] = useState([]);
  let shippingCost = Number(shippingMethod?.price);

  useEffect(() => {
    checkConsumer(props.modalContent.consumerId);
  }, []);

  useEffect(() => {
    let comList = [];
    props.modalContent.requests.map((item) => {
      comList.push({
        value: getComissionv2(
          item.product,
          item.art,
          props?.currency,
          props?.dollarValue,
          props.modalContent.consumerData.consumerType,
          prixer,
          checkOrgs(item.art),
          props.surchargeList
        ),
        quantity: item.quantity,
      });
    });
    setComissions(comList);
  }, []);

  let consumersFiltered = props.consumers.filter((con) => con.consumerType === 'Prixer');
  const prixer = consumersFiltered.find(
    (con) =>
      con.firstname?.toLowerCase().includes(props?.basicData?.name?.toLowerCase()) &&
      con.lastname?.toLowerCase().includes(props?.basicData?.lastname?.toLowerCase())
  );

  const checkConsumer = async (Id) => {
    const url = import.meta.env.VITE_BACKEND_URL + '/consumer/read-by-id';

    const body = {
      adminToken: localStorage.getItem('adminTokenV'),
      consumer: Id,
    };
    await axios.post(url, body).then((res) => {
      setConsumer(res.data);
    });
  };
  const getIvaCost = (state) => {
    let iva = getTotalPrice(state) * 0.16;
    if (typeof selectedPrixer?.username === 'string') {
      return 0;
    } else {
      return iva;
    }
  };

  const getTotal = (x) => {
    let n = [];
    n.push(getTotalPrice(props.buyState));
    n.push(getIvaCost(props.buyState));
    {
      shippingData?.shippingMethod && n.push(shippingCost);
    }
    let total = n.reduce(function (a, b) {
      return a + b;
    });
    return total;
  };

  const getTotalPrice = (state) => {
    if (selectedPrixer) {
      return getTotalUnitsPVM(state, false, 1, props.discountList, selectedPrixer.username);
    } else {
      return getTotalUnitsPVP(state, false, 1, props.discountList);
    }
  };

  const checkOrgs = (art) => {
    if (art !== undefined) {
      const org = props?.orgs?.find((el) => el.username === art?.prixerUsername);
      return org;
    }
  };

  const getConsumer = (id) => {
    let prixer = props.prixers.find(
      (prixer) => prixer?.email === props.modalContent.basicData.email
    );
    let selected = props.consumers.find((consumer) => consumer._id === id);
    if (selected) {
      setSelectedConsumer(selected);
      setConsumerType(selected.consumerType);

      if (selected.consumerType === 'Prixer') {
        setSelectedPrixer(prixer);
        setConsumerType('Prixer');
      }
    }
  };

  const modifyPrice = (index, newCom) => {
    setComissions((prevComissions) =>
      prevComissions.map((item, i) => (i === index ? { ...item, value: Number(newCom) } : item))
    );
  };

  const findPrixer = async (prx) => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/prixer/read';
    return await axios
      .post(base_url, { username: prx })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const sendComission = async (index) => {
    let destinatary = undefined;
    const item = props.modalContent.requests[index];
    console.log(props.modalContent.requests);
    const ORGS = props.orgs.find((o) => o.username === item.art.owner);
    const prx = await findPrixer(item.art.prixerUsername);
    console.log(ORGS);
    console.log(prx);
    if (ORGS !== undefined) {
      destinatary = ORGS.account;
    } else {
      destinatary = prx.account;
    }
    if (
      item.art?.prixerUsername !== 'Personalizado' &&
      item.art?.prixerUsername !== undefined &&
      destinatary !== undefined
    ) {
      const url = import.meta.env.VITE_BACKEND_URL + '/movement/create';
      const data = {
        _id: nanoid(),
        createdOn: new Date(),
        createdBy: JSON.parse(localStorage.getItem('adminToken')).username,
        date: new Date(),
        destinatary: destinatary,
        description: `Comisión de la orden #${props.modalContent.orderId}`,
        type: 'Depósito',
        value: comissions[index]?.value,
        adminToken: localStorage.getItem('adminTokenV'),
      };
      await axios.post(url, data).then(async (res) => {
        if (res.data.success === false) {
          setSnackBarError(true);
          setErrorMessage(res.data.message);
        } else {
          const updated = props.modalContent?.comissions || [];
          updated[index] = data;
          const data2 = {
            orderId: props.modalContent.orderId,
            comissions: updated,
          };
          const url2 = import.meta.env.VITE_BACKEND_URL + '/order/updateComissions';
          await axios.post(url2, data2).then(async (res) => {
            if (res.data.success === false) {
              setSnackBarError(true);
              setErrorMessage(res.data.message);
            }
          });
        }
      });
    } else if (destinatary === undefined) {
      setSnackBarError(true);
      setErrorMessage(
        'La cartera no ha sido encontrada, verifique que el propietario y/o owner tenga una cartera válida e inténtelo de nuevo.'
      );
    }
  };

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      props.handleClose();
    } else return;
  }
  document.addEventListener('keydown', handleKeyDown);

  // console.log(props.modalContent)
  console.log(comissions);
  return (
    <Grid
      container
      spacing={2}
      style={{ justifyContent: 'space-between', alignItems: 'center' }}
      className={classes.paper2}
    >
      <Grid
        item
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Typography
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'center',
              fontSize: '1.4rem',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            Pago de comisión
          </Typography>
          <Typography
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'center',
              fontSize: '1.2rem',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            {'Orden '}
            <strong>#{props.modalContent.orderId}</strong>
            {'de'}
            <strong>
              {(props.modalContent.basicData.firstname || props.modalContent.basicData.name) +
                ' ' +
                props.modalContent.basicData.lastname}
            </strong>
          </Typography>
        </div>

        <IconButton onClick={props.handleClose}>
          <CloseIcon />
        </IconButton>
      </Grid>
      <div
        style={{
          paddingRight: '10px',
          marginLeft: '13px',
          paddingBottom: 10,
          maxHeight: '70%',
          width: '100%',
        }}
      >
        {props.modalContent?.requests.map((item, index) => (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              margin: '0px 20px 20px 0px',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderRadius: 10,
              padding: 5,
              borderColor: '#d33f49',
            }}
          >
            <Typography variant="h6" style={{ textAlign: 'center', margin: 5 }}>
              {'Item #'}
              {index + 1}
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex' }}>
                <div
                  style={{
                    padding: 10,
                    justifyContent: 'space-between',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {item.art?.title !== 'Personalizado' ? (
                    <div>
                      <div>{'Arte: ' + item.art.title}</div>
                      <div>{'Id: ' + item.art?.artId}</div>
                      <div style={{ marginBottom: 18 }}>
                        {item.art?.prixerUsername !== undefined &&
                          'Prixer: ' + item.art?.prixerUsername}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>{'Arte: ' + item.art?.title}</div>
                      <div style={{ marginBottom: 18 }}>
                        {'Prixer: ' + item.art?.prixerUsername}
                      </div>
                    </div>
                  )}
                  <div>
                    {'Exclusividad: '}
                    {item.art.exclusive === 'exclusive' ? 'Exclusivo' : 'Estándar'}
                  </div>
                  <div>{'Porcentaje: ' + item.art.comission + '%'}</div>
                </div>
                <div
                  style={{
                    padding: 10,
                  }}
                >
                  <div>{'Producto: ' + item.product.name}</div>
                  {item.product.selection && typeof item.product.selection === 'object' ? (
                    item.product.attributes.map((a, i) => {
                      return (
                        <p
                          style={{
                            padding: 0,
                            margin: 0,
                          }}
                        >
                          {item.product?.selection?.attributes[i]?.name +
                            ': ' +
                            item.product?.selection?.attributes[i]?.value}
                        </p>
                      );
                    })
                  ) : item.product.selection &&
                    typeof item.product.selection === 'string' &&
                    item.product?.selection?.includes(' ') ? (
                    <div>
                      {item.product.selection}{' '}
                      {item.product?.variants &&
                        item.product?.variants.length > 0 &&
                        item.product.variants?.find((v) => v.name === item.product.selection)
                          ?.attributes[1]?.value}
                    </div>
                  ) : (
                    item.product.selection && <div>{item.product.selection}</div>
                  )}
                  Precio unitario: $
                  {item.product?.finalPrice
                    ? item.product?.finalPrice?.toLocaleString('de-DE', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : PriceSelect(item)}
                  <div>
                    {typeof item.product?.discount === 'string' &&
                      'Descuento: ' + item.product?.discount}
                    {consumer?.consumerType === 'Prixer' && 'No aplicado'}
                  </div>
                  <div>
                    {'Comisión: $' +
                      getComissionv2(
                        item.product,
                        item.art,
                        props?.currency,
                        props?.dollarValue,
                        props.modalContent.consumerData.consumerType,
                        prixer,
                        checkOrgs(item.art),
                        props.surchargeList
                      ).toLocaleString('de-DE', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </div>
                </div>
              </div>
              <div
                style={{
                  padding: 10,
                  display: 'flex',
                  height: 'fit-content',
                }}
              >
                <TextField
                  variant="outlined"
                  label={'Comisión:'}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  style={{ width: 120 }}
                  value={comissions[index]?.value}
                  onChange={(e) => {
                    modifyPrice(index, e.target.value);
                  }}
                />
                <Typography
                  style={{
                    fontSize: '1.1rem',
                    height: 'fit-content',
                    padding: 15,
                  }}
                  color="secondary"
                >
                  {'X ' + item.quantity + ' '}
                  {item.quantity === 1 ? 'unidad' : 'unidades'}
                </Typography>
              </div>
              <div
                style={{
                  padding: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'end',
                  flexDirection: 'column',
                }}
              >
                <TextField
                  variant="outlined"
                  label={'Comisión total para ' + item.art.owner + ':'}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  disabled
                  style={{ width: 270 }}
                  value={Number(comissions[index]?.value * item.quantity)}
                  onChange={(e) => {
                    modifyPrice(index, e.target.value);
                  }}
                />
                <div>
                  <Button
                    variant="contained"
                    color={'primary'}
                    onClick={sendComission}
                    style={{ textTransform: 'none' }}
                  >
                    Pagar comisión
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Grid>
  );
}
