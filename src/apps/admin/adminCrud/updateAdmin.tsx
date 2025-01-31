import React, { useState, useEffect } from "react";

import axios from "axios";

import { Theme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid2 from "@mui/material/Grid2";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Switch, Typography } from "@mui/material";
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";

import CloseIcon from "@mui/icons-material/Close";
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
import { AdminRole, Admin } from "../../../types/admin.types";
import { getRoles, updateAdmin } from "./api";

const useStyles = makeStyles()((theme: Theme) => {
  return {
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
  };
});

export default function UpdateAdmin({ admin, updateAdminProperty, loadAdmin }) {
  const { classes, cx } = useStyles();
  const history = useHistory();
  const { showSnackBar } = useSnackBar();
  const { setLoading } = useLoading();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState();

  const [buttonState, setButtonState] = useState(false);
  const [roles, setRoles] = useState<AdminRole[]>();
  const [changePassword, setChangePassword] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      admin.username.length < 1 ||
      admin.area.length < 1 ||
      admin.firstname.length < 1 ||
      admin.lastname.length < 1 ||
      admin.phone.length < 1 ||
      admin.email.length < 1
    ) {
      showSnackBar("Por favor completa todos los campos requeridos.");
      e.preventDefault();
    } else {
      setLoading(true);
      setButtonState(true);

      const data = {
        _id: admin._id,
        username: admin.username,
        area: admin.area,
        firstname: admin.firstname,
        lastname: admin.lastname,
        email: admin.email.toLowerCase(),
        phone: admin.phone,
        isSeller: admin.isSeller,
      };

      const response = await updateAdmin(data);

      if (response.success === false) {
        setLoading(false);
        setButtonState(false);
        showSnackBar(response.message);
      } else {
        showSnackBar(`Actualización de Administrador ${response.admin.username} exitoso.`);
        updateAdminProperty("all", "");
        history.push({ pathname: "/admin/user/read" });
        loadAdmin();
      }
    }
  };

  const changeFromAdminPassword = async () => {
    const data = {
      id: admin._id,
      newPassword: password,
      adminToken: localStorage.getItem("adminTokenV"),
    };
    const base_url = import.meta.env.VITE_BACKEND_URL + "/emergency-reset";
    const response = await axios.post(base_url, data);
    if (response.data.success) {
      showSnackBar(response.data.info);
      setPassword("");
    }
  };

  const handleSeller = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateAdminProperty("isSeller", event.target.checked);
  };

  const handleClose = () => {
    setChangePassword(false);
  };

  const handlePasswordChange = (e) => {
    if (isAValidPassword(e.target.value)) {
      setPassword(e.target.value);
    } else {
      setPassword(e.target.value);
      showSnackBar(
        "Disculpa, tu contraseña debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial."
      );
      // setSnackBarError(true);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <React.Fragment>
      <Title>Actualizar Administrador</Title>
      <form className={classes.form} noValidate onSubmit={handleSubmit}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 4 }}>
            <FormControl  fullWidth variant="outlined">
              <TextField
                variant="outlined"
                required
                fullWidth
                id="username"
                label="Nombre de usuario"
                name="username"
                autoComplete="username"
                value={admin.username}
                onChange={(e) => {
                  updateAdminProperty("username", e.target.value);
                }}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 4 }}>
            <FormControl fullWidth
              variant="outlined"
              // style={{ width: "50%" }}
              required
            >
              <InputLabel>Área</InputLabel>
              <Select
                input={<OutlinedInput />}
                value={admin.area}
                onChange={(e) => {
                  updateAdminProperty("area", e.target.value);
                }}
              >
                {roles &&
                  roles.map((role) => (
                    <MenuItem value={role.area}>{role.area}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 4 }}>
            <FormControl fullWidth
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
                checked={admin.isSeller}
                onChange={handleSeller}
                color="primary"
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 6 }}>
            <FormControl fullWidth variant="outlined">
              <TextField
                variant="outlined"
                required
                fullWidth
                id="firstname"
                label="Nombre"
                name="firstname"
                autoComplete="firstname"
                value={admin.firstname}
                onChange={(e) => {
                  updateAdminProperty("firstname", e.target.value);
                }}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 6 }}>
            <FormControl fullWidth variant="outlined">
              <TextField
                variant="outlined"
                required
                fullWidth
                id="lastname"
                label="Apellido"
                name="lastname"
                autoComplete="lastname"
                value={admin.lastname}
                onChange={(e) => {
                  updateAdminProperty("lastname", e.target.value);
                }}
              />
            </FormControl>
          </Grid2>

          <Grid2 size={{ xs: 8 }}>
            <FormControl fullWidth variant="outlined">
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Correo electrónico"
                name="email"
                autoComplete="email"
                value={admin.email}
                onChange={(e) => {
                  updateAdminProperty("email", e.target.value);
                }}
              />
            </FormControl>
          </Grid2>
          <Grid2 size={{ xs: 4 }}>
            <FormControl fullWidth variant="outlined">
              <TextField
                variant="outlined"
                required
                fullWidth
                id="phone"
                label="Teléfono"
                name="phone"
                autoComplete="phone"
                value={admin.phone}
                onChange={(e) => {
                  updateAdminProperty("phone", e.target.value);
                }}
              />
            </FormControl>
          </Grid2>
          <Grid2
            size={{ xs: 12 }}
            style={{ display: "flex", justifyContent: "end" }}
          >
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
          </Grid2>
        </Grid2>
      </form>

      <Modal open={changePassword}>
        <Grid2 container className={classes.paper2}>
          <Grid2
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
              slotProps={{
                input: {
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
                },
              }}
            />
            <Button
              variant="contained"
              style={{ marginTop: 20 }}
              onClick={changeFromAdminPassword}
              color="primary"
            >
              Guardar
            </Button>
          </Grid2>
        </Grid2>
      </Modal>
    </React.Fragment>
  );
}
