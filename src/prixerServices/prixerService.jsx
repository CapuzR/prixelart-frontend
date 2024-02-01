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
import PrixersGrid from "../sharedComponents/prixerGrid/prixerGrid";
import ServiceGrid from "../prixerProfile/grid/serviceGrid";

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    flexGrow: 1,
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  float: {
    position: "relative",
    marginLeft: "95%",
  },
  paper2: {
    position: "absolute",
    width: "80%",
    maxHeight: 450,
    overflowY: "auto",
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: "16px 32px 24px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "justify",
  },
}));

export default function PrixersService(props) {
  const [prixerUsername, setPrixerUsername] = useState(null);
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));
  const classes = useStyles();

  return (
    <>
      <AppBar prixerUsername={prixerUsername} />

      <Container component="main" maxWidth="s" className={classes.paper}>
        <CssBaseline />

        <Grid
          style={{ marginTop: 90, justifyContent: "center", display: "flex" }}
        >
          <Typography
            variant="h4"
            style={{ color: "#404e5c", marginBottom: 10 }}
            fontWeight="bold"
          >
            <strong>Servicios</strong>
          </Typography>
        </Grid>
        <Grid>
          <ServiceGrid />
        </Grid>
      </Container>
    </>
  );
}
