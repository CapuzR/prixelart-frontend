//Llevar el Password a un componente propio.

import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import Copyright from 'components/Copyright/copyright';

//material-ui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: "64px",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: "8px",
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%',
    marginTop: "24px",
  },
  submit: {
    marginTop: '24px', 
    marginRight: '0px', 
    marginBottom: '16px',
    marginLeft: '0px',
  },
  snackbar: {
    [theme.breakpoints.down('xs')]: {
      bottom: 90,
    },
    margin: {
      margin: "8px",
    },
    withoutLabel: {
      marginTop: "24px",
    },
    textField: {
      width: '25ch',
    },
  },
}));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ForgotPassword() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage(
        'Por favor indica tu correo electrónico registrado para reestablecer tu contraseña.'
      );
      setSnackBarError(true);
    } else {
      const base_url = import.meta.env.VITE_BACKEND_URL + '/forgot-password';
      const data = {
        email: email,
      };
      axios
        .post(base_url, data)
        .then(async (response) => {
          if (!response.data.success) {
            //   setCurrentPasswordError(true);
            setErrorMessage(response.data.info);
            setSnackBarError(true);
          } else {
            setErrorMessage('Hemos enviado un enlace a tu correo electrónico.');
            setSnackBarError(true);
            await sleep(3000);
            navigate({ pathname: '/' });
          }
        })
        .catch((error) => {
          console.log(error.response);
        });
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

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
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12 }}>
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
            </Grid2>
          </Grid2>
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
