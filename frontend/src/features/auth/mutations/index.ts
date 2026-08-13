import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { login, logout, register, setAccesstoken } from "../services/auth.api";
import type { AuthResponseType } from "../types/auth.types";
import { useAuth } from "../hook/useAuth";

type LoginVariables = {
    email: string;
    password: string;
};

type SignupVariables = {
    username: string;
    email: string;
    password: string;
};

const authSessionKey = ["auth", "session"];

// React hooks must run inside a component or another custom hook.
// These helpers wrap the mutation logic so pages can call them safely.
export const useLoginMutation = () => {
    const queryClient = useQueryClient();
    const [, setUser] = useAuth();

    return useMutation<AuthResponseType, Error, LoginVariables>({
        mutationFn: async ({ email, password }: LoginVariables) => {
            const response = await login(email, password);
            if (!response) {
                throw new Error("Login failed");
            }
            return response;
        },
        onSuccess: (data: AuthResponseType) => {
            // set the auth context
            setUser(data.user);

            // Store the access token in axios memory so protected calls include it.
            setAccesstoken(data.accessToken);

            // Cache the current user so the UI can update immediately.
            queryClient.setQueryData(authSessionKey, data.user);

            // toast the success message 
            toast.success(data.message);
        },
    });
};

export const useSignupMutation = () => {
    const queryClient = useQueryClient();
    const [, setUser] = useAuth();
    return useMutation<AuthResponseType, Error, SignupVariables>({
        mutationFn: async ({ username, email, password }: SignupVariables) => {
            const response = await register(username, email, password);
            if (!response) {
                throw new Error("Signup failed");
            }
            return response;
        },
        onSuccess: (data: AuthResponseType) => {
            // set the auth context
            setUser(data.user);
            // Store the access token in axios memory so protected calls include it.
            setAccesstoken(data.accessToken);

            // Cache the current user so the UI can update immediately.
            queryClient.setQueryData(authSessionKey, data.user);

            // toast the success message 
            toast.success(data.message);
        },
    });
};

export const useLogoutMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await logout();
            if (!response) {
                throw new Error("Logout failed");
            }
            return response;
        },
        onSuccess: () => {
            // Remove the access token so later requests no longer authenticate.
            setAccesstoken(null);

            // Clear the cached session user.
            queryClient.setQueryData(authSessionKey, null);

            // toast the success message 
            toast.success("Logout successful");
        },
    });
};