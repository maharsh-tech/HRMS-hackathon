import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmployees } from '../services/api';

export default function LeaveManagementPage() {
    const { user, isAdmin, logout, token } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    // Mock leave requests data
    const [leaveRequests, setLeaveRequests] = useState([
        { id: 1, employeeId: 'OIJODO20260001', name: 'John Doe', type: 'Sick Leave', startDate: '2026-01-05', endDate: '2026-01-06', days: 2, status: 'Pending', reason: 'Not feeling well' },
        { id: 2, employeeId: 'OIJASM20260002', name: 'Jane Smith', type: 'Paid Leave', startDate: '2026-01-10', endDate: '2026-01-15', days: 6, status: 'Approved', reason: 'Family vacation' },
        { id: 3, employeeId: 'OIMIBR20260003', name: 'Mike Brown', type: 'Unpaid Leave', startDate: '2026-01-08', endDate: '2026-01-08', days: 1, status: 'Rejected', reason: 'Personal work' },
        { id: 4, employeeId: 'OISAWI20260004', name: 'Sarah Wilson', type: 'Paid Leave', startDate: '2026-01-20', endDate: '2026-01-22', days: 3, status: 'Pending', reason: 'Medical appointment' },
    ]);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const handleApprove = (id) => {
        setLeaveRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'Approved' } : req
        ));
    };

    const handleReject = (id) => {
        setLeaveRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'Rejected' } : req
        ));
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return { bg: '#38ef7d20', color: '#38ef7d' };
            case 'Rejected': return { bg: '#f5576c20', color: '#f5576c' };
            case 'Pending': return { bg: '#ffb34720', color: '#ffb347' };
            default: return { bg: '#ffffff20', color: '#ffffff' };
        }
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case 'Paid Leave': return { bg: '#667eea20', color: '#667eea' };
            case 'Sick Leave': return { bg: '#f5576c20', color: '#f5576c' };
            case 'Unpaid Leave': return { bg: '#a0a0b020', color: '#a0a0b0' };
            default: return { bg: '#ffffff20', color: '#ffffff' };
        }
    };

    const filteredRequests = filterStatus === 'all'
        ? leaveRequests
        : leaveRequests.filter(r => r.status === filterStatus);

    const stats = {
        total: leaveRequests.length,
        pending: leaveRequests.filter(r => r.status === 'Pending').length,
        approved: leaveRequests.filter(r => r.status === 'Approved').length,
        rejected: leaveRequests.filter(r => r.status === 'Rejected').length,
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.logo}>
                    <div style={styles.logoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                    </div>
                    <span style={styles.logoText}>Dayflow HRMS</span>
                </div>

                <nav style={styles.nav}>
                    <Link to="/dashboard" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        <span>Dashboard</span>
                    </Link>

                    {isAdmin && (
                        <Link to="/admin/create-employee" style={{ ...styles.navItem, textDecoration: 'none' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                            <span>Add Employee</span>
                        </Link>
                    )}

                    <Link to="/employees" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>Employees</span>
                    </Link>

                    <Link to="/attendance" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>Attendance</span>
                    </Link>

                    <Link to="/leave" style={{ ...styles.navItem, ...styles.navItemActive, textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span>Leave Management</span>
                    </Link>

                    <Link to="/change-password" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Change Password</span>
                    </Link>
                </nav>

                <div style={styles.sidebarFooter}>
                    <div style={styles.navItem} onClick={handleLogout}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Logout</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.headerTitle}>Leave Management</h1>
                        <p style={styles.headerSubtitle}>Manage employee leave requests</p>
                    </div>
                </header>

                {/* Stats Cards */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{stats.total}</div>
                        <div style={styles.statLabel}>Total Requests</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statNumber, color: '#f59e0b' }}>{stats.pending}</div>
                        <div style={styles.statLabel}>Pending</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statNumber, color: '#22c55e' }}>{stats.approved}</div>
                        <div style={styles.statLabel}>Approved</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statNumber, color: '#ef4444' }}>{stats.rejected}</div>
                        <div style={styles.statLabel}>Rejected</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={styles.filterTabs}>
                    {['all', 'Pending', 'Approved', 'Rejected'].map(status => (
                        <button
                            key={status}
                            style={{
                                ...styles.filterTab,
                                ...(filterStatus === status ? styles.filterTabActive : {})
                            }}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'all' ? 'All Requests' : status}
                        </button>
                    ))}
                </div>

                {/* Leave Requests Table */}
                <div style={styles.tableCard}>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Employee</th>
                                    <th style={styles.th}>Leave Type</th>
                                    <th style={styles.th}>Duration</th>
                                    <th style={styles.th}>Days</th>
                                    <th style={styles.th}>Reason</th>
                                    <th style={styles.th}>Status</th>
                                    {isAdmin && <th style={styles.th}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((req) => {
                                    const statusStyle = getStatusStyle(req.status);
                                    const typeStyle = getTypeStyle(req.type);
                                    return (
                                        <tr key={req.id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={styles.nameCell}>
                                                    <div style={styles.avatar}>
                                                        {req.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div>{req.name}</div>
                                                        <div style={styles.email}>{req.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    background: typeStyle.bg,
                                                    color: typeStyle.color
                                                }}>
                                                    {req.type}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                {req.startDate} → {req.endDate}
                                            </td>
                                            <td style={styles.td}>{req.days}</td>
                                            <td style={styles.td}>{req.reason}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    background: statusStyle.bg,
                                                    color: statusStyle.color
                                                }}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td style={styles.td}>
                                                    {req.status === 'Pending' && (
                                                        <div style={styles.actions}>
                                                            <button
                                                                style={styles.approveBtn}
                                                                onClick={() => handleApprove(req.id)}
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                style={styles.rejectBtn}
                                                                onClick={() => handleReject(req.id)}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

const styles = {
    container: { display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff' },
    sidebar: { width: 260, background: '#111', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.08)' },
    logo: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' },
    logoIcon: { width: 40, height: 40, background: '#1a1a1a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' },
    logoText: { fontSize: '1.25rem', fontWeight: 600, color: '#fff' },
    nav: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
    navItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s ease', fontSize: '0.9rem' },
    navItemActive: { background: 'rgba(255,255,255,0.08)', color: '#fff' },
    sidebarFooter: { marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' },
    main: { flex: 1, padding: '2rem', overflowY: 'auto' },
    header: { marginBottom: '2rem' },
    headerTitle: { fontSize: '1.75rem', fontWeight: 600, margin: 0 },
    headerSubtitle: { color: 'rgba(255,255,255,0.5)', margin: '0.25rem 0 0' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
    statCard: { padding: '1.25rem', borderRadius: 12, textAlign: 'center', background: '#141414', border: '1px solid rgba(255,255,255,0.08)' },
    statNumber: { fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.25rem' },
    statLabel: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' },
    filterTabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' },
    filterTab: { background: '#141414', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' },
    filterTabActive: { background: '#3b82f6', border: 'none', color: '#fff' },
    tableCard: { background: '#111', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
    td: { padding: '0.75rem', fontSize: '0.85rem' },
    nameCell: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    avatar: { width: 36, height: 36, background: '#3b82f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 },
    email: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' },
    badge: { padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 500 },
    actions: { display: 'flex', gap: '0.4rem' },
    approveBtn: { background: '#22c55e', border: 'none', color: '#fff', width: 26, height: 26, borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' },
    rejectBtn: { background: '#ef4444', border: 'none', color: '#fff', width: 26, height: 26, borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem' },
};
