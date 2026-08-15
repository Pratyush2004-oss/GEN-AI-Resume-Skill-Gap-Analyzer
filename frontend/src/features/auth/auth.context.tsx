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

  const { data: user, isLoading, isError } = useQuery({
    queryKey: AUTH_SESSION_KEY,
    initialData: cachedUser ?? undefined,
    queryFn: async () => {
      // Step 1: use the refresh cookie to get a fresh access token.
      const refreshed = await refreshToken();

      // Step 2: store the access token on the shared axios instance so
      // protected requests (auth, interview, ...) can use it.
      setAccessToken(refreshed.accessToken);

      // Step 3: now that axios has the access token, fetch the logged-in user.
      const currentUser = await checkMe();

      return currentUser.user;
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
    () => [user ?? null, setUserValue, isLoading || isError],
    [user, setUserValue, isLoading, isError]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};