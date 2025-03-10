//Programar el Recuérdame.
//Llevar el Password a un componente propio.

import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { Theme } from "@mui/material/styles"

import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Grid2 from "@mui/material/Grid2"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import Typography from "@mui/material/Typography"
import { useMediaQuery } from "@mui/material"
import { makeStyles } from "tss-react/mui"
import {
  isAValidEmail,
  isAValidPassword,
  isAValidUsername,
} from "../../../utils/validations"

import jwt from "jwt-decode"
import IconButton from "@mui/material/IconButton"
import OutlinedInput from "@mui/material/OutlinedInput"
import InputLabel from "@mui/material/InputLabel"
import InputAdornment from "@mui/material/InputAdornment"
import FormControl from "@mui/material/FormControl"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import TermsModal from "apps/artist/components/Terms"
import { fetchTermsText, fetchTermsAgreementStatus, login } from "./api"

import Copyright from "@components/Copyright/copyright"
import { useSnackBar } from "@context/GlobalContext"
import { getRandomArt } from "@apps/admin/login/api"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    root: {
      marginTop: "64px !important",
    },
    image: {
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    paper: {
      padding: theme.spacing(4),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "100%",
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
  }
})

export default function Login() {
  const { classes } = useStyles()
  const history = useHistory()
  const { showSnackBar } = useSnackBar()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [art, setArt] = useState<string>()
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [termsText, setTermsText] = useState("")

  const isMobile = useMediaQuery("(max-width:480px)")
  const isTab = useMediaQuery("(max-width: 900px)")
  const now = new Date()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      showSnackBar("Por favor completa todos los campos requeridos.")
    } else {
      try {
        const body = {
          email: email.toLowerCase(),
          password: password,
        }
        const response = await login(body)

        if (response.data.error_info) {
          showSnackBar(response.data.error_message)
          if (response.data.error_info === "error_pw") setPassword("")
          return
        }

        const token = jwt(response.data.token)
        localStorage.setItem("token", JSON.stringify(token))
        localStorage.setItem(
          "tokenExpire",
          JSON.stringify(now.getTime() + 21600000)
        )

        const userId = token.username
        const hasAgreed = await fetchTermsAgreementStatus(userId)

        if (!hasAgreed) {
          // Fetch terms text and show modal if user hasn't agreed
          const terms = await fetchTermsText()
          setTermsText(terms)
          setTermsModalOpen(true)
        } else {
          // Redirect if terms already agreed
          redirectUser(token.role, response.data.username)
        }
      } catch (error) {
        console.error("Login error:", error)
        showSnackBar("Error al iniciar sesión.")
      }
    }
  }

  const redirectUser = (role, username) => {
    const rolePath = role === "Organization" ? "/org=" : "/prixer="
    window.location.href = `${import.meta.env.VITE_FRONTEND_URL}${rolePath}${username}`
  }

  const handleTermsAcceptance = () => {
    setTermsModalOpen(false) // Close modal
    const token = JSON.parse(localStorage.getItem("token") || "{}")
    redirectUser(token.role, token.username) // Redirect to user page
  }

  useEffect(() => {
    const fetchArt = async () => {
      try {
        const randomArt = await getRandomArt()
        setArt(randomArt)
      } catch (error) {
        console.error("Error obteniendo arte aleatorio:", error)
      }
    }

    fetchArt()
  }, [])

  const handleEmailChange = (e) => {
    if (isAValidEmail(e.target.value)) {
      setEmail(e.target.value)
      // setEmailError(false)
    } else {
      setEmail(e.target.value)
      showSnackBar("Por favor introduce un correo electrónico válido.")
    }
  }

  //Password
  const handlePasswordChange = (e) => {
    if (isAValidPassword(e.target.value)) {
      setPassword(e.target.value)
    } else {
      setPassword(e.target.value)
      showSnackBar(
        "Disculpa, tu contraseña debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial."
      )
    }
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleMouseDownPassword = (event) => {
    event.preventDefault()
  }

  return (
    <Grid2
      container
      component="main"
      className={classes.root}
      sx={{ height: isTab ? "fit-content" : "calc(100vh - 64px)" }}
    >
      <CssBaseline />
      <Grid2
        size={{
          xs: 12,
          lg: 7,
        }}
        className={classes.image}
        sx={{
          width: isTab && "100%",
          height: isTab ? "40vh" : "100%",
        }}
        style={{ backgroundImage: "url(" + art + ")" }}
      />
      <Grid2 size={{ xs: 12, lg: 5 }} component={Paper} elevation={6} square>
        <div
          className={classes.paper}
          // style={{ marginTop: isTab ? "32px" : "50px" }}
        >
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h5">Iniciar sesión</Typography>
          <Grid2
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <form className={classes.form} onSubmit={handleSubmit} noValidate style={{marginBottom: isMobile && 80}}>
              <Grid2
                container
                spacing={2}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignContent: "center",
                }}
              >
                <Grid2 size={{ xs: 12, lg: 7 }}>
                  <FormControl variant="outlined" style={{ width: "100%" }}>
                    <InputLabel htmlFor="email">Correo electrónico</InputLabel>
                    <OutlinedInput
                      id="email"
                      value={email}
                      label="Correo electrónico"
                      // error={emailError}
                      onChange={handleEmailChange}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={{ xs: 12, lg: 7 }}>
                  <FormControl variant="outlined" style={{ width: "100%" }}>
                    <InputLabel htmlFor="outlined-adornment-password">
                      Contraseña
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      label="Contraseña"
                      // error={passwordError}
                      onChange={handlePasswordChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                </Grid2>
                {/* <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Recuérdame"
              /> */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  Inicia sesión
                </Button>
                <Grid2
                  container
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: "32px",
                  }}
                >
                  <Link
                    href="#"
                    onClick={() => {
                      history.push({ pathname: "/registrar" })
                    }}
                    variant="body2"
                  >
                    {"¿No tienes cuenta? Regístrate"}
                  </Link>
                  <Link
                    href="#"
                    onClick={() => {
                      history.push({ pathname: "/olvido-contraseña" })
                    }}
                    variant="body2"
                  >
                    {"¿Olvidaste tu contraseña? Recupérala"}
                  </Link>
                </Grid2>
              </Grid2>
            </form>
          </Grid2>
            <Copyright />
        </div>
      </Grid2>
      <TermsModal
        open={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAccept={handleTermsAcceptance}
        termsText={termsText}
      />
    </Grid2>
  )
}
