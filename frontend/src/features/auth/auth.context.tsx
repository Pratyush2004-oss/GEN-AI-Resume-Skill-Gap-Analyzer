import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useMemo, type SetStateAction } from "react";
import { checkMe, refreshToken } from "./services/auth.api";
import { setAccessToken } from "../../services/api";
import type { UserType } from "./types/auth.types";

export const AuthContext = createContext<
  [UserType | null, React.Dispatch<React.SetStateAction<UserType | null>>, boolean] | null
>(null);

const AUTH_SESSION_KEY = ["auth", "session"];
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const cachedUser = queryClient.getQueryData<UserType | null>(AUTH_SESSION_KEY);

  const { data: user, isLoading } = useQuery({
    queryKey: AUTH_SESSION_KEY,
    initialData: cachedUser ?? undefined,
    queryFn: async () => {
      try {
        // Step 1: use the refresh cookie to get a fresh access token.
        const refreshed = await refreshToken();
        if (!refreshed?.accessToken) {
          // refresh-token returned 401 — no valid session.
          throw new Error("Session expired");
        }

        // Step 2: store the access token on the shared axios instance so
        // protected requests (auth, interview, ...) can use it.
        setAccessToken(refreshed.accessToken);

        // Step 3: now that axios has the access token, fetch the logged-in user.
        const currentUser = await checkMe();
        if (!currentUser?.user) {
          // check-me returned 401 — the token we just got is already invalid.
          throw new Error("Unauthorized");
        }

        return currentUser.user;
      } catch (error) {
        // Any failure means there is no valid session — drop the stale access
        // token so later requests stop authenticating with it.
        setAccessToken(null);
        throw error;
      }
    },
    
    retry: false, // if refresh fails, treat the user as logged out
    refetchOnWindowFocus: false,
    staleTime: 15 * 60 * 1000,
  });

  const setUserValue = useCallback(
    (value: SetStateAction<UserType | null>) => {
      queryClient.setQueryData(AUTH_SESSION_KEY, value);
    },
    [queryClient]
  );

  const value = useMemo<[UserType | null, React.Dispatch<React.SetStateAction<UserType | null>>, boolean]>(
    () => [user ?? null, setUserValue, isLoading],
    [user, setUserValue, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};