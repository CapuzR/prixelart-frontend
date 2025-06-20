import React, { useState } from "react"
import DeleteIcon from "@mui/icons-material/Delete"
import styles from "./styles.module.scss"
import { useCart } from "context/CartContext"
import ActionBar from "./components/ActionBar"
import Typography from "components/Typography"
import ItemCard from "components/ItemCard"
import Grid2 from "@mui/material/Grid"

import { formatNumberString, formatSinglePrice } from "utils/formats"
import { useConversionRate, useCurrency } from "context/GlobalContext"
import { CartLine } from "../../../../types/cart.types"
import { Item } from "types/order.types"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"

interface LineCardProps {
  line: CartLine
  direction?: "row" | "column"
  handleChangeElement?: (
    type: "producto" | "arte",
    item: Item,
    lineId?: string
  ) => void
  checking?: boolean
}

export default function LineCard({
  line,
  direction = "row",
  handleChangeElement,
  checking,
}: LineCardProps) {
  const { deleteLineInCart, updateCartLine } = useCart()
  const { currency } = useCurrency()
  const { conversionRate } = useConversionRate()
  const [quantity, setQuantity] = useState<string | number>(line.quantity)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleDelete = () => {
    deleteLineInCart(line)
  }

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setQuantity(value ? Math.max(1, parseInt(value, 10)) : "")
  }

  const handleQuantityBlur = () => {
    const qty =
      typeof quantity === "string" ? parseInt(quantity, 10) || 1 : quantity

    setQuantity(qty)

    if (qty !== line.quantity) {
      updateCartLine(line.id, { quantity: qty })
    }
  }

  const getFormattedSubtotal = (): string | undefined => {
    const qtyNumber = parseInt(String(quantity), 10)
    const validQty = isNaN(qtyNumber) || qtyNumber < 1 ? 1 : qtyNumber

    const itemPriceNum = formatNumberString(line.item.price)

    const subtotalNum = validQty * itemPriceNum

    return formatSinglePrice(
      subtotalNum.toString(),
      currency,
      conversionRate,
      undefined
    )
  }

  return (
    <div className={`${styles["card-root"]}`} id={line.id}>
      <div
        // className={`${styles["card-content"]} ${styles[direction]}`}
        style={{
          padding: 16,
          flexDirection: isMobile ? "column" : "row",
          width: "100%",
          display: "flex",
        }}
      >
        <ItemCard
          item={line.item}
          direction="row"
          handleChangeElement={handleChangeElement}
          line={line}
        />
        {line.item.product && line.quantity !== undefined && (
          <Grid2
            container
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
              justifyContent: 'center',
              minWidth: 200
            }}
          >
            <Grid2 size={{ sm: 6, md: 12 }} className={styles["quantity"]}>
              <Typography level="h6">Cantidad</Typography>
              <input
                type="number"
                value={quantity} // Bind to state (can be string or number)
                onChange={handleQuantityChange}
                onBlur={handleQuantityBlur}
                className={styles["quantity-input"]}
                min="1" // HTML5 validation attribute
                disabled={checking}
              />
            </Grid2>

            <Grid2 size={{ sm: 6, md: 12 }} className={styles["subtotal"]}>
              <Typography level="h6">Subtotal</Typography>
              {/* Render the formatted HTML subtotal in a span */}
              <span
                dangerouslySetInnerHTML={{
                  __html: getFormattedSubtotal() || "",
                }}
              />
            </Grid2>
          </Grid2>
        )}
      </div>

      <ActionBar
        onUpperAction={!checking ? handleDelete : undefined}
        // onLowerAction={() => { }}
        upperIcon={<DeleteIcon className={styles["icon"]} />}
        // lowerIcon={<FileCopyIcon className={styles['icon']} />}
      />
    </div>
  )
}
