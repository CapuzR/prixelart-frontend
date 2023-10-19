import React, { useEffect } from "react";
import axios from "axios";

import AppBar from "../sharedComponents/appBar/appBar";
import FloatingAddButton from "../sharedComponents/floatingAddButton/floatingAddButton";
import UserData from "./userData/userData";
import PrixerOptions from "./prixerOptions/prixerOptions";
import ArtsGrid from "./grid/grid";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import makeStyles from "@mui/styles/makeStyles";
import { useState } from "react";
import ArtUploader from "../sharedComponents/artUploader/artUploader";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import MDEditor from "@uiw/react-md-editor";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import CartReview from "../shoppingCart/cartReview";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Img from "react-cool-img";

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
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const prixerUsername = new URLSearchParams(window.location)
    .get("pathname")
    .replace(/[/]/gi, "");
  const [termsAgreeVar, setTermsAgreeVar] = useState(true);
  const [value, setValue] = useState("");
  const [openShoppingCart, setOpenShoppingCart] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedArt, setSelectedArt] = useState(undefined);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));

  const TermsAgreeModal = () => {
    const GetId = JSON.parse(localStorage.getItem("token")).username;
    const base_url = process.env.REACT_APP_BACKEND_URL + "/prixer/get/" + GetId;
    axios.get(base_url).then((response) => {
      setTermsAgreeVar(response.data.termsAgree);
      getTerms();
    });
  };

  useEffect(() => {
    {
      JSON.parse(localStorage.getItem("token")) && TermsAgreeModal();
    }
  }, []);

  const getTerms = () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/read";
    axios
      .get(base_url)
      .then((response) => {
        setValue(response?.data?.terms?.termsAndConditions);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleSubmit = async (e, Id) => {
    e.preventDefault();
    const formData = new FormData();
    const termsAgree = true;
    formData.append("termsAgree", termsAgree);
    // formData.append(
    //   "username",
    //   JSON.parse(localStorage.getItem("token")).username
    // );
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/prixer/update-terms/" + Id;
    const response = await axios
      .put(
        base_url,
        { termsAgree: true },
        {
          "Content-Type": "multipart/form-data",
        }
      )
      .then((response) => {
        setTermsAgreeVar(true);
      });
  };

  return (
    <Container component="main" maxWidth="xl" className={classes.paper}>
      <CssBaseline />
      <Grid>
        <AppBar prixerUsername={prixerUsername} />
      </Grid>
      <UserData prixerUsername={prixerUsername} />
      <PrixerOptions prixerUsername={prixerUsername} />
      <ArtsGrid
        prixerUsername={prixerUsername}
        buyState={props.buyState}
        addItemToBuyState={props.addItemToBuyState}
        setIsOpenAssociateProduct={props.setIsOpenAssociateProduct}
        setSelectedArt={setSelectedArt}
        setPrixer={props.setPrixer}
        setFullArt={props.setFullArt}
        setSearchResult={props.setSearchResult}
      />
      {openArtFormDialog && (
        <ArtUploader
          openArtFormDialog={openArtFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
        />
      )}
      <Grid className={classes.float}>
        <FloatingAddButton
          setOpenArtFormDialog={setOpenArtFormDialog}
          setOpenShoppingCart={setOpenShoppingCart}
        />
      </Grid>

      {/* Terms & Co */}
      <Modal
        xl={800}
        lg={800}
        md={480}
        sm={360}
        xs={360}
        open={termsAgreeVar === false}
        onClose={termsAgreeVar === true}
      >
        <div className={classes.paper2}>
          <h2 style={{ textAlign: "center", fontWeight: "Normal" }}>
            Hemos actualizado nuestros términos y condiciones y queremos que
            estés al tanto.
          </h2>
          <div>
            <div data-color-mode="light">
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "12px",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                CONVENIO DE RELACIÓN ENTRE LOS ARTISTAS Y LA COMPAÑÍA
              </div>
              <div data-color-mode="light">
                <MDEditor.Markdown
                  source={value}
                  style={{ textAlign: "justify" }}
                />
              </div>
            </div>
          </div>
          <div style={{ justifyContent: "center", display: "flex" }}>
            <Button
              onClick={(e) => {
                handleSubmit(
                  e,
                  JSON.parse(localStorage.getItem("token")).username
                );
              }}
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submit}
              required
            >
              Acepto los nuevos términos y condiciones
            </Button>
          </div>
        </div>
      </Modal>

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
                navigate({ pathname: "/productos" });
              }}
              color="primary"
            >
              Agregar como nuevo
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Shopping Cart
       */}
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
                navigate({ pathname: "/shopping" });
              }}
              color="primary"
            >
              Comprar
            </Button>
          )}
        </div>
      </Dialog>
    </Container>
  );
}
