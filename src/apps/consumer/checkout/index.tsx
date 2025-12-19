import React, { useEffect, useState, useRef } from 'react';
import { Stepper, Step, StepLabel, Button, Typography, Box, Container } from '@mui/material';
import Grid2 from '@mui/material/Grid';

import Form from './Form';
import Order from './Order';
import CartGrid from '../cart/Grid/index';

import { initializeCheckoutState } from './init';
import { useForm, FormProvider } from 'react-hook-form';
import { useCart } from '@context/CartContext';
import { createOrderByUser } from './api';
import { parseOrder } from './parseApi';
import { useNavigate } from 'react-router-dom';
import { CartLine } from '../../../types/cart.types';
import { CheckoutState, DataLists, Tax } from '../../../types/order.types';
import { useSnackBar } from 'context/GlobalContext';
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

const getFirstErrorDetails = (errors: any, prefix = ''): { field: string; message: string } | null => {
  const keys = Object.keys(errors);
  if (keys.length === 0) return null;

  const firstKey = keys[0];
  const value = errors[firstKey];
  const currentPath = prefix ? `${prefix}.${firstKey}` : firstKey;

  if (value && typeof value === 'object' && 'message' in value && typeof value.message === 'string') {
    return {
      field: currentPath,
      message: value.message
    };
  }

  if (value && typeof value === 'object') {
    return getFirstErrorDetails(value, currentPath);
  }

  return null;
};

const Checkout: React.FC<CheckoutProps> = ({ setChecking, checking, fromPrixItem }) => {
  const { cart, emptyCart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const eventsSent = useRef<Set<string>>(new Set());
  const trackEvent = (eventName: string, params: any) => {
    // console.group(`📊 GA Event Triggered: [${eventName}]`);
    // console.log('Params:', params);
    // console.log('Timestamp:', new Date().toISOString());
    // console.groupEnd();

    ReactGA.event(params);
  };
  // console.groupCollapsed('💼 CartContext state:');
  // console.log('cart.lines:', cart.lines);
  // console.log('cart.subTotal:', cart.subTotal);
  // console.log('cart.totalUnits:', cart.totalUnits);
  // console.log('cart.totalDiscount:', cart.totalDiscount);
  // console.groupEnd();

  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  const methods = useForm<CheckoutState>({
    defaultValues: initializeCheckoutState(cart),
    mode: 'onChange',
    shouldUnregister: false,
  });

  useEffect(() => {
    const subscription = methods.watch((value, { name, type }) => {
      // Descomentar si quieres ver cada tecla presionada
      // console.log('Form updated:', name, type);
    });
    return () => subscription.unsubscribe();
  }, [methods.watch]);

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

  const handleNext = async () => {
    // console.log(`➡️ Intento avanzar desde paso índice: ${activeStep} (${steps[activeStep]})`);
    const isValid = await methods.trigger();
    
    if (isValid) {
      const stepLabel = steps[activeStep];

      // Caso 1: Estamos en "Tus datos" y vamos a avanzar -> Disparar 'post_data'
      if (stepLabel === 'Tus datos') {
        ReactGA.event({
          category: 'Checkout',
          action: 'post_data',
          label: 'datos_completados_exitosamente',
        });
        if (!eventsSent.current.has('post_data')) {
          trackEvent('post_data', {
            category: 'Checkout',
            action: 'post_data',
            label: 'datos_completados_exitosamente',
          });

          eventsSent.current.add('post_data');
        } else {
          console.log('Evento post_data ya fue enviado en esta sesión, omitiendo.');
        }
      }
      // Caso 2: Estamos en "Orden de compra" y vamos a avanzar -> Disparar 'post_oc'
      else if (stepLabel === 'Orden de compra') {
        if (!eventsSent.current.has('post_oc')) {
          trackEvent('post_oc', {
            category: 'Checkout',
            action: 'post_oc',
            label: 'revision_orden_aprobada',
          });

          eventsSent.current.add('post_oc');
        }
      }
      // Caso 3 (Opcional): Si tienes un paso "Carrito" en mobile
      // else if (stepLabel === 'Carrito') {
      //   ReactGA.event({
      //     category: 'Checkout',
      //     action: 'inicio_checkout',
      //     label: 'paso_carrito_mobile',
      //   });
      // }

      setActiveStep((prev) => prev + 1);
    } else {
      const currentStepName = steps[activeStep]; 
      const normalizedStep = currentStepName.replace(/\s+/g, '_').toLowerCase();
      const formErrors = methods.formState.errors;

      const errorDetails = getFirstErrorDetails(formErrors);
      const primaryErrorField = errorDetails?.field || 'unknown_field'; 
      const primaryErrorMessage = errorDetails?.message || 'unknown_error';

      const errorFields = Object.keys(formErrors);

      ReactGA.event("form_error", {
        event_category: "checkout_validation",
        step_name: normalizedStep,
        error_field: primaryErrorField,
        error_message: primaryErrorMessage,
        total_errors: Object.keys(formErrors).length
      });
      console.warn(`GA Error Tracked: [${normalizedStep}] Field: ${primaryErrorField}`);    }
  };

  const handleBack = () => {
    // console.log('⬅️ Regresando paso anterior');
    if (activeStep === 1) {
      setChecking(false);
    }
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    // console.log('🚀 Iniciando Submit final de orden...');
    const checkoutData = methods.getValues();

    const parsedData = parseOrder(checkoutData);

    ReactGA.event({
      category: 'Checkout',
      action: 'compra',
      label: `step_${activeStep}_confirmacion`,
    });
    try {
      const response = await createOrderByUser(parsedData);

      if (response.success === true) {
        ReactGA.event({
          category: 'Checkout',
          action: 'compra_exitosa',
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
            if (!checking) {
              setTimeout(() => setChecking(true), 0);
            }
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
            if (!checking) {
              setTimeout(() => setChecking(true), 0);
            }
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
          disabled={cart.lines.length === 0}
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Ordenar' : 'Siguiente'}
        </Button>
      </Box>
    </Container>
  );
};

export default Checkout;
