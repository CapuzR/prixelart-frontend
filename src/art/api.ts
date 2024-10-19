import axios from 'axios';
import { Art } from './interface'

export const fetchArtDetails = async (artId: string): Promise<any> => {
    const base_url = `${process.env.REACT_APP_BACKEND_URL}/art/read-by-id`;
  
    try {
      const response = await axios.post(base_url, { _id: artId });
      return response?.data?.arts;
    } catch (error) {
      console.error("Error fetching art details:", error);
      throw error;
    }
  };

  export const readGallery = async (filters: object): Promise<any> => {
    try {
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/art/read-for-gallery"
      const response = await axios.post(base_url, filters)
      return response?.data
    } catch (error) {
      console.error("Error consultando artes")
      throw error;
    }
  }

 export const setVisibleArt = async (art: Art) => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/art/disable/" + art.artId
    art.visible = !art.visible
    const response = await axios.put(
      base_url,
      art,
      {
        headers: {
          adminToken: localStorage.getItem("adminTokenV")
        },
        withCredentials: true
      }
    )
  }