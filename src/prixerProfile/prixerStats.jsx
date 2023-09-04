import React, { useEffect } from "react";
import axios from "axios";

import AppBar from "../sharedComponents/appBar/appBar";
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
  const account = JSON.parse(localStorage.getItem("token")).account;
  const [balance, setBalance] = useState(0);
  const [movements, setMovements] = useState([]);
  const [tab, setTab] = useState("balance");
  // const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const getBalance = () => {
    const url = process.env.REACT_APP_BACKEND_URL + "/account/readById";
    const data = { _id: account };
    axios.post(url, data).then((response) => setBalance(response.data.balance));
  };

  const getMovements = () => {
    const url = process.env.REACT_APP_BACKEND_URL + "/movement/readByAccount";
    const data = { _id: account };
    axios
      .post(url, data)
      .then((response) => setMovements(response.data.movements));
  };
  useEffect(() => {
    getBalance();
    getMovements();
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
                    variant="body1"
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    Tu balance es de:
                  </Typography>
                  <Typography
                    variant="h2"
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    $
                    {balance?.toLocaleString("de-DE", {
                      minimumFractionDigits: 2,
                      // maximumSignificantDigits: 2,
                    })}
                  </Typography>
                </Grid>
              )}
              {tab === "movement" && (
                <Grid>
                  <Typography
                    variant="h6"
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    Tus Movimientos:
                  </Typography>
                  {movements ? (
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
                        }}
                      >
                        <Grid>
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
                        <Grid>{mov.description}</Grid>
                        {mov.type === "Depósito" ? (
                          <Grid style={{ color: "green", fontWeight: "bold" }}>
                            + $
                            {mov.value?.toLocaleString("de-DE", {
                              minimumFractionDigits: 2,
                              // maximumSignificantDigits: 2,
                            })}
                          </Grid>
                        ) : (
                          mov.type === "Retiro" && (
                            <Grid style={{ color: "red", fontWeight: "bold" }}>
                              - $
                              {mov.value?.toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                                // maximumSignificantDigits: 2,
                              })}
                            </Grid>
                          )
                        )}
                      </Grid>
                    ))
                  ) : (
                    <Typography
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      Aún no hay órdenes registradas para ti.
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
