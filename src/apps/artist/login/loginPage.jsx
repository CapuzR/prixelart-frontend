//Programar el Recuérdame.
//Llevar el Password a un componente propio.

import React, { useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { isAValidEmail, isAValidPassword, isAValidUsername } from 'utils/validations.ts';
import jwt from 'jwt-decode';
import clsx from 'clsx';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import TermsModal from 'apps/artist/components/Terms';
import { fetchTermsText, fetchTermsAgreementStatus } from './api';

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
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsText, setTermsText] = useState('');

  //Error states.
  const [emailError, setEmailError] = useState();
  const [passwordError, setPasswordError] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  
  const now = new Date();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      setSnackBarError(true);
    } else {
      try {
        const base_url = import.meta.env.VITE_BACKEND_URL + '/login';
        console.log("base_url", base_url);
        const response = await axios.post(base_url, {
          email: email.toLowerCase(),
          password,
        },
        { withCredentials: true }
      );
        console.log("response", response);

        if (response.data.error_info) {
          setErrorMessage(response.data.error_message);
          setSnackBarError(true);
          if (response.data.error_info === 'error_pw') setPassword('');
          return;
        }

        const token = jwt(response.data.token);
        localStorage.setItem('token', JSON.stringify(token));
        localStorage.setItem('tokenExpire', JSON.stringify(now.getTime() + 21600000));
        // let role
        // = token.role
        // ? "Organization" && "org="
        // : "Prixer" && "prixer=";

        const userId = token.username;
        const hasAgreed = await fetchTermsAgreementStatus(userId);

        if (!hasAgreed) {
          // Fetch terms text and show modal if user hasn't agreed
          const terms = await fetchTermsText();
          setTermsText(terms);
          setTermsModalOpen(true);
        } else {
          // Redirect if terms already agreed
          redirectUser(token.role, response.data.username);
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrorMessage('Error al iniciar sesión.');
        setSnackBarError(true);
      }
    }
  };

  const redirectUser = (role, username) => {
    const rolePath = role === 'Organization' ? '/org=' : '/prixer=';
    window.location.href = `${import.meta.env.VITE_FRONTEND_URL}${rolePath}${username}`;
  };

  const handleTermsAcceptance = () => {
    setTermsModalOpen(false); // Close modal
    const token = JSON.parse(localStorage.getItem('token') || '{}');
    redirectUser(token.role, token.username); // Redirect to user page
  };

  useEffect(() => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/art/random';

    console.log("base_url", base_url);
    axios.get(base_url).then((response) => {
      if (response.data.arts) {
        response.data.arts.imageUrl && setArt(response.data.arts.largeThumbUrl);
      }
    });
  }, []);

  const handleEmailChange = (e) => {
    if (isAValidEmail(e.target.value)) {
      setEmail(e.target.value);
      setEmailError(false);
      setSnackBarError(false);
    } else {
      setEmail(e.target.value);
      setErrorMessage('Por favor introduce un correo electrónico válido.');
      setSnackBarError(true);
      setEmailError(true);
    }
  };

  //Password
  const handlePasswordChange = (e) => {
    if (isAValidPassword(e.target.value)) {
      setPassword(e.target.value);
      setPasswordError(false);
      setSnackBarError(false);
    } else {
      setPassword(e.target.value);
      setPasswordError(true);
      setErrorMessage(
        'Disculpa, tu contraseña debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial.'
      );
      setSnackBarError(true);
    }
  };

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
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        className={classes.image}
        style={{ backgroundImage: 'url(' + art + ')' }}
      />
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
                <FormControl
                  className={clsx(classes.margin, classes.textField)}
                  variant="outlined"
                  xs={12}
                  fullWidth={true}
                >
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
                <FormControl
                  className={clsx(classes.margin, classes.textField)}
                  variant="outlined"
                  xs={12}
                  fullWidth={true}
                >
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
              <Grid container justify={'space-between'}>
                <Grid item>
                  <Link
                    href="#"
                    onClick={() => {
                      history.push({ pathname: '/registrar' });
                    }}
                    variant="body2"
                  >
                    {'¿No tienes cuenta? Regístrate'}
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    href="#"
                    onClick={() => {
                      history.push({ pathname: '/olvido-contraseña' });
                    }}
                    variant="body2"
                  >
                    {'¿Olvidaste tu contraseña? Recupérala'}
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
      <TermsModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAccept={handleTermsAcceptance}
        termsText={termsText}
      />
    </Grid>
  );
}
