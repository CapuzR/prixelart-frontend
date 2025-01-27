//Programar el Recuérdame.
//Llevar el Password a un componente propio.

// Bibliotecas externas
import React, { useEffect, useState, FormEvent } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import jwt from "jwt-decode";
import clsx from "clsx";

import {
  Avatar,
  Button,
  CssBaseline,
  Link,
  Paper,
  Box,
  Grid2,
  Snackbar,
  Typography,
  IconButton,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  FormControl,
  useMediaQuery,
} from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import { Theme } from "@mui/material/styles";

import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import {
  isAValidEmail,
  isAValidPassword,
  isAValidUsername,
} from "utils/validations";

import Copyright from "@components/Copyright/copyright";
import {
  handleEmailChange,
  handlePasswordChange,
  handleClickShowPassword,
  forgotPassword,
} from "./service";
import { getRandomArt, login } from "./api";
import { Art } from "../../../types/art.types";
import { AdminToken } from "../../../types/admin.types";
import { useSnackBar } from "context/GlobalContext";
import jwtDecode from "jwt-decode";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: "64px",
    height: "calc(100vh - 64px)",
  },
  image: {
    backgroundRepeat: "no-repeat",
    // backgroundColor: '#404e5c',
    // theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  paper: {
    margin: theme.spacing(8, 4, -8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "calc(100vh - 128px)",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Login({ setPermissions }) {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const { showSnackBar } = useSnackBar();
  const isMobile = useMediaQuery("(max-width:480px)");
  const isTab = useMediaQuery("(max-width: 900px)");
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [art, setArt] = useState<Art | undefined>(undefined);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      showSnackBar("Por favor completa todos los campos requeridos.");
    } else {
      const { log, permissions } = await login(email, password);
      if (log.error_info !== null && log.success === false) {
        showSnackBar(log.error_info);
      } else {
        showSnackBar("Inicio de sesión completado.");
        setPassword("");
        setPermissions(permissions);
        history.push({ pathname: "/admin/order/read" });
      }
    }
  };

  useEffect(() => {
    const fetchArt = async () => {
      try {
        const randomArt = await getRandomArt();
        setArt(randomArt);
      } catch (error) {
        console.error("Error obteniendo arte aleatorio:", error);
      }
    };

    fetchArt();
  }, []);

  const handleEmailChange = (e) => {
    if (isAValidEmail(e.target.value)) {
      setEmail(e.target.value);
    } else {
      setEmail(e.target.value);
      showSnackBar("Por favor introduce un correo electrónico válido.");
    }
  };

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

  return (
    <Grid2
      container
      className={classes.root}
      sx={{ marginTop: isMobile && "60px" }}
    >
      <CssBaseline />
      <Grid2
        size={{
          xs: 12,
          lg: 7,
        }}
        className={classes.image}
        style={{ backgroundImage: "url(" + art + ")" }}
        sx={{
          width: isTab && "100%",
          height: isTab ? "40vh" : "100%",
        }}
      />
      <Grid2 size={{ xs: 12, lg: 5 }}>
        <div
          className={classes.paper}
          style={{ marginTop: isTab ? "32px" : "100px" }}
        >
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Iniciar sesión : Admin
          </Typography>
          <Grid2
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <form className={classes.form} onSubmit={handleSubmit} noValidate>
              <Grid2
                container
                spacing={2}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignContent: "center",
                }}
              >
                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 6 }} sx={{}}>
                  <FormControl variant="outlined" style={{ width: "100%" }}>
                    <InputLabel htmlFor="email">Correo electrónico</InputLabel>
                    <OutlinedInput
                      id="email"
                      value={email}
                      label="Correo electrónico"
                      error={!isAValidEmail(email)}
                      onChange={(e) => handleEmailChange(e)}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 12, md: 12, lg: 6 }}>
                  <FormControl variant="outlined" style={{ width: "100%" }}>
                    <InputLabel htmlFor="outlined-adornment-password">
                      Contraseña
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      label="Contraseña"
                      error={!isAValidPassword(password)}
                      onChange={(e) => handlePasswordChange(e)}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => handleClickShowPassword()}
                            edge="end"
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                </Grid2>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  Inicia sesión
                </Button>
                <Grid2>
                  <Link href="#" onClick={forgotPassword} variant="body2">
                    {"¿Olvidaste tu contraseña? Recupérala"}
                  </Link>
                </Grid2>
              </Grid2>
            </form>
          </Grid2>
          <Grid2
            size={{ xs: 12 }}
            sx={{ margin: "auto 0 0", transform: "translateY(-64px)" }}
          >
            <Copyright />
          </Grid2>
        </div>
      </Grid2>
    </Grid2>
  );
}
