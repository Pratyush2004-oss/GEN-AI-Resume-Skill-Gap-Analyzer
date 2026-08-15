import { AxiosError } from "axios";
import { toast } from "react-toastify";
import type { GenerateInterviewReportType, InterviewReportInputType, REPORTLISTTYPE, REPORTTYPE } from "../types";
import api from "../../../services/api";

// The interview feature does NOT create its own axios instance anymore.
// All features share the instance in src/services/api.ts, where the access
// token is stored in defaults.headers.common after login / refresh-token.
// That single line (`setAccessToken`) is why every request below is already
// authenticated - no manual Authorization header is needed here.

/**
 * @generateInterviewReport
 * @description generate a new interview report
 * @param {jobDescription, resume, selfDescription} 
 * @returns {{interviewReport, message} | null}
 */
export async function generateInterviewReport({
    jobDescription, resume, selfDescription
}: InterviewReportInputType): Promise<GenerateInterviewReportType | null> {
    try {
        if (!resume) throw new Error("Please upload resume");

        // 1. Build a multipart/form-data body so the resume file can be uploaded.
        const formData = new FormData();
        formData.append("jobDescription", jobDescription);
        formData.append("resume", resume);
        formData.append("selfDescription", selfDescription);

        // 2. POST to the /generate route (the old path "/" moved to "/generate"
        //    in the backend, so posting to "/" would 404). The Authorization
        //    header comes from the shared axios instance automatically.
        const response = await api.post("/interview/generate", formData, {
            headers: {
                // Let the browser set the boundary for the multipart body.
                "Content-Type": "multipart/form-data"
            }
        });
        // if the response status is 400 then throw an error
        if (response.status === 400) throw new Error(response.data.message);
        // 3. The backend responds with { message, interviewReport }.
        return response.data;
    } catch (error: any) {
        if (error instanceof AxiosError) toast.error(error.response?.data.message);
        else toast.error(error.message);
        return null
    }

}

/**
 * @getAllInterrviewReports
 * @description get all interview reports
 * @returns {interviewReports[]}
 */
export async function getAllInterviewReports(): Promise<REPORTLISTTYPE[]> {
    try {
        // 1. GET /interview/reports - protected by isAuth on the backend, so
        //    this would 401 without the token attached by the shared instance.
        const response = await api.get("/interview/reports");
        if (response.status === 400) throw new Error(response.data.message);
        // 2. The backend returns { interviewReports: [...] }. Unwrap the array so
        //    the caller gets a real list instead of the wrapper object.
        return response.data.interviewReports;
    } catch (error: any) {
        if (error instanceof AxiosError) toast.error(error.response?.data.message);
        else toast.error(error.message);
        return [];
    }
}

/**
 * @getSingleInterviewReport
 * @description get a single interview report
 * @param id
 * @returns {interviewReport | null}
 */
export async function getSingleInterviewReport(id: string): Promise<REPORTTYPE | null> {
    try {
        // 1. GET /interview/report/:id - protected by isAuth.
        const response = await api.get(`/interview/report/${id}`);
        if (response.status === 400) throw new Error(response.data.message);
        // 2. The backend returns { interviewReport: {...} }. Unwrap it.
        return response.data.interviewReport;
    } catch (error: any) {
        if (error instanceof AxiosError) toast.error(error.response?.data.message);
        else toast.error(error.message);
        return null;
    }
}

/**
 * @deleteInterviewReport
 * @description delete a single interview report
 * @param id
 * @returns {message | null}
 */
export async function deleteInterviewReport(id: string): Promise<string | null> {
    try {
        // 1. DELETE /interview/report/:id - protected by isAuth.
        const response = await api.delete(`/interview/report/${id}`);
        if (response.status === 400) throw new Error(response.data.message);
        // 2. The backend returns { message: "..." } - return just the string.
        return response.data.message;
    } catch (error: any) {
        if (error instanceof AxiosError) toast.error(error.response?.data.message);
        else toast.error(error.message);
        return null;
    }
}