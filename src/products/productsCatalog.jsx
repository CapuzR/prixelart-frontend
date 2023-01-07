import React from "react";
import AppBar from "../sharedComponents/appBar/appBar";
import FloatingAddButton from "../sharedComponents/floatingAddButton/floatingAddButton";
import ProductsGrid from "./productsGrid";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { useState } from "react";
import ArtUploader from "../sharedComponents/artUploader/artUploader";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Img from "react-cool-img";
import { useHistory } from "react-router-dom";

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
    marginLeft: "95%",
  },
  img: {
    [theme.breakpoints.down("sm")]: {
      maxHeight: 200,
      width: "100%",
    },
    [theme.breakpoints.up("sm")]: {
      maxHeight: 480,
      width: "100%",
    },
    [theme.breakpoints.up("lg")]: {
      maxHeight: 480,
      width: "100%",
    },
    [theme.breakpoints.up("xl")]: {
      maxHeight: 480,
      width: "100%",
    },
    "&:hover": {
      cursor: "pointer",
    },
  },
}));

export default function ProductsCatalog(props) {
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(undefined);
  const prixerUsername = "all";
  const classes = useStyles();
  const history = useHistory();
  return (
    <>
      <AppBar prixerUsername={prixerUsername} />

      <Container component="main" className={classes.paper}>
        <CssBaseline />
        <Grid style={{ marginTop: 80 }}>
          <h1>Productos Prix</h1>
        </Grid>
        <ProductsGrid
          prixerUsername={null}
          buyState={props.buyState}
          addItemToBuyState={props.addItemToBuyState}
          setSelectedProduct={setSelectedProduct}
          setIsOpenAssociateArt={props.setIsOpenAssociateArt}
        />
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
        <Dialog
          open={props.isOpenAssociateArt}
          keepMounted
          fullWidth
          onClose={() => props.setIsOpenAssociateArt(false)}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            {"Asocia el producto a un arte dentro de tu carrito de compras"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {!props.selectedArtToAssociate?.previous &&
                props.buyState.length > 0 &&
                props.buyState.find((buy) => buy.art !== undefined) && (
                  <strong>
                    Puedes asociar el produto a un arte de tu carrito de compras
                    o agregarlo y asociarlo mas tarde.
                  </strong>
                )}
              <div style={{ display: "flex" }}>
                {props.selectedArtToAssociate?.previous ? (
                  "¿Deseas asociar este producto al item seleccionado previamente en el carrito?"
                ) : props.buyState.length > 0 &&
                  props.buyState.find((buy) => buy.art !== undefined) ? (
                  props.buyState.map((buy, index) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                        }}
                      >
                        {buy.art && (
                          <div
                            onClick={() => {
                              props.setSelectedArtToAssociate({
                                index,
                                item: buy.art,
                              });
                            }}
                          >
                            <Img
                              placeholder="/imgLoading.svg"
                              style={{
                                backgroundColor: "#eeeeee",
                                // maxWidth: 200,
                                maxHeight: 200,
                                borderRadius: 10,
                                marginRight: 10,
                                opacity:
                                  props.selectedArtToAssociate?.index === index
                                    ? "1"
                                    : "0.6",
                              }}
                              src={buy.art ? buy.art.squareThumbUrl : ""}
                              debounce={1000}
                              cache
                              error="/imgError.svg"
                              alt={buy.art && buy.art.title}
                              id={buy.art && buy.art.artId}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <strong>
                    Parece que no tienes ningún arte dentro del carrito de
                    compras, aún así, puedes agregar este producto y asociarlo
                    más tarde.
                  </strong>
                )}
              </div>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                props.selectedArtToAssociate?.previous &&
                  props.setSelectedArtToAssociate(undefined);
                props.setIsOpenAssociateArt(false);
              }}
              color="primary"
            >
              {props.selectedArtToAssociate?.previous ? "No" : "Cerrar"}
            </Button>
            {props.buyState.length > 0 &&
              props.buyState.find((buy) => buy.art !== undefined) && (
                <Button
                  disabled={!props.selectedArtToAssociate}
                  onClick={() => {
                    props.AssociateProduct({
                      index: props.selectedArtToAssociate.index,
                      item: selectedProduct,
                      type: "product",
                    });
                    setSelectedProduct(undefined);
                    props.setSelectedArtToAssociate(undefined);
                    props.setIsOpenAssociateArt(false);
                    localStorage.getItem("adminToken")
                      ? history.push({ pathname: "/admin/order/read" })
                      : history.push({ pathname: "/" });
                  }}
                  color="primary"
                >
                  {props.selectedArtToAssociate?.previous ? "Sí" : "Asociar"}
                </Button>
              )}
            {!props.selectedArtToAssociate?.previous && (
              <Button
                onClick={() => {
                  props.addItemToBuyState({
                    type: "product",
                    item: selectedProduct,
                  });
                  setSelectedProduct(undefined);
                  history.push({ pathname: "/galeria" });
                }}
                color="primary"
              >
                Agregar como nuevo
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
