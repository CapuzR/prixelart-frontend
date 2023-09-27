//Llevar el Password a un componente propio.

import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import validations from "../shoppingCart/validations";
import Copyright from "../sharedComponents/Copyright/copyright";

//material-ui
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from "@mui/material/Tooltip";

import clsx from "classnames";
import jwt from "jwt-decode";

const useStyles = makeStyles((theme) => ({
  modal: {
    position: "absolute",
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
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  snackbar: {
    [theme.breakpoints.down("sm")]: {
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
}));

export default function SignUp() {
  const classes = useStyles();
  const history = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openTooltip, setOpenTooltip] = useState(false);
  const [buttonState, setButtonState] = useState(true);
  // const [isChecked, setIsChecked] = useState(false);
  // const [termsAgree, setTermsAgree] = useState(false);
  const theme = useTheme();
  // const [value, setValue] = useState("");

  // const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // const styles = useStyles();
  // const [modal, setModal] = useState(false);
  // const openModal = () => {
  //   setModal(!modal);
  // };

  //Error states.
  const [usernameError, setUsernameError] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [snackBarError, setSnackBarError] = useState(false);

  const now = new Date();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !email || !firstName || !lastName || !email || !password) {
      setErrorMessage("Por favor completa todos los campos requeridos.");
      setSnackBarError(true);
    } else {
      const base_url = process.env.REACT_APP_BACKEND_URL + "/register";
      const data = {
        username: username,
        email: email.toLowerCase(),
        password: password,
        firstName: firstName,
        lastName: lastName,
      };
      setButtonState(true);
      axios
        .post(base_url, data)
        .then((response) => {
          if (response.data.info === "error_username") {
            setUsernameError(true);
            setErrorMessage(response.data.message);
            setSnackBarError(true);
          } else if (response.data.info === "error_email") {
            setEmailError(true);
            setErrorMessage(response.data.message);
            setSnackBarError(true);
          } else {
            setPasswordError(true);
            setErrorMessage("Registro de usuario exitoso.");
            setSnackBarError(true);
            const token = jwt(response.data.token);
            localStorage.setItem("token", JSON.stringify(token));
            localStorage.setItem(
              "tokenExpire",
              JSON.stringify(now.getTime() + 21600000)
            );
            history.push({ pathname: "/registrar/prixer" });
          }
        })
        .catch((error) => {
          setButtonState(false);
          console.log(error.response);
        });
    }
  };

  useEffect(() => {
    if (email && username && password && firstName && lastName) {
      if (
        validations.isAValidEmail(email) &&
        validations.isAValidUsername(username) &&
        validations.isAValidPassword(password) &&
        validations.isAValidName(firstName) &&
        validations.isAValidName(lastName)
      ) {
        setButtonState(false);
      } else {
        setButtonState(true);
      }
    } else {
      setButtonState(true);
    }
  });

  const handleEmailChange = (e) => {
    if (validations.isAValidEmail(e.target.value)) {
      setEmail(e.target.value);
      setEmailError(false);
      setSnackBarError(false);
    } else {
      setEmail(e.target.value);
      setErrorMessage("Por favor introduce un correo electrónico válido.");
      setSnackBarError(true);
      setEmailError(true);
    }
  };

  const handleFirstNameChange = (e) => {
    if (validations.isAValidName(e.target.value)) {
      setFirstName(e.target.value);
      setFirstNameError(false);
      setSnackBarError(false);
    } else {
      setFirstName(e.target.value);
      setErrorMessage(
        "Por favor introduce tu nombre sin números o caráteres especiales."
      );
      setSnackBarError(true);
      setFirstNameError(true);
    }
  };

  const handleLastNameChange = (e) => {
    if (validations.isAValidName(e.target.value)) {
      setLastName(e.target.value);
      setLastNameError(false);
      setSnackBarError(false);
    } else {
      setLastName(e.target.value);
      setErrorMessage(
        "Por favor introduce tu apellido sin números o caráteres especiales."
      );
      setSnackBarError(true);
      setLastNameError(true);
    }
  };
  const handleUsernameChange = (e) => {
    if (validations.isAValidUsername(e.target.value)) {
      setUsername(e.target.value);
      setUsernameError(false);
      setSnackBarError(false);
    } else {
      setUsername(e.target.value);
      setErrorMessage(
        "Por favor introduce un nombre de usuario que solo incluya letras en minúscula y números."
      );
      setSnackBarError(true);
      setUsernameError(true);
    }
  };

  //Password
  const handlePasswordChange = (e) => {
    if (validations.isAValidPassword(e.target.value)) {
      setPassword(e.target.value);
      setPasswordError(false);
      setSnackBarError(false);
    } else {
      setPassword(e.target.value);
      setPasswordError(true);
      setErrorMessage(
        "Disculpa, tu contraseña debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial."
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

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Registrar
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                error={usernameError}
                id="username"
                label="Usuario"
                name="username"
                autoComplete="username"
                value={username}
                onChange={handleUsernameChange}
                InputProps={{
                  endAdornment: (
                    <Tooltip
                      title={"ej: pedroperez10  o  mariaperez"}
                      onClick={(e) => setOpenTooltip(!openTooltip)}
                      open={openTooltip}
                      onClose={(leaveDelay) => setOpenTooltip(false)}
                    >
                      <InfoIcon color="secondary" />
                    </Tooltip>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="fname"
                name="firstName"
                variant="outlined"
                required
                fullWidth
                error={firstNameError}
                id="firstName"
                label="Nombre"
                autoFocus
                value={firstName}
                onChange={handleFirstNameChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                required
                fullWidth
                error={lastNameError}
                id="lastName"
                label="Apellido"
                name="lastName"
                autoComplete="lname"
                value={lastName}
                onChange={handleLastNameChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                error={emailError}
                id="email"
                label="Correo electrónico"
                name="email"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl
                className={clsx(classes.margin, classes.textField)}
                variant="outlined"
                xs={12}
                fullWidth={true}
              >
                <InputLabel htmlFor="outlined-adornment-password">
                  Contraseña
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPassword ? "text" : "password"}
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
                        size="large"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
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
            Registrarme
          </Button>
          <Grid container style={{ justifyContent: "center" }}>
            <Grid item>
              <Link
                href="#"
                onClick={() => {
                  history.push({ pathname: "/iniciar" });
                }}
                variant="body2"
              >
                ¿Ya tienes una cuenta? Inicia sesión.
              </Link>
            </Grid>
          </Grid>
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
