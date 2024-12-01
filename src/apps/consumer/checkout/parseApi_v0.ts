// import {
//     BasicDetails,
//     BillingDetails,
//     ShippingDetails,
//     ShippingMethod,
//     PaymentMethod,
//     ConsumerDetails,
//     ConsumerOrderDetails,
//   } from "./interfaces";
  
//   export interface ConsumerApiResponse {
//     firstname: string;
//     lastname: string;
//     ci?: string;
//     phone: string;
//     email: string;
//     address: string;
//     shippingAddress?: string;
//     billingShAddress?: string;
//     shippingMethod?: ShippingMethod;
//     paymentMethod?: PaymentMethod;
//     expectedDate?: Date;
//   }
  
//   export interface PrixerApiResponse {
//     firstName: string;
//     lastName: string;
//     phone?: string;
//     email?: string;
//     address?: string;
//   }

//   // Parse consumer data from backend response to the BasicDetails structure
//   export const parseBasicDetails = (data: ConsumerApiResponse): BasicDetails => ({
//     name: data.firstname,
//     lastName: data.lastname,
//     ci: data.ci || "",
//     phone: data.phone,
//     email: data.email,
//     address: data.address,
//   });
  
//   // Parse shipping details from backend response to the ShippingDetails structure
//   export const parseShippingDetails = (data: ConsumerApiResponse): ShippingDetails => ({
//     name: data.firstname,
//     lastName: data.lastname,
//     phone: data.phone,
//     address: data.shippingAddress || data.address,
//     method: undefined, // Set default or adjust based on API data
//     expectedDate: undefined, // Set default or adjust based on API data
//     estimatedDeliveryDate: undefined, // Set default or adjust based on API data
//   });
  
//   // Parse billing details from backend response to the BillingDetails structure
//   export const parseBillingDetails = (data: ConsumerApiResponse): BillingDetails => ({
//     name: data.firstname,
//     lastName: data.lastname,
//     ci: data.ci || "",
//     phone: data.phone,
//     email: data.email,
//     address: data.billingShAddress || data.address,
//     companyName: undefined, // Set default or adjust based on API data
//   });

//   // Parse order details from backend response to the ConsumerOrderDetails structure
//   export const parseOrderDetails = (data: ConsumerApiResponse): ConsumerOrderDetails => ({
//     shippingMethod: data.shippingMethod,
//     paymentMethod: data.paymentMethod,
//     expectedDate: data.expectedDate,
//   });
  
//   // Parse a complete consumer response to the ConsumerDetails structure
//   export const parseConsumerDetails = (data: ConsumerApiResponse): ConsumerDetails => ({
//     order: parseOrderDetails(data),
//     basic: parseBasicDetails(data),
//     shipping: parseShippingDetails(data),
//     billing: parseBillingDetails(data),
//   });
  
//   // Parse prixer data to the BasicDetails structure (fallback case)
//   export const parsePrixerDetails = (data: PrixerApiResponse): BasicDetails => ({
//     name: data.firstName,
//     lastName: data.lastName,
//     phone: data.phone || "",
//     email: data.email || "",
//     address: data.address || "",
//   });
  
//   export const parseShippingMethods = (data: any[]): ShippingMethod[] => {
//     return data.map((method) => ({
//       id: method._id,
//       name: method.name,
//       price: method.price,
//     }));
//   };

//   export const parseBillingMethods = (data: any[]): PaymentMethod[] => {
//     return data.map((method) => ({
//       name: method.name,
//       id: method._id,
//     }));
//   };