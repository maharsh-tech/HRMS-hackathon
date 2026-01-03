import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmployees, updateEmployee } from '../services/api';

export default function DashboardPage() {
    const { user, isAdmin, logout, token } = useAuth();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeNav, setActiveNav] = useState('dashboard');
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [salaryForm, setSalaryForm] = useState({});

    useEffect(() => {
        if (isAdmin && token) {
            fetchEmployees();
        }
    }, [isAdmin, token]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await getEmployees(token);
            setEmployees(data.employees || []);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            // Don't use mock data, just show nothing/error
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const handleEditSalary = (employee) => {
        setEditingEmployee(employee);
        setSalaryForm(employee.salaryDetails || {});
    };

    const handleSalaryUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateEmployee(token, editingEmployee._id, { salaryDetails: salaryForm });
            setEditingEmployee(null);
            fetchEmployees(); // Refresh data
            alert('Salary updated successfully!');
        } catch (error) {
            alert('Failed to update salary: ' + error.message);
        }
    };

    const getInitials = () => {
        if (!user) return 'U';
        return ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() || 'U';
    };

    const stats = {
        totalEmployees: employees.length,
        admins: employees.filter(e => e.role === 'admin').length,
        regularEmployees: employees.filter(e => e.role === 'employee').length,
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.logo}>
                    <div style={styles.logoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                    </div>
                    <span style={styles.logoText}>Dayflow HRMS</span>
                </div>

                <nav style={styles.nav}>
                    <div style={{ ...styles.navItem, ...(activeNav === 'dashboard' ? styles.navItemActive : {}) }} onClick={() => setActiveNav('dashboard')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                        <span>Dashboard</span>
                    </div>

                    <div style={{ ...styles.navItem, ...(activeNav === 'salaries' ? styles.navItemActive : {}) }} onClick={() => setActiveNav('salaries')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        <span>Salaries</span>
                    </div>

                    <Link to="/admin/create-employee" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                        <span>Add Employee</span>
                    </Link>

                    <Link to="/employees" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        <span>Employees</span>
                    </Link>

                    <Link to="/attendance" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        <span>Attendance</span>
                    </Link>

                    <Link to="/leave" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                        <span>Leave Management</span>
                    </Link>

                    <Link to="/change-password" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                        <span>Change Password</span>
                    </Link>
                </nav>

                <div style={styles.sidebarFooter}>
                    <div style={styles.navItem} onClick={handleLogout}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        <span>Logout</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <div><h1 style={styles.headerTitle}>Admin Dashboard</h1></div>
                    <div style={styles.userInfo}><div style={styles.userAvatar}>{getInitials()}</div><div><p style={styles.userName}>{user?.firstName} {user?.lastName}</p><p style={styles.userRole}>{user?.role}</p></div></div>
                </header>

                {activeNav === 'dashboard' && (
                    <>
                        <div style={styles.statsGrid}>
                            <div style={{ ...styles.statCard, background: '#141414' }}><p style={styles.statNumber}>{stats.totalEmployees}</p><p style={styles.statLabel}>Total Employees</p></div>
                            <div style={{ ...styles.statCard, background: '#141414' }}><p style={styles.statNumber}>{stats.admins}</p><p style={styles.statLabel}>Admins</p></div>
                            <div style={{ ...styles.statCard, background: '#141414' }}><p style={styles.statNumber}>{stats.regularEmployees}</p><p style={styles.statLabel}>Employees</p></div>
                        </div>

                        <div style={styles.tableCard}>
                            <div style={styles.tableHeader}><h2 style={styles.tableTitle}>Recent Employees</h2><button style={styles.refreshBtn} onClick={fetchEmployees} disabled={loading}>{loading ? '...' : '↻ Refresh'}</button></div>
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Name</th><th style={styles.th}>Role</th></tr></thead>
                                    <tbody>
                                        {employees.slice(0, 5).map(emp => (
                                            <tr key={emp._id} style={styles.tr}>
                                                <td style={styles.td}><code style={styles.code}>{emp.employeeId}</code></td>
                                                <td style={styles.td}>{emp.firstName} {emp.lastName}</td>
                                                <td style={styles.td}><span style={{ ...styles.badge, background: emp.role === 'admin' ? '#667eea20' : '#11998e20', color: emp.role === 'admin' ? '#667eea' : '#11998e' }}>{emp.role}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeNav === 'salaries' && (
                    <div style={styles.tableCard}>
                        <h2 style={styles.tableTitle}>Employee Salaries</h2>
                        <div style={styles.tableWrapper}>
                            <table style={styles.table}>
                                <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Basic</th><th style={styles.th}>HRA</th><th style={styles.th}>Net Salary</th><th style={styles.th}>Action</th></tr></thead>
                                <tbody>
                                    {employees.filter(e => e.role !== 'admin').map(emp => ( // Filter out admins if needed, or keep all
                                        <tr key={emp._id} style={styles.tr}>
                                            <td style={styles.td}>{emp.firstName} {emp.lastName}</td>
                                            <td style={styles.td}>₹{emp.salaryDetails?.basic?.toLocaleString('en-IN') || 0}</td>
                                            <td style={styles.td}>₹{emp.salaryDetails?.hra?.toLocaleString('en-IN') || 0}</td>
                                            <td style={{ ...styles.td, color: '#38ef7d', fontWeight: 600 }}>₹{emp.salaryDetails?.netSalary?.toLocaleString('en-IN') || 0}</td>
                                            <td style={styles.td}>
                                                <button style={styles.actionBtn} onClick={() => navigate(`/admin/employees/${emp._id}`)}>Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Edit Salary Modal */}
                {editingEmployee && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <h3 style={styles.modalTitle}>Edit Salary for {editingEmployee.firstName}</h3>
                            <form onSubmit={handleSalaryUpdate}>
                                <div style={styles.formGrid}>
                                    <div style={styles.formGroup}><label style={styles.formLabel}>Basic Salary</label><input type="number" style={styles.input} value={salaryForm.basicSalary || ''} onChange={e => setSalaryForm({ ...salaryForm, basicSalary: Number(e.target.value) })} /></div>
                                    <div style={styles.formGroup}><label style={styles.formLabel}>HRA</label><input type="number" style={styles.input} value={salaryForm.hra || ''} onChange={e => setSalaryForm({ ...salaryForm, hra: Number(e.target.value) })} /></div>
                                    <div style={styles.formGroup}><label style={styles.formLabel}>Allowances</label><input type="number" style={styles.input} value={salaryForm.allowances || ''} onChange={e => setSalaryForm({ ...salaryForm, allowances: Number(e.target.value) })} /></div>
                                    <div style={styles.formGroup}><label style={styles.formLabel}>Deductions</label><input type="number" style={styles.input} value={salaryForm.deductions || ''} onChange={e => setSalaryForm({ ...salaryForm, deductions: Number(e.target.value) })} /></div>
                                    <div style={styles.formGroup}><label style={styles.formLabel}>Net Salary</label><input type="number" style={styles.input} value={salaryForm.netSalary || ''} onChange={e => setSalaryForm({ ...salaryForm, netSalary: Number(e.target.value) })} /></div>
                                </div>
                                <div style={styles.buttonGroup}>
                                    <button type="button" style={{ ...styles.btn, ...styles.btnSecondary }} onClick={() => setEditingEmployee(null)}>Cancel</button>
                                    <button type="submit" style={{ ...styles.btn, ...styles.btnPrimary }}>Save Salary</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    // Minimal Theme
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
    userInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#141414', padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' },
    userAvatar: { width: 36, height: 36, background: '#3b82f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem' },
    userName: { margin: 0, fontWeight: 500, fontSize: '0.9rem' },
    userRole: { margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: { padding: '1.25rem', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.08)' },
    statNumber: { fontSize: '2rem', fontWeight: 600, margin: 0 },
    statLabel: { margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' },
    tableCard: { background: '#111', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' },
    tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    tableTitle: { margin: 0, fontSize: '1rem', fontWeight: 500 },
    refreshBtn: { background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    tr: { borderBottom: '1px solid rgba(255,255,255,0.05)' },
    td: { padding: '0.75rem', fontSize: '0.85rem' },
    badge: { padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 500, textTransform: 'capitalize' },
    code: { background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.2rem 0.4rem', borderRadius: 4, fontSize: '0.75rem', fontFamily: 'monospace' },
    // Modal Styles
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: '#141414', padding: '1.5rem', borderRadius: 12, width: '90%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)' },
    modalTitle: { margin: '0 0 1.25rem', fontSize: '1.25rem', fontWeight: 500 },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' },
    formGroup: { marginBottom: '0.75rem' },
    formLabel: { display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' },
    input: { width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '0.6rem', color: '#fff', fontSize: '0.85rem' },
    buttonGroup: { display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' },
    btn: { padding: '0.6rem 1.25rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 },
    btnPrimary: { background: '#3b82f6', color: '#fff' },
    btnSecondary: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
    actionBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: 4, cursor: 'pointer', fontSize: '0.75rem' },
};
