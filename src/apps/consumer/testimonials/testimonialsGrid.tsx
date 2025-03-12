import React from 'react';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid2 from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import TestimonialsFeed from '../../admin/TestimonialsCrud/TestimonialsFeed';
import { useTestimonialsGridStyles } from './TestimonialGrid.styles';


const TestimonialsGrid: React.FC = (props) => {
  const classes = useTestimonialsGridStyles();

  return (
    <>
      <Container component="main" maxWidth="sm" className={classes.paper}>
        <CssBaseline />

        <Grid2 style={{ marginTop: 90, justifyContent: 'center', display: 'flex' }}>
          <Typography
            variant="h4"
            style={{ color: '#404e5c', marginBottom: 20, fontWeight: 'bold' }}
          >
            <strong>Testimonios</strong>
          </Typography>
        </Grid2>
        <Grid2>
          <TestimonialsFeed />
        </Grid2>
      </Container>
    </>
  );
};

export default TestimonialsGrid;
