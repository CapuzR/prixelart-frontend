import axios from "axios";
import { BACKEND_URL } from "./utils.api";
import { PrixResponse } from "@prixpon/types/prixResponse.types";
import { Service } from "@prixpon/types/service.types";
import { ObjectId } from "mongodb";

// — Public —

/** Get all active/public services */
export const fetchActiveServices = async (): Promise<Service[]> => {
  const url = `${BACKEND_URL}/service/read-all-active`;
  try {
    const res = await axios.get<PrixResponse>(url);
    if (!res.data.success || !Array.isArray(res.data.result)) {
      console.error("Failed to fetch active services:", res.data.message);
      return [];
    }
    return res.data.result as Service[];
  } catch (error) {
    console.error("Error fetching active services:", error);
    return [];
  }
};

/** Get a single service by its ID (public) */
export const fetchServiceDetails = async (
  serviceId: string,
): Promise<Service> => {
  const url = `${BACKEND_URL}/service/readService/${serviceId}`;
  try {
    const res = await axios.get<PrixResponse>(url);
    if (!res.data.success || !res.data.result) {
      throw new Error(res.data.message || "Service not found");
    }
    return res.data.result as Service;
  } catch (error) {
    console.error("Error fetching service details:", error);
    throw error;
  }
};

/** Get all services created by a specific Prixer (public) */
export const fetchServicesByPrixer = async (
  prixerId: string,
): Promise<Service[]> => {
  const url = `${BACKEND_URL}/service/getServiceByPrixer/${prixerId}`;
  try {
    const res = await axios.get<PrixResponse>(url);
    if (!res.data.success || !Array.isArray(res.data.result)) {
      console.error("Failed to fetch services by prixer:", res.data.message);
      return [];
    }
    return res.data.result as Service[];
  } catch (error) {
    console.error("Error fetching services by prixer:", error);
    return [];
  }
};

/** Get all services by an arbitrary user ID (public) */
export const fetchServicesByUser = async (
  userId: string | ObjectId,
): Promise<Service[]> => {
  const url = `${BACKEND_URL}/service/by-user/${userId}`;
  try {
    const res = await axios.get<PrixResponse>(url);
    if (!res.data.success || !Array.isArray(res.data.result)) {
      console.error("Failed to fetch services by user:", res.data.message);
      return [];
    }
    return res.data.result as Service[];
  } catch (error) {
    console.error("Error fetching services by user:", error);
    return [];
  }
};

// — Authenticated (User) —

// Remember to send cookies or tokens
const authOpts = { withCredentials: true };

/** Create a new service (user must be logged in) */
export const createService = async (
  data: Partial<Service>,
): Promise<Service> => {
  const url = `${BACKEND_URL}/service/create`;
  try {
    const res = await axios.post<PrixResponse>(url, data, authOpts);
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to create service");
    }
    return res.data.result as Service;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

/** Read *your* services (user must be logged in) */
export const fetchMyServices = async (): Promise<Service[]> => {
  const url = `${BACKEND_URL}/service/readMyServices`;
  try {
    const res = await axios.post<PrixResponse>(url, {}, authOpts);
    if (!res.data.success || !Array.isArray(res.data.result)) {
      console.error("Failed to fetch my services:", res.data.message);
      return [];
    }
    return res.data.result as Service[];
  } catch (error) {
    console.error("Error fetching my services:", error);
    return [];
  }
};

/** Update one of your services (user must be logged in) */
export const updateMyService = async (
  serviceId: string,
  data: Partial<Service>,
): Promise<Service> => {
  const url = `${BACKEND_URL}/service/updateMyService/${serviceId}`;
  try {
    const res = await axios.put<PrixResponse>(url, data, authOpts);
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to update service");
    }
    return res.data.result as Service;
  } catch (error) {
    console.error("Error updating my service:", error);
    throw error;
  }
};

/** Delete one of your services (user must be logged in) */
export const deleteService = async (serviceId: string): Promise<Service> => {
  const url = `${BACKEND_URL}/service/deleteService/${serviceId}`;
  try {
    const res = await axios.delete<PrixResponse>(url, authOpts);
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to delete service");
    }
    return res.data.result as Service;
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};

// — Authenticated (Admin) —

/** Get *all* services (admin only) */
export const fetchAllServices = async (): Promise<Service[]> => {
  const url = `${BACKEND_URL}/service/read-all`;
  try {
    const res = await axios.get<PrixResponse>(url, authOpts);
    if (!res.data.success || !Array.isArray(res.data.result)) {
      console.error("Failed to fetch all services:", res.data.message);
      return [];
    }
    return res.data.result as Service[];
  } catch (error) {
    console.error("Error fetching all services:", error);
    return [];
  }
};

/** Disable (soft‐delete) a service (admin only) */
export const disableService = async (serviceId: string): Promise<Service> => {
  const url = `${BACKEND_URL}/service/disable/${serviceId}`;
  try {
    const res = await axios.put<PrixResponse>(url, {}, authOpts);
    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to disable service");
    }
    return res.data.result as Service;
  } catch (error) {
    console.error("Error disabling service:", error);
    throw error;
  }
};
