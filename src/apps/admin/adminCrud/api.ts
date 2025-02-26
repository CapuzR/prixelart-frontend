import axios from "axios";

export const loadRoles = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/admin/read-roles";
  try {
    const response = await axios.post(
      base_url,
      { adminToken: localStorage.getItem("adminTokenV") },
      { withCredentials: true }
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

export const createAdmin = async (data: object) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/admin/create";
  try {
    const response = await axios.post(base_url, data, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteAdmin = async (username: string) => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/admin/delete/" + username;
  try {
    const response = await axios.put(
      base_url,
      { adminToken: localStorage.getItem("adminTokenV") },
      { withCredentials: true }
    );
    return { data: response.data, status: response.status };
  } catch (e) {
    console.log(e);
  }
};

export const deleteAdminRole = async (id: string) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/adminRole/delete/" + id;
  try {
    const response = await axios.put(
      base_url,
      { adminToken: localStorage.getItem("adminTokenV") },
      { withCredentials: true }
    );
    return { data: response.data, status: response.status };
  } catch (e) {
    console.log(e);
  }
};
