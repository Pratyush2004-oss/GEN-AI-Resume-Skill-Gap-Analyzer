import type { REPORTTYPE } from "../types";

// Temporary fixture used to render the interview UI while the real
// report-fetching API is not wired up yet.
export const sampleReport: REPORTTYPE = {
    _id: "interview_001",
    title: "Senior Frontend Engineer",
    jobDescription:
        "Senior Frontend Engineer — Acme Inc.\n\n" +
        "We are looking for a Senior Frontend Engineer to own the user-facing web experience across our product. " +
        "You will work with React, TypeScript and modern build tooling (Vite), build accessible, performant interfaces, " +
        "and mentor more junior engineers on the team.\n\n" +
        "Responsibilities:\n" +
        "• Design, build and ship high-quality React components and features\n" +
        "• Optimize application performance, bundle size and Core Web Vitals\n" +
        "• Collaborate with design, product and backend teams on new features\n" +
        "• Write and maintain unit and integration tests\n" +
        "• Participate in code reviews and technical design discussions\n\n" +
        "Requirements:\n" +
        "• 5+ years of professional frontend experience\n" +
        "• Deep knowledge of React, TypeScript and modern CSS (SCSS/CSS Modules)\n" +
        "• Experience with React Query, state management and REST/GraphQL APIs\n" +
        "• Strong understanding of accessibility (WCAG) and web performance\n" +
        "• Excellent communication and mentoring skills",
    resume: "resume_uploads/senior_frontend_resume.pdf",
    selfDescription:
        "I have been building React applications for about 4 years and currently lead a small frontend team at a startup.",
    matchScore: 78,
    technicalQuestions: [
        {
            question: "Explain how React reconciliation works. Why does the `key` prop matter?",
            intention:
                "They want to confirm you understand how React diffs the virtual DOM and how keys help it reuse DOM nodes instead of recreating them.",
            answer:
                "React keeps a virtual representation of the UI and compares it with the previous render (the diff). It walks the tree, reusing nodes whose type and key match. Keys give elements a stable identity inside a list, so React can match old and new children accurately — avoiding unnecessary re-mounts and losing local state like focus or scroll position. Using the array index as a key can cause bugs when items are reordered or removed.",
        },
        {
            question: "How would you optimize a slow page rendered with React? Walk me through your process.",
            intention:
                "They are checking your performance debugging approach: measure first, then optimize — not the other way around.",
            answer:
                "First I profile with the browser DevTools and React Profiler to find the real bottleneck. Common wins: memoizing expensive components with React.memo or useMemo when props rarely change, avoiding inline callbacks/objects that break memoization, code-splitting heavy routes with React.lazy, virtualizing long lists, and reducing the bundle with better tree-shaking. I always re-measure after each change to confirm the impact.",
        },
        {
            question: "What is the difference between `useMemo` and `useEffect`? When would you reach for each?",
            intention:
                "They want to confirm you understand render-phase vs. effect-phase work and that you avoid deriving state in effects.",
            answer:
                "useMemo runs during rendering to cache an expensive computed value so it is only recalculated when its dependencies change. useEffect runs after the render commits, which makes it the right place for side effects like subscriptions, timers or network calls. A common anti-pattern is deriving state in an effect when it could simply be computed during render — that causes extra renders and flicker.",
        },
        {
            question: "How do you handle authentication state and protected routes in a React SPA?",
            intention:
                "They are validating real-world experience with auth flows, token storage and route guards.",
            answer:
                "I keep a user/context or React Query cache that hydrates from a stored token on boot, and wrap protected routes with a guard component that redirects to /login when there is no user. I prefer httpOnly cookies for storage when possible; otherwise a short-lived access token in memory refreshed via a refresh token. The guard renders a loading state while the initial session check is in flight to avoid a redirect flash.",
        },
        {
            question: "Describe how you would implement debouncing or throttling, and when you would use each.",
            intention:
                "They are testing your understanding of input handling and performance patterns.",
            answer:
                "Debouncing delays invoking a function until a quiet period passes (e.g. 300ms of no typing) — great for search-as-you-type inputs and resize handlers. Throttling guarantees a function runs at most once per interval — good for scroll or drag handlers where you still want periodic updates. I usually implement debounce with a ref holding the timeout, and clean it up on unmount.",
        },
        {
            question: "How would you make an existing React app accessible (WCAG)?",
            intention:
                "They are checking whether accessibility is part of your engineering practice, not an afterthought.",
            answer:
                "I start with an automated audit (axe) and then a manual pass with a screen reader and keyboard-only navigation. I fix semantic structure: real buttons instead of clickable divs, proper labels on inputs, aria-expanded/aria-controls on accordions and menus, visible focus states, and color contrast. I also make sure all interactions work with the keyboard and that toasts/alerts are announced via live regions.",
        },
    ],
    behavioralQuestions: [
        {
            question: "Tell me about a time you disagreed with a teammate about a technical decision. What happened?",
            intention:
                "They want to see how you handle conflict, whether you focus on evidence, and if you can commit to a team decision.",
            answer:
                "Use the STAR format. Set the scene briefly, describe the disagreement (e.g. state management choice), explain how you laid out the trade-offs with data or a prototype, how you listened to the other view, and what you decided together. End with the outcome and what you would do the same way next time.",
        },
        {
            question: "Describe a project that failed or went badly. What did you learn?",
            intention:
                "They want self-awareness and evidence that you can reflect and improve, not perfection.",
            answer:
                "Pick a genuine example with a real cost, but keep it professional. Focus on what went wrong (e.g. scope creep, poor communication), the specific thing you changed afterwards (e.g. introducing clearer acceptance criteria), and a concrete result from that change. Never blame teammates.",
        },
        {
            question: "How do you prioritize your work when everything feels urgent?",
            intention:
                "They are testing judgment, communication with stakeholders, and time management.",
            answer:
                "I clarify impact and urgency for each item, often with the product owner, and I make trade-offs explicit: what gets delayed if we take something new on. I protect focused time for deep work, and I communicate early when a deadline is at risk so the team can adjust scope instead of being surprised.",
        },
        {
            question: "Tell me about a time you mentored a more junior engineer. What was your approach?",
            intention:
                "They want to see leadership and empathy, especially since the role includes mentoring.",
            answer:
                "Describe a concrete example: how you sized up where the person was, how you gave feedback (e.g. review their PRs with explanations rather than edits), and how you set them up to grow. Mention something they went on to own independently and what you learned from mentoring them.",
        },
    ],
    skillGaps: [
        { skill: "System design for frontend", severity: "High" },
        { skill: "Advanced TypeScript (generics, conditional types)", severity: "High" },
        { skill: "Web performance & Core Web Vitals", severity: "Medium" },
        { skill: "Testing (RTL + Playwright)", severity: "Medium" },
        { skill: "Accessibility (WCAG)", severity: "Low" },
        { skill: "GraphQL", severity: "Low" },
    ],
    preparationPlan: [
        {
            day: 1,
            focus: "Deep dive on React internals",
            tasks: [
                "Re-read reconciliation and key semantics, write a short summary in your own words",
                "Practice explaining useMemo vs. useEffect with a live example",
                "Build a tiny debounce hook and test it against the edge cases",
            ],
        },
        {
            day: 2,
            focus: "TypeScript mastery",
            tasks: [
                "Study generics, conditional types and utility types",
                "Solve 5 TypeScript exercises on type-level challenges",
                "Rewrite one existing component with stricter types",
            ],
        },
        {
            day: 3,
            focus: "Performance & accessibility",
            tasks: [
                "Run Lighthouse on your own project and fix the top 3 issues",
                "Practice a performance debugging walkthrough out loud",
                "Run an axe audit and fix one accessibility violation",
            ],
        },
        {
            day: 4,
            focus: "Testing & quality",
            tasks: [
                "Write RTL tests for a form component",
                "Add one Playwright end-to-end flow",
                "Review common testing pitfalls and how to avoid them",
            ],
        },
        {
            day: 5,
            focus: "Full mock interview",
            tasks: [
                "Record yourself answering all technical questions with the STAR/structured approach",
                "Simulate the behavioral round with a friend",
                "Review your skill gaps list and note your strongest talking points",
            ],
        },
    ],
    createdAt: new Date(),
};
