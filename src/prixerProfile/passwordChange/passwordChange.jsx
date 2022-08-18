//Llevar el Password a un componente propio.

import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useHistory } from "react-router-dom";

import validations from '../../utils/validations';
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

export default function PasswordChange() {
  const classes = useStyles();
  const history = useHistory();
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  //Error states.
  const [currentPasswordError, setCurrentPasswordError] = useState();
  const [newPasswordError, setNewPasswordError] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleSubmit = (e)=> {
    e.preventDefault();
    if((!newPassword)||(!currentPassword)) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      setSnackBarError(true);
    } else {
    const base_url= process.env.REACT_APP_BACKEND_URL + "/password-change";
    const data= {
      'username': JSON.parse(localStorage.getItem('token')).username,
      'currentPassword': currentPassword,
      'newPassword': newPassword
      };
    axios.post(base_url,data)
    .then(response =>{
        if(response.data.info === 'error_current_password'){
          setCurrentPasswordError(true);
          setErrorMessage(response.data.message);
          setSnackBarError(true);
        } else if(response.data.info === 'error_new_password') {
          setNewPasswordError(true);
          setErrorMessage(response.data.message);
          setSnackBarError(true);
        } else {
          setErrorMessage('Cambio de clave exitoso.');
          setSnackBarError(true);
          history.push({pathname:'/'+JSON.parse(localStorage.getItem('token')).username});
        }
    })
    .catch(error =>{
        console.log(error.response)
    })
  }
   } 

//Current password
   const handleCurrentPasswordChange = (e)=> {
    if(validations.isAValidPassword(e.target.value)) {
      setCurrentPassword(e.target.value); 
      setCurrentPasswordError(false);
      setSnackBarError(false);
    } else {
      setCurrentPassword(e.target.value); 
      setCurrentPasswordError(true); 
      setErrorMessage('Disculpa, esta no puede ser tu contraseña actual. Debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial.');
      setSnackBarError(true);
    }
   }

    const handleClickShowCurrentPassword = () => {
      setShowCurrentPassword(!showCurrentPassword);
    };
  
    const handleMouseDownCurrentPassword = (event) => {
      event.preventDefault();
    };
//END Current password

//New password
const handleNewPasswordChange = (e)=> {
    if(validations.isAValidPassword(e.target.value)) {
      setNewPassword(e.target.value); 
      setNewPasswordError(false);
      setSnackBarError(false);
    } else {
      setNewPassword(e.target.value); 
      setNewPasswordError(true); 
      setErrorMessage('Disculpa, tu contraseña nueva debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial.');
      setSnackBarError(true);
    }
   }

    const handleClickShowNewPassword = () => {
      setShowNewPassword(!showNewPassword);
    };
  
    const handleMouseDownNewPassword = (event) => {
      event.preventDefault();
    };
//END New password


  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Cambia tu contraseña
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
            <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
              <InputLabel htmlFor="current-password">Contraseña actual</InputLabel>
              <OutlinedInput
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                label="Contraseña actual"
                error={currentPasswordError}
                onChange={handleCurrentPasswordChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowCurrentPassword}
                      onMouseDown={handleMouseDownCurrentPassword}
                      edge="end"
                    >
                      {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                labelWidth={100}
              />
            </FormControl>
            </Grid>
            <Grid item xs={12}>
            <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
              <InputLabel htmlFor="new-password">Contraseña nueva</InputLabel>
              <OutlinedInput
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                label="Contraseña nueva"
                error={newPasswordError}
                onChange={handleNewPasswordChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowNewPassword}
                      onMouseDown={handleMouseDownNewPassword}
                      edge="end"
                    >
                      {showNewPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                labelWidth={100}
              />
            </FormControl>
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
            Cambiar contraseña
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