import Button from "components/Button"
import Typography from "@mui/material/Typography"
import Grid2 from "@mui/material/Grid"
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
import MDEditor from "@uiw/react-md-editor"

interface CardProps {
  product: Product
  currency: "USD" | "Bs"
  conversionRate: number
  handleDetails: (product: Product) => void
  isCart?: boolean
  onProductSelect?: (product: Product) => void
  isMobile: boolean
}
export default function Card({
  product,
  currency,
  conversionRate,
  handleDetails,
  isCart,
  onProductSelect,
  isMobile,
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

        const pricePromises = (product.variants ?? []).map(
          async (variant): Promise<[number, number] | null> => {
            const hasDiscount =
              Array.isArray(variant.discountId) && variant.discountId.length > 0

            if (hasDiscount && variant._id && product._id) {
              const fetchedPrices = await fetchVariantPrice(
                variant._id,
                product._id.toString()
              )
              return fetchedPrices
            } else {
              const priceNum = formatNumberString(variant[priceField])
              if (isNaN(priceNum)) return null
              return [priceNum, priceNum]
            }
          }
        )

        const results = await Promise.all(pricePromises)

        const validFinalPrices = results
          .filter(
            (result): result is [number, number] =>
              result !== null && !isNaN(result[1])
          )
          .map((result) => result[1])

        if (validFinalPrices.length === 0) {
          throw new Error("No se pudieron determinar los precios finales.")
        }

        const currentFinalMin = Math.min(...validFinalPrices)
        const currentFinalMax = Math.max(...validFinalPrices)

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

    const finalPriceString = formatRange(
      priceInfo.finalMin,
      priceInfo.finalMax,
      currency,
      conversionRate
    )

    const baseRangeDiffers =
      priceInfo.baseMin !== null &&
      (priceInfo.baseMin !== priceInfo.finalMin ||
        priceInfo.baseMax !== priceInfo.finalMax)

    if (baseRangeDiffers) {
      const basePriceString = formatRange(
        priceInfo.baseMin,
        priceInfo.baseMax,
        currency,
        conversionRate
      )

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
    <Grid2
      container
      className={`${styles["card-root"]}`}
      spacing={1.5}
      padding={3}
      id={product.name}
      style={
        isCart
          ? { flexDirection: "column", alignItems: "center" }
          : { flexDirection: isMobile ? "column" : "row" }
      }
    >
      <Grid2 size={{ xs: 12 }}>
        <Typography
          gutterBottom
          variant="h4"
          component="h3"
          className="truncate"
          sx={{ fontSize: "1.9rem" }}
        >
          {product.name.split("\r\n")[0]}
        </Typography>
      </Grid2>

      <Grid2 size={{ xs: 12, sm: 4 }}>
        <Slider images={product?.sources?.images?.filter(image => image?.url)}>
          {product?.sources?.images
            ?.filter((image) => image?.url) 
            .map((image, i) => (
              <Image key={i} src={image.url} alt={product?.name} />
            ))}
        </Slider>
      </Grid2>
      <Grid2 size={{ xs: 12, sm: 8 }}>
        <Grid2 className={styles["main-content"]}>
          <div data-color-mode="light" className={styles["modal-text"]}>
            <MDEditor.Markdown
              source={
                product.description
                  .split("\r\n")[0]
                  .replace(/(\*|_|~|`|\[|\]|\(|\)|#)/g, "").length > 60
                  ? `${product.description
                      .split("\r\n")[0]
                      .replace(/(\*|_|~|`|\[|\]|\(|\)|#)/g, "")
                      .slice(0, 65)}...`
                  : product.description
                      .split("\r\n")[0]
                      .replace(/(\*|_|~|`|\[|\]|\(|\)|#)/g, "")
              }
            />
          </div>
          <Typography
            gutterBottom
            // component="Grid2"
            style={{
              fontSize: 15,
              marginTop: "1rem",
              backgroundColor: "#fff",
              minHeight: "1.5em",
              ...(isCart ? { margin: 0 } : {}),
            }}
          >
            {renderPrice()}
          </Typography>
        </Grid2>
      </Grid2>
      <Grid2 size={{ xs: 12 }} className={styles["buttons-wrapper"]}>
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
            window.open(utils.generateWaProductMessage(product, url), "_blank")
          }}
        >
          <WhatsApp /> Info
        </Button>
      </Grid2>
    </Grid2>
  )
}
