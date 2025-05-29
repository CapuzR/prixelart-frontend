import React from 'react';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TestimonialsFeed from '../home/TestimonialsFeed'; // Assuming this path is correct

const TestimonialsGrid: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <Container component="section" maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              color: 'text.primary',
              fontWeight: '700',
            }}
          >
            Testimonios
          </Typography>
          <Typography
            variant="h6"
            component="p"
            color="text.secondary"
            sx={{ maxWidth: '700px', margin: 'auto', mt: 1 }}
          >
            Descubre lo que nuestros valiosos clientes y socios opinan sobre su experiencia con nosotros.
          </Typography>
        </Box>
        <TestimonialsFeed />
      </Container>
    </>
  );
};

export default TestimonialsGrid;