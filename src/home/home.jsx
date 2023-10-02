import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Carousel from "react-material-ui-carousel";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";
import AppBar from "../sharedComponents/appBar/appBar";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import PhoneIcon from "@material-ui/icons/Phone";
import FavoriteIcon from "@material-ui/icons/Favorite";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import ArtsGrid from "../prixerProfile/grid/grid";
import PrixersGrid from "../sharedComponents/prixerGrid/prixerGrid";
import { InsertEmoticon } from "@material-ui/icons";
import InstagramIcon from "@material-ui/icons/Instagram";
import SimpleDialog from "../sharedComponents/simpleDialog/simpleDialog";
import FloatingAddButton from "../sharedComponents/floatingAddButton/floatingAddButton";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Img from "react-cool-img";
import { useHistory } from "react-router-dom";

import MDEditor from "@uiw/react-md-editor";
import MaximizeIcon from "@material-ui/icons/Maximize";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";

import ArtUploader from "../sharedComponents/artUploader/artUploader";
import TestimonialsFeed from "../admin/TestimonialsCrud/TestimonialsFeed";
import CartReview from "../shoppingCart/cartReview";
import ReactGA from "react-ga";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import backG from "../images/Rectangle108.png";

ReactGA.initialize("G-0RWP9B33D8");
ReactGA.pageview("/");

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://prixelart.com/">
        Prixelart C.A.
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  iconTabs: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 800,
    margin: "auto",
    marginBottom: 30,
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    overflowX: "none",
    flexGrow: 1,
    overflow: "visible",
  },
  paper2: {
    position: "absolute",
    width: "80%",
    maxHeight: 450,
    overflowY: "auto",
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: "16px 32px 24px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "justify",
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    padding: theme.spacing(25, 0, 6),
    minHeight: "100vh",
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    width: "100%",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    paddingTop: "56.25%", // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
    position: "relative",
    bottom: 0,
  },
  float: {
    position: "relative",
    marginLeft: "95%",
  },
  CarouselContent: {
    width: "100vw",
    heigh: "92vh",
  },
  modal: {
    display: "flex",
    padding: theme.spacing(1),
    alignItems: "center",
    justifyContent: "center",
    overflowY: "auto",
    width: "80%",
    maxHeight: 450,
  },
}));

export default function Home(props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));
  const isTab = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const classes = useStyles();
  const prixerUsername = "all";
  const [imagesDesktop, newImagesDesktop] = useState({ images: [] });
  const [imagesMobile, newImagesMobile] = useState({ images: [] });
  const [tabValue, setTabValue] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [openPrixers, setOpenPrixers] = useState(false);
  const [openArts, setOpenArts] = useState(true);
  const [openTestimonials, setOpenTestimonials] = useState(false);
  const [selectedArt, setSelectedArt] = useState(undefined);
  const [bestSellers, setBestSellers] = useState();
  // const [currentSet, setCurrentSet] = useState(bestSellers?.slice(0, 3));
  // const [startIndex, setStartIndex] = useState(0);

  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const [openShoppingCart, setOpenShoppingCart] = useState(false);
  const [termsAgreeVar, setTermsAgreeVar] = useState(true);
  const [value, setValue] = useState("");
  const history = useHistory();

  const imgsMobile = [
    {
      url: "https://devprix.nyc3.digitaloceanspaces.com/Portada%20de%20Pagina%20Web_Museo%20Chuao%20Espejo_Telefono_V1.jpg",
    },
    {
      url: "https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Canva%20Studio%20en%20Pexels_16a9.jpg",
    },
    {
      url: "https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Medhat%20Ayad%20en%20Pexels_9a16.jpg",
    },
    {
      url: "https://devprix.nyc3.digitaloceanspaces.com/Pixabay_%203X.2%20Phone.jpg",
    },
    {
      url: "https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Vecislavas%20Popa%20en%20Pexels_lINEAL%20120X40.2%20%20Phone.jpg",
    },
    {
      url: "https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Daria%20Shevtsova%20en%20Pexels.jpg",
    },
  ];
  const handleChange = (event, newValue) => {
    if (newValue === 0) {
      setOpenArts(true);
      setOpenModal(false);
      setOpenPrixers(false);
      setOpenTestimonials(false);
    } else if (newValue === 1) {
      setOpenModal(false);
      setOpenPrixers(true);
      setOpenArts(false);
      setOpenTestimonials(false);
    } else if (newValue === 2) {
      setOpenModal(false);
      setOpenPrixers(false);
      setOpenArts(false);
      setOpenTestimonials(true);
    } else if (newValue === 3) {
      setOpenModal(true);
      setOpenPrixers(false);
      setOpenArts(false);
      setOpenTestimonials(false);
    } else {
      setOpenModal(false);
      setOpenPrixers(false);
      setOpenArts(false);
    }
    setTabValue(newValue);
  };

  const getTerms = () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/read";
    axios
      .get(base_url)
      .then((response) => {
        setValue(response.data.terms.termsAndConditions);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleSubmit = async (e, Id) => {
    e.preventDefault();
    const formData = new FormData();
    const termsAgree = true;
    formData.append("termsAgree", termsAgree);
    // formData.append(
    //   "username",
    //   JSON.parse(localStorage.getItem("token")).username
    // );
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/prixer/update-terms/" + Id;
    const response = await axios
      .put(
        base_url,
        { termsAgree: true },
        {
          "Content-Type": "multipart/form-data",
        }
      )
      .then((response) => {
        setTermsAgreeVar(true);
      });
  };

  const getImagesForTheCarousel = () => {
    const URI = process.env.REACT_APP_BACKEND_URL + "/carousel";
    fetch(URI)
      .then((res) =>
        res
          .json()
          .then((data) => {
            const imagesDesktop = data.imagesCarousels.filter(
              (result) =>
                result.images?.type === "desktop" || result.carouselImages
            );
            const imagesMobile = data.imagesCarousels.filter(
              (result) => result.images?.type === "mobile"
            );
            newImagesDesktop({
              images:
                imagesDesktop.length > 0 ? imagesDesktop : data.imagesCarousels,
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
    const url = process.env.REACT_APP_BACKEND_URL + "/product/bestSellers";
    try {
      const bestS = await axios.get(url);
      setBestSellers(bestS.data.products);
    } catch (error) {
      console.log(error);
    }
  };

  const TermsAgreeModal = () => {
    const GetId = JSON.parse(localStorage.getItem("token")).username;
    const base_url = process.env.REACT_APP_BACKEND_URL + "/prixer/get/" + GetId;
    axios.get(base_url).then((response) => {
      setTermsAgreeVar(response.data.termsAgree);
      getTerms();
    });
  };

  useEffect(() => {
    getImagesForTheCarousel();
    getBestSellers();
    {
      JSON.parse(localStorage.getItem("token")) && TermsAgreeModal();
    }
  }, []);

  const handleProductCatalog = (e) => {
    e.preventDefault();
    history.push({ pathname: "/productos" });
  };

  const handleProduct = async (product) => {
    props.setPointedProduct(product.name);
    history.push({ pathname: "/productos" });
    setTimeout(() => {
      document.getElementById(product.name)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 1000);
  };

  const settings = {
    slidesToShow: (isMobile && 2) || (isTab && 3) || (isDesktop && 4),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    infinite: true,
    dots: true,
  };

  return (
    <React.Fragment>
      <AppBar prixerUsername={prixerUsername} />
      <Container component="main" maxWidth="s" className={classes.paper}>
        <CssBaseline />

        <main>
          <Card
            // className={classes.card}
            style={{
              display: "flex",
              position: "relative",
              width: "100vw",
              marginLeft: isDesktop ? "-24px" : "-16px",
              marginLeft: isDeskTop ? "-24px" : "-16px",
              height: "100vh",
              marginTop: "60px",
            }}
            elevation={0}
          >
            <div className={classes.CarouselContent}>
              <Carousel
                animation="slide"
                duration={500}
                swipe={true}
                stopAutoPlayOnHover={true}
                fullHeightHover={false}
                style={{ marginTop: isDesktop ? "0" : "-40px" }}
                IndicatorIcon={<MaximizeIcon />}
                NextIcon={<ArrowForwardIosIcon style={{ fontSize: "3rem" }} />}
                PrevIcon={<ArrowBackIosIcon style={{ fontSize: "3rem" }} />}
                navButtonsProps={{
                  style: {
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    width: "98%",
                    height: "100vh",
                    marginTop: "-50vh",
                    borderRadius: "0",
                    marginLeft: "1px",
                  },
                }}
                indicatorContainerProps={{
                  style: {
                    marginTop: isDesktop ? "-70px" : "-100px",
                    position: "absolute",
                  },
                }}
              >
                {isDesktop
                  ? imagesDesktop.images.map((img, key_id) =>
                      img.images?.type !== undefined &&
                      img.images?.type === "desktop" ? (
                        <div
                          className={classes.heroContent}
                          key={key_id}
                          style={{
                            backgroundImage: "url(" + img.images.url + ")",
                            backgroundSize: "cover",
                            backgroundPosition: "top",
                            marginTop: "-24px",
                          }}
                        ></div>
                      ) : (
                        <div
                          className={classes.heroContent}
                          key={key_id}
                          style={{
                            backgroundImage: "url(" + img.carouselImages + ")",
                            backgroundSize: "cover",
                            backgroundPosition: "top",
                            marginTop: "-24px",
                          }}
                        ></div>
                      )
                    )
                  : imagesMobile.images.map((img, key_id) =>
                      img.images?.type !== undefined &&
                      img.images?.type === "mobile" ? (
                        <div
                          className={classes.heroContent}
                          key={key_id}
                          style={{
                            backgroundImage: "url(" + img.images.url + ")",
                            backgroundSize: "cover",
                            backgroundPosition: "left",
                          }}
                        ></div>
                      ) : (
                        <div
                          className={classes.heroContent}
                          key={key_id}
                          style={{
                            backgroundImage: "url(" + img.url + ")",
                            backgroundSize: "cover",
                            backgroundPosition: "top",
                            marginTop: "-24px",
                          }}
                        ></div>
                      )
                    )}
              </Carousel>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-around",
                color: "#404e5c",
                backgroundColor: "#fff",
                width: "100%",
                minHeight: 50,
                bottom: 0,
                position: "absolute",
                margin: 0,
                padding: 10,
              }}
            >
              <div style={{ left: 10, alignItems: "center", width: "400px" }}>
                <Typography
                  component="h1"
                  variant="h1"
                  align="left"
                  style={{
                    fontSize: "1.7em",
                    paddingLeft: 10,
                    textAlign: "center",
                  }}
                  gutterBottom
                >
                  Encuentra el <strong>cuadro</strong> ideal para ti.
                </Typography>
              </div>
            </div>
          </Card>

          <Paper
            style={{
              backgroundImage: `url(${backG})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left",
              display: "flex",
              flexDirection: "column",
              alignItems: "end",
              justifyContent: "center",
              position: "relative",
              width: isDesktop ? "80%" : "90%",
              height: isMobile ? 100 : isTab ? 170 : 230,
              marginLeft: isDesktop ? "10%" : "5%",
              borderRadius: isMobile ? 25 : 52,
              backgroundColor: "gainsboro",
            }}
            elevation={5}
          >
            <div
              style={{
                width: "64%",
                display: "flex",
                flexDirection: "column",
                justifyItems: "center",
                marginRight: 5,
                alignItems: isMobile ? "end" : "start",
              }}
            >
              <Typography
                variant="h4"
                style={{
                  color: "#404e5c",
                  marginBottom: isDesktop && 12,
                  fontSize: (isMobile && 14) || (isTab && 20),
                }}
                fontWeight="bold"
              >
                <strong>¡Productos más vendidos! </strong>
              </Typography>
              <Typography
                // variant="body1"
                style={{
                  color: "#404e5c",
                  textAlign: isMobile && "end",
                  marginBottom: isDesktop && 12,
                  fontSize: isMobile ? 10 : 20,
                }}
              >
                ¡No te lo puedes perder! Descubre los favoritos de nuestros
                clientes
              </Typography>

              <Button
                style={{
                  backgroundColor: "#d33f49",
                  color: "white",
                  borderRadius: 40,
                  fontSize: isDesktop ? 20 : 12,
                  textTransform: "none",
                  paddingLeft: 20,
                  paddingRight: 20,
                }}
                onClick={handleProductCatalog}
                size={isMobile ? "small" : "large"}
              >
                Ver todos
              </Button>
            </div>
          </Paper>

          {bestSellers && (
            <Paper
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                position: "relative",
                width: isDesktop ? "80%" : "90%",
                height: isDesktop ? 280 : 210,
                marginTop: 20,
                marginLeft: isDesktop ? "10%" : "5%",
                borderRadius: isMobile ? 30 : 52,
                backgroundColor: "gainsboro",
                padding: 30,
              }}
              elevation={5}
            >
              <Slider {...settings}>
                {bestSellers?.map((product) => (
                  <div
                    key={product._id}
                    style={{
                      borderRadius: 40,
                      display: "flex",
                      flexDirection: "column",
                      height: isMobile ? 150 : 250,
                      width: "80%",
                      marginLeft: isMobile ? 35 : 100,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          backgroundImage:
                            product.sources.images.length > 0
                              ? "url(" + product.sources.images[0]?.url + ")"
                              : "url(" + product.thumbUrl + ")",
                          height: isMobile ? 120 : 170,
                          width: isMobile ? 120 : 170,
                          marginRight: 10,
                          backgroundSize: "cover",
                          borderRadius: 40,
                          backgroundPosition: "back",
                        }}
                      />
                      <Typography
                        variant="subtitle1"
                        style={{
                          color: "#404e5c",
                          fontWeight: "bold",
                          fontSize: isMobile && "1rem",
                          alignSelf: "center",
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Button
                        style={{
                          backgroundColor: "#d33f49",
                          color: "white",
                          borderRadius: 40,
                          width: 120,
                          textTransform: "none",
                        }}
                        size="small"
                        onClick={() => handleProduct(product)}
                      >
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </Slider>
              {/* <Carousel
              stopAutoPlayOnHover={true}
              animation="fade"
              // duration={500}
              // fullHeightHover={false} // style={{ marginTop: -100 }}
              IndicatorIcon={<MaximizeIcon />}
              NextIcon={<ArrowForwardIosIcon style={{ fontSize: "4rem" }} />}
              PrevIcon={
                <ArrowBackIosIcon
                  style={{
                    fontSize: "4rem",
                    paddingLeft: 20,
                  }}
                />
              }
              navButtonsProps={{
                style: {
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  borderRadius: 15,
                  width: isMobile ? 50 : 100,
                  height: isMobile ? 150 : 250,
                  margin: 0,
                  marginTop: "-120px",
                },
              }}
              indicatorContainerProps={{
                style: {
                  // marginTop: -280,
                  // position: "absolute",
                },
              }}
            >
              {bestSellers?.map(
                (product, i) =>
                  product.sources.images !== undefined && (
                    <div
                      style={{
                        borderRadius: 40,
                        display: "flex",
                        flexDirection: "row",
                        height: isMobile ? 150 : 250,
                        width: "80%",
                        marginLeft: isMobile ? 35 : 100,
                        justifyContent: "space-around",
                        alignItems: "center",
                      }}
                    >
                      <div
                        key={i}
                        style={{
                          backgroundImage:
                            product.sources.images.length > 0
                              ? "url(" + product.sources.images[0]?.url + ")"
                              : "url(" + product.thumbUrl + ")",
                          // height: isMobile ? 120 : 250,
                          // width: isMobile ? 120 : 250,
                          height: 180,
                          width: 180,
                          marginRight: 10,
                          backgroundSize: "cover",
                          borderRadius: 40,
                          backgroundPosition: "back",
                        }}
                      />
                    </div>
                  )
              )}
                      </Carousel>*/}
            </Paper>
          )}

          <Container className={classes.cardGrid} maxWidth="xl">
            <Grid container spacing={1}>
              <Paper
                square
                className={classes.iconTabs}
                style={{
                  display: isMobile ? "grid" : "flex",
                  gridTemplateColumns: isMobile ? "50%, 2fr" : "",
                  // flexDirection: isMobile ? "column" : "row",
                  justifyContent: "center",
                }}
                elevation={3}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleChange}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="secondary"
                >
                  <Tab
                    icon={<PhotoLibraryIcon />}
                    label="ARTES"
                    style={{
                      fontSize: isMobile ? "0.62rem" : "0.875rem",
                      width: "25%",
                    }}
                  />
                  <Tab
                    icon={<FavoriteIcon />}
                    label="PRIXERS"
                    style={{
                      fontSize: isMobile ? "0.62rem" : "0.875rem",
                      width: "25%",
                    }}
                  />
                  <Tab
                    icon={<InsertEmoticon />}
                    label={"TESTIMONIOS"}
                    style={{
                      fontSize: isMobile ? "0.62rem" : "0.875rem",
                      width: "25%",
                    }}
                  />
                  <Tab
                    icon={<PhoneIcon />}
                    label="TE ASESORAMOS"
                    style={{
                      fontSize: isMobile ? "0.62rem" : "0.875rem",
                      width: "25%",
                    }}
                  />
                </Tabs>
              </Paper>
            </Grid>
            {
              openArts && (
                // <Suspense fallback={<div>Loading...</div>}>
                <ArtsGrid
                  prixerUsername={null}
                  buyState={props.buyState}
                  addItemToBuyState={props.addItemToBuyState}
                  setIsOpenAssociateProduct={props.setIsOpenAssociateProduct}
                  setSelectedArt={setSelectedArt}
                  setPrixer={props.setPrixer}
                  setFullArt={props.setFullArt}
                  setSearchResult={props.setSearchResult}
                />
              )
              // </Suspense>
            }
            {
              openPrixers && (
                // <Suspense fallback={<div>Loading...</div>}>
                <PrixersGrid />
              )
              // </Suspense>
            }
            {openTestimonials && (
              // <Suspense fallback={<div>Loading...</div>}>
              <TestimonialsFeed />
              // </Suspense>
            )}
          </Container>
        </main>
        {/* Footer */}
        <footer className={classes.footer}>
          <Typography variant="h6" align="center" gutterBottom>
            Si quieres convertirte en un Prixer{" "}
            <a target="blank" href="https://prixelart.com/registrar">
              regístrate
            </a>
            .
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="textSecondary"
            component="p"
          >
            <a target="blank" href="https://instagram.com/prixelart">
              <InstagramIcon />
            </a>
          </Typography>
          <Copyright />
        </footer>
        {/* End footer */}
      </Container>
      {openArtFormDialog && (
        <ArtUploader
          openArtFormDialog={openArtFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
        />
      )}

      <Dialog
        maxWidth={"lg"}
        open={openShoppingCart}
        style={{
          width: isDeskTop ? 850 : "100%",
          margin: isDesktop ? "auto" : 0,
        }}
      >
        {props.buyState?.length > 0 ? (
          <div
            style={{
              marginLeft: 15,
              marginRight: 15,
              marginTop: -60,
            }}
          >
            <CartReview
              buyState={props.buyState}
              changeQuantity={props.changeQuantity}
              deleteItemInBuyState={props.deleteItemInBuyState}
              deleteProductInItem={props.deleteProductInItem}
              setSelectedArtToAssociate={props.setSelectedArtToAssociate}
            />
          </div>
        ) : (
          <div style={{ margin: "90px 10px 40px 10px" }}>
            <Typography variant={"h6"} align={"Center"} justify={"center"}>
              Actualmente no tienes ningun producto dentro del carrito de
              compra.
            </Typography>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginBottom: 20,
          }}
        >
          <Button
            onClick={() => {
              setOpenShoppingCart(false);
            }}
            color="primary"
          >
            Cerrar
          </Button>
          {props.buyState?.length > 0 && (
            <Button
              onClick={() => {
                history.push({ pathname: "/shopping" });
              }}
              color="primary"
            >
              Comprar
            </Button>
          )}
        </div>
      </Dialog>

      <Grid className={classes.float}>
        <FloatingAddButton
          setOpenArtFormDialog={setOpenArtFormDialog}
          setOpenShoppingCart={setOpenShoppingCart}
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
      <Modal
        xl={800}
        lg={800}
        md={480}
        sm={360}
        xs={360}
        open={termsAgreeVar === false}
        onClose={termsAgreeVar === true}
      >
        <div className={classes.paper2}>
          <h2 style={{ textAlign: "center", fontWeight: "Normal" }}>
            Hemos actualizado nuestros términos y condiciones y queremos que
            estés al tanto.
          </h2>
          <div>
            <div data-color-mode="light">
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "12px",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                CONVENIO DE RELACIÓN ENTRE LOS ARTISTAS Y LA COMPAÑÍA
              </div>
              <div data-color-mode="light">
                <MDEditor.Markdown
                  source={value}
                  style={{ textAlign: "justify" }}
                />
              </div>
            </div>
          </div>
          <div style={{ justifyContent: "center", display: "flex" }}>
            <Button
              onClick={(e) => {
                handleSubmit(
                  e,
                  JSON.parse(localStorage.getItem("token")).username
                );
              }}
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submit}
              required
            >
              Acepto los nuevos términos y condiciones
            </Button>
          </div>
        </div>
      </Modal>
      <Dialog
        open={props.isOpenAssociateProduct}
        keepMounted
        fullWidth
        onClose={() => props.setIsOpenAssociateProduct(false)}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          {"Asocia el arte a un producto dentro de tu carrito de compras"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {!props.selectedProductToAssociate?.previous &&
              props.buyState?.length > 0 &&
              props.buyState.find((buy) => buy.product !== undefined) && (
                <strong>
                  Puedes asociar el arte a un producto de tu carrito de compras
                  o agregarlo y asociarlo mas tarde.
                </strong>
              )}
            <div style={{ display: "flex" }}>
              {props.selectedProductToAssociate?.previous ? (
                "¿Deseas asociar este producto al item seleccionado previamente en el carrito?"
              ) : props.buyState?.length > 0 &&
                props.buyState.find((buy) => buy.product !== undefined) ? (
                props.buyState.map((buy, index) => {
                  return (
                    <div
                      style={{
                        display: "flex",
                        width: "180px",
                      }}
                    >
                      {buy.product && (
                        <div
                          key={index}
                          style={{
                            marginBottom: "32px",
                            height: "180px",
                            width: "180px",
                          }}
                          onClick={() =>
                            props.setSelectedProductToAssociate({
                              index,
                              item: buy.product,
                            })
                          }
                        >
                          <Img
                            placeholder="/imgLoading.svg"
                            style={{
                              backgroundColor: "#eeeeee",
                              height: "180px",
                              width: "180px",
                              opacity:
                                props.selectedProductToAssociate?.index ===
                                index
                                  ? "1"
                                  : "0.6",
                            }}
                            src={buy.product ? buy.product.thumbUrl : ""}
                            debounce={1000}
                            cache
                            error="/imgError.svg"
                            // srcSet={tile.smallThumbUrl + ' 600w, ' + tile.mediumThumbUrl + ' 850w, ' + tile.largeThumbUrl + ' 1300w'}
                            sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 400px, 200px"
                            alt={buy.product && buy.product.name}
                            id={index}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <strong>
                  Parece que no tienes ningun producto dentro del carrito de
                  compras, aun asi, puedes agregar este producto y asociarlo más
                  tarde.
                </strong>
              )}
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              !props.selectedProductToAssociate?.previous &&
                props.setSelectedProductToAssociate(undefined);
              props.setIsOpenAssociateProduct(false);
            }}
            color="primary"
          >
            {props.selectedProductToAssociate?.previous ? "No" : "Cerrar"}
          </Button>
          {props.buyState?.length > 0 &&
            props.buyState.find((buy) => buy.product !== undefined) && (
              <Button
                disabled={!props.selectedProductToAssociate}
                onClick={() => {
                  props.AssociateProduct({
                    index: props.selectedProductToAssociate.index,
                    item: selectedArt,
                    type: "art",
                  });
                  props.setSelectedProductToAssociate(undefined);
                  setSelectedArt(undefined);
                  props.setIsOpenAssociateProduct(false);
                }}
                color="primary"
              >
                {props.selectedProductToAssociate?.previous ? "Sí" : "Asociar"}
              </Button>
            )}
          {!props.selectedProductToAssociate?.previous && (
            <Button
              onClick={() => {
                props.addItemToBuyState({
                  type: "art",
                  item: selectedArt,
                });

                setSelectedArt(undefined);
                history.push({ pathname: "/productos" });
              }}
              color="primary"
            >
              Agregar como nuevo
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
