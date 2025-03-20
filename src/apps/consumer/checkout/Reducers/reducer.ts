import { orderReducer } from './orderReducer';
import { CheckoutState, CheckoutAction } from "../../../../types/order.types";
export const checkoutReducer = (
  state: CheckoutState,
  action: CheckoutAction
): CheckoutState => {
  switch (action.type) {
    case 'SET_ACTIVE_STEP':
      const newStep =
        action.payload === 'back'
          ? Math.max(state.activeStep - 1, 0)
          : action.payload === 'next'
            ? state.activeStep + 1
            : action.payload;
      return { ...state, activeStep: newStep };

    case 'SET_LOADING':
      return { ...state, };

    case 'SET_SHIPPING_METHODS':
      return { ...state, shipping: action.payload };

    case 'SET_PAYMENT_METHODS':
      return { ...state, paymentMethods: action.payload };

    case 'SET_EXPANDED_SECTION':
      return { ...state, };

    default:
      return {
        ...state,
        order: orderReducer(state.order, action),
      };
  }
};
