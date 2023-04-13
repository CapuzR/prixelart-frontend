import React, { useEffect } from "react";
import axios from "axios";

import AppBar from "../sharedComponents/appBar/appBar";
import FloatingAddButton from "../sharedComponents/floatingAddButton/floatingAddButton";
import UserData from "./userData/userData";
import PrixerOptions from "./prixerOptions/prixerOptions";
import ArtsGrid from "./grid/grid";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { useState } from "react";
import ArtUploader from "../sharedComponents/artUploader/artUploader";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import MDEditor from "@uiw/react-md-editor";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import { useHistory, useParams } from "react-router-dom";
import CartReview from "../shoppingCart/cartReview";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Img from "react-cool-img";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    flexGrow: 1,
  },
  paper2: {
    display: "flex",
    justifyContent: "center",
    marginTop: 80,
  },
}));

export default function PrixerProfile() {
  const classes = useStyles();
  const theme = useTheme();
  const prixerUsername = JSON.parse(localStorage.getItem("token")).username;
  const [balance, setBalance] = useState(0);
  const [relOrders, setRelOrders] = useState([]);
  const [tab, setTab] = useState("balance");
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/order/byPrixer";
    axios.post(base_url, { prixer: prixerUsername }).then((response) => {
      let orders = response.data.orders;
      let total;
      orders.map((order) => {
        order.requests.map((item) => {
          if (item.art.prixerUsername === prixerUsername) {
            relOrders.push(item);
          }
        });
      });
      relOrders.map((item) => {
        if (item.product.prixerEquation) {
          total = item.product.prixerEquation * item.quantity * 0.1;
        } else if (item.product.prixerPrice.from) {
          total = item.product.prixerPrice.from * item.quantity * 0.1;
        } else if (item.product.publicEquation) {
          total = item.product.publicEquation * item.quantity * 0.1;
        } else if (item.product.publicPrice.from) {
          total = item.product.publicPrice.from * item.quantity * 0.1;
        }
      });

      setBalance(total.toFixed(2));
    });
  }, []);

  const handleBalance = (e) => {
    e.preventDefault();
    setTab("balance");
  };

  const handleMovement = (e) => {
    e.preventDefault();
    setTab("movement");
  };

  const handleInteractions = (e) => {
    e.preventDefault();
    setTab("interactions");
  };

  return (
    <Container component="main" maxWidth="xl" className={classes.paper}>
      <CssBaseline />
      <Grid>
        <AppBar prixerUsername={prixerUsername} />
      </Grid>
      <Grid className={classes.paper2}>
        <Paper
          style={{ width: "70%", padding: 10, borderRadius: 10 }}
          elevation={3}
        >
          <Typography color="primary" variant="h6" style={{ paddingLeft: 10 }}>
            Mi Resumen
          </Typography>
          <Grid container>
            <Grid item xs={4} sm={3}>
              <Tabs orientation="vertical">
                <Tab label="Balance General" onClick={handleBalance} />
                <Tab label="Movimientos" onClick={handleMovement} />
                <Tab label="Interacciones" onClick={handleInteractions} />
              </Tabs>
            </Grid>
            <hr />

            <Grid
              item
              xs={8}
              sm={8}
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                minHeight: 200,
              }}
            >
              {tab === "balance" && (
                <Grid>
                  <Typography
                    variant="body2"
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    Tu balance es de:
                  </Typography>
                  <Typography
                    variant="h2"
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    ${balance}
                  </Typography>
                </Grid>
              )}
              {tab === "movement" && (
                <Grid>
                  <Typography>Tus Movimientos:</Typography>
                  {relOrders.length > 0 ? (
                    relOrders.map((item) => (
                      <Grid
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "grey",
                          backgroundColor: "ghostwhite",
                          padding: 10,
                          borderRadius: 10,
                          margin: "10px 0px 10px 0px",
                        }}
                      >
                        <Grid item>
                          {/* <Typography color="gris"> */}
                          {item.product.name} x {item.art.title}
                          {/* </Typography> */}
                        </Grid>
                        <Grid style={{ color: "green", fontWeight: "bold" }}>
                          + $
                          {item.product.prixerEquation
                            ? item.product.prixerEquation * item.quantity * 0.1
                            : item.product.prixerPrice.from
                            ? item.product.prixerPrice.from *
                              item.quantity *
                              0.1
                            : item.product.publicEquation
                            ? item.product.publicEquation * item.quantity * 0.1
                            : item.product.publicPrice.from &&
                              item.product.publicPrice.from *
                                item.quantity *
                                0.1}
                        </Grid>
                      </Grid>
                    ))
                  ) : (
                    <Typography>
                      Aún no hay órdenes registradas para ti :c{" "}
                    </Typography>
                  )}
                </Grid>
              )}
              {tab === "interactions" && (
                // <div margin={"auto"}>
                <Typography align="center" variant="h4">
                  Próximamente
                </Typography>
                // </div>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Container>
  );
}
