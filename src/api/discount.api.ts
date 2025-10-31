import { PrixResponse } from "types/prixResponse.types";
import axios from "axios";
import { Discount } from "types/discount.types";
import { BACKEND_URL } from "./utils.api";

export const createDiscount = async (
  data: Partial<Discount>,
): Promise<Discount> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/discount/create";
  try {
    const response = await axios.post<PrixResponse>(base_url, data, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message,
      );
      throw new Error(response.data.message || "Authentication failed");
    }

    const newDiscount = response.data.result as unknown as Discount;
    return newDiscount;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const fetchDiscountById = async (
  discountId: string,
): Promise<Discount> => {
  const URI = `${BACKEND_URL}/discount/read-by-id/${discountId}`;

  try {
    const res = await axios.get(URI);
    const result = res.data as PrixResponse;

    const discount = result.result as Discount;
    return discount;
  } catch (error) {
    console.error("Error fetching discount data:", error);
    throw error;
  }
};

export const getDiscounts = async (): Promise<Discount[]> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/discount/read-all";
  try {
    const response = await axios.get<PrixResponse>(base_url, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message,
      );
      throw new Error(response.data.message || "Authentication failed");
    }

    const discounts = response.data.result as unknown as Discount[];
    return discounts;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const fetchActiveDiscounts = async (): Promise<Discount[]> => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/discount/read-all-active";
  try {
    const response = await axios.get<PrixResponse>(base_url, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message,
      );
      throw new Error(response.data.message || "Authentication failed");
    }

    const discounts = response.data.result as unknown as Discount[];
    return discounts;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const updateDiscount = async (
  id: string,
  discountData: Partial<Discount>,
): Promise<Discount> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/discount/update/${id}`;
  try {
    const response = await axios.put<PrixResponse>(base_url, discountData, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        `Backend reported failure updating discount`,
        response.data.message,
      );
      throw new Error(response.data.message || `Failed to update discount`);
    }

    if (!response.data.result) {
      console.error(
        `Backend reported success but no discount data returned after update.`,
      );
      throw new Error(`No data received after updating discount.`);
    }

    const updatedDiscount = response.data.result as unknown as Discount;
    return updatedDiscount;
  } catch (error) {
    console.error(`Error updating discount`, error);
    throw error;
  }
};

export const deleteDiscount = async (id: string): Promise<Discount> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/discount/delete/" + id;
  try {
    const response = await axios.delete(base_url, { withCredentials: true });

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message,
      );
      throw new Error(response.data.message || "Authentication failed");
    }

    const delDiscount = response.data.result as unknown as Discount;
    return delDiscount;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
