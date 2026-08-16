import expressAsyncHandler from "express-async-handler";
import { PDFParse } from "pdf-parse";
import { generateInterviewReport, generatePDFFormatHTML, generateResumePdf, interviewReportSchema } from "../services/ai.js";
import InterviewReportModel from "../models/interviewReport.model.js";


/**
 * @generateInterviewReport POST /api/interview
 * @description generate new interview report on the basis of user self description, resume pdf and job description
 * @access private
 */
export const generateInterviewReportController = expressAsyncHandler(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const resumeFile = req.file;
        const resumeContent = await new PDFParse(Uint8Array.from(resumeFile.buffer)).getText();
        const { selfDescription, jobDescription } = req.body;

        const interviewReportByAI = await generateInterviewReport(resumeContent, selfDescription, jobDescription);

        // Never persist a response that does not match the expected report schema.
        const validatedReport = interviewReportSchema.safeParse(interviewReportByAI);
        if (!validatedReport.success) {
            console.warn("AI response does not match interview report schema:", JSON.stringify(validatedReport.error.issues).slice(0, 400));
            return res.status(502).json({ message: "AI returned an invalid interview report. Please try again." });
        }

        const interviewReport = await InterviewReportModel.create({
            user: userId,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...validatedReport.data
        });

        res.status(201).json({ message: "Interview report generated successfully", interviewReport });
    } catch (error) {
        console.log("Error in generateInterviewReport controller: ", error);
        next(error);
    }
})

/**
 * @getAllInterviewReports GET /api/interview
 * @description get all interview reports of a user
 * @access private
 */
export const getAllInterviewReportsController = expressAsyncHandler(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const interviewReports = await InterviewReportModel.find({ user: userId }).sort({ createdAt: -1 }).select("title createdAt");
        res.status(200).json({ interviewReports });
    } catch (error) {
        console.log("Error in getAllInterviewReportsController: ", error);
        next(error);
    }
})

/**
 * @getSingleInterviewReport GET /api/interview/:id
 * @description get a single interview report of a user
 * @access private
 */
export const getSingleInterviewReportController = expressAsyncHandler(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const interviewReportId = req.params.id;
        const interviewReport = await InterviewReportModel.findOne({ user: userId, _id: interviewReportId });
        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found" });
        }
        res.status(200).json({ interviewReport });
    } catch (error) {
        console.log("Error in getSingleInterviewReportController: ", error);
        next(error);
    }
})

/**
 * @deleteInterviewReport DELETE /api/interview/:id
 * @description delete interview report of the user
 * @access private
 */
export const deleteInterviewReport = expressAsyncHandler(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const interviewReportId = req.params.id;
        const interviewReport = await InterviewReportModel.findOneAndDelete({ user: userId, _id: interviewReportId });
        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found" });
        }
        res.status(200).json({ message: "Interview report deleted successfully" });
    } catch (error) {
        console.log("Error in delete Interview Controller");
        next(error);
    }
})

/**
 * @generateResumePDFController POST /api/interview/resume
 * @description Generate tailored resume according to the job description
 * @access private
 * @param interviewId
 * @return {pdf}
 */
export const generateResumePDFController = expressAsyncHandler(async (req, res, next) => {
    try {
        const userId = req.user._id;
        const interviewId = req.params.id;
        const interviewReport = await InterviewReportModel.findOne({ user: userId, _id: interviewId }).select("resume selfDescription jobDescription title");
        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found" });
        }
        let pdfBuffer = null;
        if (interviewReport.resumeContentHTML) {
            pdfBuffer = await generatePDFFormatHTML(interviewReport.resumeContentHTML);
        }
        else {
            const result = await generateResumePdf({ resume: interviewReport.resume, selfDescription: interviewReport.selfDescription, jobDescription: interviewReport.jobDescription });
            // save the resume in the database also
            await InterviewReportModel.findOneAndUpdate({ user: userId, _id: interviewId }, { resumeContentHTML: result.html });
            pdfBuffer = result.pdfBuffer;
        }
        if (!pdfBuffer) return res.status(502).json({ message: "AI returned an invalid resume. Please try again." });
        res.status(200).set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume-${interviewReport.title}-${interviewReport._id}-${Date.now()}.pdf`
        }).send(pdfBuffer);
    } catch (error) {
        console.log("Error in generateResumePDFController: " + error);
        next(error);
    }
})

