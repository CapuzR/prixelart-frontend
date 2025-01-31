import axios from "axios";

export const getAdmins = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/admin/read-all";
  try {
    const response = await axios.post(
      base_url,
      { adminToken: localStorage.getItem("adminToken") },
      { withCredentials: true }
    );
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

export const getRoles = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/admin/read-roles";
  try {
    const response = await axios.post(
      base_url,
      { adminToken: localStorage.getItem("adminToken") },
      { withCredentials: true }
    );
    return response.data;
  } catch (e) {
    console.log(e);
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
    console.log(response);
  } catch (e) {
    console.log(e);
  }
};

export const deleteRole = async (id: string) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/adminRole/delete/" + id;
  try {
    const response = await axios.put(
      base_url,
      { adminToken: localStorage.getItem("adminTokenV") },
      { withCredentials: true }
    );
    console.log(response);
  } catch (e) {
    console.log(e);
  }
};
