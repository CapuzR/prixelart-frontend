import axios from "axios";
import { User } from "../../../types/user.types";
import { Prixer } from "../../../types/prixer.types";

export const createUser = async (data: Partial<User>) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/register";
  try {
    const response = await axios.post(base_url, data);
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const createPrixer = async (data: Partial<Prixer>) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/prixer-registration";
  try {
    const response = await axios.post(base_url, data, {
      withCredentials: true,
      });
    return response;
  } catch (error) {
    console.log(error);
  }
};
