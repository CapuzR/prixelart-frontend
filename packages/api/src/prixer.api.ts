import { PrixResponse } from "@prixpon/types/prixResponse.types";
import axios from "axios";
import { User } from "@prixpon/types/user.types";
import { Prixer } from "@prixpon/types/prixer.types";

export const fetchAllPrixers = async (): Promise<User[]> => {
  const URI = `${import.meta.env.VITE_BACKEND_URL}/prixer/read-all`;

  try {
    const res = await axios.get(URI);

    if (!res.data.success) {
      console.error("No prixers field in response");
      return [];
    }

    return res.data.result as User[];
  } catch (error) {
    console.error("Error fetching prixers:", error);
    return [];
  }
};

export const fetchAllPrixersActive = async (): Promise<User[]> => {
  const URI = `${import.meta.env.VITE_BACKEND_URL}/prixer/read-all-active`;
  try {
    const res = await axios.get(URI);
    if (!res.data.success) {
      console.error("No prixers field in response");
      return [];
    }
    return res.data.result as User[];
  } catch (error) {
    console.error("Error fetching prixers:", error);
    return [];
  }
};

export const getPrixerByUsername = async (username: string): Promise<User> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/prixer/get/${username}`;
  try {
    const response = await axios.get<PrixResponse>(base_url, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        `Backend reported failure fetching user '${username}':`,
        response.data.message,
      );
      throw new Error(
        response.data.message || `Failed to fetch user '${username}'`,
      );
    }

    const role = response.data.result as unknown as User;
    return role;
  } catch (error) {
    console.error(`Error fetching user by ID '${username}':`, error);
    throw error;
  }
};

export const updatePrixerProfile = async (
  id: string,
  data: Partial<Prixer>,
): Promise<PrixResponse> => {
  const URI = `${import.meta.env.VITE_BACKEND_URL}/prixer/update`;
  try {
    const response = await axios.put<PrixResponse>(
      URI,
      { id, ...data },
      { withCredentials: true },
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to update profile.");
    }

    return response.data;
  } catch (error) {
    console.error("Error updating prixer profile:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "An unknown API error occurred.",
      );
    }
    throw error;
  }
};
