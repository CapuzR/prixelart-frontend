import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '@mui/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Card from '@mui/material/Card';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import AppBar from '@components/appBar';
import Paper from '@mui/material/Paper';

import InstagramIcon from '@mui/icons-material/Instagram';
import SimpleDialog from 'components/simpleDialog/simpleDialog';
import FloatingAddButton from 'components/floatingAddButton/floatingAddButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Img from 'react-cool-img';
import { useNavigate } from 'react-router-dom';

import MaximizeIcon from '@mui/icons-material/Maximize';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import CreateService from 'components/createService/createService';
import ArtUploader from '@apps/artist/artUploader/artUploader';
import ReactGA from 'react-ga';
// import Slider from "react-slick"
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import backG from 'images/Rectangle108.png';
import BrandsCarousel from 'components/brandsCarousel/brandsCarousel';
import { Slider } from 'components/Slider';
import { Image } from 'components/Image';
import ProductElement from 'components/ProductElement';
import { getImageSize } from 'utils/util';

ReactGA.initialize('G-0RWP9B33D8');
ReactGA.pageview('/');

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://prixelart.com/">
        Prixelart C.A.
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  iconTabs: {
    flexGrow: 1,
    maxWidth: 650,
    margin: 'auto',
    marginBottom: 30,
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    // overflowX: "none",
    flexGrow: 1,
    // overflow: "visible",
    padding: 0,
    maxWidth: '100%',
    width: '100%',
    // marginTop: "-2.3vh",
  },
  paper2: {
    position: 'absolute',
    width: '80%',
    maxHeight: 450,
    overflowY: 'auto',
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: '16px 32px 24px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'justify',
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    padding: theme.spacing(25, 0, 6),
    minHeight: '100vh',
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    width: '100%',
    paddingTop: theme.spacing(4),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
    position: 'relative',
    bottom: 0,
  },
  float: {
    position: 'relative',
    marginLeft: '95%',
  },
  CarouselContent: {
    width: '100%',
    heigh: '100%',
  },
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
    overflowY: 'auto',
    width: '80%',
    maxHeight: 450,
  },
}));

export default function Home(props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isDeskTop = useMediaQuery(theme.breakpoints.up('sm'));
  const isTab = useMediaQuery(theme.breakpoints.down('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const classes = useStyles();
  const prixerUsername = 'all';
  const [imagesDesktop, newImagesDesktop] = useState({ images: [] });
  const [imagesMobile, newImagesMobile] = useState({ images: [] });
  const [tabValue, setTabValue] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [openArts, setOpenArts] = useState(true);
  const [selectedArt, setSelectedArt] = useState(undefined);
  const [bestSellers, setBestSellers] = useState();
  const [latestArts, setLatestArts] = useState();
  const [mostSelledArts, setMostSelledArts] = useState();
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false);
  const [createdService, setCreatedService] = useState(false);

  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const [openShoppingCart, setOpenShoppingCart] = useState(false);
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  // const brands = [brand1, brand2, brand3, brand4, brand5];
  const imgsMobile = [
    {
      url: 'https://devprix.nyc3.digitaloceanspaces.com/Portada%20de%20Pagina%20Web_Museo%20Chuao%20Espejo_Telefono_V1.jpg',
    },
    {
      url: 'https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Canva%20Studio%20en%20Pexels_16a9.jpg',
    },
    {
      url: 'https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Medhat%20Ayad%20en%20Pexels_9a16.jpg',
    },
    {
      url: 'https://devprix.nyc3.digitaloceanspaces.com/Pixabay_%203X.2%20Phone.jpg',
    },
    {
      url: 'https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Vecislavas%20Popa%20en%20Pexels_lINEAL%20120X40.2%20%20Phone.jpg',
    },
    {
      url: 'https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Daria%20Shevtsova%20en%20Pexels.jpg',
    },
  ];

  const getImagesForTheCarousel = () => {
    const URI = import.meta.env.VITE_BACKEND_URL + '/carousel';
    fetch(URI)
      .then((res) =>
        res
          .json()
          .then((data) => {
            const imagesDesktop = data.imagesCarousels.filter(
              (result) => result.images?.type === 'desktop' || result.carouselImages
            );
            const imagesMobile = data.imagesCarousels.filter(
              (result) => result.images?.type === 'mobile'
            );
            newImagesDesktop({
              images: imagesDesktop.length > 0 ? imagesDesktop : data.imagesCarousels,
            });
            newImagesMobile({
              images: imagesMobile.length > 0 ? imagesMobile : imgsMobile,
            });
          })
          .catch((err) => console.error(`Your request is wrong: ${err}`))
      )
      .catch((err) => console.error(err));
  };

  const getBestSellers = async () => {
    const url = import.meta.env.VITE_BACKEND_URL + '/product/bestSellers';
    try {
      const bestS = await axios.get(url);
      setBestSellers(bestS.data.products);
    } catch (error) {
      console.log(error);
    }
  };

  const getBestArts = async () => {
    const url = import.meta.env.VITE_BACKEND_URL + '/art/bestSellers';
    try {
      const getArts = await axios.get(url);
      setMostSelledArts(getArts.data.arts);
    } catch (error) {
      console.log(error);
    }
  };
  const [sizes, setSizes] = useState([{}]);

  const getLatest = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/art/get-latest';
    try {
      const getLatestArts = await axios.get(base_url);
      const artsArray = getLatestArts.data.arts.map((art) => ({
        ...art,
        url: art?.largeThumbUrl ? art?.largeThumbUrl : art?.thumbUrl,
      }));

      const sizesArray = await Promise.all(
        artsArray.map(async (art) => {
          try {
            return await getImageSize(art.url);
          } catch (error) {
            console.error('Failed to get image size for:', art.url, error);
            return { width: 0, height: 0 };
          }
        })
      );

      const artsWithSizes = artsArray.map((art, index) => ({
        ...art,
        width: sizesArray[index]?.width || 0,
        height: sizesArray[index]?.height || 0,
      }));

      setLatestArts(artsWithSizes);
    } catch (error) {
      console.log('Error fetching latest arts:', error);
    }
  };

  useEffect(() => {
    getImagesForTheCarousel();
    getBestSellers();
    getBestArts();
    getLatest();
  }, []);

  const handleProductCatalog = (e) => {
    e.preventDefault();
    navigate({ pathname: '/productos' });
  };

  const handleProduct = async (product) => {
    props.setPointedProduct(product.name);
    navigate({ pathname: '/productos' });
    setTimeout(() => {
      document.getElementById(product.name)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 1000);
  };

  const handleGallery = (e) => {
    e.preventDefault();
    navigate({ pathname: '/galeria' });
  };

  const handleArt = async (art) => {
    navigate({
      pathname: '/art=' + art.artId,
    });
  };

  const desktopImages = imagesDesktop?.images.filter((img) => img?.images?.type === 'desktop');
  const mobileImages = imagesMobile?.images.filter(
    (img) => !img.images || img?.images?.type === 'mobile'
  );

  return (
    <>
      <div style={{ flex: 1, position: 'relative', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: `calc(100vh - 64px)`,
              width: '100%',
            }}
          >
            {/* First Row - Slider */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                overflow: 'auto',
                scrollbarGutter: 'stable',
                width: '100vw',
              }}
            >
              {isDesktop ? (
                <Slider
                  images={desktopImages}
                  useIndicators={{
                    type: 'dots',
                    position: 'over',
                    color: { active: 'primary', inactive: 'white' },
                  }}
                  childConfig={{ qtyPerSlide: 1, spacing: 'none' }}
                >
                  {desktopImages.map((img, i) => (
                    <Image
                      src={img.images.url}
                      roundedCorner={false}
                      fitTo="width"
                      objectFit="fill"
                    />
                  ))}
                </Slider>
              ) : (
                <Slider
                  images={mobileImages}
                  useIndicators={{
                    type: 'dots',
                    position: 'over',
                    color: { active: 'primary', inactive: 'white' },
                  }}
                  childConfig={{ qtyPerSlide: 1, spacing: 'none' }}
                >
                  {mobileImages.map((img, i) => (
                    <Image
                      key={i}
                      src={img.images.url}
                      fitTo="height"
                      roundedCorner={false}
                      objectFit="cover"
                    />
                  ))}
                </Slider>
              )}
            </div>
            {/* Second Row - Text */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#404e5c',
                backgroundColor: '#fff',
                width: '100%',
                padding: '1rem',
                textAlign: 'center',
                minHeight: '50px',
              }}
            >
              <div style={{ maxWidth: '400px', paddingLeft: 10 }}>
                <Typography
                  component="h1"
                  variant="h1"
                  style={{
                    fontSize: '1.6em',
                    marginBottom: 0,
                  }}
                  gutterBottom
                >
                  Encuentra el <strong>cuadro</strong> ideal para ti.
                </Typography>
              </div>
            </div>
          </div>
          <Grid container style={{ padding: '20px' }}>
            <Grid item sm={12} xs={12}>
              <Paper
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'end',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '100%',
                  borderRadius:
                    (isDesktop && '2.9375rem') ||
                    (isMobile && '1.875rem') ||
                    (isTab && '2.1875rem'),
                  backgroundColor: 'gainsboro',
                  marginBottom: '1.8rem',
                  padding: '1.2rem',
                }}
                elevation={5}
              >
                <div
                  style={{
                    backgroundImage: `url(${backG})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'left',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyItems: 'center',
                    padding: '1.5rem 1.5625rem 1.5rem 0px',
                    paddingRight: isMobile ? '0.9375rem' : '1.5625rem',
                    marginBottom: '1.2rem',
                    backgroundColor: '#404e5c',
                    alignItems: 'end',
                    borderRadius: (isDesktop && 47) || (isMobile && 30) || (isTab && 35),
                  }}
                >
                  <Typography
                    variant="h3"
                    style={{
                      color: 'white',
                      marginBottom: isDesktop && 12,
                      fontSize: (isDesktop && 30) || (isMobile && 12) || (isTab && 18),
                    }}
                    fontWeight="bold"
                  >
                    <strong>¡Productos más vendidos! </strong>
                  </Typography>
                  <Typography
                    style={{
                      color: '#b7bcc1',
                      textAlign: (isDesktop && 'start') || ((isMobile || isTab) && 'end'),
                      marginBottom: isDesktop && 12,
                      fontSize: (isDesktop && 20) || (isMobile && 8) || (isTab && 14),
                      marginLeft: isMobile && '140px',
                    }}
                  >
                    ¡No te lo puedes perder! Descubre los favoritos de nuestros clientes
                  </Typography>

                  <Button
                    style={{
                      backgroundColor: '#d33f49',
                      color: 'white',
                      borderRadius: 40,
                      fontSize: isDesktop ? 20 : 12,
                      textTransform: 'none',
                      paddingLeft: 20,
                      paddingRight: 20,
                    }}
                    onClick={handleProductCatalog}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    Ver todos
                  </Button>
                </div>
                {bestSellers && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      position: 'relative',
                      width: '100%',
                      height: (isDesktop && 450) || (isMobile && 390) || (isTab && 235),
                      marginLeft: isMobile && 10,
                      padding: isMobile ? 20 : '10px 30px 10px 30px',
                      marginTop: '-10px',
                    }}
                  >
                    <Slider
                      images={bestSellers?.map((product) => ({
                        url:
                          product?.sources?.images.length > 0
                            ? product.sources.images[0]?.url
                            : product.thumbUrl,
                      }))}
                      useIndicators={{
                        type: 'dots',
                        position: 'below',
                        color: { active: 'primary', inactive: 'secondary' },
                      }}
                      childConfig={{
                        qtyPerSlide: isDesktop ? 5 : isMobile ? 3 : 5,
                        spacing: 'sm',
                      }}
                      autoplay={false}
                    >
                      {bestSellers?.map((product) => (
                        <ProductElement
                          src={
                            product?.sources?.images.length > 0
                              ? product.sources.images[0]?.url
                              : product.thumbUrl
                          }
                          productName={product.name}
                          buttonLabel="Ver detalles"
                          onButtonClick={() => handleProduct(product)}
                          roundedCorner={true}
                        />
                      ))}
                    </Slider>
                  </div>
                )}
              </Paper>
            </Grid>
            {mostSelledArts && (
              <Paper
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  width: '100%',
                  height: (isDesktop && 450) || (isMobile && 500) || (isTab && 380),
                  borderRadius:
                    (isDesktop && '2.9375rem') ||
                    (isMobile && '1.875rem') ||
                    (isTab && '2.1875rem'),
                  backgroundColor: 'gainsboro',
                  padding: '1rem',
                  paddingBottom: '3rem',
                  marginBottom: '1.8rem',
                }}
                elevation={5}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyItems: 'center',
                    margin: '1rem',
                    marginBottom: '1.2rem',
                    backgroundColor: '#404e5c',
                    alignItems: 'start',
                    borderRadius: (isDesktop && 47) || (isMobile && 30) || (isTab && 35),
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: '50%',
                      margin: '1.2rem',
                      gap: '1rem',
                      alignItems: 'center',
                      paddingLeft: (isDesktop && 40) || (isMobile && 5) || (isTab && 20),
                    }}
                  >
                    <Typography
                      variant="h4"
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: (isDesktop && 30) || (isMobile && 12) || (isTab && 18),
                        marginBottom: isDesktop && 12,
                        margin: '0',
                      }}
                    >
                      Artes más vendidos
                    </Typography>
                    <Button
                      style={{
                        backgroundColor: '#d33f49',
                        color: 'white',
                        borderRadius: 40,
                        fontSize: isDesktop ? 20 : 12,
                        textTransform: 'none',
                        paddingLeft: 20,
                        paddingRight: 20,
                        maxWidth: 150,
                        transform: 'tran',
                      }}
                      onClick={handleGallery}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      Ver todos
                    </Button>
                  </div>
                  <div
                    style={{
                      backgroundImage: `linear-gradient(to left, transparent, rgba(64, 78, 92,1)), url(${
                        mostSelledArts[0]?.largeThumbUrl || mostSelledArts[0]?.thumbUrl
                      })`,
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right',
                      width: '70%',
                      height: '100%',
                      borderRadius: (isDesktop && 47) || (isMobile && 30) || (isTab && 35),
                    }}
                  />
                </div>
                <Slider
                  images={mostSelledArts?.map((art) => ({
                    url: art?.largeThumbUrl ? art?.largeThumbUrl : art?.thumbUrl,
                  }))}
                  useIndicators={{
                    type: 'dots',
                    position: 'below',
                    color: { active: 'primary', inactive: 'secondary' },
                  }}
                  childConfig={{
                    qtyPerSlide: isDesktop ? 5 : isMobile ? 1 : 5,
                    spacing: 'sm',
                  }}
                  autoplay={false}
                >
                  {mostSelledArts?.map((art) => (
                    <Image
                      src={art?.largeThumbUrl ? art?.largeThumbUrl : art?.thumbUrl}
                      roundedCorner={true}
                      fitTo="square"
                      objectFit="contain"
                    />
                  ))}
                </Slider>
              </Paper>
            )}
            {latestArts && (
              <Paper
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  width: '100%',
                  // height:
                  //   (isDesktop && 460) || (isMobile && 330) || (isTab && 380),
                  borderRadius:
                    (isDesktop && '2.9375rem') ||
                    (isMobile && '1.875rem') ||
                    (isTab && '2.1875rem'),
                  backgroundColor: 'gainsboro',
                  padding: '1rem',
                  paddingBottom: '3rem',
                  marginBottom: '1.8rem',
                }}
                elevation={5}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyItems: 'center',
                    margin: '1rem',
                    marginBottom: '1.2rem',
                    backgroundColor: '#404e5c',
                    alignItems: 'start',
                    borderRadius: (isDesktop && 47) || (isMobile && 30) || (isTab && 35),
                  }}
                >
                  <div
                    style={{
                      backgroundImage: `linear-gradient(to right, transparent, rgba(64, 78, 92,1)), url(${
                        latestArts[1]?.largeThumbUrl || latestArts[1]?.thumbUrl
                      })`,
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'left',
                      width: '70%',
                      height: '100%',
                      borderRadius: (isDesktop && 47) || (isMobile && 30) || (isTab && 35),
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      width: '50%',
                      margin: '1.2rem',
                      gap: '1rem',
                      // alignItems: "center",
                      justifyContent: 'end',
                      paddingRight: (isDesktop && 40) || (isMobile && 5) || (isTab && 20),
                    }}
                  >
                    <Typography
                      variant="h4"
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: (isDesktop && 30) || (isMobile && 12) || (isTab && 18),
                        marginBottom: isDesktop && 12,
                      }}
                    >
                      Artes más recientes
                    </Typography>
                    <Button
                      style={{
                        backgroundColor: '#d33f49',
                        color: 'white',
                        borderRadius: 40,
                        fontSize: isDesktop ? 20 : 12,
                        textTransform: 'none',
                        paddingLeft: 20,
                        paddingRight: 20,
                      }}
                      onClick={handleGallery}
                      size={isMobile ? 'small' : 'medium'}
                    >
                      Ver todos
                    </Button>
                  </div>
                </div>
                <Grid
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    width: isMobile ? '88%' : '100%',
                    height: (isDesktop && 490) || (isMobile && 450) || (isTab && 490),
                    marginLeft: isMobile && 20,
                    padding: isMobile ? 0 : '0px 30px 0px 30px',
                    marginTop: '-5px',
                  }}
                >
                  <Slider
                    images={latestArts.map((art) => ({
                      url: art?.largeThumbUrl ? art?.largeThumbUrl : art?.thumbUrl,
                      width: art.width,
                      height: art.height,
                    }))}
                    useIndicators={{
                      type: 'dots',
                      position: 'below',
                      color: { active: 'primary', inactive: 'secondary' },
                    }}
                    childConfig={{
                      qtyPerSlide: isDesktop ? 5 : isMobile ? 1 : 5,
                      spacing: 'sm',
                    }}
                    autoplay={false}
                  >
                    {latestArts.map((art) => {
                      const artUrl = art?.largeThumbUrl ? art?.largeThumbUrl : art?.thumbUrl;
                      return (
                        <Image
                          src={artUrl}
                          roundedCorner={false}
                          fitTo={art.width > art.height ? 'width' : 'height'}
                          objectFit={art.width > art.height ? 'cover' : 'contain'}
                        />
                      );
                    })}
                  </Slider>
                </Grid>
              </Paper>
            )}
          </Grid>
          <BrandsCarousel />
        </div>

        <footer className={classes.footer}>
          <Typography variant="h6" align="center" gutterBottom style={{ color: '#404e5c' }}>
            Si quieres convertirte en un Prixer{' '}
            <a target="blank" href="https://prixelart.com/registrar">
              regístrate
            </a>
            .
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
            <a target="blank" href="https://instagram.com/prixelart">
              <InstagramIcon />
            </a>
          </Typography>
          <Copyright />
        </footer>
      </div>

      {openArtFormDialog && (
        <ArtUploader
          openArtFormDialog={openArtFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
        />
      )}

      {openServiceFormDialog && (
        <CreateService
          openArtFormDialog={openServiceFormDialog}
          setOpenServiceFormDialog={setOpenServiceFormDialog}
          setCreatedService={setCreatedService}
        />
      )}

      <Grid className={classes.float}>
        <FloatingAddButton
          buyState={props.buyState}
          setOpenArtFormDialog={setOpenArtFormDialog}
          setOpenShoppingCart={setOpenShoppingCart}
          setOpenServiceFormDialog={setOpenServiceFormDialog}
        />
      </Grid>
      {openModal && (
        <SimpleDialog
          arts={openArts}
          setTabValue={setTabValue}
          setArts={setOpenArts}
          open={openModal}
          setOpen={setOpenModal}
        />
      )}
    </>
  );
}

