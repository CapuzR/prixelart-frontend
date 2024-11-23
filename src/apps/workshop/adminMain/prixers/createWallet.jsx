import { React, useState, useEffect } from 'react';
import axios from 'axios';
import { makeStyles, useTheme } from '@mui/styles';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { nanoid } from 'nanoid';

const useStyles = makeStyles((theme) => ({
  paper2: {
    position: 'fixed',
    right: '30%',
    top: '38%',
    bottom: '37%',
    left: '40%',
    width: 300,
    backgroundColor: 'white',
    boxShadow: theme.shadows[2],
    padding: '16px 32px 24px',
    textAlign: 'justify',
    minWidth: 320,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
  },
}));

export default function CreateWallet(props) {
  const classes = useStyles();

  const openNewAccount = () => {
    let ID;
    const data = {
      _id: nanoid(24),
      balance: 0,
      email: props.selectedPrixer.email,
      adminToken: localStorage.getItem('adminTokenV'),
    };
    const base_url = import.meta.env.VITE_BACKEND_URL + '/account/create';
    axios.post(base_url, data).then((response) => {
      if (response.status === 200 && props.balance > 0) {
        ID = response.data.createAccount.newAccount._id;
        const data2 = {
          _id: nanoid(),
          createdOn: new Date(),
          createdBy: JSON.parse(localStorage.getItem('adminToken')).username,
          date: props.date,
          destinatary: ID,
          description: 'Saldo inicial',
          type: 'Depósito',
          value: props.balance,
          adminToken: localStorage.getItem('adminTokenV'),
        };
        const base_url2 = import.meta.env.VITE_BACKEND_URL + '/movement/create';
        axios.post(base_url2, data2);
      }
    });

    props.setOpen(true);
    props.setMessage('Cartera creada y balance actualizado exitosamente.');
    props.handleClose();
    setTimeout(() => {
      props.readPrixers();
      props.getBalance();
    }, 1000);
  };

  return (
    <Grid container className={classes.paper2}>
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
          <Typography>
            Balance de
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
        }}
      >
        <TextField
          variant="outlined"
          value={props.balance}
          onChange={(e) => {
            props.setBalance(e.target.value);
          }}
          type={'number'}
        />
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            openNewAccount();
          }}
          style={{ marginRight: 10, marginLeft: 10, marginTop: 5 }}
        >
          Guardar
        </Button>
      </div>
    </Grid>
  );
}
