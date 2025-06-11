import axios from "axios";
import { OrderArchive, PayStatus, Status } from "types/orderArchive.types";
import { PrixResponse } from "types/prixResponse.types";
import { BACKEND_URL } from "./utils.api";

export interface GetOrdersOptions {
    page: number;
    limit: number;
    sortBy?: string;           // e.g., 'createdOn', 'total'
    sortOrder?: 'asc' | 'desc';
    search?: string;           // Search term
    status?: Status;      // Filter by order status
    payStatus?: PayStatus;// Filter by payment status
    startDate?: string;        // Start date string (e.g., 'YYYY-MM-DD')
    endDate?: string;          // End date string (e.g., 'YYYY-MM-DD')
}

// --- Define Expected Paginated Response Structure ---
export interface PaginatedOrdersResult {
    data: OrderArchive[];      // Array of orders for the current page
    totalCount: number;        // Total count matching filters
}

// --- Define the Full API Response Structure ---
export interface GetOrdersResponse extends Omit<PrixResponse, 'result'> {
    result: PaginatedOrdersResult | null;
}

export const getOrderArchives = async (options: GetOrdersOptions): Promise<PaginatedOrdersResult> => {
    const {
        page,
        limit,
        sortBy = 'createdOn', // Default sort matching backend
        sortOrder = 'desc',   // Default sort matching backend
        // Collect all filter properties using rest syntax
        ...filters
    } = options;

    // Construct query parameters for pagination and sorting
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy: sortBy,
        sortOrder: sortOrder,
    });

    // Add filter params only if they have a non-empty value
    // Note: Keys here MUST match the query parameter names expected by the backend controller
    // (status, payStatus, search, startDate, endDate)
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            // Ensure the key matches backend expectations if different from options key
            // In this case, they match: 'status', 'payStatus', 'search', 'startDate', 'endDate'
            params.append(key, String(value));
        }
    });

    // Construct the full API endpoint URL
    const url = `${BACKEND_URL}/orderArchive/read-all?${params.toString()}`;
    // console.log("Fetching orders from:", url); // Optional: log the URL for debugging

    try {
        // Make the GET request
        const response = await axios.get<GetOrdersResponse>(url, {
            withCredentials: true // Include if your auth relies on cookies/sessions
        });

        // Check for backend-reported failure or missing result
        if (!response.data.success || !response.data.result) {
            const errorMsg = response.data.message || "Backend failed to fetch orders";
            console.error('Backend reported failure fetching orders:', errorMsg, response.data);
            throw new Error(errorMsg);
        }

        // Return the nested result containing data and totalCount
        return response.data.result;

    } catch (e) {
        console.error("Error fetching orders:", e); // Log the specific error

        // Handle Axios-specific errors for better messages
        if (axios.isAxiosError(e)) {
            const backendMsg = e.response?.data?.message; // Message from backend error response
            const statusText = e.response?.statusText;
            const genericMsg = `Network or server error (${e.response?.status || 'N/A'})`;
            throw new Error(backendMsg || statusText || genericMsg);
        }

        // Rethrow other types of errors (e.g., errors thrown from the success check above)
        throw e;
    }
};

export const getOrderArchiveById = async (id: string): Promise<OrderArchive> => {
    const url = import.meta.env.VITE_BACKEND_URL + '/orderArchive/read/' + id; // Endpoint for reading by ID
    try {
        const response = await axios.get<PrixResponse>(url, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error(`Backend reported failure fetching order '${id}':`, response.data.message);
            throw new Error(response.data.message || `Failed to fetch order '${id}'`);
        }

        if (!response.data.result) {
            console.error(`Backend reported success but no data for order '${id}'.`);
            throw new Error(`No data received for order '${id}'.`);
        }

        // Cast the result to Order
        const order = response.data.result as unknown as OrderArchive;
        return order;

    } catch (error) {
        console.error(`Error fetching order by ID '${id}':`, error);
        throw error; // Re-throw the error
    }
};

export const updateOrderArchive = async (id: string, orderArchiveData: Partial<OrderArchive>): Promise<OrderArchive> => {
    const base_url = `${import.meta.env.VITE_BACKEND_URL}/orderArchive/update/${id}`;
    try {
        const response = await axios.put<PrixResponse>(base_url, orderArchiveData, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error(`Backend reported failure updating orderArchive:`, response.data.message);
            throw new Error(response.data.message || `Failed to update orderArchive`);
        }

        const updatedOrderArchive = response.data.result as unknown as OrderArchive;
        return updatedOrderArchive;

    } catch (error) {
        console.error(`Error updating orderArchive`, error);
        throw error;
    }
};