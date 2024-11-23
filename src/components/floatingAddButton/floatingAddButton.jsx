import React from 'react';
import { makeStyles } from '@mui/styles';
import Fab from '@mui/material/Fab';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import Tooltip from '@mui/material/Tooltip';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
      top: 'auto',
      bottom: 20,
      left: 'auto',
      position: 'fixed',
    },
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  uwStyles: {
    palette: {
      window: '#ffffff',
      sourceBg: '#f4f4f5',
      windowBorder: '#90a0b3',
      tabIcon: '#000000',
      inactiveTabIcon: '#d33f49',
      menuIcons: '#555a5f',
      link: theme.palette.primary.main,
      action: '#339933',
      inProgress: theme.palette.primary.main,
      complete: '#339933',
      error: '#cc0000',
      textDark: '#000000',
      textLight: '#fcfffd',
    },
    fonts: {
      default: null,
      'sans-serif': {
        url: null,
        active: true,
      },
    },
  },
}));

export default function FloatingAddButton(props) {
  const classes = useStyles();
  const history = useHistory();

  const openArtDialog = () => {
    props.setOpenArtFormDialog(true);
  };

  const openServiceDialog = () => {
    props.setOpenServiceFormDialog(true);
  };

  return (
    <div className={classes.root}>
      {JSON.parse(localStorage.getItem('token')) &&
        JSON.parse(localStorage.getItem('token')).username && (
          <>
            <Tooltip title="Agregar Servicio" placement="left">
              <Fab
                color="primary"
                aria-label="add"
                onClick={openServiceDialog}
                style={{
                  bottom: 80,

                  right: 10,
                }}
              >
                <LocalActivityIcon />
              </Fab>
            </Tooltip>
            <Tooltip title="Agregar Arte" placement="left">
              <Fab
                color="primary"
                aria-label="add"
                onClick={openArtDialog}
                style={{
                  bottom: 10,
                  right: 10,
                }}
              >
                <AddPhotoAlternateIcon />
              </Fab>
            </Tooltip>
          </>
        )}
    </div>
  );
}
