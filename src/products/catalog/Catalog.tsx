import React, { useEffect } from "react"
import axios from "axios"
import FloatingAddButton from "components/floatingAddButton/floatingAddButton"
import ProductsGrid from "../components/Grid"

import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import Tooltip from "@material-ui/core/Tooltip"
import Search from "@material-ui/icons/Search"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { IconButton } from "@material-ui/core"
import { useTheme } from "@material-ui/core/styles"
import { ProductElement1 } from "components/ProductElement1"

import { fetchBestSellers } from '../api';

import { Slider } from "components/Slider"

// import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { useState } from "react"
import ArtUploader from "components/artUploader/artUploader"
import Img from "react-cool-img"
import { useHistory } from "react-router-dom"
import CartReview from "../../cart/cartReview"
import CreateService from "components/createService/createService"
import ReactGA from "react-ga"

import styles from './Catalog.module.scss';
import { Product } from "products/interfaces"

ReactGA.initialize("G-0RWP9B33D8")
ReactGA.pageview("/productos")

interface ProductsCatalogProps {
  setPointedProduct: (productName: string) => void;
  buyState: any[]; // This should be updated to your buyState type
  addItemToBuyState: (item: any) => void; // Update "any" to the proper type
  setIsOpenAssociateArt: (isOpen: boolean) => void;
  pointedProduct: string | null;
  isOpenAssociateArt: boolean;
  selectedArtToAssociate?: { previous?: boolean; index?: number; item?: any };
  setSelectedArtToAssociate: (data: any) => void; // Update "any" to the proper type
  changeQuantity: (item: any) => void;
  deleteItemInBuyState: (item: any) => void;
  deleteProductInItem: (item: any) => void;
  AssociateProduct: (data: { index: number; item: any; type: string }) => void; // Update "any" to the proper type
}

const ProductsCatalog: React.FC<ProductsCatalogProps> = (props) => {
  const theme = useTheme()

  const [openArtFormDialog, setOpenArtFormDialog] = useState(false)
  const [openShoppingCart, setOpenShoppingCart] = useState(false)
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"))
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTab = useMediaQuery(theme.breakpoints.down("md"))

  const [bestSellers, setBestSellers] = useState<Product[] | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const history = useHistory()
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false)
  const [createdService, setCreatedService] = useState(false)
  const [zone, setZone] = useState(
    localStorage.getItem("zone")
    ? JSON.parse(localStorage.getItem("zone") as string)
      : "base"
  )
  
  const handleProduct = async (product) => {
    props.setPointedProduct(product.name)
    document.getElementById(product.name)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  useEffect(() => {
    const getBestSellers = async () => {
      const bestSellers = await fetchBestSellers();
      setBestSellers(bestSellers);
    };
  
    getBestSellers();
  }, []);

  const viewDetails = (product) => {
    history.push({
      pathname: "/",
      search: "?producto=" + product._id,
    })
    ReactGA.event({
      category: "Productos",
      action: "Ver_mas",
      label: product.name,
    })
  }
  
  return (
    <div className={styles['catalog']}>
      <CssBaseline />
      <div className={styles['title']}>
        <Typography variant="h4">
          <strong>Productos Prix</strong>
        </Typography>
      </div>

      {bestSellers && (
        <div className={styles['paper-products']}>
          <div className={styles['title-wrapper']}>
            <Typography variant="h5" className={styles['best-seller-title']}>
              {isMobile ? (
                <strong>¡Más vendidos!</strong>
              ) : (
                <strong>¡Productos más vendidos! </strong>
              )}
            </Typography>
          </div>
            <div className={styles['slider-wrapper']}>
              <Slider
                images={bestSellers?.map((product) => ({
                  url: product?.sources?.images.length > 0 ? product.sources.images[0]?.url : product.thumbUrl,
                }))}
                useIndicators= { {type: 'dots', position: 'below', color: { active: 'primary', inactive: 'secondary' }} }
                childConfig={ { qtyPerSlide: isDesktop ? 3 : isMobile ? 1 : 3, spacing: "sm" } }
                autoplay={false}
              >
                  {bestSellers?.map((product) => (
                    <ProductElement1
                      src={product?.sources?.images.length > 0 ? product.sources.images[0]?.url : product.thumbUrl}
                      productName={product.name}
                      buttonLabel="Ver detalles"
                      onButtonClick={() => handleProduct(product)}
                      roundedCorner={true}
                    />
                  ))}
              </Slider>
            </div>
        </div>
      )}

      <ProductsGrid
        prixerUsername={null}
        buyState={props.buyState}
        addItemToBuyState={props.addItemToBuyState}
        setSelectedProduct={setSelectedProduct}
        setIsOpenAssociateArt={props.setIsOpenAssociateArt}
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

      <Grid className={styles['float']}>
        <FloatingAddButton
          setOpenArtFormDialog={setOpenArtFormDialog}
          setOpenShoppingCart={setOpenShoppingCart}
          setOpenServiceFormDialog={setOpenServiceFormDialog}
        />
      </Grid>

      {/* Associate art, it shouldn't be here. */}
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

      {/* Open Shopping Cart, it shouldn't be here. */}
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
    </div>
  )
}

export default ProductsCatalog;
