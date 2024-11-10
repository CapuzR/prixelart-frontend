import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios, { AxiosRequestConfig } from 'axios';
import { Stepper, Step, StepLabel, Button } from '@material-ui/core';
import ConsumerForm from './ConsumerForm';
import OrderForm from './OrderForm';
import { CheckoutProps } from './interfaces';
import styles from './styles.module.scss';
import { getTotalUnitsPVP, getTotalUnitsPVM } from './pricesFunctions.js';
import validations from './validations';
import { nanoid } from 'nanoid';
import { useConversionRate, useCurrency } from 'context/GlobalContext';

//Order: { id: id, lines: line[],  }
//Line: { item: item, quantity: number, discount: number, subtotal: number }
//item: { id: id, product: Product, art: Art, price: number }
const Checkout: React.FC<CheckoutProps> = ({ cart, props }) => {
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();
  const history = useHistory();
  const [orderPaymentMethod, setOrderPaymentMethod] = useState(undefined);
  const [observations, setObservations] = useState();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const steps = [`Tus datos`, `Orden de compra`];
  const [paymentVoucher, setPaymentVoucher] = useState();
  const [discountList, setDiscountList] = useState([]);
  const [seller, setSeller] = useState();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  let shippingCost = Number(props.valuesConsumerForm?.shippingMethod?.price);

  const createOrder = async () => {
    if (orderPaymentMethod) {
      setLoading(true);
      props.setOpen(true);

      let orderLines = [];
      let taxv2 = 'getIvaCost(cart)';
      let subtotalv2 = 'getTotalPrice(cart)';
      let totalv2 = 'getTotal(cart)';

      cart.lines.map((s) => {
        s.item.product &&
          s.item.art &&
          orderLines.push({
            product: s.item.product,
            art: s.item.art,
            quantity: s.quantity,
          });
      });

      //TO DO: Retrieve/Calculate the total price of the order

      const consumerData = {
        active: true,
        _id: nanoid(6),
        createdBy: {
          username: 'web',
        },
        prixerId: '',
        consumerType: 'Particular',
        firstname: props.valuesConsumerForm?.name,
        lastname: props.valuesConsumerForm?.lastName,
        username: props.valuesConsumerForm?.username,
        ci: props.valuesConsumerForm?.ci,
        phone: props.valuesConsumerForm?.phone,
        email: props.valuesConsumerForm?.email,
        address: props.valuesConsumerForm?.address,
        billingAddress:
          props.valuesConsumerForm?.billingAddress || props.valuesConsumerForm?.address,
        shippingAddress:
          props.valuesConsumerForm?.shippingAddress || props.valuesConsumerForm?.address,
      };

      const input = {
        orderId: nanoid(8),
        requests: orderLines,
        basicData: {
          name: consumerData.firstname,
          lastname: consumerData.lastname,
          ci: consumerData.ci,
          email: consumerData.email,
          phone: consumerData.phone,
          address: consumerData.address,
        },
        shippingData: {
          name: props.valuesConsumerForm?.shippingName,
          lastname: props.valuesConsumerForm?.shippingLastName,
          phone: props.valuesConsumerForm?.shippingPhone,
          address: props.valuesConsumerForm?.shippingAddress,
          shippingMethod: props.valuesConsumerForm?.shippingMethod,
          shippingDate: props.valuesConsumerForm?.shippingDate,
        },
        billingData: {
          name: props.valuesConsumerForm?.billingShName,
          lastname: props.valuesConsumerForm?.billingShLastName,
          ci: props.valuesConsumerForm?.billingCi,
          company: props.valuesConsumerForm?.billingCompany,
          phone: props.valuesConsumerForm?.billingPhone,
          address: props.valuesConsumerForm?.billingAddress,
          orderPaymentMethod: orderPaymentMethod.name,
          destinatary: props.valuesConsumerForm?.destinatary,
        },
        dollarValue: conversionRate,
        tax: taxv2,
        subtotal: subtotalv2,
        shippingCost: shippingCost,
        total: totalv2,
        createdOn: new Date(),
        createdBy: seller ? { username: seller } : 'Prixelart Page',
        orderType: 'Particular',
        consumerId: consumerData._id,
        status: 'Por producir',
        observations: observations,
        payStatus: 'Pendiente',
        consumerData: {
          consumerId: consumerData._id,
          consumerType: consumerData.consumerType,
        },
      };

      let data = {
        consumerData,
        input,
        movement: {},
      };

      if (orderPaymentMethod.name === 'Balance Prixer') {
        const movement = {
          _id: nanoid(),
          createdOn: new Date(),
          createdBy: 'Prixelart Page',
          date: new Date(),
          destinatary: JSON.parse(localStorage.getItem('token')).account,
          description: `Pago de la orden #${input.orderId}`,
          type: 'Retiro',
          value: 'getTotal(cart)',
        };
        data.movement = movement;
      }

      //Mover al API
      const base_url = process.env.REACT_APP_BACKEND_URL + '/order/createv2';
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const configMulti: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      await axios
        .post(base_url, data, config)
        .then(async (response) => {
          if (response.status === 200) {
            if (paymentVoucher !== undefined) {
              const formData = new FormData();
              formData.append('paymentVoucher', paymentVoucher);
              let ID = input.orderId;
              const base_url2 = process.env.REACT_APP_BACKEND_URL + '/order/addVoucher/' + ID;
              await axios.put(base_url2, formData, configMulti);
            }

            props.setMessage(response.data.info);
            props.setMessage('¡Gracias por tu compra! Por favor revisa tu correo');

            const base_url3 = process.env.REACT_APP_BACKEND_URL + '/order/sendEmail';
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

      props.setValuesConsumerForm(undefined);
      history.push({ pathname: '/' });
      setLoading(false);
    } else {
      props.setOpen(true);
      props.setMessage('Por favor selecciona una forma de pago.');
    }
  };

  return (
    <div className={styles['checkout-root']}>
      <Stepper activeStep={activeStep}>
        {steps?.map((label) => (
          <Step key={label} {...props}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div className={styles['form-container']}>
        {activeStep === 0 ? (
          <ConsumerForm
            setValues={props.setValuesConsumerForm}
            values={props.valuesConsumerForm}
            buyState={cart}
            setOpen={props.setOpen}
            setMessage={props.setMessage}
            expanded={expanded}
            setExpanded={setExpanded}
          />
        ) : (
          <OrderForm
            valuesConsumer={props.valuesConsumerForm}
            values={props.valuesConsumerForm}
            setValuesConsumer={props.setValues}
            onCreateConsumer={props.onCreateConsumer}
            buyState={cart}
            orderPaymentMethod={orderPaymentMethod}
            setOrderPaymentMethod={setOrderPaymentMethod}
            setPaymentVoucher={setPaymentVoucher}
            setObservations={setObservations}
            paymentVoucher={paymentVoucher}
            dollarValue={conversionRate}
            currency={currency}
            setSeller={setSeller}
            // orgs={orgs}
          />
        )}
      </div>

      <div className={styles['button-container']}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Anterior
        </Button>
        <Button
          id="next"
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
            !validations.isAValidEmail(props.valuesConsumerForm?.email) ||
            !validations.isAValidCi(props.valuesConsumerForm?.ci) ||
            !validations.isAValidName(props.valuesConsumerForm?.name) ||
            !validations.isAValidName(props.valuesConsumerForm?.lastName) ||
            !validations.isAValidPhoneNum(props.valuesConsumerForm?.phone)
          }
          onClick={activeStep === steps.length - 1 ? createOrder : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Ordenar' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
