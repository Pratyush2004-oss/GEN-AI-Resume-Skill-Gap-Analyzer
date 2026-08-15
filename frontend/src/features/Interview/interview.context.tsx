import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useMemo, type SetStateAction } from "react";
import { getAllInterviewReports } from "./services/interview.api";
import { useAuth } from "../auth/hook/useAuth";
import type { REPORTLISTTYPE } from "./types";

export const InterviewContext = createContext<[REPORTLISTTYPE[], React.Dispatch<React.SetStateAction<REPORTLISTTYPE[]>>, boolean] | null>(null);

const INTERVIEW_SESSION_KEYS = ["interview", "session"];

export const InterviewProvider = ({ children }: { children: React.ReactNode }) => {
    const queryClient = useQueryClient();

    // ------------------------------------------------------------------------
    // WHY this query waits for the auth session (workflow fix)
    // ------------------------------------------------------------------------
    // The backend protects GET /interview/reports with the `isAuth` middleware,
    // so the request MUST carry a Bearer access token. That token only exists
    // AFTER the AuthProvider query finishes its three-step bootstrapping:
    //
    //   refreshToken() -> setAccessToken(token) -> checkMe() -> user
    //
    // Because InterviewProvider is mounted INSIDE AuthProvider (see main.tsx),
    // we can read the current user via useAuth(). Passing `enabled: !!user`
    // turns this query into a *dependent query*: it stays disabled (no network
    // request leaves the browser) until `user` is truthy — meaning the refresh
    // has already completed and the token is stored on the shared axios
    // instance. Without this gate, both queries used to fire in parallel and
    // the reports request would race the refresh, often 401-ing because the
    // Authorization header was not set yet.
    const [user] = useAuth();

    // 1. Read the cached report list (if any) so the first render is instant
    //    instead of showing an empty state while the request is in flight.
    const cachedReports = queryClient.getQueryData<REPORTLISTTYPE[]>(INTERVIEW_SESSION_KEYS);

    // The query key is the same constant the mutations invalidate, so a new
    // report or a delete triggers a refetch of this list automatically.
    const { data: interviewReports, isLoading } = useQuery({
        queryKey: INTERVIEW_SESSION_KEYS,
        // initialData keeps the list on screen during refetches triggered by
        // invalidateQueries (generate / delete), avoiding a loading flicker.
        initialData: cachedReports ?? undefined,
        // 2. queryFn fetches the list. The access token is attached
        //    automatically by the shared axios instance (src/services/api.ts),
        //    so a logged-in user's request is authorized without extra work.
        queryFn: () => getAllInterviewReports(),
        // 3. KEY FIX: only fetch once the auth query has resolved. While the
        //    refresh token is still being exchanged, `user` is null, so this
        //    query stays disabled and no request is made. When the auth query
        //    resolves, `user` flips to a truthy value and the fetch runs — by
        //    then the access token is guaranteed to be attached.
        enabled: !!user,
        retry: false, // if the fetch fails, don't hammer the server
        refetchOnWindowFocus: false,
        staleTime: 60 * 60 * 1000
    });

    const setReportList = useCallback((
        value: SetStateAction<REPORTLISTTYPE[]>) => {
        queryClient.setQueryData(INTERVIEW_SESSION_KEYS, value);
    }, [queryClient]);

    const value = useMemo<[REPORTLISTTYPE[], React.Dispatch<React.SetStateAction<REPORTLISTTYPE[]>>, boolean]>(
        () => [interviewReports ?? [], setReportList, isLoading],
        // Note: only `isLoading` is exposed here. The API helper already
        // swallows errors (toasts + returns []), so an empty list is the
        // correct "no data" state — there is no error branch to handle.
        [interviewReports, setReportList, isLoading]);

    return (
        <InterviewContext.Provider value={value}>
            {children}
        </InterviewContext.Provider>
    )
}