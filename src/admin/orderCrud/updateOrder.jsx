import React from 'react';
import {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Title from '../adminMain/Title';
import axios from 'axios';
// import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
// import clsx from 'clsx';
// import Checkbox from '@material-ui/core/Checkbox';
import { useHistory } from 'react-router-dom';
import Backdrop from '@material-ui/core/Backdrop';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import { searchConsumer } from '../consumerCrud/consumerServices';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  form: {
      height: 'auto',
      padding: '15px'
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));
//Rolo e peo chamo jajajja
export default function UpdateOrder(props) {
    const classes = useStyles();
    const history = useHistory();
    const [ typedConsumer, setTypedConsumer ] = useState('');
    const [ consumer, setConsumer ] = useState('');
    // const [ active, setActive ] = useState(props.order.active || '');
    // const [ id, setId ] = useState(props.order.id || '');
    // const [ consumerId, setConsumerId ] = useState('');
    // const [ orderType, setOrderType ] = useState(props.order.orderType || '');
    // const [ createdOn, setCreatedOn ] = useState(props.order.instructions || '');
    // const [ createdBy, setCreatedBy ] = useState(props.order.paymentData || '');
    // const [ subtotal, setSubtotal ] = useState(props.order.subtotal);
    // const [ tax, setTax ] = useState(props.order.tax || '');
    // const [ total, setTotal ] = useState(props.order.total || '');
    // const [ shippingAddress, setShippingAddress ] = useState(props.order.shippingAddress || '');
    // const [ billingAddress, setBillingAddress ] = useState(props.order.billingAddress || '');
    // const [ shippingPhone, setShippingPhone ] = useState(props.order.shippingPhone || '');
    // const [ internalShippingMethod, setInternalShippingMethod ] = useState(props.order.internalShippingMethod || '');
    // const [ domesticShippingMethod, setDomesticShippingMethod ] = useState(props.order.domesticShippingMethod || '');
    // const [ internationalShippingMethod, setInternationalShippingMethod ] = useState(props.order.internationalShippingMethod || '');
    // const [ paymentMethodID, setPaymentMethodID ] = useState(props.order.paymentMethodID || '');
    // const [ generalProductionStatus, setGeneralProductionStatus ] = useState(props.order.generalProductionStatus || '');
    // const [ paymentStatus, setPaymentStatus ] = useState(props.order.paymentStatus || '');
    // const [ shippingStatus, setShippingStatus ] = useState(props.order.shippingStatus || '');
    // const [ observations, setObservations ] = useState(props.order.observations || '');
    // const [ isSaleByPrixer, setIsSaleByPrixer ] = useState(props.order.isSaleByPrixer || '');    
    
    const [loading, setLoading] = useState(false);
    const [buttonState, setButtonState] = useState(false);

    //Error states.
    const [errorMessage, setErrorMessage] = useState();
    const [snackBarError, setSnackBarError] = useState(false);
    // const [passwordError, setPasswordError] = useState();
    // const [emailError, setEmailError] = useState();


    const handleSubmit = async (e)=> {
      e.preventDefault();
      // if(!active){
      //   setErrorMessage('Por favor completa todos los campos requeridos.');
      //   setSnackBarError(true);
      //   e.preventDefault();
      // } else {
        setLoading(true);
        setButtonState(true);
        
        const data = {
          // 'id': id,
          'consumerId': '', //De búsqueda - Debo obtener la lista de los clientes en caliente.
          // 'orderType' : orderType, // De Lista - Lista cableada ['Consignación', 'Venta', 'Obsequio']
          // 'createdOn' : new Date(), // No va
          // 'createdBy': JSON.parse(localStorage.getItem('adminToken')), // No va
          // 'subtotal' : subtotal, // Calculado - Campo calculado en base a la selección de productos en Order Detail
          // 'tax': tax, // Calculado - Campo calculado en base a la selección de productos en Order Detail
          // 'total' : total, // Calculado - Campo calculado en base a la selección de productos en Order Detail
          // 'shippingAddress' : shippingAddress, //Calculado - Debo obtener la lista de los clientes en caliente.
          // 'billingAddress' : billingAddress, //Calculado - Debo obtener la lista de los clientes en caliente.
          // 'shippingPhone' : shippingPhone, //Calculado - Debo obtener la lista de los clientes en caliente.
          // 'internalShippingMethod': internalShippingMethod, // De Lista - Lista cableada ['Yalo', 'DH', 'CC', etc]
          // 'domesticShippingMethod' : domesticShippingMethod, // De Lista - Lista cableada ['Tealca', 'Zoom', 'MRW', etc]
          // 'internationalShippingMethod': internationalShippingMethod, // De Lista - Lista cableada ['FedEx', 'DHL', 'MRW', etc]
          // 'paymentMethodID' : paymentMethodID, // Calculado - Debo obtenerlos de BD
          // 'generalProductionStatus' : generalProductionStatus,  // De Lista - Lista cableada ['Solicitad', 'Por producir', 'En producción', etc]
          // 'paymentStatus': paymentStatus,  // De Lista - Lista cableada ['Por pagar', 'Pagado parcialmente', 'Pagado', 'Devuelto', etc]
          // 'shippingStatus' : shippingStatus,  // De Lista - Lista cableada ['Por entregar', 'Entregado', 'Devuelto', etc]
          // 'observations': observations, // Campo simple.
          // 'isSaleByPrixer' : isSaleByPrixer // Campo simple.
        }

        const base_url= process.env.REACT_APP_BACKEND_URL + "/order/update";
        const response = await axios.post(base_url,data);
        if(response.data.success === false){
          setLoading(false);
          setButtonState(false);
          setErrorMessage(response.data.message);
          setSnackBarError(true);
        } else {
          setErrorMessage('Actualización de consumidor exitosa.');
          setSnackBarError(true);
          history.push('/admin/order/read');
        }
      // }

    }

    return (
        <React.Fragment>
        {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        }
          <Title>Actualización de order de venta</Title>
            <form className={classes.form} noValidate onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                          <FormControl variant="outlined" className={classes.form} xs={12} sm={12} md={12}>
                            <InputLabel required id="consumer">Consumidor</InputLabel>
                            <Select
                              labelId="consumer"
                              id="consumer"
                              value={typedConsumer}
                              onChange={(e)=>{setConsumer(searchConsumer(e.target.value)); setTypedConsumer(e.target.value)}}
                              label="artType"
                            >
                              <MenuItem value="">
                                <em></em>
                              </MenuItem>
                              {
                              consumer &&
                              consumer.map((n) => (
                                <MenuItem key={n._id} value={n._id}>{n.firstname + ' ' + n.lastname + ' - (' + n.email + ')'}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        </Grid>
                  <Button variant="contained" color="primary" type="submit" disabled={buttonState} style={{ marginTop: 20}}>
                    Actualizar
                  </Button>
                </Grid>
            </form>
            <Snackbar
              open={snackBarError}
              autoHideDuration={1000}
              message={errorMessage}
              className={classes.snackbar}
            />
        </React.Fragment>
      );
}