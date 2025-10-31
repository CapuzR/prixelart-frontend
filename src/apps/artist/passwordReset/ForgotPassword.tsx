import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Copyright from "components/Copyright/copyright";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Grid2 from "@mui/material/Grid";
import { Theme } from "@mui/material";
import { makeStyles } from "tss-react/mui";

import { useSnackBar } from "context/GlobalContext";
import { isAValidEmail } from "@utils/validations";

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper: {
      marginTop: "64px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    avatar: {
      margin: "8px",
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: "100%",
      marginTop: "24px",
    },
    submit: {
      marginTop: "24px",
      marginRight: "0px",
      marginBottom: "16px",
      marginLeft: "0px",
    },
  };
});

export default function ForgotPassword() {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  const [email, setEmail] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      showSnackBar(
        "Por favor indica tu correo electrónico registrado para reestablecer tu contraseña.",
      );
    } else {
      try {
        const base_url = import.meta.env.VITE_BACKEND_URL + "/forgot-password";
        const data = {
          email: email,
        };
        const response = await axios.post(base_url, data);
        if (!response.data.success) {
          showSnackBar(response.data.info);
        } else {
          showSnackBar("Hemos enviado un enlace a tu correo electrónico.");
          navigate({ pathname: "/" });
        }
      } catch (error) {
        console.error("Error al solicitar recuperación:", error);
        showSnackBar("Ocurrió un error. Por favor, inténtalo de nuevo.");
      }
    }
  };

  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | undefined>,
  ) => {
    setEmail(e.target.value);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Solicita el cambio de contraseña
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Correo electrónico"
                name="email"
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
              />
            </Grid2>
          </Grid2>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            value="submit"
            disabled={!isAValidEmail(email)}
          >
            {!isAValidEmail(email) ? "Introduce tu correo" : "Recuperar acceso"}
          </Button>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}
