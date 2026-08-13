import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import type { AuthResponseType, CheckMeResponseType, LogoutResponseType, RefreshResponseType } from "../types/auth.types";

const api = axios.create({
    baseURL: import.meta.env.PROD ? "/api/auth" : "http://localhost:3000/api/auth",
    withCredentials: true
})

// keep the access token in the axios header after login/refresh
export const setAccesstoken = (accessToken: string | null) => {
    if (accessToken) api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
    else delete api.defaults.headers.common["Authorization"]
}

export async function register(username: string, email: string, password: string): Promise<AuthResponseType | null> {
    try {
        const response = await api.post("/signup", { username, email, password });
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
        const response = await api.post("/login", { email, password });
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
        const response = await api.get("/logout");
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
        const response = await api.get("/check-me");
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
        const response = await api.get("/refresh-token");
        if (response.status === 400) throw new Error(response.data.message);
        return response.data;
    } catch (error: any) {
        if (error instanceof AxiosError) return error.response?.data;
        return Promise.reject(error);
    }
}