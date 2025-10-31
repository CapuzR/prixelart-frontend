import { PrixResponse } from "types/prixResponse.types";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Constructs the base URL for the consumer-facing part of the site (e.g., https://prixelart.com)
 * It's URL-agnostic and will work on localhost, staging, or production.
 * @returns {string} The base URL for the main site.
 */
export const getMainSiteBaseUrl = (): string => {
  const { protocol, hostname, port } = window.location;

  // On production, hostname might be 'admin.prixelart.com'. We want 'prixelart.com'.
  const parts = hostname.split(".");
  const mainDomain = parts.length > 2 ? parts.slice(1).join(".") : hostname;

  const portString = port && port !== "80" && port !== "443" ? `:${port}` : "";

  return `${protocol}//${mainDomain}${portString}`;
};

export const adminLogin = async (
  email: string,
  password: string,
): Promise<PrixResponse> => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as PrixResponse;
  return data;
};

export const login = async (
  email: string,
  password: string,
): Promise<PrixResponse> => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = (await res.json()) as PrixResponse;
  return data;
};

export const isAuth = async (): Promise<PrixResponse> => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/me`, {
    method: "GET",
    credentials: "include",
  });

  if (res.ok) {
    const data = (await res.json()) as PrixResponse;
    return data;
  } else {
    return {
      success: false,
      message: "No se pudo verificar la autenticación",
    };
  }
};
