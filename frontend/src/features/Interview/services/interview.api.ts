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


/**
 * @ResumePDFDownload
 * @description the downloaded resume PDF: the raw bytes plus the exact
 *              filename the backend attached via Content-Disposition (when
 *              the header is exposed).
 */
export type ResumePDFDownload = {
    blob: Blob;
    filename?: string;
};

/**
 * Extracts the filename from a Content-Disposition header.
 * Handles both the plain form (`filename="resume-foo.pdf"`) and the
 * RFC 5987 encoded form (`filename*=UTF-8''resume%20foo.pdf`).
 */
function getFilenameFromContentDisposition(header: string | undefined): string | undefined {
    if (!header) return undefined;

    // RFC 5987 encoded form — decode the percent-encoded value first.
    const encoded = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header);
    if (encoded?.[1]) {
        try {
            const decoded = decodeURIComponent(encoded[1].replace(/^"|"$/g, ""));
            if (decoded) return decoded;
        } catch {
            // Malformed percent-encoding — fall through to the plain form.
        }
    }

    // Plain form: filename="resume-foo.pdf" or filename=resume-foo.pdf
    const plain = /filename="?([^";]+)"?/i.exec(header);
    return plain?.[1] || undefined;
}

/**
 * @generateResumePDF
 * @description generate a tailored resume PDF for an interview report
 * @param {interviewReportId}
 * @returns {ResumePDFDownload | null} the PDF blob plus the backend's
 *          filename (or null on failure)
 */
export async function generateResumePDF(id: string): Promise<ResumePDFDownload | null> {
    try {
        // 1. GET /interview/resume/pdf/:id - protected by isAuth. The backend
        //    streams the PDF as a binary attachment, so request a Blob instead
        //    of letting axios try to parse the body as JSON.
        const response = await api.get(`/interview/resume/pdf/${id}`, {
            responseType: "blob"
        });
        if (response.status === 400) throw new Error(response.data.message);
        // 2. The backend returns the raw PDF bytes as a Blob, and names the
        //    file via the Content-Disposition header. Return both so the
        //    caller can save it under the exact name the server sent.
        return {
            blob: response.data,
            filename: getFilenameFromContentDisposition(response.headers["content-disposition"])
        };
    } catch (error: any) {
        // With responseType: "blob", error bodies are Blobs too, so read the
        // JSON message out of the blob before toasting it.
        if (error instanceof AxiosError && error.response?.data instanceof Blob) {
            let message = "Failed to generate resume PDF";
            try {
                const parsed = JSON.parse(await error.response.data.text());
                if (parsed?.message) message = parsed.message;
            } catch {
                // Error body wasn't JSON (e.g. a proxy error page) — fall back
                // to the generic message above.
            }
            toast.error(message);
        } else if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
        } else {
            toast.error(error.message);
        }
        return null;
    }

}