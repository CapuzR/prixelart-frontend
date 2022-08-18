import React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Title from '../../adminMain/Title';
// import axios from 'axios';
// import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
// import FormControl from '@material-ui/core/FormControl';
// import clsx from 'clsx';
// import Checkbox from '@material-ui/core/Checkbox';
// import { useHistory } from 'react-router-dom';
import Backdrop from '@material-ui/core/Backdrop';
// import InputLabel from '@material-ui/core/InputLabel';
// import MenuItem from '@material-ui/core/MenuItem';
// import Select from '@material-ui/core/Select';
// import Autocomplete from '@material-ui/lab/Autocomplete';
import orderServices from '../../adminMain/orders/orderServices';

import OrderBasicInfo from './orderBasicInfo';
import OrderDetails from './orderDetails';
// import { searchConsumer, getConsumerById } from '../../consumerCrud/consumerServices';

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


  // function sleep(delay = 0) {
  //   return new Promise((resolve) => {
  //     setTimeout(resolve, delay);
  //   });
  // }


  // const orderTypeList = ['Consignación', 'Venta', 'Obsequio'];
  // const productionStatusList = ['Por solicitar', 'Solicitado', 'Por producir', 'En producción', 'En diseño'];
  // const shippingStatusList = ['Por entregar', 'Entregado', 'Devuelto', 'Cambio'];
  // const internalShippingList = ['Yalo', 'DH', 'CC', 'No aplica'];
  // const domesticShippingList = ['Tealca', 'Zoom', 'MRW', 'No aplica'];
  // const internationalShippingList = ['FedEx', 'DHL', 'MRW', 'No aplica'];
  // const selectedProductI = [
  //     {
  //         // art: {
  //         //     'artId': '',
  //         //     'title': '',
  //         //     'prixerUsername': '',
  //         //     'userId': '',
  //         // },
  //         base: {
  //             'thumbUrl': '',
  //             'active' : true,
  //             'name' : '',
  //             'description' : '',
  //             'category' : '',
  //             'considerations' : '',
  //             publicPrice: {
  //                 'from': '',
  //                 'to': '',
  //             },
  //             prixerPrice: {
  //                 'from': '',
  //                 'to': '',
  //             },
  //             hasSpecialVar: ''
  //         }
  //     }
  // ];
  // const detailOptionsI = [
  //   {
  //         'artId': '',
  //         'title': '',
  //         'prixerUsername': '',
  //         'userId': ''
  // }]

  const basicInformation = {
    'consumer': '',
    'orderType': 'Venta',
    'shippingAddress': '',
    'billingAddress': '',
    'shippingPhone': '',
    'internalShippingMethod': 'Yalo',
    'domesticShippingMethod': 'No aplica',
    'internationalShippingMethod': 'No aplica',
    'generalProductionStatus': 'Por solicitar',
    'shippingStatus': 'Por entregar',
    'observations': '',
    'isSaleByPrixer': false,
    'selectedConsumer': ''
  }



export default function CreateOrder(props) {
    // const [open, setOpen] = React.useState(false);
    const [ orderSteps, setOrderSteps ] = useState('basic');
    // const [options, setOptions] = React.useState([]);
    const [selectedArt, setSelectedArt] = React.useState([]);
    // const consumerLoading = open && options.length === 0;
    const classes = useStyles();
    // const history = useHistory();
    // const [ typedConsumer, setTypedConsumer ] = useState('');
    // const [ orderId, setOrderId ] = useState('');
    // const [ consumer, setConsumer ] = useState('');
    // const [ consumerId, setConsumerId ] = useState('');
    // const [ orderType, setOrderType ] = useState('Venta');
    // const [ createdOn, setCreatedOn ] = useState('');
    // const [ createdBy, setCreatedBy ] = useState('');
    // const [ subtotal, setSubtotal ] = useState(props.order.subtotal);
    // const [ tax, setTax ] = useState(props.order.tax || '');
    // const [ total, setTotal ] = useState(props.order.total || '');
    // const [ shippingAddress, setShippingAddress ] = useState('');
    // const [ billingAddress, setBillingAddress ] = useState('');
    // const [ shippingPhone, setShippingPhone ] = useState('');
    // const [ internalShippingMethod, setInternalShippingMethod ] = useState('Yalo');
    // const [ domesticShippingMethod, setDomesticShippingMethod ] = useState('No aplica');
    // const [ internationalShippingMethod, setInternationalShippingMethod ] = useState('No aplica');
    // const [ paymentMethodID, setPaymentMethodID ] = useState(props.order.paymentMethodID || '');
    // const [ generalProductionStatus, setGeneralProductionStatus ] = useState('Solicitado');
    // const [ paymentStatus, setPaymentStatus ] = useState(props.order.paymentStatus || '');
    // const [ shippingStatus, setShippingStatus ] = useState('Por entregar');
    // const [ observations, setObservations ] = useState('');
    // const [ isSaleByPrixer, setIsSaleByPrixer ] = useState(false);  
    const [ selectedProduct, setSelectedProduct ] = useState([]);  
    const [ detailOptions, setDetailOptions ] = React.useState();

    const [ basicOptions, setBasicOptions ] = useState([]);
    const [ basicInfo, setBasicInfo ] = useState(basicInformation);   
    
    const [loading, setLoading] = useState(false);
    const [buttonState, setButtonState] = useState(false);

    //Error states.
    // const [errorMessage, setErrorMessage] = useState();
    // const [snackBarError, setSnackBarError] = useState(false);
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
        
        // const data = {
        //   'orderId': orderId,
        //   'consumerId': consumerId, //De búsqueda - Debo obtener la lista de los clientes en caliente.
        //   'orderType' : orderType, // De Lista - Lista cableada ['Consignación', 'Venta', 'Obsequio']
        //   'createdOn' : new Date(),
        //   'createdBy': JSON.parse(localStorage.getItem('adminToken')),
        //   // 'subtotal' : subtotal, // Calculado - Campo calculado en base a la selección de productos en Order Detail
        //   // 'tax': tax, // Calculado - Campo calculado en base a la selección de productos en Order Detail
        //   // 'total' : total, // Calculado - Campo calculado en base a la selección de productos en Order Detail
        //   'shippingAddress' : shippingAddress, //Calculado - Debo obtener la lista de los clientes en caliente.
        //   'billingAddress' : billingAddress, //Calculado - Debo obtener la lista de los clientes en caliente.
        //   'shippingPhone' : shippingPhone, //Calculado - Debo obtener la lista de los clientes en caliente.
        //   'internalShippingMethod': internalShippingMethod, // De Lista - Lista cableada ['Yalo', 'DH', 'CC', etc]
        //   'domesticShippingMethod' : domesticShippingMethod, // De Lista - Lista cableada ['Tealca', 'Zoom', 'MRW', etc]
        //   'internationalShippingMethod': internationalShippingMethod, // De Lista - Lista cableada ['FedEx', 'DHL', 'MRW', etc]
        //   // 'paymentMethodID' : paymentMethodID, // Calculado - Debo obtenerlos de BD
        //   'generalProductionStatus' : generalProductionStatus,  // De Lista - Lista cableada ['Solicitad', 'Por producir', 'En producción', etc]
        //   // 'paymentStatus': paymentStatus,  // Calculado - Hay que validar que la suma de los pagos sea igual al total. De Lista - Lista cableada ['Por pagar', 'Pagado parcialmente', 'Pagado', 'Devuelto', etc]
        //   'shippingStatus' : shippingStatus,  // De Lista - Lista cableada ['Por entregar', 'Entregado', 'Devuelto', etc]
        //   'observations': observations, // Campo simple.
        //   'isSaleByPrixer' : isSaleByPrixer // Campo simple.
        // }
        
        // const base_url= process.env.REACT_APP_BACKEND_URL + "/order/create";
        // const response = await axios.post(base_url,data);
        // if(response.data.success === false){
        //   setLoading(false);
        //   setButtonState(false);
        //   setErrorMessage(response.data.message);
        //   setSnackBarError(true);
        // } else {
        //   setErrorMessage('Actualización de consumidor exitosa.');
        //   setSnackBarE rror(true);
        //   history.push('/admin/order/read');
        // }
      // }

    }

    // useEffect(()=> {
    //   !selectedProduct && 
    //     setSelectedProduct(selectedProductI);

      
    //   !detailOptions && 
    //     setDetailOptions(detailOptionsI);

      
    //   // !selectedArt && 
    //   //   setSelectedArt([]);
    // });

    useEffect(()=> {
      async function initBlankOrder() {
        const initOrder = await orderServices.initBlankOrder({order: props.orderState});
        props.setOrderState(initOrder);
      };
      initBlankOrder();
    },[props]);

    return (
        <React.Fragment>
          {
            (props.orderState.selectedOrder) &&
          <>
          {
          <Backdrop className={classes.backdrop} open={loading}>
            <CircularProgress color="inherit" />
          </Backdrop>
          }
          <Title>Creación de orden de venta</Title>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            {
              orderSteps === 'basic' ?
                <Grid>
                  <Grid container>
                    <OrderBasicInfo orderState={props.orderState} setOrderState={props.setOrderState} basicInfo={basicInfo} setBasicInfo={setBasicInfo} setOptions={setBasicOptions} options={basicOptions} />
                  </Grid>
                  <Grid container>
                    <Grid item xs={6} align="left">
                      <Button variant="contained" color="primary" type="submit" disabled={buttonState} style={{ marginTop: 20}}>
                        Crear
                      </Button>
                    </Grid>
                    <Grid item xs={6} align="right">
                      <Button variant="contained" color="primary" disabled={buttonState} style={{ marginTop: 20}} onClick={()=>{setOrderSteps('details')}}>
                        Agregar productos
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              : orderSteps === 'details' &&
                <Grid>
                  <Grid container xs={12} justifyContent="space-between">
                    <OrderDetails orderState={props.orderState} setOrderState={props.setOrderState} 
                    selectedProduct={selectedProduct} 
                    setSelectedProduct={setSelectedProduct}
                    options={detailOptions}
                    setOptions={setDetailOptions}
                    selectedArt={selectedArt}
                    setSelectedArt={setSelectedArt} />
                  </Grid>
                  <Grid container xs={12} justifyContent="space-between">
                    <Grid item xs={6} align="left">
                      <Button variant="contained" color="primary" type="submit" disabled={buttonState} style={{ marginTop: 20}}>
                        Crear
                      </Button>
                    </Grid>
                    <Grid item xs={6} align="right">
                      <Button variant="contained" color="primary" disabled={buttonState} style={{ marginTop: 20}} onClick={()=>{setOrderSteps('basic')}}>
                        Básicos
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
            }
          </form>
          <Snackbar
            // open={snackBarError}
            autoHideDuration={1000}
            // message={errorMessage}
            className={classes.snackbar}
          />
          </>
          }
        </React.Fragment>
      );
}