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

import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
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
  const [isSeller, setIsSeller] = useState(props.admin.isSeller || false);

  // const [password, setPassword] = useState();
  // const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const [roles, setRoles] = useState();
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

  const handleSeller = () => {
    setIsSeller(!isSeller);
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
          {/* No funciona hasta actualizar BACKEND 
          <Grid item xs={4}>
            <FormControl
              style={{
                display: "flex",
                flexDirection: "row",
                justifyItems: "center",
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
          </Grid> */}
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
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={buttonState}
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
