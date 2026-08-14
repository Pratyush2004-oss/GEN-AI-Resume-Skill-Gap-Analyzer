import { useEffect, useRef, useState } from "react";
import { Check, NotebookPen } from "lucide-react";
import "./answer-notes.scss";

type AnswerNotesProps = {
    noteKey: string;
    value: string;
    onChange: (noteKey: string, value: string) => void;
};

type SaveStatus = "idle" | "saving" | "saved";

const AnswerNotes = ({ noteKey, value, onChange }: AnswerNotesProps) => {
    const [status, setStatus] = useState<SaveStatus>("idle");
    const timeoutRef = useRef<number | null>(null);

    const handleChange = (next: string) => {
        onChange(noteKey, next);
        setStatus("saving");
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => setStatus("saved"), 700);
    };

    useEffect(
        () => () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        },
        [],
    );

    return (
        <div className="notes">
            <div className="notes__head">
                <span className="notes__label">
                    <NotebookPen size={14} />
                    Your notes / draft answer
                </span>
                <span className={`notes__status notes__status--${status}`}>
                    {status === "saving" ? (
                        "Saving…"
                    ) : status === "saved" ? (
                        <>
                            <Check size={12} />
                            Saved
                        </>
                    ) : (
                        "Auto-saves"
                    )}
                </span>
            </div>
            <textarea
                className="notes__textarea"
                placeholder="Type your own answer or notes here — they're saved automatically…"
                value={value}
                onChange={(event) => handleChange(event.target.value)}
                rows={3}
            />
        </div>
    );
};

export default AnswerNotes;
