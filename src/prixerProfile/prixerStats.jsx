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
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/order/byPrixer";
    axios.post(base_url, { prixer: prixerUsername }).then((response) => {
      let orders = response.data.order;
      let total;
      orders.map((order) => {
        total = order.product.publicEquation * order.quantity * 0.1;
      });
      setBalance(total.toFixed(2));
    });
  }, []);

  console.log(balance);

  return (
    <Container component="main" maxWidth="xl" className={classes.paper}>
      <CssBaseline />
      <Grid>
        <AppBar prixerUsername={prixerUsername} />
      </Grid>
      <Grid className={classes.paper2}>
        <Paper style={{ width: "70%", padding: 10, borderRadius: 10 }}>
          <Typography color="primary" variant="h6" style={{ paddingLeft: 10 }}>
            Mi Resumen
          </Typography>
          <Grid container>
            <Grid item xs={4} sm={4}>
              <Tabs>
                <Tab label="Balance General" />
              </Tabs>
            </Grid>
            <Grid
              item
              xs={8}
              sm={8}
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
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
          </Grid>
        </Paper>
      </Grid>
    </Container>
  );
}
