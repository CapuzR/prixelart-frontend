import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import AddIcon from "@material-ui/icons/Add";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import axios from "axios";
import { useHistory } from "react-router-dom";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import { useState, setChecked } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import CircularProgress from "@material-ui/core/CircularProgress";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://prixelart.com/">
        prixelart.com
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
    width: "160px",
    height: "160px",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(3),
  },
  snackbar: {
    [theme.breakpoints.down("xs")]: {
      bottom: 90,
    },
    margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      width: "25ch",
    },
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  loading: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(0),
    },
    marginLeft: "50%",
  },
}));

export default function PrixerRegistration() {
  const classes = useStyles();
  const history = useHistory();
  const [specialty, setSpecialty] = useState("Ambas");
  const [instagram, setInstagram] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState();
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarObj, setAvatarObj] = useState("");
  const [buttonState, setButtonState] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleOnChange = () => {
    setIsChecked(!isChecked);
  };

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);
  const [isChecked, setIsChecked] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !instagram ||
      !dateOfBirth ||
      !phone ||
      !country ||
      !city ||
      !Checkbox
    ) {
      // ||(!Checkbox) {
      setErrorMessage("Por favor completa todos los campos requeridos.");
      setSnackBarError(true);
      setIsChecked(true);
    } else {
      setLoading(true);
      setButtonState(true);
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/prixer-registration";
      // const cldAvatarUrl = await uploadToCld();
      const data = {
        specialty: specialty,
        instagram: instagram,
        dateOfBirth: dateOfBirth,
        phone: phone,
        country: country,
        city: city,
        // 'avatar': cldAvatarUrl,
        username: JSON.parse(localStorage.getItem("token")).username,
      };
      axios
        .post(base_url, data)
        .then((response) => {
          if (response.data.success === false) {
            setLoading(false);
            setButtonState(false);
            setErrorMessage(response.data.message);
            setSnackBarError(true);
          } else {
            setErrorMessage("Registro de Prixer exitoso.");
            setSnackBarError(true);
            history.push({ pathname: "/" + response.data.prixerData.username });
          }
        })
        .catch((error) => {
          setLoading(false);
          setButtonState(false);
          console.log(error.response);
        });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Comparte con tus futuros clientes
        </Typography>
        <form onSubmit={handleSubmit} className={classes.form} noValidate>
          <Grid container spacing={3}>
            {loading && (
              <div class={classes.loading}>
                <CircularProgress />
              </div>
            )}
            <Grid item xs={3}>
              <InputLabel id="demo-simple-select-label">
                Especialidad
              </InputLabel>
              <Select
                labelId="specialty"
                id="specialty"
                label="Especialidad"
                disabled={buttonState}
                value={specialty}
                onChange={(e) => {
                  setSpecialty(e.target.value);
                }}
              >
                <MenuItem value="Fotografía">Fotografía</MenuItem>
                <MenuItem value="Diseño">Diseño</MenuItem>
                <MenuItem value="Ambas">Ambas</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={9} sm={9}>
              <TextField
                autoComplete="fname"
                name="instagram"
                variant="outlined"
                required
                disabled={buttonState}
                fullWidth
                value={instagram}
                id="instagram"
                label="Instagram"
                autoFocus
                onChange={(e) => {
                  setInstagram(e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextField
                id="dateOfBirth"
                label="Fecha de Nacimiento"
                type="date"
                disabled={buttonState}
                // value={dateOfBirth}
                format="dd-MM-yyyy"
                defaultValue="06-07-2016"
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => {
                  setDateOfBirth(new Date(e.target.value));
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                disabled={buttonState}
                id="phone"
                label="Teléfono"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="country"
                disabled={buttonState}
                label="País"
                value={country}
                type="country"
                id="country"
                autoComplete="current-password"
                onChange={(e) => {
                  setCountry(e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                variant="outlined"
                disabled={buttonState}
                required
                fullWidth
                name="city"
                label="Ciudad"
                value={city}
                type="city"
                id="city"
                autoComplete="current-password"
                onChange={(e) => {
                  setCity(e.target.value);
                }}
              />
            </Grid>
          </Grid>

          <Grid align="center" item xs={12}>
            <FormControlLabel
              control={<Checkbox />}
              label="Acepto los Términos y condiciones."
              checked={isChecked}
              onChange={handleOnChange}
            />
          </Grid>

          <Button
            type="submit"
            fullWidth
            disabled={!isChecked} //disabled es desactivado , isChecked inicialmente es false pero con la negación! está en true
            variant="contained"
            color="primary"
            className={classes.submit}
            value="submit"
          >
            Guardar e ir a mi perfil
          </Button>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
      <Snackbar
        open={snackBarError}
        autoHideDuration={1000}
        message={errorMessage}
        className={classes.snackbar}
      />
    </Container>
  );
}
