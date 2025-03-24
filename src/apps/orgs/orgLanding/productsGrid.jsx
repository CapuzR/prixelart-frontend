import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Grid from '@mui/material/Grid';
import { makeStyles } from '@mui/styles';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import { getProducts } from './xoxo';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import ReactGA from 'react-ga';

ReactGA.initialize('G-0RWP9B33D8');

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  typography: { fontFamily: 'Lastik' },
}));

export default function CBProducts() {
  const classes = useStyles();
  const theme = useTheme();

  const isTab = useMediaQuery(theme.breakpoints.down('sm'));

  const [all, setAll] = useState([]);
  const [tiles, setTiles] = useState([]);
  const navigate = useNavigate();
  const [checkedProducts, setCheckedProducts] = useState([]);
  const [checkedDesigns, setCheckedDesigns] = useState([]);

  const handleChange = (prod, filterType) => {
    let copyP = [...checkedProducts];
    let copyD = [...checkedDesigns];

    let result = all;

    if (filterType === 'product') {
      const index = copyP.indexOf(prod);

      if (index !== -1) {
        copyP.splice(index, 1);
      } else {
        copyP.push(prod);
      }
      setCheckedProducts(copyP);
    } else if (filterType === 'art') {
      const index = copyD.indexOf(prod);
      if (index !== -1) {
        copyD.splice(index, 1);
      } else {
        copyD.push(prod);
      }
      setCheckedDesigns(copyD);
    }

    if (copyP.length > 0) {
      result = result.filter((item) => {
        return copyP.some((param) => item.product.name.includes(param.slice(0, -1)));
      });
    }
    if (copyD.length > 0) {
      result = result.filter((item) => {
        return copyD.some((param) => item.art.title.includes(param.slice(0, -1)));
      });
    }
    setTiles(result);
  };

  useEffect(() => {
    setTiles(getProducts());
    setAll(getProducts());
  }, []);

  const products = ['Franelas', 'Botella Rock', 'Tazas', 'Totes'];

  const designs = ['Cartoon', 'Cafecito', 'Independizar', 'Pasante Subpagado', 'Sobreviví'];

  const viewDetails = (item) => {
    navigate({
      pathname: '/chiguirebipolar/item=' + item.product.item,
    });
    ReactGA.event({
      category: 'Home CB',
      action: 'Ver_mas',
      label: item.product.item,
    });
  };

  const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 1000,
    infinite: true,
    dots: true,
    pauseOnHover: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  const settings2 = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 1000,
    infinite: true,
    pauseOnHover: true,
    arrows: false,
  };
  function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundColor: '#789BEC',
          borderRadius: '50%',
          width: '17px',
          height: '17px',
          display: 'flex',
          placeContent: 'center',
        }}
        onClick={onClick}
      />
    );
  }

  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundColor: '#789BEC',
          borderRadius: '50%',
          width: '17px',
          height: '17px',
          display: 'flex',
          placeContent: 'center',
        }}
        onClick={onClick}
      />
    );
  }

  return (
    <Grid id="prods" container>
      {!isTab && (
        <Grid item md={2}>
          <Accordion style={{ marginBottom: 20 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className={classes.heading}>Productos</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
              {products.map((prod) => (
                <Box
                  m={1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Checkbox
                    checked={checkedProducts.includes(prod)}
                    onClick={() => handleChange(prod, 'product')}
                  />

                  <Typography>{prod}</Typography>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
          <Accordion style={{ marginBottom: 20 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography className={classes.heading}>Diseños</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
              {designs.map((des) => (
                <Box
                  m={1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Checkbox
                    checked={checkedDesigns.includes(des)}
                    onClick={() => handleChange(des, 'art')}
                  />

                  <Typography>{des}</Typography>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        </Grid>
      )}

      <Grid item xs={12} md={9} style={{ marginRight: !isTab && 30 }}>
        <Grid container spacing={isTab ? 3 : 4} style={{ marginLeft: !isTab && 20 }}>
          {tiles.map((tile) => (
            <Grid
              item
              sm={6}
              xs={12}
              style={{
                display: 'flex',
                justifyContent: 'start',
              }}
            >
              <Grid
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  width: isTab ? 215 : 250,
                  height: isTab ? 135 : 180,
                  padding: '0px 30px 0px 30px',
                  margin: isTab && '0px -15px 0px -15px',
                }}
              >
                <Slider {...(isTab ? settings2 : settings)}>
                  {tile.art?.images.map((art, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: isTab ? 130 : 181,
                        width: isTab ? 154 : 200,
                        marginRight: 10,
                        placeContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: isTab ? 154 : '95%',
                          height: isTab ? 130 : 181,
                          backgroundImage: `url(${art.img})`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          borderRadius: 10,
                          opacity: tile?.product.name === 'Tote Bag' ? 0.5 : 1,
                        }}
                      ></div>
                    </div>
                  ))}
                </Slider>
              </Grid>
              <div
                style={{
                  width: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <Typography
                      className={classes.typography}
                      style={{ fontSize: isTab ? 16 : 20, fontWeight: 600 }}
                    >{`${tile.product.name} ${tile.art.title}`}</Typography>
                    <Typography
                      className={classes.typography}
                      style={{ fontSize: isTab ? 13 : 16 }}
                    >
                      {tile?.product.description}
                    </Typography>
                    {/* {tile?.product?.offer !== undefined && (
                      <Typography
                        className={classes.typography}
                        style={{ fontSize: isTab ? 13 : 16, fontWeight: "bold" }}
                        color="primary"
                      >
                        {tile?.product.offer}
                      </Typography>
                    )} */}
                  </div>
                  <Typography
                    className={classes.typography}
                    color="primary"
                    style={{
                      fontSize: isTab ? 16 : 20,
                      fontWeight: 600,
                      color: tile?.product.name === 'Tote Bag' ? '#d33f49' : '#00A650',
                    }}
                  >
                    {tile?.product.name !== 'Tote Bag'
                      ? `$${tile?.product.finalPrice?.toLocaleString('de-DE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : 'Agotado'}
                  </Typography>
                </div>
                {tile?.product.name !== 'Tote Bag' && (
                  <Button
                    className={classes.typography}
                    style={{
                      textTransform: 'none',
                      width: '100%',
                      backgroundColor: '#F4DF46',
                      borderRadius: 10,
                    }}
                    onClick={() => viewDetails(tile)}
                  >
                    Ver detalles
                  </Button>
                )}
              </div>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}
