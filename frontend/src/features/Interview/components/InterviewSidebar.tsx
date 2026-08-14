import { Braces, CalendarCheck, FileText, MessageSquareHeart } from "lucide-react";
import type { InterviewSection } from "../types";
import "./interview-sidebar.scss";

type SidebarItem = {
    key: InterviewSection;
    label: string;
    description: string;
    icon: typeof Braces;
    count?: number;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        key: "technical",
        label: "Technical Questions",
        description: "Role-specific coding & theory",
        icon: Braces,
        count: 6,
    },
    {
        key: "behavioral",
        label: "Behavioral Questions",
        description: "STAR-format & soft skills",
        icon: MessageSquareHeart,
        count: 4,
    },
    {
        key: "preparation",
        label: "Preparation Plan",
        description: "Guided day-by-day roadmap",
        icon: CalendarCheck,
    },
    {
        key: "job",
        label: "Job Description",
        description: "The role you're targeting",
        icon: FileText,
    },
];

type InterviewSidebarProps = {
    activeSection: InterviewSection;
    onSelect: (section: InterviewSection) => void;
};

const InterviewSidebar = ({ activeSection, onSelect }: InterviewSidebarProps) => (
    <aside className="interview-sidebar">
        <div className="interview-sidebar__header">
            <span className="interview-sidebar__eyebrow">Interview</span>
            <h2 className="interview-sidebar__title">Toolkit</h2>
            <p className="interview-sidebar__subtitle">Pick a section to explore your tailored prep.</p>
        </div>

        <nav className="interview-sidebar__nav" aria-label="Interview sections">
            {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;
                return (
                    <button
                        key={item.key}
                        type="button"
                        className={`interview-sidebar__item${isActive ? " interview-sidebar__item--active" : ""}`}
                        onClick={() => onSelect(item.key)}
                        aria-current={isActive ? "true" : undefined}
                    >
                        <span className="interview-sidebar__item-icon">
                            <Icon size={18} />
                        </span>
                        <span className="interview-sidebar__item-text">
                            <span className="interview-sidebar__item-label">{item.label}</span>
                            <span className="interview-sidebar__item-desc">{item.description}</span>
                        </span>
                        {item.count !== undefined && (
                            <span className="interview-sidebar__item-count">{item.count}</span>
                        )}
                    </button>
                );
            })}
        </nav>

        <div className="interview-sidebar__footer">
            <MessageSquareHeart size={15} />
            <span>Tip: start with Technical Questions to warm up.</span>
        </div>
    </aside>
);

export default InterviewSidebar;
