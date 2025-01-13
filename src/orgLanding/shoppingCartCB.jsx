import React, { useState, useEffect } from "react"
import axios from "axios"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Button from "@material-ui/core/Button"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import { useHistory } from "react-router-dom"
import Badge from "@material-ui/core/Badge"
import CB_isologo from "./assets/CB_isologo_black.svg"
import ShoppingCartOutlined from "@material-ui/icons/ShoppingCartOutlined"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import IconButton from "@material-ui/core/IconButton"
import { TextField } from "@material-ui/core"
import DeleteIcon from "@material-ui/icons/Delete"
import Snackbar from "@material-ui/core/Snackbar"
import Paper from "@material-ui/core/Paper"
import ConsumerForm from "../shoppingCart/consumerForm"
import Stepper from "@material-ui/core/Stepper"
import Step from "@material-ui/core/Step"
import StepLabel from "@material-ui/core/StepLabel"
import StepIcon from "@material-ui/core/StepIcon"
import OrderFormCB from "./cartComponents/orderFormCB"
import { Backdrop } from "@material-ui/core"
import CircularProgress from "@material-ui/core/CircularProgress"
import { nanoid } from "nanoid"
import Modal from "@material-ui/core/Modal"
import CheckIcon from "@material-ui/icons/Check"
import isotipo from "./assets/isotipo.svg"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { useTheme } from "@material-ui/core/styles"
import Menu from "@material-ui/core/Menu"
import MenuIcon from "@material-ui/icons/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import ReactGA from "react-ga"
import { useGlobalContext } from "../context/globalContext"
import ShippingData from "../shoppingCart/shippingData.json"
import world from "../images/world-black.svg"
import worldBlack from "../images/world-black.svg"
import vzla from "../images/vzla.svg"
import Switch from "@material-ui/core/Switch"

ReactGA.initialize("G-0RWP9B33D8")

const useStyles = makeStyles((theme) => ({
  typography: { fontFamily: "Lastik" },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
  button: {
    fontFamily: "Lastik",
    textTransform: "none",
    color: "black",
    fontWeight: 600,
    fontSize: 18,
  },
  formControl: {
    marginTop: theme.spacing(6),
    width: 120,
  },
  dotsContainer: {
    position: "relative",
    display: "flex !important",
    justifyContent: "center",
    padding: "unset",
  },
  inputRoot: {
    padding: 0,
    textAlign: "center",
    width: 30,
    height: 30,
  },
  gridInput: {
    display: "flex",
    width: "100%",
    fontFamily: "Lastik",
    borderRadius: 20,
  },
  textfield: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      padding: "0",
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-input": {
      padding: "0",
    },
  },
  accordion: {
    borderRadius: "8px !important",
    borderColor: "#666666",
    borderStyle: "solid",
    borderWidth: "0.1px",
    boxShadow: "none",
  },
  root: {
    width: "100%",
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  stepIcon: {
    color: "#000",
    background: "#F4DF46",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "20px",
  },
  paper2: {
    position: "absolute",
    width: 640,
    maxHeight: "90%",
    overflowY: "visible",
    backgroundColor: "white",
    boxShadow: theme.shadows[2],
    padding: "16px 32px 24px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    justifyContent: "center",
    minWidth: 320,
    borderRadius: 10,
    marginTop: "12px",
    display: "flex",
    flexDirection: "row",
  },
  modal: {
    overflow: "visible !important",
  },
  base: {
    width: "100px",
    height: "37px",
    padding: "0px",
    margin: "16px",
    marginLeft: "0px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchBase: {
    color: "white",
    padding: "1px",
    "&$checked": {
      "& + $track": {
        backgroundColor: "white",
      },
    },
  },
  thumbZ: {
    color: "white",
    width: "30px",
    height: "30px",
    margin: "2px",
    marginLeft: "3px",
    backgroundSize: "20px 20px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundImage: `url(${vzla})`,
  },
  thumbFalseZ: {
    color: "white",
    width: "30px",
    height: "30px",
    margin: "2px",
    marginLeft: "3px",
    backgroundSize: "20px 20px",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundImage: `url(${world})`,
  },
  trackZ: {
    borderRadius: "20px",
    backgroundColor: "silver !important",
    opacity: "1 !important",
    position: "relative",
    display: "flex",
    alignItems: "center",
    padding: "0 10px",
  },
  labelText: {
    color: "#333",
    fontSize: "14px",
    fontWeight: "bold",
    marginLeft: "10px",
  },
  checked: {
    color: "#d33f49 !important",
    transform: "translateX(61px) !important",
    padding: "1px",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}))

export default function ShoppingCartCB() {
  const classes = useStyles()
  const history = useHistory()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"))
  const isTab = useMediaQuery(theme.breakpoints.down("sm"))
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)
  const [expanded, setExpanded] = useState(false)

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [openModal, setOpenModal] = useState(false)
  const [values, setValues] = useState("")
  const [activeStep, setActiveStep] = useState(0)
  const [orderPaymentMethod, setOrderPaymentMethod] = useState(undefined)
  const [observations, setObservations] = useState()
  const [paymentVoucher, setPaymentVoucher] = useState()
  const [dollarValue, setDollarValue] = useState(1)
  const [currency, setCurrency] = useState(false)
  const [seller, setSeller] = useState()
  const [subtotal, setSubtotal] = useState(0)
  const [total, setTotal] = useState(0)
  const [warning, setWarning] = useState(false)
  const { toggleCurrency, zone, toggleZone } = useGlobalContext()
  const [buyState, setBuyState] = useState(
    localStorage.getItem("CBbuyState")
      ? JSON.parse(localStorage.getItem("CBbuyState"))
      : []
  )
  const [cartLength, setCartLength] = useState(
    localStorage.getItem("CBbuyState")
      ? JSON.parse(localStorage.getItem("CBbuyState")).length
      : 0
  )

  let tax = 0
  let shippingCost = Number(values?.shippingMethod?.price)

  const readDollarValue = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/dollarValue/read"
    await axios.get(base_url).then((response) => {
      setDollarValue(response.data.dollarValue)
    })
  }

  const checkInter = () => {
    buyState.some((item) => item.finalPrice === item.interPrice)
  }

  useEffect(() => {
    readDollarValue()
    if (checkInter() && zone === "VZLA") {
      toggleZone()
    }
  }, [])

  const StyledBadge = withStyles((theme) => ({
    badge: {
      backgroundColor: "#FF9934",
      color: "black",
    },
  }))(Badge)

  const CustomStepIcon = ({ active }) => {
    const classes = useStyles()

    return (
      <StepIcon
        icon={active ? <div className={classes.stepIcon}>✔️</div> : null}
      />
    )
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleMain = () => {
    history.push({ pathname: "/chiguirebipolar" })
  }

  const scrollToSection = (selector) => {
    const section = document.querySelector(selector)
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleToProduct = () => {
    handleMain()
    setTimeout(() => {
      scrollToSection("#productos")
    }, 500)
  }

  const handleToPrixelart = () => {
    handleMain()
    setTimeout(() => {
      scrollToSection("#prixelart")
    }, 1200)
  }

  const deleteItemInBuyState = (index) => {
    const newState = [...buyState]
    newState.splice(index, 1)
    setBuyState(newState)
    localStorage.setItem("CBbuyState", JSON.stringify(newState))
    setOpen(true)
    setMessage("Item eliminado correctamente")
    setCartLength((prevLength) => prevLength - 1)
  }

  const changeQuantity = (type, index) => {
    const newState = [...buyState]
    if (type === "+1") {
      newState[index].quantity++
    } else if (type === "-1" && newState[index].quantity > 1) {
      newState[index].quantity--
    }
    setBuyState(newState)
    localStorage.setItem("CBbuyState", JSON.stringify(newState))
  }

  const finish = () => {
    handleMain()
    handleClose()
  }

  const handleClose = () => {
    setOpenModal(false)
    setValues(undefined)
    localStorage.removeItem("CBbuyState")
    setBuyState([])
    setLoading(false)
  }

  const getShippingCost = () => {
    let selectedCountry = ShippingData.find(
      (item) => item.country === values?.country
    )

    const isTshirt = buyState.filter((item) => item.product.name === "Franela")
    const isCup = buyState.filter(
      (item) => item.product.name === "Taza de Peltre"
    )

    let cost = [0]

    const countTshirts =
      isTshirt.reduce((sum, item) => sum + item.quantity, 0) - 1
    const countCups = isCup.reduce((sum, item) => sum + item.quantity, 0) - 1

    if (isTshirt.length > 0) {
      cost.push(selectedCountry?.shirtCost)
      if (countTshirts > 0) {
        cost.push(countTshirts * selectedCountry?.shirtExtra)
      }
    }

    if (isCup.length > 0) {
      cost.push(selectedCountry?.cupCost)
      if (countCups > 0) {
        cost.push(countCups * selectedCountry?.cupExtra)
      }
    }

    if (zone === "INTER") {
      shippingCost = cost.reduce(function (a, b) {
        return a + b
      })
    }
  }

  const getTax = () => {
    let selectedCountry = ShippingData.find(
      (item) => item.country === values?.country
    )

    const isTshirt = buyState.filter((item) => item.product.name === "Franela")
    const isCup = buyState.filter(
      (item) => item.product.name === "Taza de Peltre"
    )

    const countTshirts = isTshirt.reduce((sum, item) => sum + item.quantity, 0)
    const countCups = isCup.reduce((sum, item) => sum + item.quantity, 0)

    let tx = [0]

    if (isTshirt) {
      tx.push(countTshirts * selectedCountry?.shirtTax)
    } else if (isCup) {
      tx.push(countCups * selectedCountry?.cupTax)
    }
    if (zone === "INTER") {
      tax = tx.reduce(function (a, b) {
        return a + b
      })
    }
  }

  getShippingCost()
  getTax()

  const createOrder = async () => {
    if (
      orderPaymentMethod &&
      values?.name &&
      values?.lastName &&
      values?.ci &&
      values?.email &&
      values?.phone
    ) {
      setLoading(true)
      setOpen(true)

      const consumerData = {
        active: true,
        _id: nanoid(6),
        createdBy: {
          username: "web",
        },
        consumerType: "Particular",
        firstname: values.name,
        lastname: values.lastName,
        username: values.username,
        ci: values.ci,
        phone: values.phone,
        email: values.email,
        address: values.address,
        billingAddress: values.billingAddress || values.address,
        shippingAddress: values.shippingAddress || values.address,
      }
      const input = {
        orderId: nanoid(8),
        requests: buyState,
        basicData: {
          name: consumerData.firstname,
          lastname: consumerData.lastname,
          ci: consumerData.ci,
          email: consumerData.email,
          phone: consumerData.phone,
          address: consumerData.address,
        },
        shippingData: {
          name: values.shippingName,
          lastname: values.shippingLastName,
          phone: values.shippingPhone,
          address: values.shippingAddress,
          shippingMethod: values.shippingMethod,
          shippingDate: values.shippingDate,
          country: values?.country,
          city: values?.city,
          zip: values?.zip,
        },
        billingData: {
          name: values.billingShName,
          lastname: values.billingShLastName,
          ci: values.billingCi,
          company: values.billingCompany,
          phone: values.billingPhone,
          address: values.billingAddress,
          orderPaymentMethod: orderPaymentMethod.name,
        },
        dollarValue: dollarValue,
        tax: tax,
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
        createdOn: new Date(),
        createdBy: seller ? { username: seller } : "Prixelart Page",
        orderType: "Particular",
        consumerData: {
          consumerId: consumerData._id,
          consumerType: consumerData.consumerType,
        },
        status: "Por producir",
        observations: observations,
        payStatus: "Pendiente",
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
          value: total,
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
            ReactGA.event({
              category: "shoppingCart",
              action: "ordenar",
              label: "crear_pedido_CB",
            })

            setOpenModal(true)
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
    } else if (orderPaymentMethod === undefined) {
      setOpen(true)
      setMessage("Por favor selecciona una forma de pago.")
    } else {
      setOpen(true)
      setMessage("Por favor completa los datos básicos.")

      setActiveStep(0)
      setExpanded("basic")
      setWarning(true)
    }
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <div>
            <ConsumerForm
              expanded={expanded}
              setExpanded={setExpanded}
              warning={warning}
              setWarning={setWarning}
              buyState={buyState}
              open={open}
              setOpen={setOpen}
              message={message}
              setMessage={setMessage}
              values={values}
              setValues={setValues}
              currency={currency}
            />
            <Button
              className={classes.typography}
              style={{
                textTransform: "none",
                width: "100%",
                backgroundColor: "#F4DF46",
                borderRadius: 10,
                fontSize: 18,
                marginTop: 20,
                marginBottom: 40,
              }}
              onClick={() => setActiveStep(1)}
            >
              Siguiente
            </Button>
          </div>
        )
      case 1:
        return (
          <div>
            <OrderFormCB
              buyState={buyState}
              setBuyState={setBuyState}
              open={open}
              setOpen={setOpen}
              message={message}
              setMessage={setMessage}
              valuesConsumer={values}
              setValuesConsumer={setValues}
              orderPaymentMethod={orderPaymentMethod}
              setOrderPaymentMethod={setOrderPaymentMethod}
              setPaymentVoucher={setPaymentVoucher}
              setObservations={setObservations}
              paymentVoucher={paymentVoucher}
              dollarValue={dollarValue}
              currency={currency}
              setSeller={setSeller}
              setSubtotal={setSubtotal}
              setTotal={setTotal}
            />
            <Button
              className={classes.typography}
              style={{
                textTransform: "none",
                width: "100%",
                backgroundColor: "#F4DF4690",
                borderRadius: 10,
                fontSize: 18,
                marginTop: 20,
              }}
              onClick={() => setActiveStep(0)}
            >
              Anterior
            </Button>
            <Button
              className={classes.typography}
              style={{
                textTransform: "none",
                width: "100%",
                backgroundColor: "#F4DF46",
                borderRadius: 10,
                fontSize: 18,
                marginTop: 20,
                marginBottom: 40,
              }}
              onClick={() => createOrder()}
            >
              Ordenar
            </Button>
          </div>
        )
    }
  }

  const handleCart = () => {
    history.push({ pathname: "/chiguirebipolar/carrito" })
  }

  const setZone = () => {
    setLoading(true)
    toggleZone()
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }
  return (
    <>
      <Backdrop
        className={classes.backdrop}
        open={loading}
      >
        <CircularProgress />
      </Backdrop>

      <AppBar
        position="fixed"
        elevation={0}
        style={{
          backgroundColor: "white",
          minHeight: 70,
        }}
      >
        <Toolbar
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={handleMain}>
            <img
              src={CB_isologo}
              alt="Chiguire Bipolar isologo"
              style={{ width: 238 }}
            />
          </Button>

          {isTab ? (
            <>
              <IconButton
                onClick={handleMenu}
                size="medium"
              >
                <StyledBadge badgeContent={cartLength}>
                  <MenuIcon />
                </StyledBadge>
              </IconButton>

              <Menu
                style={{ zIndex: 100000 }}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={openMenu}
                onClose={handleCloseMenu}
              >
                <MenuItem onClick={() => scrollToSection("#prods")}>
                  Productos
                </MenuItem>
                <MenuItem onClick={() => scrollToSection("#prixelart")}>
                  Prixelart
                </MenuItem>
                <MenuItem onClick={handleCart}>Carrito</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Tabs>
                <Tab
                  className={classes.button}
                  onClick={handleToProduct}
                  label="Productos"
                />
                <Tab
                  className={classes.button}
                  label="Prixelart"
                  onClick={handleToPrixelart}
                />
              </Tabs>
              <div
                style={{
                  width: 257.93,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <IconButton onClick={handleCart}>
                  <StyledBadge badgeContent={cartLength}>
                    <div style={{ color: "black" }}>
                      <ShoppingCartOutlined />
                    </div>
                  </StyledBadge>{" "}
                </IconButton>
              </div>{" "}
            </>
          )}
        </Toolbar>
      </AppBar>

      {buyState && buyState.length > 0 ? (
        <Grid
          container
          style={{
            marginTop: isTab ? 80 : 115,
            marginLeft: isTab ? 10 : 40,
            paddingRight: isTab ? 10 : 40,
          }}
        >
          <Grid
            item
            sm={12}
            style={{
              marginRight: isTab && "0.7rem",
              display: "flex",
              justifyContent: "space-between",
              flexDirection: isTab && "column",
              width: isTab && "100%",
            }}
          >
            <Typography
              className={classes.typography}
              style={{
                fontSize: 30,
                width: isTab ? "auto" : "100%",
                marginBottom: 30,
                alignSelf: isTab && "center",
              }}
            >
              Carrito de compras
            </Typography>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                backgroundColor: "rgb(120, 155, 236)",
                width: !isTab ? "40%" : "90%",
                borderRadius: 25,
                margin: "0 auto 20px",
                maxWidth: 350,
                marginRight: 20,
              }}
            >
              <Switch
                classes={{
                  root: classes.base,
                  switchBase: classes.switchBase,
                  thumb: zone === "VZLA" ? classes.thumbZ : classes.thumbFalseZ,
                  track: classes.trackZ,
                  checked: classes.checked,
                }}
                value={zone === "VZLA"}
                onChange={() => setZone()}
                style={{ color: "rgb(0, 97, 52)" }}
              >
                <span className={classes.labelText}>
                  {zone === "VZLA" ? "Nacional" : "Internacionales"}
                </span>
              </Switch>
              <Typography
                style={{
                  alignContent: "center",
                  color: "white",
                  fontWeight: "normal",
                  fontFamily: "Lastik",
                  width: "50%",
                }}
                variant="h5"
              >
                {zone === "VZLA" ? "Nacionales" : "Internacionales"}
              </Typography>
            </div>
          </Grid>
          <Grid
            item
            sm={12}
            md={7}
            style={{ marginRight: isTab && 10, width: "100%" }}
          >
            {buyState &&
              buyState.length > 0 &&
              buyState.map((item, index) => (
                <Grid
                  container
                  style={{
                    boxShadow: "0px 1px 8px rgba(0, 0, 0, 0.2)",
                    borderRadius: 30,
                    backgroundColor: "#FAFAFA",
                    padding: 10,
                    marginBottom: 20,
                  }}
                >
                  <Grid
                    item
                    xs={11}
                    sm={6}
                    style={{ display: "flex" }}
                  >
                    <img
                      src={item?.art?.images[0]?.img}
                      alt="Item de Chiguire Bipolar"
                      style={{
                        width: isMobile ? 88 : 181,
                        height: isMobile ? 76 : 180,
                        borderRadius: 15,
                        marginRight: 10,
                      }}
                    />
                    <div
                      style={{
                        width: isMobile ? "100% " : isTab ? 240 : 181,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        className={classes.typography}
                        style={{
                          fontSize: isMobile ? 16 : 20,
                          fontWeight: 600,
                        }}
                      >
                        {item?.product?.name} {item.art.title}
                      </Typography>
                      <Typography
                        className={classes.typography}
                        style={{ fontSize: isMobile ? 12 : 14 }}
                      >
                        {item?.product?.selection}
                      </Typography>
                      {isMobile && (
                        <>
                          <Typography
                            className={classes.typography}
                            style={{
                              fontSize: isMobile ? 16 : 18,
                              fontWeight: 600,
                            }}
                          >
                            $
                            {zone === "INTER"
                              ? item.product?.interPrice?.toLocaleString(
                                  "de-DE",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )
                              : item?.product?.finalPrice?.toLocaleString(
                                  "de-DE",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                          </Typography>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <IconButton
                              style={{
                                width: 30,
                                height: 32,
                                textAlign: "center",
                                marginRight: 10,
                              }}
                              onClick={() => changeQuantity("+1", index)}
                            >
                              +
                            </IconButton>
                            <TextField
                              disabled
                              variant="outlined"
                              value={item.quantity}
                              className={classes.inputRoot}
                              InputProps={{
                                classes: {
                                  input: classes.inputRoot,
                                },
                              }}
                            />
                            <IconButton
                              style={{
                                width: isMobile ? 18 : 30,
                                height: isMobile ? 19 : 32,
                                textAlign: "center",
                                marginRight: !isTab && 10,
                              }}
                              onClick={() => changeQuantity("-1", index)}
                            >
                              -
                            </IconButton>
                          </div>
                        </>
                      )}
                    </div>
                  </Grid>
                  {!isMobile && (
                    <Grid
                      item
                      xs={5}
                      style={{
                        display: "flex",
                        alignContent: "center",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                          style={{
                            width: 30,
                            height: 32,
                            textAlign: "center",
                            marginRight: 10,
                          }}
                          onClick={() => changeQuantity("+1", index)}
                        >
                          +
                        </IconButton>
                        <TextField
                          disabled
                          variant="outlined"
                          value={item.quantity}
                          className={classes.inputRoot}
                          InputProps={{
                            classes: {
                              input: classes.inputRoot,
                            },
                          }}
                        />
                        <IconButton
                          style={{
                            width: 30,
                            height: 32,
                            textAlign: "center",
                            marginRight: 10,
                          }}
                          onClick={() => changeQuantity("-1", index)}
                        >
                          -
                        </IconButton>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          className={classes.typography}
                          style={{ fontSize: 18, fontWeight: 600 }}
                        >
                          $
                          {zone === "INTER"
                            ? item?.product?.interPrice?.toLocaleString(
                                "de-DE",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )
                            : item?.product?.finalPrice?.toLocaleString(
                                "de-DE",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                        </Typography>
                      </div>
                    </Grid>
                  )}
                  <Grid
                    item
                    xs={1}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <IconButton
                      style={{
                        width: isMobile ? 18 : 30,
                        height: isMobile ? 19 : 32,
                        textAlign: "center",
                        marginRight: 10,
                      }}
                      onClick={() => deleteItemInBuyState(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
          </Grid>

          <Grid
            item
            sm={12}
            md={5}
            style={{ padding: !isTab && 20, marginRight: isTab && 10 }}
          >
            <Paper
              elevation={4}
              style={{
                width: "100%",
                padding: 20,
                borderRadius: 30,
              }}
            >
              <Stepper activeStep={activeStep}>
                {["Tus datos", "Orden de compra"].map((label, index) => {
                  const stepProps = {}
                  const labelProps = {
                    StepIconComponent: CustomStepIcon,
                  }

                  return (
                    <Step
                      key={label}
                      {...stepProps}
                    >
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  )
                })}
              </Stepper>
              <div className={classes.instructions}>
                {getStepContent(activeStep)}
              </div>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <div>
          <div style={{ margin: "120px 10px 40px 10px" }}>
            <Typography
              variant={"h6"}
              align={"Center"}
              justify={"center"}
              style={{ fontFamily: "Lastik" }}
            >
              Actualmente no tienes ningun producto dentro del carrito de
              compra.
            </Typography>
          </div>
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
                  pathname: "/chiguirebipolar",
                })
              }}
            >
              Elegir Producto
            </Button>
          </div>
        </div>
      )}

      <Snackbar
        open={open}
        autoHideDuration={5000}
        message={message}
        onClose={() => setOpen(false)}
      />

      <Modal
        open={openModal}
        onClose={handleClose}
        className={classes.modal}
      >
        <Grid
          container
          className={classes.paper2}
          style={{ width: isMobile && "80%" }}
        >
          <Grid
            item
            xs={12}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: "50%",
                backgroundColor: "#00A650",
                display: "flex",
                placeContent: "center",
                alignItems: "center",
                marginTop: -81,
                borderColor: "white",
                borderWidth: 8,
                borderStyle: "solid",
              }}
            >
              <CheckIcon style={{ color: "white", fontSize: 66 }} />
            </div>
          </Grid>
          <Grid
            item
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 30,
            }}
          >
            <div
              style={{
                backgroundImage: `url(${isotipo})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                width: 117,
                height: 112,
                marginRight: 40,
              }}
            />
            <div>
              {" "}
              <Typography
                className={classes.typography}
                style={{ fontSize: 16 }}
              >
                <strong>¡Felicidades!</strong> Tu compra ha sido todo un
                éxito...
              </Typography>
              <Typography
                className={classes.typography}
                style={{ fontSize: 16 }}
              >
                <strong>¡Más chigüire que nunca!</strong>
              </Typography>
            </div>
          </Grid>

          <Grid
            item
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
              marginBottom: 50,
            }}
          >
            <Typography
              className={classes.typography}
              style={{ fontSize: 16 }}
            >
              Te enviaremos un correo con todos los detalles
            </Typography>
          </Grid>
          <Button
            className={classes.typography}
            style={{
              textTransform: "none",
              width: 360,
              backgroundColor: "#F4DF46",
              borderRadius: 10,
              fontSize: 18,
            }}
            onClick={() => finish()}
          >
            Volver
          </Button>
        </Grid>
      </Modal>
    </>
  )
}
