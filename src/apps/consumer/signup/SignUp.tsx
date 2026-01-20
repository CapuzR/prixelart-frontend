import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Grid2 from '@mui/material/Grid';

import { isAValidEmail, isAValidPassword } from 'utils/validations';
import { getRandomArt } from '@api/art.api';
import { register } from '@api/utils.api';
import { useSnackBar, useUser } from 'context/GlobalContext';
import Copyright from '@components/Copyright/copyright';
import { Art } from 'types/art.types';
import { User } from 'types/user.types';

const ensureHttps = (url: string): string => {
  let fullUrl = url.trim();
  if (!/^https?:\/\//i.test(fullUrl) && !fullUrl.startsWith('/')) {
    fullUrl = `https://${fullUrl}`;
  }
  return fullUrl;
};

const findValidWebpUrl = (art?: Art): string | null => {
  if (!art) return null;
  const props: (keyof Art)[] = ['largeThumbUrl', 'mediumThumbUrl', 'thumbnailUrl'];
  for (const key of props) {
    const value = art[key];
    if (typeof value === 'string' && value.toLowerCase().endsWith('.webp')) {
      return ensureHttps(value);
    }
  }
  return null;
};

const MAX_RETRIES = 3;

const SignUp: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();
  const { setUser } = useUser(); // Hook crucial para la continuidad

  // Estados del formulario
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estado de imagen de fondo (Copiado de tu ConsumerLogin)
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [loadingBg, setLoadingBg] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchArt = async () => {
      if (retryCount > MAX_RETRIES) {
        setLoadingBg(false);
        return;
      }
      try {
        const art = await getRandomArt();
        const url = findValidWebpUrl(art);
        if (url && mounted) {
          setBgUrl(url);
          setLoadingBg(false);
        } else {
          setRetryCount((prev) => prev + 1);
        }
      } catch (err) {
        if (mounted) setLoadingBg(false);
      }
    };
    fetchArt();
    return () => {
      mounted = false;
    };
  }, [retryCount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Record<string, string> = {};

    if (!formData.username) newErrors.username = 'Requerido';
    if (!isAValidEmail(formData.email)) newErrors.email = 'Email no válido';
    if (!isAValidPassword(formData.password)) newErrors.password = 'Mínimo 8 caracteres';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const resp = await register(formData);

      if (resp.success) {
        const newUser = resp.result as User;
        setUser(newUser);

        showSnackBar('Cuenta creada con éxito');
        navigate('/registrar/prixer');
      } else {
        showSnackBar(resp.message);
      }
    } catch (err) {
      showSnackBar('Error en el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid2 container sx={{ minHeight: '100vh' }}>
      {!isSmallScreen && (
        <Grid2
          size={{ md: 7 }}
          sx={{
            backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
            backgroundColor: loadingBg ? theme.palette.grey[200] : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {loadingBg && (
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Grid2>
      )}

      {/* Form Section */}
      <Grid2 size={{ xs: 12, md: 5 }}>
        <Box
          component={Paper}
          elevation={6}
          square
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            height: '100%',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Registro de Usuario
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 2, width: '100%', maxWidth: 360 }}
          >
            <TextField
              margin="dense"
              fullWidth
              label="Nombre de usuario"
              name="username"
              autoFocus
              value={formData.username}
              onChange={handleInputChange}
              error={Boolean(errors.username)}
              helperText={errors.username}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                margin="dense"
                fullWidth
                label="Nombre"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                fullWidth
                label="Apellido"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </Box>
            <TextField
              margin="dense"
              fullWidth
              label="Correo electrónico"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
            <TextField
              margin="dense"
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              error={Boolean(errors.password)}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
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
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Siguiente paso'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link href="#" variant="body2" onClick={() => navigate('/login')}>
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </Box>
          </Box>

          <Box sx={{ position: 'absolute', bottom: 16 }}>
            <Copyright />
          </Box>
        </Box>
      </Grid2>
    </Grid2>
  );
};

export default SignUp;
