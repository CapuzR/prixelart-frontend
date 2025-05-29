import { React, useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import ReactGA from 'react-ga';

ReactGA.initialize('G-0RWP9B33D8');

export default function CBFooter() {
  const theme = useTheme();
  const isTab = useMediaQuery(theme.breakpoints.down('sm'));

  const goHome = () => {
    ReactGA.event({
      category: 'Home CB',
      action: 'Ver_mas',
      label: 'inicio',
    });
  };

  const goIg = () => {
    ReactGA.event({
      category: 'Home CB',
      action: 'Ver_mas',
      label: 'instagram',
    });
  };

  return (
    <Grid container style={{ marginTop: 40, marginBottom: isTab ? 15 : 70 }}>
      <Grid
        item
        style={{
          justifyContent: 'center',
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          fontFamily: 'Lastik',
        }}
      >
        <Typography
          style={{
            fontFamily: 'Lastik',
            fontSize: isTab ? 12 : 18,
            marginBottom: 10,
            justifyContent: 'center',
            display: 'flex',
          }}
        >
          {'Copyright © Prixelart '}

          {new Date().getFullYear()}
          {'.'}
        </Typography>
        <Grid style={{ justifyContent: 'center', display: 'flex' }}>
          <IconButton
            style={{
              width: 40,
              height: 40,
              borderRadius: 5,
              backgroundColor: '#F4DF46',
              marginRight: 20,
            }}
          >
            <a target="blank" href="https://prixelart.com" onClick={(e) => goHome()}>
              <LanguageIcon
                style={{
                  color: 'black',
                  display: 'flex',
                  alignContent: 'center',
                }}
              />
            </a>
          </IconButton>
          <IconButton
            style={{
              width: 40,
              height: 40,
              borderRadius: 5,
              backgroundColor: '#F4DF46',
            }}
          >
            <a target="blank" href="https://instagram.com/prixelart" onClick={(e) => goIg()}>
              <InstagramIcon
                style={{
                  color: 'black',
                  display: 'flex',
                  alignContent: 'center',
                }}
              />
            </a>
          </IconButton>
        </Grid2>
      </Grid2>
    </Grid2>
  );
}
