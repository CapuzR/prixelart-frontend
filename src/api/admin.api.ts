import { PrixResponse } from "types/prixResponse.types";
import { PermissionsV2 } from "types/permissions.types";
import axios from "axios";
import { Admin } from "types/admin.types";

export const getPermissions = async (): Promise<PermissionsV2> => {
  try {
    const response = await axios.get<PrixResponse>(
      `${import.meta.env.VITE_BACKEND_URL}/admin/check-auth`,
      {
        withCredentials: true,
      },
    );

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message,
      );
      throw new Error(response.data.message || "Authentication failed");
    }

    if (response.data.result === undefined || response.data.result === null) {
      console.error(
        "Backend reported success but no permissions result was provided.",
      );
      throw new Error("No permissions data received.");
    }

    const permissions = response.data.result as unknown as PermissionsV2;

    return permissions;
  } catch (error) {
    console.error("Error during authentication check:", error);
    throw error;
  }
};

export const getRoles = async (): Promise<PermissionsV2[]> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/admin/read-roles";
  try {
    const response = await axios.get<PrixResponse>(base_url, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message,
      );
      throw new Error(response.data.message || "Authentication failed");
    }

    const permissions = response.data.result as unknown as PermissionsV2[];

    return permissions;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchSellers = async (): Promise<string[]> => {
  const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/admin/getSellers`;

  try {
    const response = await axios.get<PrixResponse>(baseUrl);

    if (!response.data.success) {
      console.error("No hay vendedores:", response.data.message);
      throw new Error(response.data.message || "Authentication failed");
    }

    const sellers = response.data.result as unknown as string[];

    return sellers;
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return [];
  }
};

export const createAdmin = async (data: Admin): Promise<Admin> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/admin/create";
  try {
    const response = await axios.post<PrixResponse>(base_url, data, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message,
      );
      throw new Error(response.data.message || "Authentication failed");
    }

    const newAdmin = response.data.result as unknown as Admin;
    return newAdmin;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAdmins = async (): Promise<Admin[]> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/admin/read-all";
  try {
    const response = await axios.get<PrixResponse>(base_url, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message,
      );
      throw new Error(response.data.message || "Authentication failed");
    }

    const admins = response.data.result as unknown as Admin[];
    return admins;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const getAdminByUsername = async (username: string): Promise<Admin> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/admin/read/${username}`;
  try {
    const response = await axios.get<PrixResponse>(base_url, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        `Backend reported failure fetching admin '${username}':`,
        response.data.message,
      );
      throw new Error(
        response.data.message || `Failed to fetch admin '${username}'`,
      );
    }

    if (!response.data.result) {
      console.error(
        `Backend reported success but no admin data for '${username}'.`,
      );
      throw new Error(`No data received for admin '${username}'.`);
    }

    const admin = response.data.result as unknown as Admin;
    return admin;
  } catch (error) {
    console.error(`Error fetching admin by username '${username}':`, error);
    throw error;
  }
};

export const updateAdmin = async (
  id: string,
  adminData: Partial<Admin>,
): Promise<Admin> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/admin/update/${id}`;
  try {
    const response = await axios.put<PrixResponse>(base_url, adminData, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        `Backend reported failure updating admin '${adminData.username}':`,
        response.data.message,
      );
      throw new Error(
        response.data.message ||
          `Failed to update admin '${adminData.username}'`,
      );
    }

    if (!response.data.result) {
      console.error(
        `Backend reported success but no admin data returned after update for '${adminData.username}'.`,
      );
      throw new Error(
        `No data received after updating admin '${adminData.username}'.`,
      );
    }

    const updatedAdmin = response.data.result as unknown as Admin;
    return updatedAdmin;
  } catch (error) {
    console.error(`Error updating admin '${adminData.username}':`, error);
    throw error;
  }
};

export const deleteAdmin = async (username: string): Promise<Admin> => {
  const base_url =
    import.meta.env.VITE_BACKEND_URL + "/admin/delete/" + username;
  try {
    const response = await axios.delete(base_url, { withCredentials: true });

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message,
      );
      throw new Error(response.data.message || "Authentication failed");
    }

    const delAdmin = response.data.result as unknown as Admin;
    return delAdmin;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const createRole = async (
  data: Partial<PermissionsV2>,
): Promise<PermissionsV2> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/permissions/create";
  try {
    const response = await axios.post<PrixResponse>(base_url, data, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message,
      );
      throw new Error(response.data.message || "Authentication failed");
    }

    const newRole = response.data.result as unknown as PermissionsV2;
    return newRole;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const getRoleById = async (id: string): Promise<PermissionsV2> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/permissions/read/${id}`;
  try {
    const response = await axios.get<PrixResponse>(base_url, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        `Backend reported failure fetching role '${id}':`,
        response.data.message,
      );
      throw new Error(response.data.message || `Failed to fetch role '${id}'`);
    }

    const role = response.data.result as unknown as PermissionsV2;
    return role;
  } catch (error) {
    console.error(`Error fetching role by ID '${id}':`, error);
    throw error;
  }
};

export const updateRole = async (
  id: string,
  roleData: Partial<PermissionsV2>,
): Promise<PermissionsV2> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/permissions/update/${id}`;
  try {
    // Send only the fields intended for update
    const response = await axios.put<PrixResponse>(base_url, roleData, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        `Backend reported failure updating role '${id}':`,
        response.data.message,
      );
      throw new Error(response.data.message || `Failed to update role '${id}'`);
    }

    if (!response.data.result) {
      console.error(
        `Backend reported success but no role data returned after update for '${id}'.`,
      );
      throw new Error(`No data received after updating role '${id}'.`);
    }

    // Cast the result to Permissions
    const updatedRole = response.data.result as unknown as PermissionsV2;
    return updatedRole;
  } catch (error) {
    console.error(`Error updating role '${id}':`, error);
    throw error; // Re-throw
  }
};

export const deleteRole = async (id: string): Promise<PermissionsV2> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/permissions/delete/${id}`;
  try {
    const response = await axios.delete<PrixResponse>(base_url, {
      withCredentials: true,
    });

    if (!response.data.success) {
      console.error(
        `Backend reported failure deleting role '${id}':`,
        response.data.message,
      );
      throw new Error(response.data.message || `Failed to delete role '${id}'`);
    }

    const deletedRole = response.data.result as unknown as PermissionsV2;
    return deletedRole;
  } catch (error) {
    // Log and re-throw any errors
    console.error(`Error deleting role '${id}':`, error);
    throw error;
  }
};
