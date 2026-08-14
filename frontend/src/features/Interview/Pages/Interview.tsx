import { useState } from "react";
import { useParams } from "react-router";
import InterviewSidebar from "../components/InterviewSidebar";
import TechnicalQuestions from "../components/TechnicalQuestions";
import BehavioralQuestions from "../components/BehavioralQuestions";
import PreparationPlan from "../components/PreparationPlan";
import JobDescription from "../components/JobDescription";
import SkillGaps from "../components/SkillGaps";
import usePersistentState from "../hooks/usePersistentState";
import { sampleReport } from "../data/sampleReport";
import type { InterviewSection } from "../types";
import "../styles/interview.scss";

const Interview = () => {
    const { interviewId = "default" } = useParams();
    const [activeSection, setActiveSection] = useState<InterviewSection>("technical");

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

    const renderSection = () => {
        switch (activeSection) {
            case "technical":
                return (
                    <TechnicalQuestions
                        questions={sampleReport.technicalQuestions}
                        notes={notes}
                        onNoteChange={handleNoteChange}
                    />
                );
            case "behavioral":
                return (
                    <BehavioralQuestions
                        questions={sampleReport.behavioralQuestions}
                        notes={notes}
                        onNoteChange={handleNoteChange}
                    />
                );
            case "preparation":
                return (
                    <PreparationPlan
                        plan={sampleReport.preparationPlan}
                        completedTasks={completedTasks}
                        onToggleTask={handleToggleTask}
                    />
                );
            case "job":
                return <JobDescription description={sampleReport.jobDescription} matchScore={sampleReport.matchScore} />;
        }
    };

    return (
        <main className="interview">
            <div className="interview-inner">
                <InterviewSidebar activeSection={activeSection} onSelect={setActiveSection} />

                <section className="interview-content" key={activeSection}>
                    {renderSection()}
                </section>

                <SkillGaps skillGaps={sampleReport.skillGaps} />
            </div>
        </main>
    );
};

export default Interview;
