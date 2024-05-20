import React, { useState, useEffect } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import CB_isologo from "./assets/CB_isologo_black.svg";
import { getProducts } from "./xoxo";
import Badge from "@material-ui/core/Badge";
import ShoppingCartOutlined from "@material-ui/icons/ShoppingCartOutlined";
import Snackbar from "@material-ui/core/Snackbar";
import Grid from "@material-ui/core/Grid";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Radio from "@material-ui/core/Radio";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  typography: { fontFamily: "Uncut Sans" },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
  button: {
    fontFamily: "Uncut Sans",
    textTransform: "none",
    color: "black",
    fontWeight: 600,
    fontSize: 18,
  },
  formControl: {
    marginTop: theme.spacing(6),
    width: 120,
  },
  dotsContainer: {
    position: "relative",
    display: "flex !important",
    justifyContent: "center",
    padding: "unset",
  },
}));

export default function ProductDetail(props) {
  const classes = useStyles();
  const history = useHistory();

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedColor, setSelectedColor] = useState(undefined);
  const [selectedSize, setSelectedSize] = useState(undefined);
  const [selectedItem, setSelectedItem] = useState(undefined);
  const [buyState, setBuyState] = useState(
    localStorage.getItem("CBbuyState")
      ? JSON.parse(localStorage.getItem("CBbuyState"))
      : []
  );
  const [cartLength, setCartLength] = useState(
    localStorage.getItem("CBbuyState")
      ? JSON.parse(localStorage.getItem("CBbuyState")).length
      : 0
  );
  const url = window.location.pathname;
  const id = url.substring(url.lastIndexOf("=") + 1);

  const handleSize = (event) => {
    setSelectedSize(event.target.value);
  };

  const handleColor = (event) => {
    setSelectedColor(event.target.value);
  };

  useEffect(() => {
    const products = getProducts();

    const x = products.find((item) => item.product.id === id);
    setSelectedItem(x);
  }, []);

  const addItemToBuyState = (input) => {
    if (selectedColor === undefined) {
      setOpen(true);
      setMessage("Por favor selecciona un color.");
    } else if (
      Object.keys(input.attributes).length === 2 &&
      selectedSize === undefined
    ) {
      setOpen(true);
      setMessage("Por favor selecciona una talla.");
    } else {
      const newState = [...buyState];
      const prevItem = newState.find((item) => item.id === input.id);
      let prod = input;
      let selection =
        selectedSize !== undefined
          ? selectedSize + " " + selectedColor
          : selectedColor;
      prod.selection = selection;

      if (!prevItem) {
        newState.push({
          art: input.art,
          product: input,
          quantity: 1,
        });
        setCartLength((prevCartLength) => prevCartLength + 1);
      } else {
        setBuyState((prev) =>
          prev.map((item) => {
            if (item.id === input.id) {
              return { ...item, quantity: item.quantity++ };
            }
            return item;
          })
        );
      }

      setBuyState(newState);
      localStorage.setItem("CBbuyState", JSON.stringify(newState));
      setOpen(true);
      setMessage("Producto agregado al carrito correctamente.");
    }
  };

  const StyledBadge = withStyles((theme) => ({
    badge: {
      backgroundColor: "#FF9934",
      color: "black",
    },
  }))(Badge);

  const settings = {
    customPaging: function (i) {
      const image = selectedItem?.art.images[i]?.img;

      return (
        <li
          style={{
            listStyle: "none",
            marginLeft: "-12px",
            marginRight: "30px",
          }}
        >
          <a style={{ display: "block", textDecoration: "none" }}>
            <img
              src={image}
              style={{ width: 70, height: 70, objectFit: "cover" }}
            />
          </a>
        </li>
      );
    },
    dots: true,
    // dotsClass: classes.dotsContainer,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    infinite: true,
    pauseOnHover: true,
  };

  const handleMain = () => {
    history.push({ pathname: "/chiguirebipolar" });
  };

  const scrollToSection = (selector) => {
    const section = document.querySelector(selector);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleToProduct = () => {
    handleMain();
    setTimeout(() => {
      scrollToSection("#productos");
    }, 500);
  };

  const handleCart = () => {
    history.push({ pathname: "/chiguirebipolar/carrito" });
  };

  const handleToPrixelart = () => {
    handleMain();
    setTimeout(() => {
      scrollToSection("#prixelart");
    }, 1200);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        style={{
          backgroundColor: "#white",
          zIndex: 10000,
          backgroundColor: "white",
        }}
      >
        <Toolbar
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={handleMain}>
            <img
              src={CB_isologo}
              alt="Chiguire Bipolar isologo"
              style={{ width: 238 }}
            />
          </Button>

          <Tabs>
            <Tab
              className={classes.button}
              onClick={handleToProduct}
              label="Productos"
            />
            <Tab
              className={classes.button}
              label="Prixelart"
              onClick={handleToPrixelart}
            />
          </Tabs>

          <div
            style={{
              width: 257.93,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <IconButton onClick={handleCart}>
              <StyledBadge badgeContent={cartLength}>
                <div style={{ color: "black" }}>
                  <ShoppingCartOutlined />
                </div>
              </StyledBadge>{" "}
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <Grid
        container
        style={{
          marginLeft: "5%",
          paddingRight: "12.5%",
          display: "flex",
          justifyContent: "space-evenly",
          marginTop: 120,
        }}
      >
        <Grid
          item
          xs={6}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            width: "50%",
            height: 468,
            //   marginLeft: 20,
            //   padding: "0px 30px 0px 30px",
            // marginTop: "-5px",
          }}
        >
          <Slider dotsClass={classes.dotsContainer} {...settings}>
            {selectedItem?.art.images.map((art, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: 360,
                  width: "100%",
                  marginRight: 10,
                }}
              >
                <div
                  style={{
                    marginTop: 5,

                    width: "95%",
                    height: 360,
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

        <Grid
          item
          xs={4}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            className={classes.typography}
            style={{ fontSize: 40, fontWeight: 600 }}
          >
            {selectedItem?.product.name} {selectedItem?.art.title}
          </Typography>
          <Typography className={classes.typography} style={{ fontSize: 20 }}>
            {selectedItem?.product.description}
          </Typography>
          <Typography
            className={classes.typography}
            style={{ fontSize: 24, fontWeight: 600 }}
          >
            $
            {selectedItem?.product.finalPrice?.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
          <div>
            <Typography
              className={classes.typography}
              style={{ color: "#00A650", fontSize: 20 }}
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
          {selectedItem && selectedItem.product.attributes.talla && (
            <>
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

                  boxShadow: "0px 1px 12px rgba(0, 0, 0, 0.2)",
                  borderRadius: 15,
                  textAlign: "center",
                }}
                value={selectedSize}
                onChange={handleSize}
              >
                {selectedItem?.product.attributes?.talla.map((t) => (
                  <MenuItem value={t} style={{ justifyContent: "center" }}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
          {selectedItem && selectedItem.product.attributes.color && (
            <>
              <Typography
                className={classes.typography}
                style={{ fontSize: 17, marginTop: 20, marginBottom: 10 }}
              >
                Color
              </Typography>
              <div>
                <Radio
                  checked={selectedColor === "black"}
                  onChange={handleColor}
                  value="black"
                  style={{
                    color: "black",
                  }}
                />
                <Radio
                  checked={selectedColor === "blue"}
                  onChange={handleColor}
                  value="blue"
                  style={{
                    color: "blue",
                  }}
                />
                <Radio
                  checked={selectedColor === "green"}
                  onChange={handleColor}
                  value="green"
                  style={{
                    color: "green",
                  }}
                />
              </div>
            </>
          )}
          <Button
            className={classes.typography}
            style={{
              textTransform: "none",
              width: "100%",
              backgroundColor: "#F4DF46",
              borderRadius: 10,
              fontSize: 18,
              marginTop: 20,
              marginBottom: 40,
            }}
            onClick={() => addItemToBuyState(selectedItem)}
          >
            Comprar ahora
          </Button>
        </Grid>
      </Grid>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
