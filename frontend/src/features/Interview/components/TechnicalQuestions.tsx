import { useState } from "react";
import { Braces, ChevronDown, Lightbulb, Sparkles } from "lucide-react";
import type { Question } from "../types";
import AnswerNotes from "./AnswerNotes";
import "./technical-questions.scss";

type TechnicalQuestionsProps = {
    questions: Question[];
    notes: Record<string, string>;
    onNoteChange: (noteKey: string, value: string) => void;
};

const noteKey = (index: number) => `technical-${index}`;

const TechnicalQuestions = ({ questions, notes, onNoteChange }: TechnicalQuestionsProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex((current) => (current === index ? null : index));
    };

    return (
        <section className="tq">
            <header className="tq__header">
                <span className="tq__header-icon">
                    <Braces size={20} />
                </span>
                <div className="tq__header-text">
                    <h2 className="tq__title">Technical Questions</h2>
                    <p className="tq__subtitle">
                        {questions.length} questions tailored to your target role — tap any card to reveal the
                        interviewer's intent and a suggested answer.
                    </p>
                </div>
                <span className="tq__badge">Q&amp;A</span>
            </header>

            <div className="tq__list">
                {questions.map((question, index) => {
                    const isOpen = openIndex === index;
                    const key = noteKey(index);
                    return (
                        <article
                            key={index}
                            className={`tq-card${isOpen ? " tq-card--open" : ""}`}
                        >
                            <button
                                type="button"
                                className="tq-card__head"
                                onClick={() => toggle(index)}
                                aria-expanded={isOpen}
                            >
                                <span className="tq-card__num">{String(index + 1).padStart(2, "0")}</span>
                                <span className="tq-card__question">{question.question}</span>
                                <span className={`tq-card__chevron${isOpen ? " tq-card__chevron--open" : ""}`}>
                                    <ChevronDown size={18} />
                                </span>
                            </button>

                            {isOpen && (
                                <div className="tq-card__body">
                                    <div className="tq-card__block tq-card__block--intention">
                                        <span className="tq-card__label">
                                            <Lightbulb size={14} />
                                            What they're looking for
                                        </span>
                                        <p className="tq-card__text">{question.intention}</p>
                                    </div>
                                    <div className="tq-card__block tq-card__block--answer">
                                        <span className="tq-card__label">
                                            <Sparkles size={14} />
                                            Suggested answer
                                        </span>
                                        <p className="tq-card__text">{question.answer}</p>
                                    </div>
                                    <AnswerNotes
                                        noteKey={key}
                                        value={notes[key] ?? ""}
                                        onChange={onNoteChange}
                                    />
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default TechnicalQuestions;
