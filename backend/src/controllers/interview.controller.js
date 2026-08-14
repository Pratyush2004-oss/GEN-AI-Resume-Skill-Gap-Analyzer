import expressAsyncHandler from "express-async-handler";
import { PDFParse } from "pdf-parse";
import { generateInterviewReport } from "../services/ai.js";
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

        const interviewReport = await InterviewReportModel.create({
            user: userId,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interviewReportByAI
        });

        res.status(201).json({ message: "Interview report generated successfully", interviewReport });
    } catch (error) {
        console.log("Error in generateInterviewReport controller: ", error);
        next(error);
    }
})

