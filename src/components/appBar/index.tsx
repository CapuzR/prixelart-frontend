import React, { useState, useEffect } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import useStyles from './MenuAppBar.styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import Badge from '@mui/material/Badge';

import logo from './Logotipo_Prixelart_H2.png';
import CB from '../../apps/orgs/orgLanding/assets/isotipo.svg';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useCurrency } from 'context/GlobalContext';
import { useCart } from 'context/CartContext';

const MenuAppBar: React.FC = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open2, setOpen] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<string>('');
  const { currency, toggleCurrency } = useCurrency();
  const { cart } = useCart();

  const [selectedTab, setSelectedTab] = useState("home");

  const tabRoutes: { [key: string]: string } = {
    home: '/',
    gallery: '/galeria',
    products: '/productos',
    prixers: '/prixers',
    services: '/servicios',
    organizaciones: '/organizaciones',
    testimonials: '/testimonios',
  };

  useEffect(() => {
    const currentTab = Object.keys(tabRoutes).find(
      (key) => tabRoutes[key] === location.pathname
    );
    setSelectedTab(currentTab || "home");
  }, [location.pathname]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMain = () => {
    navigate('/');
    setAnchorEl(null);
  };

  const handlePasswordChange = () => {
    navigate('/cambio-contraseña');
    setAnchorEl(null);
  };

  const handleCTLogin = () => {
    navigate('/iniciar');
    setAnchorEl(null);
  };

  const handleOrg = () => {
    navigate('/organizaciones');
  };

  const handleMyAccount = () => {
    const tokenString = localStorage.getItem('token');
    if (tokenString) {
      const token = JSON.parse(tokenString);
      navigate(`/prixer=${token.username}`);
    }
    setAnchorEl(null);
  };

  const handleMyStats = () => {
    const tokenString = localStorage.getItem('token');
    if (tokenString) {
      const token = JSON.parse(tokenString);
      navigate(`/prixer=${token.username}/stats`);
    }
    setAnchorEl(null);
  };

  const handleLogout = () => {
    const base_url = `${import.meta.env.VITE_BACKEND_URL}/logout`;
    axios.post(base_url).then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpire');
      navigate('/iniciar');
      setAnchorEl(null);
    });
  };

  const handleCB = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    navigate('/chiguirebipolar');
  };

  const openShoppingCart = () => {
    navigate('/carrito');
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
    const tokenString = localStorage.getItem('token');
    if (tokenString) {
      const token = JSON.parse(tokenString);
      const user = token.username;
      const base_url = `${import.meta.env.VITE_BACKEND_URL}/prixer/get/${user}`;
      await axios.get(base_url).then((response) => {
        setAvatar(response.data.avatar);
      });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
    // Navigate to the route associated with the selected tab
    if (tabRoutes[newValue]) {
      navigate(tabRoutes[newValue]);
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
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                className={clsx(open2 && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <div style={{ display: 'flex' }}>
                <IconButton className={classes.a} onClick={handleMain}>
                  <img src={logo} alt="Prixelart logo" style={{ width: 100 }} />
                </IconButton>
                <div
                  style={{
                    display: 'flex',
                    placeContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <IconButton onClick={handleCB} size="medium">
                    <img className={classes.brillante} src={CB} style={{ height: 45 }} />
                  </IconButton>
                </div>
              </div>
              <IconButton onClick={openShoppingCart} color="inherit">
                <Badge overlap="rectangular" badgeContent={cart.lines.length} style={{ color: "white" }}>
                  <ShoppingCartOutlinedIcon />
                </Badge>
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
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </IconButton>
            </div>
            <Divider />

            <Divider />
            {localStorage.getItem('token') && (
              <div
                style={{
                  display: 'flex',
                  alignContent: 'center',
                  justifyContent: 'center',
                  margin: '30px 0px',
                }}
              >
                <img
                  onClick={handleMyAccount}
                  src={avatar}
                  style={{
                    height: 180,
                    width: 180,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
            <Tabs style={{ display: "flex" }} orientation="vertical" value={selectedTab} onChange={handleTabChange}>
              <Tab className={classes.button} value="gallery" label="Galería" />
              <Tab className={classes.button} value="products" label="Productos" />
              <Tab className={classes.button} value="prixers" label="Prixers" />
              <Tab className={classes.button} value="organizaciones" label="Organizaciones" />
              <Tab className={classes.button} value="services" label="Servicios" />
              <Tab className={classes.button} value="testimonials" label="Testimonios" />
              <Divider />

              {localStorage.getItem('token') &&
                JSON.parse(localStorage.getItem('token') as string)?.username ? (
                <Tabs style={{ display: "flex" }} orientation="vertical">
                  <Tab className={classes.button} onClick={handleMyAccount} label="Mi Perfil" />
                  <Tab className={classes.button} onClick={handleMyStats} label="Mi Cuenta" />
                  <Tab
                    className={classes.button}
                    onClick={handlePasswordChange}
                    label="Cambiar contraseña"
                  />
                  <Tab className={classes.button} onClick={handleLogout} label="Cerrar Sesión" />
                </Tabs>
              ) : (
                <Tab className={classes.button} onClick={handleCTLogin} label="Iniciar sesión" />
              )}
              <Divider />
              <Divider />
              <Tab
                className={classes.button}
                onClick={(e) => {
                  window.open('https://linktr.ee/prixelart', '_blank');
                }}
                label="Contáctanos"
              />
              <Tab
                className={classes.button}
                onClick={(e) => {
                  window.open('http://blog.prixelart.com/', '_blank');
                }}
                label="Blog"
              />
            </Tabs>
          </Drawer>
        </>
      ) : (
        <AppBar position="fixed" color="secondary">
          <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 'fit-content', paddingRight: '4vw' }}>
              <IconButton className={classes.a} onClick={handleMain}>
                <img src={logo} alt="Prixelart logo" style={{ width: 100 }} />
              </IconButton>
            </div>

            <div style={{ width: 'fit-content' }}>
              <Tabs value={selectedTab} onChange={handleTabChange}>
                <Tab className={classes.button} value="home" label="Home" />
                <Tab className={classes.button} value="gallery" label="Galería" />
                <Tab className={classes.button} value="products" label="Productos" />
                <Tab className={classes.button} value="prixers" label="Prixers" />
                <Tab className={classes.button} value="organizaciones" label="Organizaciones" />
                <Tab className={classes.button} value="services" label="Servicios" />
                <Tab className={classes.button} value="testimonials" label="Testimonios" />
                <div
                  style={{
                    display: 'flex',
                    placeContent: 'center',
                    alignItems: 'center',
                    paddingRight: 20,
                  }}
                >
                  <IconButton onClick={handleCB} size="medium">
                    <img
                      className={classes.brillante}
                      src={CB}
                      style={{ marginLeft: 20, height: 45 }}
                    />
                  </IconButton>
                </div>
              </Tabs>
            </div>

            <div style={{ display: 'flex', width: 'fit-content' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '5vw',
                }}
              >
                {/* <IconButton
                  onClick={toggleTheme}
                  color="inherit"
                  aria-label="Toggle theme"
                >
                  {currentTheme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                </IconButton> */}

                <IconButton onClick={toggleCurrency} color="inherit" aria-label="Toggle currency">
                  {currency === 'USD' ? <AttachMoneyIcon /> : <p style={{
                    fontFamily: "'Material Icons', sans-serif",
                    fontSize: '19px',
                    fontWeight: 'bold',
                    color: 'inherit',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    margin: '0'
                  }}>Bs</p>}
                </IconButton>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                <IconButton onClick={openShoppingCart} color="inherit">
                  <Badge
                    overlap="rectangular"
                    badgeContent={
                      cart.lines.length
                    }
                    style={{ color: "white" }}
                  >
                    <ShoppingCartOutlinedIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                  size="medium"
                >
                  {localStorage.getItem('token') ? (
                    <img
                      src={avatar}
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <MenuIcon />
                  )}
                </IconButton>
                {localStorage.getItem('token') &&
                  JSON.parse(localStorage.getItem('token') as string)?.username ? (
                  <Menu
                    id="menu-appbar"
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
                    <MenuItem onClick={handleMyAccount}>Mi Perfil</MenuItem>
                    <MenuItem onClick={handleMyStats}>Mi Cuenta</MenuItem>

                    <MenuItem onClick={handlePasswordChange}>Cambiar contraseña</MenuItem>
                    <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
                    <Divider />
                    <MenuItem onClick={handleOrg}>Organizaciones</MenuItem>
                    <MenuItem
                      onClick={(e) => {
                        window.open('https://linktr.ee/prixelart', '_blank');
                      }}
                    >
                      Contáctanos
                    </MenuItem>
                    <MenuItem
                      onClick={(e) => {
                        window.open('http://blog.prixelart.com/', '_blank');
                      }}
                    >
                      Blog
                    </MenuItem>
                  </Menu>
                ) : (
                  <Menu
                    id="menu-appbar"
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
                    <MenuItem onClick={handleOrg}>Organizaciones</MenuItem>

                    <MenuItem
                      onClick={(e) => {
                        window.open('https://linktr.ee/prixelart', '_blank');
                      }}
                    >
                      Contáctanos
                    </MenuItem>
                    <MenuItem
                      onClick={(e) => {
                        window.open('http://blog.prixelart.com/', '_blank');
                      }}
                    >
                      Blog
                    </MenuItem>
                    <MenuItem onClick={handleCTLogin}>Iniciar Sesión</MenuItem>
                  </Menu>
                )}
              </div>
            </div>
          </Toolbar>
        </AppBar>
      )}
    </div>
  );
}

export default MenuAppBar;