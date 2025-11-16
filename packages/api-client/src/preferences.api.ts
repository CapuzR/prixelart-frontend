import { CarouselItem, TermsAndConditions } from "@prixpon/types/preference.types";
import { BACKEND_URL } from "./utils.api";
import { PrixResponse } from "@prixpon/types/prixResponse.types";
import axios from "axios";

export const fetchCarouselImages = async (): Promise<CarouselItem[]> => {
  const URI = `${BACKEND_URL}/carousel`;

  try {
    const res = await axios.get<PrixResponse>(URI);

    if (!res.data.success) {
      console.error("Failed to fetch carousel data:", res.data.message);
    }

    const items = res.data.result as CarouselItem[];

    return items;
  } catch (error) {
    console.error("Error fetching carousel images:", error);
    return [];
  }
};

interface CreateCarouselItemSuccessResult extends CarouselItem {}

interface CreateCarouselItemPrixResponse extends PrixResponse {
  result?: CreateCarouselItemSuccessResult;
}

export const createCarouselItem = async (itemData: {
  type: "desktop" | "mobile";
  imageURL: string;
}): Promise<CarouselItem> => {
  const URI = `${BACKEND_URL}/carousel`;

  try {
    const response = await axios.post<CreateCarouselItemPrixResponse>(
      URI,
      itemData,
      {
        withCredentials: true,
      },
    );

    if (response.data && response.data.success && response.data.result) {
      return response.data.result;
    } else {
      const errorMessage =
        response.data?.message ||
        "Failed to create carousel item due to an unknown server error.";
      console.error(
        "Error in createCarouselItem API call (server-side):",
        errorMessage,
        response.data,
      );
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error in createCarouselItem API call:", error);
    throw error;
  }
};

export const deleteCarouselItem = async (id: string): Promise<PrixResponse> => {
  const URI = `${BACKEND_URL}/carousel/${id}`; // Include item ID in the URL
  try {
    // Make DELETE request
    const response = await axios.delete<PrixResponse>(URI, {
      withCredentials: true, // Include credentials
    });

    // Check for backend success indication
    if (!response.data.success) {
      console.error(
        `Backend reported failure deleting carousel item ${id}:`,
        response.data.message,
      );
      throw new Error(
        response.data.message || `Failed to delete carousel item.`,
      );
    }

    // Return the success response
    return response.data;
  } catch (error) {
    console.error(`Error deleting carousel item ${id}:`, error);
    throw error;
  }
};

export const updateCarouselOrder = async (
  type: "desktop" | "mobile",
  orderedIds: string[],
): Promise<PrixResponse> => {
  const URI = `${BACKEND_URL}/carousel/order/${type}`; // Include type in the URL
  try {
    // Make PUT request with the ordered IDs in the body
    const response = await axios.put<PrixResponse>(
      URI,
      { orderedIds },
      {
        // Send orderedIds in the request body
        withCredentials: true, // Include credentials
      },
    );

    // Check for backend success indication
    if (!response.data.success) {
      console.error(
        `Backend reported failure updating ${type} carousel order:`,
        response.data.message,
      );
      throw new Error(
        response.data.message || `Failed to update ${type} carousel order.`,
      );
    }

    // Return the success response
    return response.data;
  } catch (error) {
    console.error(`Error updating ${type} carousel order:`, error);
    throw error;
  }
};

export const getTerms = async (): Promise<TermsAndConditions> => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/termsAndConditions/read";
  try {
    const response = await axios.get<PrixResponse>(base_url, {
      withCredentials: true,
    });

    console.log("RR", response);
    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message,
      );
      throw new Error(response.data.message || "Authentication failed");
    }

    const terms = response.data.result as unknown as TermsAndConditions;
    return terms;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const updateTerms = async (
  terms: TermsAndConditions,
): Promise<TermsAndConditions> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/termsAndConditions/update`;
  try {
    const response = await axios.put<PrixResponse>(base_url, terms, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        `Backend reported failure updating terms`,
        response.data.message,
      );
      throw new Error(response.data.message || `Failed to update terms`);
    }

    if (!response.data.result) {
      console.error(
        `Backend reported success but no terms data returned after update.`,
      );
      throw new Error(`No data received after updating terms.`);
    }

    const updatedTermsAndConditions = response.data
      .result as unknown as TermsAndConditions;
    return updatedTermsAndConditions;
  } catch (error) {
    console.error(`Error updating terms`, error);
    throw error;
  }
};
