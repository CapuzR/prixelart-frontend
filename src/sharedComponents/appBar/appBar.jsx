import React from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import utils from "../../utils/utils";

import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import logo from "./Logotipo_Prixelart_H#2.png";
import createBreakpoints from "@material-ui/core/styles/createBreakpoints";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    zIndex: 10,
    width: "100%",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  a: {
    textDecoration: "none",
    color: "#fff",
    position: "relative",
    borderRadius: "30%",
  },
  title: {
    flexGrow: 1,
  },
  menu: {
    display: "flex",
    direction: "column",
  },
  button: {
    minWidth: "0px",
  },
}));

export default function MenuAppBar(props) {
  const theme = useTheme();

  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const history = useHistory();
  const open = Boolean(anchorEl);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMain = () => {
    history.push({ pathname: "/" });
    setAnchorEl(null);
  };

  const handleBack = () => {
    history.goBack();
    setAnchorEl(null);
  };

  const handlePasswordChange = () => {
    history.push({ pathname: "/cambio-contraseña" });
    setAnchorEl(null);
  };

  const handleCTLogin = () => {
    history.push({ pathname: "/iniciar" });
    setAnchorEl(null);
  };

  const handleMyAccount = () => {
    history.push({
      pathname: "/" + JSON.parse(localStorage.getItem("token")).username,
    });
    setAnchorEl(null);
  };

  const handleLogout = () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/logout";
    axios.post(base_url).then((response) => {
      localStorage.setItem("token", null);
      history.push({ pathname: "/iniciar" });
      setAnchorEl(null);
    });
  };

  const handleGallery = (e) => {
    e.preventDefault();
    history.push({ pathname: "/galeria" });
  };

  const handleProductCatalog = (e) => {
    e.preventDefault();
    history.push({ pathname: "/productos" });
  };

  return (
    <div
      className={classes.root}
      // style={{ position: isMobile ?  : "initial", width: "100%" }}
    >
      {isMobile ? (
        <AppBar color="secondary" position="initial">
          <Toolbar
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <IconButton className={classes.a} onClick={handleMain}>
              <img src={logo} alt="Prixelart logo" style={{ width: 100 }} />
            </IconButton>

            <Tabs
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              orientation="vertical"
            >
              <Tab
                className={classes.button}
                onClick={handleGallery}
                label="Galería"
              />
              <Tab
                className={classes.button}
                onClick={handleProductCatalog}
                label="Productos"
              />
              <Tab
                className={classes.button}
                onClick={(e) => {
                  window.open(utils.generateWaMessage(), "_blank");
                }}
                label="Contáctanos"
              />
              <Tab className={classes.button} label="Blog" />
            </Tabs>
            {/* <IconButton
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleBack}
          color="inherit"
          style={{
            // position: "fixed",
            // zIndex: 10,
            // marginLeft: "213px",
            color: "#fff",
            backgroundColor: "#d33f49",
          }}
        >
          <ArrowBackIcon edge="end" />
        </IconButton> */}
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
              {JSON.parse(localStorage.getItem("token")) &&
              JSON.parse(localStorage.getItem("token")).username ? (
                <Menu
                  id="menu-appbar"
                  label="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleMyAccount}>Mi Cuenta</MenuItem>
                  <MenuItem onClick={handlePasswordChange}>
                    Cambiar contraseña
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                </Menu>
              ) : (
                <Menu
                  id="menu-appbar"
                  label="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleCTLogin}>Iniciar Sesión</MenuItem>
                </Menu>
              )}
            </div>
          </Toolbar>
        </AppBar>
      ) : (
        <AppBar position="fixed" color="secondary">
          <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
            <IconButton className={classes.a} onClick={handleMain}>
              <img src={logo} alt="Prixelart logo" style={{ width: 100 }} />
            </IconButton>

            <Tabs>
              <Tab
                className={classes.button}
                onClick={handleGallery}
                label="Galería"
              />
              <Tab
                className={classes.button}
                onClick={handleProductCatalog}
                label="Productos"
              />
              <Tab
                className={classes.button}
                onClick={(e) => {
                  window.open(utils.generateWaMessage(), "_blank");
                }}
                label="Contáctanos"
              />
              <Tab
                className={classes.button}
                onClick={(e) => {
                  window.open("http://blog.prixelart.com/", "_blank");
                }}
                label="Blog"
              />
            </Tabs>

            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleBack}
                color="inherit"
                style={{
                  // position: "fixed",
                  // zIndex: 10,
                  // marginLeft: "213px",
                  color: "#fff",
                  // backgroundColor: "#d33f49",
                }}
              >
                <ArrowBackIcon edge="end" />
              </IconButton>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              {JSON.parse(localStorage.getItem("token")) &&
              JSON.parse(localStorage.getItem("token")).username ? (
                <Menu
                  id="menu-appbar"
                  label="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleMyAccount}>Mi Cuenta</MenuItem>
                  <MenuItem onClick={handlePasswordChange}>
                    Cambiar contraseña
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                </Menu>
              ) : (
                <Menu
                  id="menu-appbar"
                  label="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleCTLogin}>Iniciar Sesión</MenuItem>
                </Menu>
              )}
            </div>
          </Toolbar>
        </AppBar>
      )}
    </div>
  );
}
