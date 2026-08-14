import { LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../features/auth/hook/useAuth';
import { useLogoutMutation } from '../../features/auth/mutations';
import './navbar.scss';

const getInitials = (name: string): string =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('') || 'U';

const Navbar = () => {
    const [user] = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const logoutMutation = useLogoutMutation();

    // Close the dropdown when clicking outside of it.
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setMenuOpen(false);
        logoutMutation.mutate(undefined, {
            onSuccess: () => navigate('/login'),
        });
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <button className="navbar-brand" onClick={() => navigate('/')}>
                    <img src="/logo.svg" alt="AI Interview logo" className="navbar-logo" />
                    <span>AI Interview</span>
                </button>

                {user ? (
                    <div className="user-menu" ref={menuRef}>
                        <button
                            className="avatar-btn"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                        >
                            <span className="avatar">{getInitials(user.username)}</span>
                            <span className="avatar-name">{user.username}</span>
                        </button>

                        {menuOpen && (
                            <div className="dropdown" role="menu">
                                <div className="dropdown-header">
                                    <span className="dropdown-header__name">{user.username}</span>
                                    <span className="dropdown-header__email">{user.email}</span>
                                </div>
                                <div className="dropdown-divider" />
                                <button
                                    className="dropdown-item dropdown-item--logout"
                                    role="menuitem"
                                    onClick={handleLogout}
                                    disabled={logoutMutation.isPending}
                                >
                                    <LogOut size={16} />
                                    <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="navbar-actions">
                        <button className="nav-btn nav-btn--ghost" onClick={() => navigate('/login')}>
                            Login
                        </button>
                        <button className="nav-btn nav-btn--primary" onClick={() => navigate('/signup')}>
                            Signup
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
