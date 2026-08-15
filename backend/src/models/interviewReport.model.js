import mongoose from "mongoose";
/**
 * - job description
 * - resume Text
 * - Self Description
 * - Overall Score: number
 * 
 * - Technical Questions [{question: "", intention: "", answer: ""}, {}]
 * - Behavioral Questions [{question: "", intention: "", answer: ""}, {}]
 * - Skill gaps [{skill: "", severity: {type : String, enum: ["low", "medium", "high"]}}, {}]
 * - preparation plan [{day: number, focus: "", tasks}, {}]
 */

const TechnicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    intention: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
}, { _id: false })

// behavioral questions
const BehavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    intention: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
}, { _id: false })

// skill gaps
const SkillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: true,
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: true,
    },
}, { _id: false })

// preparation plan
const PreparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true,
    },
    focus: {
        type: String,
        required: true,
    },
    tasks: [{
        type: String,
        required: true,

    }],
}, { _id: false })

const InterviewReportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    resume: {
        type: String
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
    },
    technicalQuestions: [TechnicalQuestionSchema],
    behavioralQuestions: [BehavioralQuestionSchema],
    skillGaps: [SkillGapSchema],
    preparationPlan: [PreparationPlanSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
})

const InterviewReportModel = mongoose.model("InterviewReport", InterviewReportSchema);
export default InterviewReportModel;