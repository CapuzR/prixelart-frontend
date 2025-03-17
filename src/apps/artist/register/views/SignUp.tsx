//Llevar el Password a un componente propio.

import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"

import {
  isAValidName,
  isAValidCi,
  isAValidPhoneNum,
  isAValidUsername,
  isAValidPassword,
  isAValidEmail,
} from "utils/validations"
import Copyright from "components/Copyright/copyright"

import { Theme, useTheme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"

//material-ui
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import TextField from "@mui/material/TextField"
import Link from "@mui/material/Link"
import Grid2 from "@mui/material/Grid2"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"
import IconButton from "@mui/material/IconButton"
import OutlinedInput from "@mui/material/OutlinedInput"
import InputLabel from "@mui/material/InputLabel"
import InputAdornment from "@mui/material/InputAdornment"
import FormControl from "@mui/material/FormControl"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import InfoIcon from "@mui/icons-material/Info"
import Tooltip from "@mui/material/Tooltip"
import jwt from "jwt-decode"

import { useSnackBar, useLoading } from "@context/GlobalContext"
import { createUser } from "@apps/artist/api"

const useStyles = makeStyles()((theme: Theme) => {
  return {
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
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "auto",
      height: "100%",
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
    media: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
  }
})

export default function SignUp() {
  const { classes, cx } = useStyles()
  const history = useHistory()
  const theme = useTheme()

  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const now = new Date()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [openTooltip, setOpenTooltip] = useState(false)
  const [buttonState, setButtonState] = useState(true)
  const [role, setRole] = useState("Prixer")

  const [usernameError, setUsernameError] = useState(false)
  const [firstNameError, setFirstNameError] = useState(false)
  const [lastNameError, setLastNameError] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)

  const handleSubmit = async () => {
    if (!username || !email || !firstName || !lastName || !email || !password) {
      showSnackBar("Por favor completa todos los campos requeridos.")
    } else {
      const data = {
        username: username,
        email: email.toLowerCase(),
        password: password,
        firstName: firstName,
        lastName: lastName,
        role: role,
      }
      setButtonState(true)
      setLoading(true)
      try {
        const response = await createUser(data)

        if (response.data.info === "error_username") {
          showSnackBar(response.data.message)
        } else if (response.data.info === "error_email") {
          showSnackBar(response.data.message)
        } else {
          showSnackBar("Registro de usuario exitoso.")
          history.push({ pathname: "/registrar/prixer" })
          const token = jwt(response.data.token)
          localStorage.setItem("token", JSON.stringify(token))
          localStorage.setItem(
            "tokenExpire",
            JSON.stringify(now.getTime() + 60 * 60 * 1000)
          )
        }      
      } catch (error) {
        console.log(error.response)
      }
    }
  }

  useEffect(() => {
    if (email && username && password && firstName && lastName) {
      if (
        isAValidEmail(email) &&
        // isAValidUsername(username) &&
        isAValidPassword(password) &&
        isAValidName(firstName) &&
        isAValidName(lastName)
      ) {
        setButtonState(false)
      } else {
        setButtonState(true)
      }
    } else {
      setButtonState(true)
    }
  })

  const handleEmailChange = (e) => {
    if (isAValidEmail(e.target.value)) {
      setEmail(e.target.value)
      setEmailError(false)
    } else {
      setEmail(e.target.value)
      showSnackBar("Por favor introduce un correo electrónico válido.")
      setEmailError(true)
    }
  }

  const handleFirstNameChange = (e) => {
    if (isAValidName(e.target.value)) {
      setFirstName(e.target.value)
      setFirstNameError(false)
    } else {
      setFirstName(e.target.value)
      showSnackBar(
        "Por favor introduce tu nombre sin números o caráteres especiales."
      )
      setFirstNameError(true)
    }
  }

  const handleLastNameChange = (e) => {
    if (isAValidName(e.target.value)) {
      setLastName(e.target.value)
      setLastNameError(false)
    } else {
      setLastName(e.target.value)
      showSnackBar(
        "Por favor introduce tu apellido sin números o caráteres especiales."
      )
      setLastNameError(true)
    }
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)

    if (isAValidUsername(username)) {
      setUsernameError(false)
    } else {
      showSnackBar(
        "Por favor introduce un nombre de usuario que solo incluya letras en minúscula y números."
      )
      setUsernameError(true)
    }
  }

  const handlePasswordChange = (e) => {
    if (isAValidPassword(e.target.value)) {
      setPassword(e.target.value)
      setPasswordError(false)
    } else {
      setPassword(e.target.value)
      setPasswordError(true)
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
    <Container
      component="main"
      maxWidth="xs"
      style={{ height: "calc(100vh - 128px)", marginTop: 100 }}
    >
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" color="secondary">
          Registrar
        </Typography>
        <div className={classes.form}>
          <Grid2 container spacing={2}>
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
              slotProps={{
                input: {
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
                },
              }}
            />
            <Grid2 size={{ xs: 12, sm: 6 }}>
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
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
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
            </Grid2>
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
            <FormControl
              variant="outlined"
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
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            Registrarme
          </Button>
          {/* </>
          )} */}
          <Grid2 container style={{ justifyContent: "center" }}>
            <Link
              href="#"
              onClick={() => {
                history.push({ pathname: "/iniciar" })
              }}
              variant="body2"
            >
              ¿Ya tienes una cuenta? Inicia sesión.
            </Link>
          </Grid2>
        </div>
      </div>
      <Copyright />
    </Container>
  )
}
