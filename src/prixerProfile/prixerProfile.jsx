import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"

import AppBar from "../sharedComponents/appBar/appBar"
import FloatingAddButton from "../sharedComponents/floatingAddButton/floatingAddButton"
import CreateService from "../sharedComponents/createService/createService"
import UserData from "./userData/userData"
import PrixerOptions from "./prixerOptions/prixerOptions"
import ArtsGrid from "./grid/grid"
import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import ArtUploader from "../sharedComponents/artUploader/artUploader"
import ServiceGrid from "./grid/serviceGrid"
import Modal from "@material-ui/core/Modal"
import Button from "@material-ui/core/Button"
import MDEditor from "@uiw/react-md-editor"
import Dialog from "@material-ui/core/Dialog"
import Typography from "@material-ui/core/Typography"
import { useHistory } from "react-router-dom"
import CartReview from "../shoppingCart/cartReview"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { useTheme } from "@material-ui/core/styles"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import Img from "react-cool-img"
import Biography from "./grid/biography"

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
}))

export default function PrixerProfile(props) {
  const classes = useStyles()
  const history = useHistory()
  const theme = useTheme()
  const globalParams = new URLSearchParams(window.location.pathname)
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"))
  const username = window.location.pathname.includes("org")
    ? globalParams.get("/org")
    : window.location.pathname.includes("prixer")
    ? globalParams.get("/prixer")
    : window.location.pathname.slice(1)
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false)
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false)
  const [openShoppingCart, setOpenShoppingCart] = useState(false)
  const [selectedArt, setSelectedArt] = useState(undefined)
  const [feed, setFeed] = useState("Artes")
  const [createdService, setCreatedService] = useState(false)
  const [artSaved, setArtSaved] = useState(false)
  console.log(window.location.pathname.slice(1))
  // const [username, setUsername] = useState(undefined)

  // const getUsername = () => {
  //   console.log(window.location.pathname)
  //   if (window.location.pathname.includes("org")) {
  //     setUsername(globalParams.get("/org"))
  //   } else if (window.location.pathname.includes("prixer")) {
  //     setUsername(globalParams.get("/prixer"))
  //   }
  //   console.log(globalParams.get("/prixer"))

  //   //   ? globalParams.get("/org")
  //   //   : globalParams.get("/prixer")
  // }

  // useEffect(() => {
  //   getUsername()
  // }, [])
  // console.log(username)

  const showPrixerGrid = () => {
    switch (feed) {
      case "Settings":
        return <div></div>

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
            artSaved={artSaved}
          />
        )

      case "Servicios":
        return (
          <ServiceGrid
            prixerUsername={username}
            createdService={createdService}
            setCreatedService={setCreatedService}
            permissions={props.permissions}
          />
        )

      case "Bio":
        return <Biography prixerUsername={username} />
    }
  }

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
          setArtSaved={setArtSaved}
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
                  )
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
                props.setSelectedProductToAssociate(undefined)
              props.setIsOpenAssociateProduct(false)
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
                  })
                  props.setSelectedProductToAssociate(undefined)
                  setSelectedArt(undefined)
                  props.setIsOpenAssociateProduct(false)
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
                })

                setSelectedArt(undefined)
                history.push({ pathname: "/productos" })
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
              setOpenShoppingCart(false)
            }}
            color="primary"
          >
            Cerrar
          </Button>
          {props.buyState?.length > 0 && (
            <Button
              onClick={() => {
                history.push({ pathname: "/shopping" })
              }}
              color="primary"
            >
              Comprar
            </Button>
          )}
        </div>
      </Dialog>
    </Container>
  )
}
