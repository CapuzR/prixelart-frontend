import React, { useEffect, useState } from "react";
import axios from "axios";
import AppBar from "../sharedComponents/appBar/appBar";
import FloatingAddButton from "../sharedComponents/floatingAddButton/floatingAddButton";
import ArtUploader from "../sharedComponents/artUploader/artUploader";
import Button from "@material-ui/core/Button";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import utils from "../utils/utils";

import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
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

import ConsumerForm from "./consumerForm";
import OrderForm from "./orderForm";
import CartReview from "./cartReview";

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
  const steps = [`Tus datos`, `Orden de compra`];
  // const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false); //probando

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
  //   // formData.append(
  //   //   "username",
  //   //   JSON.parse(localStorage.getItem("token")).username
  //   // );
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
  const createOrder = () => {
    window.open(utils.generateWaBuyMessage(props.buyState), "_blank");
  };
  return (
    <>
      <AppBar prixerUsername={prixerUsername} />
      <Container component="main" maxWidth="s" className={classes.paper}>
        <CssBaseline />
        {props.buyState.length > 0 ? (
          <Grid
            container
            spacing={2}
            style={{ justifyContent: "space-between" }}
          >
            <CartReview
              buyState={props.buyState}
              changeQuantity={props.changeQuantity}
              deleteItemInBuyState={props.deleteItemInBuyState}
              deleteProductInItem={props.deleteProductInItem}
              setSelectedArtToAssociate={props.setSelectedArtToAssociate}
            />
            <Grid item xs={12} sm={12} md={6} lg={5} xl={6}>
              <Paper
                style={{
                  padding: "10px 10px 0px 10px",
                  marginTop: "2px",
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
                      onCreateConsumer={props.onCreateConsumer}
                      buyState={props.buyState}
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
                    disabled={props.buyState.length === 0}
                    onClick={handleNext}
                    className={classes.button}
                  >
                    {activeStep === steps.length - 1 ? "Ordenar" : "Siguiente"}
                  </Button>
                </div>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <strong>
            Actualmente no tienes ningun producto dentro del carrito de compra
          </strong>
        )}
      </Container>
    </>
  );
}
