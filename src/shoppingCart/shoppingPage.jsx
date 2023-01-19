import React, { useEffect, useState } from "react";
import axios from "axios";
import AppBar from "../sharedComponents/appBar/appBar";
import Button from "@material-ui/core/Button";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import utils from "../utils/utils";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import Img from "react-cool-img";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import { useHistory } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import { Typography } from "@material-ui/core";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import { Backdrop } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import ConsumerForm from "./consumerForm";
import OrderForm from "./orderForm";
import CartReview from "./cartReview";
import { nanoid } from "nanoid";
import validations from "./validations";

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
}));

export default function ShoppingPage(props) {
  const prixerUsername = "all";
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isIphone = useMediaQuery(theme.breakpoints.down("xs"));
  const [orderPaymentMethod, setOrderPaymentMethod] = useState(undefined);
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = useState(false);
  const steps = [`Tus datos`, `Orden de compra`];

  // useEffect(() => {
  //   {
  //     JSON.parse(localStorage.getItem("token")) && TermsAgreeModal();
  //   }

  //   return () => {
  //     localStorage.removeItem("filterCategorie");
  //   };
  // }, []);

  // const getTerms = () => {
  //   const base_url =
  //     process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/read";
  //   axios
  //     .get(base_url)
  //     .then((response) => {
  //       setValue(response.data.terms.termsAndConditions);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  // const handleSubmit = async (e, Id) => {
  //   e.preventDefault();
  //   const formData = new FormData();
  //   const termsAgree = true;
  //   formData.append("termsAgree", termsAgree);
  //   formData.append(
  //     "username",
  //     JSON.parse(localStorage.getItem("token")).username
  //   );
  //   const base_url =
  //     process.env.REACT_APP_BACKEND_URL + "/prixer/update-terms/" + Id;
  //   const response = await axios
  //     .put(
  //       base_url,
  //       { termsAgree: true },
  //       {
  //         "Content-Type": "multipart/form-data",
  //       }
  //     )
  //     .then((response) => {
  //       setTermsAgreeVar(true);
  //     });
  // };

  // const TermsAgreeModal = () => {
  //   const GetId = JSON.parse(localStorage.getItem("token")).username;
  //   const base_url = process.env.REACT_APP_BACKEND_URL + "/prixer/get/" + GetId;
  //   axios.get(base_url).then((response) => {
  //     setTermsAgreeVar(response.data.termsAgree);
  //     getTerms();
  //   });
  // };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const getTotalPrice = (state) => {
    let prices = [];
    state.map(
      (item) =>
        item.product &&
        item.art &&
        prices.push(
          (item.product.publicEquation ||
            item.product.publicPrice.from.replace(/[$]/gi, "")) *
            (item.quantity || 1)
        )
    );
    let total = prices.reduce(function (a, b) {
      return a + b;
    });
    return total;
  };

  // console.log(props.valuesConsumerForm?.email);

  const createOrder = async () => {
    if (orderPaymentMethod) {
      setLoading(true);
      props.setOpen(true);
      props.setMessage(
        "¡Gracias por tu compra! te redireccionaremos a Whatsapp para ser atendido por nuestro departamento de ventas."
      );

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

      const consumer = await axios.post(
        process.env.REACT_APP_BACKEND_URL + "/consumer/create",
        {
          active: true,
          contactedBy: {
            username: "web",
            id: 1,
            phone: "",
            email: "hola@prixelart.com",
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
      );
      // window.open(utils.generateWaBuyMessage(orderLines), "_blank");

      const base_url = process.env.REACT_APP_BACKEND_URL + "/order/create";
      let input = {
        orderId: nanoid(6),
        requests: orderLines,
        basicData: {
          firstname: consumer.data.newConsumer.firstname,
          lastname: consumer.data.newConsumer.lastname,
          ci: consumer.data.newConsumer.ci,
          email: consumer.data.newConsumer.email,
          phone: consumer.data.newConsumer.phone,
        },
        shippingData: {
          name: props.valuesConsumerForm?.shippingName,
          lastname: props.valuesConsumerForm?.shippingLastName,
          phone: props.valuesConsumerForm?.shippingPhone,
          address: props.valuesConsumerForm?.shippingAddress,
          internalShippingMethod: props.valuesConsumerForm?.shippingAgencyLocal,
          domesticShippingMethod:
            props.valuesConsumerForm?.shippingAgencyNational,
          internationalShippingMethod:
            props.valuesConsumerForm?.shippingAgencyInternational,
        },
        billingData: {
          name: props.valuesConsumerForm?.billingShName,
          lastname: props.valuesConsumerForm?.billingShLastName,
          ci: props.valuesConsumerForm?.billingCi,
          company: props.valuesConsumerForm?.billingCompany,
          phone: props.valuesConsumerForm?.billingPhone,
          address: props.valuesConsumerForm?.billingAddress,
          orderPaymentMethod: orderPaymentMethod,
        },
        tax: getTotalPrice(props.buyState) * 0.16,
        subtotal: getTotalPrice(props.buyState),
        total:
          getTotalPrice(props.buyState) + getTotalPrice(props.buyState) * 0.16,
        createdOn: new Date(),
        createdBy: consumer.data.newConsumer,
        orderType: "Particular",
        // consumerId: consumer.data.newConsumer._id,
        status: "Procesando",
      };
      const order = await axios.post(base_url, input).then(() => {
        console.log("Orden generada correctamente. Por favor, revisa tu email");
      });
      history.push({ pathname: "/" });
      props.setValuesConsumerForm(undefined);
      localStorage.removeItem("buyState");
      props.setBuyState([]);
      setLoading(false);
    } else {
      props.setOpen(true);
      props.setMessage("Por favor selecciona una forma de pago.");
    }
  };

  return (
    <>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress />
      </Backdrop>
      <AppBar prixerUsername={prixerUsername} />
      <Container component="main" maxWidth="s" className={classes.paper}>
        <CssBaseline />
        {props.buyState.length > 0 ? (
          <Grid
            container
            spacing={2}
            style={{ justifyContent: "space-between" }}
          >
            <Grid item xs={12} sm={12} md={6} lg={7} xl={7}>
              <CartReview
                buyState={props.buyState}
                changeQuantity={props.changeQuantity}
                deleteItemInBuyState={props.deleteItemInBuyState}
                deleteProductInItem={props.deleteProductInItem}
                setSelectedArtToAssociate={props.setSelectedArtToAssociate}
              />
            </Grid>

            <Grid item xs={12} sm={12} md={6} lg={5} xl={5}>
              <Paper
                style={{
                  padding: "10px 10px 0px 10px",
                  marginTop: "150px",
                  // height: "500px",
                  // display: "flex",
                  width: "100%",
                }}
                elevation={3}
              >
                <Stepper activeStep={activeStep}>
                  {steps.map((label, index) => {
                    return (
                      <Step key={label} {...props}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    );
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
                    />
                  ) : (
                    <OrderForm
                      valuesConsumer={props.valuesConsumerForm}
                      setValuesConsumer={props.setValues}
                      onCreateConsumer={props.onCreateConsumer}
                      buyState={props.buyState}
                      setBuyState={props.setBuyState}
                      orderPaymentMethod={orderPaymentMethod}
                      setOrderPaymentMethod={setOrderPaymentMethod}
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
          <div style={{ marginTop: 100 }}>
            <Typography variant={"h6"} align={"Center"}>
              Actualmente no tienes ningun producto dentro del carrito de
              compra.
            </Typography>
          </div>
        )}
      </Container>
    </>
  );
}
