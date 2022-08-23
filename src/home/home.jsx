import React, { useState, Suspense } from 'react';
// import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import AppBar from '../sharedComponents/appBar/appBar';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PhoneIcon from '@material-ui/icons/Phone';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import ArtsGrid from '../prixerProfile/grid/grid';
import PrixersGrid from '../sharedComponents/prixerGrid/prixerGrid';
import InstagramIcon from '@material-ui/icons/Instagram';
import SimpleDialog from '../sharedComponents/simpleDialog/simpleDialog';
import FloatingAddButton from '../sharedComponents/floatingAddButton/floatingAddButton';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';

import { useHistory } from "react-router-dom";
import ArtUploader from '../sharedComponents/artUploader/artUploader';
import utils from '../utils/utils';


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
    // maxWidth: 850,
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
    width: "100%",
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
  float: {
    position:'relative',
    marginLeft:'87%'
  }
}));

export default function Home(props) {
  const classes = useStyles();
  const prixerUsername = 'all';
  const [tabValue, setTabValue] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [openPrixers, setOpenPrixers] = useState(false);
  const [openArts, setOpenArts] = useState(true);
  // const [scrolledTop, setScrolledTop] = useState(false);
  const history = useHistory();
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const HeroPhoto = 'https://cdn.prixelart.com/HeroPhoto_60Q.webp';

  const handleChange = (event, newValue) => {

    if (newValue === 0) {
      setOpenArts(true);
      setOpenModal(false);
      setOpenPrixers(false);
    } else if (newValue === 1) {
      setOpenModal(false);
      setOpenPrixers(true);
      setOpenArts(false);
    } else if (newValue === 2) {
      setOpenModal(true);
      setOpenPrixers(false);
      setOpenArts(false);
    } else {
      setOpenModal(false);
      setOpenPrixers(false);
      setOpenArts(false);
    }
    setTabValue(newValue);
  };

  // useEffect(() => {
  //   if (prixerUsername == 'all') {
  //     const base_url = process.env.REACT_APP_BACKEND_URL + "/art/random";

  //     axios.get(base_url)
  //       .then(response => {
  //         // if (tiles.length != response.data.arts.length) {
  //           setTiles(response.data.arts);
  //         // }
  //       });
  //   }
  // });

  const handleGallery = (e) => {
    e.preventDefault();
    history.push({pathname:"/galeria"});
  };

  const handleProductCatalog = (e) => {
    e.preventDefault();
    history.push({pathname:"/productos"});
  };


  return (
    <React.Fragment>
      <Container component="main" maxWidth="s" className={classes.paper}>
        <CssBaseline />
        <Grid>
          <AppBar prixerUsername={prixerUsername} />
        </Grid>
        <main>
          <Card className={classes.card} style={{ display: 'flex', position: 'relative' }}>
            <div className={classes.heroContent} style={{ backgroundImage: 'url(' + HeroPhoto + ')', backgroundSize: 'cover', backgroundPosition: 'right'}}>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', color: '#404e5c', backgroundColor: '#fff', width: '100%', minHeight: 50, bottom: 0, position: 'absolute', margin: 0, padding: 10, }}>
              <div style={{ left: 10, alignItems: 'center', width: '400px' }}>
                <Typography component="h1" variant="h1" align="left" style={{ fontSize: '1.7em', paddingLeft: 10, textAlign: 'center' }} gutterBottom>
                      Encuentra el <strong>cuadro</strong> ideal para ti.
                </Typography>
              </div>
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Grid item>
                    <Button variant="contained" color="white" style={{ width: 85, color: '#404e5c', fontSize: 13 }} onClick={handleGallery}>
                      Galería
                    </Button>
                  </Grid>
                </div>
                <div>
                  <Grid item style={{ marginLeft: 10 }}>
                    <Button variant="contained" color="white" style={{ width: 85, color: '#404e5c', fontSize: 13 }} onClick={handleProductCatalog}>
                      Productos
                    </Button>
                  </Grid>
                </div>
                <div>
                  <Grid item style={{ marginLeft: 10 }}>
                    <Button 
                    variant="contained" 
                    color="primary" 
                    style={{ width: 105, color: '#ffffff', fontSize: 13 }}
                    onClick={(e)=>{window.open(utils.generateWaMessage(), '_blank');}}
                    >
                      <WhatsAppIcon/> Whatsapp
                    </Button>
                  </Grid>
                </div>
              </div>
            </div>
          </Card>
          <Container className={classes.cardGrid} maxWidth="xl">
            {/* End hero unit */}
            {/* {scrolledTop ?
              <Grid container spacing={1} style={{ position: 'fixed', top: 10 }}>
                <Paper square className={classes.iconTabs}>
                  <Tabs
                    value={tabValue}
                    onChange={handleChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="secondary"
                    aria-label="icon label tabs example"
                  >
                    <Tab icon={<PhotoLibraryIcon />} label="ARTES" />
                    <Tab icon={<FavoriteIcon />} label="PRIXERS" />
                    <Tab icon={<PhoneIcon />} label="TE ASESORAMOS" />
                  </Tabs>
                </Paper>
              </Grid>
              : */}
              <Grid container spacing={1}>
                <Paper square className={classes.iconTabs}>
                  <Tabs
                    value={tabValue}
                    onChange={handleChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="secondary"
                    aria-label="icon label tabs example"
                  >
                    <Tab icon={<PhotoLibraryIcon />} label="ARTES" />
                    <Tab icon={<FavoriteIcon />} label="PRIXERS" />
                    <Tab icon={<PhoneIcon />} label="TE ASESORAMOS" />
                    {/* <Tab icon={<PersonPinIcon />} label="CONFÍA EN PRIX" /> */}
                  </Tabs>
                </Paper>
              </Grid>
            {/* } */}
            {
              openArts &&
              // <Suspense fallback={<div>Loading...</div>}>
              <ArtsGrid prixerUsername={null} />
              // </Suspense>
            }
            {
              openPrixers &&
              // <Suspense fallback={<div>Loading...</div>}>
              <PrixersGrid />
              // </Suspense>
            }
          </Container>
        </main>
        {/* Footer */}
        <footer className={classes.footer}>
          <Typography variant="h6" align="center" gutterBottom>
            Si quieres convertirte en un Prixer <a target='blank' href='https://prixelart.com/registrar'>regístrate</a>.
        </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
            <a target='blank' href='https://instagram.com/prixelart'><InstagramIcon /></a>
        </Typography>
          <Copyright />
        </footer>
        {/* End footer */}
      </Container>
        {
          openArtFormDialog &&
          <ArtUploader  
            openArtFormDialog={openArtFormDialog}
            setOpenArtFormDialog={setOpenArtFormDialog} 
            />
        }
        {
          JSON.parse(localStorage.getItem('token')) &&
          JSON.parse(localStorage.getItem('token')).username &&
          <Grid className={classes.float}>
            <FloatingAddButton 
            setOpenArtFormDialog={setOpenArtFormDialog} 
            />
          </Grid>
        }
      {
        openModal &&
        <SimpleDialog arts={openArts} setTabValue={setTabValue} setArts={setOpenArts} open={openModal} setOpen={setOpenModal} />
      }
    </React.Fragment>
  );
}