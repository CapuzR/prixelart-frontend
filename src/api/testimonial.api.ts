import { Testimonial } from "types/testimonial.types";
import { BACKEND_URL } from "./utils.api";
import { PrixResponse } from "types/prixResponse.types";
import axios from "axios";

const TESTIMONIALS_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/testimonial`;

export const createTestimonial = async (
  data: Omit<Testimonial, "_id">,
): Promise<Testimonial> => {
  const url = `${TESTIMONIALS_BASE_URL}/create`; // Endpoint for creating
  try {
    const response = await axios.post<PrixResponse>(url, data, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        "Backend reported failure creating testimonial:",
        response.data.message,
      );
      throw new Error(response.data.message || "Failed to create testimonial");
    }

    if (!response.data.result) {
      console.error(
        "Backend reported success but no testimonial data was returned.",
      );
      throw new Error("No data received for the new testimonial.");
    }

    // Cast the result to Testimonial
    const newTestimonial = response.data.result as unknown as Testimonial;
    return newTestimonial;
  } catch (error) {
    console.error("Error creating testimonial:", error);
    throw error; // Re-throw the error
  }
};

export const readAllTestimonial = async (): Promise<Testimonial[]> => {
  const URI = `${BACKEND_URL}/testimonial`;

  try {
    const res = await axios.get<PrixResponse>(URI);

    if (!res.data.success) {
      console.error("Failed to fetch testimonials:", res.data.message);
      return [];
    }

    const testimonials = res.data.result as Testimonial[];
    const sortedTestimonials = testimonials.sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0),
    );
    return sortedTestimonials;
  } catch (error) {
    console.error("Error reading testimonials:", error);
    return [];
  }
};

export const getTestimonialById = async (id: string): Promise<Testimonial> => {
  const url = `${TESTIMONIALS_BASE_URL}/${id}`; // Endpoint for reading by ID
  try {
    const response = await axios.get<PrixResponse>(url, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        `Backend reported failure fetching testimonial '${id}':`,
        response.data.message,
      );
      throw new Error(
        response.data.message || `Failed to fetch testimonial '${id}'`,
      );
    }

    if (!response.data.result) {
      console.error(
        `Backend reported success but no data for testimonial '${id}'.`,
      );
      throw new Error(`No data received for testimonial '${id}'.`);
    }

    // Cast the result to Testimonial
    const testimonial = response.data.result as unknown as Testimonial;
    return testimonial;
  } catch (error) {
    console.error(`Error fetching testimonial by ID '${id}':`, error);
    throw error; // Re-throw the error
  }
};

export const updateTestimonial = async (
  id: string,
  data: Partial<Testimonial>,
): Promise<Testimonial> => {
  // Ensure _id is not included in the update payload
  const updateData = { ...data };
  delete updateData._id;

  const url = `${TESTIMONIALS_BASE_URL}/update/${id}`; // Endpoint for updating
  try {
    const response = await axios.put<PrixResponse>(url, updateData, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        `Backend reported failure updating testimonial '${id}':`,
        response.data.message,
      );
      throw new Error(
        response.data.message || `Failed to update testimonial '${id}'`,
      );
    }

    if (!response.data.result) {
      console.error(
        `Backend reported success but no testimonial data returned after update for '${id}'.`,
      );
      throw new Error(`No data received after updating testimonial '${id}'.`);
    }

    // Cast the result to Testimonial
    const updatedTestimonial = response.data.result as unknown as Testimonial;
    return updatedTestimonial;
  } catch (error) {
    console.error(`Error updating testimonial '${id}':`, error);
    throw error; // Re-throw the error
  }
};

export const updateTestimonialOrder = async (
  orderedIds: string[],
): Promise<boolean> => {
  const url = `${TESTIMONIALS_BASE_URL}/order`;
  try {
    const response = await axios.put<PrixResponse>(
      url,
      { orderedIds },
      { withCredentials: true },
    );

    if (!response.data.success) {
      console.error(
        "Backend reported failure updating testimonial order:",
        response.data.message,
      );
      throw new Error(
        response.data.message || "Failed to update testimonial order",
      );
    }

    return response.data.success;
  } catch (error) {
    console.error("Error updating testimonial order:", error);

    if (axios.isAxiosError(error) && error.response) {
      const prixResponse = error.response.data as PrixResponse;
      if (prixResponse && typeof prixResponse.message === "string") {
        throw new Error(prixResponse.message);
      }
    }

    throw error;
  }
};

export const deleteTestimonial = async (id: string): Promise<Testimonial> => {
  const url = `${TESTIMONIALS_BASE_URL}/delete/${id}`; // Endpoint for deleting
  try {
    const response = await axios.delete<PrixResponse>(url, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        `Backend reported failure deleting testimonial '${id}':`,
        response.data.message,
      );
      throw new Error(
        response.data.message || `Failed to delete testimonial '${id}'`,
      );
    }

    if (!response.data.result) {
      // Assuming backend returns the deleted object for consistency. Adjust .
      console.warn(
        `Backend reported success deleting testimonial '${id}' but returned no data.`,
      );
      // throw new Error(`No data received after deleting testimonial '${id}'.`);
    }

    // Cast the result to Testimonial (if the backend returns it)
    const deletedTestimonial = response.data.result as unknown as Testimonial;
    return deletedTestimonial; // Or adjust return type/value if backend behaves differently
  } catch (error) {
    console.error(`Error deleting testimonial '${id}':`, error);
    throw error; // Re-throw the error
  }
};
