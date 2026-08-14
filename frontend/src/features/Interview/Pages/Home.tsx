import { useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import {
    AlertCircle,
    Braces,
    FileText,
    Loader,
    MessageSquareText,
    Send,
    Sparkles,
    Target,
    Upload,
    UserRound,
    X,
    Zap,
} from 'lucide-react';
import { useAuth } from '../../auth/hook/useAuth';
import '../styles/home.scss';

const MAX_JOB_DESC_CHARS = 5000;
const MAX_SELF_DESC_CHARS = 2000;
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_EXTENSIONS = /\.(pdf|doc|docx|txt)$/i;

type FormErrors = {
    jobDescription?: string;
    resume?: string;
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Home = () => {
    const [user] = useAuth();

    const [jobDescription, setJobDescription] = useState('');
    const [selfDescription, setSelfDescription] = useState('');
    const [resume, setResume] = useState<File | null>(null);
    const [resumeError, setResumeError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const firstName = user?.username?.trim().split(/\s+/)[0] ?? 'there';

    const handleFile = (file: File | undefined) => {
        if (!file) return;

        if (!ACCEPTED_EXTENSIONS.test(file.name)) {
            setResumeError('Only PDF, DOC, DOCX or TXT files are accepted.');
            return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setResumeError(`File is too large. The maximum size is ${MAX_FILE_SIZE_MB} MB.`);
            return;
        }

        setResumeError('');
        setResume(file);
        setErrors((prev) => ({ ...prev, resume: undefined }));
    };

    const handleResumeChange = (event: ChangeEvent<HTMLInputElement>) => {
        handleFile(event.target.files?.[0]);
        // Allow re-selecting the same file after a rejected upload.
        event.target.value = '';
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setDragActive(false);
        handleFile(event.dataTransfer.files?.[0]);
    };

    const removeResume = () => {
        setResume(null);
        setResumeError('');
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextErrors: FormErrors = {};
        if (!jobDescription.trim()) {
            nextErrors.jobDescription = 'Paste the job description to get started.';
        }
        if (!resume) {
            nextErrors.resume = 'Attach your resume so the questions can be tailored to you.';
        }
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setIsSubmitting(true);
        // TODO: Replace with the real interview-creation mutation once the API is wired up.
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success('Your mock interview is ready — questions are on the way!');
            setJobDescription('');
            setSelfDescription('');
            setResume(null);
        }, 1600);
    };

    return (
        <div className="home">
            <div className="home-inner">
                <section className="home-hero">
                    <span className="home-hero__badge">
                        <Sparkles size={14} />
                        AI-powered interview coach
                    </span>
                    <h1 className="home-hero__title">
                        Welcome{firstName !== 'there' ? `, ${firstName}` : ''}. Let's land your{' '}
                        <span>next role</span>.
                    </h1>
                    <p className="home-hero__subtitle">
                        Paste the job description, attach your resume, and let our AI build a realistic
                        mock interview tailored to the role — so you walk in prepared and confident.
                    </p>
                    <div className="home-hero__features">
                        <span className="feature-badge">
                            <Target size={14} />
                            Role-specific questions
                        </span>
                        <span className="feature-badge">
                            <MessageSquareText size={14} />
                            Realistic Q&A
                        </span>
                        <span className="feature-badge">
                            <Zap size={14} />
                            Instant feedback
                        </span>
                    </div>
                </section>

                <form className="interview-form" onSubmit={handleSubmit} noValidate>
                    <div className="interview-input-group">
                        <div className="panel left">
                            <div className="panel-head">
                                <span className="panel-head__icon">
                                    <Braces size={18} />
                                </span>
                                <div>
                                    <h2 className="panel-head__title">Job Description</h2>
                                    <p className="panel-head__hint">
                                        Paste the full description of the role you're applying for.
                                    </p>
                                </div>
                            </div>

                            <textarea
                                name="jobDescription"
                                id="jobDescription"
                                placeholder="e.g. Senior Frontend Engineer — 5+ years of experience with React, TypeScript and modern testing tools…"
                                value={jobDescription}
                                maxLength={MAX_JOB_DESC_CHARS}
                                onChange={(e) => {
                                    setJobDescription(e.target.value);
                                    if (errors.jobDescription) {
                                        setErrors((prev) => ({ ...prev, jobDescription: undefined }));
                                    }
                                }}
                            />

                            <div className="field-meta">
                                <span className="field-meta__counter">
                                    {jobDescription.length.toLocaleString()} /{' '}
                                    {MAX_JOB_DESC_CHARS.toLocaleString()}
                                </span>
                            </div>

                            {errors.jobDescription && (
                                <p className="field-error">
                                    <AlertCircle size={14} />
                                    {errors.jobDescription}
                                </p>
                            )}
                        </div>

                        <div className="panel right">
                            <div className="input-group">
                                <div className="panel-head">
                                    <span className="panel-head__icon">
                                        <FileText size={18} />
                                    </span>
                                    <div>
                                        <h2 className="panel-head__title">Resume</h2>
                                        <p className="panel-head__hint">Upload your most recent resume.</p>
                                    </div>
                                </div>

                                {resume ? (
                                    <div className="file-chip">
                                        <div className="file-chip__info">
                                            <FileText size={18} />
                                            <div className="file-chip__details">
                                                <span className="file-chip__name">{resume.name}</span>
                                                <span className="file-chip__size">
                                                    {formatFileSize(resume.size)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="file-chip__remove"
                                            onClick={removeResume}
                                            aria-label="Remove resume"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="resume"
                                        className={`dropzone${dragActive ? ' dropzone--active' : ''}${
                                            errors.resume ? ' dropzone--error' : ''
                                        }`}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setDragActive(true);
                                        }}
                                        onDragLeave={() => setDragActive(false)}
                                        onDrop={handleDrop}
                                    >
                                        <span className="dropzone__icon">
                                            <Upload size={20} />
                                        </span>
                                        <span className="dropzone__text">
                                            <strong>Click to upload</strong> or drag &amp; drop
                                        </span>
                                        <span className="dropzone__hint">
                                            PDF, DOC, DOCX or TXT · up to {MAX_FILE_SIZE_MB} MB
                                        </span>
                                    </label>
                                )}

                                <input
                                    type="file"
                                    name="resume"
                                    id="resume"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={handleResumeChange}
                                />

                                {resumeError && (
                                    <p className="field-error">
                                        <AlertCircle size={14} />
                                        {resumeError}
                                    </p>
                                )}
                                {errors.resume && !resume && !resumeError && (
                                    <p className="field-error">
                                        <AlertCircle size={14} />
                                        {errors.resume}
                                    </p>
                                )}
                            </div>

                            <div className="input-group">
                                <div className="panel-head">
                                    <span className="panel-head__icon">
                                        <UserRound size={18} />
                                    </span>
                                    <div>
                                        <h2 className="panel-head__title">Self Description</h2>
                                        <p className="panel-head__hint">
                                            Optional — tell us about your background and strengths.
                                        </p>
                                    </div>
                                </div>

                                <textarea
                                    name="selfDescription"
                                    id="selfDescription"
                                    placeholder="e.g. I've been building React apps for 4 years and currently lead a small frontend team…"
                                    value={selfDescription}
                                    maxLength={MAX_SELF_DESC_CHARS}
                                    onChange={(e) => setSelfDescription(e.target.value)}
                                />

                                <div className="field-meta">
                                    <span className="field-meta__counter">
                                        {selfDescription.length.toLocaleString()} /{' '}
                                        {MAX_SELF_DESC_CHARS.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="submit-row">
                        <button
                            type="submit"
                            className="btn primary-btn submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="loader-container">
                                    <Loader className="loader" />
                                    <span>Preparing your interview…</span>
                                </span>
                            ) : (
                                <>
                                    <Send size={18} />
                                    <span>Start Mock Interview</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Home;
