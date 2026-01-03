import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmployees } from '../services/api';

export default function AttendanceReportPage() {
    const { user, isAdmin, logout, token } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('daily');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    useEffect(() => {
        if (token && isAdmin) {
            fetchEmployees();
        }
    }, [token, isAdmin]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await getEmployees(token);
            // Add mock attendance data for demo
            const empsWithAttendance = (data.employees || []).map(emp => ({
                ...emp,
                status: ['Present', 'Absent', 'Half-day', 'Leave'][Math.floor(Math.random() * 4)],
                checkIn: emp.role === 'admin' ? '09:00 AM' : `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM`,
                checkOut: emp.role === 'admin' ? '06:00 PM' : `${5 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} PM`,
            }));
            setEmployees(empsWithAttendance);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return { bg: '#38ef7d20', color: '#38ef7d' };
            case 'Absent': return { bg: '#f5576c20', color: '#f5576c' };
            case 'Half-day': return { bg: '#ffb34720', color: '#ffb347' };
            case 'Leave': return { bg: '#667eea20', color: '#667eea' };
            default: return { bg: '#ffffff20', color: '#ffffff' };
        }
    };

    const stats = {
        total: employees.length,
        present: employees.filter(e => e.status === 'Present').length,
        absent: employees.filter(e => e.status === 'Absent').length,
        leave: employees.filter(e => e.status === 'Leave' || e.status === 'Half-day').length,
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

                    <Link to="/attendance" style={{ ...styles.navItem, ...styles.navItemActive, textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>Attendance</span>
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
                        <h1 style={styles.headerTitle}>Attendance Report</h1>
                        <p style={styles.headerSubtitle}>Track employee attendance and working hours</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['daily', 'weekly', 'monthly'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: 8,
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        background: viewMode === mode
                                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                            : '#1a1a2e',
                                        color: viewMode === mode ? '#fff' : '#a0a0b0'
                                    }}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                        {viewMode === 'daily' && (
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={styles.dateInput}
                            />
                        )}
                        {viewMode === 'monthly' && (
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                style={styles.dateInput}
                            />
                        )}
                    </div>
                </header>

                {/* Stats Cards */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statNumber}>{stats.total}</div>
                        <div style={styles.statLabel}>Total Employees</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statNumber, color: '#22c55e' }}>{stats.present}</div>
                        <div style={styles.statLabel}>Present Today</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statNumber, color: '#ef4444' }}>{stats.absent}</div>
                        <div style={styles.statLabel}>Absent</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ ...styles.statNumber, color: '#3b82f6' }}>{stats.leave}</div>
                        <div style={styles.statLabel}>On Leave</div>
                    </div>
                </div>

                {/* Attendance Content Based on View Mode */}
                <div style={styles.tableCard}>
                    <div style={styles.tableHeader}>
                        <h2 style={styles.tableTitle}>
                            {viewMode === 'daily' && `Daily Attendance - ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
                            {viewMode === 'weekly' && 'Weekly Attendance Summary'}
                            {viewMode === 'monthly' && `Monthly Attendance - ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}
                        </h2>
                        <button style={styles.refreshBtn} onClick={fetchEmployees} disabled={loading}>
                            {loading ? 'Loading...' : '↻ Refresh'}
                        </button>
                    </div>

                    {loading ? (
                        <div style={styles.loading}>Loading attendance data...</div>
                    ) : employees.length === 0 ? (
                        <div style={styles.empty}>No attendance records found.</div>
                    ) : (
                        <>
                            {viewMode === 'daily' && (
                                <div style={styles.tableWrapper}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Employee</th>
                                                <th style={styles.th}>Employee ID</th>
                                                <th style={styles.th}>Check In</th>
                                                <th style={styles.th}>Check Out</th>
                                                <th style={styles.th}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employees.map((emp) => {
                                                const statusStyle = getStatusColor(emp.status);
                                                return (
                                                    <tr key={emp._id} style={styles.tr}>
                                                        <td style={styles.td}>
                                                            <div style={styles.nameCell}>
                                                                <div style={styles.avatar}>
                                                                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                                                                </div>
                                                                <div>
                                                                    <div>{emp.firstName} {emp.lastName}</div>
                                                                    <div style={styles.email}>{emp.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <code style={styles.code}>{emp.employeeId}</code>
                                                        </td>
                                                        <td style={styles.td}>
                                                            {emp.status === 'Absent' || emp.status === 'Leave' ? '-' : emp.checkIn}
                                                        </td>
                                                        <td style={styles.td}>
                                                            {emp.status === 'Absent' || emp.status === 'Leave' ? '-' : emp.checkOut}
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={{
                                                                ...styles.badge,
                                                                background: statusStyle.bg,
                                                                color: statusStyle.color
                                                            }}>
                                                                {emp.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {viewMode === 'weekly' && (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {employees.map(emp => {
                                        // Mock weekly data for each employee
                                        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                                        const weekData = weekDays.map(day => ({
                                            day,
                                            status: ['Present', 'Present', 'Present', 'Absent', 'Half-day'][Math.floor(Math.random() * 5)]
                                        }));
                                        const presentCount = weekData.filter(d => d.status === 'Present').length;

                                        return (
                                            <div key={emp._id} style={{ background: '#0f0f23', border: '1px solid #ffffff10', borderRadius: 12, padding: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={styles.avatar}>{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
                                                        <div>
                                                            <div style={{ fontWeight: 500 }}>{emp.firstName} {emp.lastName}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#a0a0b0' }}>{emp.employeeId}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: presentCount >= 4 ? '#38ef7d' : presentCount >= 3 ? '#ffb347' : '#f5576c' }}>
                                                        {presentCount}/5 days
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {weekData.map((d, i) => (
                                                        <div key={i} style={{
                                                            flex: 1,
                                                            textAlign: 'center',
                                                            padding: '0.5rem',
                                                            borderRadius: 8,
                                                            background: d.status === 'Present' ? '#38ef7d15' : d.status === 'Absent' ? '#f5576c15' : '#ffb34715',
                                                            color: d.status === 'Present' ? '#38ef7d' : d.status === 'Absent' ? '#f5576c' : '#ffb347'
                                                        }}>
                                                            <div style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>{d.day}</div>
                                                            <div style={{ fontSize: '1rem' }}>{d.status === 'Present' ? '✓' : d.status === 'Absent' ? '✗' : '½'}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {viewMode === 'monthly' && (
                                <div style={styles.tableWrapper}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Employee</th>
                                                <th style={styles.th}>Present</th>
                                                <th style={styles.th}>Absent</th>
                                                <th style={styles.th}>Half-day</th>
                                                <th style={styles.th}>Leave</th>
                                                <th style={styles.th}>Attendance %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employees.map((emp) => {
                                                // Mock monthly data
                                                const present = 18 + Math.floor(Math.random() * 5);
                                                const absent = Math.floor(Math.random() * 3);
                                                const halfDay = Math.floor(Math.random() * 2);
                                                const leave = Math.floor(Math.random() * 2);
                                                const total = present + absent + halfDay + leave;
                                                const rate = total > 0 ? Math.round((present / total) * 100) : 0;

                                                return (
                                                    <tr key={emp._id} style={styles.tr}>
                                                        <td style={styles.td}>
                                                            <div style={styles.nameCell}>
                                                                <div style={styles.avatar}>
                                                                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                                                                </div>
                                                                <div>
                                                                    <div>{emp.firstName} {emp.lastName}</div>
                                                                    <div style={styles.email}>{emp.employeeId}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={{ ...styles.badge, background: '#38ef7d20', color: '#38ef7d' }}>{present}</span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={{ ...styles.badge, background: '#f5576c20', color: '#f5576c' }}>{absent}</span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={{ ...styles.badge, background: '#ffb34720', color: '#ffb347' }}>{halfDay}</span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={{ ...styles.badge, background: '#667eea20', color: '#667eea' }}>{leave}</span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={{
                                                                fontSize: '1.1rem',
                                                                fontWeight: 600,
                                                                color: rate >= 80 ? '#38ef7d' : rate >= 60 ? '#ffb347' : '#f5576c'
                                                            }}>
                                                                {rate}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    headerTitle: { fontSize: '1.75rem', fontWeight: 600, margin: 0 },
    headerSubtitle: { color: 'rgba(255,255,255,0.5)', margin: '0.25rem 0 0' },
    dateContainer: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    dateInput: { background: '#141414', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '0.6rem 0.75rem', color: '#fff', fontSize: '0.85rem' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
    statCard: { padding: '1.25rem', borderRadius: 12, textAlign: 'center', background: '#141414', border: '1px solid rgba(255,255,255,0.08)' },
    statNumber: { fontSize: '2rem', fontWeight: 600, marginBottom: '0.25rem' },
    statLabel: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' },
    tableCard: { background: '#111', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' },
    tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    tableTitle: { margin: 0, fontSize: '1rem', fontWeight: 500 },
    refreshBtn: { background: '#3b82f6', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
    td: { padding: '0.75rem', fontSize: '0.85rem' },
    code: { background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.2rem 0.4rem', borderRadius: 4, fontSize: '0.75rem', fontFamily: 'monospace' },
    nameCell: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    avatar: { width: 36, height: 36, background: '#3b82f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 },
    email: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' },
    badge: { padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 500 },
    loading: { textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' },
    empty: { textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' },
};
