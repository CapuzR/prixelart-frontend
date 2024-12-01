import { ConsumerDetails, CheckoutAction } from '../interfaces';

export const consumerDetailsReducer = (
  consumerDetails: ConsumerDetails | undefined,
  action: CheckoutAction
): ConsumerDetails => {
  switch (action.type) {
    case 'SET_CONSUMER_BASIC': {
      console.log("SET_CONSUMER_BASIC", action);
      const { payload } = action;

      return {
        ...consumerDetails,
        basic: {
          ...consumerDetails?.basic, // Preserve existing fields
          ...payload, // Overwrite or add new fields to basic
        },
      };
    }

    case 'SET_CONSUMER_ADDRESS': {
      console.log("SET_CONSUMER_ADDRESS", action);
      const { payload } = action;

      return {
        ...consumerDetails,
        selectedAddress: payload,
      };
    }

    case 'SET_CONSUMER_PAYMENT_METHODS': {
      const { payload } = action;

      return {
        ...consumerDetails,
        paymentMethods: payload ? [...payload] : consumerDetails?.paymentMethods ?? [], // Replace paymentMethods if provided
      };
    }

    default:
      return (
        consumerDetails || {
          basic: { name: '', lastName: '', phone: '', email: '' },
          selectedAddress: {},
          addresses: [],
          paymentMethods: [],
        }
      );
  }
};
