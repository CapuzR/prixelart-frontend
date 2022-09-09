import React, { useEffect } from "react";
import Avatar from "@material-ui/core/Avatar";
import axios from "axios";
import { useHistory } from "react-router-dom";
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
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import { useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Modal from "@material-ui/core/Modal";

import Terms from "./Terms"; //Anterior Términos y condiciones

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
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    maxWidth: 300,
  },
  modal: {
    position: "absolute",
    width: "80%",
    maxHeight: 450,
    overflowY: "auto",
    backgroundColor: "white",
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: "16px 32px 24px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "justify",
  },
  button: {
    textAlign: "center",
  },
  root: {
    height: 300,
    flexGrow: 1,
    minWidth: 300,
  },
}));
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
const specialties = ["Fotografía", "Diseño", "Artes plásticas"];
function getStyles(specialty, theme) {
  return {
    fontWeight:
      specialty.indexOf(specialty) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}
export default function PrixerRegistration() {
  const classes = useStyles();
  const history = useHistory();
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState();
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarObj, setAvatarObj] = useState("");
  const [buttonState, setButtonState] = useState(true);
  const [termsAgree, setTermsAgree] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = React.useState(false);
  const theme = useTheme();
  const [specialty, setSpecialty] = React.useState([]);
  const [change, setChange] = useState(false);
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  const handleOnChange = () => {
    setIsChecked(!isChecked);
  };
  const setCheckedBox = () => {
    setIsChecked(!Checkbox);
  };
  const styles = useStyles();
  const [modal, setModal] = useState(false);
  const openModal = () => {
    setModal(!modal);
  };
  const acceptTerms = () => {
    setIsChecked(!isChecked);
    openModal();
  };
  const body = (
    <div className={styles.modal}>
      {/* <Terms /> */}
      <div>{value}</div>

      <div align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setIsChecked(true);
            setModal(false);
          }}
        >
          Aceptar
        </Button>
      </div>
    </div>
  );

  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !dateOfBirth ||
      !specialty ||
      !phone ||
      !country ||
      !city ||
      !isChecked
    ) {
      // ||(!avatar)) {
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
        specialtyArt: specialty,
        instagram: instagram,
        facebook: facebook,
        twitter: twitter,
        dateOfBirth: dateOfBirth,
        phone: phone,
        country: country,
        city: city,
        description: description,
        termsAgree: termsAgree,
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
  const handleChange = (event) => {
    setSpecialty(event.target.value);
  };
  const getTerms = () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/read";
    axios
      .get(base_url)
      .then((response) => {
        setValue(response.data.terms.termsAndConditions);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    getTerms();
  }, []);
  console.log(isChecked);
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
              <div className={classes.loading}>
                <CircularProgress />
              </div>
            )}
            <Grid item xs={6}>
              <FormControl
                className={classes.formControl}
                style={{ width: "100%" }}
              >
                <InputLabel id="demo-mutiple-name-label">
                  Especialidad
                </InputLabel>
                <Select
                  labelId="demo-mutiple-name-label"
                  id="demo-mutiple-name"
                  multiple
                  required
                  value={specialty}
                  onChange={handleChange}
                  input={<Input />}
                  MenuProps={MenuProps}
                >
                  {specialties.map((specialty) => (
                    <MenuItem
                      key={specialty}
                      value={specialty}
                      style={getStyles(specialty, theme)}
                    >
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid
              item
              xs={6}
              sm={6}
              style={{ display: "flex", alignItems: "center" }}
            >
              <TextField
                style={{
                  width: "100%",
                }}
                id="dateOfBirth"
                label="Fecha de Nacimiento"
                type="date"
                required
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
            <Grid item xs={6} sm={6}>
              <TextField
                autoComplete="fname"
                name="instagram"
                variant="outlined"
                required
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
                autoComplete="fname"
                name="facebook"
                variant="outlined"
                fullWidth
                value={facebook}
                id="facebook"
                label="Facebook"
                autoFocus
                onChange={(e) => {
                  setFacebook(e.target.value);
                }}
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextField
                autoComplete="fname"
                name="twitter"
                variant="outlined"
                fullWidth
                value={twitter}
                id="twitter"
                label="Twitter"
                autoFocus
                onChange={(e) => {
                  setTwitter(e.target.value);
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
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
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                fullWidth
                name="description"
                label="Descripción"
                value={description}
                type="description"
                id="description"
                autoComplete="current-password"
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              />
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            style={{
              display: "flex",
              paddingTop: "24px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FormControlLabel
              style={{ margin: 0, paddingRight: 8 }}
              control={
                <Checkbox
                  color="primary"
                  value={isChecked}
                  checked={isChecked ? true : false}
                />
              }
              label="Acepto los"
              onChange={handleOnChange}
              required
            />

            <a
              style={{
                textTransform: "lowercase",
                fontSize: "1rem",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={openModal}
            >
              Términos y condiciones
            </a>
            <Modal
              open={modal}
              onClose={openModal}
              xl={800}
              lg={800}
              md={480}
              sm={360}
              xs={360}
            >
              {body}
            </Modal>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            value="submit"
            required
            disabled={!isChecked}
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
