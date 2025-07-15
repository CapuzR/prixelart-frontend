import { PrixResponse } from "types/prixResponse.types";
import axios from "axios";
import { Movement } from "types/movement.types";
import { BACKEND_URL } from "./utils.api";

export const createMovement = async (data: Partial<Movement>): Promise<any> => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/movement/create"
    try {
        const response = await axios.post<PrixResponse>(base_url, data, { withCredentials: true })

        if (!response.data.success) {
            console.error('Backend reported authentication failure:', response.data.message);
            throw new Error(response.data.message || "Authentication failed");
        }

        const newMovement = response.data.result as unknown as any;
        return newMovement;
    } catch (e) {
        console.log(e)
        throw (e);
    }
}

export const fetchMovementById = async (movementId: string): Promise<Movement> => {
    const URI = `${BACKEND_URL}/movement/read-by-id/${movementId}`;

    try {
        const res = await axios.get(URI);
        const result = res.data as PrixResponse;
        console.log("dddasda", result)
        const movement = result.result as Movement;
        return movement;
    } catch (error) {
        console.error("Error fetching movement data:", error);
        throw error;
    }
};

interface GetMovementsOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    destinatary?: string
}

// --- Define Expected Paginated Response Structure ---
interface PaginatedMovementsResult {
    data: Movement[];
    totalCount: number;
}

interface GetMovementsResponse extends Omit<PrixResponse, 'result'> {
    result: PaginatedMovementsResult | null;
}

export const getMovements = async (options: GetMovementsOptions): Promise<PaginatedMovementsResult> => {
    const {destinatary, page, limit, sortBy = 'date', sortOrder = 'desc', ...filters } = options;
    type QueryParams = Record<string, string>;
    const queryParams: QueryParams = {
        page: String(page),
        limit: String(limit),
        sortBy: sortBy,
        sortOrder: sortOrder,
        destinatary: destinatary!
      };

      const params = new URLSearchParams(queryParams);

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
        }
    });

    const url = `${BACKEND_URL}/movement/read-all?${params.toString()}`;

    try {
        const response = await axios.get<GetMovementsResponse>(url, { withCredentials: true });

        if (!response.data.success || !response.data.result) {
            console.error('Backend reported failure fetching movements:', response.data.message);
            throw new Error(response.data.message || "Failed to fetch movements");
        }

        return response.data.result; 
    } catch (e) {
        console.error("Error fetching movements:", e);
        if (axios.isAxiosError(e)) {
            throw new Error(`Network or server error: ${e.response?.data?.message || e.message}`);
        }
        throw e;
    }
};

export const updateMovement = async (id: string, movementData: Partial<Movement>): Promise<Movement> => {
    const base_url = `${import.meta.env.VITE_BACKEND_URL}/movement/update/${id}`;
    try {
        const response = await axios.put<PrixResponse>(base_url, movementData, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error(`Backend reported failure updating movement`, response.data.message);
            throw new Error(response.data.message || `Failed to update movement`);
        }

        if (!response.data.result) {
            console.error(`Backend reported success but no movement data returned after update.`);
            throw new Error(`No data received after updating movement.`);
        }

        const updatedMovement = response.data.result as unknown as Movement;
        return updatedMovement;

    } catch (error) {
        console.error(`Error updating movement`, error);
        throw error;
    }
};

export const reverseMovement = async (id: string): Promise<Movement> => {
    const base_url = `${import.meta.env.VITE_BACKEND_URL}/movement/reverse/${id}`;
    try {
        const response = await axios.put<PrixResponse>(base_url, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error(`Backend reported failure updating movement`, response.data.message);
            throw new Error(response.data.message || `Failed to update movement`);
        }

        if (!response.data.result) {
            console.error(`Backend reported success but no movement data returned after update.`);
            throw new Error(`No data received after updating movement.`);
        }

        const updatedMovement = response.data.result as unknown as Movement;
        return updatedMovement;

    } catch (error) {
        console.error(`Error updating movement`, error);
        throw error;
    }
};