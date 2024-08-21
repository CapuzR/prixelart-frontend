import React, { useEffect, useState } from "react"
import axios from "axios"
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"
import { useTheme } from "@material-ui/core/styles"
import { makeStyles } from "@material-ui/core/styles"
import { Typography } from "@material-ui/core"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import IconButton from "@material-ui/core/IconButton"
import MenuItem from "@material-ui/core/MenuItem"
import Select from "@material-ui/core/Select"
import DeleteIcon from "@material-ui/icons/Delete"
import FilterNoneIcon from "@material-ui/icons/FilterNone"
import FormControl from "@material-ui/core/FormControl"
import InputLabel from "@material-ui/core/InputLabel"
import TextField from "@material-ui/core/TextField"
import InputAdornment from "@material-ui/core/InputAdornment"
import Img from "react-cool-img"
import Tooltip from "@material-ui/core/Tooltip"
import { getAttributes, getEquation } from "../../../products/services"
import StarOutline from "@material-ui/icons/StarOutline"

import x from "../../../apple-touch-icon-180x180.png"
import {
  UnitPrice,
  UnitPriceSug,
  getComission,
} from "../../../shoppingCart/pricesFunctions"
import { update } from "immutable"
const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  formControl: {
    // margin: theme.spacing(1),
    minWidth: 120,
  },
  form: {
    height: "auto",
    // padding: "15px",
  },
  gridInput: {
    display: "flex",
    width: "100%",
    marginBottom: "12px",
  },
  textField: {
    marginRight: "8px",
  },

  toolbar: {
    paddingRight: 24,
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "none",
    flexDirection: "column",
  },
  fixedHeight: {
    height: "auto",
    overflow: "none",
  },
  fab: {
    right: 0,
    position: "absolute",
  },
  paper2: {
    position: "absolute",
    width: "80%",
    maxHeight: "90%",
    overflowY: "auto",
    backgroundColor: "white",
    boxShadow: theme.shadows[2],
    padding: "16px 32px 24px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "justify",
    minWidth: 320,
    borderRadius: 10,
    marginTop: "12px",
    display: "flex",
    flexDirection: "row",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  base: {
    width: "70px",
    height: "37px",
    padding: "0px",
  },
  switchBase: {
    color: "silver",
    padding: "1px",
    "&$checked": {
      "& + $track": {
        backgroundColor: "silver",
      },
    },
  },
  thumb: {
    color: "#d33f49",
    width: "30px",
    height: "30px",
    margin: "2px",
    "&:before": {
      content: "'$'",
      fontSize: "18px",
      color: "white",
      display: "flex",
      marginTop: "3px",
      justifyContent: "center",
    },
  },
  thumbTrue: {
    color: "#d33f49",
    width: "30px",
    height: "30px",
    margin: "2px",
    "&:before": {
      content: "'Bs'",
      fontSize: "18px",
      color: "white",
      display: "flex",
      marginTop: "3px",
      justifyContent: "center",
    },
  },
  track: {
    borderRadius: "20px",
    backgroundColor: "silver",
    opacity: "1 !important",
    "&:after, &:before": {
      color: "black",
      fontSize: "18px",
      position: "absolute",
      top: "6px",
    },
    "&:after": {
      content: "'$'",
      left: "8px",
    },
    "&:before": {
      content: "'Bs'",
      right: "7px",
    },
  },
  checked: {
    color: "#d33f49 !important",
    transform: "translateX(35px) !important",
    padding: "1px",
  },
  snackbar: {
    [theme.breakpoints.down("xs")]: {
      bottom: 90,
    },
    margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      width: "25ch",
    },
  },
}))

export default function ShoppingCart(props) {
  const classes = useStyles()
  const theme = useTheme()

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [productList, setProductList] = useState([])
  const [artist, setArtist] = useState([])
  const [artList, setArtList] = useState([])
  const [artList0, setArtList0] = useState([])
  const [artistFilter, setArtistFilter] = useState()
  const [selectedArtist, setSelectedArtist] = useState([])
  const [prices, setPrices] = useState([])

  let custom = { name: "Personalizado", attributes: [{ value: "0x0cm" }] }

  const getProducts = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-all"
    await axios.get(base_url).then(async (response) => {
      let productsAttTemp1 = response.data.products
      await productsAttTemp1.map(async (p, iProd, pArr) => {
        productsAttTemp1 = await getEquation(p, iProd, pArr)
      })
      setProductList(
        getAttributes(productsAttTemp1).sort(function (a, b) {
          if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1
          }
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1
          }
          return 0
        })
      )
    })
  }

  const getArts = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/art/read-all"
    await axios.get(base_url).then((response) => {
      const arts = response.data.arts
      arts.unshift({ title: "Personalizado" })
      let artist = []
      arts.map((art) => {
        if (artist.includes(art.prixerUsername)) {
          return
        } else {
          artist.push(art.prixerUsername)
          arts.push({
            title: "Personalizado",
            owner: art.prixerUsername,
            prixerUsername: art.prixerUsername,
            comission: 10,
          })
          setArtList(arts)
          setArtList0(arts)
        }
      })
      setArtist(artist)
    })
  }

  useEffect(() => {
    getProducts()
    getArts()
  }, [])

  useEffect(() => {
    let pricesList = []
    let artists = selectedArtist

    props.buyState.map((item) => {
      if (item.art) {
        artists.push(item.art.prixerUsername)
      } else {
        artists.push(undefined)
      }
      if (item.art && item.product) {
        pricesList.push(
          UnitPrice(
            item.product,
            item.art,
            false,
            1,
            props.discountList,
            props?.selectedPrixer?.username
          )
        )
      }
    })
    setPrices(pricesList)
    setSelectedArtist(artists)
  }, [])

  const changeArtistFilter = (artist, i) => {
    setArtistFilter(artist)
    let artists = selectedArtist
    artists[i] = artist
    setSelectedArtist(artists)
  }

  const updatePrices = (
    index,
    prod,
    art,
    currency,
    dollarValue,
    discountList,
    prixer
  ) => {
    let selectedOrg = checkOrgs(art)

    if (prices.length === 0) {
      setPrices([
        UnitPriceSug(
          prod,
          art,
          currency,
          dollarValue,
          discountList,
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
        dollarValue,
        discountList,
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
          dollarValue,
          discountList,
          prixer,
          selectedOrg,
          props.consumerType
        ),
      ])
    }
  }

  const removePrixer = (index) => {
    let artists = selectedArtist
    artists.splice(index, 1)
    setSelectedArtist(artists)
  }

  const checkOrgs = (art) => {
    if (art !== undefined) {
      const org = props?.orgs?.find((el) => el.username === art?.prixerUsername)
      return org
    }
  }

  const getCporg = (item) => {
    const org = props?.orgs.find((el) => el.username === item.art.owner)

    const applied = org?.agreement.appliedProducts.find(
      (el) => el._id === item.product._id
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

  const changeArt = async (art, product, index) => {
    const prod = props.buyState[index]?.product
    let selectedOrg = checkOrgs(art)
    let newPrice = await UnitPriceSug(
      prod,
      art,
      false,
      props.dollarValue,
      props.discountList,
      props?.selectedPrixer?.username,
      selectedOrg,
      props.consumerType
    )
    prod.finalPrice = Number(newPrice?.replace(/[,]/gi, "."))
    prod.comission = getComission(
      prod,
      art,
      props.currency,
      props.dollarValue,
      props.discountList,
      1,
      props?.selectedPrixer?.username,
      props.surchargeList,
      selectedOrg,
      props.consumerType
    )
    props.setSelectedProductToAssociate({
      index,
      item: prod,
      previous: true,
    })
    props.AssociateProduct({
      index: index,
      item: prod,
      type: "product",
    })
    let selectedArt = art
    let selectedArtFull = artList.find(
      (result) => result.artId === selectedArt.artId
    )
    props.AssociateProduct({
      index: index,
      item: art.title === "Personalizado" ? art : selectedArtFull,
      type: "art",
    })
    setArtistFilter(undefined)

    updatePrices(
      index,
      product,
      art,
      props.currency,
      props.dollarValue,
      props.discountList,
      props?.selectedPrixer?.username
    )

    let prev = selectedArtist
    prev.splice(index, 1, art.prixerUsername)
    setSelectedArtist(prev)
  }

  const changeProduct = (event, art, index) => {
    props.setSelectedArtToAssociate({
      index,
      item: art,
      previous: true,
    })
    let selectedProduct = event.target.value
    let selectedProductFull = productList.find(
      (result) => result.name === selectedProduct
    )
    let selectedOrg = checkOrgs(art)

    if (art) {
      selectedProductFull.comission = getComission(
        selectedProductFull,
        art,
        false,
        1,
        props.discountList,
        1,
        props?.selectedPrixer?.username,
        props.surchargeList,
        selectedOrg,
        props.consumerType
      )

      updatePrices(
        index,
        selectedProductFull,
        art,
        props.currency,
        props.dollarValue,
        props.discountList,
        props?.selectedPrixer?.username
      )
    }
    props.AssociateProduct({
      index: index,
      item: selectedProductFull,
      type: "product",
    })
  }

  const handleVariantProduct = (variant, index, item) => {
    let prod = item.product
    prod.selection = variant
    let selection
    if (
      variant !== "Personalizado" &&
      item.product.attributes.length > 1 &&
      item.product.name !== "Qrvo"
    ) {
      let name = variant.split(" ")
      let namev2
      if (name.length === 4) {
        namev2 = `${name[0]} ${name[1]} ${name[2]}`
      } else {
        namev2 = name[0]
      }
      let selectionv2 = item.product?.variants.find(
        (v) => v.name === namev2 && v.attributes[1].value === name[3]
      )
      prod.publicEquation = selectionv2?.publicPrice?.equation
      prod.prixerEquation = selectionv2?.prixerPrice?.equation
    } else if (variant !== "Personalizado") {
      selection = prod?.variants.find((v) => v.name === variant)
      prod.publicEquation = selection?.publicPrice?.equation
      prod.prixerEquation = selection?.prixerPrice?.equation
      let selectedOrg = checkOrgs(item.art)

      if (item.art) {
        prod.comission = getComission(
          prod,
          item.art,
          props.currency,
          props.dollarValue,
          props.discountList,
          item.quantity,
          props?.selectedPrixer?.username,
          props.surchargeList,
          selectedOrg,
          props.consumerType
        )

        prod.finalPrice = Number(
          UnitPriceSug(
            prod,
            item.art,
            false,
            1,
            props.discountList,
            props?.selectedPrixer?.username,
            selectedOrg,
            props.consumerType
          )?.replace(/[,]/gi, ".")
        )
      }
    } else {
      prod.publicEquation = 0
    }

    props.AssociateProduct({
      index: index,
      item: prod,
      type: "product",
    })

    if (item.art) {
      updatePrices(
        index,
        prod,
        item.art,
        false,
        1,
        props.discountList,
        props?.selectedPrixer?.username
      )
    }
  }

  const modifyPrice = (index, newPrice) => {
    const purchase = props.buyState
    let item = purchase[index]
    item.product.modifyPrice = true
    item.product.finalPrice = Number(newPrice.replace(/[,]/gi, "."))

    const updatedPrices = prices.map((price, i) =>
      i === index ? newPrice.replace(/[,]/gi, ".") : price
    )
    setPrices(updatedPrices)
    let selectedOrg = checkOrgs(item.art)

    item.product.comission = getComission(
      item.product,
      item.art,
      props.currency,
      props.dollarValue,
      props.discountList,
      item.quantity,
      props?.selectedPrixer?.username,
      props.surchargeList,
      selectedOrg,
      props.consumerType
    )
    purchase.splice(index, 1, item)
    localStorage.setItem("buyState", JSON.stringify(purchase))
    props.setBuyState(purchase)
  }

  const modifyVariant = (product, index, dimension, value) => {
    const purchase = props.buyState
    let item = purchase[index]
    if (product.selection?.attributes) {
      let prev = product.selection.attributes[0].value
      let v2 = prev.split("x")
      if (dimension === "width") {
        product.selection.attributes = [
          {
            name: "Medida",
            value: `${value}x${v2[1]}`,
          },
        ]
      } else if (dimension === "height") {
        product.selection.attributes = [
          {
            name: "Medida",
            value: `${v2[0]}x${value}cm`,
          },
        ]
      }
    } else {
      let selection = { name: "Personalizado" }
      product.selection = selection

      if (dimension === "width") {
        product.selection.attributes = [
          {
            name: "Medida",
            value: `${value}x0cm`,
          },
        ]
      } else if (dimension === "height") {
        product.selection.attributes = [
          {
            name: "Medida",
            value: `0x${value}cm`,
          },
        ]
      }
    }
    let prev = product.selection?.attributes[0]?.value
    let v2 = prev.split("x")

    item.product = product
    purchase.splice(index, 1, item)
    localStorage.setItem("buyState", JSON.stringify(purchase))
    props.setBuyState(purchase)
  }

  const handleProduct = (event) => {
    let selectedProduct = event.target.value
    props.addItemToBuyState({
      type: "product",
      item: selectedProduct,
    })

    setSelectedArtist([...selectedArtist, undefined])
  }

  const copyItem = (i) => {
    let newState = JSON.parse(localStorage.getItem("buyState"))
    newState.push(newState[i])
    props.setBuyState(newState)
    localStorage.setItem("buyState", JSON.stringify(newState))
    props.setErrorMessage("Item duplicado correctamente.")
    props.setSnackBarError(true)

    const prev = selectedArtist
    const lastIndex = prev.length

    setSelectedArtist([...selectedArtist, prev[i]])
  }

  return (
    <Grid
      container
      style={{ display: "flex", justifyContent: "center" }}
    >
      {props.buyState.length > 0 &&
        props.buyState.map((buy, index) => {
          return (
            <Grid
              item
              xs={12}
              key={index}
              style={{
                height:
                  (buy.product?.selection?.name === "Personalizado" ||
                    buy.product?.selection === "Personalizado") &&
                  215,
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
                    (buy.product?.selection?.name === "Personalizado" ||
                      buy.product?.selection === "Personalizado") &&
                    215,
                }}
                elevation={3}
              >
                <Grid
                  item
                  xs={5}
                >
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
                        buy.product?.sources?.images[0]?.url ||
                        buy.product?.thumbUrl ||
                        ""
                      }
                      debounce={1000}
                      cache
                      error="/imgError.svg"
                      alt={buy.product && buy.product.name}
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
                          {buy.product ? "Producto" : "Agrega un producto"}
                        </InputLabel>
                        <Select
                          id={"product " + index}
                          variant="outlined"
                          value={buy.product.name}
                          onChange={(e) => {
                            changeProduct(e, buy.art, index)
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
                      {buy.product?.variants.length > 0 && (
                        <FormControl
                          className={classes.formControl}
                          style={{ minWidth: 200 }}
                        >
                          <InputLabel style={{ paddingLeft: 15 }}>
                            {buy.product?.attributes[0]?.name}
                          </InputLabel>
                          <Select
                            id={"variant " + index}
                            variant="outlined"
                            value={
                              props.buyState[index].product?.selection?.name ||
                              props.buyState[index].product?.selection
                            }
                            onChange={(e) => {
                              handleVariantProduct(
                                e.target.value,
                                index,
                                props.buyState[index]
                              )
                            }}
                          >
                            {buy.product.hasSpecialVar && (
                              <MenuItem value={custom.name}>
                                {custom.name}
                              </MenuItem>
                            )}
                            {productList
                              .find(
                                (product) => product.name === buy.product.name
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
                          {(buy.product?.selection?.name === "Personalizado" ||
                            buy.product.selection === "Personalizado") && (
                            <div style={{ display: "flex", marginTop: "-5px" }}>
                              <TextField
                                variant="outlined"
                                label="Ancho"
                                className={classes.textField}
                                style={{ width: 100, marginRight: 10 }}
                                defaultValue={
                                  buy.product.selection.attributes &&
                                  buy.product?.selection?.attributes[0]?.value
                                    ? buy.product?.selection?.attributes[0]?.value?.split(
                                        "x"
                                      )[0]
                                    : 0
                                }
                                onChange={(e) =>
                                  modifyVariant(
                                    buy.product,
                                    index,
                                    "width",
                                    e.target.value
                                  )
                                }
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      cm
                                    </InputAdornment>
                                  ),
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
                                    buy.product,
                                    index,
                                    "height",
                                    e.target.value
                                  )
                                }
                                defaultValue={
                                  buy.product.selection.attributes &&
                                  buy.product?.selection?.attributes[0]?.value
                                    ? buy.product?.selection?.attributes[0]?.value
                                        ?.split("x")[1]
                                        .slice(0, -2)
                                    : 0
                                }
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      cm
                                    </InputAdornment>
                                  ),
                                }}
                                margin="normal"
                              />
                            </div>
                          )}
                        </FormControl>
                      )}

                      {props?.selectedPrixer?.username === undefined &&
                        props.discountList !== undefined &&
                        props.discountList !== null &&
                        typeof buy.product.discount === "string" && (
                          <Typography
                            variant="p"
                            style={{ paddingTop: 5, fontSize: "12px" }}
                            color="secondary"
                          >
                            Este producto tiene aplicado un descuento de
                            {props.discountList?.find(
                              ({ _id }) => _id === buy.product.discount
                            )?.type === "Porcentaje"
                              ? " %" +
                                props.discountList?.find(
                                  ({ _id }) => _id === buy.product.discount
                                ).value
                              : props.discountList?.find(
                                  ({ _id }) => _id === buy.product.discount
                                )?.type === "Monto" &&
                                " $" +
                                  props.discountList?.find(
                                    ({ _id }) => _id === buy.product.discount
                                  ).value}
                          </Typography>
                        )}

                      {buy.art &&
                        props.surchargeList.length > 0 &&
                        props.surchargeList.map((sur) => {
                          if (
                            sur.appliedUsers.includes(buy.art.prixerUsername) ||
                            sur.appliedUsers.includes(buy.art.owner)
                          ) {
                            return (
                              <Typography
                                variant="p"
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
                </Grid>
                <Grid
                  item
                  xs={6}
                  style={{ display: "flex" }}
                >
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
                    {buy.art && (
                      <Img
                        placeholder="/imgLoading.svg"
                        style={{
                          backgroundColor: "#eeeeee",
                          maxWidth: 120,
                          maxHeight: 120,
                          borderRadius: 10,
                        }}
                        src={
                          buy.art
                            ? buy.art.title === "Personalizado"
                              ? x
                              : buy.art?.squareThumbUrl
                            : ""
                        }
                        debounce={1000}
                        cache
                        error="/imgError.svg"
                        alt={buy.art && buy.art.title}
                        id={buy.art && buy.art?.artId}
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
                          {buy.art ? "Prixer" : "Selecciona un Prixer"}
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
                          {artist !== "" &&
                            artist.map((art) => {
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
                          {buy.art ? "Arte" : "Agrega un arte"}
                        </InputLabel>
                        <Select
                          value={buy?.art?.title?.substring(0, 22)}
                          id={"Art " + index}
                          variant="outlined"
                          onChange={(e) =>
                            changeArt(e.target.value, buy.product, index)
                          }
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
                                    <MenuItem value={art}>
                                      <Img
                                        placeholder="/imgLoading.svg"
                                        style={{
                                          backgroundColor: "#eeeeee",
                                          maxWidth: 40,
                                          maxHeight: 40,
                                          borderRadius: 3,
                                          marginRight: 10,
                                        }}
                                        src={
                                          art.title === "Personalizado"
                                            ? x
                                            : art?.squareThumbUrl
                                        }
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
                                  <MenuItem value={art}>
                                    <Img
                                      placeholder="/imgLoading.svg"
                                      style={{
                                        backgroundColor: "#eeeeee",
                                        maxWidth: 40,
                                        maxHeight: 40,
                                        borderRadius: 3,
                                        marginRight: 10,
                                      }}
                                      src={
                                        art.title === "Personalizado"
                                          ? x
                                          : art?.squareThumbUrl
                                      }
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
                    {buy.art && buy.art.title !== "Personalizado" && (
                      <>
                        <p
                          style={{
                            fontSize: "12px",
                            marginBottom: 10,
                            marginTop: -2,
                          }}
                        >
                          Arte: {buy.art?.artId}
                        </p>
                        <Typography
                          variant="p"
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
                              buy.art.prixerUsername) ||
                          (props?.selectedConsumer?.consumerType === "Prixer" &&
                            props?.selectedConsumer?.username ===
                              buy.art.owner &&
                            buy.art !== undefined &&
                            buy.product !== undefined)
                            ? "El cliente es el autor o propietario del arte, su comisión ha sido omitida."
                            : buy.art !== undefined &&
                              buy.product !== undefined &&
                              `Este arte tiene una comisión de 
                            ${
                              checkOrgs(buy.art)
                                ? getCporg(buy)
                                : buy.art.comission
                            }% equivalente a $${
                                // typeof buy.product.comission === "string" ||
                                // (typeof buy.product.comission === "number" &&
                                // ? (
                                //     buy.product?.comission / buy.quantity
                                //   ).toLocaleString("de-DE", {
                                //     minimumFractionDigits: 2,
                                //     maximumFractionDigits: 2,
                                //   })
                                // : (
                                (
                                  getComission(
                                    buy.product,
                                    buy.art,
                                    props.currency,
                                    props.dollarValue,
                                    props.discountList,
                                    buy.quantity,
                                    props?.selectedPrixer?.username,
                                    props.surchargeList,
                                    checkOrgs(buy.art),
                                    props.consumerType
                                  ) / buy.quantity
                                ).toLocaleString("de-DE", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              }`}
                        </Typography>
                      </>
                    )}
                    {buy.product && buy.art && (
                      <Grid
                        item
                        xs
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <TextField
                          variant="outlined"
                          label={
                            buy.product.selection
                              ? "Precio variante: " +
                                UnitPriceSug(
                                  buy.product,
                                  buy.art,
                                  props.currency,
                                  props.dollarValue,
                                  props.discountList,
                                  props?.selectedPrixer?.username,
                                  checkOrgs(buy.art),
                                  props.consumerType
                                )
                              : "Precio base: " +
                                UnitPrice(
                                  buy.product,
                                  buy.art,
                                  props.currency,
                                  props.dollarValue,
                                  props.discountList,
                                  props?.selectedPrixer?.username
                                )
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          }}
                          style={{ width: 160, height: 80 }}
                          value={prices[index]}
                          onChange={(e) => {
                            modifyPrice(index, e.target.value)
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
                              value={buy.quantity}
                              min="1"
                              InputLabelProps={{
                                shrink: true,
                              }}
                              onChange={(e) => {
                                props.changeQuantity({
                                  index,
                                  art: buy.art,
                                  product: buy.product,
                                  quantity: e.target.value,
                                  prixer: props?.selectedPrixer?.username,
                                  consumerType: props.consumerType,
                                })
                              }}
                            />
                          </div>
                        </div>
                      </Grid>
                    )}
                  </div>
                </Grid>
                <Grid
                  item
                  xs={1}
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
                      onClick={() => copyItem(index)}
                      color="gainsboro"
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
                        props.deleteItemInBuyState({ id: index })
                        removePrixer(index)
                      }}
                      color="gainsboro"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Paper>
            </Grid>
          )
        })}
      <Grid
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
              {productList !== "" &&
                productList.map((product, index) => {
                  return <MenuItem value={product}>{product.name}</MenuItem>
                })}
            </Select>
          </FormControl>
        </Paper>
      </Grid>
    </Grid>
  )
}
