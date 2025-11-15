import { Art } from "types/art.types";
import { Gallery, PrixResponse } from "types/prixResponse.types";
import axios from "axios";
import { BACKEND_URL } from "./utils.api";
import { getImageSize } from "@utils/util";

export const getRandomArt = async (): Promise<Art> => {
  try {
    const response = await axios.get<PrixResponse>(
      `${import.meta.env.VITE_BACKEND_URL}/art/random`,
    );
    const result = response.data as PrixResponse;
    const art = result.result as Art;
    return art;
  } catch (error) {
    console.error("Error fetching art details:", error);
    throw error;
  }
};

export const fetchArt = async (artId: string): Promise<Art> => {
  const URI = `${BACKEND_URL}/art/read-by-id/${artId}`;

  try {
    const res = await axios.get(URI);
    const result = res.data as PrixResponse;

    const art = result.result as Art;
    return art;
  } catch (error) {
    console.error("Error fetching art data:", error);
    throw error;
  }
};

export const fetchArtByObjectId = async (_id: string): Promise<Art> => {
  const URI = `${BACKEND_URL}/art/read-by-objid/${_id}`;

  try {
    const res = await axios.get(URI);
    const result = res.data as PrixResponse;

    const art = result.result as Art;
    return art;
  } catch (error) {
    console.error("Error fetching art data:", error);
    throw error;
  }
};

export interface PaginatedArtsResult {
  arts: Art[];
  currentPage: number;
  totalPages: number;
  totalArts: number;
  hasNextPage: boolean;
}

interface ArtsPrixResponse {
  success: boolean;
  message: string;
  result: PaginatedArtsResult | null;
}
// End of shared types

export const getArtsByPrixer = async (
  username: string,
  page: number,
  limit: number,
  sortOption?: string,
  filterCategory?: string,
): Promise<PaginatedArtsResult | null> => {
  // Adjusted to return null on failure to align with some component logic
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/art/read-by-prixer/${username}`;
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (sortOption) {
    const [sortBy, sortOrder] = sortOption.split("_");
    if (sortBy) params.append("sortBy", sortBy);
    if (sortOrder) params.append("sortOrder", sortOrder);
  }

  if (filterCategory) {
    params.append("category", filterCategory);
  }

  const urlWithParams = `${base_url}?${params.toString()}`;

  try {
    const response = await axios.get<ArtsPrixResponse>(urlWithParams, {
      withCredentials: true,
    });

    if (!response.data.success || !response.data.result) {
      console.error(
        "Backend reported failure or missing result for getArtsByPrixer:",
        response.data.message,
      );
      // Throw an error that the component can catch and display
      throw new Error(
        response.data.message || "Failed to fetch arts from backend.",
      );
    }
    return response.data.result; // Contains arts, currentPage, totalPages, hasNextPage
  } catch (e) {
    console.error(`Error in getArtsByPrixer for ${username}, page ${page}:`, e);
    if (axios.isAxiosError(e) && e.response) {
      throw new Error(e.response.data.message || (e.message as string));
    }
    // Ensure a generic error is thrown if not an Axios error with a message
    throw new Error(
      e instanceof Error
        ? e.message
        : "An unexpected error occurred while fetching arts.",
    );
  }
};

export const getArts = async (): Promise<Art[]> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/art/read-all";
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

    const arts = response.data.result as unknown as Art[];
    return arts;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

interface GalleryResponse {
  arts: Art[];
  hasMore: boolean;
}

export const fetchGallery = async (
  filters: object,
): Promise<GalleryResponse> => {
  const URI = `${BACKEND_URL}/art/read-gallery`;

  try {
    const res = await axios.post(URI, filters);
    const result = res.data as PrixResponse;

    // Ensure you return the new structure. The backend now sends 'hasMore' instead of 'length'.
    const gallery = result.result as unknown as GalleryResponse;
    return {
      arts: gallery.arts,
      hasMore: gallery.hasMore,
    };
  } catch (error) {
    console.error("Error fetching gallery data:", error);
    // On error, we assume there are no arts and no more pages.
    return { arts: [], hasMore: false };
  }
};

export const fetchBestArts = async (): Promise<Art[]> => {
  const URI = `${BACKEND_URL}/art/bestSellers`;

  try {
    const res = await axios.get<PrixResponse>(URI);

    if (!res.data.success) {
      console.error("Failed to fetch best arts:", res.data.message);
      return [];
    }

    // assuming result shape: { arts: Art[] }
    const arts = res.data.result as Art[];
    return arts;
  } catch (error) {
    console.error("Error fetching best arts:", error);
    return [];
  }
};

export const fetchLatestArts = async (): Promise<Art[]> => {
  const URI = `${BACKEND_URL}/art/get-latest`;

  try {
    const res = await axios.get<PrixResponse>(URI);

    if (!res.data.success) {
      console.error("Failed to fetch latest arts:", res.data.message);
      return [];
    }

    const rawArts = res.data.result as Art[];

    // preload and attach dimensions
    const artsWithUrls = rawArts.map((art) => ({
      ...art,
      url: art.largeThumbUrl || art.largeThumbUrl,
    }));

    const sizes = await Promise.all(
      artsWithUrls.map(async (art) => {
        try {
          return await getImageSize(art.largeThumbUrl);
        } catch (e) {
          console.warn("Failed to size:", art.largeThumbUrl, e);
          return { width: 0, height: 0 };
        }
      }),
    );

    return artsWithUrls.map((art, i) => ({
      ...art,
      width: sizes[i].width,
      height: sizes[i].height,
    }));
  } catch (error) {
    console.error("Error fetching latest arts:", error);
    return [];
  }
};

export const createArt = async (data: Partial<Art>): Promise<Art> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/art/create";
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

    const newArt = response.data.result as unknown as Art;
    return newArt;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateArt = async (
  id: string,
  artData: Partial<Art>,
): Promise<PrixResponse> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/art/update/${id}`;
  try {
    const response = await axios.put<PrixResponse>(base_url, artData, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        `Backend reported failure updating art`,
        response.data.message,
      );
      throw new Error(response.data.message || `Failed to update art `);
    }

    if (!response.data.result) {
      console.error(
        `Backend reported success but no art data returned after update.`,
      );
      throw new Error(`No data received after updating art.`);
    }

    const updatedAdmin = response.data as PrixResponse;
    return updatedAdmin;
  } catch (error) {
    console.error(`Error updating art`, error);
    throw error;
  }
};

export const deleteArt = async (id: string): Promise<Art> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/art/delete/" + id;
  try {
    const response = await axios.delete(base_url, { withCredentials: true });

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message,
      );
      throw new Error(response.data.message || "Authentication failed");
    }

    const delArt = response.data.result as unknown as Art;
    return delArt;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
