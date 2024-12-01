import { linesReducer } from './linesReducer';
import { consumerDetailsReducer } from './consumerDetailsReducer';
import { shippingReducer } from './shippingReducer';
import { billingReducer } from './billingReducer';
import { paymentReducer } from './paymentReducer';
import { Order, CheckoutAction } from '../interfaces';

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

    default:
      const { lines, totals } = linesReducer(order.lines, action);

      return {
        ...order,
        lines,
        totalUnits: totals?.totalUnits ?? order.totalUnits,
        subTotal: totals?.subTotal ?? order.subTotal,
        consumerDetails: consumerDetailsReducer(order.consumerDetails, action),
        shipping: shippingReducer(order.shipping, action),
        billing: billingReducer(order.billing, action),
        payment: paymentReducer(order.payment, action),
      };
  }
};
