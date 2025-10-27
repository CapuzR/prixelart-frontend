import { useEffect } from "react"
import { useState } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"

import { validatePasswordDetailed } from "utils/validations"
import Copyright from "components/Copyright/copyright"

//material-ui
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import Grid2 from "@mui/material/Grid"
import Box from "@mui/material/Box"
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
import { Theme } from "@mui/material"
import { makeStyles } from "tss-react/mui"
import { useSnackBar, useBackdrop } from "@context/UIContext"
import FormHelperText from "@mui/material/FormHelperText"

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
  }
})

export default function PasswordReset() {
  const { classes } = useStyles()
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>() // Get username from URL
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  // const token = props.match.params.token

  //Error states.
  const [passwordError, setPasswordError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { showSnackBar } = useSnackBar()
  const { showBackdrop, closeBackdrop } = useBackdrop()
  //FALTA AGREGAR AQUI LA VALIDACION DE QUE EL LINK EXISTE.
  useEffect(() => {
    if (!token) {
      showSnackBar("Token inválido o expirado. Por favor inténtalo de nuevo.")
    } else {
      showBackdrop()
      checkToken()
    }
  }, [])

  const checkToken = async () => {
    try {
      const base_url = import.meta.env.VITE_BACKEND_URL + "/pw-token-check"
      const data = {
        token: token,
      }
      const response = await axios.post(base_url, data)
      if (response) {
        showSnackBar(response.data.message)
      }
    } catch (error) {
      showSnackBar("Error al verificar el token. Inténtalo más tarde.")
    } finally {
      closeBackdrop()
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (passwordError || !newPassword) {
      showSnackBar("Por favor, introduce una contraseña válida.")
    }

    setIsSubmitting(true)
    try {
      const base_url = import.meta.env.VITE_BACKEND_URL + "/reset-password"
      const response = await axios.post(base_url, { token, newPassword })

      if (response.data.success) {
        showSnackBar(response.data.message || "¡Contraseña cambiada con éxito!")
        navigate("/iniciar")
      } else {
        showSnackBar(
          response.data.message ||
            "No se pudo cambiar la contraseña. Inténtalo de nuevo."
        )
      }
    } catch (error) {
      console.error(error)
      showSnackBar("Ocurrió un error en el servidor.")
    } finally {
      setIsSubmitting(false)
    }
  }

  //New password
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewPassword(value)
    if (value) {
      const errorMessage = validatePasswordDetailed(value)
      setPasswordError(errorMessage)
    } else {
      setPasswordError("")
    }
  }

  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword)
  }

  const handleMouseDownNewPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Cambia tu contraseña
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12 }}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="new-password">Contraseña nueva</InputLabel>
                <OutlinedInput
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  label="Contraseña nueva"
                  onChange={handleNewPasswordChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowNewPassword}
                        onMouseDown={handleMouseDownNewPassword}
                        edge="end"
                      >
                        {showNewPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {passwordError && (
                  <FormHelperText>{passwordError}</FormHelperText>
                )}
              </FormControl>
            </Grid2>
          </Grid2>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={!newPassword || !!passwordError || isSubmitting}
            value="submit"
          >
            Cambiar contraseña
          </Button>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  )
}
