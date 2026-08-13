import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hook/useAuth';

const ProtectedRoute = () => {
    const location = useLocation();
    const [user, , isLoading] = useAuth();

    // optimistic flow: 
    // if cached user exists, allow access immediately
    // if cached user does not exist, wait for the query to load
    if (!user && isLoading) {
        return <div>Loading...</div>
    }

    if (!user && !isLoading) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // if user exists, block access to login page
    if (user && location.pathname === '/login') {
        return <Navigate to="/" state={{ from: location }} replace />
    }

    return (
        <Outlet />
    )
}

export default ProtectedRoute