import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteInterviewReport, generateInterviewReport, getSingleInterviewReport } from "../services/interview.api";
import type { GenerateInterviewReportType, InterviewReportInputType, REPORTTYPE } from "../types";

// This query key MUST be identical to the one used by the report list query
// in interview.context.tsx. invalidateQueries only refetches queries whose
// key matches, so if these ever drift apart the list won't refresh.
const InterViewSessionKey = ["interview", "session"] as const;

// The single-report key includes the report id so different reports stay
// separated in the cache. The generate mutation writes the WHOLE report
// under this key (see onSuccess below) and the report page reads it back as
// initialData — so generating a report never causes a second network fetch.
const SingleInterViewReportKey = (reportId: string) => ["interview", "report", reportId] as const;

// A tanstack-query mutation is just a state machine:
//  - mutate(variables) -> runs mutationFn(variables)
//  - onSuccess / onError / onSettled fire depending on the outcome
//  - isLoading / isSuccess / isError expose the state to the UI
//
// IMPORTANT: these factory functions use React hooks (useQueryClient,
// useMutation) internally, so they MUST be named with the `use` prefix and be
// called from a component / custom hook. A bare name like
// `generateInterviewReportMutation` breaks the rules of hooks.
export const useGenerateInterviewReportMutation = () => {
    // 1. Grab the QueryClient so we can invalidate the list cache afterwards.
    const queryClient = useQueryClient();

    // Generics: <TData, TError, TVariables> = <return type, error type, mutate() args>
    return useMutation<GenerateInterviewReportType, Error, InterviewReportInputType>({
        // 2. mutationFn receives exactly the variables passed to mutate().
        mutationFn: async ({ jobDescription, resume, selfDescription }: InterviewReportInputType) => {
            // 3. Call the API helper. No manual token handling is needed here:
            //    the shared axios instance (src/services/api.ts) attaches the
            //    Authorization header set during login/refresh automatically.
            const response = await generateInterviewReport({ jobDescription, resume, selfDescription });

            // 4. The helper returns null on failure (it already toasts the error),
            //    so throw to mark the mutation as failed (isError: true). If we
            //    returned null instead, tanstack would treat it as a success.
            if (!response) {
                throw new Error("Failed to generate report");
            }
            return response;
        },
        // 5. onSuccess runs only when mutationFn resolves successfully.
        onSuccess: (data: GenerateInterviewReportType) => {
            toast.success(data.message);

            // Cache the WHOLE generated report under its single-report query
            // key. The report page reads this cache as initialData, so when
            // we navigate straight to /interview/:id it renders from memory
            // instead of fetching the same response a second time.
            queryClient.setQueryData(SingleInterViewReportKey(data.interviewReport._id), data.interviewReport);
        },
        // 6. onSettled runs on success AND failure - always refresh the list so
        //    it reflects the latest reports either way.
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: InterViewSessionKey });
        }
    })
}

export const useDeleteInterviewReportMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<string, Error, string>({
        // mutationFn receives the id passed to mutate(id).
        mutationFn: async (id: string) => {
            // Same pattern as above: the API helper returns null on failure
            // (and toasts the error), so throw to surface isError correctly.
            const response = await deleteInterviewReport(id);
            if (!response) {
                throw new Error("Failed to delete report");
            }
            return response;
        },
        onSuccess: (data: string) => {
            // data is the message string returned by the backend.
            toast.success(data);
        },
        onSettled: () => {
            // Refetch the list so the deleted report disappears from the UI.
            queryClient.invalidateQueries({ queryKey: InterViewSessionKey });
        }
    })
}

/**
 * @useGetSingleInterviewReportQuery
 * @description read a single interview report, preferring the cached copy
 *
 * Two flows feed this hook:
 *
 *  1. Just generated — the generate mutation already stashed the WHOLE
 *     report in the cache (see onSuccess above). That cached report is
 *     passed in as initialData, so the page renders instantly and NO
 *     network request fires for the just-generated report.
 *
 *  2. Opened from the dashboard — nothing is cached for that id, so
 *     initialData is undefined and the query fetches the details from
 *     GET /interview/report/:id, then the page renders them.
 */
export const useGetSingleInterviewReportQuery = (reportId: string) => {
    const queryClient = useQueryClient();

    // Read the report the generate mutation cached, if any. The id in the
    // query key both separates reports in the cache and tells the fallback
    // fetch below which report to request.
    const cachedReport = queryClient.getQueryData<REPORTTYPE>(SingleInterViewReportKey(reportId));

    return useQuery<REPORTTYPE | null, Error>({
        queryKey: SingleInterViewReportKey(reportId),
        queryFn: () => getSingleInterviewReport(reportId),
        // If the report was just generated it is already in the cache, so
        // initialData serves it on the very first render. The long staleTime
        // keeps that copy "fresh", so no background refetch fires either.
        initialData: cachedReport,
        // Don't fire until the route actually gives us an id.
        enabled: !!reportId,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 60 * 60 * 1000
    });
}