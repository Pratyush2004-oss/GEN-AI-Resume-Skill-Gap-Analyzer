import { GoogleGenAI } from "@google/genai";
import { z } from 'zod';
import { zodToJsonSchema } from "zod-to-json-schema"
function getAiClient() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set. Add it to your backend .env file.");
    }

    return new GoogleGenAI({ apiKey });
}

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 to 100 indicating how well the candidate's profile matches the job description."),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The question can be asked in the interview"),
        intension: z.string().describe("The intension of interviewer behind asking the question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take, etc. "),
    })).describe("Technical question can be asked in the interview along with their intensions and answers"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The question can be asked in the interview"),
        intension: z.string().describe("The intension of interviewer behind asking the question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take, etc. "),
    })).describe("Behavioral question can be asked in the interview along with their intensions and answers"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill gap can be asked in the interview"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap can be asked in the interview"),
    })).describe("Skill gap can be asked in the interview along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day can be asked in the interview"),
        focus: z.string().describe("The focus of the day can be asked in the interview"),
        tasks: z.array(z.string()).describe("The tasks can be asked in the interview"),
    })).describe("Preparation plan can be asked in the interview along with their day, focus and tasks"),
})

async function generateInterviewReport(resume, selfDescription, jobDescription) {
    const ai = getAiClient();


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
    `
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "",
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text);
}

async function generatePDFFormatHTML(htmlContent) {

}
export { generateInterviewReport, generatePDFFormatHTML };