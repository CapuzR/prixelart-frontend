import React, { useState } from "react";
import axios from "axios";
import Grid from "@material-ui/core/Grid";
import { useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import { Typography } from "@material-ui/core";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import ConsumerData from "./consumerData";
import ShoppingCart from "./shoppingCart";
import Checkout from "./checkout";
import { nanoid } from "nanoid";
const drawerWidth = 240;

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
}));
export default function CreateOrder(props) {
  const classes = useStyles();
  const theme = useTheme();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [activeStep, setActiveStep] = React.useState(0);
  const [basicData, setBasicData] = useState();
  const [shippingData, setShippingData] = useState();
  const [billingData, setBillingData] = useState();
  const [isShowDetails, setIsShowDetails] = useState(false);
  const [openCreateOrder, setOpenCreateOrder] = useState(false);
  const [count, setCount] = useState(0);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState(undefined);
  const [observations, setObservations] = useState();
  const steps = [`Datos del comprador`, `Productos`, `Orden de compra`];

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  let shippingCost = Number(props.values?.shippingMethod?.price);

  const getIvaCost = (state) => {
    let iva = getTotalPrice(state) * 0.16;
    return iva;
  };

  const getTotal = (x) => {
    let n = [];
    n.push(getTotalPrice(props.buyState));
    n.push(getIvaCost(props.buyState));
    {
      props.values?.shippingMethod && n.push(shippingCost);
    }
    let total = n.reduce(function (a, b) {
      return a + b;
    });
    return total;
  };

  const getTotalPrice = (state) => {
    let prices = [0];
    state.map((item) => {
      if (item.product.modifyPrice) {
        prices.push(Number(item.product.publicEquation));
      } else if (
        item.product &&
        item.art &&
        typeof item.product.discount === "string"
      ) {
        let dis = props.discountList?.find(
          ({ _id }) => _id === item.product.discount
        );
        if (dis?.type === "Porcentaje") {
          prices.push(
            ((item.product?.publicEquation ||
              item.product?.publicPrice?.from.replace(/[,]/gi, ".")) -
              ((item.product?.publicEquation ||
                item.product?.publicPrice?.from.replace(/[,]/gi, ".")) /
                100) *
                dis.value) *
              (item.quantity || 1)
          );
        } else if (dis?.type === "Monto") {
          prices.push(
            ((item.product?.publicEquation ||
              item.product?.publicPrice?.from.replace(/[,]/gi, ".")) -
              dis.value) *
              (item.quantity || 1)
          );
        }
      } else if (item.product && item.art) {
        prices.push(
          (item.product?.publicEquation || item.product?.publicPrice?.from) *
            (item.quantity || 1)
        );
      }
    });
    let total = prices?.reduce(function (a, b) {
      return a + b;
    });
    return total;
  };

  const createOrder = async () => {
    props.setLoading(true);

    let orderLines = [];

    props.buyState.map((s) => {
      s.product &&
        s.art &&
        orderLines.push({
          product: s.product,
          art: s.art,
          quantity: s.quantity,
        });
    });
    const consumerData = {
      _id: nanoid(6),
      active: true,
      contactedBy:
        JSON.parse(localStorage.getItem("adminToken")).firstname +
        " " +
        JSON.parse(localStorage.getItem("adminToken")).lastname,
      consumerType: "Particular",
      firstname: basicData?.name,
      lastname: basicData?.lastname,
      ci: basicData?.ci,
      phone: basicData?.phone,
      email: basicData?.email,
      address: basicData?.address,
      billingAddress: billingData?.address || basicData?.address,
      shippingAddress: shippingData?.address || basicData?.address,
    };

    await axios.post(
      process.env.REACT_APP_BACKEND_URL + "/consumer/create",
      consumerData
    );

    const base_url = process.env.REACT_APP_BACKEND_URL + "/order/create";
    let input = {
      orderId: nanoid(6),
      requests: orderLines,
      basicData: basicData,
      shippingData: shippingData,
      billingData: billingData,
      dollarValue: props.dollarValue,
      observations: observations,
      tax: getTotalPrice(props.buyState) * 0.16,
      subtotal: getTotalPrice(props.buyState),
      shippingCost: shippingCost,
      total: getTotal(props.buyState),
      createdOn: new Date(),
      createdBy: {
        username:
          JSON.parse(localStorage.getItem("adminToken")).firstname +
          " " +
          JSON.parse(localStorage.getItem("adminToken")).lastname,
      },
      consumerId: consumerData._id,
      orderType: "Particular",
      status: "Por producir",
    };
    const base_url3 = process.env.REACT_APP_BACKEND_URL + "/order/sendEmail";

    await axios.post(base_url, input).then(async () => {
      console.log("Orden generada correctamente. Por favor, revisa tu email");
      //   await axios.post(base_url3, input).then(async (response) => {
      //     if (response.data.success === false) {
      //       await axios.post(base_url3, input);
      //     } else return;
      //   });
    });
    setOpenCreateOrder(false);
    setBasicData();
    setShippingData();
    setBillingData();
    // Falta borrar dato por dato creo
    localStorage.removeItem("buyState");
    props.setBuyState([]);
    props.readOrders();
    props.setLoading(false);
  };

  return (
    <Grid
      container
      spacing={2}
      style={{ justifyContent: "space-between", alignItems: "center" }}
      className={classes.paper2}
    >
      <Grid
        item
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

        <IconButton onClick={props.handleClose}>
          <CloseIcon />
        </IconButton>
      </Grid>
      <Stepper activeStep={activeStep} nonLinear style={{ width: "100%" }}>
        {steps.map((label, index) => {
          return (
            <Step key={label} {...props}>
              <StepButton onClick={handleStep(index)}>{label}</StepButton>
            </Step>
          );
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
            buyState={props.buyState}
            basicData={basicData}
            shippingData={shippingData}
            billingData={billingData}
            setBasicData={setBasicData}
            setShippingData={setShippingData}
            setBillingData={setBillingData}
          />
        )}
        {activeStep === 1 && (
          <ShoppingCart
            buyState={props.buyState}
            discountList={props.discountList}
            AssociateProduct={props.AssociateProduct}
            setSelectedArtToAssociate={props.setSelectedArtToAssociate}
            setSelectedProductToAssociate={props.setSelectedProductToAssociate}
            setBuyState={props.setBuyState}
            addItemToBuyState={props.addItemToBuyState}
            changeQuantity={props.changeQuantity}
            deleteItemInBuyState={props.deleteItemInBuyState}
          />
        )}
        {activeStep === 2 && (
          <Checkout
            basicData={basicData}
            shippingData={shippingData}
            billingAddress={billingData}
            setBillingData={setBillingData}
            observations={observations}
            dollarValue={props.dollarValue}
            setObservations={setObservations}
            buyState={props.buyState}
            createOrder={createOrder}
            orderPaymentMethod={orderPaymentMethod}
            setOrderPaymentMethod={setOrderPaymentMethod}
          ></Checkout>
        )}
      </div>
    </Grid>
  );
}