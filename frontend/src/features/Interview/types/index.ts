export type Question = {
    question: string;
    intention: string;
    answer: string;
};

export type SkillGap = {
    skill: string;
    severity: string;
};

export type PreparationDay = {
    day: number;
    focus: string;
    tasks: Array<string>;
};

/** Sections shown in the left sidebar of the interview page. */
export type InterviewSection = "technical" | "behavioral" | "preparation" | "job";

export type REPORTTYPE = {
    _id: string,
    jobDescription: string,
    resume: string,
    selfDescription: string,
    matchScore: number,
    technicalQuestions: Array<Question>,
    behavioralQuestions: Array<Question>,
    skillGaps: Array<SkillGap>,
    preparationPlan: Array<PreparationDay>,
    createdAt: Date
}
