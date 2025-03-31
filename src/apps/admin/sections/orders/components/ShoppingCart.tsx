import React, { useEffect, useState } from "react"
import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"
import { Theme, useTheme } from "@mui/material"
import { SelectChangeEvent } from "@mui/material/Select"
import { Typography } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"
import IconButton from "@mui/material/IconButton"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import DeleteIcon from "@mui/icons-material/Delete"
import FilterNoneIcon from "@mui/icons-material/FilterNone"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import Img from "react-cool-img"
import Tooltip from "@mui/material/Tooltip"
import oS from "../services"
import StarOutline from "@mui/icons-material/StarOutline"

import {
  UnitPrice,
  UnitPriceSug,
  getComission,
} from "../../../../consumer/checkout/pricesFunctions"
import { makeStyles } from "tss-react/mui"
import { useConversionRate, useCurrency, useSnackBar } from "@context/GlobalContext"
import { Discount } from "../../../../../types/discount.types"
import { Prixer } from "../../../../../types/prixer.types"
import { Art, PickedArt } from "../../../../../types/art.types"
import { Organization } from "../../../../../types/organization.types"
import {
  PickedProduct,
  Product,
  Selection,
} from "../../../../../types/product.types"
import { Surcharge } from "../../../../../types/surcharge.types"
import { Variant } from "aws-sdk/clients/iotsitewise"
import { useOrder } from "@context/OrdersContext"
import { getArts, getProducts } from "../api"
import { nanoid } from "nanoid"
import { OrderLine } from "@apps/consumer/checkout/interfaces"
import { Item } from "../../../../../types/item.types"
import { formatPriceForUI } from "@utils/formats"

interface CartProps {
  discounts: Discount[]
  selectedPrixer: Prixer
  orgs: Organization[]
  consumerType: string
  surcharges: Surcharge[]
}

const drawerWidth = 240

const useStyles = makeStyles()((theme: Theme) => {
  return {
    formControl: {
      minWidth: 120,
    },

    textField: {
      marginRight: "8px",
    },
  }
})

export default function ShoppingCart() {
  const { classes } = useStyles()

  const theme = useTheme()
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const adminToken = localStorage.getItem("adminToken")
  const adminData = adminToken ? JSON.parse(adminToken) : null
  const { showSnackBar } = useSnackBar()
  const { state, dispatch } = useOrder()
  const { order, surcharges, discounts, organizations } = state
  const { lines } = order

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [productList, setProductList] = useState<Product[]>([])
  const [artist, setArtist] = useState<string[]>([])
  const [artList, setArtList] = useState<Art[]>([])
  const [artList0, setArtList0] = useState<Art[]>([])
  const [selectedArtist, setSelectedArtist] = useState<string[]>([])
  const [prices, setPrices] = useState<number[]>([])

  let customArt: Art = {
    crops: [],
    points: 0,
    tags: [],
    visible: true,
    _id: "0000",
    artId: "none",
    title: "Personalizado",
    description: "",
    category: "",
    imageUrl: "/apple-touch-icon-180x180.png",
    largeThumbUrl: "/apple-touch-icon-180x180.png",
    squareThumbUrl: "/apple-touch-icon-180x180.png",
    userId: "",
    prixerUsername: "",
    status: "visble",
    artType: "Diseño",
    comission: 10,
    exclusive: "",
    owner: "",
    createdOn: new Date().toString(),
  }

  const readProducts = async () => {
    try {
      let products: Product[] = await getProducts()
      setProductList(products)
    } catch (error) {
      console.log(error)
    }
  }

  const readArts = async () => {
    try {
      const arts: Art[] = await getArts()
      arts.unshift(customArt)

      let artist: string[] = []

      arts.map((art) => {
        if (artist.includes(art.prixerUsername)) {
          return
        } else {
          artist.push(art.prixerUsername)
          let customv2 = customArt
          customv2.owner = art.prixerUsername
          customv2.prixerUsername = art.prixerUsername
          arts.push(customv2)
          setArtList(arts)
          setArtList0(arts)
        }
      })
      setArtist(artist)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    readProducts()
    readArts()
  }, [])

  useEffect(() => {
    let pricesList: number[] = []
    let artists = selectedArtist

    order.lines.map((line) => {
      if (line.item.art) {
        artists.push(line.item.art.prixerUsername)
      } else {
        return
      }
      if (line.item.art && line.item.product) {
        pricesList.push(
          UnitPrice(
            line.item.product,
            line.item.art,
            false,
            conversionRate,
            discounts,
            selectedPrixer?.username
          )
        )
      }
    })
    setPrices(pricesList)
    setSelectedArtist(artists)
  }, [])

  const changeArtistFilter = (artist: string, i: number) => {
    let artists = selectedArtist
    artists[i] = artist
    setSelectedArtist(artists)
  }

  const updatePrices = (
    index: number,
    prod: Product,
    art: Art,
    currency: boolean,
    conversionRate: number,
    discounts: Discount[],
    prixer: Prixer
  ) => {
    let selectedOrg = checkOrgs(art)

    if (prices.length === 0) {
      setPrices([
        UnitPriceSug(
          prod,
          art,
          currency,
          conversionRate,
          discounts,
          prixer,
          selectedOrg,
          props.consumerType
        ),
      ])
    } else if (index <= prices.length) {
      let prev = prices
      prev[index] = UnitPriceSug(
        prod,
        art,
        currency,
        conversionRate,
        discounts,
        prixer,
        selectedOrg,
        props.consumerType
      )
      setPrices(prev)
    } else {
      setPrices([
        ...prices,
        UnitPriceSug(
          prod,
          art,
          currency,
          conversionRate,
          discounts,
          prixer,
          selectedOrg,
          props.consumerType
        ),
      ])
    }
  }

  const removePrixer = (index: number) => {
    let artists = selectedArtist
    artists.splice(index, 1)
    setSelectedArtist(artists)
  }

  const checkOrgs = (art: PickedArt) => {
    if (art !== undefined) {
      const org = organizations?.find(
        (el) => el.username === art?.prixerUsername
      )
      return org
    }
  }

  const getCporg = (item: Item) => {
    if (item.art) {
      const org = organizations.find((el) => el.username === item.art?.owner)

      const applied = org?.agreement.appliedProducts.find(
        (el) => el === item.product._id
      )
      const varApplied = applied?.variants.find(
        (v) => v.name === item.product.selection
      )
      let percentage =
        item.product.selection !== undefined &&
        typeof item.product.selection === "string"
          ? varApplied?.cporg
          : applied?.cporg

      return percentage
    }
  }

  // const handleVariantProduct = (
  //   variant: string | Selection,
  //   index: number,
  //   item: any
  // ) => {
  //   let prod = item.product
  //   prod.selection = variant
  //   let selection
  //   if (
  //     variant !== "Personalizado" &&
  //     item.product.attributes.length > 1 &&
  //     item.product.name !== "Qrvo"
  //   ) {
  //     let name = typeof variant === "string" ? variant : variant.name
  //     let namev2
  //     if (name.length === 4) {
  //       namev2 = `${name[0]} ${name[1]} ${name[2]}`
  //     } else {
  //       namev2 = name[0]
  //     }
  //     let selectionv2 = item.product?.variants.find(
  //       (v) => v.name === namev2 && v.attributes[1].value === name[3]
  //     )
  //     prod.publicEquation = selectionv2?.publicPrice?.equation
  //     prod.prixerEquation = selectionv2?.prixerPrice?.equation
  //   } else if (variant !== "Personalizado") {
  //     selection = prod?.variants.find((v) => v.name === variant)
  //     prod.publicEquation = selection?.publicPrice?.equation
  //     prod.prixerEquation = selection?.prixerPrice?.equation
  //     let selectedOrg = checkOrgs(item.art)

  //     if (item.art) {
  //       prod.comission = getComission(
  //         prod,
  //         item.art,
  //         currency,
  //         conversionRate,
  //         discounts,
  //         item.quantity,
  //         selectedPrixer?.username,
  //         surcharges,
  //         selectedOrg,
  //         consumerType
  //       )

  //       prod.finalPrice = Number(
  //         UnitPriceSug(
  //           prod,
  //           item.art,
  //           false,
  //           1,
  //           discounts,
  //           selectedPrixer?.username,
  //           selectedOrg,
  //           consumerType
  //         )?.replace(/[,]/gi, ".")
  //       )
  //     }
  //   } else {
  //     prod.publicEquation = 0
  //   }

  //   AssociateProduct({
  //     index: index,
  //     item: prod,
  //     type: "product",
  //   })

  //   if (item.art) {
  //     updatePrices(
  //       index,
  //       prod,
  //       item.art,
  //       false,
  //       1,
  //       discounts,
  //       selectedPrixer?.username
  //     )
  //   }
  // }

  const modifyPrice = (id: string, newPrice: string) => {
    let existingLine = lines.find((line) => line.id === id)
    if (!existingLine) return

    existingLine.pricePerUnit = Number(newPrice.replace(/[,]/gi, "."))
    // item.product.modifyPrice = true
    // item.product.finalPrice = Number(newPrice.replace(/[,]/gi, "."))

    // const updatedPrices: string[] = prices.map((price, i) =>
    //   i === index ? newPrice.replace(/[,]/gi, ".") : price
    // )

    // setPrices(updatedPrices)
    // let selectedOrg = checkOrgs(item.art)

    // item.product.comission = getComission(
    //   item.product,
    //   item.art,
    //   currency,
    //   conversionRate,
    //   discounts,
    //   item.quantity,
    //   .selectedPrixer?.username,
    //   surcharges,
    //   selectedOrg,
    //   consumerType
    // )
    // purchase.splice(index, 1, item)
    // localStorage.setItem("order.lines", JSON.stringify(purchase))
    // setBuyState(purchase)
  }

  // const modifyVariant = (product, index, dimension, value) => {
  //   const purchase = props.order.lines
  //   let item = purchase[index]
  //   if (product.selection?.attributes) {
  //     let prev = product.selection.attributes[0].value
  //     let v2 = prev.split("x")
  //     if (dimension === "width") {
  //       product.selection.attributes = [
  //         {
  //           name: "Medida",
  //           value: `${value}x${v2[1]}`,
  //         },
  //       ]
  //     } else if (dimension === "height") {
  //       product.selection.attributes = [
  //         {
  //           name: "Medida",
  //           value: `${v2[0]}x${value}cm`,
  //         },
  //       ]
  //     }
  //   } else {
  //     let selection = { name: "Personalizado" }
  //     product.selection = selection

  //     if (dimension === "width") {
  //       product.selection.attributes = [
  //         {
  //           name: "Medida",
  //           value: `${value}x0cm`,
  //         },
  //       ]
  //     } else if (dimension === "height") {
  //       product.selection.attributes = [
  //         {
  //           name: "Medida",
  //           value: `0x${value}cm`,
  //         },
  //       ]
  //     }
  //   }
  //   let prev = product.selection?.attributes[0]?.value
  //   let v2 = prev.split("x")

  //   item.product = product
  //   purchase.splice(index, 1, item)
  //   localStorage.setItem("order.lines", JSON.stringify(purchase))
  //   props.setBuyState(purchase)
  // }

  const handleProduct = (event: SelectChangeEvent<string>) => {
    const selectedProduct = event.target.value
    let selectedProductFull = productList.find(
      (result) => result.name === selectedProduct
    )
    if (!selectedProductFull) return

    let newItem: Item = {
      sku: nanoid(6),
      product: selectedProductFull,
      price: 0,
    }

    let newOrderLine: OrderLine = {
      id: nanoid(6),
      item: newItem,
      quantity: 1,
      pricePerUnit: 0,
      subtotal: 0,
    }

    dispatch({
      type: "ADD_ORDER_LINE",
      payload: newOrderLine,
    })
    // props.addItemToBuyState({
    //   type: "product",
    //   item: selectedProduct,
    // })
  }

  const removeOrderLine = (id: string, index: number) => {
    dispatch({
      type: "REMOVE_ORDER_LINE",
      payload: id,
    })
    removePrixer(index)
  }

  const copyItem = (id: string) => {
    dispatch({
      type: "DUPLICATE_ORDER_LINE",
      payload: id,
    })
    // const cart = localStorage.getItem("order.lines")
    // let newState = JSON.parse(cart)
    // newState.push(newState[i])
    // setBuyState(newState)
    // localStorage.setItem("order.lines", JSON.stringify(newState))
    showSnackBar("Item duplicado correctamente.")

    // const prev = selectedArtist
    // const lastIndex = prev.length

    // setSelectedArtist([...selectedArtist, prev[i]])
  }

  const changeProduct = (
    event: SelectChangeEvent<string>,
    id: string,
    art?: PickedArt
  ) => {
    let selectedProduct = event.target.value
    let selectedProductFull = productList.find(
      (result) => result.name === selectedProduct
    )
    if (!selectedProductFull) return

    const existingLine = lines.find((line) => line.id === id)
    if (!existingLine) return

    const updatedLine = { ...existingLine, ...{ product: selectedProductFull } }

    dispatch({
      type: "UPDATE_ORDER_LINE",
      payload: updatedLine,
    })

    // let newItem: Item = {
    //   sku: nanoid(6),
    //   product: selectedProductFull,
    //   price: 0,
    // }

    // let newOrderLine: OrderLine = {
    //   id: nanoid(6),
    //   item: newItem,
    //   quantity: 1,
    //   pricePerUnit: 0,
    //   subtotal: 0,
    // }

    // setSelectedArtToAssociate({
    //   index,
    //   item: art,
    //   previous: true,
    // })

    if (art) {
      // selectedProductFull.comission = getComission(
      //   selectedProductFull,
      //   art,
      //   false,
      //   1,
      //   discounts,
      //   1,
      //   selectedPrixer?.username,
      //   surcharges,
      //   selectedOrg,
      //   consumerType
      // )
      // updatePrices(
      //   index,
      //   selectedProductFull,
      //   art,
      //   currency,
      //   conversionRate,
      //   discounts,
      //   selectedPrixer?.username
      // )
      // let selectedOrg = checkOrgs(art)
      // NOTE: clearly if Art is defined need to update price of the orderline
    }
  }

  const changeArt = async (e: SelectChangeEvent<string>, id: string) => {
    let selectedArt = e.target.value
    let selectedArtFull = artList.find((result) => result.artId === selectedArt)
    if (!selectedArtFull) return

    const existingLine = lines.find((line) => line.id === id)
    if (!existingLine) return

    const updatedLine = { ...existingLine, ...{ art: selectedArtFull } }

    dispatch({
      type: "UPDATE_ORDER_LINE",
      payload: updatedLine,
    })

    // const prod = order.lines[index]?.item.product
    let selectedOrg = checkOrgs(selectedArtFull)
    // let newPrice = UnitPriceSug(
    //   prod,
    //   art,
    //   false,
    //   conversionRate,
    //   discounts,
    //   selectedPrixer?.username,
    //   selectedOrg,
    //   consumerType
    // )
    // prod.finalPrice = Number(newPrice?.replace(/[,]/gi, "."))
    // prod.comission = getComission(
    //   prod,
    //   art,
    //   currency,
    //   conversionRate,
    //   discounts,
    //   1,
    //   selectedPrixer?.username,
    //   surcharges,
    //   selectedOrg,
    //   consumerType
    // )
    // setSelectedProductToAssociate({
    //   index,
    //   item: prod,
    //   previous: true,
    // })
    // AssociateProduct({
    //   index: index,
    //   item: prod,
    //   type: "product",
    // })
    // let selectedArt = art
    // let selectedArtFull = artList.find(
    //   (result) => result.artId === selectedArt.artId
    // )
    // AssociateProduct({
    //   index: index,
    //   item: art.title === "Personalizado" ? art : selectedArtFull,
    //   type: "art",
    // })

    // updatePrices(
    //   index,
    //   product,
    //   art,
    //   currency,
    //   conversionRate,
    //   discounts,
    //   selectedPrixer?.username
    // )

    // let prev = selectedArtist
    // prev.splice(index, 1, art.prixerUsername)
    // setSelectedArtist(prev)
  }

  const changeQuantity = (id: string, quantity: string) => {
    const existingLine = lines.find((line) => line.id === id)
    if (!existingLine) return

    const updatedLine = {
      ...existingLine,
      ...{ quantity: Number(quantity.replace(/[,]/gi, ".")) },
    }

    dispatch({
      type: "UPDATE_ORDER_LINE",
      payload: updatedLine,
    })
  }

  const getFinalPrice = (line: OrderLine) => {
    const qty = typeof line.quantity === 'string' ? 1 : line.quantity;
    return line.item.price
      ? formatPriceForUI(qty * line.item.price, currency, conversionRate)
      : undefined;
  };

  return (
    <Grid2 container style={{ display: "flex", justifyContent: "center" }}>
      {lines.length > 0 &&
        lines.map((line, index) => {
          return (
            <Grid2
              key={index}
              style={{
                height:
                  line.item.product?.selection?.name === "Personalizado"
                    ? 215
                    : 0,
                marginBottom: 20,
                width: "100%",
              }}
            >
              <Paper
                style={{
                  padding: 10,
                  marginTop: "2px",
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  height:
                    line.item.product?.selection?.name === "Personalizado"
                      ? 215
                      : 0,
                }}
                elevation={3}
              >
                <Grid2 size={{ xs: 5 }}>
                  <div
                    style={{
                      display: "flex",
                      height: 120,
                      marginRight: 20,
                      marginBottom: "-10px",
                    }}
                  >
                    <Img
                      placeholder="/imgLoading.svg"
                      style={{
                        backgroundColor: "#eeeeee",
                        height: 120,
                        borderRadius: "10px",
                        marginRight: "20px",
                        marginLeft: "20px",
                      }}
                      src={
                        (line.item.product?.sources?.images &&
                          line.item.product?.sources?.images[0]?.url) ||
                        line.item.product?.thumbUrl ||
                        ""
                      }
                      debounce={1000}
                      cache
                      error="/imgError.svg"
                      alt={line.item.product && line.item.product.name}
                      id={index}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                      }}
                    >
                      <FormControl
                        className={classes.formControl}
                        style={{
                          minWidth: 200,
                          marginBottom: 10,
                        }}
                      >
                        <InputLabel style={{ paddingLeft: 15 }}>
                          {line.item.product
                            ? "Producto"
                            : "Agrega un producto"}
                        </InputLabel>
                        <Select
                          id={"product " + index}
                          variant="outlined"
                          value={line.item.product.name}
                          onChange={(e) => {
                            changeProduct(e, line.id, line.item?.art)
                          }}
                        >
                          {productList[0] !== null &&
                            productList.map((product) => {
                              return (
                                <MenuItem value={product.name}>
                                  {product.name}
                                </MenuItem>
                              )
                            })}
                        </Select>
                      </FormControl>
                      {line.item.product?.variants.length > 0 && (
                        <FormControl
                          className={classes.formControl}
                          style={{ minWidth: 200 }}
                        >
                          <InputLabel style={{ paddingLeft: 15 }}>
                            {line.item.product?.attributes[0]?.name}
                          </InputLabel>
                          <Select
                            id={"variant " + index}
                            variant="outlined"
                            value={
                              line.item.product?.selection?.name ||
                              line.item.product?.selection
                            }
                            // NOTE: Solve this
                            // onChange={(e) => {
                            //   handleVariantProduct(
                            //     e.target.value,
                            //     index,
                            //     order.lines[index]
                            //   )
                            // }}
                          >
                            {/* {line.item.product.hasSpecialVar && (
                              <MenuItem value={custom.name}>
                                {custom.name}
                              </MenuItem>
                            )} */}
                            {productList
                              .find(
                                (product) =>
                                  product.name === line.item.product.name
                              )
                              ?.variants.map((a) => {
                                if (a.active === true)
                                  return (
                                    <MenuItem
                                      value={
                                        a.attributes[1] !== undefined
                                          ? a.name + " " + a.attributes[1].value
                                          : a.name
                                      }
                                    >
                                      {/* {a.name} */}
                                      {a.attributes[1] !== undefined
                                        ? a.name + " " + a.attributes[1].value
                                        : a.name}
                                    </MenuItem>
                                  )
                              })}
                          </Select>
                          {line.item.product?.selection?.name ===
                            // "Personalizado" ||
                            // line.item.product.selection ===
                            "Personalizado" && (
                            <div style={{ display: "flex", marginTop: "-5px" }}>
                              <TextField
                                variant="outlined"
                                label="Ancho"
                                className={classes.textField}
                                style={{ width: 100, marginRight: 10 }}
                                defaultValue={
                                  line.item.product.selection.attributes &&
                                  line.item.product?.selection?.attributes[0]
                                    ?.value
                                    ? line.item.product?.selection?.attributes[0]?.value?.split(
                                        "x"
                                      )[0]
                                    : 0
                                }
                                onChange={(e) =>
                                  modifyVariant(
                                    line.item.product,
                                    index,
                                    "width",
                                    e.target.value
                                  )
                                }
                                slotProps={{
                                  input: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        cm
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                                margin="normal"
                              />
                              <TextField
                                variant="outlined"
                                label="Alto"
                                className={classes.textField}
                                style={{ width: 100 }}
                                onChange={(e) =>
                                  modifyVariant(
                                    line.item.product,
                                    index,
                                    "height",
                                    e.target.value
                                  )
                                }
                                defaultValue={
                                  line.item.product.selection.attributes &&
                                  line.item.product?.selection?.attributes[0]
                                    ?.value
                                    ? line.item.product?.selection?.attributes[0]?.value
                                        ?.split("x")[1]
                                        .slice(0, -2)
                                    : 0
                                }
                                slotProps={{
                                  input: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        cm
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                                margin="normal"
                              />
                            </div>
                          )}
                        </FormControl>
                      )}

                      {props?.selectedPrixer?.username === undefined &&
                        typeof line.item.product.discount === "string" && (
                          <Typography
                            style={{ paddingTop: 5, fontSize: "12px" }}
                            color="secondary"
                          >
                            Este producto tiene aplicado un descuento de
                            {discounts?.find(
                              ({ _id }) => _id === line.item.product.discount
                            )?.type === "Porcentaje"
                              ? " %" +
                                discounts?.find(
                                  ({ _id }) =>
                                    _id === line.item.product.discount
                                )?.value
                              : discounts?.find(
                                  ({ _id }) =>
                                    _id === line.item.product.discount
                                )?.type === "Monto" &&
                                " $" +
                                  discounts?.find(
                                    ({ _id }) =>
                                      _id === line.item.product.discount
                                  )?.value}
                          </Typography>
                        )}

                      {line.item.art &&
                        surcharges.map((sur) => {
                          const prixerUsername = line.item?.art?.prixerUsername
                          const owner = line.item?.art?.owner

                          if (
                            (prixerUsername &&
                              sur.appliedUsers.includes(prixerUsername)) ||
                            (owner && sur.appliedUsers.includes(owner))
                          ) {
                            return (
                              <Typography
                                style={{ paddingTop: 5, fontSize: "12px" }}
                                color="secondary"
                              >
                                Este arte tiene aplicado un recargo de
                                {sur.type === "Porcentaje" &&
                                  " " + sur.value + "%"}
                                {sur.type === "Monto" && " $" + sur.value}
                                {sur.appliedPercentage === "ownerComission" &&
                                  " sobre la comisión del Prixer/Org"}
                              </Typography>
                            )
                          }
                        })}
                    </div>
                  </div>
                </Grid2>
                <Grid2 size={{ xs: 6 }} style={{ display: "flex" }}>
                  <div
                    style={{
                      backgroundColor: "#eeeeee",
                      width: 120,
                      height: 120,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 20,
                    }}
                  >
                    {line.item.art && (
                      <Img
                        placeholder="/imgLoading.svg"
                        style={{
                          backgroundColor: "#eeeeee",
                          maxWidth: 120,
                          maxHeight: 120,
                          borderRadius: 10,
                        }}
                        src={
                          line.item.art
                            ? line.item.art.title === "Personalizado"
                              ? "/apple-touch-icon-180x180.png"
                              : line.item.art?.squareThumbUrl
                            : ""
                        }
                        debounce={1000}
                        cache
                        error="/imgError.svg"
                        alt={line.item.art && line.item.art.title}
                        id={line.item.art && line.item.art?.artId}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <FormControl
                        className={classes.formControl}
                        style={{
                          marginBottom: 10,
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <InputLabel style={{ paddingLeft: 15 }}>
                          {line.item.art ? "Prixer" : "Selecciona un Prixer"}
                        </InputLabel>
                        <Select
                          value={selectedArtist[index]}
                          variant="outlined"
                          onChange={(e) =>
                            changeArtistFilter(e.target.value, index)
                          }
                          style={{ width: 180, marginRight: 10 }}
                        >
                          <MenuItem value={undefined}>Todos</MenuItem>
                          {artist.map((art) => {
                            return <MenuItem value={art}>{art}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                      <FormControl
                        className={classes.formControl}
                        style={{
                          marginBottom: 10,
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <InputLabel style={{ paddingLeft: 15 }}>
                          {line.item.art ? "Arte" : "Agrega un arte"}
                        </InputLabel>
                        <Select
                          value={line.item?.art?.title?.substring(0, 22)}
                          id={"Art " + index}
                          variant="outlined"
                          onChange={(e) => changeArt(e, line.id)}
                          style={{ width: 210 }}
                        >
                          {selectedArtist[index] !== undefined
                            ? artList0
                                .filter(
                                  (art) =>
                                    art.prixerUsername === selectedArtist[index]
                                )
                                .map((art) => {
                                  return (
                                    <MenuItem value={art.artId}>
                                      <Img
                                        placeholder="/imgLoading.svg"
                                        style={{
                                          backgroundColor: "#eeeeee",
                                          maxWidth: 40,
                                          maxHeight: 40,
                                          borderRadius: 3,
                                          marginRight: 10,
                                        }}
                                        src={art?.squareThumbUrl}
                                        debounce={1000}
                                        cache
                                        error="/imgError.svg"
                                        alt={art.title}
                                        id={art?.artId}
                                      />
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          width: "100%",
                                        }}
                                      >
                                        {art.title.substring(0, 22)}
                                        {art.comission > 10 && (
                                          <StarOutline
                                            style={{
                                              color: "#d33f49",
                                              marginLeft: "10px",
                                            }}
                                            fontSize="large"
                                          />
                                        )}
                                      </div>
                                    </MenuItem>
                                  )
                                })
                            : artList0.map((art) => {
                                return (
                                  <MenuItem value={art.artId}>
                                    <Img
                                      placeholder="/imgLoading.svg"
                                      style={{
                                        backgroundColor: "#eeeeee",
                                        maxWidth: 40,
                                        maxHeight: 40,
                                        borderRadius: 3,
                                        marginRight: 10,
                                      }}
                                      src={art?.squareThumbUrl}
                                      debounce={1000}
                                      cache
                                      error="/imgError.svg"
                                      alt={art.title}
                                      id={art?.artId}
                                    />
                                    {art.title.substring(0, 22)}
                                  </MenuItem>
                                )
                              })}
                        </Select>
                      </FormControl>
                    </div>
                    {line.item.art &&
                      line.item.art.title !== "Personalizado" && (
                        <>
                          <p
                            style={{
                              fontSize: "12px",
                              marginBottom: 10,
                              marginTop: -2,
                            }}
                          >
                            Arte: {line.item.art?.artId}
                          </p>
                          <Typography
                            style={{
                              fontSize: "12px",
                              marginBottom: 10,
                              marginTop: -2,
                            }}
                            color="secondary"
                          >
                            {(props?.selectedConsumer?.consumerType ===
                              "Prixer" &&
                              props?.selectedConsumer?.username ===
                                line.item.art.prixerUsername) ||
                            (props?.selectedConsumer?.consumerType ===
                              "Prixer" &&
                              props?.selectedConsumer?.username ===
                                line.item.art.owner &&
                              line.item.art !== undefined &&
                              line.item.product !== undefined)
                              ? "El cliente es el autor o propietario del arte, su comisión ha sido omitida."
                              : line.item.art !== undefined &&
                                line.item.product !== undefined &&
                                `Este arte tiene una comisión de 
                            ${checkOrgs(line.item.art) ? getCporg(line.item) : line.item.art.comission}% equivalente a $${
                              // typeof line.item.product.comission === "string" ||
                              // (typeof line.item.product.comission === "number" &&
                              // ? (
                              //     line.item.product?.comission / line.quantity
                              //   ).toLocaleString("de-DE", {
                              //     minimumFractionDigits: 2,
                              //     maximumFractionDigits: 2,
                              //   })
                              // : (
                              // (
                              //   getComission(
                              //     line.item,
                              //     line.item.art,
                              //     props.currency,
                              //     props.conversionRate,
                              //     props.discounts,
                              //     line.quantity,
                              //     props?.selectedPrixer?.username,
                              //     props.surcharges,
                              //     checkOrgs(line.art),
                              //     props.consumerType
                              //   ) / line.quantity
                              // ).toLocaleString("de-DE", {
                              //   minimumFractionDigits: 2,
                              //   maximumFractionDigits: 2,
                              // })
                              "XX"
                            }`}
                          </Typography>
                        </>
                      )}
                    {line.item.product && line.item.art && (
                      <Grid2
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <TextField
                          variant="outlined"
                          label={
                            line.item.product.selection
                              ? "Precio variante: " +
                                UnitPriceSug(
                                  line.item.product,
                                  line.item.art,
                                  currency,
                                  conversionRate,
                                  discounts,
                                  props?.selectedPrixer?.username,
                                  checkOrgs(line.item.art),
                                  props.consumerType
                                )
                              : "Precio base: " +
                                UnitPrice(
                                  line.item.product,
                                  line.item.art,
                                  false,
                                  conversionRate,
                                  discounts
                                  // props?.selectedPrixer?.username
                                )
                          }
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                            },
                          }}
                          style={{ width: 160, height: 80 }}
                          value={prices[index]}
                          onChange={(e) => {
                            modifyPrice(line.id, e.target.value)
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "end",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "25px",
                            }}
                          >
                            Cantidad:
                            <input
                              style={{
                                width: 80,
                                padding: "10px",
                                borderRadius: 4,
                              }}
                              type="number"
                              defaultValue={1}
                              value={line.quantity}
                              min="1"
                              // InputLabelProps={{
                              //   shrink: true,
                              // }}
                              onChange={(e) => {
                                changeQuantity(line.id, e.target.value)
                              }}
                            />
                          </div>
                        </div>
                      </Grid2>
                    )}
                  </div>
                </Grid2>
                <Grid2
                  size={{
                    xs: 1,
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "end",
                  }}
                >
                  <Tooltip
                    title="Duplicar item"
                    style={{ height: 40, width: 40 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => copyItem(line.id)}
                      sx={{ color: "gainsboro" }}
                    >
                      <FilterNoneIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title="Eliminar item"
                    style={{ height: 40, width: 40 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => {
                        removeOrderLine(line.id, index)
                      }}
                      sx={{ color: "gainsboro" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Grid2>
              </Paper>
            </Grid2>
          )
        })}
      <Grid2
        style={{
          width: "50%",
        }}
      >
        <Paper
          style={{
            padding: 10,
            marginTop: "2px",
            display: "flex",
            justifyContent: "center",
            flexDirection: isMobile ? "column" : "row",
          }}
          elevation={3}
        >
          <FormControl
            className={classes.formControl}
            style={{ width: "100%" }}
          >
            <InputLabel
              id="demo-simple-select-label"
              style={{ paddingLeft: 15 }}
            >
              Agrega un producto
            </InputLabel>
            <Select
              variant="outlined"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={""}
              onChange={handleProduct}
            >
              {productList.map((product, index) => {
                return <MenuItem value={product.name}>{product.name}</MenuItem>
              })}
            </Select>
          </FormControl>
        </Paper>
      </Grid2>
    </Grid2>
  )
}
