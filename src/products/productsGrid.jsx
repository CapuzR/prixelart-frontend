//[]      17. Búsqueda de Prixers.
//[]      21. Términos y condiciones.
//[]      16. Filtros para las búsquedas (Por etiqueta).
//[]      25. Editar datos de la imagen en la tarjeta del grid grande.

import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import { isWidthUp } from '@material-ui/core/withWidth';
import Carousel from 'react-material-ui-carousel'
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import utils from '../utils/utils';
import axios from 'axios';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import MaximizeIcon from '@material-ui/icons/Maximize';

import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { setProductAtts, getAttributes, getEquation } from './services.js';


const useStyles = makeStyles((theme) => ({
  root :{
    display: 'flex',
    flexWrap: 'wrap',
    overflow: 'hidden',
    alignContent: "space-between",
    padding: 10,
    marginTop: 10,
    width: '50%',
    backgroundColor: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
      maxWidth: 300
    },
    [theme.breakpoints.up('sm')]: {
      maxWidth: 330
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: 330
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: 330
    }
  },
  gridList: {
    overflow: 'hidden',
    padding: 10,
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
  },
  img: {
    width: '100%',
    height: '100%'
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  form: {
    width: '100%'
  },
  CarouselContent: {
      width: '100%',
      heigh: '40vh'
  }
}));

const getGridListCols = () => {
  if (isWidthUp('md', 200)) {
    return 4;
  }

  return 1;
}

export default function ProductGrid(props) {
  const classes = useStyles();
  const [tiles, setTiles] = useState();
  const [width, setWidth] = useState([]);
  const [height, setHeight] = useState([]);


  useEffect(() => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-all";
    axios.get(base_url)
      .then(async (response) => {
        let productsAttTemp1 = response.data.products
        await productsAttTemp1.map(async (p, iProd, pArr) => {
          productsAttTemp1 = await getEquation(p, iProd, pArr);
        });
        setTiles(getAttributes(productsAttTemp1));
      });
  }, []);

  return (
    <GridList cellHeight={'auto'} className={classes.gridList} cols={getGridListCols()}>
      {tiles ?
        tiles.map((tile, iProd, productsArr) => (
          <Card className={classes.root}>
          <CardMedia>
              <Carousel
                stopAutoPlayOnHover={true}
                animation='slide'
                duration={500}
                fullHeightHover={true}
                IndicatorIcon={<MaximizeIcon/>}
                NextIcon={<ArrowForwardIosIcon />}
                PrevIcon={<ArrowBackIosIcon />}
                navButtonsProps={
                  {
                    style: {
                      backgroundColor: 'rgba(0, 0, 0, 0)',
                      width: '98%',
                      height: '100vh',
                      marginTop: '-50vh',
                      borderRadius: '0',
                      marginLeft: '1px'
                    }
                  }
                }
                indicatorContainerProps={
                  {
                    style:{
                      position: 'absolute',
                      marginTop: '-17px'
                    }
                  }
                }>
                {
                tile.images ?
                tile.images.map((img, key_id) =>
                (
                  <img key={key_id}  src={img} className={classes.img} alt="product"></img>
                ))
                  :
                <img src={tile.thumbUrl} className={classes.img} alt="product"></img>
                }

              </Carousel>
              </CardMedia>
              <CardActionArea style={{ alignContent: "space-between" }}>
              <CardContent>
                <Typography gutterBottom style={{ padding: 0, marginBotom: 12, width: 10 }} variant="h5" component="h2">
                  {tile.name}
                </Typography>
                <Typography gutterBottom style={{ fontSize: 15, padding: 0, marginBottom: 15 }} variant="h5" component="h2">
                  {
                    (JSON.parse(localStorage.getItem('token')) &&
                      JSON.parse(localStorage.getItem('token')).username) ?
                      (tile.needsEquation && tile.prixerEquation && tile.prixerEquation != 0) ?
                        "PVP: $" + Math.round(parseFloat(tile.publicEquation)) + " \n PVM: $" + Math.round(parseFloat(tile.prixerEquation)) :
                        "PVP: $" + tile.publicPrice?.from + " - " + tile.publicPrice?.to + " \n PVM: $" + tile.prixerPrice?.from + " - " + tile.prixerPrice?.to
                      :
                      (tile.needsEquation && tile.publicEquation && tile.publicEquation != 0) ?
                        "PVP: $" + Math.round(parseFloat(tile.publicEquation)) :
                        "PVP: " + tile.publicPrice?.from + " - " + tile.publicPrice?.to
                  }
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {tile.description}
                </Typography>
              </CardContent>
            </CardActionArea>
            {
              tile.hasSpecialVar &&
              <>
                <CardActions style={{ width: '25%' }}>
                  {/* <Grid container xs={12} md={12} spacing={2}> */}
                  <Grid item xs={12} md={12}>
                    <FormControl variant="outlined" className={classes.form}>
                      <TextField
                        variant="outlined"
                        display="inline"
                        id="width"
                        label="Ancho"
                        name="width"
                        autoComplete="width"
                        value={width[iProd]}
                        onChange={async (e) => {
                          if (!e.target.value) {
                            let w = width;
                            w[iProd] = e.target.value;
                            setWidth([...w]);
                            let l = await getEquation(tile, iProd, tiles, width, height);
                            setTiles([...l]);
                          } else {
                            if (/^\d+$/.test(e.target.value) && e.target.value[0] !== "0") {
                              if (e.target.value && e.target.value != 0) {
                                let w = width;
                                w[iProd] = e.target.value;
                                setWidth([...w]);
                                let l = await getEquation(tile, iProd, tiles, width, height);
                                setTiles([...l]);
                              } else {
                                let w = width;
                                w[iProd] = e.target.value;
                                setWidth([...w]);
                                let l = await getEquation(tile, iProd, tiles, width, height);
                                setTiles([...l]);
                              }
                            }
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                </CardActions>
                <CardActions style={{ width: '25%' }}>
                  <Grid item xs={12} md={12}>
                    <FormControl variant="outlined" className={classes.form}>
                      <TextField
                        variant="outlined"
                        display="inline"
                        id="height"
                        label="Alto"
                        name="height"
                        autoComplete="height"
                        value={height[iProd]}
                        onChange={async (e) => {
                          if (!e.target.value) {
                            let h = height;
                            h[iProd] = e.target.value;
                            setHeight([...h]);
                            let l = await getEquation(tile, iProd, tiles, width, height);
                            setTiles([...l]);
                          } else {
                            if (/^\d+$/.test(e.target.value) && e.target.value[0] !== "0") {
                              if (e.target.value && e.target.value != 0) {
                                let h = height;
                                h[iProd] = e.target.value;
                                setHeight([...h]);
                                let l = await getEquation(tile, iProd, tiles, width, height);
                                setTiles([...l]);
                              } else {
                                let h = height;
                                h[iProd] = e.target.value;
                                setHeight([...h]);
                                let l = await getEquation(tile, iProd, tiles, width, height);
                                setTiles([...l]);
                              }
                            }
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                  {/* </Grid> */}
                </CardActions>
              </>
            }
            {
              tile.attributes &&
              tile.attributes.map((att, iAtt, attributesArr) => (
                <CardActions key={iAtt} style={{ width: '50%' }}>
                  <Grid item xs={12} sm={12} md={12}>
                    <FormControl variant="outlined" className={classes.form} xs={12} sm={12} md={12}>
                      <InputLabel required id="att.name">{att.name}</InputLabel>
                      <Select
                        labelId="artTypeLabel"
                        id="artType"
                        value={tile.selection && tile.selection[iAtt]}
                        onChange={
                          async (e) => {
                            const pAtts = await setProductAtts(e.target.value, attributesArr, iProd, iAtt, productsArr, width, height);

                            if (pAtts) {
                              setTiles(pAtts.pAtt ? [...pAtts.pAtt] : [...pAtts.att]);
                            }
                          }
                        }
                        label={att.selection}
                      >
                        <MenuItem value="">
                          <em></em>
                        </MenuItem>
                        {
                          att.value &&
                          att.value.map((n, i) => (
                            <MenuItem key={n} value={n}>{n}</MenuItem>
                          ))
                        }
                      </Select>
                    </FormControl>
                  </Grid>
                </CardActions>
              ))
            }
            <CardActions>
              <Button size="small" color="primary" onClick={(e) => { window.open(utils.generateWaProductMessage(tile), '_blank'); }}>
                Información <WhatsAppIcon />
              </Button>
            </CardActions>
            <CardActions>
              {
                tile.variants &&
                tile.variants.map((v) => {
                  if (v.attributes) {
                    const test = v.attributes.reduce((r, a) => {
                      return (a.name in tile.attributes) === true
                    }, true)
                  }
                })
              }
            </CardActions>
          </Card>
        )
        )
        :
        <h1>Pronto encontrarás los productos ideales para ti.</h1>
      }
    </GridList>
  );
}
