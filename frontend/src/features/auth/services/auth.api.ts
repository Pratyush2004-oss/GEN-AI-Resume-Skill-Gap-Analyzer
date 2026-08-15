import { AxiosError } from "axios";
import { toast } from "react-toastify";
import type { AuthResponseType, CheckMeResponseType, LogoutResponseType, RefreshResponseType } from "../types/auth.types";
import api from "../../../services/api";

// NOTE: The access token header is managed centrally in src/services/api.ts
// via setAccessToken(). Never create a separate axios instance here - if you
// do, the token set at login time won't be attached to these requests.

export async function register(username: string, email: string, password: string): Promise<AuthResponseType | null> {
    try {
        const response = await api.post("/auth/signup", { username, email, password });
        if (response.status === 400) throw new Error(response.data);
        return response.data;
    } catch (error: any) {
        if (error instanceof AxiosError) toast.error(error.response?.data.message);
        else toast.error(error.message);
        return null;
    }
}

// login 
export async function login(email: string, password: string): Promise<AuthResponseType | null> {
    try {
        const response = await api.post("/auth/login", { email, password });
        if (response.status === 400) throw new Error(response.data);
        return response.data;
    } catch (error: any) {
        if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
        }
        else toast.error(error.message);
        return null;
    }
}

// logout

export async function logout(): Promise<LogoutResponseType | null> {
    try {
        const response = await api.get("/auth/logout");
        if (response.status === 400) throw new Error(response.data.message);
        return response.data;
    } catch (error: any) {
        if (error instanceof AxiosError) toast.error(error.response?.data.message);
        else toast.error(error.message);
        return null;
    }
}

// check me

export async function checkMe(): Promise<CheckMeResponseType> {
    try {
        const response = await api.get("/auth/check-me");
        if (response.status === 400) throw new Error(response.data.message);
        return response.data;
    } catch (error: any) {
        if (error instanceof AxiosError) return error.response?.data;
        return Promise.reject(error);
    }
}

// refresh token
export async function refreshToken(): Promise<RefreshResponseType> {
    try {
        const response = await api.get("/auth/refresh-token");
        if (response.status === 400) throw new Error(response.data.message);
        return response.data;
    } catch (error: any) {
        if (error instanceof AxiosError) return error.response?.data;
        return Promise.reject(error);
    }
}