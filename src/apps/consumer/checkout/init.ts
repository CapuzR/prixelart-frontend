import {
  CheckoutState,
  Cart,
  OrderLine,
  BasicInfo,
  ShippingDetails,
  BillingDetails,
} from './interfaces';

export const initializeCheckoutState = (cart: Cart): CheckoutState => {
  // Helper function to safely parse JSON
  const safeParseJSON = <T>(data: string | null, defaultValue: T): T => {
    try {
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Retrieve any existing checkout state from localStorage
  const storedState = localStorage.getItem('checkoutState');
  const parsedState: CheckoutState = safeParseJSON<CheckoutState>(
    storedState,
    {} as CheckoutState
  );

  // Transform CartLines to OrderLines
  const mapCartLinesToOrderLines = (lines: Cart['lines']): OrderLine[] =>
    lines.map((line) => ({
      id: line.id,
      item: line.item,
      quantity: line.quantity,
      pricePerUnit: line.item.price || 0,
      discount: line.discount || 0,
      subtotal: line.subtotal,
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
    lastName: '',
    email: '',
    phone: '',
  };

  // Default shipping details
  const defaultShippingDetails: ShippingDetails = {
    address: {
      recepient: defaultConsumerDetails,
      address: {
        line1: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        reference: '',
      },
    },
    method: undefined,
    preferredDeliveryDate: undefined,
    estimatedShippingDate: undefined,
    estimatedDeliveryDate: undefined,
  };

  // Default billing details
  const defaultBillingDetails: BillingDetails = {
    method: '',
    billTo: defaultConsumerDetails,
    address: {
      recepient: defaultConsumerDetails,
      address: {
        line1: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        reference: '',
      },
    },
  };

  // Initialize or update state based on cart and stored state
  const initialState: CheckoutState = {
    activeStep: parsedState?.activeStep ?? 0,
    loading: false,
    order: {
      id: parsedState?.order?.id || '',
      lines: parsedState?.order?.lines?.length === cart.lines.length
        ? parsedState.order.lines
        : orderLines,
      status: parsedState?.order?.status || { id: 1, name: 'Draft' },
      consumerDetails: parsedState?.order?.consumerDetails || {
        basic: defaultConsumerDetails,
        selectedAddress: {
          line1: '',
          city: '',
          state: '', 
          country: ''
        },
        addresses: [],
        paymentMethods: [],
      },
      payment: parsedState?.order?.payment || undefined,
      shipping: parsedState?.order?.shipping || defaultShippingDetails,
      billing: parsedState?.order?.billing || defaultBillingDetails,
      totalUnits,
      subTotal,
      discount: totalDiscount,
      shippingCost: parsedState?.order?.shippingCost || 0,
      tax: parsedState?.order?.tax || [],
      totalWithoutTax: subTotal,
      total: subTotal,
    },
    dataLists: {
      shippingMethods: parsedState?.dataLists?.shippingMethods || [],
      paymentMethods: parsedState?.dataLists?.paymentMethods || [],
      sellers: parsedState?.dataLists?.sellers || [],
    },
    expandedSection: parsedState?.expandedSection || 'basic',
  };

  // Store the initial state in localStorage
  localStorage.setItem('checkoutState', JSON.stringify(initialState));

  return initialState;
};
