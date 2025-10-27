import React from "react"

import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import {
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Typography,
} from "@mui/material"
import { Share as ShareIcon } from "@mui/icons-material"

import Button from "components/Button"

import { generateWaProductMessage } from "utils/utils"

import styles from "../Flow.module.scss"

import ItemCard from "components/ItemCard"
import ProductsCatalog from "apps/consumer/products/Catalog"
import { useCart } from "context/CartContext"
import CurrencySwitch from "components/CurrencySwitch"
import ArtsGrid from "@apps/consumer/art/components/ArtsGrid/ArtsGrid"
import Details from "@apps/consumer/products/Details/Details"
import { CartLine } from "../../../../types/cart.types"
import { Art } from "../../../../types/art.types"
import { Product } from "../../../../types/product.types"
import { Item } from "types/order.types"
import { useUser } from "@context/UIContext"
import Grid2 from "@mui/material/Grid"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"

interface LandscapeProps {
  item: Partial<Item>
  handleCart: (item: Item) => void
  handleChangeElement: (
    type: "producto" | "arte",
    item: Item,
    lineId?: string
  ) => void
  handleSelection?: (
    e: React.ChangeEvent<{ name: string; value: number }>
  ) => void
  isItemReady: boolean
  onArtSelect: (selectedArt: Art) => void
  onProductSelect: (selectedProduct: Product) => void
  selectedProductId?: string | null
  isProductAttributesComplete: boolean
  allAttributeNames: string[]
}

const Landscape: React.FC<LandscapeProps> = (props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const { cart } = useCart()
  const searchParams = new URLSearchParams(window.location.search)
  const lineId = searchParams.get("lineId")

  const handleCart = () => {
    if (!props.item.sku) {
      console.error("Item SKU is missing")
      return
    }
    props.handleCart(props.item as Item)
  }

  const productExists = Boolean(props.item?.product)
  const artExists = Boolean(props.item?.art)
  const showRightSide = !props.isItemReady

  const attributeNames = props.allAttributeNames

  return (
    <Grid2 className={styles["prix-product-container"]}>
      <Grid2
        container
        className={styles["first-row"]}
        sx={{ flexDirection: isMobile ? "column" : "row" }}
        padding={isMobile ? 2 : 6}
      >
        <Grid2
          size={{ sm: 12, md: 6 }}
          className={styles["first-row-title-container"]}
          sx={{
            margin: isMobile ? "1rem 0" : "auto",
            paddingLeft: isMobile ? 0 : "296px",
          }}
        >
          <Typography
            variant="h3"
            className={styles["product-title"]}
            sx={{ fontSize: "2.5rem", fontWeight: 600 }}
          >
            Crea tu Prix ideal
          </Typography>
        </Grid2>
        <Grid2
          size={{ sm: 12, md: 3 }}
          className={styles["buttons-container"]}
          sx={{ width: isMobile ? '100%' : "fit-content !important" }}
        >
          <Button
            type="onlyText"
            color="primary"
            onClick={(e) => {
              const currentUrl = window.location.href
              window.open(
                generateWaProductMessage(
                  props.item?.product! ? props.item.product! : props.item?.art!,
                  currentUrl
                ),
                "_blank"
              )
            }}
          >
            <ShareIcon className={styles["share-icon"]} /> Compartir
          </Button>
          <Button
            color="primary"
            disabled={!props.isItemReady}
            onClick={handleCart}
            highlighted={props.isItemReady}
          >
            {cart.lines.some((l: CartLine) => l.id === lineId)
              ? "Actualizar"
              : "Agregar al carrito"}
          </Button>
        </Grid2>
      </Grid2>

      <Grid2
        container
        className={styles["main-content"]}
        spacing={4}
        padding={isMobile ? 2 : 6}
      >
        <Grid2
          size={{ sm: 12, md: 6 }}
          sx={{ height: "fit-content" }}
          className={styles["left-side"]}
        >
          {(props.item.product || props.item.art) && (
            <ItemCard
              item={props.item as Item}
              direction={isMobile ? "row" : "column"}
              handleChangeElement={props.handleChangeElement}
            />
          )}
        </Grid2>

        {showRightSide && (
          <Grid2
            size={{ sm: 12, md: 6 }}
            className={styles["right-side"]}
            sx={{ height: isMobile ? "fit-content" : "80vh" }}
          >
            <Grid2 className={styles["right-side-bottom"]}>
              {/* <h2>
                {props.selectedProductId
                  ? "Detalles del producto:"
                  : productExists && !artExists
                    ? "Elige el arte:"
                    : !productExists && artExists
                      ? "Elige el producto:"
                      : productExists &&
                          artExists &&
                          !props.isProductAttributesComplete &&
                          attributeNames.length > 0
                        ? "Selecciona las opciones:" // Title when attribute selectors are shown
                        : ""}
              </h2> */}
              <Grid2 className={styles["art-selection-container"]}>
                <Grid2 className={styles["art-grid-wrapper"]}>
                  {props.selectedProductId &&
                  !props.isProductAttributesComplete ? (
                    <Details productId={props.selectedProductId} />
                  ) : productExists && !artExists ? (
                    <ArtsGrid onArtSelect={props.onArtSelect} />
                  ) : !productExists && artExists ? (
                    <ProductsCatalog onProductSelect={props.onProductSelect} />
                  ) : null}
                </Grid2>
              </Grid2>
            </Grid2>
          </Grid2>
        )}
      </Grid2>
    </Grid2>
  )
}

export default Landscape
