import React, { useEffect, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import clsx from "clsx"
import { makeStyles } from "@material-ui/core/styles"
import CssBaseline from "@material-ui/core/CssBaseline"
import Drawer from "@material-ui/core/Drawer"
import Box from "@material-ui/core/Box"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import List from "@material-ui/core/List"
import Typography from "@material-ui/core/Typography"
import Divider from "@material-ui/core/Divider"
import IconButton from "@material-ui/core/IconButton"
import Badge from "@material-ui/core/Badge"
import Container from "@material-ui/core/Container"
import Link from "@material-ui/core/Link"
import MenuIcon from "@material-ui/icons/Menu"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import NotificationsIcon from "@material-ui/icons/Notifications"
import MainListItems from "./listItems"
import Dashboard from "./dashboard/dashboard"
import AdminUser from "./adminUser/adminUser"
import Products from "./products/products"
import Consumers from "./consumers/consumers"
import PaymentMethods from "./orders/paymentMethods"
import Orders from "./orders/orders"
import Preferences from "./preferences/Preferences"
import Testimonials from "../TestimonialsCrud/Testimonials"
import Prixers from "./prixers/prixers"
import ShippingMethods from "./shippingMethodCrud/readShippingMethod"
import Movements from "./movements/readMovements"
import Fab from "@material-ui/core/Fab"
import AttachMoneyIcon from "@material-ui/icons/AttachMoney"
import Modal from "@material-ui/core/Modal"
import CloseIcon from "@material-ui/icons/Close"
import Grid from "@material-ui/core/Grid"
import TextField from "@material-ui/core/TextField"
import SaveIcon from "@material-ui/icons/Save"
import Tooltip from "@material-ui/core/Tooltip"
import validations from "../../shoppingCart/validations"
import axios from "axios"

function Copyright() {
  return (
    <Typography
      variant="body2"
      color="textSecondary"
      align="center"
    >
      {"Copyright © "}
      <Link
        color="inherit"
        href="https://prixelart.com/"
      >
        Prixelart C.A.
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  )
}

const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
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
    })
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
}))

export default function AdminMain(props) {
  const classes = useStyles()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState("user")
  const location = useLocation()
  const history = useHistory()
  const [openDollarView, setOpenDollarView] = useState(false)

  const handleDrawerOpen = () => {
    setOpen(true)
  }
  const handleDrawerClose = () => {
    setOpen(false)
  }

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
        )
  }, [location.pathname])

  useEffect(() => {
    setOpen(false)
  }, [active])

  const dollarView = () => {
    setOpenDollarView(true)
  }

  const handleClose = () => {
    setOpenDollarView(false)
  }

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
                <Badge
                  overlap="rectangular"
                  badgeContent={4}
                  color="secondary"
                >
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
            <List>
              {
                <MainListItems
                  active={active}
                  permissions={props.permissions}
                />
              }
            </List>
          </Drawer>
          <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container
              maxWidth="lg"
              className={classes.container}
            >
              {active === "user" ? (
                <AdminUser
                  permissions={props.permissions}
                  // admins={props.admins}
                />
              ) : active === "dashboard" ? (
                <Dashboard />
              ) : active === "product" ? (
                <Products
                  permissions={props.permissions}
                  dollarValue={props.dollarValue}
                />
              ) : active === "consumer" ? (
                <Consumers permissions={props.permissions} />
              ) : active === "movements" ? (
                <Movements permissions={props.permissions} />
              ) : active === "payment-method" ? (
                <PaymentMethods permissions={props.permissions} />
              ) : active === "shipping-method" ? (
                <ShippingMethods permissions={props.permissions} />
              ) : active === "order" ? (
                <Orders
                  dollarValue={props.dollarValue}
                  sellers={props.sellers}
                  admins={props.admins}
                  buyState={props.buyState}
                  setBuyState={props.setBuyState}
                  permissions={props.permissions}
                  changeQuantity={props.changeQuantity}
                  deleteItemInBuyState={props.deleteItemInBuyState}
                  deleteProductInItem={props.deleteProductInItem}
                  setSelectedArtToAssociate={props.setSelectedArtToAssociate}
                  setSelectedProductToAssociate={
                    props.setSelectedProductToAssociate
                  }
                  setValues={props.setValuesConsumerForm}
                  values={props.valuesConsumerForm}
                  addItemToBuyState={props.addItemToBuyState}
                  AssociateProduct={props.AssociateProduct}
                  valuesConsumer={props.valuesConsumerForm}
                  setValuesConsumer={props.setValues}
                />
              ) : active === "prixer" ? (
                <Prixers permissions={props.permissions} />
              ) : active === "preferences" ? (
                <Preferences
                  permissions={props.permissions}
                  setSearchResult={props.setSearchResult}
                  searchResult={props.searchResult}
                />
              ) : active === "testimonials" ? (
                <Testimonials permissions={props.permissions} />
              ) : (
                <p>POONG</p>
              )}
              <Box pt={4}>
                <Copyright />
              </Box>
            </Container>
          </main>
          {props.permissions?.modifyDollar && (
            <Tooltip
              title="Actualizar tasa"
              style={{ height: 40, width: 40 }}
            >
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
            <Grid
              container
              className={classes.paper2}
            >
              <Grid
                item
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
              </Grid>
              <div style={{ display: "flex", alignItems: "center" }}>
                <TextField
                  variant="outlined"
                  value={props.dollarValue}
                  onChange={(e) => {
                    if (e.target.value < 0) {
                      props.setDollarValue(0)
                    } else {
                      props.setDollarValue(e.target.value)
                    }
                  }}
                  error={
                    props.dollarValue !== undefined &&
                    !validations.isAValidPrice(props.dollarValue)
                  }
                  type={"number"}
                />
                <Fab
                  disabled={!validations.isAValidPrice(props.dollarValue)}
                  color="primary"
                  size="small"
                  onClick={() => {
                    props.updateDollarValue()
                    props.setOpen(true)
                    props.setMessage(
                      "Tasa del dólar actualizada satisfactoriamente."
                    )
                    handleClose()
                  }}
                  style={{ marginRight: 10, marginLeft: 10 }}
                >
                  <SaveIcon />
                </Fab>
              </div>
            </Grid>
          </Modal>
        </>
      ) : (
        history.push({ pathname: "/" })
      )}
    </div>
  )
}
