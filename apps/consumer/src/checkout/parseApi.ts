import {
  BasicInfo,
  BillingDetails,
  ShippingDetails,
  ShippingMethod,
  PaymentMethod,
  ConsumerDetails,
  Address,
  Order,
  CheckoutState,
  PaymentDetails,
  Tax,
  OrderStatus,
} from "@prixpon/types/order.types";

interface ConsumerApiResponse {
  firstname: string;
  lastname: string;
  ci?: string;
  phone: string;
  email: string;
  address: string;
  shippingAddress?: string;
  billingAddress?: string;
  shippingMethod?: ShippingMethod;
  paymentMethod?: PaymentMethod;
  expectedDate?: Date;
}

// Parse basic consumer information to the BasicInfo structure
const parseBasicInfo = (data: ConsumerApiResponse): BasicInfo => ({
  name: data.firstname,
  lastName: data.lastname,
  id: data.ci || undefined,
  phone: data.phone,
  email: data.email,
});

// Helper to parse address data into the Address structure
const parseAddress = (address: string, data: ConsumerApiResponse): Address => ({
  recepient: parseBasicInfo(data),
  address: {
    line1: address,
    city: "", // Parse city if available in API data
    state: "", // Parse state if available in API data
    country: "", // Parse country if available in API data
    zipCode: undefined, // Parse zipCode if available in API data
    reference: undefined,
  },
});

// Parse complete consumer details to the ConsumerDetails structure
export const parseConsumerDetails = (
  data: ConsumerApiResponse,
): ConsumerDetails => ({
  basic: parseBasicInfo(data),
  selectedAddress: {
    line1: data.address,
    city: "",
    state: "",
    country: "",
    zipCode: undefined,
    reference: undefined,
  },
  addresses: [
    parseAddress(data.address, data), // Add primary address
    ...(data.shippingAddress ? [parseAddress(data.shippingAddress, data)] : []),
  ],
  paymentMethods: data.paymentMethod ? [data.paymentMethod] : [],
});

// Parse billing methods to the PaymentMethod structure
export const parseBillingMethods = (data: any[]): PaymentMethod[] =>
  data.map((method) => ({
    id: method._id,
    name: method.name,
    type: method.type || undefined,
    provider: method.provider || undefined,
    active: method.active !== undefined ? method.active : true,
    createdBy: method.createdBy || "system",
    createdOn: method.createdOn ? new Date(method.createdOn) : new Date(),
  }));

export const parseOrder = (data: CheckoutState): Order => {
  const orderData = data.order || {};
  const basicState = data.basic || {};
  const shippingState = data.shipping || {};
  const billingState = data.billing || {};
  const generalState = data.general || {};

  // Use top-level basic info if available, otherwise fall back to nested order data
  const basicInfo: BasicInfo = {
    id: basicState.id || orderData.consumerDetails?.basic.id || "",
    name: basicState.name || orderData.consumerDetails?.basic.name || "",
    lastName:
      basicState.lastName || orderData.consumerDetails?.basic.lastName || "",
    email: basicState.email || orderData.consumerDetails?.basic.email || "",
    phone: basicState.phone || orderData.consumerDetails?.basic.phone || "",
    shortAddress:
      basicState.shortAddress ||
      orderData.consumerDetails?.basic.shortAddress ||
      "",
  };

  // Map ConsumerDetails - primarily from order.consumerDetails, using top-level basic info
  const consumerDetails: ConsumerDetails = {
    basic: basicInfo, // Use the potentially updated basicInfo
    selectedAddress: orderData.consumerDetails?.selectedAddress || {
      line1: "",
      city: "",
      state: "",
      country: "",
    }, // Fallback
    addresses: orderData.consumerDetails?.addresses || [], // Use addresses from nested order data
    paymentMethods: orderData.consumerDetails?.paymentMethods || [], // Use payment methods from nested order data
  };

  // Map ShippingDetails - prioritize top-level shipping state
  const shippingDetails: ShippingDetails = {
    method: shippingState.method
      ? ({
          // Construct ShippingMethod object
          name: shippingState.method,
          price:
            shippingState.price !== undefined
              ? String(shippingState.price)
              : "0", // Convert number to string as per interface
          active: true, // Assuming active if selected
          createdOn: new Date(), // Placeholder: actual creation date might be needed
          createdBy: "system", // Placeholder: user who created shipping method
        } as ShippingMethod)
      : {
          // Provide default ShippingMethod when undefined
          name: "",
          price: "0",
          active: false,
          createdOn: new Date(),
          createdBy: "",
        },
    country:
      shippingState.country || orderData.shipping?.address.address.country, // Prefer top-level, fallback to nested
    address: {
      // Construct Address object for shipping - prioritize top-level shipping state
      recepient: {
        // Construct BasicInfo for shipping recipient - prioritize top-level shipping state
        id: shippingState.id || orderData.shipping?.address.recepient.id || "",
        name:
          shippingState.name ||
          orderData.shipping?.address.recepient.name ||
          "",
        lastName:
          shippingState.lastName ||
          orderData.shipping?.address.recepient.lastName ||
          "",
        email:
          shippingState.email ||
          orderData.shipping?.address.recepient.email ||
          "",
        phone:
          shippingState.phone ||
          orderData.shipping?.address.recepient.phone ||
          "",
        shortAddress: "", // Not available in top-level shipping state
      },
      address: {
        // Construct BasicAddress for shipping address - prioritize top-level shipping state
        line1:
          shippingState.line1 ||
          orderData.shipping?.address.address.line1 ||
          "",
        line2:
          shippingState.line2 ||
          orderData.shipping?.address.address.line2 ||
          "",
        reference:
          shippingState.reference ||
          orderData.shipping?.address.address.reference ||
          "",
        city:
          shippingState.city || orderData.shipping?.address.address.city || "",
        state:
          shippingState.state ||
          orderData.shipping?.address.address.state ||
          "",
        country:
          shippingState.country ||
          orderData.shipping?.address.address.country ||
          "",
        zipCode:
          shippingState.zipCode ||
          orderData.shipping?.address.address.zipCode ||
          "",
      },
    },
    // Mapping date fields - prioritize top-level shipping.date for estimatedDeliveryDate
    estimatedDeliveryDate: shippingState.date
      ? new Date(shippingState.date)
      : orderData.shipping?.estimatedDeliveryDate
        ? new Date(orderData.shipping.estimatedDeliveryDate)
        : undefined,
    // preferredDeliveryDate and estimatedShippingDate are not clearly present in the input structure
  };

  // Map BillingDetails - prioritize top-level billing state
  const billingDetails: BillingDetails = {
    billTo: {
      // Construct BasicInfo for billing recipient - prioritize top-level billing state
      id: billingState.id || orderData.billing?.billTo?.id || "",
      name: billingState.name || orderData.billing?.billTo?.name || "",
      lastName:
        billingState.lastName || orderData.billing?.billTo?.lastName || "",
      email: billingState.email || orderData.billing?.billTo?.email || "",
      phone: billingState.phone || orderData.billing?.billTo?.phone || "",
      shortAddress: "", // Not available in top-level billing state
    },
    address: {
      // Construct Address object for billing - prioritize top-level billing state
      recepient: {
        // Construct BasicInfo for billing address recipient - prioritize top-level billing state
        id: billingState.id || orderData.billing?.address?.recepient.id || "", // Assuming id might be present here too
        name:
          billingState.name || orderData.billing?.address?.recepient.name || "",
        lastName:
          billingState.lastName ||
          orderData.billing?.address?.recepient.lastName ||
          "",
        email:
          billingState.email ||
          orderData.billing?.address?.recepient.email ||
          "",
        phone:
          billingState.phone ||
          orderData.billing?.address?.recepient.phone ||
          "",
        shortAddress: "", // Not available
      },
      address: {
        // Construct BasicAddress for billing address - prioritize top-level billing state
        line1:
          billingState.line1 || orderData.billing?.address?.address.line1 || "",
        line2:
          billingState.line2 || orderData.billing?.address?.address.line2 || "",
        reference: "", // Not available in top-level billing state
        city:
          billingState.city || orderData.billing?.address?.address.city || "",
        state:
          billingState.state || orderData.billing?.address?.address.state || "",
        country:
          billingState.country ||
          orderData.billing?.address?.address.country ||
          "",
        zipCode:
          billingState.zipCode ||
          orderData.billing?.address?.address.zipCode ||
          "",
      },
    },
  };

  // Map PaymentDetails - Construct based on billing and basic info
  const paymentDetails: PaymentDetails = {
    total: orderData.total || 0, // Assuming total is available here
    // The 'payment' property is an array of Payment objects
    payment: billingState.paymentMethod
      ? [
          {
            id: "", // Add required fields for a Payment object
            description: "Initial Payment",
            createdOn: new Date(),
            method: {
              // The method object itself
              name: billingState.paymentMethod,
              active: true,
              createdBy: "system",
              createdOn: new Date(),
            },
          },
        ]
      : [],
    // The 'status' property is required
    status: [[0, new Date()]], // 0 = GlobalPaymentStatus.Pending
  };

  // Calculate totalUnits if not provided in orderData or if lines are available
  const totalUnits =
    orderData.totalUnits !== undefined
      ? orderData.totalUnits
      : Array.isArray(orderData.lines)
        ? orderData.lines.reduce(
            (sum: any, line: { quantity: any }) => sum + (line.quantity || 0),
            0,
          )
        : 0;

  // Map Tax - Ensure tax is an array and map its properties
  const taxArray: Tax[] = Array.isArray(orderData.tax)
    ? orderData.tax.map(
        (t: { id: any; name: any; value: any; amount: any }) => ({
          id: t.id || "",
          name: t.name || "",
          value: t.value || 0,
          amount: t.amount || 0,
        }),
      )
    : [];

  const createdOnDate = orderData.createdOn
    ? new Date(orderData.createdOn)
    : new Date();

  const order: Order = {
    // _id: // No _id in the input object, will be generated by the database
    lines: orderData.lines || [], // Use lines from nested order data
    createdOn: createdOnDate,
    createdBy: orderData.createdBy || "System", // Default to 'System' if not available
    // updates: // Not available in the input object

    consumerDetails: consumerDetails,
    payment: paymentDetails,
    shipping: shippingDetails,
    billing: billingDetails,

    totalUnits: totalUnits,

    subTotal: orderData.subTotal || 0,
    discount: orderData.discount || 0,
    shippingCost: orderData.shippingCost || 0,
    tax: taxArray,
    totalWithoutTax: orderData.totalWithoutTax || 0,
    total: orderData.total || 0,

    seller: generalState.seller || orderData.seller || "", // Prioritize top-level general seller
    observations: generalState.observations || orderData.observations || "", // Prioritize top-level general observations
    status: [[OrderStatus.Pending, new Date()]],
  };

  console.log("Parsed Order:", order);

  return order;
};
