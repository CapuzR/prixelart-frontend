import {
  BasicInfo,
  BillingDetails,
  ShippingDetails,
  ShippingMethod,
  PaymentMethod,
  ConsumerDetails,
  Address,
} from "./interfaces";

import { v4 as uuidv4 } from 'uuid';

export interface ConsumerApiResponse {
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

export interface PrixerApiResponse {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
}

// Parse basic consumer information to the BasicInfo structure
export const parseBasicInfo = (data: ConsumerApiResponse): BasicInfo => ({
  name: data.firstname,
  lastName: data.lastname,
  id: data.ci || undefined,
  phone: data.phone,
  email: data.email,
});

// Parse shipping details to the ShippingDetails structure
export const parseShippingDetails = (data: ConsumerApiResponse): ShippingDetails => ({
  method: data.shippingMethod,
  address: data.shippingAddress
    ? parseAddress(data.shippingAddress, data)
    : parseAddress(data.address, data),
  preferredDeliveryDate: undefined, // Set default or adjust based on API data
  estimatedShippingDate: undefined, // Set default or adjust based on API data
  estimatedDeliveryDate: data.expectedDate || undefined,
});

// Parse billing details to the BillingDetails structure
export const parseBillingDetails = (data: ConsumerApiResponse): BillingDetails => ({
  method: data.paymentMethod?.name,
  billTo: parseBasicInfo(data),
  address: data.billingAddress
    ? parseAddress(data.billingAddress, data)
    : parseAddress(data.address, data),
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
export const parseConsumerDetails = (data: ConsumerApiResponse): ConsumerDetails => ({
  basic: parseBasicInfo(data),
  selectedAddress: {
    line1: data.address,
    city: "",
    state: "",
    country: "",
    zipCode: undefined,
    reference: undefined
  },
  addresses: [
    parseAddress(data.address, data), // Add primary address
    ...(data.shippingAddress ? [parseAddress(data.shippingAddress, data)] : []),
  ],
  paymentMethods: data.paymentMethod ? [data.paymentMethod] : [],
});

// Parse prixer data to the BasicInfo structure
export const parsePrixerDetails = (data: PrixerApiResponse): BasicInfo => ({
  name: data.firstName,
  lastName: data.lastName,
  phone: data.phone || "",
  email: data.email || "",
});

// Parse shipping methods to the ShippingMethod structure
export const parseShippingMethods = (data: any[]): ShippingMethod[] =>
  data.map((method) => ({
    id: method._id,
    name: method.name,
    price: method.price,
  }));

// Parse billing methods to the PaymentMethod structure
export const parseBillingMethods = (data: any[]): PaymentMethod[] =>
  data.map((method) => ({
    id: method._id,
    name: method.name,
    type: method.type || undefined,
    provider: method.provider || undefined,
  }));

export const parseOrder = (data: any): any => {

  // Build consumer data (assumed to be fine already)
  const basic = data.basic || {};
  const consumerPayload = {
    _id: basic.id,
    consumerId: basic.id,
    active: true,
    consumerType: "Particular", // using "Particular" as in your example order
    firstname: basic.name,
    lastname: basic.lastName,
    ...basic,
  };

  const orderData = data.order || {};

  // Compute tax: if tax is an array, sum the amounts; if it's a number, use it directly.
  let taxAmount = 0;
  if (Array.isArray(orderData.tax)) {
    taxAmount = orderData.tax.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  } else {
    taxAmount = orderData.tax || 0;
  }

  let createdByValue = "System";
  if (orderData.createdBy) {
    if (typeof orderData.createdBy === "object" && orderData.createdBy.username) {
      createdByValue = orderData.createdBy.username;
    } else if (typeof orderData.createdBy === "string" && orderData.createdBy.trim() !== "") {
      createdByValue = orderData.createdBy;
    }
  }

  // Create the order payload following the OrderSchema
  const orderPayload = {
    orderId: orderData.id || uuidv4(),
    orderType: typeof orderData.lines === "string" ? orderData.lines : "Particular",
    createdOn: orderData.createdOn ? new Date(orderData.createdOn) : new Date(),
    createdBy: createdByValue, // now a string value
    subtotal: orderData.subTotal,
    tax: taxAmount,
    total: orderData.total,
    basicData: data.basic,
    shippingData: data.shipping,
    shippingCost: orderData.shippingCost,
    billingData: data.billing,
    requests: orderData.lines,
    status:
      orderData.status && typeof orderData.status === "object"
        ? orderData.status.name
        : orderData.status || "pending",
    paymentVoucher: orderData.paymentVoucher,
    dollarValue: orderData.dollarValue,
    payStatus: orderData.payStatus,
    generalProductionStatus: orderData.generalProductionStatus,
    shippingStatus: orderData.shippingStatus,
    observations: data.general?.observations || orderData.observations || "",
    isSaleByPrixer: orderData.isSaleByPrixer || false,
    payDate: orderData.payDate ? new Date(orderData.payDate) : undefined,
    completionDate: orderData.completionDate ? new Date(orderData.completionDate) : undefined,
    comissions: orderData.comissions || [],
  };

  // Return a single order object matching the schema
  const payload = {
    ...orderPayload,
    consumerData: consumerPayload,
  };

  return payload;
}