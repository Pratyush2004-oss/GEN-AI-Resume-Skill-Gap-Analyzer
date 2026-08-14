import { Home } from 'lucide-react';
import { useNavigate } from 'react-router';
import './not-found.scss';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <main className="not-found">
            <div className="not-found__content">
                <p className="not-found__code">404</p>
                <h1 className="not-found__title">Page not found</h1>
                <p className="not-found__description">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <button className="btn primary-btn not-found__button" onClick={() => navigate('/')}>
                    <Home size={18} />
                    Back to Home
                </button>
            </div>
        </main>
    );
};

export default NotFoundPage;
