import React from "react";
import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Title from "../adminMain/Title";
import axios from "axios";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
import clsx from "clsx";
import Checkbox from "@material-ui/core/Checkbox";
import { useHistory } from "react-router-dom";
import Backdrop from "@material-ui/core/Backdrop";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  form: {
    height: "auto",
    padding: "15px",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function UpdateConsumer(props) {
  const classes = useStyles();
  const history = useHistory();
  const [active, setActive] = useState(props.consumer.active);
  const [consumerType, setConsumerType] = useState(props.consumer.consumerType);
  const [consumerFirstname, setConsumerFirstname] = useState(
    props.consumer.firstname
  );
  const [consumerLastname, setConsumerLastname] = useState(
    props.consumer.lastname
  );
  const [username, setUsername] = useState(props.consumer.username);
  const [phone, setPhone] = useState(props.consumer.phone);
  const [email, setEmail] = useState(props.consumer.email);
  const [billingAddress, setBillingAddress] = useState(
    props.consumer.billingAddress
  );
  const [shippingAddress, setShippingAddress] = useState(
    props.consumer.shippingAddress
  );
  const [instagram, setInstagram] = useState(props.consumer.instagram);
  const [birthdate, setBirthdate] = useState(props.consumer.birthdate || "");
  const [nationalIdType, setNationalIdType] = useState(
    props.consumer.nationalIdType
  );
  const [CI, setCi] = useState(props.consumer.ci);
  const [gender, setGender] = useState(props.consumer.gender);
  const [prixers, setPrixers] = useState();
  const [selectedPrixer, setSelectedPrixer] = useState();

  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consumerFirstname && !consumerLastname && !consumerType) {
      setErrorMessage("Por favor completa todos los campos requeridos.");
      setSnackBarError(true);
      e.preventDefault();
    } else {
      setLoading(true);
      setButtonState(true);

      const data = {
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
        ci: CI,
        gender: gender,
        _id: props.consumer._id,
      };

      const base_url = process.env.REACT_APP_BACKEND_URL + "/consumer/update";
      const response = await axios.post(base_url, data);
      if (response.data.success === false) {
        setLoading(false);
        setButtonState(false);
        setErrorMessage(response.data.message);
        setSnackBarError(true);
      } else {
        setErrorMessage("Actualización de consumidor exitosa.");
        setSnackBarError(true);
        history.push("/admin/consumer/read");
      }
    }
  };

  const readPrixers = async () => {
    try {
      setLoading(true);
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/prixer/read-all-full";

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
                    inputProps={{ "aria-label": "secondary checkbox" }}
                    onChange={() => {
                      active ? setActive(false) : setActive(true);
                    }}
                  />{" "}
                  Habilitado
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl variant="outlined" fullWidth={true}>
                <InputLabel required id="consumerTypeLabel">
                  Tipo de consumidor
                </InputLabel>
                <Select
                  labelId="consumerType"
                  id="consumerType"
                  variant="outlined"
                  value={consumerType}
                  onChange={(e) => setConsumerType(e.target.value)}
                  label="consumerType"
                >
                  <MenuItem value="">
                    <em></em>
                  </MenuItem>
                  {[
                    "Particular",
                    "DAs",
                    "Corporativo",
                    "Prixer",
                    "Artista",
                  ].map((n) => (
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
            {consumerType === "Prixer" && (
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
                        prixers.find(
                          (prixer) => prixer.username === e.target.value
                        )
                      );
                    }}
                    label="Prixer"
                  >
                    <MenuItem value="">
                      <em></em>
                    </MenuItem>
                    {prixers?.map((n) => (
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
                  {["Masculino", "Femenino"].map((n) => (
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
                  required
                  fullWidth
                  minRows={2}
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
                  required
                  fullWidth
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  defaultValue="2016-07-06"
                  minRows={2}
                  id="birthdate"
                  label="Fecha de nacimiento"
                  name="birthdate"
                  autoComplete="birthdate"
                  //Las fechas no deben manejarse así.
                  value={birthdate.split("T")[0]}
                  onChange={(e) => {
                    setBirthdate(e.target.value);
                  }}
                />
              </FormControl>
            </Grid>
            {/* <Grid item xs={3} sm={2} md={2}>
              <FormControl variant="outlined">
                <Select
                  labelId="nationalIdType"
                  id="nationalIdType"
                  value={nationalIdType}
                  onChange={(e) => setNationalIdType(e.target.value)}
                  label="nationalIdType"
                >
                  <MenuItem value="">
                    <em></em>
                  </MenuItem>
                  {["J", "V", "E"].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid> */}
            <Grid item xs={12} md={4}>
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
                  minRows={2}
                  id="CI"
                  label="Cédula o RIF"
                  name="CI"
                  autoComplete="CI"
                  value={CI}
                  onChange={(e) => {
                    setCi(e.target.value);
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
                  required
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
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  required
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
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <TextField
                  variant="outlined"
                  required
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
