import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import puppeteer from "puppeteer";

// ===========================================================================
// Gemini AI client
// ===========================================================================

// Lazily-created, shared client instance. GoogleGenAI is stateless for this
// usage (auth + request configuration), so a single instance is created once
// and reused for every request instead of constructing a new one each time.
let aiClient;

function getAiClient() {
    if (!aiClient) {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set. Add it to your backend .env file.");
        }

        aiClient = new GoogleGenAI({ apiKey });
    }

    return aiClient;
}

// ===========================================================================
// Output schemas
// ===========================================================================
// Each output shape below exists in two forms that can never drift apart:
//   1. A plain JSON Schema object sent to the Gemini API inside
//      `response_format.schema` to enforce structured output.
//   2. A Zod validator (z.fromJSONSchema(...)) used to validate the model's
//      actual output before it is returned or persisted.

// Hand-written JSON schema for the interview report output.
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

// Hand-written JSON schema for the resume HTML output.
const resumePdfJSONSchema = {
    type: "object",
    properties: {
        html: {
            type: "string",
            description: "The HTML content of the resume which can be converted to PDF using any library like Puppeteer",
        }
    },
    required: ["html"]
};

// Zod validators derived from the JSON schemas above — used to validate the
// AI's output before it is returned or persisted.
const interviewReportSchema = z.fromJSONSchema(interviewReportJsonSchema);
const resumePdfSchema = z.fromJSONSchema(resumePdfJSONSchema);

// ===========================================================================
// Retry / fallback configuration
// ===========================================================================

// Ordered fallback list: newest stable model first, older stable models as backup.
const GEMINI_MODELS = ["gemini-3-flash-preview"];

// Number of retries per model on transient/schema failures.
const MAX_RETRIES = 2;

// Delay between retries to respect rate limits and let overloaded servers recover.
const RETRY_DELAY_MS = 1500;

// 429 (rate limit) and 503 (overloaded) are transient and worth retrying.
function isTransientError(error) {
    return error?.status === 429 || error?.status === 503;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ===========================================================================
// Core Gemini call: schema-enforced output with retries + model fallback
// ===========================================================================

/**
 * Calls Gemini with schema-enforced JSON output, handling retries and model
 * fallback. Shared by both the interview report and resume flows so the
 * retry/validation logic lives in exactly one place.
 *
 * @param {object} options
 * @param {string} options.prompt                  The full prompt sent to the model.
 * @param {object} options.apiSchema               Plain JSON Schema object passed to the API
 *                                                 (response_format.schema) to enforce structure.
 * @param {import("zod").ZodType} options.validator Zod validator used to validate the output.
 * @param {string} options.schemaMismatchMessage   Error message when the output fails validation.
 * @returns {Promise<unknown>} Schema-validated data.
 */
async function generateStructuredContent({ prompt, apiSchema, validator, schemaMismatchMessage }) {
    const ai = getAiClient();

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
                        schema: apiSchema,
                    }
                });

                // Only accept output that matches the schema exactly.
                const validated = validator.safeParse(JSON.parse(interaction.output_text));
                if (validated.success) {
                    return validated.data;
                }

                // Output failed schema validation — retry; the model may do better next time.
                lastError = new Error(schemaMismatchMessage);
                console.warn(`Gemini ${model} returned invalid content (attempt ${attempt + 1}/${MAX_RETRIES + 1}): ${JSON.stringify(validated.error.issues).slice(0, 400)}`);
                await sleep(RETRY_DELAY_MS);
            } catch (error) {
                lastError = error;
                if (error instanceof SyntaxError) {
                    // Response was not valid JSON — retry.
                    console.warn(`Gemini ${model} returned non-JSON content (attempt ${attempt + 1}); retrying...`);
                } else if (!isTransientError(error)) {
                    // Permanent failure on this model (e.g. model not found) — try the next one.
                    break;
                } else {
                    // Transient failure (429/503) — retry the same model.
                    console.warn(`Gemini ${model} attempt ${attempt + 1}/${MAX_RETRIES + 1} failed with status ${error.status}; retrying...`);
                }
                await sleep(RETRY_DELAY_MS);
            }
        }
    }

    // Every model and attempt exhausted — surface the last error to the caller.
    throw lastError;
}

// ===========================================================================
// Interview report
// ===========================================================================

/**
 * Generates a structured interview report (technical/behavioral questions,
 * skill gaps, preparation plan) tailored to the job description.
 *
 * @param {string} resume          Plain text extracted from the resume PDF.
 * @param {string} selfDescription Candidate's own description.
 * @param {string} jobDescription  The job description to tailor the report to.
 * @returns {Promise<object>} Schema-validated interview report data.
 */
async function generateInterviewReport(resume, selfDescription, jobDescription) {
    const prompt = `Generate an interview report for a candidate with the following details:
        Resume: ${resume}
        Self Description: ${selfDescription}
        Job Description: ${jobDescription}

        Return ONLY a valid JSON object that strictly matches the provided response schema.
        Do not add extra fields, status messages, markdown, or commentary.
    `;

    return generateStructuredContent({
        prompt,
        apiSchema: interviewReportJsonSchema,
        validator: interviewReportSchema,
        schemaMismatchMessage: "AI response does not match the expected interview report schema",
    });
}

// ===========================================================================
// PDF generation (Puppeteer)
// ===========================================================================

// Shared Puppeteer browser reused across PDF requests. Launching a browser is
// expensive, so we launch once and reuse it instead of starting/stopping
// Chrome for every conversion.
let sharedBrowser = null;

async function getBrowser() {
    const browserIsUsable =
        sharedBrowser &&
        (
            (typeof sharedBrowser.isConnected === "function" && sharedBrowser.isConnected()) ||
            (typeof sharedBrowser.isConnected !== "function" && sharedBrowser.connected !== false)
        );

    // If the browser crashed or was closed, launch a fresh one.
    if (!browserIsUsable) {
        sharedBrowser = await puppeteer.launch({ headless: true });
    }
    return sharedBrowser;
}

/**
 * Closes the shared Puppeteer browser. Call this on server shutdown so Chrome
 * is not left running as an orphaned process.
 */
async function closeBrowser() {
    if (sharedBrowser) {
        try {
            const isConnected =
                typeof sharedBrowser.isConnected === "function"
                    ? sharedBrowser.isConnected()
                    : sharedBrowser.connected !== false;

            if (isConnected) {
                await sharedBrowser.close();
            }
        } catch (error) {
            console.warn("Browser close skipped:", error.message);
        } finally {
            sharedBrowser = null;
        }
    }
}

/**
 * Converts HTML content into a PDF buffer using Puppeteer.
 *
 * @param {string} htmlContent Self-contained HTML (styles inlined, no external resources).
 * @returns {Promise<Buffer>} PDF file buffer.
 * @throws When the browser or PDF rendering fails.
 */
async function generatePDFFormatHTML(htmlContent) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
        // "load" is enough — the resume HTML is self-contained (no external
        // network resources), so it is faster and more reliable than
        // networkidle0, which can hang waiting for stray requests.
        await page.setContent(htmlContent, { waitUntil: "load" });

        // Render using print media rules so any @media print styles apply.
        await page.emulateMediaType("print");

        return await page.pdf({
            format: "A4",
            // Without this, Chrome omits all background colors and gradients from
            // the PDF — the accent sidebar, section headers, and skill badges
            // from the AI-generated design would silently disappear.
            printBackground: true,
            margin: {
                top: "10",
                bottom: "10mm",
                left: "10mm",
                right: "10mm",
            },
        });
    } finally {
        // Always release the tab, even if rendering failed, so we don't leak
        // pages. The shared browser itself stays alive for the next request.
        await page.close();
    }
}

// ===========================================================================
// Resume generation (AI content -> HTML -> PDF)
// ===========================================================================

/**
 * Generates a tailored, ATS-friendly resume as a PDF.
 *
 * Flow: Gemini produces self-contained HTML for a resume tailored to the job
 * description -> the HTML is validated -> Puppeteer renders it to a PDF.
 *
 * @param {object} params
 * @param {string} params.resume          Plain text extracted from the resume PDF.
 * @param {string} params.selfDescription Candidate's own description.
 * @param {string} params.jobDescription  The job description to tailor the resume to.
 * @returns {Promise<Buffer>} The resume PDF buffer.
 */
async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate a resume for a candidate with the following details:
        Resume: ${resume}
        Self Description: ${selfDescription}
        Job Description: ${jobDescription}

        Return a JSON object with a single "html" field containing the resume as
        self-contained HTML that can be converted to PDF with a headless browser.

        === DESIGN REQUIREMENTS (production-grade, magazine-quality design) ===

        Overall style:
        - Modern, premium, SINGLE-COLUMN layout ONLY: no sidebars, no two-column
          sections. All content flows top-to-bottom in one column across the full
          page width. The resume must look art-directed and professionally
          designed — clean, balanced, and instantly scannable.

        Color palette (choose ONE combination and apply it consistently):
        - One deep, saturated accent hue: deep navy #1F3A5F, emerald #0F766E,
          burgundy #7F1D1D, or slate blue #334155.
        - A soft light tint of the accent for banded backgrounds (e.g. #F8FAFC,
          #F1F5F9, or a very light mix of the accent at ~5% opacity).
        - Dark, high-contrast body text (#0F172A or #1E293B) — never pure black,
          never gray-on-gray.
        - Use the accent color deliberately and sparingly: the header band,
          section header text/underlines, company/role names, and skill-chip
          accents. All body content stays high-contrast neutral.
        - Every pairing must pass strong contrast: dark text on light backgrounds,
          white text on the accent band. No clashing or washed-out combinations.

        Layout and formatting (precise, compact — no wasted vertical space):
        - Header band: a full-width band in the accent color (solid or a subtle
          two-tone gradient) with the candidate's name in white (22-26pt bold),
          a one-line job title in a light tint of the band, and a contact line
          (email, phone, location, LinkedIn/GitHub) in white 9-10pt using real
          <a href> links. Band padding ~22-28px top/bottom so it looks generous
          but never empty.
        - Section headers: bold small-caps or uppercase in the accent color
          (11-12pt) with a thin accent underline/left bar and tight margins
          (top ~12-16px, bottom ~6-8px). Never center them; left-align for
          professional ATS-friendly structure.
        - KEEP SPACING TIGHT AND CONTROLLED: line-height 1.35-1.45, section gap
          ~12-16px, paragraph and list-item margins 2-4px. Content must feel
          dense but organized — no large empty gaps, no stretched layouts.
        - Separate sections with thin accent divider lines or subtle spacing
          rather than big blocks of whitespace.
        - Skills: grouped inline chips (Languages, Frameworks, Tools) with a
          light tinted accent background, ~4-8px padding, rounded corners,
          and 8.5-9.5pt text.
        - Experience entries: role bold with company in the accent color on one
          line, dates right-aligned on the same line (flex with space-between,
          natural text order), followed by 3-5 achievement bullets with tight
          2-3px margins and small clean markers ("•" or "-").
        - Education/certifications: compact 1-2 line entries with dates right-aligned.
        - Fonts: system/web-safe ONLY (no external fonts — rendered offline).
          Headings in "Georgia" or "Cambria", body in "Arial", "Helvetica", or
          "Calibri". Body 9.5-10.5pt; keep the whole resume to 1-2 A4 pages.
        - Add CSS page-break-inside: avoid to every section so no section splits
          across pages.

        CSS decorations allowed (self-contained only):
        - Subtle gradients, rounded corners on chips, thin accent borders and
          underlines — all via inline CSS. No images, icon fonts, emoji, or CSS
          pseudo-elements for any important content.

        ATS-friendliness (keep it parseable):
        - Keep every piece of content as real text in semantic HTML (h1/h2/h3,
          ul/li, p). Never place important text in images, icon fonts, or CSS
          pseudo-elements.
        - Avoid tables for job titles/dates; simple flex or grid layouts are fine
          as long as the text order reads logically.
        - Use standard section names (Professional Summary, Skills, Experience,
          Education) and standard skill names.

        Content requirements:
        - Tailor the resume to the job description and highlight the candidate's
          strengths and relevant experience.
        - The writing should read like a real human-written resume, not AI-generated.
        - Lead with the most relevant, outcome-driven achievements; quantify
          where possible (e.g. "reduced page load time by 40%").
        - 1-2 pages when rendered to PDF; prioritize quality over quantity.

        Return ONLY a valid JSON object that strictly matches the provided response schema.
        Do not add extra fields, status messages, markdown, or commentary.
    `;

    // 1. Ask Gemini for the resume HTML, validated against the schema.
    const { html } = await generateStructuredContent({
        prompt,
        apiSchema: resumePdfJSONSchema,
        validator: resumePdfSchema,
        schemaMismatchMessage: "AI response does not match the expected resume schema",
    });

    if (!html || !html.trim()) {
        throw new Error("AI returned empty resume HTML");
    }

    // 2. Render the HTML to a PDF. Any rendering error propagates to the
    //    caller instead of being silently swallowed as a "successful" result.
    const result = {
        html,
        pdfBuffer: await generatePDFFormatHTML(html),
    }
    return result;
}

export { generateInterviewReport, generatePDFFormatHTML, interviewReportSchema, generateResumePdf, closeBrowser };
