import React, { useEffect } from 'react';

import AppBar from '@components/appBar';
import FloatingAddButton from 'components/floatingAddButton/floatingAddButton';
import ArtsGrid from 'apps/consumer/art/components/grid';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import { useState } from 'react';
import ArtUploader from '@apps/artist/artUploader';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import MDEditor from '@uiw/react-md-editor';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Img from 'react-cool-img';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import WarpImage from '@apps/admin/sections/products/components/WarpImage';
import CreateService from 'components/createService/createService';

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

export default function Catalog(props) {
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const [openShoppingCart, setOpenShoppingCart] = useState(false);
  const [selectedArt, setSelectedArt] = useState(undefined);
  const navigate = useNavigate();
  const theme = useTheme();
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false);
  const [createdService, setCreatedService] = useState(false);

  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isDeskTop = useMediaQuery(theme.breakpoints.up('sm'));
  const classes = useStyles();

  return (
    <>
      <Container component="main" maxWidth="s" className={classes.paper}>
        <CssBaseline />

        <Grid
          style={{
            marginTop: 20,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h4" style={{ color: '#404e5c' }} fontWeight="bold">
            <strong>Galería</strong>
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            style={{ marginBottom: 20 }}
          >
            Encuentra tu arte preferido. Ejemplo: escribe "playa" y toca la lupa.
          </Typography>
        </Grid>

        <Grid>
          <ArtsGrid
            prixerUsername={props.prixer}
            setFullArt={props.setFullArt}
            fullArt={props.fullArt}
            setSearchResult={props.setSearchResult}
            searchResult={props.searchResult}
          />
        </Grid>

        {/* Art uploader */}
        {openArtFormDialog && (
          <ArtUploader
            openArtFormDialog={openArtFormDialog}
            setOpenArtFormDialog={setOpenArtFormDialog}
          />
        )}

        {/* Serivices uploader */}
        {openServiceFormDialog && (
          <CreateService
            openArtFormDialog={openServiceFormDialog}
            setOpenServiceFormDialog={setOpenServiceFormDialog}
            setCreatedService={setCreatedService}
          />
        )}

        {/* Floating buttons */}
        <Grid className={classes.float}>
          <FloatingAddButton
            setOpenArtFormDialog={setOpenArtFormDialog}
            setOpenShoppingCart={setOpenShoppingCart}
            setOpenServiceFormDialog={setOpenServiceFormDialog}
          />
        </Grid>
      </Container>
    </>
  );
}

