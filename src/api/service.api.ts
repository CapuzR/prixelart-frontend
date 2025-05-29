import { PrixResponse } from "types/prixResponse.types";
import { Service } from "types/service.types";
import axios from "axios";

export const fetchActiveServices = async (): Promise<Service[]> => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/service/read-all-active';

    const res = await axios.get<PrixResponse>(base_url);

    if (!res.data.success || !Array.isArray(res.data.result)) {
        console.error('Failed to fetch:', res.data.message);
    }

    const items = res.data.result as Service[];
    return items;
};