import React from "react";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";
import Title from "../adminMain/Title";
import axios from "axios";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";
import CircularProgress from "@material-ui/core/CircularProgress";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { Switch, Typography } from "@material-ui/core";
import Modal from "@material-ui/core/Modal";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import validations from "../../utils/validations";

import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  form: { marginTop: 10 },
  paper2: {
    position: "fixed",
    right: "40%",
    top: "40%",

    width: 310,
    backgroundColor: "white",
    boxShadow: theme.shadows[2],
    padding: "20px",
    textAlign: "justify",
    minWidth: 320,
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
  },
}));

export default function UpAdmin(props) {
  const classes = useStyles();
  const history = useHistory();
  const [username, setUsername] = useState(props.admin.username);
  const [firstname, setFirstname] = useState(props.admin.firstname);
  const [lastname, setLastname] = useState(props.admin.lastname);
  const [area, setArea] = useState(props.admin.area);
  const [email, setEmail] = useState(props.admin.email);
  const [phone, setPhone] = useState(props.admin.phone);

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState();

  const [isSeller, setIsSeller] = useState(props.admin.isSeller || false);

  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const [roles, setRoles] = useState();
  const [changePassword, setChangePassword] = useState(false);
  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const loadRoles = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/admin/read-roles";
    try {
      const rolesState = await axios.post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
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
    if (!username && !area && !firstname && !lastname && !phone && !email) {
      setErrorMessage("Por favor completa todos los campos requeridos.");
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
        adminToken: localStorage.getItem("adminTokenV"),
        isSeller: isSeller,
      };

      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/admin/update/" + props.admin._id;
      const response = await axios.put(base_url, data, {
        withCredentials: true,
      });
      if (response.data.success === false) {
        setLoading(false);
        setButtonState(false);
        setErrorMessage(response.data.message);
        setSnackBarError(true);
      } else {
        setErrorMessage("Registro de Admin exitoso.");
        setSnackBarError(true);
        setUsername("");
        setFirstname("");
        setArea("");
        setLastname("");
        setEmail("");
        setPhone("");
        history.push({ pathname: "/admin/user/read" });
      }
    }
  };

  const updatePassword = async () => {
    const data = {
      id: props.admin._id,
      newPassword: password,
      adminToken: localStorage.getItem("adminTokenV"),
    };
    const base_url = process.env.REACT_APP_BACKEND_URL + "/emergency-reset";
    const response = await axios.post(base_url, data);
    if (response.data.success) {
      setSnackBarError(true);
      setErrorMessage(response.data.info);
      setChangePassword(false);
      setPassword("");
    }
  };

  const handleSeller = () => {
    setIsSeller(!isSeller);
  };

  const handleClose = () => {
    setChangePassword(false);
  };

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

  const closeAd = () => {
    setSnackBarError(false);
  };

  return (
    <React.Fragment>
      {loading && (
        <div class={classes.loading}>
          <CircularProgress />
        </div>
      )}
      <Title>Actualizar Administrador</Title>
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
              style={{ width: "50%" }}
              required
            >
              <InputLabel>Área</InputLabel>
              <Select
                input={<OutlinedInput />}
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                }}
              >
                {roles &&
                  roles.map((role) => (
                    <MenuItem value={role.area}>{role.area}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "end",
                alignItems: "center",
              }}
              variant="outlined"
              required
            >
              <Typography color="secondary">
                Mostrar como Asesor de ventas
              </Typography>
              <Switch
                checked={isSeller}
                onChange={handleSeller}
                color="primary"
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
                id="firstname"
                label="Nombre"
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
                name="phone"
                autoComplete="phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} style={{ display: "flex", justifyContent: "end" }}>
            <Button
              variant="contained"
              style={{ marginRight: 20, textTransform: "none" }}
              onClick={(e) => {
                setChangePassword(true);
              }}
            >
              Cambiar contraseña
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={buttonState}
              style={{ textTransform: "none" }}
            >
              Actualizar
            </Button>
          </Grid>
        </Grid>
      </form>

      <Modal open={changePassword}>
        <Grid container className={classes.paper2}>
          <Grid
            item
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography color="primary">Cambiar contraseña</Typography>

              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </div>

            <TextField
              variant="outlined"
              id="Contraseña"
              label="Contraseña"
              aria-label="Contraseña"
              name="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              error={passwordError}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
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
            <Button
              variant="contained"
              style={{ marginTop: 20 }}
              onClick={updatePassword}
              color="primary"
            >
              Guardar
            </Button>
          </Grid>
        </Grid>
      </Modal>

      <Snackbar
        open={snackBarError}
        autoHideDuration={6000}
        message={errorMessage}
        className={classes.snackbar}
        onClose={closeAd}
      />
    </React.Fragment>
  );
}
