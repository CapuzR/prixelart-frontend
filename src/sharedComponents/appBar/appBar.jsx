import React from 'react';
import axios from 'axios';
import { useHistory } from "react-router-dom";


import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import logo from './Logotipo_Prixelart_H#2.png';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    position: 'fixed',
    zIndex: 10,
    marginTop: 10,
    marginLeft: -24
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  a: {
    textDecoration:'none', 
    color: '#fff',
    position: 'relative'
  }
}));

export default function MenuAppBar(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const history = useHistory();
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMain = () => {
    history.push({pathname:"/"});
    setAnchorEl(null);
  };

  const handleBack = () => {
    history.goBack();
    setAnchorEl(null);
  };

  const handlePasswordChange = ()=> {
    history.push({pathname:"/cambio-contraseña"});
    setAnchorEl(null);
  }

  const handleCTLogin = () => {
    history.push({pathname:"/iniciar"});
    setAnchorEl(null);
  };

  const handleMyAccount = () => {
          history.push({pathname:"/"+ JSON.parse(localStorage.getItem('token')).username});
          setAnchorEl(null);
  };

  const handleLogout = () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/logout";
      axios.post(base_url)
      .then(response => {
          localStorage.setItem('token', null)
          history.push({pathname:"/iniciar"});
          setAnchorEl(null);
      });
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton className={classes.a} onClick={handleMain}>
            <img src={logo} alt="Prixelart logo" style={{width: 100}}/>
          </IconButton>
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              {
              (JSON.parse(localStorage.getItem('token')) &&
              JSON.parse(localStorage.getItem('token')).username) ?
                <Menu
                id="menu-appbar"
                label="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={handleMyAccount}>Mi Cuenta</MenuItem>
                <MenuItem onClick={handlePasswordChange}>Cambiar contraseña</MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
              </Menu>
              :
              <Menu
                id="menu-appbar"
                label="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={handleCTLogin}>Iniciar Sesión</MenuItem>
              </Menu>
              }
            </div>
          <IconButton
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleBack}
            color="inherit" 
            style={{position:'fixed', zIndex:10 ,marginLeft:'213px', color:'#fff', backgroundColor:'#d33f49'}} 
          >
            <ArrowBackIcon edge="end"/>
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
  );
}