import React, { useState, useMemo, useReducer, useCallback } from 'react';
import { Stepper, Step, StepLabel, Button, Typography, Box, Container, Grid } from '@mui/material';
import Form from './Form';
import Order from './Order';
import { Cart, CheckoutState, DataLists } from './interfaces';
import { initializeCheckoutState } from './init';
import { useForm, FormProvider } from 'react-hook-form';

interface CheckoutProps {
  cart: Cart;
  valuesConsumerForm: any;
  setValuesConsumerForm: (values: any) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart }) => {
  const methods = useForm<CheckoutState>({
    defaultValues: initializeCheckoutState(cart),
    mode: "onChange",
  });
  
  const [ dataLists, setDataLists ] = useState<DataLists>(
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

  const handleSubmit = () => {
    console.log('Order submitted!');
  };

  return (
    <Container maxWidth="md">
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
      <Box sx={{ mt: 4, mb: 4 }}>
        {
          activeStep === 0 ? (
          <FormProvider {...methods}>
            <Form dataLists={dataLists} setDataLists={setDataLists} />
          </FormProvider>
          ) : 
          activeStep === 1 ? (
            <Order checkoutState={methods.getValues()} />
          ) : 
          (<div></div>)
        }
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