import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Carousel from "react-material-ui-carousel";
import Card from "@material-ui/core/Card";
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
import MDEditor from "@uiw/react-md-editor";

import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import MaximizeIcon from "@material-ui/icons/Maximize";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";

// import { useHistory } from "react-router-dom";
import ArtUploader from "../sharedComponents/artUploader/artUploader";
// import utils from "../utils/utils";
import TestimonialsFeed from "../admin/TestimonialsCrud/TestimonialsFeed";

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
    marginBottom: 50,
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
    marginLeft: "87%",
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const isPhone5 =
  const classes = useStyles();
  const prixerUsername = "all";
  const [imagesDesktop, newImagesDesktop] = useState({ images: [] });
  const [imagesMobile, newImagesMobile] = useState({ images: [] });
  const [tabValue, setTabValue] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [openPrixers, setOpenPrixers] = useState(false);
  const [openArts, setOpenArts] = useState(true);
  const [openTestimonials, setOpenTestimonials] = useState(false);
  // const [scrolledTop, setScrolledTop] = useState(false);
  // const history = useHistory();
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  // const rootRef = React.useRef(null);
  const [termsAgreeVar, setTermsAgreeVar] = useState(true);
  const [value, setValue] = useState("");

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
    const URI =
      process.env.REACT_APP_BACKEND_URL + "/admin/preferences/carousel";
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
    {
      JSON.parse(localStorage.getItem("token")) && TermsAgreeModal();
    }
  }, []);

  return (
    <React.Fragment>
      <AppBar prixerUsername={prixerUsername} />
      <Container component="main" maxWidth="s" className={classes.paper}>
        <CssBaseline />

        <main>
          <Card
            className={classes.card}
            style={{
              display: "flex",
              position: "relative",
              width: "100vw",
              marginLeft: isDesktop ? "-24px" : "-16px",
              marginLeft: isDeskTop ? "-24px" : "-16px",
              height: "100vh",
            }}
          >
            <div className={classes.CarouselContent}>
              <Carousel
                stopAutoPlayOnHover={false}
                animation="slide"
                duration={500}
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
                    label="TESTIMONIOS"
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
            {/* } */}
            {
              openArts && (
                // <Suspense fallback={<div>Loading...</div>}>
                <ArtsGrid prixerUsername={null} />
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
      {JSON.parse(localStorage.getItem("token")) &&
        JSON.parse(localStorage.getItem("token")).username && (
          <Grid className={classes.float}>
            <FloatingAddButton setOpenArtFormDialog={setOpenArtFormDialog} />
          </Grid>
        )}
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
    </React.Fragment>
  );
}
