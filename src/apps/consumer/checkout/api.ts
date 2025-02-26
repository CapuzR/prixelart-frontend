import axios from "axios";
import {
  parseConsumerDetails,
  parsePrixerDetails,
  parseShippingMethods,
  parseBillingMethods,
} from "./parseApi";
import {
  ConsumerDetails,
  BasicInfo,
  ShippingMethod,
  PaymentMethod,
} from "./interfaces";

/**
 * Fetch consumer details using token and parse the response.
 * @param token - The user's authentication token.
 * @returns Parsed ConsumerDetails or an object containing only basic details.
 */
export const fetchConsumer = async (
  token: string
): Promise<ConsumerDetails | null> => {
  if (!token) return null;

  const email = JSON.parse(token).email;
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  try {
    // Fetch consumer details
    const consumerResponse = await axios.post(`${baseUrl}/consumer/read`, { email });
    if (consumerResponse.data.success) {
      return parseConsumerDetails(consumerResponse.data.consumer);
    }

    // Fetch prixer details as a fallback
    // const username = JSON.parse(token).username;
    // const prixerResponse = await axios.post(`${baseUrl}/prixer/read`, { username });
    // if (prixerResponse.data) {
    //   const parsedPrixer: BasicInfo = parsePrixerDetails(prixerResponse.data);
    //   return { basic: parsedPrixer };
    // }

    return null;
  } catch (error) {
    console.error("Error fetching consumer or prixer data:", error);
    return null;
  }
};

/**
 * Fetch shipping methods from the backend.
 * @returns A list of parsed shipping methods or an empty array on error.
 */
export const fetchShippingMethods = async (): Promise<ShippingMethod[]> => {

  let shippingMethods = JSON.parse(localStorage.getItem("shippingMethods"));

  if (shippingMethods) {
    return shippingMethods;
  }

  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/shipping-method/read-all-v2`;

  try {
    const response = await axios.get(baseUrl);
    const parsedShippingMethods = parseShippingMethods(response.data);
    const shippingMethods = Array.isArray(parsedShippingMethods) ? parsedShippingMethods : [];
    localStorage.setItem("shippingMethods", JSON.stringify(shippingMethods));

    return shippingMethods;
  } catch (error) {
    console.error("Error fetching shipping methods:", error);
    return [];
  }
};

/**
 * Fetch billing methods from the backend.
 * @returns A list of parsed billing methods or an empty array on error.
 */
export const fetchBillingMethods = async (): Promise<PaymentMethod[]> => {

  let billingMethods = JSON.parse(localStorage.getItem("billingMethods"));

  if (billingMethods) {
    return billingMethods;
  }

  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/payment-method/read-all-v2`;

  try {
    const response = await axios.get(baseUrl);
    const parsedBillingMethods = parseBillingMethods(response.data);
    billingMethods = Array.isArray(parsedBillingMethods) ? parsedBillingMethods : [];
    localStorage.setItem("billingMethods", JSON.stringify(billingMethods));

    return billingMethods;
  } catch (error) {
    console.error("Error fetching billing methods:", error);
    return [];
  }
};

/**
 * Fetch sellers from the backend.
 * @returns A list of seller usernames or an empty array on error.
 */
export const fetchSellers = async (): Promise<string[]> => {
  let sellers = JSON.parse(localStorage.getItem("sellers"));

  if (sellers) {
    return sellers;
  }

  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/admin/getSellers`;

  try {
    const response = await axios.get(baseUrl);
    sellers = Array.isArray(response.data) ? response.data : [];
    localStorage.setItem("sellers", JSON.stringify(sellers));

    return sellers;
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return [];
  }
};
