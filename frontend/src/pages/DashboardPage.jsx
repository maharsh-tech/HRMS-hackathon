import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function DashboardPage() {
    const { user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const getInitials = () => {
        if (!user) return 'U';
        const first = user.firstName?.[0] || '';
        const last = user.lastName?.[0] || '';
        return (first + last).toUpperCase() || 'U';
    };

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <aside className="dashboard-sidebar glass-card" style={{ borderRadius: 0 }}>
                <div className="dashboard-logo">
                    <div className="dashboard-logo-icon">HR</div>
                    <span className="dashboard-logo-text">HRMS</span>
                </div>

                <nav className="dashboard-nav">
                    <Link to="/dashboard" className="nav-item active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        Dashboard
                    </Link>

                    {isAdmin && (
                        <Link to="/admin/create-employee" className="nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                            Create Employee
                        </Link>
                    )}

                    <Link to="/change-password" className="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Change Password
                    </Link>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button className="nav-item" onClick={handleLogout} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="dashboard-welcome">
                        <h1>Welcome back, {user?.firstName || 'User'}!</h1>
                        <p>Here's what's happening with your HRMS today.</p>
                    </div>
                    <div className="user-menu">
                        <div className="user-avatar">
                            {getInitials()}
                        </div>
                    </div>
                </header>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="dashboard-card glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '0.25rem' }}>Your Profile</h4>
                                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                                    {user?.firstName} {user?.lastName}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '0.25rem' }}>Employee ID</h4>
                                <p style={{ margin: 0, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                    {user?.employeeId}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '0.25rem' }}>Role</h4>
                                <p style={{ margin: 0, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                    {user?.role || 'Employee'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                {isAdmin && (
                    <div className="dashboard-card glass-card">
                        <h3 className="card-title">Quick Actions</h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <Button
                                variant="primary"
                                onClick={() => navigate('/admin/create-employee')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="8.5" cy="7" r="4" />
                                    <line x1="20" y1="8" x2="20" y2="14" />
                                    <line x1="23" y1="11" x2="17" y2="11" />
                                </svg>
                                Create New Employee
                            </Button>
                        </div>
                    </div>
                )}

                {/* Info Card */}
                <div className="dashboard-card glass-card" style={{ marginTop: isAdmin ? 0 : '1.5rem' }}>
                    <h3 className="card-title">Account Information</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Email</span>
                            <span>{user?.email}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Employee ID</span>
                            <span style={{ fontFamily: 'monospace' }}>{user?.employeeId}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Role</span>
                            <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
