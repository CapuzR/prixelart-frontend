import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SaveIcon from "@mui/icons-material/Save";

import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import MuiDrawer from '@mui/material/Drawer';
// import Drawer from "@mui/material/Drawer";
import Fab from "@mui/material/Fab";
import Grid2 from "@mui/material/Grid2";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import Modal from "@mui/material/Modal";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import { useCart } from "context/CartContext";
import { useConversionRate, useSnackBar } from "context/GlobalContext";
import { makeStyles } from 'tss-react/mui';

import AdminUser from "./adminUser/adminUser";
import Consumers from "./consumers/consumers";
import Dashboard from "./dashboard/dashboard";
import MainListItems from "./listItems";
import Movements from "./movements/readMovements";
import Orders from "./orders/orders";
import PaymentMethods from "./paymentMethod/paymentMethodCrud";
import Preferences from "./preferences/Preferences";
import Prixers from "./prixers/prixers";
import Products from "./products/products";
import ShippingMethods from "./shippingMethod/shippingMethodCrud";
import Testimonials from "../TestimonialsCrud/Testimonials";
import Copyright from "@components/Copyright/copyright";

const drawerWidth = 219;

const useStyles = makeStyles()((theme: Theme) => {
  return {
  floatingButton: {
    margin: theme.spacing(1),
    marginRight: 10,
    top: "auto",
    bottom: 20,
    left: "auto",
    paddingRight: "5",
    position: "fixed",
    backgroundColor: theme.palette.primary.main,
  },
  paper2: {
    position: "fixed",
    right: 1,
    top: "auto",
    bottom: 10,
    left: "auto",
    width: 310,
    backgroundColor: "white",
    boxShadow: theme.shadows[2],
    padding: "16px 32px 24px",
    transform: "translate(-50%, -50%)",
    textAlign: "justify",
    minWidth: 320,
    borderRadius: 10,
    marginTop: "12px",
    display: "flex",
    flexDirection: "row",
  },
  root: {
    display: "flex",
    backgroundColor: "rgba(102, 102, 102, 0.1)",
  },
  toolbar: {
    paddingRight: 24,
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    minHeight: "70px",
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
    position: "relative",
    whiteSpace: "nowrap",
    width: 240,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
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
}
});

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);

const DrawerHeader = styled("div")<{ theme: Theme }>(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

export default function AdminMain({
  permissions,
  valuesConsumerForm,
  setValues,
}) {
  const theme = useTheme<Theme>();
  const { classes, cx } = useStyles();
     const [open, setOpen] = useState(false);
  const [active, setActive] = useState("user");
  const location = useLocation();
  const history = useHistory();
  const [openDollarView, setOpenDollarView] = useState(false);
  // const { conversionRate, setConversionRate } = useConversionRate();
  const { cart } = useCart();
  // console.log(active);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const rootSegment = pathSegments.length > 0 ? pathSegments[1] : "";
    console.log(pathSegments);
    setActive(rootSegment);
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [active]);

  const dollarView = () => {
    setOpenDollarView(true);
  };

  const handleClose = () => {
    setOpenDollarView(false);
  };

  return (
    <div className={classes.root}>
      {JSON.parse(localStorage.getItem("adminToken")) ? (
        <>
          <CssBaseline />
          <AppBar
            position="fixed"
            open={open}
            className={cx(classes.appBar, open && classes.appBarShift)}
          >
            <Toolbar className={classes.toolbar}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                className={cx(
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
              <IconButton color="inherit" disabled>
                <Badge overlap="rectangular" badgeContent={1} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            open={open}
          >
            <DrawerHeader>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === "rtl" ? (
                  <ChevronRightIcon />
                ) : (
                  <ChevronLeftIcon />
                )}
              </IconButton>
            </DrawerHeader>
            <Divider />
            <List>
              {<MainListItems active={active} permissions={permissions} />}
            </List>
          </Drawer>
          <main className={classes.content}>
            <Container maxWidth="xl" className={classes.container}>
              {active === "user" ? (
                <AdminUser permissions={permissions} />
              ) : active === "dashboard" ? (
                <Dashboard />
              ) : active === "product" ? (
                <Products
                  permissions={permissions}
                  // dollarValue={conversionRate}
                />
              ) : active === "consumer" ? (
                <Consumers permissions={permissions} />
              ) : active === "movements" ? (
                <Movements permissions={permissions} />
              ) : active === "payment-method" ? (
                <PaymentMethods permissions={permissions} />
              ) : active === "shipping-method" ? (
                <ShippingMethods permissions={permissions} />
              ) : active === "order" ? (
                <Orders
                  // dollarValue={conversionRate}
                  permissions={permissions}
                />
              ) : active === "prixer" ? (
                <Prixers permissions={permissions} />
              ) : active === "preferences" ? (
                <Preferences permissions={permissions} />
              ) : active === "testimonials" ? (
                <Testimonials permissions={permissions} />
              ) : (
                <p>POONG</p>
              )}
              <Box pt={4}>
                <Copyright />
              </Box>
            </Container>
          </main>
          {permissions?.modifyDollar && (
            <Tooltip title="Actualizar tasa" style={{ height: 40, width: 40 }}>
              <Fab
                color="primary"
                size="small"
                onClick={dollarView}
                style={{ right: 10 }}
                className={classes.floatingButton}
              >
                <AttachMoneyIcon />
              </Fab>
            </Tooltip>
          )}
          <Modal open={openDollarView}>
            <Grid2 container className={classes.paper2}>
              <Grid2
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Typography color="primary">Tasa de cambio BCV</Typography>

                  <IconButton onClick={handleClose}>
                    <CloseIcon />
                  </IconButton>
                </div>
              </Grid2>
              {/* <div style={{ display: "flex", alignItems: "center" }}>
                <TextField
                  variant="outlined"
                  value={conversionRate}
                  onChange={(e) => {
                    if (e.target.value < 0) {
                      setConversionRate(0);
                    } else {
                      setConversionRate(e.target.value);
                    }
                  }}
                  error={
                    conversionRate !== undefined &&
                    !isAValidPrice(conversionRate)
                  }
                  type={"number"}
                />
                <Fab
                  disabled={!isAValidPrice(conversionRate)}
                  color="primary"
                  size="small"
                  onClick={() => {
                    setConversionRate();
                    setOpenDollarView(true);
                    showSnackBar(
                      "Tasa del dólar actualizada satisfactoriamente."
                    );
                    handleClose();
                  }}
                  style={{ marginRight: 10, marginLeft: 10 }}
                >
                  <SaveIcon />
                </Fab>
              </div> */}
            </Grid2>
          </Modal>
        </>
      ) : (
        history.push({ pathname: "/" })
      )}
    </div>
  );
}
