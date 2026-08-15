import { useNavigate } from "react-router";
import { Plus, Sparkles } from "lucide-react";
import { useAuth } from "../../auth/hook/useAuth";
import InterViewReportList from "../components/InterViewReportList";
import "../styles/dashboard.scss";

const Dashboard = () => {
    const [user] = useAuth();
    const navigate = useNavigate();

    // Reuse the same "first name or fallback" greeting as the home page.
    const firstName = user?.username?.trim().split(/\s+/)[0] ?? "there";

    return (
        <main className="dashboard">
            <div className="dashboard-inner">
                {/* Hero header — greets the user and links back to creating a new interview */}
                <header className="dashboard-hero">
                    <span className="dashboard-hero__badge">
                        <Sparkles size={14} />
                        Your practice hub
                    </span>
                    <h1 className="dashboard-hero__title">
                        Welcome back{firstName !== "there" ? `, ${firstName}` : ""}.
                    </h1>
                    <p className="dashboard-hero__subtitle">
                        Pick up a past mock interview, review your notes, or start a fresh one.
                    </p>
                    <button
                        type="button"
                        className="dashboard-hero__cta"
                        onClick={() => navigate("/")}
                    >
                        <Plus size={18} />
                        New Mock Interview
                    </button>
                </header>

                {/* The report list fetches after the auth session resolves
                    (see interview.context.tsx) and handles its own loading,
                    empty and error-less states. */}
                <InterViewReportList />
            </div>
        </main>
    );
};

export default Dashboard;
