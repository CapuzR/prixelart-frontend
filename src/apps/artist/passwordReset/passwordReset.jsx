//Llevar el Password a un componente propio.

import React, { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { isAValidEmail, isAValidPassword, isAValidUsername } from 'utils/validations';
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
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import clsx from 'clsx';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

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
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function PasswordReset(props) {
  const classes = useStyles();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const token = props.match.params.token;
  const [backdrop, setBackdrop] = useState(true);

  //Error states.
  const [newPasswordError, setNewPasswordError] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  //FALTA AGREGAR AQUI LA VALIDACION DE QUE EL LINK EXISTE.
  useEffect(() => {
    if (!token) {
      setErrorMessage('Token inválido o expirado. Por favor inténtalo de nuevo.');
      setSnackBarError(true);
    } else {
      const base_url = import.meta.env.VITE_BACKEND_URL + '/pw-token-check';
      const data = {
        token: token,
      };
      axios
        .post(base_url, data)
        .then((response) => {
          if (!response.data.success) {
            setErrorMessage(response.data.info);
            setSnackBarError(true);
          } else {
            setBackdrop(false);
          }
        })
        .catch((error) => {
          console.log(error.response);
        });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      setSnackBarError(true);
    } else {
      const base_url = import.meta.env.VITE_BACKEND_URL + '/reset-password';
      const data = {
        token: token,
        newPassword: newPassword,
      };
      axios
        .post(base_url, data)
        .then((response) => {
          if (!response.data.success) {
            setNewPasswordError(true);
            setErrorMessage('Por favor intentar nuevamente');
            setSnackBarError(true);
          } else {
            setErrorMessage(response.data.info);
            setSnackBarError(true);
            navigate({ pathname: '/iniciar' });
          }
        })
        .catch((error) => {
          console.log(error.response);
        });
    }
  };

  //New password
  const handleNewPasswordChange = (e) => {
    if (isAValidPassword(e.target.value)) {
      setNewPassword(e.target.value);
      setNewPasswordError(false);
      setSnackBarError(false);
    } else {
      setNewPassword(e.target.value);
      setNewPasswordError(true);
      setErrorMessage(
        'Disculpa, tu contraseña nueva debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial.'
      );
      setSnackBarError(true);
    }
  };

  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleMouseDownNewPassword = (event) => {
    event.preventDefault();
  };
  //END New password

  return (
    <Container component="main" maxWidth="xs">
      <Backdrop className={classes.backdrop} open={backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Cambia tu contraseña
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12 }}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
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
