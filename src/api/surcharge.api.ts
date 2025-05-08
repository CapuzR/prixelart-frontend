import { PrixResponse } from "types/prixResponse.types";
import axios from "axios";
import { Surcharge } from "types/surcharge.types";
import { BACKEND_URL } from "./utils.api";

export const createSurcharge = async (data: Partial<Surcharge>): Promise<Surcharge> => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/surcharge/create"
    try {
        const response = await axios.post<PrixResponse>(base_url, data, { withCredentials: true })

        if (!response.data.success) {
            console.error('Backend reported authentication failure:', response.data.message);
            throw new Error(response.data.message || "Authentication failed");
        }

        const newSurcharge = response.data.result as unknown as Surcharge;
        return newSurcharge;
    } catch (e) {
        console.log(e)
        throw (e);
    }
}

export const fetchSurchargeById = async (surchargeId: string): Promise<Surcharge> => {
    const URI = `${BACKEND_URL}/surcharge/read-by-id/${surchargeId}`;

    try {
        const res = await axios.get(URI);
        const result = res.data as PrixResponse;

        const surcharge = result.result as Surcharge;
        return surcharge;
    } catch (error) {
        console.error("Error fetching surcharge data:", error);
        throw error;
    }
};

export const getSurcharges = async (): Promise<Surcharge[]> => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/surcharge/read-all";
    try {
        const response = await axios.get<PrixResponse>(base_url, { withCredentials: true },);

        if (!response.data.success) {
            console.error('Backend reported authentication failure:', response.data.message);
            throw new Error(response.data.message || "Authentication failed");
        }

        const surcharges = response.data.result as unknown as Surcharge[];
        return surcharges;
    } catch (e) {
        console.log(e);
        throw (e);
    }
};

export const fetchActiveSurcharges = async (): Promise<Surcharge[]> => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/surcharge/read-all-active";
    try {
        const response = await axios.get<PrixResponse>(base_url, { withCredentials: true },);

        if (!response.data.success) {
            console.error('Backend reported authentication failure:', response.data.message);
            throw new Error(response.data.message || "Authentication failed");
        }

        const surcharges = response.data.result as unknown as Surcharge[];
        return surcharges;
    } catch (e) {
        console.log(e);
        throw (e);
    }
};

export const updateSurcharge = async (id: string, surchargeData: Partial<Surcharge>): Promise<Surcharge> => {
    const base_url = `${import.meta.env.VITE_BACKEND_URL}/surcharge/update/${id}`;
    try {
        const response = await axios.put<PrixResponse>(base_url, surchargeData, {
            withCredentials: true,
        });

        if (!response.data.success) {
            console.error(`Backend reported failure updating surcharge`, response.data.message);
            throw new Error(response.data.message || `Failed to update surcharge`);
        }

        if (!response.data.result) {
            console.error(`Backend reported success but no surcharge data returned after update.`);
            throw new Error(`No data received after updating surcharge.`);
        }

        const updatedSurcharge = response.data.result as unknown as Surcharge;
        return updatedSurcharge;

    } catch (error) {
        console.error(`Error updating surcharge`, error);
        throw error;
    }
};

export const deleteSurcharge = async (id: string): Promise<Surcharge> => {
    const base_url =
        import.meta.env.VITE_BACKEND_URL + "/surcharge/delete/" + id
    try {
        const response = await axios.delete(base_url, { withCredentials: true })

        if (!response.data.success) {
            console.error('Backend reported authentication failure:', response.data.message);
            throw new Error(response.data.message || "Authentication failed");
        }

        const delSurcharge = response.data.result as unknown as Surcharge;
        return delSurcharge;
    } catch (e) {
        console.log(e)
        throw (e)
    }
}