import { makeStyles } from '@mui/styles';
import React, { useState, Suspense } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import validations from '../validations';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import { useEffect } from 'react';
import axios from 'axios';
import { Snackbar } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  gridInput: {
    display: 'flex',
    width: '100%',
    marginBottom: '12px',
  },
  textField: {
    marginRight: '8px',
  },
  brillante: {
    // width: 45,
    // height: 45,
    // borderRadius: "50%",
    // backgroundColor: "black",
    animation: '$animacion-brillo 2s infinite',
  },
  '@keyframes animacion-brillo': {
    '0%': {
      boxShadow: '0 0 0 0 #d33f49',
    },
    '50%': {
      boxShadow: '0 0 0 20px #d33f4900',
    },
    '100%': {
      boxShadow: '0 0 0 0 #d33f4900',
    },
  },
}));
function ConsumerForm(props) {
  const classes = useStyles();
  const [shippingDataCheck, setShippingDataCheck] = useState(true);
  const [billingDataCheck, setBillingDataCheck] = useState(true);
  const [billingShDataCheck, setBillingShDataCheck] = useState(false);
  const [shippingList, setShippingList] = useState();
  const [openTooltip, setOpenTooltip] = useState(false);
  const [openTooltip2, setOpenTooltip2] = useState(false);
  const [open, setOpen] = useState(false);
  const [openTooltipPh, setOpenTooltipPh] = useState(false);
  const [openTooltipPh2, setOpenTooltipPh2] = useState(false);
  const [openTooltipPh3, setOpenTooltipPh3] = useState(false);
  let today = new Date();
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  const monthsOrder = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  let ProdTimes = props.cart?.lines?.map((item) => {
    if (item.product && item.art && item.product.productionTime !== undefined) {
      return item.product.productionTime;
    }
  });

  let orderedProdT = ProdTimes?.sort(function (a, b) {
    if (a.toLowerCase() > b.toLowerCase()) {
      return 1;
    }
    if (a.toLowerCase() < b.toLowerCase()) {
      return -1;
    }
    return 0;
  });

  let readyDate = new Date(today.setDate(today.getDate() + Number(orderedProdT && orderedProdT[0])));

  if (readyDate.getDay() === 6) {
    readyDate = new Date(today.setDate(today.getDate() + 2));
  } else if (readyDate.getDay() === 0) {
    readyDate = new Date(today.setDate(today.getDate() + 1));
  }

  const stringReadyDate =
    readyDate.getFullYear() + '-' + monthsOrder[readyDate.getMonth()] + '-' + readyDate.getDate();

  const getShippingMethods = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/shipping-method/read-all-v2';
    axios
      .get(base_url)
      .then((response) => {
        setShippingList(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getConsumer = async () => {
    if (localStorage.getItem('token')) {
      const base_url = import.meta.env.VITE_BACKEND_URL + '/consumer/read';
      const email = JSON.parse(localStorage.getItem('token')).email;
      axios
        .post(base_url, { email: email })
        .then((response) => {
          if (response.data.success) {
            const consumer = response.data.consumer;
            props.setValues({
              name: consumer.firstname,
              lastName: consumer.lastname,
              ci: consumer.ci,
              phone: consumer.phone,
              email: consumer.email,
              address: consumer.address,
              shippingAddress: consumer?.shippingAddress,
              billingAddress: consumer?.billingShAddress,
            });
          } else {
            const base_url2 = import.meta.env.VITE_BACKEND_URL + '/prixer/read';
            const username = JSON.parse(localStorage.getItem('token')).username;
            axios.post(base_url2, { username: username }).then((response) => {
              if (response.data) {
                const prixer = response.data;
                props.setValues({
                  name: prixer.firstName,
                  lastName: prixer.lastName,
                  // ci: consumer.ci,
                  phone: prixer?.phone,
                  email: prixer?.email,
                  address: prixer?.address,
                  // shippingAddress: consumer?.shippingAddress,
                  // billingAddress: consumer?.billingShAddress,
                });
              }
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  useEffect(() => {
    console.log('useEffect1');
    getShippingMethods();
    getConsumer();
    // }
  }, []);

  const handleAccordionExpansion = (panel) => (event, isExpanded) => {
    props.setExpanded(isExpanded ? panel : false);
  };

  const handleShippingDataCheck = () => {
    if (shippingDataCheck) {
      props.setValues({
        ...props.values,
        shippingName: '',
        shippingLastName: '',
        shippingPhone: '',
        shippingAddress: '',
      });
    } else {
      props.setValues({
        ...props.values,
        shippingName: props.values.name,
        shippingLastName: props.values.lastName,
        shippingPhone: props.values.phone,
        shippingAddress: props.values.address,
      });
    }

    setShippingDataCheck(!shippingDataCheck);
  };

  const selectShDate = (value) => {
    // let date = Date(value);
    if (value < stringReadyDate) {
      props.setOpen(true);
      props.setMessage(
        'Si lo requieres antes, coméntalo en el campo de observaciones y un asesor se comunicará contigo.'
      );
    }
    // } else
    props.setValues({
      ...props.values,
      shippingDate: value,
    });
  };

  if (props?.values?.shippingDate === undefined) {
    props.setValues({
      ...props.values,
      shippingDate: stringReadyDate,
    });
  }

  useEffect(() => {
    if (
      typeof props.values === 'object' &&
      props.warning === true &&
      props.values.name !== undefined &&
      props.values.lastName !== undefined &&
      props.values.ci !== undefined &&
      props.values.email !== undefined &&
      props.values.phone !== undefined
    ) {
      props.setWarning(false);
    }
  }, [props.values]);

  return (
    <>
      <div>
        <Accordion
          className={props.warning && classes.brillante}
          expanded={props.expanded === 'basic'}
          onChange={handleAccordionExpansion('basic')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Datos Básicos</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form autoComplete="off">
              <Grid container>
                <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="Nombre"
                    label="Nombre"
                    fullWidth
                    className={classes.textField}
                    value={props.values?.name ? props.values.name : ''}
                    onChange={(e) => props.setValues({ ...props.values, name: e.target.value })}
                    required
                    error={!isAValidName(props.values?.name)}
                    helperText={
                      !isAValidName(props.values?.name) &&
                      props.values.name !== undefined &&
                      'Formato no válido.'
                    }
                    margin="normal"
                  />
                </Grid2>
                <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Apellido"
                    fullWidth
                    className={classes.textField}
                    value={props.values?.lastName ? props.values.lastName : ''}
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        lastName: e.target.value,
                      })
                    }
                    error={!isAValidName(props.values?.lastName)}
                    helperText={
                      !isAValidName(props.values?.lastName) &&
                      props.values.lastName !== undefined &&
                      'Formato no válido.'
                    }
                    margin="normal"
                  />
                </Grid2>

                <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="CI o RIF"
                    fullWidth
                    className={classes.textField}
                    value={props.values?.ci ? props.values.ci : ''}
                    onChange={(e) => props.setValues({ ...props.values, ci: e.target.value })}
                    required
                    error={
                      props.values?.ci !== undefined && !isAValidCi(props.values?.ci)
                    }
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <Tooltip
                          onClick={(e) => setOpenTooltip(!openTooltip)}
                          open={openTooltip}
                          onClose={(leaveDelay) => setOpenTooltip(false)}
                          title={
                            !isAValidCi(props.values?.ci) &&
                            props.values?.ci !== undefined
                              ? 'ej: V12345679 ó 12345678 \n' + 'Formato no válido.'
                              : 'ej: V12345679 ó 12345678'
                          }
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid2>
                <Grid item lg={5} md={5} sm={5} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Telefono"
                    fullWidth
                    className={classes.textField}
                    value={props.values?.phone ? props.values.phone : ''}
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        phone: e.target.value,
                      })
                    }
                    required
                    margin="normal"
                    error={
                      props.values?.phone !== undefined &&
                      !isAValidPhoneNum(props.values?.phone)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalPhoneIcon color="secondary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <Tooltip
                          onClick={(e) => setOpenTooltipPh(!openTooltipPh)}
                          open={openTooltipPh}
                          onClose={(leaveDelay) => setOpenTooltipPh(false)}
                          title={
                            !isAValidPhoneNum(props.values?.phone) &&
                            props.values?.phone !== undefined ? (
                              <div>
                                <div>ej: 584141234567 ó +584141234567 ó 04143201028</div>
                                Formato no válido.
                              </div>
                            ) : (
                              'ej: 584141234567 ó +584141234567 ó 04143201028'
                            )
                          }
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid2>
                <Grid item lg={7} md={7} sm={7} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    label="Correo"
                    fullWidth
                    className={classes.textField}
                    value={props.values?.email ? props.values.email : ''}
                    helperText={
                      !isAValidEmail(props.values?.email) &&
                      props.values.email !== undefined &&
                      'Formato no válido.'
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        email: e.target.value,
                      })
                    }
                    error={!isAValidEmail(props.values?.email)}
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid2>
                <Grid item lg={12} md={12} sm={12} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    fullWidth
                    label="Dirección"
                    className={classes.textField}
                    multiline
                    minRows={3}
                    helperText="Incluir todos los detalles posibles, incluidas referencias."
                    value={props.values?.address ? props.values.address : ''}
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        address: e.target.value,
                      })
                    }
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid2>
              </Grid2>
            </form>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={props.expanded === 'shipping'}
          onChange={handleAccordionExpansion('shipping')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Datos de Entrega</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form autoComplete="off">
              <Grid container>
                <Grid item lg={12} md={12} sm={12} xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={shippingDataCheck}
                        onChange={() => {
                          handleShippingDataCheck();
                        }}
                      />
                    }
                    label="Igual a datos básicos"
                  />
                </Grid2>
                <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Nombre"
                    fullWidth
                    className={classes.textField}
                    disabled={shippingDataCheck}
                    value={
                      shippingDataCheck
                        ? props.values?.name
                          ? props.values.name
                          : ''
                        : props.values.shippingName
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        shippingName: e.target.value,
                      })
                    }
                    error={!isAValidName(props.values?.shippingName)}
                    required
                    margin="normal"
                  />
                </Grid2>
                <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Apellido"
                    fullWidth
                    disabled={shippingDataCheck}
                    className={classes.textField}
                    value={
                      shippingDataCheck
                        ? props.values?.lastName
                          ? props.values.lastName
                          : ''
                        : props.values.shippingLastName
                    }
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        shippingLastName: e.target.value,
                      })
                    }
                    margin="normal"
                    error={!isAValidName(props.values?.shippingLastName)}
                  />
                </Grid2>
                <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Telefono"
                    fullWidth
                    disabled={shippingDataCheck}
                    className={classes.textField}
                    value={
                      shippingDataCheck
                        ? props.values?.phone
                          ? props.values.phone
                          : ''
                        : props.values.shippingPhone
                    }
                    onChange={(e) => {
                      props.setValues({
                        ...props.values,
                        shippingPhone: e.target.value,
                      });
                    }}
                    required
                    margin="normal"
                    error={
                      props.values?.shippingPhone !== undefined &&
                      props.values?.shippingPhone !== '' &&
                      !isAValidPhoneNum(props.values?.shippingPhone)
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalPhoneIcon color="secondary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <Tooltip
                          onClick={(e) => setOpenTooltipPh2(!openTooltipPh2)}
                          open={openTooltipPh2}
                          onClose={(leaveDelay) => setOpenTooltipPh2(false)}
                          title={
                            !isAValidPhoneNum(props.values?.phone) &&
                            props.values?.phone !== undefined ? (
                              <div>
                                <div>ej: 584141234567 ó +584141234567 ó 04143201028</div>
                                Formato no válido.
                              </div>
                            ) : (
                              'ej: 584141234567 ó +584141234567 ó 04143201028'
                            )
                          }
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid2>
                <Grid item lg={12} md={12} sm={12} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    fullWidth
                    label="Dirección de envio"
                    className={classes.textField}
                    multiline
                    disabled={shippingDataCheck}
                    rows={3}
                    helperText="Incluir todos los detalles posibles, incluidas referencias."
                    value={
                      shippingDataCheck
                        ? props.values?.address
                          ? props.values.address
                          : ''
                        : props.values.shippingAddress
                    }
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        shippingAddress: e.target.value,
                      })
                    }
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HomeIcon color="secondary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid2>
                <Grid item lg={6} md={6} sm={12} xs={12} className={classes.gridInput}>
                  <FormControl style={{ minWidth: '100%' }} variant="outlined">
                    <InputLabel>Método de entrega</InputLabel>
                    <Select
                      label="Método de entrega"
                      className={classes.textField}
                      value={props.values?.shippingMethod || ''}
                      onChange={(e) => {
                        props.setValues({
                          ...props.values,
                          shippingMethod: e.target.value,
                        });
                      }}
                    >
                      <MenuItem value="">
                        <em></em>
                      </MenuItem>
                      {shippingList &&
                        shippingList.map((n) => <MenuItem value={n}>{n.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid2>
                <Grid item lg={6} md={6} sm={12} xs={12} className={classes.gridInput}>
                  <FormControl style={{ minWidth: '100%' }} variant="outlined">
                    <TextField
                      style={{
                        width: '100%',
                      }}
                      label="Fecha de Entrega"
                      type="date"
                      variant="outlined"
                      format="dd-MM-yyyy"
                      value={props.values?.today}
                      error={props.values?.today < stringReadyDate}
                      className={classes.textField}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(e) => {
                        selectShDate(e.target.value);
                      }}
                    />
                  </FormControl>
                </Grid2>
                <Grid>
                  <div style={{ marginTop: 10, marginLeft: 10 }}>
                    {'Tu pedido estará listo el día ' +
                      days[readyDate.getDay()] +
                      ' ' +
                      readyDate.getDate() +
                      ' de ' +
                      months[readyDate.getMonth()] +
                      ', si está listo antes te lo notificaremos.'}
                  </div>
                </Grid2>
              </Grid2>
            </form>
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={props.expanded === 'billing'}
          onChange={handleAccordionExpansion('billing')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Datos de Facturación</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form autoComplete="off">
              <Grid container>
                <Grid
                  item
                  lg={12}
                  md={12}
                  sm={12}
                  xs={12}
                  // className={classes.gridInput}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={billingDataCheck}
                        onChange={(e) => {
                          if (billingShDataCheck) {
                            setBillingDataCheck(!billingDataCheck);
                            setBillingShDataCheck(!billingShDataCheck);
                          } else {
                            setBillingDataCheck(!billingDataCheck);
                          }
                        }}
                      />
                    }
                    label="Igual a datos básicos"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={billingShDataCheck}
                        onChange={(e) => {
                          if (billingDataCheck) {
                            setBillingShDataCheck(!billingShDataCheck);
                            setBillingDataCheck(!billingDataCheck);
                          } else {
                            setBillingShDataCheck(!billingShDataCheck);
                          }
                        }}
                      />
                    }
                    label="Igual a datos de envío"
                  />
                </Grid2>
                <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Nombre"
                    fullWidth
                    className={classes.textField}
                    disabled={billingDataCheck || billingShDataCheck}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingName
                          ? props.values.shippingName
                          : ''
                        : billingDataCheck
                          ? props.values?.name
                            ? props.values.name
                            : ''
                          : props.values.billingShName || ''
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingShName: e.target.value,
                      })
                    }
                    required
                    margin="normal"
                    error={!isAValidName(props.values?.billingShName)}
                  />
                </Grid2>
                <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Apellido"
                    fullWidth
                    className={classes.textField}
                    disabled={billingDataCheck || billingShDataCheck}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingLastName
                          ? props.values.shippingLastName
                          : ''
                        : billingDataCheck
                          ? props.values?.lastName
                            ? props.values.lastName
                            : ''
                          : props.values.billingShLastName || ''
                    }
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingShLastName: e.target.value,
                      })
                    }
                    margin="normal"
                    error={!isAValidName(props.values?.billingShLastName)}
                  />
                </Grid2>
                <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Cédula o RIF"
                    fullWidth
                    className={classes.textField}
                    disabled={billingDataCheck || billingShDataCheck}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingCi
                          ? props.values.shippingCi
                          : ''
                        : billingDataCheck
                          ? props.values?.ci
                            ? props.values.ci
                            : ''
                          : props.values.billingCi || ''
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingCi: e.target.value,
                      })
                    }
                    required
                    error={
                      props.values?.ci !== undefined && !isAValidCi(props.values?.ci)
                    }
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <Tooltip
                          onClick={(e) => setOpenTooltip2(!openTooltip2)}
                          open={openTooltip2}
                          onClose={(leaveDelay) => setOpenTooltip2(false)}
                          title={
                            !isAValidCi(props.values?.ci) &&
                            props.values?.ci !== undefined
                              ? 'ej: V12345679 ó J000123456 \n' + 'Formato no válido.'
                              : 'ej: V12345679 ó J000123456'
                          }
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid2>
                <Grid item lg={8} md={8} sm={8} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Razón Social"
                    fullWidth
                    className={classes.textField}
                    disabled={billingDataCheck || billingShDataCheck}
                    value={props.values?.billingCompany || ''}
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingCompany: e.target.value,
                      })
                    }
                    required
                    margin="normal"
                    // error={!isAValidName(props.values?.billingShName)}
                  />
                </Grid2>

                <Grid item lg={4} md={4} sm={4} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Telefono"
                    fullWidth
                    disabled={billingDataCheck || billingShDataCheck}
                    className={classes.textField}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingPhone
                          ? props.values.shippingPhone
                          : ''
                        : billingDataCheck
                          ? props.values?.phone
                            ? props.values.phone
                            : ''
                          : props.values.billingShPhone || ''
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingShPhone: e.target.value,
                      })
                    }
                    required
                    margin="normal"
                    error={
                      !isAValidPhoneNum(props.values?.billingShPhone) &&
                      props.values?.billingShPhone !== undefined
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalPhoneIcon color="secondary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <Tooltip
                          onClick={(e) => setOpenTooltipPh3(!openTooltipPh3)}
                          open={openTooltipPh3}
                          onClose={(leaveDelay) => setOpenTooltipPh3(false)}
                          title={
                            !isAValidPhoneNum(props.values?.phone) &&
                            props.values?.phone !== undefined ? (
                              <div>
                                <div>ej: 584141234567 ó +584141234567 ó 04143201028</div>
                                Formato no válido.
                              </div>
                            ) : (
                              'ej: 584141234567 ó +584141234567 ó 04143201028'
                            )
                          }
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid2>
                <Grid item lg={12} md={12} sm={12} xs={12} className={classes.gridInput}>
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    fullWidth
                    label="Dirección de facturación"
                    multiline
                    minRows={3}
                    disabled={billingDataCheck || billingShDataCheck}
                    className={classes.textField}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingAddress
                          ? props.values.shippingAddress
                          : ''
                        : billingDataCheck
                          ? props.values?.address
                            ? props.values.address
                            : ''
                          : props.values.billingShAddress || ''
                    }
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingShAddress: e.target.value,
                      })
                    }
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid2>
              </Grid2>
            </form>
          </AccordionDetails>
        </Accordion>
      </div>
    </>
  );
}

export default ConsumerForm;
