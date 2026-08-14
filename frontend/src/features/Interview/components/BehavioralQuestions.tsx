import { useState } from "react";
import { ChevronDown, MessageSquareHeart, Sparkles, Target } from "lucide-react";
import type { Question } from "../types";
import AnswerNotes from "./AnswerNotes";
import "./behavioral-questions.scss";

type BehavioralQuestionsProps = {
    questions: Question[];
    notes: Record<string, string>;
    onNoteChange: (noteKey: string, value: string) => void;
};

const noteKey = (index: number) => `behavioral-${index}`;

const BehavioralQuestions = ({ questions, notes, onNoteChange }: BehavioralQuestionsProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggle = (index: number) => {
        setOpenIndex((current) => (current === index ? null : index));
    };

    return (
        <section className="bq">
            <header className="bq__header">
                <span className="bq__header-icon">
                    <MessageSquareHeart size={20} />
                </span>
                <div className="bq__header-text">
                    <h2 className="bq__title">Behavioral Questions</h2>
                    <p className="bq__subtitle">
                        {questions.length} situational questions to practice. Structure your answers with the
                        STAR method — Situation, Task, Action, Result.
                    </p>
                </div>
                <span className="bq__badge">STAR</span>
            </header>

            <div className="bq__list">
                {questions.map((question, index) => {
                    const isOpen = openIndex === index;
                    const key = noteKey(index);
                    return (
                        <article key={index} className={`bq-card${isOpen ? " bq-card--open" : ""}`}>
                            <button
                                type="button"
                                className="bq-card__head"
                                onClick={() => toggle(index)}
                                aria-expanded={isOpen}
                            >
                                <span className="bq-card__icon">
                                    <Target size={15} />
                                </span>
                                <span className="bq-card__question">{question.question}</span>
                                <span className={`bq-card__chevron${isOpen ? " bq-card__chevron--open" : ""}`}>
                                    <ChevronDown size={18} />
                                </span>
                            </button>

                            {isOpen && (
                                <div className="bq-card__body">
                                    <div className="bq-card__block bq-card__block--intention">
                                        <span className="bq-card__label">
                                            <Target size={14} />
                                            What the interviewer wants
                                        </span>
                                        <p className="bq-card__text">{question.intention}</p>
                                    </div>
                                    <div className="bq-card__block bq-card__block--answer">
                                        <span className="bq-card__label">
                                            <Sparkles size={14} />
                                            How to structure it
                                        </span>
                                        <p className="bq-card__text">{question.answer}</p>
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

export default BehavioralQuestions;
