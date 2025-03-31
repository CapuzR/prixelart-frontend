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
  type: 'Particular'
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

    // case 'SET_CONSUMER_BASIC_AUTO': {
    //   const { payload } = action;

    //   return {
    //     ...currentState,
    //     basic: {
    //       ...currentState.basic,
    //       ...payload,
    //     },
    //   };
    // }

    case 'SET_CONSUMER_ADDRESS': {
      const { payload } = action;

      return {
        ...currentState,
        selectedAddress: payload,
      };
    }

    default:
      return (
        consumerDetails || currentState
      );
  }
};
