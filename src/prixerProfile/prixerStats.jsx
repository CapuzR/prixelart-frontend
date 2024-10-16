import React, { useEffect } from "react";
import axios from "axios";

import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { useState } from "react";
import Typography from "@material-ui/core/Typography";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { Button } from "@material-ui/core";
import MovDetails from "./movDetails";
import Menu from "@material-ui/core/Menu";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grow from "@material-ui/core/Grow";
import Popper from "@material-ui/core/Popper";
import Fade from "@material-ui/core/Fade";
import Modal from "@material-ui/core/Modal";

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  paper2: {
    display: "flex",
    justifyContent: "center",
    marginTop: 80,
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

export default function PrixerProfile() {
  const classes = useStyles();
  const theme = useTheme();
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));

  const prixerUsername = JSON.parse(localStorage.getItem("token")).username;
  const account = JSON.parse(localStorage.getItem("token")).account;
  const [balance, setBalance] = useState(0);
  const [movements, setMovements] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openOrderDetails, setOpenOrderDetails] = useState(false);
  const [orderId, setOrderId] = useState();
  const [placement, setPlacement] = React.useState();
  const [type, setType] = useState();

  const handleClick = (newPlacement, orderId, type) => (event) => {
    setAnchorEl(event.currentTarget);
    setOpenOrderDetails((prev) => placement !== newPlacement || !prev);
    setPlacement("right-start");
    setOrderId(orderId);
    setType(type);
  };
  const getBalance = async () => {
    const url = process.env.REACT_APP_BACKEND_URL + "/account/readById";
    const data = { _id: account };
    await axios
      .post(url, data)
      .then((response) => setBalance(response.data.balance));
  };

  const getMovements = async () => {
    const url = process.env.REACT_APP_BACKEND_URL + "/movement/readByAccount";
    const data = { _id: account };
    await axios
      .post(url, data)
      .then((response) => setMovements(response.data.movements.reverse()));
  };

  const getOrders = async () => {
    const url = process.env.REACT_APP_BACKEND_URL + "/order/byEmail";
    const data = {
      email: JSON.parse(localStorage.getItem("token")).email,
      prixerId: JSON.parse(localStorage.getItem("token")).prixerId,
    };
    await axios
      .post(url, data)
      .then((response) => setOrders(response.data.orders.reverse()));
  };

  useEffect(() => {
    if (account !== undefined) {
      getBalance();
      getMovements();
    }
    getOrders();
  }, []);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleClose = () => {
    setOpenOrderDetails(false);
    setAnchorEl(null);
  };

  return (
    <Container component="main" maxWidth="xl" className={classes.paper}>
      <CssBaseline />
      {/* <Grid>
        <AppBar prixerUsername={prixerUsername} />
      </Grid> */}
      <Grid className={classes.paper2}>
        <Paper
          style={{
            width: isDeskTop ? "70%" : "100%",
            padding: 10,
            borderRadius: 10,
          }}
          elevation={2}
        >
          <Typography
            color="primary"
            variant={isDeskTop ? "h4" : "h5"}
            style={{
              color: "#404e5c",
              textAlign: "center",
              marginBottom: 10,
              marginTop: isDeskTop ? "10px" : 0,
            }}
          >
            Mi Resumen
          </Typography>
          <Grid container>
            <Grid item xs={12} sm={3}>
              <Tabs
                onChange={handleChange}
                orientation={isDeskTop ? "vertical" : "horizontal"}
                value={tab}
                indicatorColor="primary"
                textColor="#404e5c"
                className={classes.tabs}
                variant="scrollable"
              >
                <Tab
                  label="Balance General"
                  style={{
                    textTransform: "none",
                    fontSize: isDeskTop ? 18 : 11,
                    color: "#404e5c",
                    padding: isDeskTop ? "6px 12px" : "6px 6px",
                  }}
                />
                <Tab
                  label="Pedidos"
                  style={{
                    textTransform: "none",
                    fontSize: isDeskTop ? 18 : 11,
                    color: "#404e5c",
                    padding: isDeskTop ? "6px 12px" : "6px 6px",
                  }}
                />
                <Tab
                  label="Movimientos"
                  style={{
                    textTransform: "none",
                    fontSize: isDeskTop ? 18 : 11,
                    color: "#404e5c",
                    padding: isDeskTop ? "6px 12px" : "6px 6px",
                  }}
                />
                <Tab
                  label="Interacciones"
                  style={{
                    textTransform: "none",
                    fontSize: isDeskTop ? 18 : 11,
                    color: "#404e5c",
                    padding: isDeskTop ? "6px 12px" : "6px 6px",
                  }}
                />
              </Tabs>
            </Grid>

            <Grid
              item
              xs={12}
              sm={8}
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                minHeight: 200,
                marginLeft: isDeskTop ? "10px" : 0,
              }}
            >
              {tab === 0 && (
                <Grid>
                  {account ? (
                    <>
                      <Typography
                        variant="body1"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          color: "#404e5c",
                        }}
                      >
                        Tu balance es de:
                      </Typography>
                      <Typography
                        variant="h2"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          color: "#404e5c",
                        }}
                      >
                        $
                        {balance?.toLocaleString("de-DE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      variant="body1"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        color: "#404e5c",
                      }}
                    >
                      Aún no tienes una cuenta asignada, nuestro equipo pronto
                      te asignará una.
                    </Typography>
                  )}
                </Grid>
              )}
              {tab === 1 && (
                <Grid>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <Grid
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "grey",
                          backgroundColor: "ghostwhite",
                          padding: 10,
                          borderRadius: 10,
                          margin: "10px 0px 10px 0px",
                          alignItems: "center",
                        }}
                      >
                        <Grid style={{ fontSize: isDeskTop ? "14px" : "9px" }}>
                          {new Date(order.createdOn)
                            .toLocaleString("en-GB", {
                              timeZone: "UTC",
                            })
                            .slice(0, 10)}
                        </Grid>
                        <Grid style={{ fontSize: isDeskTop ? "14px" : "9px" }}>
                          <Button
                            style={{
                              textTransform: "none",
                              color: "#404e5c",
                              fontSize: isDeskTop ? "14px" : "9px",
                              minWidth: 32,
                            }}
                            onClick={handleClick("right-start", order.orderId)}
                          >
                            {order.orderId}
                          </Button>
                        </Grid>
                        <Grid
                          style={{
                            fontWeight: "bold",
                            fontSize: isDeskTop ? "14px" : "9px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {order.status}
                          <CircularProgress
                            style={{ marginLeft: 10 }}
                            variant="determinate"
                            value={
                              (order.status === "Por producir" && 10) ||
                              (order.status === "En impresión" && 20) ||
                              (order.status === "En producción" && 30) ||
                              (order.status === "Por entregar" && 80) ||
                              (order.status === "Entregado" && 90) ||
                              (order.status === "Concretado" && 100) ||
                              (order.status === "Detenido" && 50) ||
                              (order.status === "Anulado" && 0)
                            }
                          />
                        </Grid>
                      </Grid>
                    ))
                  ) : (
                    <Typography align="center" variant="h5" color="secondary">
                      Aún no hay pedidos registrados para ti.
                    </Typography>
                  )}
                </Grid>
              )}
              {tab === 2 && (
                <Grid>
                  {movements.length > 0 ? (
                    movements.map((mov) => (
                      <Grid
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "grey",
                          backgroundColor: "ghostwhite",
                          padding: 10,
                          borderRadius: 10,
                          margin: "10px 0px 10px 0px",
                          alignItems: "center",
                        }}
                      >
                        <Grid style={{ fontSize: isDeskTop ? "14px" : "9px" }}>
                          {mov.date
                            ? new Date(mov.date)
                                .toLocaleString("en-GB", {
                                  timeZone: "UTC",
                                })
                                .slice(0, 10)
                            : new Date(mov.createdOn)
                                .toLocaleString("en-GB", {
                                  timeZone: "UTC",
                                })
                                .slice(0, 10)}
                        </Grid>
                        <Grid style={{ fontSize: isDeskTop ? "14px" : "9px" }}>
                          {mov.description.split("#")[0]}{" "}
                          <Button
                            style={{
                              textTransform: "none",
                              color: "#404e5c",
                              fontSize: isDeskTop ? "14px" : "9px",
                              minWidth: 32,
                            }}
                            onClick={handleClick(
                              "right-start",
                              mov.description.split("#")[1],
                              mov.type
                            )}
                          >
                            {mov.description.split("#")[1]}
                          </Button>
                        </Grid>
                        {mov.type === "Depósito" ? (
                          <Grid
                            style={{
                              color: "green",
                              fontWeight: "bold",
                              fontSize: isDeskTop ? "14px" : "9px",
                            }}
                          >
                            + $
                            {mov.value?.toLocaleString("de-DE", {
                              minimumFractionDigits: 2,
                            })}
                          </Grid>
                        ) : (
                          mov.type === "Retiro" && (
                            <Grid
                              style={{
                                color: "red",
                                fontWeight: "bold",
                                fontSize: isDeskTop ? "14px" : "9px",
                              }}
                            >
                              - $
                              {mov.value?.toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                              })}
                            </Grid>
                          )
                        )}
                      </Grid>
                    ))
                  ) : (
                    <Typography align="center" variant="h6" color="secondary">
                      Aún no hay movimientos registrados para ti.
                    </Typography>
                  )}
                </Grid>
              )}
              {tab === 3 && (
                <Typography align="center" variant="h4" color="secondary">
                  Próximamente
                </Typography>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <div style={{ maxWidth: "80%" }}>
        <Modal open={openOrderDetails} onClose={handleClose}>
          {/* <Popper
          open={openOrderDetails}
          anchorEl={anchorEl}
          placement={placement}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <ClickAwayListener onClickAway={handleClose}> */}
          <MovDetails orderId={orderId} handleClose={handleClose} type={type} />
          {/* </ClickAwayListener>
            </Fade>
          )}
        </Popper> */}
        </Modal>
      </div>
    </Container>
  );
}
