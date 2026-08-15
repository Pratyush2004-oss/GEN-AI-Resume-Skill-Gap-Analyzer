import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router";
import { Calendar, ChevronRight, FileText, Inbox, Loader, Trash2 } from "lucide-react";
import { useInterview } from "../hooks/useInterview";
import { useDeleteInterviewReportMutation } from "../mutations";
import type { REPORTLISTTYPE } from "../types";
import "./interview-report-list.scss";

/**
 * Format the API's ISO date string into something human readable,
 * e.g. "12 Aug 2026, 3:45 PM". Falls back to the raw value if the
 * string can't be parsed (keeps the UI robust against bad data).
 */
const formatDate = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const InterViewReportList = () => {
    const navigate = useNavigate();
    // The third value (setter) is unused here — the list only needs to be read.
    const [interviewReports, , isLoading] = useInterview();
    const deleteReportMutation = useDeleteInterviewReportMutation();

    // Two-step delete guard: the first click on the trash button "arms" it
    // (button turns into "Confirm?"), the second click actually deletes.
    // This prevents accidental report deletion while staying modal-free.
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    // Open a report in the interview detail page (/interview/:id).
    const handleOpen = (report: REPORTLISTTYPE) => {
        navigate(`/interview/${report._id}`);
    };

    const handleDelete = (report: REPORTLISTTYPE) => {
        // First click -> arm the confirm state for THIS card only.
        if (pendingDeleteId !== report._id) {
            setPendingDeleteId(report._id);
            return;
        }
        // Second click -> actually fire the delete mutation.
        setPendingDeleteId(null);
        deleteReportMutation.mutate(report._id);
    };

    // ---- Loading state: shimmer skeleton cards ------------------------------
    if (isLoading) {
        return (
            <section className="report-list" aria-label="Loading interview reports">
                <div className="report-list__header">
                    <h2 className="report-list__title">Your interview reports</h2>
                </div>
                <div className="report-list__grid">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="report-card report-card--skeleton"
                            style={{ "--card-index": index } as CSSProperties}
                            aria-hidden="true"
                        >
                            <span className="skeleton skeleton--icon" />
                            <span className="skeleton skeleton--line" />
                            <span className="skeleton skeleton--line skeleton--short" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // ---- Empty state: no reports generated yet ------------------------------
    if (interviewReports.length === 0) {
        return (
            <section className="report-list" aria-label="Your interview reports">
                <div className="report-list__header">
                    <h2 className="report-list__title">Your interview reports</h2>
                </div>
                <div className="report-empty">
                    <span className="report-empty__icon">
                        <Inbox size={28} />
                    </span>
                    <h3 className="report-empty__title">No reports yet</h3>
                    <p className="report-empty__text">
                        Generate your first mock interview from the home page and it will show up here.
                    </p>
                </div>
            </section>
        );
    }

    // ---- Report grid ---------------------------------------------------------
    return (
        <section className="report-list" aria-label="Your interview reports">
            <div className="report-list__header">
                <h2 className="report-list__title">Your interview reports</h2>
                <span className="report-list__count">
                    {interviewReports.length} {interviewReports.length === 1 ? "report" : "reports"}
                </span>
            </div>

            <div className="report-list__grid">
                {interviewReports.map((report, index) => {
                    const isConfirming = pendingDeleteId === report._id;
                    const isDeleting =
                        deleteReportMutation.isPending &&
                        deleteReportMutation.variables === report._id;

                    return (
                        <article
                            key={report._id}
                            className={`report-card${isConfirming ? " report-card--confirming" : ""}${
                                isDeleting ? " report-card--deleting" : ""
                            }`}
                            style={{ "--card-index": index } as CSSProperties}
                        >
                            {/* Main clickable area — opens the report detail page */}
                            <button
                                type="button"
                                className="report-card__open"
                                onClick={() => handleOpen(report)}
                                disabled={isDeleting}
                                aria-label={`Open report: ${report.title}`}
                            >
                                <span className="report-card__icon">
                                    <FileText size={20} />
                                </span>
                                <span className="report-card__body">
                                    <span className="report-card__title">{report.title}</span>
                                    <span className="report-card__meta">
                                        <Calendar size={13} />
                                        {formatDate(report.createdAt)}
                                    </span>
                                </span>
                                <ChevronRight className="report-card__chevron" size={18} />
                            </button>

                            {/* Delete action — two-step confirm, see handleDelete */}
                            <button
                                type="button"
                                className="report-card__delete"
                                onClick={() => handleDelete(report)}
                                disabled={isDeleting}
                                aria-label={
                                    isConfirming
                                        ? `Confirm deleting ${report.title}`
                                        : `Delete report: ${report.title}`
                                }
                            >
                                {isDeleting ? (
                                    <Loader className="report-card__spinner" size={16} />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                                {isConfirming && <span>Confirm?</span>}
                            </button>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default InterViewReportList;
