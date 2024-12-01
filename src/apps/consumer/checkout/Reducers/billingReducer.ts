import { BillingDetails, CheckoutAction } from '../interfaces';

export const billingReducer = (
  billing: BillingDetails,
  action: CheckoutAction
): BillingDetails => {
  switch (action.type) {
    case 'SET_BILLING_DETAILS':
      return {
        ...billing,
        ...action.payload,
      };

    default:
      return billing;
  }
};
