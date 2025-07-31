import React from 'react';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PrixersGrid from 'apps/consumer/components/prixerGrid/prixerGrid';
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"
import ScrollToTopButton from '@components/ScrollToTop';

const Prixers: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Container
      component="main"
      maxWidth="xl"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexGrow: 1,
        marginTop: { xs: '70px', md: '90px' },
        paddingBottom: 4,
      }}
    >
      <CssBaseline />
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          component="h1"
          sx={{
            color: 'text.primary',
            fontWeight: 700,
            letterSpacing: '0.5px',
          }}
        >
          Conoce a nuestros Prixers
        </Typography>
        <Typography variant={isMobile ? "body2" :"h6"} color="text.secondary">
          Descubre a creadores y artistas talentosos.
        </Typography>
      </Box>
      <PrixersGrid />
      <ScrollToTopButton />
    </Container>
  );
};

export default Prixers;