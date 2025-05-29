import React, { useState, useEffect } from 'react'; // Added useEffect
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
  InputAdornment
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Grid2 from '@mui/material/Grid';
import { getRandomArt } from '@api/art.api';
// --- Placeholder/Example Imports (Replace with your actual implementations) ---

// Assume validation functions exist
const isNotEmpty = (value: string): boolean => value.trim() !== '';
const isAValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isAValidPassword = (password: string): boolean => password.length >= 8;

// Assume API function for registration exists
interface RegisterUserResponse {
  success: boolean;
  message: string;
}
const registerUser = async (userData: any): Promise<RegisterUserResponse> => {
  console.log("Registering user:", userData);
  await new Promise(resolve => setTimeout(resolve, 1500));
  if (userData.email === 'exists@example.com') {
    return { success: false, message: 'Este correo electrónico ya está registrado.' };
  }
  return { success: true, message: 'Registro exitoso. Por favor, inicia sesión.' };
};

// Assume SnackBar context exists
const useSnackBar = () => ({
  showSnackBar: (message: string) => console.log('SnackBar:', message)
});

// Assume Copyright component exists
const Copyright = (props: any) => (
  <Typography variant="body2" color="text.secondary" align="center" {...props}>
    {'Copyright © '}
    <Link color="inherit" href="#">
      Your Website
    </Link>{' '}
    {new Date().getFullYear()}
    {'.'}
  </Typography>
);

// --- Background Image Logic Imports (Replace with your actual implementations) ---
// import { getRandomArt } from '@api/art.api';
// import { Art } from 'types/art.types';

// Placeholder Art type and API function
interface Art {
  largeThumbUrl?: string;
  mediumThumbUrl?: string;
  thumbnailUrl?: string;
  smallThumbUrl?: string;
  squareThumbUrl?: string;
  [key: string]: any; // Allow other properties
}

// Utility to enforce HTTPS on a URL (copied from AdminLogin)
const ensureHttps = (url: string): string => {
  let fullUrl = url.trim();
  // Check if it already starts with http:// or https:// or is a relative path
  if (!/^https?:\/\//i.test(fullUrl) && !fullUrl.startsWith('/')) {
    fullUrl = `https://${fullUrl}`;
  } else if (/^http:\/\//i.test(fullUrl)) {
    // Optional: Force HTTPS even if HTTP is provided, uncomment 
    // fullUrl = fullUrl.replace(/^http:\/\//i, 'https://');
  }
  return fullUrl;
};

// Pick the first valid .webp URL from an Art object (copied from AdminLogin)
const findValidWebpUrl = (art?: Art): string | null => {
  if (!art) return null;

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
      // Ensure it ends with .webp (case-insensitive) and contains no spaces
      if (trimmed && trimmed.toLowerCase().endsWith('.webp') && !trimmed.includes(' ')) {
        return ensureHttps(trimmed); // Ensure HTTPS and return
      }
    }
  }
  console.log("No valid .webp URL found in art object:", art);
  return null; // No valid URL found
};

const MAX_RETRIES = 3;
// --- End Background Image Logic Imports ---


const SignUp: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // Form state
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Error state
  const [usernameError, setUsernameError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Loading state for API call
  const [isLoading, setIsLoading] = useState(false);

  // State for Background Image (Copied from AdminLogin)
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [loadingBg, setLoadingBg] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch and retry random art for background (Copied and adapted from AdminLogin)
  useEffect(() => {
    let mounted = true;
    const fetchArt = async () => {
      if (retryCount > MAX_RETRIES) {
        if (mounted) {
          console.warn(`Max retries (${MAX_RETRIES}) reached for fetching background image.`);
          setLoadingBg(false); // Stop loading indicator even if no image is found
          showSnackBar('No se pudo cargar una imagen de fondo.');
        }
        return;
      }
      if (!mounted) return; // Check mounted status before fetch
      setLoadingBg(true); // Ensure loading is true at the start of fetch attempt

      try {
        const art = await getRandomArt();
        const url = findValidWebpUrl(art);

        if (url && mounted) {
          console.log("Valid background URL found:", url);
          setBgUrl(url);
          setLoadingBg(false);
          setRetryCount(0); // Reset retries on success
        } else if (mounted) {
          console.log(`Attempt ${retryCount + 1}: No valid URL found or component unmounted. Retrying...`);
          // Use functional update to avoid stale state issues in retry logic
          setRetryCount(prev => prev + 1);
          // No need to call fetchArt recursively here, useEffect dependency handles it
        }
      } catch (err) {
        console.error("Error fetching background art:", err);
        if (mounted) {
          showSnackBar('Error al cargar la imagen de fondo.');
          // Decide if you want to retry on error or just stop
          // setRetryCount(prev => prev + 1); // Option: Retry on error too
          setLoadingBg(false); // Stop loading on error
        }
      }
    };

    // Only run fetchArt if no URL is set yet or if retrying
    if (!bgUrl && mounted) {
      fetchArt();
    } else if (!bgUrl) {
      // If not mounted but no bgUrl, ensure loading stops
      setLoadingBg(false);
    }


    return () => {
      console.log("SignUp component unmounting or retryCount changed.");
      mounted = false;
    };
    // Rerun effect if retryCount changes (and component is still mounted)
  }, [retryCount, showSnackBar, bgUrl]); // Added bgUrl dependency to stop fetching once successful


  // Handle form submission (logic remains the same)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reset errors
    setUsernameError('');
    setFirstNameError('');
    setLastNameError('');
    setEmailError('');
    setPasswordError('');

    // Validation
    let valid = true;
    if (!isNotEmpty(username)) {
      setUsernameError('Nombre de usuario es requerido');
      valid = false;
    }
    if (!isNotEmpty(firstName)) {
      setFirstNameError('Nombre es requerido');
      valid = false;
    }
    if (!isNotEmpty(lastName)) {
      setLastNameError('Apellido es requerido');
      valid = false;
    }
    if (!isAValidEmail(email)) {
      setEmailError('Correo electrónico no válido');
      valid = false;
    }
    if (!isAValidPassword(password)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      valid = false;
    }

    if (!valid) return;

    // API Call
    setIsLoading(true);
    try {
      const resp = await registerUser({ username, firstName, lastName, email, password });
      if (resp.success) {
        showSnackBar(resp.message || 'Registro exitoso.');
        navigate('/login');
      } else {
        showSnackBar(resp.message || 'Error en el registro.');
      }
    } catch (err) {
      console.error("Registration error:", err);
      showSnackBar('Ocurrió un error inesperado durante el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid2 container component="main" sx={{ minHeight: '100vh' }}>
      {/* Background Image Section (Copied from AdminLogin) */}
      {!isSmallScreen && (
        <Grid2 size={{md:7}}
          sx={{
            // Use state for background image and loading
            backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
            // Show grey background while loading image
            backgroundColor: loadingBg ? theme.palette.grey[200] : (bgUrl ? 'transparent' : theme.palette.grey[100]), // Fallback if no image loads
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative', // Needed for positioning the loader
            transition: 'background-image 0.5s ease-in-out', // Smooth transition
          }}
        >
          {/* Loading indicator for background */}
          {loadingBg && (
            <Box
              sx={{
                display: 'flex',
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)', // Slight overlay during load
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
        </Grid2>
      )}

      {/* Sign Up Form Section */}
      <Grid2 size={{xs:12, md:5}} component={Paper} elevation={6} square>
        {/* Form Box - Styling remains the same */}
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100%', // Ensure box takes full height for alignment
            justifyContent: 'center', // Center content vertically
            position: 'relative', // For absolute positioning of Copyright
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Registrarse
          </Typography>

          {/* Form Fields - Styling and logic remain the same */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 3, width: '100%', maxWidth: 400 }}
          >
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }}>
                <TextField
                  required fullWidth id="username" label="Nombre de Usuario" name="username"
                  autoComplete="username" autoFocus value={username}
                  onChange={(e) => { setUsername(e.target.value); setUsernameError(''); }}
                  error={Boolean(usernameError)} helperText={usernameError} disabled={isLoading}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  required fullWidth id="firstName" label="Nombre" name="firstName"
                  autoComplete="given-name" value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setFirstNameError(''); }}
                  error={Boolean(firstNameError)} helperText={firstNameError} disabled={isLoading}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  required fullWidth id="lastName" label="Apellido" name="lastName"
                  autoComplete="family-name" value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setLastNameError(''); }}
                  error={Boolean(lastNameError)} helperText={lastNameError} disabled={isLoading}
                />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <TextField
                  required fullWidth id="email" label="Correo electrónico" name="email"
                  autoComplete="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  error={Boolean(emailError)} helperText={emailError} disabled={isLoading}
                />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <TextField
                  required fullWidth name="password" label="Contraseña"
                  type={showPassword ? 'text' : 'password'} id="password"
                  autoComplete="new-password" value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                  error={Boolean(passwordError)} helperText={passwordError} disabled={isLoading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(prev => !prev)}
                          edge="end" disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid2>
            </Grid2>
            <Button
              type="submit" fullWidth variant="contained"
              sx={{ mt: 3, mb: 2 }} disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Registrarse'}
            </Button>
            <Grid2 container justifyContent="flex-end">
              <Grid2>
                <Link href="#" variant="body2" onClick={() => navigate('/login')}>
                  ¿Ya tienes una cuenta? Inicia sesión
                </Link>
              </Grid2>
            </Grid2>
          </Box>
        </Box>
      </Grid2>
    </Grid2>
  );
};

export default SignUp;