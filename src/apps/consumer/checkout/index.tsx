import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Button, Typography, Box, Container, Grid, Snackbar } from '@mui/material';
import Form from './Form';
import Order from './Order';
import { CheckoutState, DataLists } from './interfaces';
import { initializeCheckoutState } from './init';
import { useForm, FormProvider } from 'react-hook-form';
import { useCart } from '@context/CartContext';
import { createOrderByUser } from './api';
import { parseOrder } from './parseApi';
import { useNavigate } from 'react-router-dom';

const Checkout: React.FC = () => {

  const { cart, emptyCart } = useCart();
  const [snackBar, setSnackBar] = useState(false);
  const navigate = useNavigate();

  const methods = useForm<CheckoutState>({
    defaultValues: initializeCheckoutState(cart),
    mode: "onChange",
    shouldUnregister: false,
  });

  const [dataLists, setDataLists] = useState<DataLists>(
    methods.getValues().dataLists || {
      shippingMethods: [],
      paymentMethods: [],
      countries: [],
      states: [],
      sellers: [],
    });

  const steps = [`Tus datos`, `Orden de compra`, `Confirmación`];

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const closeAd = () => {
    setSnackBar(false);
    navigate('/');
  };

  const handleSubmit = async () => {
    const checkoutData = methods.getValues();

    const parsedData = parseOrder(checkoutData);
    const response = await createOrderByUser(parsedData);

    if (response.status === 'ok') {
      emptyCart();
      <Snackbar
        open={snackBar}
        autoHideDuration={5000}
        message={"Orden realizada exitosamente! Pronto serás contactado por un miembro del equipo de Prixelart para coordinar la entrega. El Id de tu orden es: " + response.orderId}
        onClick={closeAd}
      />
    }
  };

  return (
    <Container maxWidth="md" style={{ width: '100%' }}>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Concreta tu compra
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Form Content */}
      <Box sx={{ mt: 4, mb: 2 }}>
        {
          activeStep === 0 ? (
            <FormProvider {...methods}>
              <Form dataLists={dataLists} setDataLists={setDataLists} />
            </FormProvider>
          ) :
            activeStep === 1 ? (
              (() => {
                const checkoutState = methods.getValues();
                return <Order checkoutState={checkoutState} />;
              })()
            ) : (
              <div></div>
            )}
      </Box>

      {/* Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Anterior
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Ordenar' : 'Siguiente'}
        </Button>
      </Box>
    </Container>
  );
};

export default Checkout;