import React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CssBaseline from '@mui/material/CssBaseline';
import Grid2 from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import InstagramIcon from '@mui/icons-material/Instagram';
import Container from '@mui/material/Container';
import { useUPS404Styles } from './Ups404.styles';
import Copyright from '@components/Copyright/copyright';

const Ups404: React.FC = () => {
  const classes = useUPS404Styles();

  return (
      <Container component="main" maxWidth="sm" className={classes.paper}>
        <CssBaseline />
        <main>
          <Card className={classes.card} style={{ display: 'flex', position: 'relative' }}>
            <div className={classes.heroContent}></div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                color: '#404e5c',
                backgroundColor: '#fff',
                width: '100%',
                minHeight: 50,
                bottom: 0,
                position: 'absolute',
                margin: 0,
                padding: 10,
              }}
            >
              <div style={{ left: 10, alignItems: 'center', width: '400px' }}>
                <Typography
                  component="h1"
                  variant="h1"
                  align="left"
                  style={{
                    fontSize: '1.7em',
                    paddingLeft: 10,
                    textAlign: 'center',
                  }}
                  gutterBottom
                >
                  Encuentra el <strong>cuadro</strong> ideal para ti
                </Typography>
              </div>
              <div
                style={{
                  display: 'flex',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Grid2>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ width: 85, color: '#fff', fontSize: 13 }}
                  >
                    Galería
                  </Button>
                </Grid2>
                <Grid2 style={{ marginLeft: 10 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    style={{ width: 85, color: '#fff', fontSize: 13 }}
                  >
                    Whatsapp
                  </Button>
                </Grid2>
              </div>
            </div>
          </Card>
        </main>
        <footer className={classes.footer}>
          <Typography variant="h6" align="center" gutterBottom>
            Si quieres convertirte en un Prixer contáctanos.
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
            <a target="_blank" rel="noopener noreferrer" href="https://instagram.com/prixelart">
              <InstagramIcon />
            </a>
          </Typography>
          <Copyright />
        </footer>
      </Container>
  );
};

export default Ups404;
