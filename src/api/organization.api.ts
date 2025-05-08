import axios from "axios";
import { Organization } from "types/organization.types";

export const fetchAllOrgs = async (): Promise<Organization[]> => {
    const URI = `${import.meta.env.VITE_BACKEND_URL}/organization/read-all`;

    try {
        const res = await axios.get(URI);

        if (!res.data.success) {
            console.error('No orgs field in response');
            return [];
        }
        return res.data.result as Organization[];
    } catch (error) {
        console.error('Error fetching orgs:', error);
        return [];
    }
};