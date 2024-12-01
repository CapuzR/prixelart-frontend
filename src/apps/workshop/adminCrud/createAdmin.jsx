import React, { useEffect } from 'react';
import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import Title from '../adminMain/Title';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Switch, Typography } from '@mui/material';

import clsx from 'clsx';
import validations from '../../../utils/validations';

const useStyles = makeStyles((theme) => ({
  loading: {
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
    marginLeft: '50vw',
    marginTop: '50vh',
  },
}));

export default function CreateAdmin() {
  const classes = useStyles();
  const history = useHistory();
  const [roles, setRoles] = useState([]);
  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [area, setArea] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  const [passwordError, setPasswordError] = useState();

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

  const loadRoles = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/admin/read-roles';
    try {
      const rolesState = await axios.post(
        base_url,
        { adminToken: localStorage.getItem('adminTokenV') },
        { withCredentials: true }
      );
      setRoles(rolesState.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username && !area && !firstname && !lastname && !phone && !email && !password) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      setSnackBarError(true);
      e.preventDefault();
    } else {
      setLoading(true);
      setButtonState(true);
      const data = {
        username: username,
        area: area,
        firstname: firstname,
        lastname: lastname,
        email: email.toLowerCase(),
        phone: phone,
        password: password,
        adminToken: localStorage.getItem('adminTokenV'),
        isSeller: isSeller,
      };

      const base_url = import.meta.env.VITE_BACKEND_URL + '/admin/create';
      const response = await axios.post(base_url, data, {
        withCredentials: true,
      });
      if (response.data.success === false) {
        setLoading(false);
        setButtonState(false);
        setErrorMessage(response.data.message);
        setSnackBarError(true);
      } else {
        setErrorMessage('Registro de Admin exitoso.');
        setSnackBarError(true);
        setUsername('');
        setFirstname('');
        setLastname('');
        setEmail('');
        setPhone('');
        setPassword('');
        history.push({ pathname: '/user/read' });
      }
    }
  };

  const handleSeller = () => {
    setIsSeller(!isSeller);
  };

  return (
    <React.Fragment>
      {loading && (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      )}
      <Title>Crear Administrador</Title>
      <form className={classes.form} noValidate onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <FormControl
              className={clsx(classes.margin, classes.textField)}
              variant="outlined"
              xs={5}
            >
              <TextField
                variant="outlined"
                required
                fullWidth
                id="username"
                aria-label="username"
                label="Nombre de usuario"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl
              className={clsx(classes.margin, classes.textField)}
              variant="outlined"
              style={{ width: '50%' }}
              required
            >
              <InputLabel>Área</InputLabel>
              <Select
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                }}
                data-testid="area-select"
              >
                {roles &&
                  roles.map((role) => (
                    <MenuItem value={role.area} name={role.area} key={role.area}>
                      {role.area}{' '}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyItems: 'center',
                alignItems: 'center',
              }}
              variant="outlined"
              required
            >
              <Typography color="secondary">Mostrar como Asesor de ventas</Typography>
              <Switch checked={isSeller} onChange={handleSeller} color="primary" />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl
              className={clsx(classes.margin, classes.textField)}
              variant="outlined"
              xs={12}
              fullWidth={true}
            >
              <TextField
                variant="outlined"
                required
                fullWidth
                id="firstname"
                label="firstname"
                aria-label="firstname"
                name="firstname"
                autoComplete="firstname"
                value={firstname}
                onChange={(e) => {
                  setFirstname(e.target.value);
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl
              className={clsx(classes.margin, classes.textField)}
              variant="outlined"
              xs={12}
              fullWidth={true}
            >
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastname"
                label="Apellido"
                aria-label="Apellido"
                name="lastname"
                autoComplete="lastname"
                value={lastname}
                onChange={(e) => {
                  setLastname(e.target.value);
                }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={8}>
            <FormControl
              className={clsx(classes.margin, classes.textField)}
              variant="outlined"
              xs={12}
              fullWidth={true}
            >
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Correo electrónico"
                aria-label="Correo electrónico"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={4}>
            <FormControl
              className={clsx(classes.margin, classes.textField)}
              variant="outlined"
              xs={12}
              fullWidth={true}
            >
              <TextField
                variant="outlined"
                required
                fullWidth
                id="phone"
                label="Teléfono"
                aria-label="Teléfono"
                name="phone"
                autoComplete="phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                }}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl
              className={clsx(classes.margin, classes.textField)}
              variant="outlined"
              xs={12}
            >
              <TextField
                variant="outlined"
                id="Contraseña"
                label="Contraseña"
                aria-label="Contraseña"
                name="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                error={passwordError}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        // aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
          </Grid>
          <Button variant="contained" color="primary" type="submit" disabled={buttonState}>
            Crear
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
