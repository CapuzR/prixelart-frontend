import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Box from "@material-ui/core/Box";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import { getProducts } from "./xoxo";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  typography: { fontFamily: "Uncut Sans" },
}));

export default function CBProducts({ addItemToBuyState }) {
  const classes = useStyles();
  const [tiles, setTiles] = useState([]);
  const history = useHistory();

  useEffect(() => {
    setTiles(getProducts());
  }, []);

  const products = ["Franelas", "Tazas", "Termos", "Totes"];
  const colors = [
    { name: "Verde", code: "#006134" },
    { name: "Azul", code: "#789BEC" },
    { name: "Negro", code: "#090909" },
  ];
  const designs = [
    "Pasante subpagado",
    "Independizar",
    "Sobreviví",
    "Cafesito",
  ];

  const viewDetails = (item) => {
    history.push({
      pathname: "/chiguirebipolar/item=" + item.product.id,
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

  function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "block",
          backgroundColor: "#789BEC",
          borderRadius: "50%",
          width: "17px",
          height: "17px",
          display: "flex",
          placeContent: "center",
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
          display: "block",
          backgroundColor: "#789BEC",
          borderRadius: "50%",
          width: "17px",
          height: "17px",
          display: "flex",
          placeContent: "center",
        }}
        onClick={onClick}
      />
    );
  }

  return (
    <Grid
      container
      id="productos"
      style={{
        marginBottom: 40,
        marginLeft: 20,
        marginTop: 40,
        marginRight: "-20px",
      }}
    >
      <Grid item xs={2}>
        <Accordion style={{ marginBottom: 20 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography className={classes.heading}>Productos</Typography>
          </AccordionSummary>
          <AccordionDetails
            style={{ display: "flex", flexDirection: "column" }}
          >
            {products.map((prod) => (
              <Box
                m={1}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Checkbox />

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
          <AccordionDetails
            style={{ display: "flex", flexDirection: "column" }}
          >
            {designs.map((des) => (
              <Box
                m={1}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Checkbox />

                <Typography>{des}</Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography className={classes.heading}>Color de diseño</Typography>
          </AccordionSummary>
          <AccordionDetails
            style={{ display: "flex", flexDirection: "column" }}
          >
            {colors.map((color) => (
              <Box
                m={1}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Button style={{ textTransform: "none" }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      backgroundColor: color.code,
                      borderRadius: 8,
                      marginRight: 10,
                    }}
                  />

                  <Typography>{color.name}</Typography>
                </Button>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      </Grid>

      <Grid item xs={9} style={{ marginRight: 30 }}>
        <Grid container spacing={4} style={{ marginLeft: 20 }}>
          {tiles.map((tile) => (
            <Grid
              item
              xs={6}
              style={{
                display: "flex",
                justifyContent: "start",
              }}
            >
              <Grid
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  position: "relative",
                  width: 250,
                  height: 180,
                  padding: "0px 30px 0px 30px",
                }}
              >
                <Slider {...settings}>
                  {tile.art?.images.map((art, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        height: 181,
                        width: 200,
                        marginRight: 10,
                      }}
                    >
                      <div
                        style={{
                          width: "95%",
                          height: 181,
                          backgroundImage: `url(${art.img})`,
                          backgroundSize: "contain",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                        }}
                      ></div>
                    </div>
                  ))}
                </Slider>
              </Grid>
              <div
                style={{
                  width: "50%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onClick={() => viewDetails(tile)}
                >
                  <div>
                    <Typography
                      className={classes.typography}
                      style={{ fontSize: 20, fontWeight: 600 }}
                    >{`${tile.product.name} ${tile.art.title}`}</Typography>
                    <Typography
                      className={classes.typography}
                      style={{ fontSize: 16 }}
                    >
                      {tile?.product.description}
                    </Typography>
                  </div>
                  <Typography
                    className={classes.typography}
                    style={{ fontSize: 20, fontWeight: 600 }}
                  >{`$${tile?.product.finalPrice?.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}</Typography>
                  <div>
                    <Typography
                      className={classes.typography}
                      style={{ color: "#00A650" }}
                    >
                      Envío gratis
                    </Typography>
                    <Typography
                      className={classes.typography}
                      style={{ color: "gray", fontSize: 14 }}
                    >
                      (sólo las primeras 100 compras)
                    </Typography>
                  </div>
                </div>

                <Button
                  className={classes.typography}
                  style={{
                    textTransform: "none",
                    width: "100%",
                    backgroundColor: "#F4DF46",
                    borderRadius: 10,
                  }}
                  onClick={() => addItemToBuyState(tile)}
                >
                  Añadir al carrito
                </Button>
              </div>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}
