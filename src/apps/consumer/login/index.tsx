import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Paper,
  Avatar,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import Grid2 from "@mui/material/Grid"
import { isAValidEmail, isAValidPassword } from "utils/validations"
import { getRandomArt } from "@api/art.api"
import { login } from "@api/utils.api"
import { useSnackBar, useUser } from "context/GlobalContext"
import Copyright from "@components/Copyright/copyright"
import { Art } from "types/art.types"
import { User } from "types/user.types"
import { jwtDecode } from 'jwt-decode';
const ensureHttps = (url: string): string => {
  let fullUrl = url.trim()
  if (!/^https?:\/\//i.test(fullUrl) && !fullUrl.startsWith("/")) {
    fullUrl = `https://${fullUrl}`
  }
  return fullUrl
}

// Pick the first valid .webp URL from an Art object
const findValidWebpUrl = (art?: Art): string | null => {
  if (!art) return null

  const props: (keyof Art)[] = [
    "largeThumbUrl",
    "mediumThumbUrl",
    "thumbnailUrl",
    "smallThumbUrl",
    "squareThumbUrl",
  ]

  for (const key of props) {
    const value = art[key]
    if (typeof value === "string") {
      const trimmed = value.trim()
      if (
        trimmed &&
        trimmed.toLowerCase().endsWith(".webp") &&
        !trimmed.includes(" ")
      ) {
        return ensureHttps(trimmed)
      }
    }
  }

  return null
}

const MAX_RETRIES = 3

const AdminLogin: React.FC = () => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()

  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [bgUrl, setBgUrl] = useState<string | null>(null)
  const [loadingBg, setLoadingBg] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const { user, setUser } = useUser()

  useEffect(() => {
    let mounted = true
    const fetchArt = async () => {
      if (retryCount > MAX_RETRIES) {
        setLoadingBg(false)
        return
      }
      try {
        const art = await getRandomArt()
        const url = findValidWebpUrl(art)
        if (url && mounted) {
          setBgUrl(url)
          setLoadingBg(false)
        } else {
          setRetryCount((prev) => prev + 1)
        }
      } catch (err) {
        if (mounted) {
          showSnackBar("Error al cargar la imagen de fondo.")
          setLoadingBg(false)
        }
      }
    }
    fetchArt()
    return () => {
      mounted = false
    }
  }, [retryCount, showSnackBar])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let valid = true
    if (!isAValidEmail(email)) {
      setEmailError("Correo electrónico no válido")
      valid = false
    }
    if (!isAValidPassword(password)) {
      setPasswordError("Contraseña inválida")
      valid = false
    }
    if (!valid) return

    const resp = await login(email, password)
    if (resp.success) {
      const validUser = resp.result as User
      setUser(validUser)
      showSnackBar("Inicio de sesión exitoso")
      navigate('/');
    } else {
      showSnackBar(resp.message)
    }
  }

  return (
    <Grid2 container sx={{ minHeight: "100vh" }}>
      {!isSmallScreen && (
        <Grid2
          size={{ md: 7 }}
          sx={{
            backgroundImage: bgUrl ? `url(${bgUrl})` : "none",
            backgroundColor: loadingBg ? theme.palette.grey[200] : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {loadingBg && (
            <Box
              sx={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Grid2>
      )}

      {/* Login form */}
      <Grid2 size={{ xs: 12, md: 5 }}>
        <Box
          component={Paper}
          elevation={6}
          square
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 4,
            height: "100%",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Iniciar sesión
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1, width: "100%", maxWidth: 360 }}
          >
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Correo electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError("")
              }}
              error={Boolean(emailError)}
              helperText={emailError}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError("")
              }}
              error={Boolean(passwordError)}
              helperText={passwordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Iniciar sesión
            </Button>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Link
                href="#"
                variant="body2"
                onClick={() => navigate("/olvido-contraseña")}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>
          </Box>

          <Box sx={{ position: "absolute", bottom: 16 }}>
            <Copyright />
          </Box>
        </Box>
      </Grid2>
    </Grid2>
  )
}

export default AdminLogin
