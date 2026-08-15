import "dotenv/config";
import { generateInterviewReport, interviewReportSchema } from "../src/services/ai.js";

const resume = `
Full Stack Engineer (final-year B.Tech CSE, graduating July 2026)
- 4 internships: Aviraj Infotech (Full Stack Developer & Trainer), Explore India View, Edunet Foundation (AICTE)
- React.js, Next.js, Node.js, Express.js, MongoDB, PostgreSQL, MySQL, React Native, TypeScript
- 5 independent full-stack projects: AI apps (Gemini API), real-time systems (Socket.IO, Stream IO), role-based JWT auth platforms
- Trained 20+ developers; REST API design; 1st place in a state-level AI hackathon
`;

const selfDescription = `I'm a Full Stack Software Engineer and final-year Computer Science student (B.Tech, graduating July 2026) with hands-on experience building production-grade MERN stack applications across four internships. Most recently, I worked as a Full Stack Developer and Trainer at Aviraj Infotech, where I delivered developer training to 20+ trainees and contributed to internal full-stack projects using React.js, Node.js, Express.js, and MongoDB. My prior internships at Explore India View and Edunet Foundation (AICTE) gave me solid experience with REST API design, MongoDB, and cross-platform mobile development with React Native. Beyond internships, I've built five independent full-stack projects spanning AI-powered applications (using the Gemini API), real-time systems (Socket.IO, Stream IO), and secure, role-based platforms with JWT authentication — all available on my GitHub. I'm comfortable across the JavaScript/TypeScript ecosystem, from React and Next.js on the frontend to Node.js and Express on the backend.`;

const jobDescription = `
Full Stack Developer — MERN stack startup.
We are looking for a Full Stack Developer with strong React.js/Next.js frontend skills and Node.js/Express backend experience, comfortable with MongoDB, REST API design, and integrating AI/LLM APIs. Responsibilities: build and ship user-facing features end-to-end, design REST APIs, integrate the Gemini API into products, and work in a fast-paced team. Nice to have: React Native, real-time systems (Socket.IO), TypeScript.
`;

try {
    const report = await generateInterviewReport(resume, selfDescription, jobDescription);

    const validated = interviewReportSchema.safeParse(report);
    console.log("\n=== SCHEMA VALIDATION ===");
    console.log(validated.success
        ? "PASS — output matches the schema"
        : "FAIL — " + JSON.stringify(validated.error.issues, null, 2));

    console.log("\n=== REPORT SUMMARY ===");
    console.log("title:", report.title);
    console.log("matchScore:", report.matchScore);
    console.log("technicalQuestions:", report.technicalQuestions?.length);
    console.log("behavioralQuestions:", report.behavioralQuestions?.length);
    console.log("skillGaps:", report.skillGaps?.length);
    console.log("preparationPlan:", report.preparationPlan?.length);
} catch (error) {
    console.error("generateInterviewReport FAILED:", error);
    process.exit(1);
}
