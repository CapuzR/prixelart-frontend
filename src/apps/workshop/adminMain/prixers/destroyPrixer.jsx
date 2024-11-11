import { React, useState } from 'react';
import axios from 'axios';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  paper1: {
    position: 'absolute',
    width: '80%',
    maxHeight: '90%',
    overflowY: 'auto',
    backgroundColor: 'white',
    boxShadow: theme.shadows[2],
    padding: '16px 32px 24px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'justify',
    minWidth: 320,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
  },
}));

export default function removePrixer({
  handleClose,
  selectedPrixer,
  routine,
  setOpen,
  setMessage,
}) {
  const classes = useStyles();

  const exPrixer = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/prixers/destroyPrixer';
    await axios
      .put(base_url, {
        prixerId: selectedPrixer.prixerId,
        username: selectedPrixer.username,
      })
      .then((response) => {
        setMessage(response.data.message);
        setOpen(true);
        handleClose();
        routine();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Grid container className={classes.paper1}>
      <div
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" color="secondary" style={{ textAlign: 'center', width: '100%' }}>
          ¿Seguro de eliminar este Prixer?
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </div>

      <Grid
        container
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
        }}
      >
        <Typography variant="subtitle1" style={{ padding: '16px 0', textAlign: 'center' }}>
          Esta acción eliminará todo lo relacionado al perfil: <br />
          Prixer, Usuario, Artes, Servicio, Biografía y/o estadísticas{' '}
          <strong>¡Irrecuperablemente!</strong>
        </Typography>
        <Grid
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '4rem',
            padding: '16px 0px 8px 0px',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            style={{
              width: 160,
              alignSelf: 'center',
              fontWeight: 'bold',
            }}
            onClick={(e) => {
              exPrixer();
            }}
          >
            Eliminar
          </Button>
          <Button
            variant="contained"
            // color="primary"
            style={{
              width: 160,
              alignSelf: 'center',
              fontWeight: 'bold',
            }}
            onClick={handleClose}
          >
            Cancelar
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
