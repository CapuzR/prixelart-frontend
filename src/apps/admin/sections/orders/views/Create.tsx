import React, { useEffect, useState } from "react"
import axios from "axios"
import Grid2 from "@mui/material/Grid2"
import { useTheme } from "@mui/styles"
import { Theme, Typography } from "@mui/material"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import Stepper from "@mui/material/Stepper"
import Step from "@mui/material/Step"
import StepButton from "@mui/material/StepButton"
import ConsumerData from "../components/ConsumerData"
import ShoppingCart from "../components/ShoppingCart"
import Checkout from "../components/Checkout"
import { nanoid } from "nanoid"
import {
  UnitPrice,
  getPVP,
  getPVM,
  getTotalUnitsPVM,
  getTotalUnitsPVP,
} from "../../../../consumer/checkout/pricesFunctions.js"
import { makeStyles } from "tss-react/mui"
import { Discount } from "../../../../../types/discount.types"
import { Surcharge } from "../../../../../types/surcharge.types"
import { Organization } from "../../../../../types/organization.types"
import { Consumer } from "../../../../../types/consumer.types"
import { ShippingMethod } from "../../../../../types/shippingMethod.types"
import { basicData } from "../../../../../types/order.types"
import {
  useSnackBar,
  useLoading,
  useConversionRate,
} from "@context/GlobalContext"

interface OrderProps {
  readOrders: () => Promise<any>
  discountList: Discount[]
  surchargeList: Surcharge[]
  orgs: Organization[]
  setDiscountList: React.Dispatch<React.SetStateAction<Discount[]>>
  setSurchargeList: React.Dispatch<React.SetStateAction<Surcharge[]>>
  setPrixers: React.Dispatch<React.SetStateAction<never[]>>
  setOrgs: React.Dispatch<React.SetStateAction<Organization[]>>
  handleClose: () => void
  setConsumers: React.Dispatch<React.SetStateAction<Consumer[]>>
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper2: {
      position: "absolute",
      width: "85%",
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
  }
})
export default function CreateOrder({
  readOrders,
  discountList,
  surchargeList,
  orgs,
  setDiscountList,
  setSurchargeList,
  setPrixers,
  setOrgs,
  handleClose,
  setConsumers,
}: OrderProps) {
  const { classes } = useStyles()
  const theme = useTheme()
  const adminToken = localStorage.getItem("adminToken")
  const adminData = adminToken ? JSON.parse(adminToken) : null
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const { conversionRate } = useConversionRate()

  // const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  // const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeStep, setActiveStep] = useState(0)
  const [basicData, setBasicData] = useState<basicData>()
  const [shippingData, setShippingData] = useState<any>()
  const [billingData, setBillingData] = useState<any>()
  const [openCreateOrder, setOpenCreateOrder] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(false)
  const [orderPaymentMethod, setOrderPaymentMethod] = useState(undefined)
  const [observations, setObservations] = useState()
  const [selectedPrixer, setSelectedPrixer] = useState()
  const [shippingMethod, setShippingMethod] = useState<
    ShippingMethod | undefined
  >()
  const [selectedConsumer, setSelectedConsumer] = useState<
    Consumer | undefined
  >()
  const [consumerType, setConsumerType] = useState("Particular")
  const steps = [`Datos del comprador`, `Productos`, `Orden de compra`]

  const handleStep = (step: number) => () => {
    setActiveStep(step)
  }

  let shippingCost = Number(shippingMethod?.price)

  const getIvaCost = (state) => {
    let iva = getTotalPrice(state) * 0.16
    if (typeof selectedPrixer?.username === "string") {
      return 0
    } else {
      return iva
    }
  }

  const getTotal = () => {
    let n = []
    n.push(getTotalPrice(buyState))
    n.push(getIvaCost(buyState))
    {
      shippingData?.shippingMethod && n.push(shippingCost)
    }
    let total = n.reduce(function (a, b) {
      return a + b
    })
    return total
  }

  const getTotalPrice = (state) => {
    if (selectedPrixer) {
      return getTotalUnitsPVM(
        state,
        false,
        1,
        discountList,
        selectedPrixer.username
      )
    } else {
      return getTotalUnitsPVP(state, false, 1, discountList)
    }
  }

  const createOrder = async () => {
    setLoadingOrder(true)
    setLoading(true)

    let orderLines = []

    buyState.map((s) => {
      s.product &&
        s.art &&
        orderLines.push({
          product: s.product,
          art: s.art,
          quantity: s.quantity,
        })
    })
    const consumerData = {
      _id: selectedConsumer?._id || nanoid(6),
      active: true,
      contactedBy: adminData.firstname + " " + adminData.lastname,
      consumerType: selectedPrixer ? "Prixer" : consumerType,
      firstname: basicData?.name,
      lastname: basicData?.lastname,
      ci: basicData?.ci,
      phone: basicData?.phone,
      email: basicData?.email,
      address: basicData?.address,
      billingAddress: billingData?.address || basicData?.address,
      shippingAddress: shippingData?.address || basicData?.address,
      // prixerId: selectedPrixer?.prixerId,
    }
    if (selectedPrixer) {
      consumerData.prixerId = selectedPrixer.prixerId
    }
    await axios.post(
      import.meta.env.VITE_BACKEND_URL + "/consumer/create",
      consumerData
    )

    const base_url = import.meta.env.VITE_BACKEND_URL + "/order/create"
    let input = {
      orderId: nanoid(8),
      requests: orderLines,
      basicData: basicData,
      shippingData: shippingData,
      billingData: billingData,
      dollarValue: conversionRate,
      observations: observations,
      tax: getIvaCost(buyState),
      subtotal: getTotalPrice(buyState),
      shippingCost: shippingCost,
      total: getTotal(buyState),
      createdOn: new Date(),
      createdBy: {
        username: adminData.firstname + " " + adminData.lastname,
      },
      consumerData: {
        consumerId: consumerData._id,
        consumerType: consumerType,
      },
      orderType: "Particular",
      status: "Por producir",
      payStatus: "Pendiente",
    }

    const base_url3 = import.meta.env.VITE_BACKEND_URL + "/order/sendEmail"

    await axios.post(base_url, input).then(async (response) => {
      if (response.data.res.success) {
        for (const item of buyState) {
          // if (item.product.autoCertified === true) {
          //   let art = item.art
          //   let last = 0
          //   const matches = buyState.filter(
          //     (a) => a.art.artId === art.artId
          //   )
          //   const sequences = matches.map(
          //     (item) => item.art.certificate.sequence
          //   )
          //   last = Math.max(...sequences)
          //   const URI =
          //     import.meta.env.VITE_BACKEND_URL + "/art/rank/" + art.artId
          //   art.points = parseInt(art.points)
          //   const certificate = {
          //     code: art.certificate.code,
          //     serial: item.art.certificate.serial,
          //     sequence: last,
          //   }
          //   art.certificate = certificate
          //   await axios.put(
          //     URI,
          //     art,
          //     { headers: { adminToken: localStorage.getItem("adminTokenV") } },
          //     { withCredentials: true }
          //   )
          // }
        }
        if (basicData?.email && basicData?.email.length > 8) {
          await axios.post(base_url3, input).then(async (response) => {
            showSnackBar(response.data.info)
            if (response.data.success === false) {
              await axios.post(base_url3, input).then((res) => {
                showSnackBar(res.data.info)
              })
            } else return
          })
        }
      }
    })
    setOpenCreateOrder(false)
    // setBasicData()
    // setShippingData()
    // setBillingData()
    setConsumerType("Particular")
    localStorage.removeItem("buyState")
    // setBuyState([])
    readOrders()
    setLoading(false)
    setLoadingOrder(false)
    handleClose()
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      handleClose()
    } else return
  }

  const getDiscounts = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/discount/read-allv2"
    await axios
      .post(base_url, { adminToken: localStorage.getItem("adminTokenV") })
      .then((response) => {
        setDiscountList(response.data.discounts)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const getSurcharges = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/surcharge/read-active"
    await axios
      .get(base_url)
      .then((response) => {
        setSurchargeList(response.data.surcharges)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const getORGs = async () => {
    const base_url =
      import.meta.env.VITE_BACKEND_URL + "/organization/read-all-full"
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
    getSurcharges()
    getORGs()
  }, [])

  document.addEventListener("keydown", handleKeyDown)

  return (
    <Grid2
      container
      spacing={2}
      style={{ justifyContent: "space-between", alignItems: "center" }}
      className={classes.paper2}
    >
      <Grid2
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant={"h5"} color={"primary"}>
          Creación de orden
        </Typography>

        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Grid2>
      <Stepper activeStep={activeStep} nonLinear style={{ width: "100%" }}>
        {steps.map((label, index) => {
          return (
            <Step key={label}>
              <StepButton onClick={handleStep(index)}>{label}</StepButton>
            </Step>
          )
        })}
      </Stepper>
      <div
        style={{
          paddingRight: "10px",
          marginLeft: "13px",
          paddingBottom: 10,
          maxHeight: "70%",
          width: "100%",
        }}
      >
        {activeStep === 0 && (
          <ConsumerData
            buyState={buyState}
            basicData={basicData}
            shippingData={shippingData}
            billingData={billingData}
            setBasicData={setBasicData}
            setShippingData={setShippingData}
            setBillingData={setBillingData}
            setShippingMethod={setShippingMethod}
            setSelectedConsumer={setSelectedConsumer}
            selectedConsumer={selectedConsumer}
            setSelectedPrixer={setSelectedPrixer}
            selectedPrixer={selectedPrixer}
            orgs={orgs}
            setConsumerType={setConsumerType}
            consumerType={consumerType}
            setConsumers={setConsumers}
          />
        )}
        {activeStep === 1 && (
          <ShoppingCart
            selectedPrixer={selectedPrixer}
            selectedConsumer={selectedConsumer}
            buyState={buyState}
            discountList={discountList}
            surchargeList={surchargeList}
            AssociateProduct={AssociateProduct}
            setSelectedArtToAssociate={setSelectedArtToAssociate}
            setSelectedProductToAssociate={setSelectedProductToAssociate}
            setBuyState={setBuyState}
            addItemToBuyState={addItemToBuyState}
            changeQuantity={changeQuantity}
            deleteItemInBuyState={deleteItemInBuyState}
            orgs={orgs}
            consumerType={consumerType}
          />
        )}
        {activeStep === 2 && (
          <Checkout
            selectedPrixer={selectedPrixer}
            setSelectedPrixer={setSelectedPrixer}
            basicData={basicData}
            shippingData={shippingData}
            setShippingData={setShippingData}
            billingData={billingData}
            setBillingData={setBillingData}
            observations={observations}
            dollarValue={conversionRate}
            setObservations={setObservations}
            buyState={buyState}
            setBuyState={setBuyState}
            createOrder={createOrder}
            orderPaymentMethod={orderPaymentMethod}
            setOrderPaymentMethod={setOrderPaymentMethod}
            discountList={discountList}
            loadingOrder={loadingOrder}
            orgs={orgs}
          ></Checkout>
        )}
      </div>
    </Grid2>
  )
}
