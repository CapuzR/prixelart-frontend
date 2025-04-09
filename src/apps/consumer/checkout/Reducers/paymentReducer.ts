import { PaymentDetails, CheckoutAction } from '../interfaces';

export const paymentReducer = (
  payment: PaymentDetails,
  action: CheckoutAction
): PaymentDetails => {
  switch (action.type) {
    case 'SET_PAYMENT_METHOD':
      return {
        ...payment,
        payload: Array.isArray(action.payload)
          ? action.payload[0]
          : action.payload, // Replace or add a single method
      };

    case 'REMOVE_PAYMENT_METHOD':
      return {
        ...payment,
        payload: "", // Clear the payment method when removed
      };

    default:
      return payment;
  }
};
