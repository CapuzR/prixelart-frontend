import React from 'react';
import { useState, useEffect } from 'react';
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
import Backdrop from '@material-ui/core/Backdrop';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import { useHistory } from 'react-router-dom';

import { nanoid } from 'nanoid';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  form: {
    padding: '15px',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function CreateConsumer(props) {
  const classes = useStyles();
  const history = useHistory();

  const [active, setActive] = useState(false);
  const [consumerType, setConsumerType] = useState('Particular');
  const [consumerFirstname, setConsumerFirstname] = useState('');
  const [consumerLastname, setConsumerLastname] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [instagram, setInstagram] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [nationalIdType, setNationalIdType] = useState('V');
  const [nationalId, setNationalId] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const [prixers, setPrixers] = useState();
  const [selectedPrixer, setSelectedPrixer] = useState();
  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consumerFirstname && !consumerLastname && !consumerType) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      setSnackBarError(true);
      e.preventDefault();
    } else {
      setLoading(true);
      setButtonState(true);

      const data = {
        _id: nanoid(8),
        active: active,
        consumerType: consumerType,
        firstname: consumerFirstname,
        lastname: consumerLastname,
        username: username,
        phone: phone,
        email: email,
        billingAddress: billingAddress,
        shippingAddress: shippingAddress,
        instagram: instagram,
        birthdate: birthdate,
        nationalIdType: nationalIdType,
        nationalId: nationalId,
        gender: gender,
        contactedBy: JSON.parse(localStorage.getItem('adminToken')),
      };

      const base_url = import.meta.env.VITE_BACKEND_URL + '/consumer/create';
      const response = await axios.post(base_url, data);
      if (response.data.success === false) {
        setLoading(false);
        setButtonState(false);
        setErrorMessage(response.data.message);
        setSnackBarError(true);
      } else {
        setErrorMessage('Registro de consumidor exitoso.');
        setSnackBarError(true);
        setActive('');
        setConsumerType('');
        setConsumerFirstname('');
        setConsumerLastname('');
        setUsername('');
        setPhone('');
        setEmail('');
        setShippingAddress('');
        setInstagram('');
        setBirthdate('');
        setNationalIdType('');
        setNationalId('');
        setGender('');
        setLoading(false);
        history.push({ pathname: '/consumer/read' });
      }
    }
  };

  const readPrixers = async () => {
    try {
      setLoading(true);
      const base_url = import.meta.env.VITE_BACKEND_URL + '/prixer/read-all-full';

      const response = await axios.get(base_url);
      setPrixers(response.data.prixers);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    readPrixers();
  }, []);

  useEffect(() => {
    setActive(true);
    setConsumerFirstname(selectedPrixer?.firstName);
    setConsumerLastname(selectedPrixer?.lastName);
    setPhone(selectedPrixer?.phone);
    setEmail(selectedPrixer?.email);
    setInstagram(selectedPrixer?.instagram);
  }, [selectedPrixer]);

  return (
    <React.Fragment>
      {
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      }
      <Title>Consumidor</Title>
      <form className={classes.form} noValidate onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={12}>
                  <Checkbox
                    checked={active}
                    color="primary"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                    onChange={() => {
                      setActive(!active);
                    }}
                  />
                  Habilitado
                </Grid>
              </Grid>
            </Grid>
            <Grid item md>
              <FormControl variant="outlined" fullWidth={true}>
                <InputLabel required id="consumerTypeLabel">
                  Tipo de consumidor
                </InputLabel>
                <Select
                  labelId="consumerType"
                  id="consumerType"
                  variant="outlined"
                  value={consumerType}
                  defaultValue="Particular"
                  onChange={(e) => setConsumerType(e.target.value)}
                  label="consumerType"
                >
                  <MenuItem value="">
                    <em></em>
                  </MenuItem>
                  {['Particular', 'DAs', 'Corporativo', 'Prixer', 'Artista'].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl variant="outlined" xs={12} fullWidth={true}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  display="inline"
                  id="consumerFirstname"
                  label="Nombres"
                  name="consumerFirstname"
                  autoComplete="consumerFirstname"
                  value={consumerFirstname}
                  onChange={(e) => {
                    setConsumerFirstname(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  required
                  display="inline"
                  fullWidth
                  id="consumerLastname"
                  label="Apellidos"
                  name="consumerLastname"
                  autoComplete="consumerLastname"
                  value={consumerLastname}
                  onChange={(e) => {
                    setConsumerLastname(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
            {consumerType === 'Prixer' && (
              <Grid item xs={12} md={6}>
                <FormControl
                  className={clsx(classes.margin, classes.textField)}
                  variant="outlined"
                  xs={12}
                  fullWidth={true}
                >
                  <InputLabel>Prixer</InputLabel>
                  <Select
                    labelId="username"
                    id="username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setSelectedPrixer(
                        prixers.find((prixer) => prixer.username === e.target.value)
                      );
                    }}
                    label="Prixer"
                  >
                    <MenuItem value="">
                      <em></em>
                    </MenuItem>
                    {prixers.map((n) => (
                      <MenuItem key={n.username} value={n.username}>
                        {n.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} md={2}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <InputLabel id="consumerTypeLabel">Género</InputLabel>
                <Select
                  labelId="gender"
                  id="gender"
                  variant="outlined"
                  value={gender}
                  defaultValue=""
                  onChange={(e) => setGender(e.target.value)}
                  label="Género"
                >
                  <MenuItem value="">
                    <em></em>
                  </MenuItem>
                  {['Masculino', 'Femenino'].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  fullWidth
                  minRows={2}
                  id="phone"
                  label="Teléfono"
                  name="phone"
                  autoComplete="phone"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  fullWidth
                  rows={2}
                  id="email"
                  label="Correo electrónico"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  fullWidth
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  format="dd-MM-yyyy"
                  defaultValue="06-07-2016"
                  rows={2}
                  id="birthdate"
                  label="Fecha de nacimiento"
                  name="birthdate"
                  autoComplete="birthdate"
                  value={birthdate}
                  onChange={(e) => {
                    new Date(setBirthdate(e.target.value));
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  fullWidth
                  minRows={2}
                  // id="nationalId"
                  label="Cédula o RIF"
                  // name="nationalId"
                  value={nationalId}
                  onChange={(e) => {
                    setNationalId(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  fullWidth
                  id="instagram"
                  label="Instagram"
                  name="instagram"
                  autoComplete="instagram"
                  value={instagram}
                  onChange={(e) => {
                    setInstagram(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid container style={{ marginTop: 20 }}>
            <Title>Direcciones</Title>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl
                // className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  multiline
                  fullWidth
                  id="billingAddress"
                  label="Facturación"
                  name="billingAddress"
                  autoComplete="billingAddress"
                  value={billingAddress}
                  onChange={(e) => {
                    setBillingAddress(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                // className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  multiline
                  fullWidth
                  id="shippingAddress"
                  label="Entrega"
                  name="shippingAddress"
                  autoComplete="shippingAddress"
                  value={shippingAddress}
                  onChange={(e) => {
                    setShippingAddress(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={buttonState}
            style={{ marginTop: 20 }}
          >
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
