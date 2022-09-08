import React from "react";
import AppBar from "../sharedComponents/appBar/appBar";
import FloatingAddButton from "../sharedComponents/floatingAddButton/floatingAddButton";
import ArtsGrid from "../prixerProfile/grid/grid";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { useState } from "react";
import ArtUploader from "../sharedComponents/artUploader/artUploader";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(3),
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
    marginLeft: "87%",
  },
}));

export default function Gallery(props) {
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const prixerUsername = "all";
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="s" className={classes.paper}>
      <CssBaseline margin="0" />
      <Grid>
        <AppBar prixerUsername={prixerUsername} />
      </Grid>
      <Grid style={{ marginTop: 90 }}>
        <h1 style={{ margin: 0 }}>Galería</h1>
        <Typography
          variant="body2"
          color="textSecondary"
          component="p"
          style={{ marginBottom: 20 }}
        >
          Encuentra tu arte preferido. Ejemplo: escribe "playa" y toca la lupa.
        </Typography>
      </Grid>
      <Grid>
        <ArtsGrid prixerUsername={null} />
      </Grid>
      {openArtFormDialog && (
        <ArtUploader
          openArtFormDialog={openArtFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
        />
      )}
      {JSON.parse(localStorage.getItem("token")) &&
        JSON.parse(localStorage.getItem("token")).username && (
          <Grid className={classes.float}>
            <FloatingAddButton setOpenArtFormDialog={setOpenArtFormDialog} />
          </Grid>
        )}
    </Container>
  );
}
