import React, { createContext, useReducer, useContext, useEffect } from "react";
import { CheckoutState, CheckoutAction, Order } from "@apps/consumer/checkout/interfaces";
import { orderReducer } from "@apps/consumer/checkout/Reducers/orderReducer";
import { nanoid } from "nanoid";
import { Consumer } from "../types/consumer.types";
import { Prixer } from "../types/prixer.types";
import { Discount } from "../types/discount.types";
import { Surcharge } from "../types/surcharge.types";
import { Organization } from "../types/organization.types";

const initialOrder: Order = {
  id: nanoid(8),
  lines: [],
  createdOn: new Date(),
  createdBy: "",
  status: { name: "Por producir" },
  consumerDetails: {
    basic: {
      name: "",
      lastName: "",
      phone: "",
      email: "",
      id: "",
      shortAddress: "",
    },
    selectedAddress: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "",
    },
    addresses: [],
    type: "Particular",
  },
  payment: { methods: [] },
  shipping: {
    basic: {
      name: "",
      lastName: "",
      phone: "",
      email: "",
      id: "",
      shortAddress: "",
    },
    address: {
      recepient: {
        name: "",
        lastName: "",
        phone: "",
        email: "",
        id: "",
        shortAddress: "",
      },
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
        reference: "",
      },
    },
  },
  billing: {
    basic: {
      name: "",
      lastName: "",
      phone: "",
      email: "",
      id: "",
      shortAddress: "",
    },
    billTo: {
      name: "",
      lastName: "",
      phone: "",
      email: "",
      id: "",
      shortAddress: "",
    },
    address: {
      recepient: {
        name: "",
        lastName: "",
        phone: "",
        email: "",
        id: "",
        shortAddress: "",
      },
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
        reference: "",
      },
    },
  },
  totalUnits: 0,
  subTotal: 0,
  tax: [],
  totalWithoutTax: 0,
  total: 0,
};

const initialState: CheckoutState = {
  activeStep: 0,
  order: initialOrder,
  dataLists: {
    shippingMethods: [],
    paymentMethods: [],
    countries: [],
    sellers: [],
  },
  shippingMethods: [],
  paymentMethods: [],
  discounts: [],
  surcharges: [],
  organizations: [],
  consumers: [],
  prixers: [],
  selectedPrixer: undefined,
  selectedConsumer: undefined,
};

// Load state from localStorage
const loadStateFromLocalStorage = (): CheckoutState => {
  try {
    const serializedState = localStorage.getItem('buyState');
    if (serializedState === null) {
      return initialState;
    }
    const savedState = JSON.parse(serializedState);
    return {
      ...initialState,
      order: savedState.order || initialState.order
    };
  } catch (err) {
    return initialState;
  }
};

// Save state to localStorage
const saveStateToLocalStorage = (state: CheckoutState) => {
  try {
    const stateToSave = {
      order: state.order
    };
    localStorage.setItem('buyState', JSON.stringify(stateToSave));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
};

const OrdersContext = createContext<{
  state: CheckoutState;
  dispatch: React.Dispatch<CheckoutAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(
    (state: CheckoutState, action: CheckoutAction) => {
      const newState = {
        ...state,
        order: orderReducer(state.order, action),
        activeStep:
          action.type === "SET_ACTIVE_STEP"
            ? typeof action.payload === "number"
              ? action.payload
              : action.payload === "next"
                ? state.activeStep + 1
                : state.activeStep - 1
            : state.activeStep,
        shippingMethods:
          action.type === "SET_SHIPPING_METHODS"
            ? action.payload
            : state.shippingMethods,
        paymentMethods:
          action.type === "SET_PAYMENT_METHODS"
            ? action.payload
            : state.paymentMethods,
        consumers:
          action.type === "SET_CONSUMERS"
            ? action.payload
            : state.consumers,
        prixers:
          action.type === "SET_PRIXERS"
            ? action.payload
            : state.prixers,
        selectedPrixer:
          action.type === "SET_SELECTED_PRIXER"
            ? action.payload
            : state.selectedPrixer,
        selectedConsumer:
          action.type === "SET_SELECTED_CONSUMER"
            ? action.payload
            : state.selectedConsumer,
      };
      saveStateToLocalStorage(newState);
      return newState;
    },
    loadStateFromLocalStorage()
  );

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveStateToLocalStorage(state);
  }, [state.order]);

  return (
    <OrdersContext.Provider value={{ state, dispatch }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrder = () => useContext(OrdersContext);
