import axios from "axios";
import {
  parseConsumerDetails,
  parseShippingMethods,
  parseBillingMethods,
} from "./parseApi";
import {
  CheckoutState,
  ConsumerDetails,
  PaymentMethod,
  ShippingMethod,
} from "./interfaces";

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

export const fetchShippingMethods = async (): Promise<ShippingMethod[]> => {

  const shippingMethodsStr = localStorage.getItem("shippingMethods");
  let shippingMethods;

  if (shippingMethodsStr) {
    shippingMethods = JSON.parse(shippingMethodsStr);
  } else {
    shippingMethods = null;
  }

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

export const fetchBillingMethods = async (): Promise<PaymentMethod[]> => {

  const billingMethodsStr = localStorage.getItem("billingMethods");
  let billingMethods;

  if (billingMethodsStr) {
    billingMethods = JSON.parse(billingMethodsStr);
  } else {
    billingMethods = null;
  }

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

export const fetchSellers = async (): Promise<string[]> => {

  const sellersStr = localStorage.getItem("sellers");
  let sellers;

  if (sellersStr) {
    sellers = JSON.parse(sellersStr);
  } else {
    sellers = null;
  }

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

export const createOrderByUser = async (payload: any): Promise<{ status: 'ok' | 'error'; orderId?: string }> => {
  try {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/order/createv2';
    const response = await fetch(base_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    return { status: 'ok', orderId: result.order.res.orderId };

  } catch (error) {
    console.error('Error submitting order:', error);
    return { status: 'error' };
  }
};