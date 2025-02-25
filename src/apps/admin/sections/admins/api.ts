import axios from "axios"
import { AdminRole, Admin } from "../../../../types/admin.types"

export const createAdmin = async (data: object) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/admin/create"
  try {
    const response = await axios.post(base_url, data, {
      withCredentials: true,
    })

    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const createRole = async (data: Partial<AdminRole>) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/adminRole/create"
  try {
    const response = await axios.post(base_url, data, { withCredentials: true })
    return response.data
  } catch (e) {
    console.log(e)
  }
}

export const getRoles = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/admin/read-roles"
  try {
    const response = await axios.post(base_url, { withCredentials: true })
    return response.data
  } catch (e) {
    console.log(e)
  }
}

export const updateAdmin = async (admin: Partial<Admin>) => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/admin/update/" + admin._id
  try {
    const response = await axios.put(base_url, admin, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const updateRole = async (admin: AdminRole) => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/adminRole/update/" + admin._id
  try {
    const response = await axios.put(base_url, admin, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const deleteAdmin = async (username: string) => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/admin/delete/" + username
  try {
    const response = await axios.put(base_url, { withCredentials: true })
    return { data: response.data, status: response.status }
  } catch (e) {
    console.log(e)
  }
}

export const deleteAdminRole = async (id: string) => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/adminRole/delete/" + id
  try {
    const response = await axios.put(base_url, { withCredentials: true })
    return { data: response.data, status: response.status }
  } catch (e) {
    console.log(e)
  }
}

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
