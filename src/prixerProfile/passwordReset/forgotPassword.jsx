//Llevar el Password a un componente propio.

import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useHistory } from "react-router-dom";


import Copyright from '../../sharedComponents/Copyright/copyright';

//material-ui
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import clsx from 'clsx';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function ForgotPassword() {
  const classes = useStyles();
  const history = useHistory();
  const [email, setEmail] = useState('');

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleSubmit = (e)=> {
    e.preventDefault();
    if(!email) {
      setErrorMessage('Por favor indica tu correo electrónico registrado para reestablecer tu contraseña.');
      setSnackBarError(true);
    } else {
    const base_url= process.env.REACT_APP_BACKEND_URL + "/forgot-password";
    const data= {
      'email': email,
      };
    axios.post(base_url,data)
    .then(async response =>{
        if(!response.data.success){
        //   setCurrentPasswordError(true);
          setErrorMessage(response.data.info);
          setSnackBarError(true);
        } else {
          setErrorMessage('Hemos enviado un enlace a tu correo electrónico.');
          setSnackBarError(true);
          await sleep(3000);
          history.push({pathname:'/'});
        }
    })
    .catch(error =>{
        console.log(error.response)
    })
  }
   } 


   const handleEmailChange = (e)=> {
     setEmail(e.target.value)
   }


  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Solicita el cambio de contraseña
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    variant="outlined"
                    required
                    fullWidth
                    // error={emailError}
                    id="email"
                    label="Correo electrónico"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={handleEmailChange}
                />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            value="submit"
          >
            Recuperar acceso
          </Button>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
      <Snackbar
          open={snackBarError}
          autoHideDuration={6000}
          message={errorMessage}
          className={classes.snackbar}
        />
    </Container>
  );
}