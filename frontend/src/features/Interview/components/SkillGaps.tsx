import { Target, TrendingUp, TriangleAlert } from "lucide-react";
import type { SkillGap } from "../types";
import "./skill-gaps.scss";

type SeverityMeta = {
    label: string;
    className: string;
    level: number;
};

const SEVERITY_META: Record<string, SeverityMeta> = {
    high: { label: "High", className: "high", level: 3 },
    medium: { label: "Medium", className: "medium", level: 2 },
    low: { label: "Low", className: "low", level: 1 },
};

const getSeverityMeta = (severity: string): SeverityMeta =>
    SEVERITY_META[severity.trim().toLowerCase()] ?? SEVERITY_META.medium;

type SkillGapsProps = {
    skillGaps: SkillGap[];
};

const SkillGaps = ({ skillGaps }: SkillGapsProps) => {
    const highCount = skillGaps.filter((gap) => getSeverityMeta(gap.severity).className === "high").length;

    return (
        <aside className="sg">
            <header className="sg__header">
                <span className="sg__header-icon">
                    <Target size={18} />
                </span>
                <div>
                    <h2 className="sg__title">Skill Gaps</h2>
                    <p className="sg__subtitle">{skillGaps.length} areas to strengthen</p>
                </div>
            </header>

            {highCount > 0 && (
                <div className="sg__alert">
                    <TriangleAlert size={15} />
                    <span>
                        {highCount} high-priority {highCount === 1 ? "gap" : "gaps"} detected — tackle these
                        first.
                    </span>
                </div>
            )}

            <ul className="sg__list">
                {skillGaps.map((gap, index) => {
                    const meta = getSeverityMeta(gap.severity);
                    return (
                        <li key={index} className={`sg-item sg-item--${meta.className}`}>
                            <div className="sg-item__top">
                                <span className="sg-item__name">{gap.skill}</span>
                                <span className="sg-item__badge">{meta.label}</span>
                            </div>
                            <div className="sg-item__bar">
                                <span
                                    className="sg-item__bar-fill"
                                    style={{ width: `${meta.level * 33}%` }}
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>

            <div className="sg__tip">
                <TrendingUp size={14} />
                <span>Your Preparation Plan is built to close these gaps before the big day.</span>
            </div>
        </aside>
    );
};

export default SkillGaps;
