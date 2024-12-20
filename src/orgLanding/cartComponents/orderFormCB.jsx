import { makeStyles, useTheme } from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
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
import { Typography } from "@material-ui/core"
import TextField from "@material-ui/core/TextField"
import { useEffect, useState } from "react"
import axios from "axios"
import { useGlobalContext } from "../../context/globalContext"
import ShippingData from "../../shoppingCart/shippingData.json"

const useStyles = makeStyles((theme) => ({
  gridInput: {
    width: "100%",
    marginBottom: "12px",
  },
  textField: {
    marginRight: "8px",
  },
}))

export default function OrderFormCB(props) {
  const classes = useStyles()
  const { currency, toggleCurrency, zone, toggleZone } = useGlobalContext()

  const theme = useTheme()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [previewVoucher, setPreviewVoucher] = useState()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [balance, setBalance] = useState(0)

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
  }, [])

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

  useEffect(() => {
    getPaymentMethod()
  }, [])

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

  const getSubtotal = (state) => {
    let prices = [0]

    state.map((item) => {
      if (zone === "INTER") {
        prices.push(item.product.interPrice * (item.quantity || 1))
      } else {
        prices.push(item.product.finalPrice * (item.quantity || 1))
      }
    })

    let total = prices?.reduce(function (a, b) {
      return a + b
    })
    props.setSubtotal(total)
    if (props.currency) {
      return total * props.dollarValue
    } else return total
  }

  const getTotalCombinedItems = (state) => {
    const totalNotCompleted = state.filter((item) => !item.art || !item.product)
    return {
      totalNotCompleted,
    }
  }

  const getTotal = (x) => {
    let n = []
    n.push(Number(getSubtotal(props.buyState)))

    if (props.valuesConsumer.shippingMethod) {
      if (props.currency) {
        let prev = shippingCost * props.dollarValue
        {
          n.push(prev)
        }
      } else {
        n.push(shippingCost)
      }
    }
    if (zone === "INTER") {
      n.push(tax)
    }
    let total = n.reduce(function (a, b) {
      return a + b
    })
    props.setTotal(total)
    return total.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  let shippingCost = Number(
    props.valuesConsumer?.shippingMethod
      ? props.valuesConsumer?.shippingMethod?.price?.replace(/[$]/gi, "")
      : 0
  )

  const getShippingCost = () => {
    let selectedCountry = ShippingData.find(
      (item) => item.country === props.valuesConsumer?.country
    )

    const isTshirt = props.buyState.filter(
      (item) => item.product.name === "Franela"
    )
    const isCup = props.buyState.filter(
      (item) => item.product.name === "Taza de Peltre"
    )

    let cost = [0]

    const countTshirts =
      isTshirt.reduce((sum, item) => sum + item.quantity, 0) - 1
    const countCups = isCup.reduce((sum, item) => sum + item.quantity, 0) - 1

    if (isTshirt.length > 0) {
      cost.push(selectedCountry.shirtCost)
      if (countTshirts > 0) {
        cost.push(countTshirts * selectedCountry.shirtExtra)
      }
    }

    if (isCup.length > 0) {
      cost.push(selectedCountry.cupCost)
      if (countCups > 0) {
        cost.push(countCups * selectedCountry.cupExtra)
      }
    }

    if (zone === "INTER") {
      shippingCost = cost.reduce(function (a, b) {
        return a + b
      })
    }
  }

  let tax = 0

  const getTax = () => {
    let selectedCountry = ShippingData.find(
      (item) => item.country === props.valuesConsumer?.country
    )

    const isTshirt = props.buyState.filter(
      (item) => item.product.name === "Franela"
    )
    const isCup = props.buyState.filter(
      (item) => item.product.name === "Taza de Peltre"
    )

    const countTshirts = isTshirt.reduce((sum, item) => sum + item.quantity, 0)
    const countCups = isCup.reduce((sum, item) => sum + item.quantity, 0)

    let tx = [0]

    if (isTshirt) {
      tx.push(countTshirts * selectedCountry.shirtTax)
    } else if (isCup) {
      tx.push(countCups * selectedCountry.cupTax)
    }
    if (zone === "INTER") {
      tax = tx.reduce(function (a, b) {
        return a + b
      })
    }
  }

  useEffect(() => {
    if (zone === "INTER") {
      getShippingCost()
      getTax()
    } else {
      shippingCost = Number(
        props.valuesConsumer?.shippingMethod
          ? props.valuesConsumer?.shippingMethod?.price?.replace(/[$]/gi, "")
          : 0
      )
      tax = 0
    }
  }, [zone])

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
                                          {item.product.name +
                                            " X " +
                                            item.art.title.substring(0, 27)}
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
                                            {props.currency ? " Bs" : "$"}
                                            {zone === "INTER"
                                              ? Number(
                                                  item.product.interPrice *
                                                    item.quantity
                                                ).toLocaleString("de-DE", {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                                })
                                              : Number(
                                                  item.product.finalPrice *
                                                    item.quantity
                                                ).toLocaleString("de-DE", {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                                })}
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
                        {props.orderPaymentMethod && (
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
                        )}
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
                            {props.currency
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
                          {props.currency ? "Subtotal: Bs" : "Subtotal: $"}
                          {getSubtotal(props.buyState).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                        {props.valuesConsumer.shippingMethod &&
                        props.currency ? (
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
                          {props.currency
                            ? `Impuestos: Bs ${tax * props.dollarValue}`
                            : `Impuestos: $${tax}`}
                        </strong>
                        <strong>
                          {props.currency ? "Total: Bs" : "Total: $"}
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
                      <Typography
                        style={{
                          fontSize: "11px",
                          color: "gray",
                          margin: "0 16px",
                          textAlign: "center",
                        }}
                      >
                        {
                          "El cálculo del envío y los impuestos son refrenciales y está sujeto a cambios."
                        }
                        <br />
                        {
                          "Un asesor de ventas se pondrá en contacto para concretar la compra."
                        }
                      </Typography>
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
