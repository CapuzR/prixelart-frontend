import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import AppBar from "components/appBar/appBar";
import FloatingAddButton from "components/floatingAddButton/floatingAddButton";
import CreateService from "components/createService/createService";
import UserData from "./userData/userData";
import PrixerOptions from "./prixerOptions/prixerOptions";
import ArtsGrid from "../art/components/grid";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { useState } from "react";
import ArtUploader from "components/artUploader/artUploader";
import ServiceGrid from "./grid/serviceGrid";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import MDEditor from "@uiw/react-md-editor";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import { useHistory } from "react-router-dom";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Img from "react-cool-img";
import Biography from "./grid/biography";

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

export default function PrixerProfile(props) {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const globalParams = new URLSearchParams(window.location.pathname);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));
  const username = window.location.pathname.includes("org")
    ? globalParams.get("/org")
    : globalParams.get("/prixer");
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false);
  const [openShoppingCart, setOpenShoppingCart] = useState(false);
  const [selectedArt, setSelectedArt] = useState(undefined);
  const [feed, setFeed] = useState("Artes");
  const [createdService, setCreatedService] = useState(false);

  const showPrixerGrid = () => {
    switch (feed) {
      case "Settings":
        return <div></div>;

      case "Artes":
        return (
          <ArtsGrid
            prixerUsername={username}
            buyState={props.buyState}
            addItemToBuyState={props.addItemToBuyState}
            setIsOpenAssociateProduct={props.setIsOpenAssociateProduct}
            setSelectedArt={setSelectedArt}
            setPrixer={props.setPrixer}
            setFullArt={props.setFullArt}
            setSearchResult={props.setSearchResult}
          />
        );

      case "Servicios":
        return (
          <ServiceGrid
            prixerUsername={username}
            createdService={createdService}
            setCreatedService={setCreatedService}
            permissions={props.permissions}
          />
        );

      case "Bio":
        return <Biography prixerUsername={username} />;
    }
  };
  return (
    <Container component="main" maxWidth="xl" className={classes.paper}>
      <CssBaseline />
      {/* <Grid>
        <AppBar prixerUsername={username} />
      </Grid> */}
      <UserData prixerUsername={username} feed={feed} setFeed={setFeed} />
      {feed !== "Settings" && (
        <PrixerOptions
          prixerUsername={username}
          feed={feed}
          setFeed={setFeed}
        />
      )}
      {showPrixerGrid()}

      {openArtFormDialog && (
        <ArtUploader
          openArtFormDialog={openArtFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
        />
      )}

      {openServiceFormDialog && (
        <CreateService
          openArtFormDialog={openServiceFormDialog}
          setOpenServiceFormDialog={setOpenServiceFormDialog}
          setCreatedService={setCreatedService}
        />
      )}

      <Grid className={classes.float}>
        <FloatingAddButton
          setOpenServiceFormDialog={setOpenServiceFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
          setOpenShoppingCart={setOpenShoppingCart}
        />
      </Grid>

      {/* Associate Item */}
      <Dialog
        open={props.isOpenAssociateProduct}
        keepMounted
        fullWidth
        onClose={() => props.setIsOpenAssociateProduct(false)}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          {"Asocia el arte a un producto dentro de tu carrito de compras"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {!props.selectedProductToAssociate?.previous &&
              props.buyState?.length > 0 &&
              props.buyState?.find((buy) => buy.product !== undefined) && (
                <strong>
                  Puedes asociar el arte a un producto de tu carrito de compras
                  o agregarlo y asociarlo mas tarde.
                </strong>
              )}
            <div style={{ display: "flex" }}>
              {props.selectedProductToAssociate?.previous ? (
                "¿Deseas asociar este producto al item seleccionado previamente en el carrito?"
              ) : props.buyState?.length > 0 &&
                props.buyState.find((buy) => buy.product !== undefined) ? (
                props.buyState.map((buy, index) => {
                  return (
                    <div
                      style={{
                        display: "flex",
                        width: "180px",
                      }}
                    >
                      {buy.product && (
                        <div
                          key={index}
                          style={{
                            marginBottom: "32px",
                            height: "180px",
                            width: "180px",
                          }}
                          onClick={() =>
                            props.setSelectedProductToAssociate({
                              index,
                              item: buy.product,
                            })
                          }
                        >
                          <Img
                            placeholder="/imgLoading.svg"
                            style={{
                              backgroundColor: "#eeeeee",
                              height: "180px",
                              width: "180px",
                              opacity:
                                props.selectedProductToAssociate?.index ===
                                index
                                  ? "1"
                                  : "0.6",
                            }}
                            src={buy.product ? buy.product.thumbUrl : ""}
                            debounce={1000}
                            cache
                            error="/imgError.svg"
                            // srcSet={tile.smallThumbUrl + ' 600w, ' + tile.mediumThumbUrl + ' 850w, ' + tile.largeThumbUrl + ' 1300w'}
                            sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 400px, 200px"
                            alt={buy.product && buy.product.name}
                            id={index}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <strong>
                  Parece que no tienes ningun producto dentro del carrito de
                  compras, aun asi, puedes agregar este producto y asociarlo más
                  tarde.
                </strong>
              )}
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              !props.selectedProductToAssociate?.previous &&
                props.setSelectedProductToAssociate(undefined);
              props.setIsOpenAssociateProduct(false);
            }}
            color="primary"
          >
            {props.selectedProductToAssociate?.previous ? "No" : "Cerrar"}
          </Button>
          {props.buyState?.length > 0 &&
            props.buyState.find((buy) => buy.product !== undefined) && (
              <Button
                disabled={!props.selectedProductToAssociate}
                onClick={() => {
                  props.AssociateProduct({
                    index: props.selectedProductToAssociate.index,
                    item: selectedArt,
                    type: "art",
                  });
                  props.setSelectedProductToAssociate(undefined);
                  setSelectedArt(undefined);
                  props.setIsOpenAssociateProduct(false);
                }}
                color="primary"
              >
                {props.selectedProductToAssociate?.previous ? "Sí" : "Asociar"}
              </Button>
            )}
          {!props.selectedProductToAssociate?.previous && (
            <Button
              onClick={() => {
                props.addItemToBuyState({
                  type: "art",
                  item: selectedArt,
                });

                setSelectedArt(undefined);
                history.push({ pathname: "/productos" });
              }}
              color="primary"
            >
              Agregar como nuevo
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
