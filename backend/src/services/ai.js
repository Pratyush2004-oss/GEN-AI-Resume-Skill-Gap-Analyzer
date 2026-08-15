import { GoogleGenAI } from "@google/genai";
import { z } from 'zod';
function getAiClient() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set. Add it to your backend .env file.");
    }

    return new GoogleGenAI({ apiKey });
}

// Hand-written JSON schema sent to the Gemini API (per the official structured-output
// docs pattern). The Zod validator below is derived from it with z.fromJSONSchema, so
// the API schema and the validation schema can never drift apart.
const interviewReportJsonSchema = {
    type: "object",
    properties: {
        title: {
            type: "string",
            description: "The title of the job for which the interview report is generated",
        },
        matchScore: {
            type: "number",
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description",
        },
        technicalQuestions: {
            type: "array",
            description: "Technical questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The technical question can be asked in the interview" },
                    intention: { type: "string", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "string", description: "How to answer this question, what points to cover, what approach to take etc." },
                },
                required: ["question", "intention", "answer"],
            },
        },
        behavioralQuestions: {
            type: "array",
            description: "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The behavioral question can be asked in the interview" },
                    intention: { type: "string", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "string", description: "How to answer this question, what points to cover, what approach to take etc." },
                },
                required: ["question", "intention", "answer"],
            },
        },
        skillGaps: {
            type: "array",
            description: "List of skill gaps in the candidate's profile along with their severity",
            items: {
                type: "object",
                properties: {
                    skill: { type: "string", description: "The skill which the candidate is lacking" },
                    severity: {
                        type: "string",
                        enum: ["low", "medium", "high"],
                        description: "The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances",
                    },
                },
                required: ["skill", "severity"],
            },
        },
        preparationPlan: {
            type: "array",
            description: "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
            items: {
                type: "object",
                properties: {
                    day: { type: "integer", description: "The day number in the preparation plan, starting from 1" },
                    focus: { type: "string", description: "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc." },
                    tasks: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.",
                    },
                },
                required: ["day", "focus", "tasks"],
            },
        },
    },
    required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"],
};

// Zod validator derived from the JSON schema — used to validate the AI's output.
const interviewReportSchema = z.fromJSONSchema(interviewReportJsonSchema);

// Ordered fallback list: newest stable model first, older stable models as backup.
const GEMINI_MODELS = ["gemini-3-flash-preview"];
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

// 429 (rate limit) and 503 (overloaded) are transient and worth retrying.
function isTransientError(error) {
    return error?.status === 429 || error?.status === 503;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateInterviewReport(resume, selfDescription, jobDescription) {
    const ai = getAiClient();

    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        Return ONLY a valid JSON object that strictly matches the provided response schema.
                        Do not add extra fields, status messages, markdown, or commentary.
`
    const schemaMismatchError = new Error("AI response does not match the expected interview report schema");

    let lastError;
    for (const model of GEMINI_MODELS) {
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                // Gemini 3 models require the Interactions API for schema-enforced output.
                // The old generateContent + responseSchema config is deprecated and lets
                // the model return whatever JSON shape it wants.
                const interaction = await ai.interactions.create({
                    model,
                    input: prompt,
                    response_format: {
                        type: "text",
                        mime_type: "application/json",
                        schema: interviewReportJsonSchema,
                    }
                });

                // Only accept output that matches the schema exactly.
                const validated = interviewReportSchema.safeParse(JSON.parse(interaction.output_text));
                if (validated.success) {
                    return validated.data;
                }

                lastError = schemaMismatchError;
                console.warn(`Gemini ${model} returned an invalid report (attempt ${attempt + 1}): ${JSON.stringify(validated.error.issues).slice(0, 400)}`);
                await sleep(RETRY_DELAY_MS);
            } catch (error) {
                lastError = error;
                if (error instanceof SyntaxError) {
                    // Response was not valid JSON — retry.
                    console.warn(`Gemini ${model} returned non-JSON content (attempt ${attempt + 1}); retrying...`);
                } else if (!isTransientError(error)) {
                    // Permanent failure on this model (e.g. not found) — try the next one.
                    break;
                } else {
                    console.warn(`Gemini ${model} attempt ${attempt + 1}/${MAX_RETRIES + 1} failed with status ${error.status}; retrying...`);
                }
                await sleep(RETRY_DELAY_MS);
            }
        }
    }

    throw lastError;
}

async function generatePDFFormatHTML(htmlContent) {

}
export { generateInterviewReport, generatePDFFormatHTML, interviewReportSchema };