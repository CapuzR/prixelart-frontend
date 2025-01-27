import axios from "axios";
import { Art } from "../../../types/art.types";
import { AdminToken } from "../../../types/admin.types";
import { Permissions } from "../../../types/permissions.types";

import { Dispatch, SetStateAction } from "react";
import jwtDecode from "jwt-decode";
import { permission } from "process";

const now = new Date();

export const getRandomArt = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/art/random";
  try {
    const response = await axios.get(base_url);
    console.log(response?.data?.arts.largeThumbUrl)
    return response?.data?.arts?.largeThumbUrl;
  } catch (error) {
    console.error("Error fetching art details:", error);
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/admin/login";
  try {
    const data = {
      email: email.toLowerCase(),
      password: password,
    };
    const response = await axios.post(base_url, data, {
      withCredentials: true,
    });
    const log = response.data;

    const token = jwtDecode<AdminToken>(log.adminToken);
    const permissions = token.permissions;
    localStorage.setItem("adminToken", JSON.stringify(token));
    localStorage.setItem(
      "adminTokenExpire",
      JSON.stringify(now.getTime() + 21600000)
    );
    return { log: response.data, permissions: permissions };
  } catch (error) {
    console.log(error);
  }
};
