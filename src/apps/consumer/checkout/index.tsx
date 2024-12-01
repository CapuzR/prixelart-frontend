import React, { useState, useMemo, useReducer, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import axios, { AxiosRequestConfig } from 'axios';
import { Stepper, Step, StepLabel, Button } from '@mui/material';
import ConsumerForm from './Consumer';
import OrderForm from './Order';
import styles from './styles.module.scss';
import { useConversionRate, useSnackBar } from 'context/GlobalContext';
import { Cart, CheckoutState, CheckoutAction } from './interfaces';
import { checkoutReducer } from './Reducers/reducer';
import { initializeCheckoutState } from './init';
import { validateConsumerDetails } from './utils';

interface CheckoutProps {
  cart: Cart;
  valuesConsumerForm: any;
  setValuesConsumerForm: (values: any) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart }) => {
  const initialState: CheckoutState = initializeCheckoutState(cart);
  const [state, dispatch] = useReducer<React.Reducer<CheckoutState, CheckoutAction>>(
    checkoutReducer,
    initialState
  );

  const { conversionRate } = useConversionRate();
  const { showSnackBar } = useSnackBar();
  const history = useHistory();

  const [orderPaymentMethod, setOrderPaymentMethod] = useState(undefined);
  const [observations, setObservations] = useState();
  const [loading, setLoading] = useState(false);
  //TODO : Mover de acá...
  const steps = [`Tus datos`, `Orden de compra`, `Confirmación`];
  const [paymentVoucher, setPaymentVoucher] = useState();
  const [seller, setSeller] = useState();

  const handleDispatch = useCallback(<T extends CheckoutAction['type']>(
    type: T,
    payload: Extract<CheckoutAction, { type: T }>['payload']
  ) => {
    // console.log(type, payload);
    dispatch({ type, payload } as CheckoutAction);
  }, [dispatch]);

  // const shippingCost = useMemo(() => Number(valuesConsumerForm?.shippingMethod?.price), [valuesConsumerForm]);

  // const createOrder = async () => {
    //   if (state.order.paymentMethod) {
    //     setLoading(true);

    //     let orderLines = [];
    //     let taxv2 = 'getIvaCost(cart)';
    //     let subtotalv2 = 'getTotalPrice(cart)';
    //     let totalv2 = 'getTotal(cart)';

    //     cart.lines.map((s) => {
    //       s.item.product &&
    //         s.item.art &&
    //         orderLines.push({
    //           product: s.item.product,
    //           art: s.item.art,
    //           quantity: s.quantity,
    //         });
    //     });

    //     //TODO : Retrieve/Calculate the total price of the order

    //     const consumerData = {
    //       active: true,
    //       _id: nanoid(6),
    //       createdBy: {
    //         username: 'web',
    //       },
    //       prixerId: '',
    //       consumerType: 'Particular',
    //       firstname: valuesConsumerForm?.name,
    //       lastname: valuesConsumerForm?.lastName,
    //       username: valuesConsumerForm?.username,
    //       ci: valuesConsumerForm?.ci,
    //       phone: valuesConsumerForm?.phone,
    //       email: valuesConsumerForm?.email,
    //       address: valuesConsumerForm?.address,
    //       billingAddress:
    //         valuesConsumerForm?.billingAddress || valuesConsumerForm?.address,
    //       shippingAddress:
    //         valuesConsumerForm?.shippingAddress || valuesConsumerForm?.address,
    //     };

    //     const input = {
    //       orderId: nanoid(8),
    //       requests: orderLines,
    //       basicData: {
    //         name: consumerData.firstname,
    //         lastname: consumerData.lastname,
    //         ci: consumerData.ci,
    //         email: consumerData.email,
    //         phone: consumerData.phone,
    //         address: consumerData.address,
    //       },
    //       shippingData: {
    //         name: valuesConsumerForm?.shippingName,
    //         lastname: valuesConsumerForm?.shippingLastName,
    //         phone: valuesConsumerForm?.shippingPhone,
    //         address: valuesConsumerForm?.shippingAddress,
    //         shippingMethod: valuesConsumerForm?.shippingMethod,
    //         shippingDate: valuesConsumerForm?.shippingDate,
    //       },
    //       billingData: {
    //         name: valuesConsumerForm?.billingShName,
    //         lastname: valuesConsumerForm?.billingShLastName,
    //         ci: valuesConsumerForm?.billingCi,
    //         company: valuesConsumerForm?.billingCompany,
    //         phone: valuesConsumerForm?.billingPhone,
    //         address: valuesConsumerForm?.billingAddress,
    //         orderPaymentMethod: orderPaymentMethod.name,
    //         destinatary: valuesConsumerForm?.destinatary,
    //       },
    //       dollarValue: conversionRate,
    //       tax: taxv2,
    //       subtotal: subtotalv2,
    //       shippingCost: shippingCost,
    //       total: totalv2,
    //       createdOn: new Date(),
    //       createdBy: seller ? { username: seller } : 'Prixelart Page',
    //       orderType: 'Particular',
    //       consumerId: consumerData._id,
    //       status: 'Por producir',
    //       observations: observations,
    //       payStatus: 'Pendiente',
    //       consumerData: {
    //         consumerId: consumerData._id,
    //         consumerType: consumerData.consumerType,
    //       },
    //     };

    //     let data = {
    //       consumerData,
    //       input,
    //       movement: {},
    //     };

    //     if (orderPaymentMethod.name === 'Balance Prixer') {
    //       const movement = {
    //         _id: nanoid(),
    //         createdOn: new Date(),
    //         createdBy: 'Prixelart Page',
    //         date: new Date(),
    //         destinatary: JSON.parse(localStorage.getItem('token')).account,
    //         description: `Pago de la orden #${input.orderId}`,
    //         type: 'Retiro',
    //         value: 'getTotal(cart)',
    //       };
    //       data.movement = movement;
    //     }

    //     //Mover al API
    //     const base_url = import.meta.env.VITE_BACKEND_URL + '/order/createv2';
    //     const config: AxiosRequestConfig = {
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     };
    //     const configMulti: AxiosRequestConfig = {
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     };
    //     await axios
    //       .post(base_url, data, config)
    //       .then(async (response) => {
    //         if (response.status === 200) {
    //           if (paymentVoucher !== undefined) {
    //             const formData = new FormData();
    //             formData.append('paymentVoucher', paymentVoucher);
    //             let ID = input.orderId;
    //             const base_url2 = import.meta.env.VITE_BACKEND_URL + '/order/addVoucher/' + ID;
    //             await axios.put(base_url2, formData, configMulti);
    //           }

    //           showSnackBar(response.data.info);
    //           showSnackBar('¡Gracias por tu compra! Por favor revisa tu correo');

    //           const base_url3 = import.meta.env.VITE_BACKEND_URL + '/order/sendEmail';
    //           await axios.post(base_url3, input).then(async (response) => {
    //             if (response.data.success === false) {
    //               await axios.post(base_url3, input);
    //             } else return;
    //           });
    //         }
    //       })
    //       .catch((error) => {
    //         console.log(error.response);
    //       });

    //     // setValuesConsumerForm(undefined);
    //     history.push({ pathname: '/' });
    //     setLoading(false);
    //   } else {
    //     showSnackBar('Por favor selecciona una forma de pago.');
    //   }
  // };
  const createOrder = () => {
    console.log(state);
  };

  return (
    <div className={styles['checkout-root']}>
      <h1>Concreta tu compra</h1>
      {/* <Stepper activeStep={state.activeStep}>
        {steps?.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper> */}

      <div className={styles['form-container']}>
        {state.activeStep === 0 ? (
          <ConsumerForm
            checkoutState={state}
            handleDispatch={handleDispatch}
          />
        ) : (
          <OrderForm
            checkoutState={state}
            handleDispatch={handleDispatch}
          />
        )}
      </div>

      <div className={styles['button-container']}>
        <Button disabled={state.activeStep === 0} onClick={() => handleDispatch('SET_ACTIVE_STEP', 'back')}>
          Anterior
        </Button>
        <Button
          id="next"
          variant="contained"
          color="primary"
          disabled={!validateConsumerDetails(state.order.consumerDetails)}
          onClick={state.activeStep === steps.length - 1 ? createOrder : () => handleDispatch('SET_ACTIVE_STEP', 'next')}
        >
          {state.activeStep === steps.length - 1 ? 'Ordenar' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
