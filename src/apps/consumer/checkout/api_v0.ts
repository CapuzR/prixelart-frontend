// import axios from "axios";
// import { parseConsumerDetails, parsePrixerDetails, parseShippingMethods, parseBillingMethods } from "./parseApi";
// import { ConsumerDetails, BasicDetails } from "./interfaces";

// /**
//  * Fetch consumer details using token and parse the response.
//  * @param token - The user's authentication token.
//  * @returns Parsed ConsumerDetails or BasicDetails.
//  */
// export const fetchConsumer = async (token: string): Promise<ConsumerDetails | { basic: BasicDetails } | null> => {
//   if (!token) return null;

//   const email = JSON.parse(token).email;
//   const baseUrl = import.meta.env.VITE_BACKEND_URL;

//   try {
//     const consumerResponse = await axios.post(`${baseUrl}/consumer/read`, { email });
//     if (consumerResponse.data.success) {
//       return parseConsumerDetails(consumerResponse.data.consumer);
//     }

//     const username = JSON.parse(token).username;
//     const prixerResponse = await axios.post(`${baseUrl}/prixer/read`, { username });
//     if (prixerResponse.data) {
//       const parsedPrixer: BasicDetails = parsePrixerDetails(prixerResponse.data);
//       return { basic: parsedPrixer };
//     }

//     return null;
//   } catch (error) {
//     console.error("Error fetching consumer or prixer data:", error);
//     return null;
//   }
// };

// /**
//  * Fetch shipping methods from the backend.
//  * @returns List of shipping methods or an empty array on error.
//  */
// export const fetchShippingMethods = async (): Promise<any[]> => {
//   const baseUrl = import.meta.env.VITE_BACKEND_URL + "/shipping-method/read-all-v2";

//   try {
//     const response = await axios.get(baseUrl);
    
//     const parsedShippingMethods = parseShippingMethods(response.data);
//     return Array.isArray(parsedShippingMethods) ? parsedShippingMethods : [];
//   } catch (error) {
//     console.error("Error fetching shipping methods:", error);
//     return [];
//   }
// };

// export const fetchBillingMethods = async (): Promise<any[]> => {
//   const baseUrl = import.meta.env.VITE_BACKEND_URL + "/payment-method/read-all-v2";
//   try {
//     const response = await axios.get(baseUrl);
//     const parsedBillingMethods = parseBillingMethods(response.data);
//     console.log("PARSED BILLING METHODS", parsedBillingMethods);
//     return Array.isArray(parsedBillingMethods) ? parsedBillingMethods : [];
//   } catch (error) {
//     console.error("Error fetching billing methods:", error);
//     return [];
//   }
// };

// /**
//  * Fetch sellers from the backend.
//  * @returns List of seller usernames or an empty array on error.
//  */
// export const fetchSellers = async (): Promise<string[]> => {
//   const baseUrl = import.meta.env.VITE_BACKEND_URL + "/admin/getSellers";

//   try {
//     const response = await axios.get(baseUrl);
//     // Assuming the response data contains an array of seller usernames
//     return Array.isArray(response.data) ? response.data : [];
//   } catch (error) {
//     console.error("Error fetching sellers:", error);
//     return [];
//   }
// };