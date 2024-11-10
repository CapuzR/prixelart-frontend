import { React, useState, useEffect } from 'react';
import axios from 'axios';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Button from '@material-ui/core/Button';

import { nanoid } from 'nanoid';

const useStyles = makeStyles((theme) => ({
  paper3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',

    width: 800,
    backgroundColor: 'white',
    boxShadow: theme.shadows[2],
    padding: '16px 32px 4px',
    textAlign: 'justify',
    minWidth: 320,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
  },
}));

export default function CreateMovement(props) {
  const classes = useStyles();
  const [description, setDescription] = useState();

  const createPayMovement = async () => {
    const data = {
      _id: nanoid(),
      createdOn: new Date(),
      createdBy: JSON.parse(localStorage.getItem('adminToken')).username,
      date: props.date,
      destinatary: props.selectedPrixer.account,
      description: description,
      type: props.type,
      value: props.balance,
      adminToken: localStorage.getItem('adminTokenV'),
    };
    const url = process.env.REACT_APP_BACKEND_URL + '/movement/create';
    await axios.post(url, data);
    props.setOpen(true);
    props.setMessage('Balance actualizado exitosamente.');
    props.handleClose();
    setTimeout(() => {
      props.readPrixers();
      props.readOrg();
      props.getBalance();
    }, 1000);
  };

  return (
    <Grid container className={classes.paper3}>
      <Grid
        item
        style={{
          width: '100%',
          display: 'flex',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',

            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">
            {props.type} de
            {' ' + props.selectedPrixer?.firstName + ' ' + props.selectedPrixer?.lastName}
          </Typography>

          <IconButton onClick={props.handleClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </Grid>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Grid
          container
          style={{
            display: 'flex',
          }}
        >
          <Grid item sm={3} style={{ flexBasis: '0' }}>
            <TextField
              variant="outlined"
              label="Fecha"
              value={props.date}
              onChange={(e) => {
                props.setDate(e.target.value);
              }}
              type={'date'}
            />
          </Grid>
          <Grid item sm={6} style={{ paddingRight: '-20px', marginLeft: '10px' }}>
            <TextField
              fullWidth
              variant="outlined"
              label="descripción"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          </Grid>
          <Grid item sm={3} style={{ marginLeft: '10px' }}>
            <TextField
              variant="outlined"
              label="Monto"
              value={props.balance}
              onChange={(e) => {
                props.setBalance(e.target.value);
              }}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            createPayMovement();
          }}
          style={{ margin: 10 }}
        >
          Guardar
        </Button>
      </div>
    </Grid>
  );
}
