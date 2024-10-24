import React, { useEffect } from "react";
import axios from "axios";

import AppBar from "components/appBar/appBar";
import FloatingAddButton from "components/floatingAddButton/floatingAddButton";
import ArtsGrid from "art/components/grid";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { useState } from "react";
import ArtUploader from "components/artUploader/artUploader";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import MDEditor from "@uiw/react-md-editor";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Img from "react-cool-img";
import { useHistory } from "react-router-dom";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import CartReview from "cart/cartReview";
import WarpImage from "admin/productCrud/warpImage";
import CreateService from "components/createService/createService";

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

export default function Catalog(props) {
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const [openShoppingCart, setOpenShoppingCart] = useState(false);
  const [selectedArt, setSelectedArt] = useState(undefined);
  const history = useHistory();
  const theme = useTheme();
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false);
  const [createdService, setCreatedService] = useState(false);

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));
  const classes = useStyles();

  const allowMockup = (buy, index) => {
    if (buy.product?.mockUp !== undefined && buy.art !== undefined) {
      return (
        <div
          style={{
            width: 220,
            height: 220,
            position: "relative",
            borderRadius: 15,
            border: "2px",
            borderStyle: "solid",
            borderColor:
              props.selectedProductToAssociate?.index === index
                ? "#d33f49"
                : "gainsboro",
            opacity:
              props.selectedProductToAssociate?.index === index ? "1" : "0.6",
          }}
        >
          <WarpImage
            warpPercentage={buy.product.mockUp.warpPercentage}
            warpOrientation={buy.product.mockUp.warpOrientation}
            invertedWrap={buy.product.mockUp.invertedWrap}
            randomArt={
              props.selectedProductToAssociate?.index === index
                ? selectedArt
                : buy.art
            }
            topLeft={buy.product.mockUp.topLeft}
            width={buy.product.mockUp.width}
            height={buy.product.mockUp.height}
            perspective={buy.product.mockUp.perspective}
            rotate={buy.product.mockUp.rotate}
            rotateX={buy.product.mockUp.rotateX}
            rotateY={buy.product.mockUp.rotateY}
            skewX={buy.product.mockUp.skewX}
            skewY={buy.product.mockUp.skewY}
            translateX={buy.product.mockUp.translateX}
            translateY={buy.product.mockUp.translateY}
            setOpen={props.setOpen}
              setMessage={props.setMessage}
          />
          <div
            style={{
              backgroundImage: "url(" + buy.product.mockUp.mockupImg + ")",
              width: 210,
              height: 210,
              backgroundSize: "cover",
              borderRadius: 20,
              position: "absolute",
              top: "0",
              left: "0",
              zIndex: "2",
            }}
          />
        </div>
      );
    } else {
      return (
        <>
          <Img
            placeholder="/imgLoading.svg"
            style={{
              backgroundColor: "#eeeeee",
              height: 180,
              width: 180,
              borderRadius: 15,
              border: "2px",
              borderStyle: "solid",
              borderColor:
                props.selectedProductToAssociate?.index === index
                  ? "#d33f49"
                  : "gainsboro",
              opacity:
                props.selectedProductToAssociate?.index === index ? "1" : "0.6",
            }}
            src={ buy?.product?.sources?.images[0]?.url || buy?.product?.thumbUrl || "" }
            debounce={1000}
            cache
            error="/imgError.svg"
            sizes="(min-width: 1600px) 850px, (min-width: 960px) 450px, (min-width: 640px) 400px, 200px"
            alt={buy.product && buy.product.name}
            id={index}
          />
        </>
      );
    }
  };

  return (
    <>
      <Container component="main" maxWidth="s" className={classes.paper}>
        <CssBaseline />

        <Grid
          style={{
            marginTop: 20,
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h4"
            style={{ color: "#404e5c" }}
            fontWeight="bold"
          >
            <strong>Galería</strong>
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            style={{ marginBottom: 20 }}
          >
            Encuentra tu arte preferido. Ejemplo: escribe "playa" y toca la
            lupa.
          </Typography>
        </Grid>

        <Grid>
          <ArtsGrid
            prixerUsername={props.prixer}
            buyState={props.buyState}
            addItemToBuyState={props.addItemToBuyState}
            setIsOpenAssociateProduct={props.setIsOpenAssociateProduct}
            setSelectedArt={setSelectedArt}
            setFullArt={props.setFullArt}
            fullArt={props.fullArt}
            setSearchResult={props.setSearchResult}
            searchResult={props.searchResult}
          />
        </Grid>

        {/* Art uploader */}
        {openArtFormDialog && (
          <ArtUploader
            openArtFormDialog={openArtFormDialog}
            setOpenArtFormDialog={setOpenArtFormDialog}
          />
        )}

        {/* Serivices uploader */}
        {openServiceFormDialog && (
          <CreateService
            openArtFormDialog={openServiceFormDialog}
            setOpenServiceFormDialog={setOpenServiceFormDialog}
            setCreatedService={setCreatedService}
          />
        )}

        {/* Floating buttons */}
        <Grid className={classes.float}>
          <FloatingAddButton
            setOpenArtFormDialog={setOpenArtFormDialog}
            setOpenShoppingCart={setOpenShoppingCart}
            setOpenServiceFormDialog={setOpenServiceFormDialog}
          />
        </Grid>

        {/* Asociación de productos */}
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
                props.buyState.length > 0 &&
                props.buyState.find((buy) => buy.product !== undefined) && (
                  <strong>
                    Puedes asociar el arte a un producto de tu carrito de
                    compras o agregarlo y asociarlo mas tarde.
                  </strong>
                )}
              <div style={{ display: "flex" }}>
                {props.selectedProductToAssociate?.previous ? (
                  "¿Deseas asociar este producto al item seleccionado previamente en el carrito?"
                ) : props.buyState.length > 0 &&
                  props.buyState.find((buy) => buy.product !== undefined) ? (
                  props.buyState.map((buy, index) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          width: 220,
                          marginRight: 10,
                        }}
                      >
                        {buy.product && (
                          <div
                            key={index}
                            style={{
                              marginBottom: "32px",
                              marginTop: 10,
                              height: 220,
                              width: 220,
                            }}
                            onClick={() =>
                              props.setSelectedProductToAssociate({
                                index,
                                item: buy.product,
                              })
                            }
                          >
                            {allowMockup(buy, index)}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <strong>
                    Parece que no tienes ningun producto dentro del carrito de
                    compras, aun asi, puedes agregar este producto y asociarlo
                    más tarde.
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
            {props.buyState.length > 0 &&
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
                    history.push({ pathname: "/" });
                  }}
                  color="primary"
                >
                  {props.selectedProductToAssociate?.previous
                    ? "Sí"
                    : "Asociar"}
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

        {/* Cart Review (?) */}
        <Dialog
          maxWidth={"lg"}
          open={openShoppingCart}
          style={{
            width: isDeskTop ? 850 : "100%",
            margin: isDesktop ? "auto" : 0,
          }}
        >
          {props.buyState?.length > 0 ? (
            <div
              style={{
                marginLeft: 15,
                marginRight: 15,
                marginTop: -60,
              }}
            >
              <CartReview
                buyState={props.buyState}
                changeQuantity={props.changeQuantity}
                deleteItemInBuyState={props.deleteItemInBuyState}
                deleteProductInItem={props.deleteProductInItem}
                setSelectedArtToAssociate={props.setSelectedArtToAssociate}
              />
            </div>
          ) : (
            <div style={{ margin: "90px 10px 40px 10px" }}>
              <Typography variant={"h6"} align={"Center"} justify={"center"}>
                Actualmente no tienes ningun producto dentro del carrito de
                compra.
              </Typography>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginBottom: 20,
            }}
          >
            <Button
              onClick={() => {
                setOpenShoppingCart(false);
              }}
              color="primary"
            >
              Cerrar
            </Button>
            {props.buyState?.length > 0 && (
              <Button
                onClick={() => {
                  history.push({ pathname: "/shopping" });
                }}
                color="primary"
              >
                Comprar
              </Button>
            )}
          </div>
        </Dialog>
      </Container>
    </>
  );
}