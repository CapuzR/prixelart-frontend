import React, { useEffect, useState } from "react"
import axios from "axios"
import Button from "@material-ui/core/Button"
import { makeStyles, useTheme } from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"
import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import Stepper from "@material-ui/core/Stepper"
import Step from "@material-ui/core/Step"
import StepLabel from "@material-ui/core/StepLabel"
import { useHistory } from "react-router-dom"
import { Typography } from "@material-ui/core"
import { Backdrop } from "@material-ui/core"
import CircularProgress from "@material-ui/core/CircularProgress"
import ConsumerForm from "./consumerForm"
import OrderForm from "./orderForm"
import CartReview from "./cartReview"
import { nanoid } from "nanoid"
import validations from "./validations"
import Switch from "@material-ui/core/Switch"
import { Alert } from "@material-ui/lab"
import useMediaQuery from "@material-ui/core/useMediaQuery"

import { useCart } from "context/CartContext"
import {
  getPVP,
  getPVM,
  getTotalUnitsPVP,
  getTotalUnitsPVM,
} from "./pricesFunctions"

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    flexGrow: 1,
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  float: {
    position: "relative",
    marginLeft: "95%",
  },
  iconButton: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  dollar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: "50%",
    fontSize: 20,
    // marginRight: 5,
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
}))

export default function ShoppingPage(props) {
  const classes = useStyles()
  const history = useHistory()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { cart } = useCart();

  const [orderPaymentMethod, setOrderPaymentMethod] = useState(undefined)
  const [observations, setObservations] = useState()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const steps = [`Tus datos`, `Orden de compra`]
  const [dollarValue, setDollarValue] = useState(1)
  const [currency, setCurrency] = useState(false)
  const [paymentVoucher, setPaymentVoucher] = useState()
  const [discountList, setDiscountList] = useState([])
  const [seller, setSeller] = useState()
  const [expanded, setExpanded] = useState(false)
  const [orgs, setOrgs] = useState([])

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

  const getORGs = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/organization/read-all-full"
    await axios
      .get(base_url)
      .then((response) => {
        setOrgs(response.data.organizations)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  useEffect(() => {
    getDiscounts()
    getORGs()
  }, [])

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  let shippingCost = Number(props.valuesConsumerForm?.shippingMethod?.price)

  const getTotalPrice = (state) => {
    if (
      JSON.parse(localStorage?.getItem("token")) &&
      JSON.parse(localStorage?.getItem("token"))?.username
    ) {
      return getTotalUnitsPVM(
        state,
        currency,
        dollarValue,
        discountList,
        JSON.parse(localStorage?.getItem("token"))?.username
      )
    } else {
      return getTotalUnitsPVP(state, currency, dollarValue, discountList)
    }
  }

  const getIvaCost = (state) => {
    if (
      typeof JSON.parse(localStorage?.getItem("token"))?.username === "string"
    ) {
      return 0
    } else {
      return getTotalPrice(state) * 0.16
    }
  }

  const getTotal = (x) => {
    let n = []
    n.push(getTotalPrice(cart))
    n.push(getIvaCost(cart))

    if (props.valuesConsumerForm.shippingMethod) {
      if (props.currency) {
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
    return total
  }

  const createOrder = async () => {
    if (orderPaymentMethod) {
      setLoading(true)
      props.setOpen(true)

      let orderLines = []
      let taxv2 = getIvaCost(cart)
      let subtotalv2 = getTotalPrice(cart)
      let totalv2 = getTotal(cart)

      cart.map((s) => {
        s.product &&
          s.art &&
          orderLines.push({
            product: s.product,
            art: s.art,
            quantity: s.quantity,
          })
      })

      orderLines.map((item) => {
        if (typeof item.product.discount === "string") {
          let dis = discountList?.find(
            ({ _id }) => _id === item.product.discount
          )
          if (
            ((JSON.parse(localStorage.getItem("token")) &&
              JSON.parse(localStorage.getItem("token")).username) ||
              (JSON.parse(localStorage?.getItem("adminToken")) &&
                JSON.parse(localStorage?.getItem("adminToken"))?.username)) &&
            dis?.type === "Porcentaje"
          ) {
            item.product.finalPrice = Number(
              ((item.product.prixerEquation ||
                item.product?.prixerPrice?.from?.replace(/[,]/gi, ".")) -
                ((item.product.prixerEquation ||
                  item.product?.prixerPrice?.from?.replace(/[,]/gi, ".")) /
                  100) *
                  dis.value) *
                (item.quantity || 1)
            )
            item.product.discount = dis.name + " %" + dis.value
          } else if (
            ((JSON.parse(localStorage.getItem("token")) &&
              JSON.parse(localStorage.getItem("token")).username) ||
              (JSON.parse(localStorage?.getItem("adminToken")) &&
                JSON.parse(localStorage?.getItem("adminToken"))?.username)) &&
            dis?.type === "Monto"
          ) {
            item.product.finalPrice = Number(
              ((item.product.prixerEquation ||
                item.product?.prixerPrice?.from?.replace(/[,]/gi, ".")) -
                dis.value) *
                (item.quantity || 1)
            )
            item.product.discount = dis.name + " $" + dis.value
          } else if (dis?.type === "Porcentaje") {
            item.product.finalPrice = Number(
              ((item.product.publicEquation ||
                item.product.publicPrice?.from.replace(/[,]/gi, ".")) -
                ((item.product.publicEquation ||
                  item.product.publicPrice?.from.replace(/[,]/gi, ".")) /
                  100) *
                  dis.value) *
                (item.quantity || 1)
            )
            item.product.discount = dis.name + " %" + dis.value
          } else if (dis?.type === "Monto") {
            item.product.finalPrice = Number(
              ((item.product.publicEquation ||
                item.product.publicPrice.from?.replace(/[,]/gi, ".")) -
                dis.value) *
                (item.quantity || 1)
            )
            item.product.discount = dis.name + " $" + dis.value
          }
        } else if (
          (JSON.parse(localStorage.getItem("token")) &&
            JSON.parse(localStorage.getItem("token")).username) ||
          (JSON.parse(localStorage.getItem("adminToken")) &&
            JSON.parse(localStorage.getItem("adminToken")).username)
        ) {
          item.product.finalPrice =
            item.product.prixerEquation || item.product.prixerPrice.from
        } else {
          item.product.finalPrice =
            item.product.publicEquation || item.product.publicPrice.from
        }
      })

      const consumerData = {
        active: true,
        _id: nanoid(6),
        createdBy: {
          username: "web",
        },
        consumerType: "Particular",
        firstname: props.valuesConsumerForm?.name,
        lastname: props.valuesConsumerForm?.lastName,
        username: props.valuesConsumerForm?.username,
        ci: props.valuesConsumerForm?.ci,
        phone: props.valuesConsumerForm?.phone,
        email: props.valuesConsumerForm?.email,
        address: props.valuesConsumerForm?.address,
        billingAddress:
          props.valuesConsumerForm?.billingAddress ||
          props.valuesConsumerForm?.address,
        shippingAddress:
          props.valuesConsumerForm?.shippingAddress ||
          props.valuesConsumerForm?.address,
      }
      const input = {
        orderId: nanoid(8),
        requests: orderLines,
        basicData: {
          name: consumerData.firstname,
          lastname: consumerData.lastname,
          ci: consumerData.ci,
          email: consumerData.email,
          phone: consumerData.phone,
          address: consumerData.address,
        },
        shippingData: {
          name: props.valuesConsumerForm?.shippingName,
          lastname: props.valuesConsumerForm?.shippingLastName,
          phone: props.valuesConsumerForm?.shippingPhone,
          address: props.valuesConsumerForm?.shippingAddress,
          shippingMethod: props.valuesConsumerForm?.shippingMethod,
          shippingDate: props.valuesConsumerForm?.shippingDate,
        },
        billingData: {
          name: props.valuesConsumerForm?.billingShName,
          lastname: props.valuesConsumerForm?.billingShLastName,
          ci: props.valuesConsumerForm?.billingCi,
          company: props.valuesConsumerForm?.billingCompany,
          phone: props.valuesConsumerForm?.billingPhone,
          address: props.valuesConsumerForm?.billingAddress,
          orderPaymentMethod: orderPaymentMethod.name,
        },
        dollarValue: dollarValue,
        tax: taxv2,
        subtotal: subtotalv2,
        shippingCost: shippingCost,
        total: totalv2,
        createdOn: new Date(),
        createdBy: seller ? { username: seller } : "Prixelart Page",
        orderType: "Particular",
        consumerId: consumerData._id,
        status: "Por producir",
        observations: observations,
        payStatus: "Pendiente",
        consumerData: {
          consumerId: consumerData._id,
          consumerType: consumerData.consumerType,
        },
      }
      if (
        JSON.parse(localStorage.getItem("token")) &&
        JSON.parse(localStorage.getItem("token")).username
      ) {
        orderLines.map((item) => {
          item.product.publicEquation = undefined
          item.product.publicPrice = undefined
        })
        consumerData.consumerType = "Prixer"
        consumerData.prixerId = JSON.parse(
          localStorage.getItem("token")
        ).prixerId
        input.billingData.destinatary = JSON.parse(
          localStorage.getItem("token")
        ).account
      } else {
        orderLines.map((item) => {
          item.product.prixerEquation = undefined
          item.product.prixerPrice = undefined
        })
      }

      let data = {
        consumerData,
        input,
      }
      if (orderPaymentMethod.name === "Balance Prixer") {
        const movement = {
          _id: nanoid(),
          createdOn: new Date(),
          createdBy: "Prixelart Page",
          date: new Date(),
          destinatary: JSON.parse(localStorage.getItem("token")).account,
          description: `Pago de la orden #${input.orderId}`,
          type: "Retiro",
          value: getTotal(cart),
        }
        data.movement = movement
      }

      const base_url = process.env.REACT_APP_BACKEND_URL + "/order/createv2"
      const create = await axios
        .post(base_url, data, {
          "Content-Type": "multipart/form-data",
        })
        .then(async (response) => {
          if (response.status === 200) {
            if (paymentVoucher !== undefined) {
              const formData = new FormData()
              formData.append("paymentVoucher", paymentVoucher)
              let ID = input.orderId
              const base_url2 =
                process.env.REACT_APP_BACKEND_URL + "/order/addVoucher/" + ID
              await axios.put(base_url2, formData, {
                "Content-Type": "multipart/form-data",
              })
            }

            props.setMessage(response.data.info)
            props.setMessage(
              "¡Gracias por tu compra! Por favor revisa tu correo"
            )

            const base_url3 =
              process.env.REACT_APP_BACKEND_URL + "/order/sendEmail"
            await axios.post(base_url3, input).then(async (response) => {
              if (response.data.success === false) {
                await axios.post(base_url3, input)
              } else return
            })
          }
        })
        .catch((error) => {
          console.log(error.response)
        })
      history.push({ pathname: "/" })
      props.setValuesConsumerForm(undefined)
      localStorage.removeItem("buyState")
      props.setCart([])
      setLoading(false)
    } else {
      props.setOpen(true)
      props.setMessage("Por favor selecciona una forma de pago.")
    }
  }

  const readDollarValue = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/dollarValue/read"
    await axios.get(base_url).then((response) => {
      setDollarValue(response.data.dollarValue)
    })
  }

  useEffect(() => {
    readDollarValue()
  }, [])

  const changeCurrency = () => {
    setCurrency(!currency)
  }

  const handleBuy = () => {
    document.getElementById("next")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  return (
    <>
      <Backdrop
        className={classes.backdrop}
        open={loading}
      >
        <CircularProgress />
      </Backdrop>
      {/* <AppBar prixerUsername={prixerUsername} /> */}

      <Container
        component="main"
        maxWidth="s"
        className={classes.paper}
      >
        <CssBaseline />
        {cart.length > 0 ? (
          <Grid
            container
            spacing={2}
            style={{ justifyContent: "space-between" }}
          >
            <div
              style={{
                marginTop: 80,
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Alert severity="info">
                <strong>Importante:</strong> tus datos son 100% confidenciales y
                no serán compartidos con terceros
              </Alert>
            </div>
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginRight: !isMobile && 40,
                marginTop: isMobile && 40,
                marginBottom: isMobile && 36,
                justifyContent: "end",
              }}
            >
              <Switch
                classes={{
                  root: classes.base,
                  switchBase: classes.switchBase,
                  thumb: currency ? classes.thumbTrue : classes.thumb,
                  track: classes.track,
                  checked: classes.checked,
                }}
                color="primary"
                value={currency}
                onChange={(e) => {
                  changeCurrency(e)
                }}
                style={{ marginRight: "-5px" }}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              lg={7}
              xl={7}
              style={{ marginTop: isMobile ? "-190px" : "-150px" }}
            >
              <CartReview />
            </Grid>

            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              lg={5}
              xl={5}
            >
              <Paper
                style={{
                  padding: "10px 10px 0px 10px",
                  width: "100%",
                  marginTop: !isMobile && 12
                }}
                elevation={3}
              >
                <Stepper activeStep={activeStep}>
                  {steps.map((label, index) => {
                    return (
                      <Step
                        key={label}
                        {...props}
                      >
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    )
                  })}
                </Stepper>
                <div
                  style={{
                    paddingRight: "10px",
                    marginLeft: "13px",
                    paddingBottom: 10,
                  }}
                >
                  {activeStep === 0 ? (
                    <ConsumerForm
                      setValues={props.setValuesConsumerForm}
                      values={props.valuesConsumerForm}
                      buyState={cart}
                      setOpen={props.setOpen}
                      setMessage={props.setMessage}
                      expanded={expanded}
                      setExpanded={setExpanded}
                    />
                  ) : (
                    <OrderForm
                      valuesConsumer={props.valuesConsumerForm}
                      values={props.valuesConsumerForm}
                      setValuesConsumer={props.setValues}
                      onCreateConsumer={props.onCreateConsumer}
                      buyState={cart}
                      setBuyState={cart}
                      orderPaymentMethod={orderPaymentMethod}
                      setOrderPaymentMethod={setOrderPaymentMethod}
                      setPaymentVoucher={setPaymentVoucher}
                      setObservations={setObservations}
                      paymentVoucher={paymentVoucher}
                      dollarValue={dollarValue}
                      currency={currency}
                      setSeller={setSeller}
                      orgs={orgs}
                    />
                  )}
                </div>
                <div
                  style={{
                    paddingBottom: 10,
                    display: "flex",
                    justifyContent: "space-evenly",
                  }}
                >
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className={classes.button}
                  >
                    Anterior
                  </Button>
                  <Button
                    id="next"
                    variant="contained"
                    color="primary"
                    disabled={
                      !props.valuesConsumerForm ||
                      !props.valuesConsumerForm.name ||
                      !props.valuesConsumerForm.lastName ||
                      !props.valuesConsumerForm.ci ||
                      !props.valuesConsumerForm.phone ||
                      !props.valuesConsumerForm.email ||
                      !props.valuesConsumerForm.address ||
                      !validations.isAValidEmail(
                        props.valuesConsumerForm?.email
                      ) ||
                      !validations.isAValidCi(props.valuesConsumerForm?.ci) ||
                      !validations.isAValidName(
                        props.valuesConsumerForm?.name
                      ) ||
                      !validations.isAValidName(
                        props.valuesConsumerForm?.lastName
                      ) ||
                      !validations.isAValidPhoneNum(
                        props.valuesConsumerForm?.phone
                      )
                    }
                    onClick={
                      activeStep === steps.length - 1 ? createOrder : handleNext
                    }
                  >
                    {activeStep === steps.length - 1 ? "Ordenar" : "Siguiente"}
                  </Button>
                </div>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <div
            style={{ marginTop: 100, display: "flex", flexDirection: "column" }}
          >
            <Typography
              variant={"h5"}
              align={"center"}
              color="secondary"
            >
              Actualmente no tienes ningun producto dentro del carrito de
              compra.
            </Typography>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 20,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  history.push({
                    pathname: "/productos",
                  })
                }}
              >
                Elegir Producto
              </Button>
            </div>
          </div>
        )}
      </Container>
    </>
  )
}
