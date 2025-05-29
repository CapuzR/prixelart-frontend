import Button from "components/Button"
import Typography from "@mui/material/Typography"
import { WhatsApp, AddShoppingCart } from "@mui/icons-material"
import { formatNumberString, formatRange } from "utils/formats"
import { Slider } from "components/Slider"
import { Image } from "components/Image"
import utils from "utils/utils.js"

import styles from "./styles.module.scss"
import { Product } from "../../../../../types/product.types"
import { queryCreator } from "@apps/consumer/flow/helpers"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { fetchVariantPrice } from "@api/product.api"
import { useUser } from "@context/GlobalContext"

interface CardProps {
  product: Product
  currency: "USD" | "Bs"
  conversionRate: number
  handleDetails: (product: Product) => void
  isCart?: boolean
  onProductSelect?: (product: Product) => void
}
export default function Card({
  product,
  currency,
  conversionRate,
  handleDetails,
  isCart,
  onProductSelect,
}: CardProps) {
  const navigate = useNavigate()
  const { user } = useUser()

  const [priceInfo, setPriceInfo] = useState<{
    baseMin: number | null
    baseMax: number | null
    finalMin: number | null
    finalMax: number | null
    isLoading: boolean
    error: string | null
  }>({
    baseMin: null,
    baseMax: null,
    finalMin: null,
    finalMax: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    if (!product?._id || !product.variants || product.variants.length === 0) {
      setPriceInfo({
        baseMin: null,
        baseMax: null,
        finalMin: null,
        finalMax: null,
        isLoading: false,
        error: "Producto sin variantes válidas.",
      })
      return
    }

    let isMounted = true
    const calculatePrices = async () => {
      setPriceInfo((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const priceField = user?.prixer ? "prixerPrice" : "publicPrice"
        const basePrices = (product.variants || [])
          .map((v) => formatNumberString(v[priceField]))
          .filter((p) => !isNaN(p))

        const currentBaseMin =
          basePrices.length > 0 ? Math.min(...basePrices) : null
        const currentBaseMax =
          basePrices.length > 0 ? Math.max(...basePrices) : null

        // --- Step 2: Fetch Final Prices (considering discounts) ---
        // Map variants to promises that resolve with [originalPrice, finalPrice]
        const pricePromises = (product.variants ?? []).map(
          async (variant): Promise<[number, number] | null> => {
            // Check if discountId array exists and is not empty
            const hasDiscount =
              Array.isArray(variant.discountId) && variant.discountId.length > 0

            if (hasDiscount && variant._id && product._id) {
              // Fetch potentially discounted price
              const fetchedPrices = await fetchVariantPrice(
                variant._id,
                product._id.toString()
              )
              // fetchVariantPrice now returns null on error/not found/parse failure
              return fetchedPrices
            } else {
              const priceNum = formatNumberString(variant[priceField])
              if (isNaN(priceNum)) return null // Invalid public price
              return [priceNum, priceNum] // Original and Final are the same
            }
          }
        )

        const results = await Promise.all(pricePromises)

        // Filter out null results (errors, invalid data) and extract final prices
        const validFinalPrices = results
          .filter(
            (result): result is [number, number] =>
              result !== null && !isNaN(result[1])
          ) // Ensure result exists and final price is a number
          .map((result) => result[1]) // Get the final price (index 1)

        if (validFinalPrices.length === 0) {
          throw new Error("No se pudieron determinar los precios finales.")
        }

        const currentFinalMin = Math.min(...validFinalPrices)
        const currentFinalMax = Math.max(...validFinalPrices)

        // Update state only if component is still mounted
        if (isMounted) {
          setPriceInfo({
            baseMin: currentBaseMin,
            baseMax: currentBaseMax,
            finalMin: currentFinalMin,
            finalMax: currentFinalMax,
            isLoading: false,
            error: null,
          })
        }
      } catch (err) {
        console.error("Error calculating product prices:", err)
        if (isMounted) {
          setPriceInfo({
            baseMin: null,
            baseMax: null,
            finalMin: null,
            finalMax: null,
            isLoading: false,
            error:
              err instanceof Error ? err.message : "Error al calcular precios.",
          })
        }
      }
    }

    calculatePrices()

    return () => {
      isMounted = false
    }
  }, [product, user])

  function handleProductSelection(): void {
    const queryString = queryCreator(
      undefined,
      product._id?.toString(),
      undefined,
      undefined
    )

    navigate(`/crear-prix?${queryString}`)
  }

  const renderPrice = () => {
    if (priceInfo.isLoading) {
      return "Cargando precio..."
    }
    if (priceInfo.error) {
      return "Precio no disponible"
    }
    if (priceInfo.finalMin === null) {
      return "Precio no disponible"
    }

    // Format the final price range
    const finalPriceString = formatRange(
      priceInfo.finalMin,
      priceInfo.finalMax,
      currency,
      conversionRate
    )

    // Check if the base range is valid and different from the final range
    const baseRangeDiffers =
      priceInfo.baseMin !== null &&
      (priceInfo.baseMin !== priceInfo.finalMin ||
        priceInfo.baseMax !== priceInfo.finalMax)

    if (baseRangeDiffers) {
      // Format the base price range
      const basePriceString = formatRange(
        priceInfo.baseMin,
        priceInfo.baseMax,
        currency,
        conversionRate
      )

      // Use dangerouslySetInnerHTML to render the strikethrough style
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: `
          <span style="text-decoration: line-through; opacity: 0.7; margin-right: 0.5em;">
            ${basePriceString}
          </span>
          <span>
            ${finalPriceString}
          </span>
        `,
          }}
        />
      )
    } else {
      // Only show the final price if base and final are the same or base is invalid
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: `<span>${finalPriceString}</span>`,
          }}
        />
      )
    }
  }

  return (
    <div
      className={`${styles["card-root"]}`}
      id={product.name}
      style={isCart ? { flexDirection: "column", alignItems: "center" } : {}}
    >
      <div className={styles["slider-container"]}>
        <Slider images={product?.sources?.images}>
          {product?.sources?.images?.map((image, i) => (
            <Image key={i} src={image.url} alt={product?.name} />
          ))}
        </Slider>
      </div>
      <div className={styles["card-content"]}>
        <div className={styles["main-content"]}>
          <Typography
            gutterBottom
            variant="h4"
            component="h3"
            className="truncate"
            sx={{ fontSize: "1.9rem" }}
          >
            {product.name.split("\r\n")[0]}
          </Typography>
          <p style={isCart ? { margin: 0 } : {}}>
            {product.description.split("\r\n")[0].length > 60
              ? `${product.description.split("\r\n")[0].slice(0, 65)}...`
              : `${product.description.split("\r\n")[0]}`}
          </p>
          {/* Price Display Area */}
          <Typography
            gutterBottom
            component="div"
            style={{
              fontSize: 15,
              marginTop: "1rem",
              backgroundColor: "#fff",
              minHeight: "1.5em",
              ...(isCart ? { margin: 0 } : {}),
            }}
          >
            {renderPrice()} {/* Call the render function */}
          </Typography>
        </div>
        <div className={styles["buttons-wrapper"]}>
          {!onProductSelect && (
            <Button onClick={() => handleProductSelection()}>
              <AddShoppingCart />
            </Button>
          )}
          <Button onClick={() => handleDetails(product)}>Detalles</Button>
          <Button
            type="onlyText"
            color="primary"
            className={styles["waButton"]}
            onClick={() => {
              const url = `${window.location}/producto/${product._id}`
              window.open(
                utils.generateWaProductMessage(product, url),
                "_blank"
              )
            }}
          >
            <WhatsApp /> Info
          </Button>
        </div>
      </div>
    </div>
  )
}
