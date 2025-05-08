import { PrixResponse } from "types/prixResponse.types";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const adminLogin = async (email: string, password: string): Promise<PrixResponse> => {
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

export const login = async (email: string, password: string): Promise<PrixResponse> => {

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
