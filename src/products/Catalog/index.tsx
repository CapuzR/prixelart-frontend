import React, { useEffect, useState } from "react"

import CssBaseline from "@material-ui/core/CssBaseline"
import Dialog from "@material-ui/core/Dialog"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"

import useMediaQuery from "@material-ui/core/useMediaQuery"
import { useTheme } from "@material-ui/core/styles"
import { useHistory } from "react-router-dom"

import FloatingAddButton from "components/floatingAddButton/floatingAddButton"
import CreateService from "components/createService/createService"
import ArtUploader from "components/artUploader/artUploader"
import Grid from "components/Grid"
import ProductElement from "components/ProductElement"
import { Slider } from "components/Slider"
import SortingSelect from "components/SortingSelect"
import PaginationBar from "components/Pagination/PaginationBar"

import Card from "products/components/Card"
import CartReview from "cart/cartReview"

import { fetchBestSellers, fetchProducts } from '../api';


import Img from "react-cool-img"
import ReactGA from "react-ga"

import styles from './styles.module.scss';
import { CartItem, Product } from "products/interfaces"
import { useConversionRate, useCurrency } from "context/GlobalContext"

ReactGA.initialize("G-0RWP9B33D8")
ReactGA.pageview("/productos")

interface ProductsCatalogProps {
  buyState: CartItem[];
  pointedProduct: string | null;
  isOpenAssociateArt: boolean;
  selectedArtToAssociate?: { previous?: boolean; index?: number; item?: any };
  setPointedProduct: (productName: string) => void;
  addItemToBuyState: (item: any) => void;
  setIsOpenAssociateArt: (isOpen: boolean) => void;
  setSelectedArtToAssociate: (data: any) => void;
  changeQuantity: (item: any) => void;
  deleteItemInBuyState: (item: any) => void;
  deleteProductInItem: (item: any) => void;
  AssociateProduct: (data: { index: number; item: any; type: string }) => void;
}

const ProductsCatalog: React.FC<ProductsCatalogProps> = (props) => {
  const theme = useTheme()
  const history = useHistory()
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();

  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [bestSellers, setBestSellers] = useState<Product[] | undefined>(undefined);
  
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  
  const [currentPage, setCurrentPage] = useState(1);
  const [maxLength, setMaxLength] = useState(0);
  const [productsPerPage] = useState(10);
  const [sort, setSort] = useState("");
  
  // Pronto se moverá.
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false)
  const [createdService, setCreatedService] = useState(false);
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false)
  const [openShoppingCart, setOpenShoppingCart] = useState(false)
  
  const sortingOptions = [
    { value: "A-Z", label: "A-Z" },
    { value: "Z-A", label: "Z-A" },
    { value: "lowerPrice", label: "Menor precio" },
    { value: "maxPrice", label: "Mayor precio" },
  ];
  
  const handleProduct = async (product) => {
    props.setPointedProduct(product.name)
    document.getElementById(product.name)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  const handleChangeSort = (event) => {
    setSort(event.target.value)
  };
  
  const handleDetails = (product) => {
    history.push({
      pathname: "/",
      search: "?producto=" + product.id,
    })
    ReactGA.event({
      category: "Productos",
      action: "Ver_mas",
      label: product.name,
    })
  }  

  useEffect(() => {
    const getBestSellers = async () => {
      const bestSellers = await fetchBestSellers();
      setBestSellers(bestSellers);
    };
  
    getBestSellers();
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchProducts(sort, currentPage, productsPerPage);
        const { products, maxLength } = { products: response.products, maxLength: response.maxLength };
        setProducts(products);
        setMaxLength(maxLength);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchData();
  }, [sort, currentPage, productsPerPage]);

  return (
    <div className={styles['catalog']}>
      <CssBaseline />
      <div className={styles['title']}>
        <Typography variant="h4">
          <strong>Productos Prix</strong>
        </Typography>
      </div>

      {bestSellers && (
        <div className={styles['best-sellers']}>
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
                childConfig={ { qtyPerSlide: isDesktop ? 4 : isMobile ? 1 : 3, spacing: "sm" } }
                autoplay={false}
              >
                  {bestSellers?.map((product) => (
                    <ProductElement
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

      <div className={styles['grid-container']}>
            <div className={styles['search-bar']}>
              <div className={styles['sorting-select']}>
                <SortingSelect sort={sort} handleChange={handleChangeSort} options={sortingOptions} />
              </div>
            </div>
            <Grid isParent={true}>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <Grid key={product.id}>
                      <Card
                        product={product}
                        currency={currency}
                        conversionRate={conversionRate}
                        handleDetails={handleDetails}
                        pointedProduct={props.pointedProduct}
                      />
                    </Grid>
                  ))
                ) : (
                  <h1>Pronto encontrarás los productos ideales para ti.</h1>
                )}
            </Grid>
          </div>

          <PaginationBar 
            setPageNumber={setCurrentPage} 
            pageNumber={currentPage} 
            itemsPerPage={productsPerPage}
            maxLength={maxLength}
          />

      {/* Utility?, it shouldn't be here. */}
      {openArtFormDialog && (
        <ArtUploader
          openArtFormDialog={openArtFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
        />
      )}

      {/* Utility?, it shouldn't be here. */}
      {openServiceFormDialog && (
        <CreateService
          openArtFormDialog={openServiceFormDialog}
          setOpenServiceFormDialog={setOpenServiceFormDialog}
          setCreatedService={setCreatedService}
        />
      )}

      {/* Utility, it shouldn't be here. */}
      <Grid className={styles['float']}>
        <FloatingAddButton
          setOpenArtFormDialog={setOpenArtFormDialog}
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
          width: isDesktop ? 850 : "100%",
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
