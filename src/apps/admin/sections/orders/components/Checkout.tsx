import { useEffect, useState } from "react"
import axios from "axios"
import Grid2 from "@mui/material/Grid2"
import Typography from "@mui/material/Typography"
import useMediaQuery from "@mui/material/useMediaQuery"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Collapse from "@mui/material/Collapse"
import Divider from "@mui/material/Divider"

import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import {
  UnitPrice,
  getPVP,
  getPVM,
  getTotalUnitsPVM,
  getTotalUnitsPVP,
} from "../../../../consumer/checkout/pricesFunctions.js"
import CurrencySwitch from "components/CurrencySwitch"
import { Theme, useTheme } from "@mui/material"
import { makeStyles } from "tss-react/mui/mui.js"
import { useConversionRate, useCurrency } from "@context/GlobalContext.js"
import { PaymentMethod } from "../../../../../types/paymentMethod.types.js"
import { useOrder } from "@context/OrdersContext.js"
import React from "react"

interface CheckoutProps {
  loadingOrder: boolean
  createOrder: () => void
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
    formControl: {
      minWidth: 120,
    },
  }
})

export default function Checkout(
  {
  loadingOrder,
  createOrder
}: CheckoutProps
) {
  const {classes} = useStyles()
  const theme = useTheme()
  const { state, dispatch } = useOrder()
  const { order, discounts, prixers } = state
  const { consumerDetails, shipping, billing } = order //Datos básicos, de envío y de facturación
  const { basic } = consumerDetails
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  // const [prixers, setPrixers] = useState<Prixer[]>([])

  const handleEditorChange = (value: string) => {
    dispatch({
      type: "SET_OBSERVATIONS",
      payload: value,
    })
  }

  let shippingCost = Number(shipping?.method?.price)

  // const setCertified = (i: number, data: string, p: string) => {
  //   const kart = [...buyState]
  //   const item = {
  //     ...kart[i],
  //     art: { ...kart[i].art, certificate: { ...kart[i].art.certificate } },
  //   }
  //   item.art.certificate[p] = data
  //   kart[i] = item
  //   setBuyState(kart)
  // }

  useEffect(() => {
    const base_url =
      import.meta.env.VITE_BACKEND_URL + "/payment-method/read-all-v2"
    axios
      .get(base_url)
      .then((response) => {
        let prev = response.data
        if (selectedPrixer) {
          prev.unshift({ name: "Balance Prixer" })
        }
        setPaymentMethods(prev)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [selectedPrixer])

  const getTotal = (x) => {
    let n = []
    n.push(Number(getTotalPrice(buyState).replace(/[,]/gi, ".")))
    n.push(getIvaCost(buyState))
    {
      shippingData?.shippingMethod && n.push(shippingCost)
    }
    let total = n.reduce(function (a, b) {
      return a + b
    })
    return total.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const getIvaCost = (state) => {
    if (typeof selectedPrixer?.username === "string") {
      return 0
    } else {
      return Number(getTotalPrice(state).replace(/[,]/gi, ".")) * 0.16
    }
  }

  const getTotalPrice = (state) => {
    if (selectedPrixer) {
      return getTotalUnitsPVM(
        state,
        currency,
        conversionRate,
        discounts,
        selectedPrixer.username
      )?.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    } else {
      return getTotalUnitsPVP(
        state,
        currency,
        conversionRate,
        discounts
      )?.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
  }

  // const changeCurrency = () => {
  //   setCurrency(!currency)
  // }

  const PriceSelect = (item) => {
    if (selectedPrixer) {
      return (
        getPVM(
          item,
          currency,
          conversionRate,
          discounts,
          selectedPrixer?.username
        ) * item.quantity
      ).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    } else {
      return (
        getPVP(item, currency, conversionRate, discounts) * item.quantity
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

  const handleShowCertified = async (index: number, value: boolean) => {
    const newState = [...buyState]
    let last = 0
    const matches = newState.filter(
      (item) => item.art.artId === newState[index].art.artId
    )
    const sequences = matches.map((item) => item.art.certificate.sequence)
    last = Math.max(...sequences)

    newState[index].product.autoCertified = value
    if (value) {
      newState[index].art.certificate.sequence = last + 1
    } else {
      newState[index].art.certificate.sequence = 0
    }
    setBuyState(newState)
    localStorage.setItem("buyState", JSON.stringify(newState))
  }

  useEffect(() => {
    if (basic && basic.name && basic.lastName && prixers) {
      prixers.map((prixer) => {
        if (
          prixer?.firstName &&
          prixer?.firstName?.toLowerCase() ===
            basic.name.toLowerCase().trim() &&
          prixer?.lastName?.toLowerCase() ===
            basic.lastName.toLowerCase().trim()
        ) {
          setSelectedPrixer(prixer)
        } else return
      })
    }
  }, [prixers])

  let today = new Date()
  const monthsOrder = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ]

  let ProdTimes = order.lines?.map((line) => {
    if (line.item.product && line.item.art && line.item.product.productionTime !== undefined) {
      return line.item.product.productionTime
    }
  })

  let orderedProdT = ProdTimes.sort((a, b) => {
    if (a === undefined) return 1
    if (b === undefined) return -1
    return a - b
  })


  let readyDate = new Date(
    today.setDate(today.getDate() + Number(orderedProdT[0]))
  )
  const stringReadyDate =
    readyDate.getFullYear() +
    "-" +
    monthsOrder[readyDate.getMonth()] +
    "-" +
    readyDate.getDate()

  // useEffect(() => {
  //   if (
  //     buyState[0] &&
  //     buyState[0].art &&
  //     shippingData?.shippingDate === undefined
  //   ) {
  //     .setShippingData({
  //       ...shippingData,
  //       shippingDate: stringReadyDate,
  //     })
  //   }
  // }, [])

  return (
    <Grid2
      container
      style={{
        display: "flex",
        padding: "8px",
      }}
    >
      <Grid2
        style={{ display: "flex", justifyContent: "end" }}
      >
        <CurrencySwitch />
      </Grid2>
      <Grid2 size={{md:4}}>
        {/* {basic && ( */}
          <Typography>
            Pedido a nombre de
            <strong>
              {basic.name} {basic.lastName}
            </strong>
            .<br></br> A contactar por{" "}
            <strong>
              {shipping.basic?.phone || basic?.phone}
            </strong>
            .<br></br> Entregar en{" "}
            <strong>
              {shipping.basic?.shortAddress || basic?.shortAddress}
            </strong>
          </Typography>
        {/* )} */}

        <FormControl
          variant="outlined"
          style={{ minWidth: "100%", marginTop: 20 }}
        >
          <ReactQuill
            value={order.observations}
            onChange={handleEditorChange}
            placeholder="Escribe las observaciones aquí..."
          />
        </FormControl>
      </Grid2>
      <Grid2 size={{md:8}} style={{ paddingLeft: 40 }}>
        <div style={{ fontWeight: "bold" }}>Items:</div>
        <div>
          <List component="div" disablePadding>
            {order.lines.length > 0 ? 
              order.lines?.map((line, index) => 
                  line.item.product && line.item.art && (
                    <>
                      <ListItem>
                        <ListItemText primary={`#${index + 1}`} />
                      </ListItem>
                      <Collapse in={true} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          <ListItem>
                            <ListItemText
                              inset
                              style={{
                                marginLeft: 0,
                                paddingLeft: 0,
                              }}
                              primary={
                                <Grid2 container>
                                  <Grid2 size={{ xs:12, md:8}}>
                                    <Grid2 style={{ display: "flex" }}>
                                      <Typography
                                        style={{
                                          fontWeight: "bold",
                                          marginRight: 4,
                                        }}
                                      >
                                        Producto:
                                      </Typography>
                                      <Typography>
                                        {line.item.product.name}
                                      </Typography>
                                    </Grid2>
                                    {line.item.product?.selection &&
                                    typeof line.item.product.selection === "string"
                                      ? line.item.product?.selection
                                      : line.item.product.selection?.name}
                                    {/* {line.item.product.selection?.name ===
                                      "Personalizado" &&
                                      line.item.product.selection?.attributes
                                        ?.value &&
                                      ` (${line.item.product.selection?.attributes?.[0].value})`} */}
                                    <Grid2 style={{ display: "flex" }}>
                                      <Typography
                                        style={{
                                          fontWeight: "bold",
                                          marginRight: 4,
                                        }}
                                      >
                                        Arte:
                                      </Typography>
                                      <Typography>{line.item.art.title}</Typography>
                                    </Grid2>
                                    <Grid2 style={{ display: "flex" }}>
                                      <Typography
                                        style={{
                                          fontWeight: "bold",
                                          marginRight: 4,
                                        }}
                                      >
                                        Prixer:
                                      </Typography>
                                      <Typography>
                                        {line.item.art.prixerUsername}
                                      </Typography>
                                    </Grid2>
                                    {/* <Grid2
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                      }}
                                    >
                                      {line.item.product?.autoCertified && (
                                        <Grid2
                                          size={{
                                          xs:6}}
                                          style={{
                                            display: "flex",
                                            marginTop: 8,
                                            maxWidth: "100%",
                                            // borderRadius: 10,
                                          }}
                                        >
                                          <TextField
                                            style={{
                                              marginRight: 8,
                                              maxWidth: "5rem",
                                            }}
                                            variant="outlined"
                                            label="Código"
                                            onChange={(e) => {
                                              setCertified(
                                                index,
                                                e.target.value,
                                                "code"
                                              )
                                            }}
                                            value={item.art?.certificate?.code}
                                          />
                                          <TextField
                                            style={{
                                              marginRight: 8,
                                              maxWidth: "5rem",
                                            }}
                                            type="number"
                                            variant="outlined"
                                            label="Arte"
                                            value={
                                              item.art?.certificate?.serial
                                            }
                                            onChange={(e) => {
                                              setCertified(
                                                index,
                                                e.target.value,
                                                "serial"
                                              )
                                            }}
                                          />
                                          <TextField
                                            style={{
                                              maxWidth: "9rem",
                                            }}
                                            type="number"
                                            variant="outlined"
                                            label="Seguimiento"
                                            value={
                                              item.art?.certificate?.sequence
                                            }
                                            onChange={(e) => {
                                              setCertified(
                                                index,
                                                e.target.value,
                                                "sequence"
                                              )
                                            }}
                                          />
                                        </Grid2>
                                      )}
                                      <FormControlLabel
                                        style={{ color: "#282c34" }}
                                        control={
                                          <Checkbox
                                            checked={
                                              item.product.autoCertified
                                                ? item.product.autoCertified
                                                : false
                                            }
                                            onChange={() => {
                                              handleShowCertified(
                                                index,
                                                Boolean(
                                                  !item.product.autoCertified
                                                )
                                              )
                                            }}
                                          />
                                        }
                                        label="Certificado"
                                      />
                                    </Grid2> */}
                                  </Grid2>
                                  <Grid2
                                    size={{
                                    xs:12,
                                    md:4}}
                                    style={{
                                      display: "flex",
                                      justifyContent: isMobile
                                        ? "space-between"
                                        : "end",
                                    }}
                                  >
                                    <div>Cantidad: {line.quantity}</div>
                                    <div
                                      style={{
                                        textAlign: "end",
                                        paddingLeft: 10,
                                      }}
                                    >
                                      Precio:
                                      {(
                                        Number(
                                          UnitPrice(
                                            line.item.product,
                                            line.item.art,
                                            currency,
                                            props.conversionRate,
                                            discounts,
                                            props?.selectedPrixer?.username
                                          ).replace(/[,]/gi, ".")
                                        ) * line.quantity
                                      ).toLocaleString("de-DE", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </div>
                                  </Grid2>
                                </Grid2>
                              }
                            />
                          </ListItem>
                        </List>
                      </Collapse>
                      <Divider />
                    </>
                  )
              )
             : (
              <Typography>No has seleccionado nada aún.</Typography>
            )}
            {getTotalCombinedItems(buyState).totalNotCompleted?.length >=
              1 && (
              <Typography
                style={{
                  fontSize: "11px",
                  // color: "primary",
                }}
              >
                {getTotalCombinedItems(buyState).totalNotCompleted
                  ?.length > 1
                  ? `Faltan ${
                      getTotalCombinedItems(buyState).totalNotCompleted
                        .length
                    } productos por definir.`
                  : `Falta 1 producto por definir.`}
              </Typography>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Grid2 size={{ md:8, xs:6}} style={{ paddingLeft: 0 }}>
                <FormControl
                  disabled={order.lines.length == 0}
                  className={classes.formControl}
                  style={{ minWidth: 200, marginTop: 25 }}
                  fullWidth
                >
                  <InputLabel style={{ paddingLeft: 15 }}>
                    Método de pago
                  </InputLabel>
                  <Select
                    variant="outlined"
                    value={billing.method}
                    onChange={(event) =>
                      event.target.value === "Balance Prixer"
                        ? setBillingData({
                            ...billingData,
                            orderPaymentMethod: event.target.value,
                            destinatary: props.selectedPrixer.account,
                          })
                        : setBillingData({
                            ...billingData,
                            orderPaymentMethod: event.target.value,
                          })
                    }
                  >
                    {paymentMethods &&
                      paymentMethods.map((m) =>
                        m.name === "Balance Prixer" ? (
                          <MenuItem
                            value={m}
                            style={{
                              backgroundColor: "#d33f49",
                              color: "white",
                              fontWeight: 600,
                            }}
                          >
                            {m.name + " de " + props.selectedPrixer.username}
                          </MenuItem>
                        ) : (
                          <MenuItem value={m}>{m.name}</MenuItem>
                        )
                      )}
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2
                size={{
                lg:4,
                xs:6}}
                style={{
                  display: "flex",
                  alignItems: "end",
                  marginTop: "24px",
                  marginRight: "14px",
                  flexDirection: "column",
                }}
              >
                {order.lines.length > 0 && (
                  <>
                    <strong>
                      Subtotal:
                      {currency ? " Bs" : "$"}
                      {getTotalPrice(buyState)}
                    </strong>

                    <strong>
                      IVA:
                      {currency ? " Bs" : "$"}
                      {getIvaCost(buyState).toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </strong>

                    {shipping.method && (
                      <strong>
                        Envío:
                        {currency
                          ? " Bs" +
                            Number(
                              shippingCost * conversionRate
                            ).toLocaleString("de-DE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : " $" +
                            shippingCost.toLocaleString("de-DE", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                      </strong>
                    )}
                    <strong>
                      Total:
                      {currency ? " Bs" : "$"}
                      {getTotal(buyState)}
                    </strong>
                    <br />
                  </>
                )}
              </Grid2>
            </div>
          </List>
        </div>
      </Grid2>
      <Grid2
        style={{
          display: "flex",
          justifyContent: "end",
          marginTop: 20,
          marginBottom: "-20px",
        }}
      >
        <Button
          disabled={loadingOrder || buyState.length == 0}
          variant="contained"
          color={"primary"}
          onClick={createOrder}
        >
          Crear orden
        </Button>
      </Grid2>
    </Grid2>
  )
}
