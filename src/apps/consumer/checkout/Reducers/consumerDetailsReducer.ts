import { ConsumerDetails, CheckoutAction } from '../interfaces';

const defaultState: ConsumerDetails = {
  basic: { name: '', lastName: '', phone: '', email: '' },
  selectedAddress: {
    line1: '',
    city: '',
    state: '',
    country: ''
  },
  addresses: [],
  paymentMethods: [],
};


export const consumerDetailsReducer = (
  consumerDetails: ConsumerDetails,
  action: CheckoutAction
): ConsumerDetails => {

  const currentState = consumerDetails || defaultState;

  switch (action.type) {
    case 'SET_CONSUMER_BASIC': {
      const { payload } = action;

      return {
        ...currentState,
        basic: {
          ...currentState.basic,
          ...payload,
        },
      };
    }

    case 'SET_CONSUMER_ADDRESS': {
      const { payload } = action;

      return {
        ...currentState,
        selectedAddress: payload,
      };
    }

    case 'SET_CONSUMER_PAYMENT_METHODS': {
      const { payload } = action;

      return {
        ...currentState,
        paymentMethods: payload ? [...payload] : consumerDetails?.paymentMethods ?? [],
      };
    }

    default:
      return (
        consumerDetails || currentState
      );
  }
};
