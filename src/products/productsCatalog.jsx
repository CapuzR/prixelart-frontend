import React from "react";
import AppBar from "../sharedComponents/appBar/appBar";
import FloatingAddButton from "../sharedComponents/floatingAddButton/floatingAddButton";
import ProductsGrid from "./productsGrid";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { useState } from "react";
import GridList from "@material-ui/core/GridList";
import ArtUploader from "../sharedComponents/artUploader/artUploader";

const useStyles = makeStyles((theme) => ({
  paper: {
    overflow: "hidden",
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

export default function ProductsCatalog(props) {
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const prixerUsername = "all";
  const classes = useStyles();

  return (
    <>
      <AppBar prixerUsername={prixerUsername} />

      <Container component="main" className={classes.paper}>
        <CssBaseline />
        <Grid style={{ marginTop: 80 }}>
          <h1>Productos Prix</h1>
        </Grid>
        <ProductsGrid prixerUsername={null} />
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
    </>
  );
}
