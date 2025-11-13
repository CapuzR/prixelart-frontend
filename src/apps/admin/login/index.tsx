import { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid2 from '@mui/material/Grid'; // Assuming this is Material UI's Unstable_Grid2 or similar
import {
  Avatar,
  Button,
  CssBaseline,
  Link,
  Typography,
  IconButton,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  FormControl,
  useMediaQuery,
  Paper,
  Box,
  CircularProgress, // Added
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Added

import { LockOutlined as LockOutlinedIcon, Visibility, VisibilityOff } from '@mui/icons-material';

import { isAValidEmail, isAValidPassword } from 'utils/validations';

import { Button as ButtonV2 } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

import Copyright from '@components/Copyright/copyright';
import { Art } from '../../../types/art.types'; // Ensure this Art type is compatible with findValidWebpUrl
import { useSnackBar } from 'context/GlobalContext';
import { getRandomArt } from '@api/art.api';
import { adminLogin } from '@api/utils.api';

// Helper functions and const for background fetching
const MAX_RETRIES = 3;

const ensureHttps = (url: string): string => {
  let fullUrl = url.trim();
  if (!/^https?:\/\//i.test(fullUrl) && !fullUrl.startsWith('/')) {
    fullUrl = `https://${fullUrl}`;
  }
  return fullUrl;
};

const findValidWebpUrl = (art?: Art): string | null => {
  if (!art) return null;

  // These keys are expected in your Art type from ../../../types/art.types
  const props: (keyof Art)[] = [
    'largeThumbUrl',
    'mediumThumbUrl',
    'thumbnailUrl',
    'smallThumbUrl',
    'squareThumbUrl',
  ];

  for (const key of props) {
    const value = art[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed && trimmed.toLowerCase().endsWith('.webp') && !trimmed.includes(' ')) {
        return ensureHttps(trimmed);
      }
    }
  }
  return null;
};

export default function AdminLogin() {
  const { showSnackBar } = useSnackBar();
  const isMobile = useMediaQuery('(max-width:480px)');
  const isTab = useMediaQuery('(max-width: 900px)');
  const theme = useTheme(); // Initialize theme
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State for background image fetching
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [loadingBg, setLoadingBg] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      showSnackBar('Por favor completa todos los campos requeridos.');
    } else {
      const resp = await adminLogin(email, password);
      if (resp.success) {
        showSnackBar('Inicio de sesión completado.');
        navigate('/admin/dashboard');
      } else {
        showSnackBar(resp.message);
      }
    }
  };

  // useEffect for background image fetching
  useEffect(() => {
    let mounted = true;

    const fetchArtForBg = async () => {
      if (retryCount > MAX_RETRIES) {
        if (mounted) {
          setLoadingBg(false); // Max retries reached, stop loading
        }
        return;
      }

      try {
        const fetchedArt = await getRandomArt();
        if (!mounted) return; // Check mounted state after await

        const url = findValidWebpUrl(fetchedArt);
        // No need to check mounted again here as it's checked above and before state updates.
        // The example checks mounted before calling setState like: if (url && mounted)
        // Let's ensure all setState calls are within a mounted check or after an early return if unmounted.

        if (url) {
          setBgUrl(url);
          setLoadingBg(false); // Successfully loaded
        } else {
          // No valid URL found, but API call was successful
          setRetryCount((prev) => prev + 1); // Increment retryCount to try again
          // loadingBg remains true for the next attempt
        }
      } catch (error) {
        console.error('Error obteniendo arte aleatorio para fondo:', error);
        if (mounted) {
          showSnackBar('Error al cargar la imagen de fondo.');
          setLoadingBg(false); // Stop loading on error; no further retries for this error
        }
      }
    };

    // This condition ensures fetchArtForBg is called when component mounts (loadingBg is true)
    // or when retryCount changes (triggering a re-run of useEffect).
    // If loadingBg became false (due to success, error, or max_retries),
    // and retryCount doesn't change, it won't re-fetch, which is correct.
    if (loadingBg || retryCount <= MAX_RETRIES) {
      // Fetch if loading or still have retries
      // More precise: only fetch if we are supposed to be loading.
      // The retryCount dependency already handles re-triggering.
      // If loadingBg is true, we should fetch.
      // If retryCount changed, and we are not past MAX_RETRIES, we should fetch.
      // The original second component just called `WorkspaceArt()` unconditionally within useEffect,
      // relying on the `retryCount > MAX_RETRIES` check inside `WorkspaceArt` to terminate.
      // And `loadingBg` state is managed inside.
      // Let's stick to that simpler model:
      fetchArtForBg();
    }

    return () => {
      mounted = false;
    };
  }, [retryCount, showSnackBar]); // Dependencies ensure effect re-runs on retryCount change or if showSnackBar changes

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!isAValidEmail(e.target.value) && e.target.value) {
      showSnackBar('Por favor introduce un correo electrónico válido.');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (!isAValidPassword(e.target.value) && e.target.value) {
      showSnackBar(
        'Disculpa, tu contraseña debe tener entre 8 y 15 caracteres, incluyendo al menos: una minúscula, una mayúscula, un número y un caracter especial.'
      );
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const forgotPassword = () => {
    navigate({ pathname: '/olvido-contraseña' });
  };

  return (
    <Grid2
      container
      sx={{
        height: '100vh',
        justifyContent: 'center',
        marginTop: isMobile ? '60px' : undefined,
      }}
    >
      <Grid2
        // Assuming Grid2's `size` prop API is as used in your original component.
        // For standard MUI Unstable_ this would typically be xs={12} lg={7} directly on Grid2.
        size={{
          xs: 12,
          lg: 7,
        }}
        sx={{
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: isTab ? '100%' : undefined,
          height: isTab ? '40vh' : '100%',
          backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
          backgroundColor: loadingBg && !bgUrl ? theme.palette.grey[200] : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loadingBg && <CircularProgress />}
      </Grid2>
      <Grid2 size={{ xs: 12, lg: 5 }} component={Paper} elevation={6} square>
        <Box
          sx={{
            mt: isTab ? 4 : 8,
            mx: 4,
            mb: -8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: 'calc(100vh - 164px)',
          }}
        >
          <Avatar
            sx={{
              m: 1,
              bgcolor: 'secondary.main',
            }}
          >
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h5">Iniciar sesión : Admin</Typography>
          <Grid2
            container
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'space-between',
              width: '100%',
              pt: 1,
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                width: '100%',
              }}
            >
              <Grid2
                container
                spacing={2}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignContent: 'center',
                }}
              >
                <Grid2 size={{ xs: 12, sm: 10, md: 8, lg: 6 }}>
                  <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
                    <InputLabel htmlFor="email">Correo electrónico</InputLabel>
                    <OutlinedInput
                      id="email"
                      value={email}
                      label="Correo electrónico"
                      error={email !== '' && !isAValidEmail(email)}
                      onChange={handleEmailChange}
                    />
                  </FormControl>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 10, md: 8, lg: 6 }}>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      label="Contraseña"
                      error={password !== '' && !isAValidPassword(password)}
                      onChange={handlePasswordChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                </Grid2>
                <Grid2
                  size={{ xs: 12, sm: 10, md: 8, lg: 6 }}
                  sx={{ textAlign: 'center', mt: 3, mb: 2, width: '100%' }}
                >
                  <ButtonV2 variant="default" type="submit">
                    Inicia sesión
                  </ButtonV2>
                  {/* <ButtonV2 variant="secondary" type="submit"  className='mt-[16px]'>
                    Inicia sesión
                  </ButtonV2>
                  <ButtonV2 variant="default" type="submit" className='mt-[16px]'>
                    Inicia sesión
                    <LogIn className="size-7 ml-[8px]" />
                  </ButtonV2>
                  <ButtonV2 variant="secondary" type="submit" className='mt-[16px]'>
                    Inicia sesión
                    <LogIn className="size-7 ml-[8px]" />
                  </ButtonV2>
                  <ButtonV2 variant="iconPrimary" type="submit" className='mt-[16px]'>
                    <LogIn className='w-[18px] h-[18px]' />
                  </ButtonV2>*/}
                  {/* <ButtonV2 variant="card" type="submit" className='mt-[16px] ml-[16px]'>
                    <LogIn />
                  </ButtonV2>  */}
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 10, md: 8, lg: 6 }} sx={{ textAlign: 'center' }}>
                  <Link href="#" onClick={forgotPassword} variant="body2">
                    {'¿Olvidaste tu contraseña? Recupérala'}
                  </Link>
                </Grid2>
              </Grid2>
            </Box>
            <Grid2
              size={{ xs: 12 }}
              sx={{
                margin: 'auto 0 0',
                transform: 'translateY(-64px)',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <Copyright />
            </Grid2>
          </Grid2>
        </Box>
      </Grid2>
    </Grid2>
  );
}
