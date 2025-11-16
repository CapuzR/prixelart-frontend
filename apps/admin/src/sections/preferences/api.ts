import axios from "axios";

export const getArts = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/art/read-all";
  try {
    const response = await axios.get(base_url);
    return response.data.arts;
  } catch (error) {
    console.log(error);
  }
};

export const getArtBestSellers2 = async () => {
  const url = import.meta.env.VITE_BACKEND_URL + "/getArtBestSellers";
  try {
    const response = await axios.get(url);
    return response.data.arts;
  } catch (error) {
    console.log(error);
  }
};
export const getArtBestSellers = async () => {
  const url = import.meta.env.VITE_BACKEND_URL + "/art/bestSellers";
  try {
    const response = await axios.get(url);
    return response.data.ref;
  } catch (error) {
    console.log(error);
  }
};
