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
import { Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    // alignItems: "left",
    flexGrow: 1,
  },
  paper2: {
    display: "flex",
    justifyContent: "center",
    marginTop: 80,
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    // backgroundColor: "#d33f49",
  },
}));

export default function PrixerProfile() {
  const classes = useStyles();
  const theme = useTheme();
  const prixerUsername = JSON.parse(localStorage.getItem("token")).username;
  const account = JSON.parse(localStorage.getItem("token")).account;
  const [balance, setBalance] = useState(0);
  const [movements, setMovements] = useState([]);
  const [tab, setTab] = useState(0);
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

  const handleChange = (event, newValue) => {
    console.log(newValue);
    setTab(newValue);
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
          <Typography
            color="primary"
            variant="h4"
            style={{ paddingLeft: 10, color: "#404e5c", textAlign: "center" }}
          >
            Mi Resumen
          </Typography>
          <Grid container>
            <Grid item xs={4} sm={3}>
              <Tabs
                onChange={handleChange}
                orientation="vertical"
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
                    fontSize: 18,
                    color: "#404e5c",
                  }}
                />
                <Tab
                  label="Movimientos"
                  style={{
                    textTransform: "none",
                    fontSize: 18,
                    color: "#404e5c",
                  }}
                />
                <Tab
                  label="Interacciones"
                  style={{
                    textTransform: "none",
                    fontSize: 18,
                    color: "#404e5c",
                  }}
                />
              </Tabs>
            </Grid>
            {/* <hr /> */}

            <Grid
              item
              xs={8}
              sm={8}
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                minHeight: 200,
                marginLeft: 10,
              }}
            >
              {tab === 0 && (
                <Grid>
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
                      // maximumSignificantDigits: 2,
                    })}
                  </Typography>
                </Grid>
              )}
              {tab === 1 && (
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
                          alignItems: "center",
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
                        <Grid>
                          {mov.description.split("#")[0]}{" "}
                          <Button
                            style={{
                              textTransform: "none",
                              // fontSize: 18,
                              color: "#404e5c",
                            }}
                          >
                            {mov.description.split("#")[1]}
                          </Button>
                        </Grid>
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
              {tab === 2 && (
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
