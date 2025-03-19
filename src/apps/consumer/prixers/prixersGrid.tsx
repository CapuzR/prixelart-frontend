import React from 'react';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid2 from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import PrixersGrid from 'apps/consumer/components/prixerGrid/prixerGrid';
import useStyles from './prixersGrid.styles';

const Prixers: React.FC = (props) => {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="sm" className={classes.paper}>
      <CssBaseline />
      <Grid2 style={{ justifyContent: 'center', display: 'flex' }}>
        <Typography variant="h4" style={{ color: '#404e5c' }} fontWeight="bold">
          <strong>Prixers</strong>
        </Typography>
      </Grid2>
      <Grid2>
        <PrixersGrid />
      </Grid2>
    </Container>
  );
};

export default Prixers;
