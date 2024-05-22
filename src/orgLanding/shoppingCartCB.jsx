import React, { useState, useEffect } from "react";
import axios from "axios";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import Badge from "@material-ui/core/Badge";
import CB_isologo from "./assets/CB_isologo_black.svg";
import ShoppingCartOutlined from "@material-ui/icons/ShoppingCartOutlined";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import { TextField } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import Snackbar from "@material-ui/core/Snackbar";
import Paper from "@material-ui/core/Paper";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ConsumerForm from "../shoppingCart/consumerForm";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepIcon from "@material-ui/core/StepIcon";
import OrderFormCB from "./cartComponents/orderFormCB";
import { Backdrop } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { nanoid } from "nanoid";
import Modal from "@material-ui/core/Modal";
import CheckIcon from "@material-ui/icons/Check";
import isotipo from "./assets/isotipo.svg";

const useStyles = makeStyles((theme) => ({
  typography: { fontFamily: "Uncut Sans" },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
  button: {
    fontFamily: "Uncut Sans",
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
    fontFamily: "Uncut Sans",
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
}));

export default function ShoppingCartCB() {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [openModal, setOpenModal] = useState(true);
  const [values, setValues] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState(undefined);
  const [observations, setObservations] = useState();
  const [paymentVoucher, setPaymentVoucher] = useState();
  const [dollarValue, setDollarValue] = useState(1);
  const [currency, setCurrency] = useState(false);
  const [seller, setSeller] = useState();
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  let shippingCost = Number(values?.shippingMethod?.price);

  const [buyState, setBuyState] = useState(
    localStorage.getItem("CBbuyState")
      ? JSON.parse(localStorage.getItem("CBbuyState"))
      : []
  );
  const [cartLength, setCartLength] = useState(
    localStorage.getItem("CBbuyState")
      ? JSON.parse(localStorage.getItem("CBbuyState")).length
      : 0
  );

  const readDollarValue = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/dollarValue/read";
    await axios.get(base_url).then((response) => {
      setDollarValue(response.data.dollarValue);
    });
  };

  useEffect(() => {
    readDollarValue();
  }, []);

  const StyledBadge = withStyles((theme) => ({
    badge: {
      backgroundColor: "#FF9934",
      color: "black",
    },
  }))(Badge);

  const CustomStepIcon = ({ active }) => {
    const classes = useStyles();

    return (
      <StepIcon
        icon={active ? <div className={classes.stepIcon}>✔️</div> : null}
      />
    );
  };

  const handleMain = () => {
    history.push({ pathname: "/chiguirebipolar" });
  };

  const scrollToSection = (selector) => {
    const section = document.querySelector(selector);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleToProduct = () => {
    handleMain();
    setTimeout(() => {
      scrollToSection("#productos");
    }, 500);
  };

  const handleToPrixelart = () => {
    handleMain();
    setTimeout(() => {
      scrollToSection("#prixelart");
    }, 1200);
  };

  const deleteItemInBuyState = (index) => {
    const newState = [...buyState];
    newState.splice(index, 1);
    setBuyState(newState);
    localStorage.setItem("CBbuyState", JSON.stringify(newState));
    setOpen(true);
    setMessage("Item eliminado correctamente");
    setCartLength((prevLength) => prevLength - 1);
  };

  const changeQuantity = (type, index) => {
    const newState = [...buyState];
    if (type === "+1") {
      newState[index].quantity++;
    } else if (type === "-1" && newState[index].quantity > 1) {
      newState[index].quantity--;
    }
    setBuyState(newState);
    localStorage.setItem("CBbuyState", JSON.stringify(newState));
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const createOrder = async () => {
    if (orderPaymentMethod) {
      setLoading(true);
      setOpen(true);

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
      };
      const input = {
        orderId: nanoid(8),
        requests: buyState,
        basicData: {
          firstname: consumerData.firstname,
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
        tax: 0,
        subtotal: subtotal,
        shippingCost: shippingCost,
        total: total,
        createdOn: new Date(),
        createdBy: seller ? { username: seller } : "Prixelart Page",
        orderType: "Particular",
        consumerId: consumerData._id,
        status: "Por producir",
        observations: observations,
      };
      //   if (
      //     JSON.parse(localStorage.getItem("token")) &&
      //     JSON.parse(localStorage.getItem("token")).username
      //   ) {
      //     orderLines.map((item) => {
      //       item.product.publicEquation = undefined;
      //       item.product.publicPrice = undefined;
      //     });
      //     consumerData.consumerType = "Prixer";
      //     consumerData.prixerId = JSON.parse(
      //       localStorage.getItem("token")
      //     ).prixerId;
      //     input.billingData.destinatary = JSON.parse(
      //       localStorage.getItem("token")
      //     ).account;
      //   } else {
      //     orderLines.map((item) => {
      //       item.product.prixerEquation = undefined;
      //       item.product.prixerPrice = undefined;
      //     });
      //   }

      let data = {
        consumerData,
        input,
      };
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
        };
        data.movement = movement;
      }

      const base_url = process.env.REACT_APP_BACKEND_URL + "/order/createv2";
      const create = await axios
        .post(base_url, data, {
          "Content-Type": "multipart/form-data",
        })
        .then(async (response) => {
          if (response.status === 200) {
            if (paymentVoucher !== undefined) {
              const formData = new FormData();
              formData.append("paymentVoucher", paymentVoucher);
              let ID = input.orderId;
              const base_url2 =
                process.env.REACT_APP_BACKEND_URL + "/order/addVoucher/" + ID;
              await axios.put(base_url2, formData, {
                "Content-Type": "multipart/form-data",
              });
            }

            setOpenModal(true);
            // setMessage(response.data.info);
            // setMessage("¡Gracias por tu compra! Por favor revisa tu correo");

            const base_url3 =
              process.env.REACT_APP_BACKEND_URL + "/order/sendEmail";
            await axios.post(base_url3, input).then(async (response) => {
              if (response.data.success === false) {
                await axios.post(base_url3, input);
              } else return;
            });
          }
        })
        .catch((error) => {
          console.log(error.response);
        });
      //   history.push({ pathname: "/chiguirebipolar" });
      setValues(undefined);
      localStorage.removeItem("CBbuyState");
      setBuyState([]);
      setLoading(false);
    } else {
      setOpen(true);
      setMessage("Por favor selecciona una forma de pago.");
    }
  };

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <div>
            <ConsumerForm
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
        );
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
        );
    }
  }

  return (
    <>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress />
      </Backdrop>

      <AppBar
        position="fixed"
        elevation={0}
        style={{
          backgroundColor: "#white",
          zIndex: 10000,
          backgroundColor: "white",
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
            <StyledBadge badgeContent={cartLength}>
              <div style={{ color: "black" }}>
                <ShoppingCartOutlined />
              </div>
            </StyledBadge>
          </div>
        </Toolbar>
      </AppBar>

      <Grid
        container
        style={{ marginTop: 115, marginLeft: 40, paddingRight: 40 }}
      >
        <Grid item xs={7}>
          <Typography
            className={classes.typography}
            style={{ fontSize: 30, width: "100%", marginBottom: 30 }}
          >
            Carrito de compras
          </Typography>

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
                <Grid item xs={7} style={{ display: "flex" }}>
                  <img
                    src={item?.art?.images[0]?.img}
                    alt="Item de Chiguire Bipolar"
                    style={{
                      width: 170,
                      height: 115,
                      borderRadius: 15,
                      marginRight: 10,
                    }}
                  />
                  <div
                    style={{
                      width: 170,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      className={classes.typography}
                      style={{ fontSize: 20 }}
                    >
                      {item?.product?.name} {item.art.title}
                    </Typography>
                    <Typography
                      className={classes.typography}
                      style={{ fontSize: 14 }}
                    >
                      {item?.product?.selection}
                    </Typography>
                  </div>
                </Grid>

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
                      {item?.product?.finalPrice?.toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                  </div>

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      style={{
                        width: 30,
                        height: 32,
                        textAlign: "center",
                        marginRight: 10,
                      }}
                      onClick={() => deleteItemInBuyState(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Grid>
              </Grid>
            ))}
        </Grid>

        <Grid item xs={5} style={{ padding: 20 }}>
          <Paper
            elevation={4}
            style={{
              width: "100%",
              //   margin: 40,
              padding: 20,
              borderRadius: 30,
              //   paddingRight: 20,
            }}
          >
            <Stepper activeStep={activeStep}>
              {["Tus datos", "Orden de compra"].map((label, index) => {
                const stepProps = {};
                const labelProps = {
                  StepIconComponent: CustomStepIcon,
                };

                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
            <div className={classes.instructions}>
              {getStepContent(activeStep)}
            </div>
          </Paper>
          {/* <Paper
            elevation={4}
            style={{
              width: "100%",
              margin: 40,
              padding: "40px 18px",
              borderRadius: 30,
              paddingRight: 20,
            }}
          >
            <Typography>Tus Datos</Typography>
            <Accordion
              className={classes.accordion}

              //   expanded={expanded === "basic"}
              //   onChange={handleAccordionExpansion("basic")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  className={classes.typography}
                  style={{ fontSize: 16, width: "100%", color: "#666666" }}
                >
                  Datos básicos
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <form autoComplete="off">
                  <Grid container spacing={2}>
                    <Grid
                      item
                      lg={4}
                      md={4}
                      sm={4}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <TextField
                        variant="outlined"
                        id="Nombre"
                        label="Nombre"
                        fullWidth
                        className={classes.textField}
                        // value={props.values?.name ? props.values.name : ""}
                        // onChange={(e) =>
                        //   props.setValues({
                        //     ...props.values,
                        //     name: e.target.value,
                        //   })
                        // }
                        required
                        // error={!validations.isAValidName(props.values?.name)}
                        // helperText={
                        //   !validations.isAValidName(props.values?.name) &&
                        //   props.values.name !== undefined &&
                        //   "Formato no válido."
                        // }
                      />
                    </Grid>
                    <Grid
                      item
                      lg={4}
                      md={4}
                      sm={4}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <TextField
                        variant="outlined"
                        id="standard-name"
                        label="Apellido"
                        fullWidth
                        className={classes.textField}
                        // value={
                        //   props.values?.lastName ? props.values.lastName : ""
                        // }
                        required
                        // onChange={(e) =>
                        //   props.setValues({
                        //     ...props.values,
                        //     lastName: e.target.value,
                        //   })
                        // }
                        // error={
                        //   !validations.isAValidName(props.values?.lastName)
                        // }
                        // helperText={
                        //   !validations.isAValidName(props.values?.lastName) &&
                        //   props.values.lastName !== undefined &&
                        //   "Formato no válido."
                        // }
                      />
                    </Grid>

                    <Grid
                      item
                      lg={4}
                      md={4}
                      sm={4}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <TextField
                        variant="outlined"
                        id="standard-name"
                        label="CI o RIF"
                        fullWidth
                        className={classes.textField}
                        // value={props.values?.ci ? props.values.ci : ""}
                        // onChange={(e) =>
                        //   props.setValues({
                        //     ...props.values,
                        //     ci: e.target.value,
                        //   })
                        // }
                        required
                        // error={
                        //   props.values?.ci !== undefined &&
                        //   !validations.isAValidCi(props.values?.ci)
                        // }
                        // InputProps={{
                        //   endAdornment: (
                        //     <Tooltip
                        //       onClick={(e) => setOpenTooltip(!openTooltip)}
                        //       open={openTooltip}
                        //       onClose={(leaveDelay) => setOpenTooltip(false)}
                        //       title={
                        //         !validations.isAValidCi(props.values?.ci) &&
                        //         props.values?.ci !== undefined
                        //           ? "ej: V12345679 ó 12345678 \n" +
                        //             "Formato no válido."
                        //           : "ej: V12345679 ó 12345678"
                        //       }
                        //     >
                        //       <InfoIcon color="secondary" />
                        //     </Tooltip>
                        //   ),
                        // }}
                      />
                    </Grid>
                    <Grid
                      item
                      lg={5}
                      md={5}
                      sm={5}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <TextField
                        variant="outlined"
                        id="standard-name"
                        label="Telefono"
                        fullWidth
                        className={classes.textField}
                        // value={props.values?.phone ? props.values.phone : ""}
                        // onChange={(e) =>
                        //   props.setValues({
                        //     ...props.values,
                        //     phone: e.target.value,
                        //   })
                        // }
                        required

                        // error={
                        //   props.values?.phone !== undefined &&
                        //   !validations.isAValidPhoneNum(props.values?.phone)
                        // }
                        // InputProps={{
                        //   startAdornment: (
                        //     <InputAdornment position="start">
                        //       <LocalPhoneIcon color="secondary" />
                        //     </InputAdornment>
                        //   ),
                        //   endAdornment: (
                        //     <Tooltip
                        //       onClick={(e) => setOpenTooltipPh(!openTooltipPh)}
                        //       open={openTooltipPh}
                        //       onClose={(leaveDelay) => setOpenTooltipPh(false)}
                        //       title={
                        //         !validations.isAValidPhoneNum(
                        //           props.values?.phone
                        //         ) && props.values?.phone !== undefined ? (
                        //           <div>
                        //             <div>
                        //               ej: 584141234567 ó +584141234567 ó
                        //               04143201028
                        //             </div>
                        //             Formato no válido.
                        //           </div>
                        //         ) : (
                        //           "ej: 584141234567 ó +584141234567 ó 04143201028"
                        //         )
                        //       }
                        //     >
                        //       <InfoIcon color="secondary" />
                        //     </Tooltip>
                        //   ),
                        // }}
                      />
                    </Grid>
                    <Grid
                      item
                      lg={7}
                      md={7}
                      sm={7}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <TextField
                        variant="outlined"
                        label="Correo"
                        fullWidth
                        className={classes.textField}
                        // value={props.values?.email ? props.values.email : ""}
                        // helperText={
                        //   !validations.isAValidEmail(props.values?.email) &&
                        //   props.values.email !== undefined &&
                        //   "Formato no válido."
                        // }
                        // onChange={(e) =>
                        //   props.setValues({
                        //     ...props.values,
                        //     email: e.target.value,
                        //   })
                        // }
                        // error={!validations.isAValidEmail(props.values?.email)}
                        required

                        // InputProps={{
                        //   startAdornment: (
                        //     <InputAdornment position="start">
                        //       <EmailIcon color="secondary" />
                        //     </InputAdornment>
                        //   ),
                        // }}
                      />
                    </Grid>
                    <Grid
                      item
                      lg={12}
                      md={12}
                      sm={12}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <TextField
                        variant="outlined"
                        id="standard-name"
                        fullWidth
                        label="Dirección"
                        className={classes.textField}
                        helperText="Incluir todos los detalles posibles, incluidas referencias."
                        // value={
                        //   props.values?.address ? props.values.address : ""
                        // }
                        required
                        // onChange={(e) =>
                        //   props.setValues({
                        //     ...props.values,
                        //     address: e.target.value,
                        //   })
                        // }

                        // InputProps={{
                        //   startAdornment: (
                        //     <InputAdornment position="start">
                        //       <HomeIcon color="secondary" />
                        //     </InputAdornment>
                        //   ),
                        // }}
                      />
                    </Grid>
                  </Grid>
                </form>
              </AccordionDetails>
            </Accordion>

            <Accordion
            //   expanded={expanded === "shipping"}
            //   onChange={handleAccordionExpansion("shipping")}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Datos de Entrega</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <form autoComplete="off">
                  <Grid container>
                    <Grid item lg={12} md={12} sm={12} xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                          // checked={shippingDataCheck}
                          // onChange={() => {
                          //   handleShippingDataCheck();
                          // }}
                          />
                        }
                        label="Igual a datos básicos"
                      />
                    </Grid>
                    <Grid
                      item
                      lg={4}
                      md={4}
                      sm={4}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <TextField
                        variant="outlined"
                        label="Nombre"
                        fullWidth
                        className={classes.textField}
                        // disabled={shippingDataCheck}
                        // value={
                        //   shippingDataCheck
                        //     ? props.values?.name
                        //       ? props.values.name
                        //       : ""
                        //     : props.values.shippingName
                        // }
                        // onChange={(e) =>
                        //   props.setValues({
                        //     ...props.values,
                        //     shippingName: e.target.value,
                        //   })
                        // }
                        // error={
                        //   !validations.isAValidName(props.values?.shippingName)
                        // }
                        required
                      />
                    </Grid>
                    <Grid
                      item
                      lg={4}
                      md={4}
                      sm={4}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <TextField
                        variant="outlined"
                        label="Apellido"
                        fullWidth
                        // disabled={shippingDataCheck}
                        className={classes.textField}
                        // value={
                        //   shippingDataCheck
                        //     ? props.values?.lastName
                        //       ? props.values.lastName
                        //       : ""
                        //     : props.values.shippingLastName
                        // }
                        required
                        // onChange={(e) =>
                        //   props.setValues({
                        //     ...props.values,
                        //     shippingLastName: e.target.value,
                        //   })
                        // }
                        // error={
                        //   !validations.isAValidName(props.values?.shippingLastName)
                        // }
                      />
                    </Grid>
                    <Grid
                      item
                      lg={4}
                      md={4}
                      sm={4}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <TextField
                        variant="outlined"
                        label="Telefono"
                        fullWidth
                        // disabled={shippingDataCheck}
                        className={classes.textField}
                        // value={
                        //   shippingDataCheck
                        //     ? props.values?.phone
                        //       ? props.values.phone
                        //       : ""
                        //     : props.values.shippingPhone
                        // }
                        // onChange={(e) => {
                        //   props.setValues({
                        //     ...props.values,
                        //     shippingPhone: e.target.value,
                        //   });
                        // }}
                        required
                        // error={
                        //   props.values?.shippingPhone !== undefined &&
                        //   props.values?.shippingPhone !== "" &&
                        //   !validations.isAValidPhoneNum(props.values?.shippingPhone)
                        // }
                        // InputProps={{
                        //   startAdornment: (
                        //     <InputAdornment position="start">
                        //       <LocalPhoneIcon color="secondary" />
                        //     </InputAdornment>
                        //   ),
                        //   endAdornment: (
                        //     <Tooltip
                        //       onClick={(e) => setOpenTooltipPh2(!openTooltipPh2)}
                        //       open={openTooltipPh2}
                        //       onClose={(leaveDelay) => setOpenTooltipPh2(false)}
                        //       title={
                        //         !validations.isAValidPhoneNum(
                        //           props.values?.phone
                        //         ) && props.values?.phone !== undefined ? (
                        //           <div>
                        //             <div>
                        //               ej: 584141234567 ó +584141234567 ó 04143201028
                        //             </div>
                        //             Formato no válido.
                        //           </div>
                        //         ) : (
                        //           "ej: 584141234567 ó +584141234567 ó 04143201028"
                        //         )
                        //       }
                        //     >
                        //       <InfoIcon color="secondary" />
                        //     </Tooltip>
                        //   ),
                        // }}
                      />
                    </Grid>
                    <Grid
                      item
                      lg={12}
                      md={12}
                      sm={12}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <TextField
                        variant="outlined"
                        fullWidth
                        label="Dirección de envio"
                        className={classes.textField}
                        // disabled={shippingDataCheck}
                        helperText="Incluir todos los detalles posibles, incluidas referencias."
                        // value={
                        //   shippingDataCheck
                        //     ? props.values?.address
                        //       ? props.values.address
                        //       : ""
                        //     : props.values.shippingAddress
                        // }
                        required
                        // onChange={(e) =>
                        //   props.setValues({
                        //     ...props.values,
                        //     shippingAddress: e.target.value,
                        //   })
                        // }
                        // InputProps={{
                        //   startAdornment: (
                        //     <InputAdornment position="start">
                        //       <HomeIcon color="secondary" />
                        //     </InputAdornment>
                        //   ),
                        // }}
                      />
                    </Grid>
                    <Grid
                      item
                      lg={6}
                      md={6}
                      sm={12}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <FormControl
                        style={{ minWidth: "100%" }}
                        variant="outlined"
                      >
                        <InputLabel>Método de entrega</InputLabel>
                        <Select
                          label="Método de entrega"
                          className={classes.textField}
                          //   value={props.values?.shippingMethod || ""}
                          //   onChange={(e) => {
                          //     props.setValues({
                          //       ...props.values,
                          //       shippingMethod: e.target.value,
                          //     });
                          //   }}
                        >
                          <MenuItem value="">
                            <em></em>
                          </MenuItem>
                          {/* {shippingList &&
                        shippingList.map((n) => (
                          <MenuItem value={n}>{n.name}</MenuItem>
                        ))} 
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid
                      item
                      lg={6}
                      md={6}
                      sm={12}
                      xs={12}
                      className={classes.gridInput}
                    >
                      <FormControl
                        style={{ minWidth: "100%" }}
                        variant="outlined"
                      >
                        <TextField
                          style={{
                            width: "100%",
                          }}
                          label="Fecha de Entrega"
                          type="date"
                          variant="outlined"
                          format="dd-MM-yyyy"
                          //   value={props.values?.today}
                          //   error={props.values?.today < stringReadyDate}
                          className={classes.textField}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          //   onChange={(e) => {
                          //     selectShDate(e.target.value);
                          //   }}
                        />
                      </FormControl>
                    </Grid>
                    <Grid>
                      {/* <div style={{ marginTop: 10, marginLeft: 10 }}>
                    {"Tu pedido estará listo el día " +
                      days[readyDate.getDay()] +
                      " " +
                      readyDate.getDate() +
                      " de " +
                      months[readyDate.getMonth()] +
                      ", si está listo antes te lo notificaremos."}
                  </div>
                    </Grid>
                  </Grid>
                </form>
              </AccordionDetails>
            </Accordion>
            
            <Accordion
        //   expanded={expanded === "billing"}
        //   onChange={handleAccordionExpansion("billing")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography>Datos de Facturación</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <form autoComplete="off">
              <Grid container>
                <Grid
                  item
                  lg={12}
                  md={12}
                  sm={12}
                  xs={12}
                  // className={classes.gridInput}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                     
                      
                      />
                    }
                    label="Igual a datos básicos"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={billingShDataCheck}
                        onChange={(e) => {
                          if (billingDataCheck) {
                            setBillingShDataCheck(!billingShDataCheck);
                            setBillingDataCheck(!billingDataCheck);
                          } else {
                            setBillingShDataCheck(!billingShDataCheck);
                          }
                        }}
                      />
                    }
                    label="Igual a datos de envío"
                  />
                </Grid>
                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Nombre"
                    fullWidth
                    className={classes.textField}
                    disabled={billingDataCheck || billingShDataCheck}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingName
                          ? props.values.shippingName
                          : ""
                        : billingDataCheck
                        ? props.values?.name
                          ? props.values.name
                          : ""
                        : props.values.billingShName || ""
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingShName: e.target.value,
                      })
                    }
                    required
                    margin="normal"
                    error={
                      !validations.isAValidName(props.values?.billingShName)
                    }
                  />
                </Grid>
                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Apellido"
                    fullWidth
                    className={classes.textField}
                    disabled={billingDataCheck || billingShDataCheck}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingLastName
                          ? props.values.shippingLastName
                          : ""
                        : billingDataCheck
                        ? props.values?.lastName
                          ? props.values.lastName
                          : ""
                        : props.values.billingShLastName || ""
                    }
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingShLastName: e.target.value,
                      })
                    }
                    margin="normal"
                    error={
                      !validations.isAValidName(props.values?.billingShLastName)
                    }
                  />
                </Grid>
                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Cédula o RIF"
                    fullWidth
                    className={classes.textField}
                    disabled={billingDataCheck || billingShDataCheck}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingCi
                          ? props.values.shippingCi
                          : ""
                        : billingDataCheck
                        ? props.values?.ci
                          ? props.values.ci
                          : ""
                        : props.values.billingCi || ""
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingCi: e.target.value,
                      })
                    }
                    required
                    error={
                      props.values?.ci !== undefined &&
                      !validations.isAValidCi(props.values?.ci)
                    }
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <Tooltip
                          onClick={(e) => setOpenTooltip2(!openTooltip2)}
                          open={openTooltip2}
                          onClose={(leaveDelay) => setOpenTooltip2(false)}
                          title={
                            !validations.isAValidCi(props.values?.ci) &&
                            props.values?.ci !== undefined
                              ? "ej: V12345679 ó J000123456 \n" +
                                "Formato no válido."
                              : "ej: V12345679 ó J000123456"
                          }
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
                <Grid
                  item
                  lg={8}
                  md={8}
                  sm={8}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Razón Social"
                    fullWidth
                    className={classes.textField}
                    disabled={billingDataCheck || billingShDataCheck}
                    value={props.values?.billingCompany || ""}
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingCompany: e.target.value,
                      })
                    }
                    required
                    margin="normal"
                    // error={!validations.isAValidName(props.values?.billingShName)}
                  />
                </Grid>

                <Grid
                  item
                  lg={4}
                  md={4}
                  sm={4}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    label="Telefono"
                    fullWidth
                    disabled={billingDataCheck || billingShDataCheck}
                    className={classes.textField}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingPhone
                          ? props.values.shippingPhone
                          : ""
                        : billingDataCheck
                        ? props.values?.phone
                          ? props.values.phone
                          : ""
                        : props.values.billingShPhone || ""
                    }
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingShPhone: e.target.value,
                      })
                    }
                    required
                    margin="normal"
                    error={
                      !validations.isAValidPhoneNum(
                        props.values?.billingShPhone
                      ) && props.values?.billingShPhone !== undefined
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalPhoneIcon color="secondary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <Tooltip
                          onClick={(e) => setOpenTooltipPh3(!openTooltipPh3)}
                          open={openTooltipPh3}
                          onClose={(leaveDelay) => setOpenTooltipPh3(false)}
                          title={
                            !validations.isAValidPhoneNum(
                              props.values?.phone
                            ) && props.values?.phone !== undefined ? (
                              <div>
                                <div>
                                  ej: 584141234567 ó +584141234567 ó 04143201028
                                </div>
                                Formato no válido.
                              </div>
                            ) : (
                              "ej: 584141234567 ó +584141234567 ó 04143201028"
                            )
                          }
                        >
                          <InfoIcon color="secondary" />
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
                <Grid
                  item
                  lg={12}
                  md={12}
                  sm={12}
                  xs={12}
                  className={classes.gridInput}
                >
                  <TextField
                    variant="outlined"
                    id="standard-name"
                    fullWidth
                    label="Dirección de facturación"
                    multiline
                    minRows={3}
                    disabled={billingDataCheck || billingShDataCheck}
                    className={classes.textField}
                    value={
                      billingShDataCheck
                        ? props.values?.shippingAddress
                          ? props.values.shippingAddress
                          : ""
                        : billingDataCheck
                        ? props.values?.address
                          ? props.values.address
                          : ""
                        : props.values.billingShAddress || ""
                    }
                    required
                    onChange={(e) =>
                      props.setValues({
                        ...props.values,
                        billingShAddress: e.target.value,
                      })
                    }
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </form>
          </AccordionDetails>
        </Accordion>
          </Paper> */}
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={5000}
        message={message}
        onClose={() => setOpen(false)}
      />
      <Modal open={openModal} onClose={handleClose} className={classes.modal}>
        <Grid container className={classes.paper2}>
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
            <Typography className={classes.typography} style={{ fontSize: 16 }}>
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
            onClick={() => handleMain()}
          >
            Volver
          </Button>
        </Grid>
      </Modal>
    </>
  );
}
