import { CalendarCheck, Check, Clock } from "lucide-react";
import type { PreparationDay } from "../types";
import "./preparation-plan.scss";

type PreparationPlanProps = {
    plan: PreparationDay[];
    completedTasks: Record<string, boolean>;
    onToggleTask: (taskKey: string) => void;
};

const taskKey = (day: PreparationDay, taskIndex: number) => `${day.day}-${taskIndex}`;

const PreparationPlan = ({ plan, completedTasks, onToggleTask }: PreparationPlanProps) => {
    const totalTasks = plan.reduce((sum, day) => sum + day.tasks.length, 0);
    const completedCount = plan.reduce(
        (sum, day) => sum + day.tasks.filter((_, index) => completedTasks[taskKey(day, index)]).length,
        0,
    );
    const progress = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

    return (
        <section className="pp">
            <header className="pp__header">
                <span className="pp__header-icon">
                    <CalendarCheck size={20} />
                </span>
                <div className="pp__header-text">
                    <h2 className="pp__title">Preparation Plan</h2>
                    <p className="pp__subtitle">
                        A {plan.length}-day roadmap to close your skill gaps before the interview. Tick off
                        tasks as you complete them — your progress is saved automatically.
                    </p>
                </div>
                <span className="pp__badge">
                    <Clock size={13} />
                    {plan.length} days · {totalTasks} tasks
                </span>
            </header>

            <div className="pp__progress">
                <div className="pp__progress-top">
                    <span className="pp__progress-label">Overall progress</span>
                    <strong className="pp__progress-count">
                        {completedCount} / {totalTasks} tasks · {progress}%
                    </strong>
                </div>
                <div className="pp__progress-bar">
                    <span className="pp__progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="pp__timeline">
                {plan.map((day, index) => {
                    const dayDone = day.tasks.every((_, taskIndex) => completedTasks[taskKey(day, taskIndex)]);
                    return (
                        <article key={day.day} className={`pp-day${dayDone ? " pp-day--done" : ""}`}>
                            <div className="pp-day__rail">
                                <span className="pp-day__dot">
                                    <CalendarCheck size={13} />
                                </span>
                                {index < plan.length - 1 && <span className="pp-day__line" />}
                            </div>

                            <div className="pp-day__card">
                                <div className="pp-day__meta">
                                    <span className="pp-day__badge">Day {day.day}</span>
                                    <h3 className="pp-day__focus">{day.focus}</h3>
                                    {dayDone && (
                                        <span className="pp-day__done-badge">
                                            <Check size={12} />
                                            Complete
                                        </span>
                                    )}
                                </div>
                                <ul className="pp-day__tasks">
                                    {day.tasks.map((task, taskIndex) => {
                                        const done = !!completedTasks[taskKey(day, taskIndex)];
                                        return (
                                            <li
                                                key={taskIndex}
                                                className={`pp-day__task${done ? " pp-day__task--done" : ""}`}
                                            >
                                                <label className="pp-day__check">
                                                    <input
                                                        type="checkbox"
                                                        checked={done}
                                                        onChange={() => onToggleTask(taskKey(day, taskIndex))}
                                                    />
                                                    <span className="pp-day__checkmark">
                                                        <Check size={12} />
                                                    </span>
                                                </label>
                                                <span className="pp-day__task-text">{task}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default PreparationPlan;
