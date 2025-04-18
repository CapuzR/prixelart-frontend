import { BillingDetails, CheckoutAction } from "../interfaces"

const defaultState: BillingDetails = {
  basic: {
    name: "",
    lastName: "",
    phone: "",
    email: "",
    id: "",
    shortAddress: ""
  },
  billTo: {
    name: "",
    lastName: "",
    phone: "",
    email: "",
    id: "",
    shortAddress: ""
  },
  address: {
    recepient: {
      name: "",
      lastName: "",
      phone: "",
      email: "",
      id: "",
      shortAddress: ""
    },
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      reference: ""
    }
  }
}

export const billingReducer = (
  billing: BillingDetails,
  action: CheckoutAction
): BillingDetails => {
  const currentState = billing || defaultState

  switch (action.type) {
    case "SET_BILLING_BASIC": {
      const { payload } = action
      return {
        ...currentState,
        basic: {
          ...currentState.basic,
          ...payload,
        },
      }
    }

    case "SET_BILLING_DETAILS": {
      const { payload } = action
      return {
        ...currentState,
        ...payload,
      }
    }

    default:
      return currentState
  }
}
