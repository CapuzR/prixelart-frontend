import React from "react"
import Grid from "components/Grid"
import { useCart } from "context/CartContext"
import useMediaQuery from "@mui/material/useMediaQuery"
import Typography from "components/Typography"
import styles from "./styles.module.scss"
import LineCard from "../Detail"
import { useNavigate } from "react-router-dom"
import { queryCreator } from "@apps/consumer/flow/helpers"
import { Button } from "@mui/material"
import { CartLine } from "../../../../types/cart.types"
import { Item } from "types/order.types"
import Grid2 from "@mui/material/Grid"
interface CartReviewProps {
  checking: boolean
}

const CartReview: React.FC<CartReviewProps> = ({ checking }) => {
  const { cart } = useCart()
  const navigate = useNavigate()
  const isMobile = useMediaQuery("(max-width: 600px)")

  const handleChangeElement = (
    type: "producto" | "arte",
    item: Item,
    lineId?: string
  ) => {
    const selectionAsObject: { [key: string]: string } = Array.isArray(
      item.product?.selection
    )
      ? item.product.selection.reduce(
          (acc, sel) => {
            acc[sel.name] = sel.value
            return acc
          },
          {} as { [key: string]: string }
        )
      : item.product?.selection || {}

    const queryString = queryCreator(
      lineId ? lineId : undefined,
      type === "producto" ? undefined : item.product?._id?.toString(),
      type === "arte" ? undefined : item.art?.artId?.toString(),
      selectionAsObject
    )
    navigate(`/crear-prix?${queryString}`)
  }

  return (
    <div className={styles["cart-container"]}>
      {!checking && (
        <>
          <div className={styles["cart-title-container"]}>
            <Typography level="h3" align="center" color="secondary">
              {isMobile ? "Carrito" : "Carrito de compras"}
            </Typography>
          </div>

          {cart.lines.length > 0 ? (
            <div className={styles["cart-grid-container"]}>
              <Grid2 container>
                {cart.lines.map((line: CartLine, index: number) => (
                  <LineCard
                    key={index}
                    direction="row"
                    line={line}
                    handleChangeElement={handleChangeElement}
                    checking={checking}
                  />
                ))}
              </Grid2>
            </div>
          ) : (
            <div className={styles["cart-grid-container"]}>
              <Typography level="h5" align="center">
                Tu carrito está vacío!
              </Typography>
            </div>
          )}

          <div className={styles["cart-add-more"]}>
            <Button
              variant="contained"
              color="primary"
              style={{
                color: "white",
                borderRadius: "8px",
                padding: "10px 20px",
                width: "80%",
                marginLeft: "10%",
                marginTop: "33px",
              }}
              onClick={() => navigate("/productos")}
            >
              {cart.lines.length > 0
                ? "Añadir Más Productos"
                : "Añadir Productos"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default CartReview
