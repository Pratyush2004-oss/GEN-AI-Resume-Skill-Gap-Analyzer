import type { CSSProperties } from "react";
import { Briefcase, FileText, Layers } from "lucide-react";
import "./job-description.scss";

type JobDescriptionProps = {
    description: string;
    matchScore: number;
};

const JobDescription = ({ description, matchScore }: JobDescriptionProps) => {
    const safeScore = Math.min(100, Math.max(0, matchScore));
    const scoreClass = safeScore >= 70 ? "good" : safeScore >= 40 ? "fair" : "low";

    return (
        <section className="jd">
            <header className="jd__header">
                <span className="jd__header-icon">
                    <FileText size={20} />
                </span>
                <div className="jd__header-text">
                    <h2 className="jd__title">Job Description</h2>
                    <p className="jd__subtitle">The role your preparation is built around.</p>
                </div>
            </header>

            <div className="jd__score">
                <div
                    className={`jd__score-ring jd__score-ring--${scoreClass}`}
                    style={{ "--score": `${safeScore}%` } as CSSProperties}
                >
                    <div className="jd__score-inner">
                        <strong>{safeScore}%</strong>
                        <span>match</span>
                    </div>
                </div>
                <div className="jd__score-info">
                    <h3 className="jd__score-title">Your profile match</h3>
                    <p className="jd__score-text">
                        {safeScore >= 70
                            ? "Strong alignment with the role. Polish the skill gaps on the right to go from good to great."
                            : safeScore >= 40
                              ? "Decent alignment — the preparation plan is designed to close the gaps flagged for this role."
                              : "Weak alignment right now. Use the preparation plan to build toward the core requirements."}
                    </p>
                </div>
            </div>

            <div className="jd__body">
                <span className="jd__body-label">
                    <Briefcase size={14} />
                    Role overview
                </span>
                <pre className="jd__text">{description}</pre>
            </div>

            <div className="jd__footer">
                <Layers size={14} />
                <span>
                    Tip: review this description alongside your <strong>skill gaps</strong> — every requirement
                    maps to at least one interview question in this toolkit.
                </span>
            </div>
        </section>
    );
};

export default JobDescription;
