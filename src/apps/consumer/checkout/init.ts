import countries from '@data/countries.json';

import { Cart } from '../../../types/cart.types';
import { BasicInfo, BillingDetails, CheckoutState, OrderLine, ShippingDetails } from '../../../types/order.types';

export const initializeCheckoutState = (cart: Cart): CheckoutState => {
  const safeParseJSON = <T>(data: string | null, defaultValue: T): T => {
    try {
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const storedState = localStorage.getItem('checkoutState');
  const parsedState: CheckoutState = safeParseJSON<CheckoutState>(
    storedState,
    {} as CheckoutState
  );

  const mapCartLinesToOrderLines = (lines: Cart['lines']): OrderLine[] =>
    lines.map((line) => ({
      id: line.id,
      item: line.item,
      quantity: line.quantity,
      pricePerUnit: typeof line.item.price === 'number' ? line.item.price : Number(line.item.price) || 0,
      discount: line.discount || 0,
      subtotal: line.subtotal,
      status: [],
      tax: 0, // Default to 0; can be updated later
      total: line.subtotal, // Default to subtotal; can be updated later
    }));

  const orderLines = mapCartLinesToOrderLines(cart.lines);

  // Calculate totals based on the current cart
  const calculateOrderTotals = (): {
    subTotal: number;
    totalUnits: number;
    totalDiscount: number;
  } => ({
    subTotal: cart.subTotal || 0,
    totalUnits: cart.totalUnits || 0,
    totalDiscount: cart.totalDiscount || 0,
  });

  const { subTotal, totalUnits, totalDiscount } = calculateOrderTotals();

  // Default consumer details
  const defaultConsumerDetails: BasicInfo = {
    name: '',
    id: '',
    lastName: '',
    email: '',
    phone: '',
    shortAddress: '',
  };

  // Default shipping details
  const defaultShippingDetails: ShippingDetails = {
    address: {
      recepient: defaultConsumerDetails,
      address: {
        line1: '',
        line2: '',
        city: '',
        state: 'Miranda',
        country: 'Venezuela',
        zipCode: '',
        reference: '',
      },
    },
    method: {
      name: "", price: "0",
      active: false,
      createdOn: new Date(),
      createdBy: "client"
    },
    preferredDeliveryDate: undefined,
    estimatedShippingDate: undefined,
    estimatedDeliveryDate: undefined,
    country: ''
  };

  // Default billing details
  const defaultBillingDetails: BillingDetails = {
    billTo: defaultConsumerDetails,
    address: {
      recepient: defaultConsumerDetails,
      address: {
        line1: '',
        line2: '',
        city: '',
        state: 'Miranda',
        country: 'Venezuela',
        zipCode: '',
        reference: '',
      },
    },
  };

  // Initialize or update state based on cart and stored state
  const initialState: CheckoutState = {
    activeStep: parsedState?.activeStep ?? 0,
    order: {
      lines: parsedState?.order?.lines?.length === cart.lines.length
        ? parsedState.order.lines
        : orderLines,
      status: parsedState?.order?.status || { id: 1, name: 'Draft' },
      consumerDetails: parsedState?.order?.consumerDetails || {
        basic: defaultConsumerDetails,
        selectedAddress: {
          line1: '',
          line2: '',
          city: '',
          state: 'Miranda',
          country: 'Venezuela',
        },
        addresses: [],
        paymentMethods: [],
      },
      payment: parsedState?.order?.payment || undefined,
      seller: parsedState?.order?.seller || '',
      observations: parsedState?.order?.observations || '',
      shipping: parsedState?.order?.shipping || defaultShippingDetails,
      billing: parsedState?.order?.billing || defaultBillingDetails,
      totalUnits,
      subTotal,
      discount: totalDiscount,
      shippingCost: parsedState?.order?.shippingCost || 0,
      tax: parsedState?.order?.tax || [],
      totalWithoutTax: subTotal,
      total: subTotal,
      createdOn: parsedState?.order?.createdOn
        ? new Date(parsedState.order.createdOn)
        : new Date(),
      createdBy: parsedState?.order?.createdBy || '',
    },
    dataLists: {
      shippingMethods: parsedState?.dataLists?.shippingMethods || [],
      paymentMethods: parsedState?.dataLists?.paymentMethods || [],
      countries: countries
        .filter((country) => country.active)
        .map((country) => ({
          ...country,
          states: country.states.map((state) => ({
            ...state,
            subdivision: Array.isArray(state.subdivision)
              ? state.subdivision.join(', ')
              : state.subdivision ?? "",
          })),
        })),
      sellers: parsedState?.dataLists?.sellers || [],
    },
    shipping: parsedState?.dataLists?.shippingMethods?.[0] || { id: 0, name: "", price: 0 },
    paymentMethods: parsedState?.dataLists?.paymentMethods || [],
    billing: undefined,
    basic: undefined,
    general: undefined,
    discount: undefined,
    surcharge: undefined
  };

  return initialState;
};
