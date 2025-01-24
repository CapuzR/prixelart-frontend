import axios from "axios";
import { Art } from "../../../types/art.types";
import { AdminToken } from "../../../types/admin.types";
import { Permissions } from "../../../types/permissions.types";

import { Dispatch, SetStateAction } from 'react';


export const getRandomArt = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/art/random";
  try {
    const response = await axios.get(base_url);
    return response?.data?.arts.largeThumbUrl;
  } catch (error) {
    console.error("Error fetching art details:", error);
    throw error;
  }
};

export const login = async (data: object) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/admin/login";
  try {
    const response = await axios.post(base_url, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
