import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import NotificationsIcon from "@material-ui/icons/Notifications";
import MainListItems from "./listItems";
import Dashboard from "./dashboard/dashboard";
import AdminUser from "./adminUser/adminUser";
import Products from "./products/products";
import Consumers from "./consumers/consumers";
import PaymentMethods from "./orders/paymentMethods";
import Orders from "./orders/orders";
import Preferences from "./preferences/Preferences";
import Testimonials from "../TestimonialsCrud/Testimonials";
import Prixers from "./prixers/prixers";

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

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    backgroundColor: "rgba(102, 102, 102, 0.1)",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    height: "100vh",
    position: "fixed",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(0),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "auto",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "700px",
  },
  fixedHeight: {
    height: 500,
  },
}));

export default function AdminMain(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("user");
  const location = useLocation();
  const history = useHistory();

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    location.pathname.split("/").length === 7
      ? setActive(
          location.pathname.split("/")[location.pathname.split("/").length - 5]
        )
      : location.pathname.split("/").length === 5
      ? setActive(
          location.pathname.split("/")[location.pathname.split("/").length - 3]
        )
      : location.pathname.split("/").length === 4 &&
        setActive(
          location.pathname.split("/")[location.pathname.split("/").length - 2]
        );
  }, [location.pathname]);

  return (
    <div className={classes.root}>
      {JSON.parse(localStorage.getItem("adminToken")) ? (
        <>
          <CssBaseline />
          <AppBar
            position="fixed"
            className={clsx(classes.appBar, open && classes.appBarShift)}
          >
            <Toolbar className={classes.toolbar}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                className={clsx(
                  classes.menuButton,
                  open && classes.menuButtonHidden
                )}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                className={classes.title}
              >
                Administración
              </Typography>
              <IconButton color="inherit">
                <Badge badgeContent={4} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            classes={{
              paper: clsx(
                classes.drawerPaper,
                !open && classes.drawerPaperClose
              ),
            }}
            open={open}
          >
            <div className={classes.toolbarIcon}>
              <IconButton onClick={handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <List>{<MainListItems active={active} />}</List>
          </Drawer>
          <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="lg" className={classes.container}>
              {active === "user" ? (
                <AdminUser />
              ) : active === "dashboard" ? (
                <Dashboard />
              ) : active === "product" ? (
                <Products />
              ) : active === "consumer" ? (
                <Consumers />
              ) : active === "payment-method" ? (
                <PaymentMethods />
              ) : active === "order" ? (
                <Orders />
              ) : active === "prixer" ? (
                <Prixers />
              ) : active === "preferences" ? (
                <Preferences />
              ) : active === "testimonials" ? (
                <Testimonials />
              ) : (
                <p>POONG</p>
              )}
              <Box pt={4}>
                <Copyright />
              </Box>
            </Container>
          </main>
        </>
      ) : (
        history.push({ pathname: "/" })
      )}
    </div>
  );
}
