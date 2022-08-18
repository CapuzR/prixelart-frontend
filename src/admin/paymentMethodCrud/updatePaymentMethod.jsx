import React from 'react';
import {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Title from '../adminMain/Title';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import clsx from 'clsx';
import Checkbox from '@material-ui/core/Checkbox';
import { useHistory } from 'react-router-dom';
import Backdrop from '@material-ui/core/Backdrop';

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

export default function UpdatePaymentMethod(props) {
    const classes = useStyles();
    const history = useHistory();
    const [ active, setActive ] = useState(props.paymentMethod.active);
    // const [ id, setId ] = useState(props.paymentMethod._id);
    const [ name, setName ] = useState(props.paymentMethod.name);
    const [ instructions, setInstructions ] = useState(props.paymentMethod.instructions);
    const [ paymentData, setPaymentData ] = useState(props.paymentMethod.paymentData);
    const [loading, setLoading] = useState(false);
    const [buttonState, setButtonState] = useState(false);

    //Error states.
    const [errorMessage, setErrorMessage] = useState();
    const [snackBarError, setSnackBarError] = useState(false);


    const handleSubmit = async (e)=> {
      e.preventDefault();
      if(!active && 
        !instructions && 
        !paymentData && 
        !name){
        setErrorMessage('Por favor completa todos los campos requeridos.');
        setSnackBarError(true);
        e.preventDefault();
      } else {
        setLoading(true);
        setButtonState(true);
        
        const data = {
          'id': props.paymentMethod._id,
          'active' : active,
          'name': name,
          'instructions' : instructions,
          'paymentData' : paymentData
        }

        const base_url= process.env.REACT_APP_BACKEND_URL + "/payment-method/update";
        const response = await axios.post(base_url,data);
        if(response.data.success === false){
          setLoading(false);
          setButtonState(false);
          setErrorMessage(response.data.message);
          setSnackBarError(true);
        } else {
          setErrorMessage('Actualización de consumidor exitosa.');
          setSnackBarError(true);
          history.push('/admin/payment-method/read');
        }
      }

    }

    return (
        <React.Fragment>
        {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        }
          <Title>Actualización de Método de pago</Title>
            <form className={classes.form} noValidate onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                        <Grid container xs={6}>
                          <Grid item xs={12}>
                              <Checkbox 
                                  checked={active}
                                  color="primary" 
                                  inputProps={{ 'aria-label': 'secondary checkbox' }}
                                  onChange={()=>{active?setActive(false):setActive(true)}}
                              /> Habilitado
                          </Grid>
                        </Grid>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl variant="outlined" xs={12} fullWidth={true}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                display="inline"
                                id="name"
                                label="Nombre"
                                name="name"
                                autoComplete="name"
                                value={name}
                                onChange={(e) => {setName(e.target.value);}}
                            />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl variant="outlined" xs={12} fullWidth={true}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                multiline
                                display="inline"
                                id="paymentData"
                                label="Datos para el pago:"
                                name="paymentData"
                                autoComplete="paymentData"
                                value={paymentData}
                                onChange={(e) => {setPaymentData(e.target.value);}}
                            />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                            <TextField
                                variant="outlined"
                                required
                                display="inline"
                                fullWidth
                                id="instructions"
                                label="Intrucciones"
                                name="instructions"
                                autoComplete="instructions"
                                value={instructions}
                                onChange={(e) => {setInstructions(e.target.value);}}
                            />
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