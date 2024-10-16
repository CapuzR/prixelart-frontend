import axios from 'axios';

export const fetchArtDetails = async (artId: string): Promise<any> => {
    const base_url = `${process.env.REACT_APP_BACKEND_URL}/art/read-by-id`;
  
    try {
      const response = await axios.post(base_url, { _id: artId });
      return response?.data?.arts;
    } catch (error) {
      console.error("Error fetching art details:", error);
      throw error; // Handle error at the component level
    }
  };
