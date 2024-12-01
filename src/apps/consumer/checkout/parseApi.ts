import {
    BasicInfo,
    BillingDetails,
    ShippingDetails,
    ShippingMethod,
    PaymentMethod,
    ConsumerDetails,
    Address,
  } from "./interfaces";
  
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