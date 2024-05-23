import { useEffect, useState, useRef } from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";

import logo from "../sharedComponents/appBar/Logotipo_Prixelart_H#2.png";
import vector from "./assets/vector_azul.svg";
import blueArrowRight from "./assets/blueArrowRight.svg";
import blueArrowLeft from "./assets/blueArrowLeft.svg";
import yellowArrowRight from "./assets/yellowArrowRight.svg";
import yellowArrowLeft from "./assets/yellowArrowLeft.svg";

const useStyles = makeStyles((theme) => ({
  typography: { fontFamily: "Uncut Sans" },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
}));

export default function PrixelartSection() {
  const classes = useStyles();
  const [prixers, setPrixers] = useState(0);
  const [arts, setArts] = useState(0);
  const [products, setProducts] = useState(0);
  const sectionRef = useRef(null);
  const history = useHistory();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const targetPrixers = 20;
  const targetArts = 200;
  const targetProducts = 60;

  const duration = 3000;

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "0px",
      threshold: 0.5,
    });

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startCounter();
      }
    });
  };

  const startCounter = () => {
    const incrementPrixers = Math.ceil(targetPrixers / (duration / 10));
    const incrementArts = Math.ceil(targetArts / (duration / 100));
    const incrementProducts = Math.ceil(targetProducts / (duration / 60));

    let currentPrixers = 0;
    let currentArts = 0;
    let currentProducts = 0;

    const intervalPrixers = setInterval(() => {
      if (currentPrixers + incrementPrixers >= targetPrixers) {
        clearInterval(intervalPrixers);
        setPrixers(targetPrixers);
      } else {
        currentPrixers += incrementPrixers;
        setPrixers(currentPrixers);
      }
    }, 50);

    const intervalArts = setInterval(() => {
      if (currentArts + incrementArts >= targetArts) {
        clearInterval(intervalArts);
        setArts(targetArts);
      } else {
        currentArts += incrementArts;
        setArts(currentArts);
      }
    }, 50);

    const intervalProducts = setInterval(() => {
      if (currentProducts + incrementProducts >= targetProducts) {
        clearInterval(intervalProducts);
        setProducts(targetProducts);
      } else {
        currentProducts += incrementProducts;
        setProducts(currentProducts);
      }
    }, 50);
  };

  const handleMain = () => {
    history.push({ pathname: "/" });
  };

  return (
    <Grid
      container
      style={{
        marginTop: isTab ? 20 : 60,
        marginLeft: !isTab && 20,
        paddingRight: !isTab && 45,
        display: "flex",
        justifyContent: "space-between",
      }}
      ref={sectionRef}
    >
      <div id="prixelart" style={{ marginTop: "-65px" }}></div>
      <Grid
        xs={2}
        style={{
          alignContent: "center",
          display: "flex",
          justifyContent: "end",
        }}
      >
        <img src={yellowArrowRight} style={{ width: "90%" }} />
      </Grid>
      <Grid item xs={7}>
        <div
          style={{
            backgroundImage: `url(${vector})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: isTab ? 100 : 145,
          }}
        >
          <img
            src={logo}
            alt="Prixelart logo"
            style={{ height: isTab ? 50 : 70 }}
          />
        </div>
      </Grid>
      <Grid
        xs={2}
        style={{
          alignContent: "center",
          display: "flex",
          justifyContent: "start",
        }}
      >
        <img src={yellowArrowLeft} style={{ width: "90%" }} />
      </Grid>
      <Grid
        item={12}
        style={{
          marginTop: 30,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography
          align="center"
          className={classes.typography}
          style={{ fontWeight: 600, fontSize: 20, marginBottom: 20 }}
        >
          Llevando el arte venezolano a tu vida diaria.
        </Typography>
        <Typography
          align="center"
          className={classes.typography}
          style={{
            marginLeft: isTab ? 24 : "20%",
            marginRight: isTab ? 24 : "20%",
            fontSize: isTab ? 13 : 18,
          }}
        >
          Somos una compañía que representa a más de 20 talentosos fotógrafos,
          diseñadores y artistas plásticos. Plasmamos su creatividad en una
          amplia gama de productos decorativos y utilitarios, desde bolsos y
          tazas hasta lienzos y cuadros decorativos. Impulsamos el talento
          nacional y llenamos los hogares venezolanos con piezas únicas que
          reflejan la riqueza cultural del país. Descubre nuestra colección y
          enamórate del arte venezolano.
        </Typography>
      </Grid>
      <Grid item xs={12} style={{ marginTop: 40, marginBottom: 60 }}>
        <Grid
          container
          spacing={3}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Grid
            item
            xs={3}
            style={{
              borderRadius: 27,
              backgroundColor: "#66a085",
              padding: isTab ? "10px 40px" : "43.5px 32px",
              marginRight: isTab ? 10 : 20,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              style={{ color: "white", fontSize: isTab && 24 }}
              className={classes.typography}
            >
              <strong>+{prixers}</strong> <br /> Prixers
            </Typography>
          </Grid>
          <Grid
            item
            xs={3}
            style={{
              borderRadius: 27,
              backgroundColor: "#404E5C",
              padding: isTab ? "10px 40px" : "43.5px 32px",
              marginRight: isTab ? 10 : 20,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              style={{ color: "white", fontSize: isTab && 24 }}
              className={classes.typography}
            >
              <strong>+{arts}</strong> <br /> Artes
            </Typography>
          </Grid>
          <Grid
            item
            xs={3}
            style={{
              borderRadius: 27,
              backgroundColor: "#66a085",
              padding: isTab ? "10px 40px" : "43.5px 32px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              style={{ color: "white", fontSize: isTab && 24 }}
              className={classes.typography}
            >
              <strong>+{products}</strong>
              <br /> Productos
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid
        xs={2}
        style={{
          alignContent: "center",
          display: "flex",
          justifyContent: "end",
        }}
      >
        <img src={blueArrowRight} style={{ width: "90%" }} />
      </Grid>
      <Grid item xs={6} style={{ display: "flex", placeContent: "center" }}>
        <Button
          className={classes.typography}
          style={{
            textTransform: "none",
            display: "flex",
            justifyContent: "center",
            backgroundColor: "#F4DF46",
            width: "60%",
            fontWeight: 600,
          }}
          onClick={handleMain}
        >
          Conoce Prixelart
        </Button>
      </Grid>
      <Grid
        xs={2}
        style={{
          alignContent: "center",
          display: "flex",
          justifyContent: "start",
        }}
      >
        <img src={blueArrowLeft} style={{ width: "90%" }} />
      </Grid>
    </Grid>
  );
}
