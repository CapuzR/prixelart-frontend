import { Art } from '../../../types/art.types';
import axios from 'axios';

export const fetchArt = async (artId: string): Promise<Art> => {
  const URI = import.meta.env.VITE_BACKEND_URL + '/art/read-by-id';

  try {
    const response = await axios.post<{ arts: Art }>(URI, { _id: artId });
    return response.data.arts;

  } catch (error) {
    console.error("Error fetching art data:", error);
    throw error;
  }
};

export const fetchGallery = async (filters: object): Promise<{ arts: Art[]; length: number }> => {
  try {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/art/read-for-gallery';
    const response = await axios.post(base_url, filters);
    return response?.data;
  } catch (error) {
    console.error('Error consultando artes');
    throw error;
  }
};