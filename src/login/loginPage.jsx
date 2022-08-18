
//Programar el Recuérdame.
//Llevar el Password a un componente propio.

import React, { useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { useHistory } from "react-router-dom";
import { useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import validations from '../utils/validations';
import jwt from 'jwt-decode';


import clsx from 'clsx';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://prixelart.com/">
        prixelart.com
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundRepeat: 'no-repeat',
    // backgroundColor: '#404e5c',
    // theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
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
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Login() {
  const classes = useStyles();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [art, setArt] = useState(false);

  //Error states.
  const [emailError, setEmailError] = useState();
  const [passwordError, setPasswordError] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  const now = new Date();

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!email) || (!password)) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      setSnackBarError(true);
    } else {
      const base_url = process.env.REACT_APP_BACKEND_URL + "/login";
      const data = {
        'email': email,
        'password': password
      };
      axios.post(base_url, data)
        .then(response => {
          if (response.data.error_info === 'error_pw') {
            setPassword('');
            setPasswordError(true);
            setErrorMessage(response.data.error_message);
            setSnackBarError(true);
          } else if (response.data.error_info === 'error_email') {
            setPassword('');
            setEmailError(true);
            setErrorMessage(response.data.error_message);
            setSnackBarError(true);
          } else {
            setPasswordError(true);
            setErrorMessage('Inicio de sesión completado.');
            setSnackBarError(true);
            const token = jwt(response.data.token);
            localStorage.setItem('token', JSON.stringify(token));
            localStorage.setItem('tokenExpire', JSON.stringify(now.getTime() + 21600000));
            history.push({ pathname: "/" + response.data.username });
          }
        })
        .catch(error => {
          console.log(error);
        })
    }
  }

  useEffect(()=> {
    const base_url= process.env.REACT_APP_BACKEND_URL + "/art/random";
  
     axios.get(base_url)
      .then(response =>{
        if(response.data.arts){
          response.data.arts.imageUrl &&
            setArt(response.data.arts.largeThumbUrl);
        }
      });
  }, []);


  const handleEmailChange = (e) => {
    if (validations.isAValidEmail(e.target.value)) {
      setEmail(e.target.value);
      setEmailError(false);
      setSnackBarError(false);
    } else {
      setEmail(e.target.value);
      setErrorMessage('Por favor introduce un correo electrónico válido.');
      setSnackBarError(true);
      setEmailError(true);
    }
  }


  //Password
  const handlePasswordChange = (e) => {
    if (validations.isAValidPassword(e.target.value)) {
      setPassword(e.target.value);
      setPasswordError(false);
      setSnackBarError(false);
    } else {
      setPassword(e.target.value);
      setPasswordError(true);
      setErrorMessage('Disculpa, tu contraseña debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial.');
      setSnackBarError(true);
    }
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  //END Password



  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} style={{backgroundImage: 'url('+art+')'}} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Iniciar sesión
          </Typography>
          <form className={classes.form} onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                  <InputLabel htmlFor="email">Correo electrónico</InputLabel>
                  <OutlinedInput
                    id="email"
                    value={email}
                    label="Correo electrónico"
                    error={emailError}
                    onChange={handleEmailChange}
                    labelWidth={100}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                  <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
                  <OutlinedInput
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    label="Contraseña"
                    error={passwordError}
                    onChange={handlePasswordChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                    labelWidth={100}
                  />
                </FormControl>
              </Grid>
              {/* <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Recuérdame"
              /> */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Inicia sesión
            </Button>
              <Grid container justify={"space-between"}>
                {/* <Grid item xs>
                  <Link href="#" variant="body2">
                    ¿Olvidaste tu contraseña?
                </Link>
                </Grid> */}
                <Grid item>
                  <Link href="#" onClick={()=>{history.push({pathname:"/registrar"})}} variant="body2">
                    {"¿No tienes cuenta? Regístrate"}
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" onClick={()=>{history.push({pathname:"/olvido-contraseña"})}} variant="body2">
                    {"¿Olvidaste tu contraseña? Recupérala"}
                  </Link>
                </Grid>
              </Grid>
              <Box mt={5}>
                <Copyright />
              </Box>
              <Snackbar
                open={snackBarError}
                autoHideDuration={6000}
                message={errorMessage}
                className={classes.snackbar}
              />
            </Grid>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}