import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import AppBar from '@components/appBar';
import FloatingAddButton from 'components/floatingAddButton/floatingAddButton';
import CreateService from 'components/createService/createService';
import UserData from './userData/userData';
import PrixerOptions from './prixerOptions/prixerOptions';
import ArtsGrid from '../../consumer/art/components/grid';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import { useState } from 'react';
import ArtUploader from 'components/artUploader/artUploader';
import ServiceGrid from './grid/serviceGrid';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import MDEditor from '@uiw/react-md-editor';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Img from 'react-cool-img';
import Biography from './grid/biography';

const useStyles = makeStyles((theme) => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    flexGrow: 1,
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  float: {
    position: 'relative',
    marginLeft: '95%',
  },
  paper2: {
    position: 'absolute',
    width: '80%',
    maxHeight: 450,
    overflowY: 'auto',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: '16px 32px 24px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'justify',
  },
}));

export default function PrixerProfile(props) {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const globalParams = new URLSearchParams(window.location.pathname);
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isDeskTop = useMediaQuery(theme.breakpoints.up('sm'));
  const username = window.location.pathname.includes('org')
    ? globalParams.get('/org')
    : globalParams.get('/prixer');
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false);
  const [openShoppingCart, setOpenShoppingCart] = useState(false);
  const [selectedArt, setSelectedArt] = useState(undefined);
  const [feed, setFeed] = useState('Artes');
  const [createdService, setCreatedService] = useState(false);

  const showPrixerGrid = () => {
    switch (feed) {
      case 'Settings':
        return <div></div>;

      case 'Artes':
        return (
          <ArtsGrid
            prixerUsername={username}
            buyState={props.buyState}
            addItemToBuyState={props.addItemToBuyState}
            setSelectedArt={setSelectedArt}
            setPrixer={props.setPrixer}
            setFullArt={props.setFullArt}
            setSearchResult={props.setSearchResult}
          />
        );

      case 'Servicios':
        return (
          <ServiceGrid
            prixerUsername={username}
            createdService={createdService}
            setCreatedService={setCreatedService}
            permissions={props.permissions}
          />
        );

      case 'Bio':
        return <Biography prixerUsername={username} />;
    }
  };
  return (
    <Container component="main" maxWidth="xl" className={classes.paper}>
      <CssBaseline />
      <UserData prixerUsername={username} feed={feed} setFeed={setFeed} />
      {feed !== 'Settings' && (
        <PrixerOptions prixerUsername={username} feed={feed} setFeed={setFeed} />
      )}
      {showPrixerGrid()}

      {openArtFormDialog && (
        <ArtUploader
          openArtFormDialog={openArtFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
        />
      )}

      {openServiceFormDialog && (
        <CreateService
          openArtFormDialog={openServiceFormDialog}
          setOpenServiceFormDialog={setOpenServiceFormDialog}
          setCreatedService={setCreatedService}
        />
      )}

      <Grid className={classes.float}>
        <FloatingAddButton
          setOpenServiceFormDialog={setOpenServiceFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
          setOpenShoppingCart={setOpenShoppingCart}
        />
      </Grid>
    </Container>
  );
}
