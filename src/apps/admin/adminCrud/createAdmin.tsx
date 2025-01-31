import React, { useEffect, useState } from "react";

import { makeStyles } from "tss-react/mui";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid2 from "@mui/material/Grid2";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Switch, Typography } from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useHistory } from "react-router-dom";

import Title from "../adminMain/Title";
import {
  isAValidEmail,
  isAValidPassword,
  isAValidUsername,
} from "utils/validations";

import { useSnackBar, useLoading } from "context/GlobalContext";
import { getRoles } from "../adminMain/adminUser/api";
import { createAdmin } from "./api";
import { disabled } from "./services";
import { AdminRole } from "../../../types/admin.types";

export default function CreateAdmin({ loadAdmin }) {
  // const classes = useStyles();
  const history = useHistory();
  const { showSnackBar } = useSnackBar();
  const { setLoading } = useLoading();

  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [area, setArea] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [buttonState, setButtonState] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  const handlePasswordChange = (e) => {
    if (isAValidPassword(e.target.value)) {
      setPassword(e.target.value);
    } else {
      setPassword(e.target.value);
      showSnackBar(
        "Disculpa, tu contraseña debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial."
      );
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const loadRoles = async () => {
    try {
      const roles = await getRoles();
      setRoles(roles);
    } catch (error) {
      showSnackBar(
        "Error obteniendo lista de roles, por favor inténtelo de nuevo."
      );
      console.error("Error obteniendo lista de roles:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !username ||
      !area ||
      !firstname ||
      !lastname ||
      !phone ||
      !email ||
      !password
    ) {
      showSnackBar("Por favor completa todos los campos requeridos.");
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
        isSeller: isSeller,
      };

      const admin = await createAdmin(data);
      if (!admin) {
        console.error("La respuesta de createAdmin es undefined");
      } else if (admin.success === false) {
        setLoading(false);
        setButtonState(false);
        showSnackBar(admin.message);
      } else if (admin.success === true) {
        showSnackBar(`Registro de Admin ${admin.newAdmin.username} exitoso.`);
        setUsername("");
        setFirstname("");
        setLastname("");
        setEmail("");
        setPhone("");
        setPassword("");
        history.push({ pathname: "/admin/user/read" });
        loadAdmin();
      }
    }
  };

  const handleSeller = () => {
    setIsSeller(!isSeller);
  };

  const setDisabled = () => {
    setButtonState(disabled());
  };

  return (
    <React.Fragment>
      <Title>Crear Administrador</Title>
      <form noValidate onSubmit={handleSubmit}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 3 }}>
            <FormControl variant="outlined" fullWidth>
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
          </Grid2>
          <Grid2 size={{ xs: 3 }}>
            <FormControl variant="outlined" fullWidth required>
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
                    <MenuItem value={role.area} key={role.area}>
                      {role.area}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 4 }}>
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
          </Grid2>
          <Grid2 size={{ xs: 6 }}>
            <FormControl variant="outlined" fullWidth={true}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="firstname"
                label="Nombre"
                aria-label="firstname"
                name="Nombre"
                autoComplete="firstname"
                value={firstname}
                onChange={(e) => {
                  setFirstname(e.target.value);
                }}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 6 }}>
            <FormControl variant="outlined" fullWidth={true}>
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
          </Grid2>

          <Grid2 size={{ xs: 8 }}>
            <FormControl variant="outlined" fullWidth={true}>
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
          </Grid2>

          <Grid2 size={{ xs: 4 }}>
            <FormControl variant="outlined" fullWidth={true}>
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
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <FormControl variant="outlined">
              <TextField
                variant="outlined"
                id="Contraseña"
                label="Contraseña"
                aria-label="Contraseña"
                name="Contraseña"
                type={showPassword ? "text" : "password"}
                value={password}
                error={isAValidPassword(password)}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        // aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
          </Grid2>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            // disabled={disabled()}
          >
            Crear
          </Button>
        </Grid2>
      </form>
    </React.Fragment>
  );
}
