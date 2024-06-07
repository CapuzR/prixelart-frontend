import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Fab from "@material-ui/core/Fab";
import Snackbar from "@material-ui/core/Snackbar";
import Badge from "@material-ui/core/Badge";
import ExpandMore from "@material-ui/icons/ExpandMore";
import PropTypes from "prop-types";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import Slide from "@material-ui/core/Slide";
import ShoppingCartOutlined from "@material-ui/icons/ShoppingCartOutlined";
import CB_isologo from "./assets/CB_isologo.svg";
import CB_banner from "./assets/Banner-CHBP-2.1.png";
import arrowLeft from "./assets/arrow_left.svg";
import arrowRight from "./assets/arrow_right.svg";
import Grid from "@material-ui/core/Grid";
import CBProducts from "./productsGrid";
import CBFooter from "./footer";
import PrixelartSection from "./prixelart";
import { useHistory } from "react-router-dom";
import isotipo from "./assets/isotipo.svg";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import MenuIcon from "@material-ui/icons/Menu";
import ReactGA from "react-ga";

ReactGA.initialize("G-0RWP9B33D8");
ReactGA.pageview(window.location);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  button: {
    fontFamily: "Lastik ",
    textTransform: "none",
  },
  mainTypography: { fontFamily: "Lastik" },
  fabButton: {
    backgroundColor: "#F4DF46",
    margin: "0 auto",
  },
  appBar: {
    backgroundColor: "#006134",
    borderRadius: 60,
    position: "relative",
  },
  backgroundImage: {
    display: "flex",
    alignItems: "end",
    justifyContent: "center",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100%",
    backgroundImage: `url(${CB_banner})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "bottom",
  },
}));

export default function ChiguireHome() {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const isTab = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const [message, setMessage] = useState("");
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

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const addItemToBuyState = (input) => {
    const newState = [...buyState];
    const prevItem = newState.find(
      (item) => item.product.item === input.product.item
    );

    if (!prevItem) {
      newState.push({
        art: input.art,
        product: input.product,
        quantity: 1,
      });
      setCartLength((prevCartLength) => prevCartLength + 1);
    } else {
      setBuyState((prev) =>
        prev.map((item) => {
          if (item.product.item === input.product.item) {
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
  };

  function HideOnScroll(props) {
    const { children, window } = props;
    const trigger = useScrollTrigger({ target: window ? window() : undefined });
    return (
      <Slide appear={false} direction="down" in={!trigger}>
        {children}
      </Slide>
    );
  }

  HideOnScroll.propTypes = {
    children: PropTypes.element.isRequired,
    window: PropTypes.func,
  };

  const scrollToSection = (selector) => {
    const section = document.querySelector(selector);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    ReactGA.event({
      category: "Home CB",
      action: "Leer_mas",
      label: selector,
    });
  };

  const handleCart = () => {
    history.push({ pathname: "/chiguirebipolar/carrito" });
  };

  const handleCB = () => {
    window.open("https:/www.elchiguirebipolar.net", "_blank");
  };
  const StyledBadge = withStyles((theme) => ({
    badge: {
      backgroundColor: "#FF9934",
    },
  }))(Badge);

  return (
    <div>
      <HideOnScroll>
        <AppBar
          elevation={3}
          className={classes.appBar}
          style={{ minHeight: isMobile ? 150 : isTab ? 220 : 330 }}
        >
          <div className={classes.backgroundImage}>
            {!isTab && (
              <Toolbar
                style={{
                  display: "flex",
                  alignItems: "end",
                  height: "100%",
                  bottom: "-28px",
                }}
              >
                <Fab
                  className={classes.fabButton}
                  onClick={() => scrollToSection("#prods")}
                >
                  <ExpandMore />
                </Fab>
              </Toolbar>
            )}
          </div>
        </AppBar>
      </HideOnScroll>

      <AppBar
        position="fixed"
        elevation={0}
        style={{ backgroundColor: "#006134", zIndex: 10000 }}
      >
        <Toolbar
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <IconButton onClick={handleCB}>
            <img
              src={isTab ? isotipo : CB_isologo}
              alt="Chiguire Bipolar isologo"
              style={{ height: 40 }}
            />
          </IconButton>

          {isTab ? (
            <>
              <IconButton
                onClick={handleMenu}
                style={{ color: "white" }}
                size="medium"
              >
                <StyledBadge badgeContent={cartLength}>
                  <MenuIcon />
                </StyledBadge>
              </IconButton>

              <Menu
                style={{ zIndex: 100000 }}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={openMenu}
                onClose={handleClose}
              >
                <MenuItem onClick={() => scrollToSection("#prods")}>
                  Productos
                </MenuItem>
                <MenuItem onClick={() => scrollToSection("#prixelart")}>
                  Prixelart
                </MenuItem>
                <MenuItem onClick={handleCart}>Carrito</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Tabs>
                <Tab
                  className={classes.button}
                  onClick={() => scrollToSection("#prods")}
                  label="Productos"
                />
                <Tab
                  className={classes.button}
                  label="Prixelart"
                  onClick={() => scrollToSection("#prixelart")}
                />
              </Tabs>
              <div
                style={{
                  width: 258,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <IconButton onClick={handleCart}>
                  <StyledBadge badgeContent={cartLength}>
                    <div style={{ color: "white" }}>
                      <ShoppingCartOutlined />
                    </div>
                  </StyledBadge>
                </IconButton>
              </div>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Grid
        container
        style={{
          marginTop: isTab ? 20 : 60,
          marginLeft: !isTab && 20,
          paddingRight: !isTab && 45,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Grid xs={2} style={{ alignContent: "center" }}>
          <img src={arrowRight} style={{ width: "90%" }} />
        </Grid>
        <Grid
          xs={7}
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typography
            className={classes.mainTypography}
            style={{
              fontSize: isMobile ? 19 : isTab ? 30 : 45,
              alignContent: "center",
              fontWeight: 600,
            }}
            align={"center"}
          >
            ¡Bienvenidos al e-tarantín de <br /> El Chigüire Bipolar!
          </Typography>
        </Grid>
        <Grid
          xs={2}
          style={{
            alignContent: "center",
            display: "flex",
            justifyContent: "end",
          }}
        >
          <img src={arrowLeft} style={{ width: "90%" }} />
        </Grid>
        <Grid
          xs={12}
          style={{
            paddingLeft: isTab ? 24 : "15%",
            paddingRight: isTab ? 24 : "15%",
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
          <Typography
            className={classes.button}
            style={{ fontSize: isTab ? 13 : 18, textAlign: "center" }}
          >
            Nos emociona muchísimo compartir con ustedes esta colección
            exclusiva de merch, hecha en alianza con nuestros panas de
            Prixelart, para que demuestres tu amor por nuestro Chigüi. Tenemos
            franelas, tazas, tote bags y termos con diseños exclusivos para ti.
            No importa si nos sigues desde los tiempos en los que María
            Alejandra López le tenía fe a Capriles o si justo acabas de
            descubrirnos: seguro encontrarás algo para ti. <br />
            <br /> Con cada compra podrás demostrarle al mundo que para ti, las
            noticias son un asunto muy serio y, al mismo tiempo, apoyas nuestra
            explotación laboral al pasante subpagado. ¡Una situación ganar-ganar
            para todos, menos para él! <br />
            <br /> Gracias por formar parte de nuestra comunidad.
          </Typography>
        </Grid>
      </Grid>
      <div
        style={{
          marginBottom: 40,
          marginLeft: !isTab && 20,
          marginTop: 40,
        }}
      >
        <CBProducts addItemToBuyState={addItemToBuyState} />
      </div>
      <PrixelartSection />
      <CBFooter />

      <Snackbar
        open={open}
        autoHideDuration={5000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
