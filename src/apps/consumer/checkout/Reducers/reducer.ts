import { orderReducer } from './orderReducer';
import { CheckoutState, CheckoutAction } from '../interfaces';
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
          : action.payload; // Directly set if it's a number
      return { ...state, activeStep: newStep };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_SHIPPING_METHODS':
      return { ...state, shippingMethods: action.payload };

    case 'SET_PAYMENT_METHODS':
      return { ...state, paymentMethods: action.payload };

    case 'SET_SELLERS':
      return { ...state, sellers: action.payload };

    case 'SET_EXPANDED_SECTION':
      return { ...state, expandedSection: action.payload };

    // Delegate order-related actions to the orderReducer
    default:
      return {
        ...state,
        order: orderReducer(state.order, action),
      };
  }
};
