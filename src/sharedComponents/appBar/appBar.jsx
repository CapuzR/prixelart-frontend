import React, { useState, useEffect } from "react";
import axios from "axios";
import clsx from "classnames";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import useMediaQuery from "@mui/material/useMediaQuery";
// import utils from "../../utils/utils";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import logo from "./Logotipo_Prixelart_H#2.png";

const drawerWidth = 240;

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
  root2: {
    display: "flex",
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    // height: "400px",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

export default function MenuAppBar(props) {
  const theme = useTheme();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const history = useNavigate();
  const open = Boolean(anchorEl);
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [open2, setOpen] = React.useState(false);
  const [avatar, setAvatar] = useState("");
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

  const handleMyStats = () => {
    history.push({
      pathname:
        "/" + JSON.parse(localStorage.getItem("token")).username + "/stats",
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

  const handleShoppingCart = (e) => {
    e.preventDefault();
    history.push({ pathname: "/shopping" });
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    getPrixerAvatar();
  }, []);

  const getPrixerAvatar = async () => {
    if (JSON.parse(localStorage.getItem("token"))) {
      const user = JSON.parse(localStorage.getItem("token")).username;
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/prixer/get/" + user;
      await axios.get(base_url).then((response) => {
        setAvatar(response.data.avatar);
      });
    }
  };

  return (
    <div className={classes.root}>
      {isMobile ? (
        <>
          <AppBar
            color="secondary"
            position="fixed"
            className={clsx(classes.appBar, {
              [classes.appBarShift]: open2,
            })}
          >
            <Toolbar
              style={{
                display: "flex",
                // alignItems: "justify",
                justifyContent: "space-between",
              }}
            >
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                className={clsx(classes.menuButton, open2 && classes.hide)}
                size="large"
              >
                <MenuIcon />
              </IconButton>
              <IconButton
                className={classes.a}
                onClick={handleMain}
                size="large"
              >
                <img src={logo} alt="Prixelart logo" style={{ width: 100 }} />
              </IconButton>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleBack}
                color="inherit"
                size="large"
              >
                <ArrowBackIcon edge="end" />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="left"
            open={open2}
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            <div className={classes.drawerHeader}>
              <IconButton onClick={handleDrawerClose} size="large">
                {theme.direction === "ltr" ? (
                  <ChevronLeftIcon />
                ) : (
                  <ChevronRightIcon />
                )}
              </IconButton>
            </div>
            <Divider />

            <Divider />
            {JSON.parse(localStorage.getItem("token")) && (
              <div
                style={{
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "center",
                  margin: "30px 0px",
                }}
              >
                <img
                  src={avatar}
                  style={{
                    height: 180,
                    width: 180,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
            <Tabs display="flex" orientation="vertical">
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
                label="Compras"
                onClick={handleShoppingCart}
              />
              <Tab
                className={classes.button}
                onClick={(e) => {
                  window.open("https://linktr.ee/prixelart", "_blank");
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
            <Divider />
            <Divider />

            {JSON.parse(localStorage.getItem("token")) &&
            JSON.parse(localStorage.getItem("token")).username ? (
              <Tabs display="flex" orientation="vertical">
                <Tab
                  className={classes.button}
                  onClick={handleMyAccount}
                  label="Mi Perfil"
                />
                <Tab
                  className={classes.button}
                  onClick={handleMyStats}
                  label="Mi Cuenta"
                />
                <Tab
                  className={classes.button}
                  onClick={handlePasswordChange}
                  label="Cambiar contraseña"
                />
                <Tab
                  className={classes.button}
                  onClick={handleLogout}
                  label="Cerrar Sesión"
                />
              </Tabs>
            ) : (
              <Tabs display="flex" orientation="vertical">
                <Tab
                  className={classes.button}
                  onClick={handleCTLogin}
                  label="Iniciar sesión"
                />
              </Tabs>
            )}
          </Drawer>
        </>
      ) : (
        <AppBar position="fixed" color="secondary">
          <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
            <IconButton className={classes.a} onClick={handleMain} size="large">
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
                label="Compras"
                onClick={handleShoppingCart}
              />
              <Tab
                className={classes.button}
                onClick={(e) => {
                  window.open("https://linktr.ee/prixelart", "_blank");
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
                size="large"
              >
                <ArrowBackIcon edge="end" />
              </IconButton>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                size="medium"
              >
                {JSON.parse(localStorage.getItem("token")) ? (
                  <img
                    src={avatar}
                    style={{
                      height: 40,
                      width: 40,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <AccountCircle />
                )}
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
                  <MenuItem onClick={handleMyAccount}>Mi Perfil</MenuItem>
                  <MenuItem onClick={handleMyStats}>Mi Cuenta</MenuItem>

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
