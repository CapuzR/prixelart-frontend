import { PrixResponse } from "types/prixResponse.types";
import axios from "axios";
import { Movement } from "types/movement.types";
import { BACKEND_URL } from "./utils.api";

export const createMovement = async (data: Partial<Movement>): Promise<Movement> => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/movement/create"
    try {
        const response = await axios.post<PrixResponse>(base_url, data, { withCredentials: true })

        if (!response.data.success) {
            console.error('Backend reported authentication failure:', response.data.message);
            throw new Error(response.data.message || "Authentication failed");
        }

        const newMovement = response.data.result as unknown as Movement;
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
}

// --- Define Expected Paginated Response Structure ---
interface PaginatedMovementsResult {
    data: Movement[];
    totalCount: number;
}

interface GetMovementsResponse extends Omit<PrixResponse, 'result'> {
    result: PaginatedMovementsResult | null;
}

// --- Updated API Function ---
export const getMovements = async (options: GetMovementsOptions): Promise<PaginatedMovementsResult> => {
    const { page, limit, sortBy = 'date', sortOrder = 'desc', ...filters } = options;
    // Construct query parameters
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy: sortBy,
        sortOrder: sortOrder,
    });

    // Add filter params if they exist
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

        // Return the nested result directly
        return response.data.result; // Contains { data: Movement[], totalCount: number }
    } catch (e) {
        console.error("Error fetching movements:", e); // Log the specific error
        // Rethrow or handle as appropriate for your app's error strategy
        if (axios.isAxiosError(e)) {
            throw new Error(`Network or server error: ${e.response?.data?.message || e.message}`);
        }
        throw e; // Rethrow other errors
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