import React from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import useMediaQuery from '@material-ui/core/useMediaQuery';

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
