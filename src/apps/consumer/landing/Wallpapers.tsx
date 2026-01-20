import React, { act, useEffect, useState } from 'react';
import Grid2 from '@mui/material/Grid';
import {
  OutlinedInput,
  InputLabel,
  InputAdornment,
  FormControl,
  TextField,
  FilledInput,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { isAValidEmail } from '@/utils/validations';
import { useSnackBar } from '@/context/GlobalContext';
import { Button as ButtonV2 } from '@/components/ui/button';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import Copyright from '@/components/Copyright/copyright';
import axios from 'axios';
import ReactGA from 'react-ga4';
import { clarity } from 'react-microsoft-clarity';

import { PrixResponse } from 'types/prixResponse.types';

const items = [
  {
    artId: '44U4jEw',
    prixer: 'cariteshop',
    mock: './wallpapers-mockups/mock1.webp',
    bg: './wallpapers-bg/bg1.webp',
    alt: 'Wallpaper de cariteshop',
  },
  {
    artId: 'Antuangio1',
    prixer: 'antuangio',
    mock: './wallpapers-mockups/mock2.webp',
    bg: './wallpapers-bg/bg2.webp',
    alt: 'Wallpaper de Antuangio',
  },
  {
    artId: 'vFT6HFo',
    mock: './wallpapers-mockups/mock3.webp',
    bg: './wallpapers-bg/bg3.webp',
    alt: 'Wallpaper de photorenova',
    prixer: 'photorenova',
  },
];

export default function Wallpapers() {
  const theme = useTheme();
  const { showSnackBar } = useSnackBar();
  const isMobile = useMediaQuery(theme.breakpoints.down(400));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const isValid = isAValidEmail(email);
  const showError = touched && !isValid && email !== '';

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const safeClarityEvent = (action: string, label?: string) => {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('event', action);
      if (label) {
        window.clarity('set', action, label);
      }
    }
  };
  
  const handleSlideClick = (index: number) => {
    safeClarityEvent('select_item', `arte_seleccionado ${items[index].alt}`);
    ReactGA.event('select_item', {
      item_name: `arte_seleccionado ${items[index].alt}`,
    });
    setActiveIndex(index);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      showSnackBar('El correo es inválido, por favor revisa que esté escrito correctamente.');
    }

    setLoading(true);
    const currentArt = items[activeIndex];

    try {
      const base_url = import.meta.env.VITE_BACKEND_URL + '/send-wallpaper';
      const response = await axios.post<PrixResponse>(
        base_url,
        {
          email: email,
          artId: currentArt.artId,
          artName: currentArt.alt,
          prixer: currentArt.prixer,
        },
        {
          withCredentials: true,
        }
      );
      console.log(response);
      if (response.status === 200 && response.data.success) {
        console.log(`¡Enviado! Revisa tu correo: ${email}`, 'success');
        showSnackBar(`Enviando arte ${items[activeIndex].alt}, ¡Gracias por tu interés!`);
        setEmail('');
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error) {
      showSnackBar('Hubo un problema al enviar el correo. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid2
      container
      sx={{
        position: 'absolute',
        top: '0',
        height: '100vh',
        width: '100%',
        backgroundColor: '#565C66',
        display: 'flex',
        alignContent: 'flex-start',
      }}
    >
      {items.map((item, index) => (
        <>
          <Box
            key={index}
            component="img"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(../../../../../../private-assets/${item.bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center !important',
              opacity: activeIndex === index ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
              filter: 'blur(6px) brightness(0.8)',
            }}
          />
          <Box
            component="img"
            src={item.mock}
            alt={item.alt}
            sx={{
              margin: activeIndex === index ? '56px auto 0' : 0,
              zIndex: 100,
              height: isMobile ? '30vh' : '45vh',
              width: activeIndex === index ? '100%' : 0,
              objectFit: 'contain',
              transition: 'all 0.5s ease',
              animation: 'fadeIn 0.5s',
            }}
          />
        </>
      ))}

      <Grid2
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <IconButton onClick={handlePrev} sx={{ color: 'white' }}>
          <ArrowBackIos />
        </IconButton>
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              padding: '10px 5px',
              cursor: 'pointer',
              minWidth: 'max-content',
              flexShrink: 0,
            }}
            onClick={() => handleSlideClick(index)}
          >
            <Box
              component="img"
              src={`../../../../../../private-assets/${item.bg}`}
              alt={item.alt}
              sx={{
                zIndex: 100,
                position: 'relative',
                height: '10vh',
                width: 'auto',
                maxWidth: '80vw',
                border: activeIndex === index ? '3px solid #FFF' : '3px solid transparent',
                borderRadius: 2,
                objectFit: 'contain',
                transition: 'all 0.3s ease',
                animation: 'fadeIn 0.5s',
              }}
            />
          </Box>
        ))}
        <IconButton onClick={handleNext} sx={{ color: 'white' }}>
          <ArrowForwardIos />
        </IconButton>
      </Grid2>
      <Grid2
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          margin: '0 auto',
          padding: '0 1rem',
          maxWidth: isMobile ? '100%' : '600px',
          bottom: 0,
          position: 'absolute',
          zIndex: 1000,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Futura',
            fontWeight: 'bold',
            fontStyle: 'italic',
            color: 'white',
            textAlign: 'center',
          }}
        >
          Wallpapers Page
        </Typography>
        <Typography
          variant="body1"
          sx={{ mt: 2, fontFamily: 'ubuntu', color: 'white', textAlign: 'center' }}
        >
          Enviaremos el fondo de pantalla a tu correo electrónico para que los descargues cuando
          quieras.
        </Typography>
        <FormControl variant="outlined" fullWidth sx={{ my: 3 }}>
          <InputLabel sx={{ color: 'white' }} htmlFor="email">
            Correo electrónico
          </InputLabel>
          <FilledInput
            id="email"
            value={email}
            placeholder="Tu correo electrónico"
            error={email !== '' && !isAValidEmail(email)}
            onChange={handleEmailChange}
            sx={{ color: 'white' }}
          />
        </FormControl>
        <ButtonV2 disabled={!isValid || loading} variant="default" onClick={handleSubmit}>
          {loading ? 'Enviando...' : 'Descargar'}
        </ButtonV2>
        <Copyright sx={{ color: 'white', margin: 2 }} align="center" />
      </Grid2>
    </Grid2>
  );
}
