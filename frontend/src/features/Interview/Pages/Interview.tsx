import { useState } from "react";
import { useParams } from "react-router";
import { Download, Loader } from "lucide-react";
import InterviewSidebar from "../components/InterviewSidebar";
import TechnicalQuestions from "../components/TechnicalQuestions";
import BehavioralQuestions from "../components/BehavioralQuestions";
import PreparationPlan from "../components/PreparationPlan";
import JobDescription from "../components/JobDescription";
import SkillGaps from "../components/SkillGaps";
import usePersistentState from "../hooks/usePersistentState";
import { useGenerateResumePDFMutation, useGetSingleInterviewReportQuery } from "../mutations";
import type { InterviewSection } from "../types";
import "../styles/interview.scss";

const Interview = () => {
    const { interviewId = "" } = useParams();
    const [activeSection, setActiveSection] = useState<InterviewSection>("technical");

    // The report comes from the React Query cache when it was just generated
    // (no second network fetch — see useGetSingleInterviewReportQuery in
    // mutations/index.ts) and is fetched by id only when the report is
    // opened from the dashboard.
    const { data: report, isLoading } = useGetSingleInterviewReportQuery(interviewId);

    // Generates the tailored resume PDF for this report and downloads it.
    const resumePDFMutation = useGenerateResumePDFMutation();

    // Editable state, persisted to localStorage per interview.
    const [notes, setNotes] = usePersistentState<Record<string, string>>(
        `interview:${interviewId}:notes`,
        {},
    );
    const [completedTasks, setCompletedTasks] = usePersistentState<Record<string, boolean>>(
        `interview:${interviewId}:tasks`,
        {},
    );

    const handleNoteChange = (key: string, value: string) => {
        setNotes((prev) => ({ ...prev, [key]: value }));
    };

    const handleToggleTask = (key: string) => {
        setCompletedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // While the report is being fetched (opened from the dashboard) show a
    // minimal loading state instead of rendering empty sections.
    if (isLoading) {
        return (
            <main className="interview">
                <div className="interview-loading">
                    <Loader className="loader" />
                    <p>Loading your interview report…</p>
                </div>
            </main>
        );
    }

    // The API helper swallows errors (toasts + returns null), so a missing
    // report here means the id was bad or the fetch failed.
    if (!report) {
        return (
            <main className="interview">
                <div className="interview-loading">
                    <p>This interview report could not be found.</p>
                </div>
            </main>
        );
    }

    const renderSection = () => {
        switch (activeSection) {
            case "technical":
                return (
                    <TechnicalQuestions
                        questions={report.technicalQuestions}
                        notes={notes}
                        onNoteChange={handleNoteChange}
                    />
                );
            case "behavioral":
                return (
                    <BehavioralQuestions
                        questions={report.behavioralQuestions}
                        notes={notes}
                        onNoteChange={handleNoteChange}
                    />
                );
            case "preparation":
                return (
                    <PreparationPlan
                        plan={report.preparationPlan}
                        completedTasks={completedTasks}
                        onToggleTask={handleToggleTask}
                    />
                );
            case "job":
                return <JobDescription description={report.jobDescription} matchScore={report.matchScore} />;
        }
    };

    const handleDownloadResume = () => {
        resumePDFMutation.mutate({ id: report._id, title: report.title });
    };

    return (
        <main className="interview">
            <div className="interview-inner">
                {/* Report header — the AI-generated title of the role, plus the
                    action to download a tailored resume PDF for this report. */}
                <header className="interview-header">
                    <div className="interview-header__text">
                        <span className="interview-header__eyebrow">Interview Report</span>
                        <h1 className="interview-header__title">{report.title}</h1>
                    </div>
                    <button
                        type="button"
                        className="interview-header__download"
                        onClick={handleDownloadResume}
                        disabled={resumePDFMutation.isPending}
                    >
                        {resumePDFMutation.isPending ? (
                            <Loader className="interview-header__spinner" size={16} />
                        ) : (
                            <Download size={16} />
                        )}
                        {resumePDFMutation.isPending ? "Generating…" : "Download Resume PDF"}
                    </button>
                </header>

                <InterviewSidebar activeSection={activeSection} onSelect={setActiveSection} />

                <section className="interview-content" key={activeSection}>
                    {renderSection()}
                </section>

                <SkillGaps skillGaps={report.skillGaps} />
            </div>
        </main>
    );
};

export default Interview;
