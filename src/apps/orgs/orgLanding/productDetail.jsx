import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { makeStyles, withStyles } from '@mui/styles';
import CB_isologo from './assets/CB_isologo_black.svg';
import { getProducts } from './xoxo';
import Badge from '@mui/material/Badge';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import Snackbar from '@mui/material/Snackbar';
import Grid from '@mui/material/Grid';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Radio from '@mui/material/Radio';
import { useHistory } from 'react-router-dom';
import isotipo from './assets/isotipo.svg';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MDEditor from '@uiw/react-md-editor';
import ReactGA from 'react-ga';
ReactGA.initialize('G-0RWP9B33D8');

const useStyles = makeStyles((theme) => ({
  typography: { fontFamily: 'Lastik' },
  paper: {
    padding: "16px",
    textAlign: 'center',
  },
  button: {
    fontFamily: 'Lastik',
    textTransform: 'none',
    color: 'black',
    fontWeight: 600,
    fontSize: 18,
  },
  formControl: {
    marginTop: "48px",
    width: 120,
  },
  dotsContainer: {
    position: 'relative',
    display: 'flex !important',
    justifyContent: 'center',
    padding: 'unset',
  },
}));

export default function ProductDetail(props) {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const isTab = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState(undefined);
  const [selectedSize, setSelectedSize] = useState(undefined);
  const [selectedShape, setSelectedShape] = useState(undefined);
  const [selectedItem, setSelectedItem] = useState(undefined);
  const [buyState, setBuyState] = useState(
    localStorage.getItem('CBbuyState') ? JSON.parse(localStorage.getItem('CBbuyState')) : []
  );
  const [cartLength, setCartLength] = useState(
    localStorage.getItem('CBbuyState') ? JSON.parse(localStorage.getItem('CBbuyState')).length : 0
  );
  const url = window.location.pathname;
  const id = url.substring(url.lastIndexOf('=') + 1);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSize = (event) => {
    setSelectedSize(event.target.value);
  };

  const handleColor = (event) => {
    setSelectedColor(event.target.value);
  };

  const handleShape = (event) => {
    setSelectedShape(event.target.value);
  };

  useEffect(() => {
    const products = getProducts();

    const x = products.find((item) => item.product.item === id);
    setSelectedItem(x);
  }, []);

  const addItemToBuyState = (input) => {
    ReactGA.event({
      category: 'Carrito CB',
      action: 'agregar_al_carrito',
      label: input.product.item,
    });
    if (selectedColor === undefined) {
      setOpen(true);
      setMessage('Por favor selecciona un color.');
    } else if (Object.keys(input.product.attributes).length > 1 && selectedSize === undefined) {
      setOpen(true);
      setMessage('Por favor selecciona una talla.');
    } else if (Object.keys(input.product.attributes).length > 1 && selectedShape === undefined) {
      setOpen(true);
      setMessage('Por favor selecciona un corte.');
    } else {
      const newState = [...buyState];

      let prod = input.product;
      let art = input.art;

      let selection =
        Object.keys(input.product.attributes).length > 1
          ? selectedSize + ' ' + selectedColor + ' ' + selectedShape
          : selectedColor;
      prod.selection = selection;
      art.squareThumbUrl = art.images.find((a) => a.color === selectedColor).img;

      const prevItem = newState.find(
        (item) => item.product.item === input.product.item && item.product.selection === selection
      );

      if (!prevItem) {
        newState.push({
          art: art,
          product: prod,
          quantity: 1,
        });
        setCartLength((prevCartLength) => prevCartLength + 1);
      } else {
        setBuyState((prev) =>
          prev.map((item) => {
            if (item.product.item === input.product.item && item.product.selection === selection) {
              return { ...item, quantity: item.quantity++ };
            }
            return item;
          })
        );
      }

      setBuyState(newState);
      localStorage.setItem('CBbuyState', JSON.stringify(newState));
      setOpen(true);
      setMessage('Producto agregado al carrito correctamente.');
    }
  };

  const StyledBadge = withStyles((theme) => ({
    badge: {
      backgroundColor: '#FF9934',
      color: 'black',
    },
  }))(Badge);

  const settings = {
    customPaging: function (i) {
      let image;

      if (selectedColor) {
        const matchingImages = selectedItem?.art.images.filter(
          (image) => image.color === selectedColor
        );
        image = matchingImages?.length > 0 ? matchingImages[i]?.img : null;
      } else {
        image = selectedItem?.art.images[i]?.img;
      }

      return (
        <li
          style={{
            listStyle: 'none',
            marginLeft: '-12px',
            marginRight: '30px',
          }}
        >
          <a style={{ display: 'block', textDecoration: 'none' }}>
            <img
              src={image}
              style={{
                width: isTab ? 45 : 70,
                height: isTab ? 45 : 70,
                objectFit: 'cover',
              }}
            />
          </a>
        </li>
      );
    },
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
  };

  const handleMain = () => {
    history.push({ pathname: '/chiguirebipolar' });
  };

  const scrollToSection = (selector) => {
    const section = document.querySelector(selector);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToProduct = () => {
    handleMain();
    setTimeout(() => {
      scrollToSection('#productos');
    }, 500);
  };

  const handleCart = () => {
    history.push({ pathname: '/chiguirebipolar/carrito' });
  };

  const handleToPrixelart = () => {
    handleMain();
    setTimeout(() => {
      scrollToSection('#prixelart');
    }, 1200);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        style={{
          zIndex: 10000,
          backgroundColor: 'white',
        }}
      >
        <Toolbar
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Button onClick={handleMain}>
            <img
              src={isTab ? isotipo : CB_isologo}
              alt="Chiguire Bipolar isologo"
              style={{ width: isTab ? 40 : 238 }}
            />
          </Button>

          {isTab ? (
            <>
              <IconButton onClick={handleMenu} size="medium">
                <StyledBadge badgeContent={cartLength}>
                  <MenuIcon />
                </StyledBadge>
              </IconButton>

              <Menu
                style={{ zIndex: 100000 }}
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
                open={openMenu}
                onClose={handleClose}
              >
                <MenuItem onClick={() => scrollToSection('#prods')}>Productos</MenuItem>
                <MenuItem onClick={() => scrollToSection('#prixelart')}>Prixelart</MenuItem>
                <MenuItem onClick={handleCart}>Carrito</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Tabs>
                <Tab className={classes.button} onClick={handleToProduct} label="Productos" />
                <Tab className={classes.button} label="Prixelart" onClick={handleToPrixelart} />
              </Tabs>
              <div
                style={{
                  width: 257.93,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <IconButton onClick={handleCart}>
                  <StyledBadge badgeContent={cartLength}>
                    <div style={{ color: 'black' }}>
                      <ShoppingCartOutlined />
                    </div>
                  </StyledBadge>{' '}
                </IconButton>
              </div>{' '}
            </>
          )}
        </Toolbar>
      </AppBar>
      <Grid
        container
        style={{
          marginLeft: '5%',
          paddingRight: isTab ? '5%' : '12.5%',
          display: 'flex',
          justifyContent: 'space-evenly',
          marginTop: isTab ? 75 : 120,
        }}
      >
        {isTab && (
          <Typography
            className={classes.typography}
            style={{
              fontSize: 22,
              fontWeight: 600,
              display: 'flex',
              width: '100%',
            }}
          >
            {selectedItem?.product.name} {selectedItem?.art.title}
          </Typography>
        )}
        {isTab && (
          <Typography className={classes.typography} style={{ fontSize: 13, marginBottom: 35 }}>
            {selectedItem?.product.description}
          </Typography>
        )}
        <Grid
          item
          xs={12}
          sm={6}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            width: '50%',
            height: 420,
          }}
        >
          <Slider dotsClass={classes.dotsContainer} {...settings}>
            {selectedColor
              ? selectedItem?.art.images.map(
                  (art, i) =>
                    art.color === selectedColor && (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          height: 320,
                          width: '100%',
                          marginRight: 10,
                        }}
                      >
                        <div
                          style={{
                            marginTop: 5,

                            width: '95%',
                            height: 360,
                            backgroundImage: `url(${art.img})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                          }}
                        />
                      </div>
                    )
                )
              : selectedItem?.art.images.map((art, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: 360,
                      width: '100%',
                      marginRight: 10,
                    }}
                  >
                    <div
                      style={{
                        marginTop: 5,

                        width: '95%',
                        height: 360,
                        backgroundImage: `url(${art.img})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                      }}
                    />
                  </div>
                ))}
          </Slider>
        </Grid2>

        <Grid
          item
          xs={12}
          sm={4}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginRight: 20,
          }}
        >
          {!isTab && (
            <Typography className={classes.typography} style={{ fontSize: 40, fontWeight: 600 }}>
              {selectedItem?.product.name} {selectedItem?.art.title}
            </Typography>
          )}
          {!isTab && (
            <Typography className={classes.typography} style={{ fontSize: 20 }}>
              {selectedItem?.product.description}
            </Typography>
          )}
          <Typography
            className={classes.typography}
            style={{ fontSize: 24, fontWeight: 600, color: '#00A650' }}
          >
            $
            {selectedItem?.product.finalPrice?.toLocaleString('de-DE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
          <Grid container style={{ display: 'flex', justifyContent: 'space-between' }}>
            {selectedItem && selectedItem.product.attributes.talla && (
              <Grid item xs={6} md={4} style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  className={classes.typography}
                  style={{ fontSize: 17, marginTop: 20, marginBottom: 10 }}
                >
                  Talla
                </Typography>
                <Select
                  variant="outlined"
                  style={{
                    width: 120,

                    boxShadow: '0px 1px 12px rgba(0, 0, 0, 0.2)',
                    borderRadius: 15,
                    textAlign: 'center',
                  }}
                  value={selectedSize}
                  onChange={handleSize}
                >
                  {selectedItem?.product.attributes?.talla.map((t) => (
                    <MenuItem value={t} style={{ justifyContent: 'center' }}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </Grid2>
            )}
            {selectedItem && selectedItem.product.attributes.corte && (
              <Grid item xs={6} md={4} style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  className={classes.typography}
                  style={{ fontSize: 17, marginTop: 20, marginBottom: 10 }}
                >
                  Corte
                </Typography>
                <Select
                  variant="outlined"
                  style={{
                    width: 120,

                    boxShadow: '0px 1px 12px rgba(0, 0, 0, 0.2)',
                    borderRadius: 15,
                    textAlign: 'center',
                  }}
                  value={selectedShape}
                  onChange={handleShape}
                >
                  {selectedItem?.product.attributes?.corte.map((t) => (
                    <MenuItem value={t} style={{ justifyContent: 'center' }}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </Grid2>
            )}
            {selectedItem && selectedItem.product.attributes.color && (
              <Grid
                item
                xs={6}
                md={4}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: isTab && '100%',
                }}
              >
                <Typography
                  className={classes.typography}
                  style={{ fontSize: 17, marginTop: 20, marginBottom: 10 }}
                >
                  Color
                </Typography>
                <div>
                  <Radio
                    checked={selectedColor === 'Negro'}
                    onChange={handleColor}
                    value="Negro"
                    style={{
                      color: 'black',
                    }}
                  />
                  <Radio
                    checked={selectedColor === 'Azul'}
                    onChange={handleColor}
                    value="Azul"
                    style={{
                      color: 'blue',
                    }}
                  />
                  <Radio
                    checked={selectedColor === 'Verde'}
                    onChange={handleColor}
                    value="Verde"
                    style={{
                      color: 'green',
                    }}
                  />
                </div>
              </Grid2>
            )}
          </Grid2>
          <Button
            className={classes.typography}
            style={{
              textTransform: 'none',
              width: '100%',
              backgroundColor: '#F4DF46',
              borderRadius: 10,
              fontSize: 18,
              marginTop: 20,
              marginBottom: 20,
            }}
            onClick={() => addItemToBuyState(selectedItem)}
          >
            Comprar ahora
          </Button>
          {selectedItem?.product?.offer !== undefined && (
            <Typography
              className={classes.typography}
              style={{ fontSize: isTab ? 13 : 18, fontWeight: 'bold' }}
              color="primary"
            >
              {selectedItem?.product.offer}
            </Typography>
          )}
          {selectedItem?.product?.specs && (
            <div
              data-color-mode="light"
              style={{
                marginTop: 25,
                marginBottom: 30,
                display: 'flex',
              }}
            >
              <MDEditor.Markdown
                source={selectedItem.product?.specs}
                style={{ whiteSpace: 'pre-wrap', fontSize: isTab ? 13 : 16 }}
                className={classes.typography}
              />
            </div>
          )}
        </Grid2>
      </Grid2>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
