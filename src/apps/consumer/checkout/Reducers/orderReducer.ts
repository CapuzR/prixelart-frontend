import { linesReducer } from './linesReducer';
import { consumerDetailsReducer } from './consumerDetailsReducer';
import { shippingReducer } from './shippingReducer';
import { paymentReducer } from './paymentReducer';
import { Order, CheckoutAction, ConsumerDetails, PaymentDetails, BillingDetails } from '../interfaces';

const initialConsumerDetails: ConsumerDetails = {
  basic: {
    name: '',
    lastName: '',
    phone: ''
  },
  selectedAddress: {
    line1: '',
    city: '',
    state: '',
    country: ''
  },
  addresses: [],
  paymentMethods: []
};

const initialPaymentDetails: PaymentDetails = {};

export const orderReducer = (
  order: Order,
  action: CheckoutAction
): Order => {
  switch (action.type) {
    case 'UPDATE_ORDER':
      return { ...order, ...action.payload };

    case 'SET_SELLER':
      return {
        ...order,
        seller: action.payload,
      };

    case 'SET_OBSERVATIONS':
      return {
        ...order,
        observations: action.payload,
      };

    case 'SET_BILLING_DETAILS':
      return {
        ...order,
        billing: {
          ...order.billing,
          ...action.payload,
        },
      };

    default:
      const { lines, totals } = linesReducer(order.lines, action);

      return {
        ...order,
        lines,
        totalUnits: totals?.totalUnits ?? order.totalUnits,
        subTotal: totals?.subTotal ?? order.subTotal,
        consumerDetails: consumerDetailsReducer(
          order.consumerDetails ?? initialConsumerDetails,
          action
        ),
        shipping: shippingReducer(order.shipping, action),
        payment: paymentReducer(
          order.payment ?? initialPaymentDetails,
          action
        ),
      };
  }
};
