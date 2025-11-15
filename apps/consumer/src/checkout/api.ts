import axios from "axios";
import { parseConsumerDetails } from "./parseApi";
import { ConsumerDetails, Order } from "@prixpon/types/order.types";

export const fetchConsumer = async (
  token: string,
): Promise<ConsumerDetails | null> => {
  if (!token) return null;

  const email = JSON.parse(token).email;
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  try {
    // Fetch consumer details
    const consumerResponse = await axios.post(`${baseUrl}/consumer/read`, {
      email,
    });
    if (consumerResponse.data.success) {
      return parseConsumerDetails(consumerResponse.data.consumer);
    }

    return null;
  } catch (error) {
    console.error("Error fetching consumer or prixer data:", error);
    return null;
  }
};

export const createOrderByUser = async (
  payload: Order,
): Promise<{ success: boolean; info: string }> => {
  try {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/order/createv2";
    const response = await fetch(base_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const result = await response.json();

    console.log("respuesta?", result);
    return result;
  } catch (error) {
    console.error("Error submitting order:", error);
    return { success: false, info: "Error" };
  }
};
