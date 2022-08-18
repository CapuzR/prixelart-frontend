import React from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import AppBar from '../sharedComponents/appBar/appBar';
import InstagramIcon from '@material-ui/icons/Instagram';


function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://prixelart.com/">
        Prixelart C.A.
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  iconTabs: {
    flexGrow: 1,
    maxWidth: 666,
    margin: 'auto',
    marginBottom: 50
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    maxWidth: 850,
    flexGrow: 1,
    overflow: 'visible'
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    padding: theme.spacing(25, 0, 6),
    minHeight: '100vh'
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8)
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
    position: 'relative',
    bottom: 0
  },
}));

export default function Home(props) {
  const classes = useStyles();
  const prixerUsername = 'all';

  return (
    <React.Fragment>
      <Container component="main" maxWidth="s" className={classes.paper}>
        <CssBaseline />
        <Grid>
          <AppBar prixerUsername={prixerUsername} />
        </Grid>
        <main>
          <Card className={classes.card} style={{ display: 'flex', position: 'relative' }}>
            <div className={classes.heroContent} 
            // style={{ backgroundImage: 'url(' + HeroPhoto + ')', backgroundSize: 'cover', backgroundPosition: 'right'}}
            >
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', color: '#404e5c', backgroundColor: '#fff', width: '100%', minHeight: 50, bottom: 0, position: 'absolute', margin: 0, padding: 10, }}>
              <div style={{ left: 10, alignItems: 'center', width: '400px' }}>
                <Typography component="h1" variant="h1" align="left" style={{ fontSize: '1.7em', paddingLeft: 10, textAlign: 'center' }} gutterBottom>
                      Encuentra el <strong>cuadro</strong> ideal para ti
                </Typography>
              </div>
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Grid item>
                    <Button variant="contained" color="primary" style={{ width: 85, color: '#fff', fontSize: 13 }}>
                      Galería
              </Button>
                  </Grid>
                </div>
                <div>
                  <Grid item style={{ marginLeft: 10 }}>
                    <Button variant="contained" color="secondary" style={{ width: 85, color: '#fff', fontSize: 13 }}>
                      Whatsapp
              </Button>
                  </Grid>
                </div>
              </div>
            </div>
          </Card>
        </main>
        {/* Footer */}
        <footer className={classes.footer}>
          <Typography variant="h6" align="center" gutterBottom>
            Si quieres convertirte en un Prixer contáctanos.
        </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
            <a target='blank' href='https://instagram.com/prixelart'><InstagramIcon /></a>;
        </Typography>
          <Copyright />
        </footer>
        {/* End footer */}
      </Container>
    </React.Fragment>
  );
}