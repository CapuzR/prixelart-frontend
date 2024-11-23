import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { makeStyles, useTheme } from '@mui/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '100%',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  paper: {
    display: 'flex',
    justifyContent: 'space-evenly',
    margin: 'auto',
    maxWidth: 616,
  },
}));

export default function BasicButtonGroup(props) {
  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const changeFeed = (op) => {
    props.setFeed(op);
  };
  return (
    <Grid container className={classes.root}>
      <Grid
        item
        xs={12}
        sm={12}
        style={{
          width: '100%',
          justifyContent: 'center',
          display: 'flex',
        }}
      >
        <Paper
          className={classes.paper}
          elevation={3}
          style={{ width: isDesktop ? '50%' : '100%' }}
        >
          <Button
            onClick={(e) => {
              changeFeed('Bio');
            }}
            color="primary"
          >
            Biografía
          </Button>
          <Button
            onClick={(e) => {
              changeFeed('Artes');
            }}
            color="primary"
          >
            Artes
          </Button>
          <Button
            onClick={(e) => {
              changeFeed('Servicios');
            }}
            color="primary"
          >
            Servicios
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
}
