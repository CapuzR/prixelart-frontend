import { Order, PaymentMethod, ShippingMethod } from "types/order.types";
import axios from "axios";
import { PrixResponse } from "types/prixResponse.types";

const SHIPPING_METHODS_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/shipping-method`;
const PAYMENT_METHODS_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/payment-method`;

export const createShippingMethod = async (data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
    const url = `${SHIPPING_METHODS_BASE_URL}/create`; // Endpoint for creating
    try {
        // Send data excluding server-generated fields
        const response = await axios.post<PrixResponse>(url, data, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error('Backend reported failure creating shipping method:', response.data.message);
            throw new Error(response.data.message || "Failed to create shipping method");
        }

        if (!response.data.result) {
            console.error('Backend reported success but no shipping method data was returned.');
            throw new Error("No data received for the new shipping method.");
        }

        // Cast the result to ShippingMethod
        const newShippingMethod = response.data.result as unknown as ShippingMethod;
        return newShippingMethod;

    } catch (error) {
        console.error("Error creating shipping method:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
};

export const fetchShippingMethods = async (): Promise<ShippingMethod[]> => {
    const url = `${SHIPPING_METHODS_BASE_URL}/read-all`; // Endpoint for reading all
    try {
        const response = await axios.get<PrixResponse>(url, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error('Backend reported failure fetching shipping methods:', response.data.message);
            throw new Error(response.data.message || "Failed to fetch shipping methods");
        }

        // Cast the result to an array of ShippingMethod
        // Handle cases where result might be null or undefined gracefully
        const shippingMethods = (response.data.result as unknown as ShippingMethod[]) || [];
        return shippingMethods;

    } catch (error) {
        console.error("Error fetching all shipping methods:", error);
        throw error; // Re-throw the error
    }
};

export const fetchActiveShippingMethods = async (): Promise<ShippingMethod[]> => {
    const url = `${SHIPPING_METHODS_BASE_URL}/read-all-active`; // Endpoint for reading all
    try {
        const response = await axios.get<PrixResponse>(url, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error('Backend reported failure fetching shipping methods:', response.data.message);
            throw new Error(response.data.message || "Failed to fetch shipping methods");
        }

        // Cast the result to an array of ShippingMethod
        // Handle cases where result might be null or undefined gracefully
        const shippingMethods = (response.data.result as unknown as ShippingMethod[]) || [];
        return shippingMethods;

    } catch (error) {
        console.error("Error fetching all shipping methods:", error);
        throw error; // Re-throw the error
    }
};

export const getShippingMethodById = async (id: string): Promise<ShippingMethod> => {
    const url = `${SHIPPING_METHODS_BASE_URL}/read/${id}`; // Endpoint for reading a single item by ID
    try {
        const response = await axios.get<PrixResponse>(url, {
            withCredentials: true, // Include credentials  for authentication
        });

        if (!response.data.success) {
            console.error(`Backend reported failure fetching shipping method '${id}':`, response.data.message);
            // Consider if a 404 Not Found should be handled differently than a server error
            throw new Error(response.data.message || `Failed to fetch shipping method '${id}'`);
        }

        if (!response.data.result) {
            // This case means the backend call succeeded but returned no data (e.g., ID not found)
            console.error(`Backend reported success but no data for shipping method '${id}'.`);
            throw new Error(`No data received for shipping method '${id}'. Could indicate the ID does not exist.`);
        }

        // Cast the result to ShippingMethod
        const shippingMethod = response.data.result as unknown as ShippingMethod;
        return shippingMethod;

    } catch (error) {
        // Log the error with context
        console.error(`Error fetching shipping method by ID '${id}':`, error);
        // Re-throw the error so the calling code can handle it (e.g., show a message to the user)
        throw error;
    }
};

export const updateShippingMethod = async (id: string, data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
    // Ensure _id, createdOn, createdBy are not included in the update payload unless intended
    const updateData = { ...data };
    delete updateData._id;
    delete updateData.createdOn;
    delete updateData.createdBy;

    const url = `${SHIPPING_METHODS_BASE_URL}/update/${id}`; // Endpoint for updating
    try {
        const response = await axios.put<PrixResponse>(url, updateData, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error(`Backend reported failure updating shipping method '${id}':`, response.data.message);
            throw new Error(response.data.message || `Failed to update shipping method '${id}'`);
        }

        if (!response.data.result) {
            console.error(`Backend reported success but no shipping method data returned after update for '${id}'.`);
            throw new Error(`No data received after updating shipping method '${id}'.`);
        }

        // Cast the result to ShippingMethod
        const updatedShippingMethod = response.data.result as unknown as ShippingMethod;
        return updatedShippingMethod;

    } catch (error) {
        console.error(`Error updating shipping method '${id}':`, error);
        throw error; // Re-throw the error
    }
};

export const deleteShippingMethod = async (id: string): Promise<ShippingMethod> => {
    const url = `${SHIPPING_METHODS_BASE_URL}/delete/${id}`; // Endpoint for deleting
    try {
        const response = await axios.delete<PrixResponse>(url, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error(`Backend reported failure deleting shipping method '${id}':`, response.data.message);
            throw new Error(response.data.message || `Failed to delete shipping method '${id}'`);
        }

        const deletedShippingMethod = response.data.result as unknown as ShippingMethod;
        return deletedShippingMethod; // Or return void/boolean if the backend doesn't return the object

    } catch (error) {
        console.error(`Error deleting shipping method '${id}':`, error);
        throw error; // Re-throw the error
    }
};

export const createPaymentMethod = async (data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    const url = `${PAYMENT_METHODS_BASE_URL}/create`; // Endpoint for creating
    try {
        // If 'voucher' is a File, this request might need to use FormData
        const response = await axios.post<PrixResponse>(url, data, {
            withCredentials: true,
            // Headers might need to be adjusted if using FormData, e.g., 'Content-Type': 'multipart/form-data'
            // headers: { 'Content-Type': 'application/json' }, // Default for axios post
        });

        if (!response.data.success) {
            console.error('Backend reported failure creating payment method:', response.data.message);
            throw new Error(response.data.message || "Failed to create payment method");
        }

        if (!response.data.result) {
            console.error('Backend reported success but no payment method data was returned.');
            throw new Error("No data received for the new payment method.");
        }

        // Cast the result to PaymentMethod
        const newPaymentMethod = response.data.result as unknown as PaymentMethod;
        return newPaymentMethod;

    } catch (error) {
        console.error("Error creating payment method:", error);
        throw error; // Re-throw the error
    }
};

export const readAllPaymentMethods = async (): Promise<PaymentMethod[]> => {
    const url = `${PAYMENT_METHODS_BASE_URL}/read-all`; // Endpoint for reading all
    try {
        const response = await axios.get<PrixResponse>(url, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error('Backend reported failure fetching payment methods:', response.data.message);
            throw new Error(response.data.message || "Failed to fetch payment methods");
        }

        // Cast the result to an array of PaymentMethod
        const paymentMethods = (response.data.result as unknown as PaymentMethod[]) || [];
        return paymentMethods;

    } catch (error) {
        console.error("Error fetching all payment methods:", error);
        throw error; // Re-throw the error
    }
};

export const readAllActivePaymentMethods = async (): Promise<PaymentMethod[]> => {
    const url = `${PAYMENT_METHODS_BASE_URL}/read-all-active`; // Endpoint for reading all
    try {
        const response = await axios.get<PrixResponse>(url, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error('Backend reported failure fetching payment methods:', response.data.message);
            throw new Error(response.data.message || "Failed to fetch payment methods");
        }

        // Cast the result to an array of PaymentMethod
        const paymentMethods = (response.data.result as unknown as PaymentMethod[]) || [];
        return paymentMethods;

    } catch (error) {
        console.error("Error fetching all payment methods:", error);
        throw error; // Re-throw the error
    }
};

export const getPaymentMethodById = async (id: string): Promise<PaymentMethod> => {
    const url = `${PAYMENT_METHODS_BASE_URL}/read/${id}`; // Endpoint for reading by ID
    try {
        const response = await axios.get<PrixResponse>(url, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error(`Backend reported failure fetching payment method '${id}':`, response.data.message);
            throw new Error(response.data.message || `Failed to fetch payment method '${id}'`);
        }

        if (!response.data.result) {
            console.error(`Backend reported success but no data for payment method '${id}'.`);
            throw new Error(`No data received for payment method '${id}'.`);
        }

        // Cast the result to PaymentMethod
        const paymentMethod = response.data.result as unknown as PaymentMethod;
        return paymentMethod;

    } catch (error) {
        console.error(`Error fetching payment method by ID '${id}':`, error);
        throw error; // Re-throw the error
    }
};

export const updatePaymentMethod = async (id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    // Ensure _id is not included in the update payload
    const updateData = { ...data };
    delete updateData._id;

    const url = `${PAYMENT_METHODS_BASE_URL}/update/${id}`; // Endpoint for updating
    try {
        // If 'voucher' is a File, this request might need to use FormData
        const response = await axios.put<PrixResponse>(url, updateData, {
            withCredentials: true,
            // Headers might need adjustment for FormData
            // headers: { 'Content-Type': 'application/json' }, // Default for axios put
        });

        if (!response.data.success) {
            console.error(`Backend reported failure updating payment method '${id}':`, response.data.message);
            throw new Error(response.data.message || `Failed to update payment method '${id}'`);
        }

        if (!response.data.result) {
            console.error(`Backend reported success but no payment method data returned after update for '${id}'.`);
            throw new Error(`No data received after updating payment method '${id}'.`);
        }

        // Cast the result to PaymentMethod
        const updatedPaymentMethod = response.data.result as unknown as PaymentMethod;
        return updatedPaymentMethod;

    } catch (error) {
        console.error(`Error updating payment method '${id}':`, error);
        throw error; // Re-throw the error
    }
};

export const deletePaymentMethod = async (id: string): Promise<PaymentMethod> => {
    const url = `${PAYMENT_METHODS_BASE_URL}/delete/${id}`; // Endpoint for deleting
    try {
        const response = await axios.delete<PrixResponse>(url, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error(`Backend reported failure deleting payment method '${id}':`, response.data.message);
            throw new Error(response.data.message || `Failed to delete payment method '${id}'`);
        }

        if (!response.data.result) {
            // As before, assuming backend returns the deleted object for consistency. Adjust .
            console.warn(`Backend reported success deleting payment method '${id}' but returned no data.`);
            // throw new Error(`No data received after deleting payment method '${id}'.`);
        }

        // Cast the result to PaymentMethod (if the backend returns it)
        const deletedPaymentMethod = response.data.result as unknown as PaymentMethod;
        return deletedPaymentMethod; // Or adjust return type/value if backend behaves differently

    } catch (error) {
        console.error(`Error deleting payment method '${id}':`, error);
        throw error; // Re-throw the error
    }
};

export const createOrder = async (data: Partial<Order>): Promise<Order> => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/order/create"
    try {
        const response = await axios.post<PrixResponse>(base_url, data, {
            withCredentials: true,
        })

        if (!response.data.success) {
            console.error('Backend reported authentication failure:', response.data.message);
            throw new Error(response.data.message || "Authentication failed");
        }

        const newOrder = response.data.result as unknown as Order;
        return newOrder;
    } catch (error) {
        console.log(error)
        throw (error);
    }
}

export const getOrderById = async (id: string): Promise<Order> => {
    const url = import.meta.env.VITE_BACKEND_URL + '/order/read/' + id; // Endpoint for reading by ID
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
        const order = response.data.result as unknown as Order;
        return order;

    } catch (error) {
        console.error(`Error fetching order by ID '${id}':`, error);
        throw error; // Re-throw the error
    }
};

export const getOrders = async (): Promise<Order[]> => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/order/read-all";
    try {
        const response = await axios.get<PrixResponse>(base_url, { withCredentials: true },);

        if (!response.data.success) {
            console.error('Backend reported authentication failure:', response.data.message);
            throw new Error(response.data.message || "Authentication failed");
        }

        const orders = typeof response.data.result === 'string'
            ? JSON.parse(response.data.result) as Order[]
            : response.data.result as Order[];
        return orders;
    } catch (e) {
        console.log(e);
        throw (e);
    }
};

export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<Order> => {
    const base_url = `${import.meta.env.VITE_BACKEND_URL}/order/update/${id}`;
    try {
        const response = await axios.put<PrixResponse>(base_url, orderData, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error(`Backend reported failure updating order '${id}':`, response.data.message);
            throw new Error(response.data.message || `Failed to update order '${id}'`);
        }

        if (!response.data.result) {
            console.error(`Backend reported success but no order data returned after update for '${id}'.`);
            throw new Error(`No data received after updating order '${id}'.`);
        }

        const updatedOrder = response.data.result as unknown as Order;
        return updatedOrder;

    } catch (error) {
        console.error(`Error updating order '${id}':`, error);
        throw error;
    }
};

export const deleteOrder = async (id: string): Promise<Order> => {
    const base_url =
        import.meta.env.VITE_BACKEND_URL + "/order/delete/" + id
    try {
        const response = await axios.delete(base_url, { withCredentials: true })

        if (!response.data.success) {
            console.error('Backend reported authentication failure:', response.data.message);
            throw new Error(response.data.message || "Authentication failed");
        }

        const delOrder = response.data.result as unknown as Order;
        return delOrder;
    } catch (e) {
        console.log(e)
        throw (e)
    }
}

export interface GlobalDashboardStatsData {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    unitsSold: number;
    orderStatusCounts: Record<string, number>; // Keyed by OrderStatus string name
}

export interface GlobalTopPerformingItemData {
    id: string; // Product or Art ID
    name: string;
    quantity: number;
    revenue: number;
    imageUrl?: string;
}

export interface DashboardFilters { // This can be a shared type
    startDate: Date;
    endDate: Date;
}

export const fetchGlobalOrdersList = async (filters: DashboardFilters): Promise<Order[]> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/orders`;
    try {
        console.log("Fetching global orders with filters:", filters);
        console.log("URL:", url);
        const response = await axios.get<PrixResponse>(url, {
            params: {
                startDate: filters.startDate.toISOString(),
                endDate: filters.endDate.toISOString(),
            },
            withCredentials: true,
        });

        if (!response.data.success || !response.data.result) {
            console.error(`Backend error fetching global orders:`, response.data.message);
            throw new Error(response.data.message || `Failed to fetch global orders`);
        }
        return response.data.result;
    } catch (error) {
        console.error(`API Client Error in fetchGlobalOrdersList:`, error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.message || 'Failed to fetch global orders due to server error.');
        }
        throw error;
    }
};

/**
 * Fetches global dashboard statistics.
 * Corresponds to backend: GET /admin-dashboard/stats
 */
export const fetchGlobalDashboardStats = async (filters: DashboardFilters): Promise<GlobalDashboardStatsData> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/stats`;
    try {
        const response = await axios.get<PrixResponse>(url, {
            params: {
                startDate: filters.startDate.toISOString(),
                endDate: filters.endDate.toISOString(),
            },
            withCredentials: true,
        });

        if (!response.data.success || !response.data.result) {
            console.error(`Backend error fetching global dashboard stats:`, response.data.message);
            throw new Error(response.data.message || `Failed to fetch global dashboard stats`);
        }
        return response.data.result;
    } catch (error) {
        console.error(`API Client Error in fetchGlobalDashboardStats:`, error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.message || 'Failed to fetch global dashboard stats due to server error.');
        }
        throw error;
    }
};

/**
 * Fetches global top performing items.
 * Corresponds to backend: GET /admin-dashboard/top-items
 */
export const fetchGlobalTopPerformingItems = async (
    filters: DashboardFilters,
    limit: number = 5
): Promise<GlobalTopPerformingItemData[]> => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/top-items`;
    try {
        const response = await axios.get<PrixResponse>(url, {
            params: {
                startDate: filters.startDate.toISOString(),
                endDate: filters.endDate.toISOString(),
                limit: limit,
            },
            withCredentials: true,
        });

        if (!response.data.success || !response.data.result) {
            console.error(`Backend error fetching global top items:`, response.data.message);
            throw new Error(response.data.message || `Failed to fetch global top items`);
        }
        return response.data.result;
    } catch (error) {
        console.error(`API Client Error in fetchGlobalTopPerformingItems:`, error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.message || 'Failed to fetch global top items due to server error.');
        }
        throw error;
    }
};