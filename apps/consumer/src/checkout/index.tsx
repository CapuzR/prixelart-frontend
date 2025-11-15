import React, { useEffect, useState } from 'react';
import { Stepper, Step, StepLabel, Button, Typography, Box, Container } from '@mui/material';
import Grid2 from '@mui/material/Grid';

import Form from './Form';
import Order from './Order';
import CartGrid from '../cart/Grid/index';

import { initializeCheckoutState } from './init';
import { useForm, FormProvider } from 'react-hook-form';
import { useCart } from 'context/CartContext';
import { createOrderByUser } from './api';
import { parseOrder } from './parseApi';
import { useNavigate } from 'react-router-dom';
import { CartLine } from '@prixpon/types/cart.types';
import { CheckoutState, DataLists, Tax } from '@prixpon/types/order.types';
import { useSnackBar } from '@prixpon/context/GlobalContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import ReactGA from 'react-ga4';

interface CheckoutProps {
  setChecking: React.Dispatch<React.SetStateAction<boolean>>;
  checking?: boolean;
  fromPrixItem?: boolean;
}

const getErrorMessages = (errors: object): string[] => {
  const messages: string[] = [];

  const traverse = (obj: any) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (value && typeof value === 'object') {
          if (value.message && typeof value.message === 'string') {
            messages.push(value.message);
          } else {
            traverse(value);
          }
        }
      }
    }
  };

  traverse(errors);
  return messages;
};

const Checkout: React.FC<CheckoutProps> = ({ setChecking, checking, fromPrixItem }) => {
  const { cart, emptyCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  console.groupCollapsed('💼 CartContext state:');
  console.log('cart.lines:', cart.lines);
  console.log('cart.subTotal:', cart.subTotal);
  console.log('cart.totalUnits:', cart.totalUnits);
  console.log('cart.totalDiscount:', cart.totalDiscount);
  console.groupEnd();

  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  const methods = useForm<CheckoutState>({
    defaultValues: initializeCheckoutState(cart),
    mode: 'onChange',
    shouldUnregister: false,
  });

  useEffect(() => {
    const subscription = methods.watch((currentValues) => {});

    return () => {
      subscription.unsubscribe();
    };
  }, [methods.watch]);

  const [dataLists, setDataLists] = useState<DataLists>(
    methods.getValues().dataLists || {
      shippingMethods: [],
      paymentMethods: [],
      countries: [],
      states: [],
      sellers: [],
    }
  );

  const steps = isMobile
    ? [`Carrito`, `Tus datos`, `Orden de compra`, `Confirmación`]
    : [`Tus datos`, `Orden de compra`, `Confirmación`];

  const getInitialStep = () => {
    if (isMobile && fromPrixItem) {
      return 1;
    }
    return 0;
  };
  const [activeStep, setActiveStep] = useState(getInitialStep());

  useEffect(() => {
    const stepLabel = steps[activeStep];

    ReactGA.event({
      category: 'Checkout',
      action: 'step_view',
      label: `step_${activeStep}_${stepLabel.replace(/\s+/g, '_').toLowerCase()}`,
    });
  }, [activeStep, steps]);

  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      const stepLabel = steps[activeStep];
      const stepName = stepLabel.replace(/\s+/g, '_').toLowerCase();

      ReactGA.event({
        category: 'Checkout',
        action: 'step_complete',
        label: `step_${activeStep}_${stepName}`,
      });

      setActiveStep((prev) => prev + 1);
    } else {
      const stepLabel = steps[activeStep];
      const stepName = stepLabel.replace(/\s+/g, '_').toLowerCase();

      const errorMessages = getErrorMessages(methods.formState.errors);

      const errorString = errorMessages.join(' | ');

      ReactGA.event({
        category: 'Checkout',
        action: 'validation_error',
        label: `step_${activeStep}_${stepName} | errors: ${errorString || 'unknown_errors'}`,
      });

      console.warn('GA Event: Validation Error', `Step: ${stepName}`, `Errors: ${errorString}`);
    }
  };

  const handleBack = () => {
    if (activeStep === 1) {
      setChecking(false);
    }
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    console.log('Submitting form data...', methods.getValues());

    const checkoutData = methods.getValues();

    const parsedData = parseOrder(checkoutData);

    ReactGA.event({
      category: 'Checkout',
      action: 'attempt_purchase',
      label: `step_${activeStep}_confirmacion`,
    });
    try {
      const response = await createOrderByUser(parsedData);

      if (response.success === true) {
        ReactGA.event({
          category: 'Checkout',
          action: 'purchase_success',
          label: 'orden_completada',
          value: parseFloat(checkoutData.order.total) || 0,
        });

        emptyCart();
        showSnackBar(
          'Orden realizada exitosamente! Pronto serás contactado por un miembro del equipo de Prixelart para coordinar la entrega.'
        );
        navigate('/');
      } else {
        ReactGA.event({
          category: 'Checkout',
          action: 'purchase_failure',
          label: response.info || 'api_error_desconocido',
        });
      }
    } catch (error) {
      ReactGA.event({
        category: 'Checkout',
        action: 'purchase_failure',
        label: 'network_or_exception_error',
      });
      console.error('Error creating order:', error);
      showSnackBar('Hubo un error inesperado al procesar tu orden.');
    }
  };

  return (
    <Container
      maxWidth="lg"
      style={{ width: '100%', maxWidth: '100vw' }}
      sx={{ padding: isMobile ? 0 : '0 16px' }}
    >
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} align="center" gutterBottom color="secondary">
          Concreta tu compra
        </Typography>
      </Box>
      {/* )} */}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ maxWidth: '100vw' }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4, mb: 2 }}>
        {isMobile && activeStep === 0 ? (
          <Grid2
            sx={{
              display: 'flex,',
              justifyContent: 'space-between',
              minWidth: 'calc(100% - 600px)',
            }}
          >
            <CartGrid checking={checking!} />
          </Grid2>
        ) : isMobile && activeStep === 1 ? (
          <FormProvider {...methods}>
            <Form
              dataLists={dataLists}
              setDataLists={setDataLists}
              isMobile={isMobile}
              fromPrixItem={fromPrixItem}
            />
          </FormProvider>
        ) : isMobile && activeStep === 2 ? (
          (() => {
            setChecking(true);
            const checkoutState = methods.getValues();

            // Map cart lines to order lines
            checkoutState.order.lines = cart.lines.map((line: CartLine) => ({
              ...line,
              pricePerUnit: Number(line.item.price),
            }));

            // Calculate subtotal from the cart
            const subtotal = cart.lines.reduce((total: number, line: CartLine) => {
              return total + Number(line.item.price) * line.quantity;
            }, 0);

            // Perform tax calculations before sending data to the Order component
            checkoutState.order.subTotal = subtotal;

            if (checkoutState.shipping && dataLists.shippingMethods) {
              const selectedMethod = dataLists.shippingMethods.find((method) => {
                return method.name === checkoutState.shipping.name;
              });
              if (selectedMethod) {
                checkoutState.order.shippingCost = parseFloat(selectedMethod.price);
              }
            }

            const taxes: Tax[] = [];

            // IVA (16%)
            const ivaValue = 16;
            const ivaAmount = subtotal * (ivaValue / 100);
            taxes.push({
              id: 'iva',
              name: 'IVA:',
              value: ivaValue,
              amount: ivaAmount,
            });

            checkoutState.order.tax = taxes;
            const totalTaxes = taxes.reduce((sum, tax) => sum + tax.amount, 0);
            checkoutState.order.total = parseFloat((subtotal + totalTaxes).toFixed(2));

            // Now pass the updated checkoutState and subtotal to the Order component
            return <Order checkoutState={checkoutState} />;
          })()
        ) : activeStep === 0 ? (
          <FormProvider {...methods}>
            <Form
              dataLists={dataLists}
              setDataLists={setDataLists}
              isMobile={isMobile}
              fromPrixItem={fromPrixItem}
            />
          </FormProvider>
        ) : activeStep === 1 ? (
          (() => {
            setChecking(true);
            const checkoutState = methods.getValues();

            // Map cart lines to order lines
            checkoutState.order.lines = cart.lines.map((line: CartLine) => ({
              ...line,
              pricePerUnit: Number(line.item.price),
            }));

            // Calculate subtotal from the cart
            const subtotal = cart.lines.reduce((total: number, line: CartLine) => {
              return total + Number(line.item.price) * line.quantity;
            }, 0);

            // Perform tax calculations before sending data to the Order component
            checkoutState.order.subTotal = subtotal;

            if (checkoutState.shipping && dataLists.shippingMethods) {
              const selectedMethod = dataLists.shippingMethods.find((method) => {
                return method.name === checkoutState.shipping.name;
              });
              if (selectedMethod) {
                checkoutState.order.shippingCost = parseFloat(selectedMethod.price);
              }
            }

            const taxes: Tax[] = [];

            // IVA (16%)
            const ivaValue = 16;
            const ivaAmount = subtotal * (ivaValue / 100);
            taxes.push({
              id: 'iva',
              name: 'IVA:',
              value: ivaValue,
              amount: ivaAmount,
            });

            checkoutState.order.tax = taxes;
            const totalTaxes = taxes.reduce((sum, tax) => sum + tax.amount, 0);
            checkoutState.order.total = parseFloat((subtotal + totalTaxes).toFixed(2));

            // Now pass the updated checkoutState and subtotal to the Order component
            return <Order checkoutState={checkoutState} />;
          })()
        ) : (
          <div></div>
        )}
      </Box>

      {/* Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pb: 4 }}>
        <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
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
