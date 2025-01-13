import { makeStyles, useTheme } from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import Collapse from "@material-ui/core/Collapse"
import Divider from "@material-ui/core/Divider"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import MenuItem from "@material-ui/core/MenuItem"
import OutlinedInput from "@material-ui/core/OutlinedInput"
import Select from "@material-ui/core/Select"
import InputLabel from "@material-ui/core/InputLabel"
import FormControl from "@material-ui/core/FormControl"
import Button from "@material-ui/core/Button"
// import Tooltip from "@material-ui/core/Tooltip";
import { Typography } from "@material-ui/core"
import TextField from "@material-ui/core/TextField"
import { useEffect, useState } from "react"
import axios from "axios"
import InfoIcon from "@material-ui/icons/Info"
import Tooltip from "@material-ui/core/Tooltip"
import {
  getPVP,
  getPVM,
  getTotalUnitsPVP,
  getTotalUnitsPVM,
  UnitPriceForOrg,
} from "./pricesFunctions"
import { useGlobalContext } from "../context/globalContext"

const useStyles = makeStyles((theme) => ({
  gridInput: {
    width: "100%",
    marginBottom: "12px",
  },
  textField: {
    marginRight: "8px",
  },
}))

export default function OrderForm(props) {
  const classes = useStyles()
  const theme = useTheme()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [previewVoucher, setPreviewVoucher] = useState()
  // const isIphone = useMediaQuery(theme.breakpoints.down("xs"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [balance, setBalance] = useState(0)
  const [discountList, setDiscountList] = useState([])
  const [sellers, setSellers] = useState([])
  const prixer = JSON.parse(localStorage?.getItem("token"))?.username
  const { currency, toggleCurrency, zone, toggleZone } = useGlobalContext()

  const getDiscounts = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/discount/read-allv2"
    await axios
      .post(base_url)
      .then((response) => {
        setDiscountList(response.data.discounts)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  useEffect(() => {
    getDiscounts()
    getPaymentMethod()
    getSellers()
  }, [])

  const checkOrgs = (art) => {
    const org = props.orgs?.find((el) => el.username === art.prixerUsername)
    return org
  }

  const getBalance = async () => {
    const url = process.env.REACT_APP_BACKEND_URL + "/account/readById"
    const data = { _id: JSON.parse(localStorage.getItem("token"))?.account }
    await axios
      .post(url, data)
      .then((response) => setBalance(response.data.balance))
  }

  const getPaymentMethod = () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/payment-method/read-all-v2"
    axios
      .get(base_url)
      .then((response) => {
        if (localStorage?.getItem("token")) {
          let prev = response.data
          prev.push({ name: "Balance Prixer" })
          setPaymentMethods(prev)
        } else {
          setPaymentMethods(response.data)
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }
  const getSellers = () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/admin/getSellers"
    axios.get(base_url).then((response) => {
      setSellers(response.data)
    })
  }

  useEffect(() => {
    if (
      JSON.parse(localStorage.getItem("token")) &&
      JSON.parse(localStorage.getItem("token")).username
    ) {
      getBalance()
    }
  }, [])

  const onImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      props.setPaymentVoucher(e.target.files[0])
      setPreviewVoucher(URL.createObjectURL(e.target.files[0]))
    }
  }

  const getTotalPrice = (state) => {
    const org = checkOrgs(item.art)
    const prixer = JSON.parse(localStorage?.getItem("token"))?.username

    if (org !== undefined) {
      return UnitPriceForOrg(
        item.product,
        item.art,
        prixer,
        org,
        "Particular"
      ).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    } else if (
      JSON.parse(localStorage?.getItem("token")) &&
      JSON.parse(localStorage?.getItem("token"))?.username
    ) {
      return getTotalUnitsPVM(
        state,
        currency,
        props.dollarValue,
        discountList,
        prixer
      ).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    } else {
      return getTotalUnitsPVP(
        state,
        currency,
        props.dollarValue,
        discountList
      ).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
  }
  const PriceSelect = (item) => {
    const org = checkOrgs(item.art)
    if (org !== undefined) {
      return (
        UnitPriceForOrg(item.product, item.art, prixer, org, "Particular") *
        (item.quantity || 1)
      ).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    } else if (
      JSON.parse(localStorage?.getItem("token")) &&
      JSON.parse(localStorage?.getItem("token"))?.username
    ) {
      let modifiedItem = item
      modifiedItem.product.prixerPrice = item.product.priceRange
      return (
        getPVM(item, currency, props.dollarValue, discountList, prixer) *
        item.quantity
      ).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    } else {
      let modifiedItem = item
      modifiedItem.product.publicPrice = item.product.priceRange
      return (
        Number(
          getPVP(item, currency, props.dollarValue, discountList)
          // .replace(/[,]/gi, ".")
        ) * item.quantity
      ).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
  }

  const getTotalCombinedItems = (state) => {
    const totalNotCompleted = state.filter((item) => !item.art || !item.product)
    return {
      totalNotCompleted,
    }
  }

  const getIvaCost = (state) => {
    if (
      typeof JSON.parse(localStorage?.getItem("token"))?.username === "string"
    ) {
      return 0
    } else {
      return (
        Number(
          getTotalPrice(state).replace(/[.]/gi, "").replace(/[,]/gi, ".")
        ) * 0.16
      )
    }
  }

  const getTotal = (x) => {
    let n = []
    n.push(
      Number(
        getTotalPrice(props.buyState).replace(/[.]/gi, "").replace(/[,]/gi, ".")
      )
    )
    n.push(getIvaCost(props.buyState))

    if (props.valuesConsumer.shippingMethod) {
      if (currency === "Bs") {
        let prev = shippingCost * props.dollarValue
        {
          n.push(prev)
        }
      } else {
        n.push(shippingCost)
      }
    }
    let total = n.reduce(function (a, b) {
      return a + b
    })
    return total.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  let shippingCost = Number(
    props.valuesConsumer.shippingMethod?.price.replace(/[$]/gi, "")
  )

  return (
    <>
      <form
        noValidate
        autoComplete="off"
      >
        <Grid container>
          <Grid
            item
            lg={12}
            md={12}
            sm={12}
            xs={12}
            className={classes.gridInput}
          >
            <AppBar
              position="static"
              style={{ borderRadius: 5 }}
            >
              <Toolbar style={{ fontSize: 20, justifyContent: "center" }}>
                Orden de compra
              </Toolbar>
            </AppBar>
            <div
              style={{
                display: "flex",
                padding: "8px",
                flexDirection: "column",
              }}
            >
              <div style={{ width: "100%" }}>
                <div style={{ fontWeight: "bold" }}>Items:</div>
                <div>
                  <List
                    component="div"
                    disablePadding
                  >
                    {props.buyState?.map((item, index) => (
                      <>
                        {item.product && item.art && (
                          <>
                            <ListItem>
                              <ListItemText primary={`#${index + 1}`} />
                            </ListItem>
                            <Collapse
                              in={true}
                              timeout="auto"
                              unmountOnExit
                            >
                              <List
                                component="div"
                                disablePadding
                              >
                                <ListItem>
                                  <ListItemText
                                    inset
                                    style={{ marginLeft: 0, paddingLeft: 0 }}
                                    primary={
                                      <Grid container>
                                        <Grid
                                          item
                                          xs={12}
                                          md={8}
                                        >
                                          Producto: {item.product.name}
                                          <br />
                                          Arte: {item.art.title}
                                        </Grid>
                                        <Grid
                                          item
                                          xs={12}
                                          md={4}
                                          style={{
                                            display: "flex",
                                            justifyContent: isMobile
                                              ? "space-between"
                                              : "",
                                          }}
                                        >
                                          <div>
                                            Cantidad:
                                            <br></br> {item.quantity || 1}
                                          </div>
                                          <div
                                            style={{
                                              textAlign: "end",
                                              paddingLeft: 10,
                                            }}
                                          >
                                            Monto:
                                            <br></br>
                                            {currency === "Bs" ? " Bs" : "$"}
                                            {PriceSelect(item)}
                                          </div>
                                        </Grid>
                                      </Grid>
                                    }
                                  />
                                </ListItem>
                              </List>
                            </Collapse>
                            <Divider />
                            {getTotalCombinedItems(props.buyState)
                              .totalNotCompleted?.length >= 1 && (
                              <Typography
                                style={{
                                  fontSize: "11px",
                                  // color: "primary",
                                }}
                              >
                                {getTotalCombinedItems(props.buyState)
                                  .totalNotCompleted?.length > 1
                                  ? `Faltan ${
                                      getTotalCombinedItems(props.buyState)
                                        .totalNotCompleted.length
                                    } productos por definir.`
                                  : `Falta 1 producto por definir.`}
                              </Typography>
                            )}
                          </>
                        )}
                      </>
                    ))}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Grid
                        item
                        lg={6}
                        md={6}
                        sm={6}
                        xs={6}
                        style={{ paddingLeft: 0 }}
                      >
                        <FormControl
                          variant="outlined"
                          fullWidth
                          style={{ marginTop: 25 }}
                          required
                        >
                          <InputLabel htmlFor="outlined-age-simple">
                            Método de pago
                          </InputLabel>
                          <Select
                            input={<OutlinedInput />}
                            value={props.orderPaymentMethod}
                            onChange={(event) =>
                              props.setOrderPaymentMethod(event.target.value)
                            }
                          >
                            {paymentMethods &&
                              paymentMethods.map((m) => (
                                <MenuItem value={m}>{m.name}</MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                        {/* {props.orderPaymentMethod && (
                          <>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <p align="left">
                                {props?.orderPaymentMethod?.instructions}
                                <br></br>
                                <br></br>
                                {props?.orderPaymentMethod?.paymentData}
                              </p>
                              <div>
                                {props.paymentVoucher && (
                                  <img
                                    src={previewVoucher}
                                    style={{ width: 200, borderRadius: 10 }}
                                  />
                                )}
                                <input
                                  type="file"
                                  id="inputfile"
                                  accept="image/jpeg, image/jpg, image/webp, image/png"
                                  onChange={onImageChange}
                                  style={{ display: "none" }}
                                />
                                <label htmlFor="inputfile">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    component="span"
                                    style={{ textTransform: "capitalize" }}
                                  >
                                    Cargar comprobante
                                  </Button>
                                </label>
                              </div>
                            </div>
                          </>
                        )} */}
                      </Grid>
                      <Grid
                        item
                        lg={6}
                        md={6}
                        sm={6}
                        xs={6}
                        style={{
                          display: "flex",
                          alignItems: "end",
                          marginTop: "24px",
                          marginRight: "14px",
                          flexDirection: "column",
                        }}
                      >
                        {props.orderPaymentMethod?.name ===
                          "Balance Prixer" && (
                          <div
                            style={{
                              backgroundColor: "#d33f49",
                              color: "white",
                              fontWeight: "thin",
                              borderRadius: 5,
                              paddingLeft: 5,
                              paddingRight: 5,
                            }}
                          >
                            {currency === "Bs"
                              ? "Saldo disponible: Bs" +
                                (balance * props.dollarValue).toLocaleString(
                                  "de-DE",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )
                              : "Saldo disponible: $" +
                                balance.toLocaleString("de-DE", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                          </div>
                        )}
                        <strong>
                          {currency === "Bs" ? "Subtotal: Bs" : "Subtotal: $"}
                          {getTotalPrice(props.buyState)}
                        </strong>
                        <strong>
                          {currency === "Bs" ? "IVA: Bs" : "IVA: $"}
                          {getIvaCost(props.buyState).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                        {props.valuesConsumer.shippingMethod &&
                        currency === "Bs" ? (
                          <strong>{`Envío: Bs${(
                            shippingCost * props.dollarValue
                          ).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`}</strong>
                        ) : (
                          props.valuesConsumer.shippingMethod && (
                            <strong>{`Envío: $${shippingCost.toLocaleString(
                              "de-DE",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}`}</strong>
                          )
                        )}
                        <strong>
                          {currency === "Bs" ? "Total: Bs" : "Total: $"}
                          {getTotal(props.buyState)}
                        </strong>
                        <br />
                      </Grid>
                    </div>
                    <Grid
                      item
                      lg={12}
                      md={12}
                      sm={12}
                      xs={12}
                      style={{ paddingLeft: 0, marginTop: 30 }}
                    >
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          marginTop: 25,
                          alignItems: "center",
                        }}
                      >
                        <Tooltip
                          // onClick={(e) => setOpenTooltip(!openTooltip)}
                          // open={openTooltip}
                          // onClose={(leaveDelay) => setOpenTooltip(false)}
                          title={
                            "¿Alguno de nuestros asesores te ayudó en el proceso de compra?"
                          }
                          style={{ marginLeft: 5, marginRight: 20 }}
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                        <FormControl
                          variant="outlined"
                          fullWidth
                          // style={{  }}
                          required
                        >
                          <InputLabel htmlFor="outlined-age-simple">
                            Asesor
                          </InputLabel>

                          <Select
                            input={<OutlinedInput />}
                            value={props.createdBy}
                            onChange={(event) =>
                              props.setSeller(event.target.value)
                            }
                          >
                            <MenuItem value={undefined}></MenuItem>
                            {sellers &&
                              sellers.map((m) => (
                                <MenuItem value={m}>{m}</MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </div>
                    </Grid>
                    <Grid
                      item
                      lg={12}
                      md={12}
                      sm={12}
                      xs={12}
                      style={{ paddingLeft: 0, marginTop: 30 }}
                    >
                      <TextField
                        variant="outlined"
                        label="Observaciones"
                        fullWidth
                        className={classes.textField}
                        value={props.observations}
                        onChange={(e) => props.setObservations(e.target.value)}
                      />
                    </Grid>
                  </List>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
      </form>
    </>
  )
}
