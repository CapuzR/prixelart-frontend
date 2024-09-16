import axios from "axios"
import React, { useEffect } from "react"
import AppBar from "../sharedComponents/appBar/appBar"
import FloatingAddButton from "../sharedComponents/floatingAddButton/floatingAddButton"
import ProductsGrid from "./productsGrid"
import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import { useState } from "react"
import ArtUploader from "../sharedComponents/artUploader/artUploader"

import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"
import Img from "react-cool-img"
import Typography from "@material-ui/core/Typography"
import Paper from "@material-ui/core/Paper"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import Tooltip from "@material-ui/core/Tooltip"

import { useHistory } from "react-router-dom"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { useTheme } from "@material-ui/core/styles"
import CartReview from "../shoppingCart/cartReview"
import CreateService from "../sharedComponents/createService/createService"
import ReactGA from "react-ga"
import { IconButton } from "@material-ui/core"
import Search from "@material-ui/icons/Search"

ReactGA.initialize("G-0RWP9B33D8")
ReactGA.pageview("/productos")

const useStyles = makeStyles((theme) => ({
  paper: {
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    flexGrow: 1,
    maxWidth: "100rem",
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
}))

export default function ProductsCatalog(props) {
  const theme = useTheme()

  const [openArtFormDialog, setOpenArtFormDialog] = useState(false)
  const [openShoppingCart, setOpenShoppingCart] = useState(false)
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"))
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTab = useMediaQuery(theme.breakpoints.down("md"))

  const [bestSellers, setBestSellers] = useState()
  const [selectedProduct, setSelectedProduct] = useState(undefined)
  const prixerUsername = "all"
  const classes = useStyles()
  const history = useHistory()
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false)
  const [createdService, setCreatedService] = useState(false)

  const getBestSellers = async () => {
    const url = process.env.REACT_APP_BACKEND_URL + "/getBestSellers"
    try {
      const bestS = await axios.get(url)
      setBestSellers(bestS.data.products)
    } catch (error) {
      console.log(error)
    }
  }

  const handleProduct = async (product) => {
    props.setPointedProduct(product.name)
    document.getElementById(product.name)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
  useEffect(() => {
    getBestSellers()
  }, [])

  const viewDetails = (product) => {
    history.push({
      pathname: "/producto=" + product._id,
    })
    ReactGA.event({
      category: "Productos",
      action: "Ver_mas",
      label: product.name,
    })
  }

  const settings = {
    slidesToShow: (isMobile && 2) || (isTab && 3) || (isDesktop && 4),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    infinite: true,
    dots: true,
  }

  return (
    <>
      <AppBar prixerUsername={prixerUsername} />

      <Container
        component="main"
        className={classes.paper}
      >
        <CssBaseline />
        <Grid style={{ marginTop: 90 }}>
          <Typography
            variant="h4"
            style={{ color: "#404e5c" }}
            fontWeight="bold"
          >
            <strong>Productos Prix </strong>
          </Typography>
        </Grid>

        {bestSellers && (
          <Paper
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
              width: isDesktop ? "80%" : "96%",
              height: isMobile ? 240 : 300,
              marginTop: 20,
              marginLeft: isDesktop ? "10%" : "2%",
              borderRadius: isMobile ? 30 : 52,
              backgroundColor: "gainsboro",
              padding: isMobile ? 10 : 30,
              paddingTop: isMobile ? 0 : 10,
            }}
            elevation={5}
          >
            <div>
              <Typography
                variant="h4"
                style={{
                  color: "#404e5c",
                  fontSize: isMobile && "22px",
                  alignSelf: "center",
                }}
                fontWeight="bold"
              >
                {isMobile ? (
                  <strong>¡Más vendidos!</strong>
                ) : (
                  <strong>¡Productos más vendidos! </strong>
                )}
              </Typography>
            </div>
            <Slider {...settings}>
              {bestSellers?.map((product) => (
                <div
                  key={product._id}
                  style={{
                    borderRadius: 40,
                    display: "flex",
                    flexDirection: "column",
                    height: isMobile ? 150 : 250,
                    width: "80%",
                    marginLeft: isMobile ? 35 : 100,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        backgroundImage:
                          product?.sources?.images.length > 0
                            ? "url(" + product.sources.images[0]?.url + ")"
                            : "url(" + product.thumbUrl + ")",
                        height: isMobile ? 120 : 170,
                        width: isMobile ? 120 : 170,
                        marginRight: 10,
                        backgroundSize: "cover",
                        borderRadius: 20,
                        backgroundPosition: "back",
                        display: "flex",
                        justifyItems: "end",
                        alignItems: "end"
                      }}
                    >
                      {isMobile && (
                        <Tooltip title="Ver detalle">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              viewDetails(e, product)
                            }}
                            style={{
                              padding: "1px",
                              backgroundColor: "#d33f49",
                              color: "#FFF",
                              margin: 6
                            }}
                          >
                            <Search />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>

                    {!isMobile && (
                      <>
                        <Typography
                          variant="subtitle1"
                          style={{
                            color: "#404e5c",
                            fontWeight: "bold",
                            fontSize: isMobile && "1rem",
                            alignSelf: "center",
                          }}
                        >
                          {product.name}
                        </Typography>
                        <Button
                          style={{
                            backgroundColor: "#d33f49",
                            color: "white",
                            borderRadius: 40,
                            width: 120,
                            textTransform: "none",
                          }}
                          size="small"
                          onClick={() => handleProduct(product)}
                        >
                          Ver detalles
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </Slider>
          </Paper>
        )}

        <ProductsGrid
          prixerUsername={null}
          buyState={props.buyState}
          addItemToBuyState={props.addItemToBuyState}
          setSelectedProduct={setSelectedProduct}
          setIsOpenAssociateArt={props.setIsOpenAssociateArt}
          dollarValue={props.dollarValue}
          pointedProduct={props.pointedProduct}
        />
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
            setOpenArtFormDialog={setOpenArtFormDialog}
            setOpenShoppingCart={setOpenShoppingCart}
            setOpenServiceFormDialog={setOpenServiceFormDialog}
          />
        </Grid>

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
                              })
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
                    )
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
                  props.setSelectedArtToAssociate(undefined)
                props.setIsOpenAssociateArt(false)
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
                    })
                    setSelectedProduct(undefined)
                    props.setSelectedArtToAssociate(undefined)
                    props.setIsOpenAssociateArt(false)
                    localStorage.getItem("adminToken")
                      ? history.push({ pathname: "/admin/order/read" })
                      : history.push({ pathname: "/" })
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
                  })
                  setSelectedProduct(undefined)
                  history.push({ pathname: "/galeria" })
                }}
                color="primary"
              >
                Agregar como nuevo
              </Button>
            )}
          </DialogActions>
        </Dialog>

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
              <Typography
                variant={"h6"}
                align={"Center"}
                justify={"center"}
              >
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
    </>
  )
}
