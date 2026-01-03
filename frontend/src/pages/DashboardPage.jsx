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
                            <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #8da249 0%, #6b8a35 100%)' }}><div><p style={styles.statNumber}>{stats.totalEmployees}</p><p style={styles.statLabel}>Total Employees</p></div></div>
                            <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #f89254 0%, #e67a3c 100%)' }}><div><p style={styles.statNumber}>{stats.admins}</p><p style={styles.statLabel}>Admins</p></div></div>
                            <div style={{ ...styles.statCard, background: 'linear-gradient(135deg, #2e434f 0%, #1f281a 100%)' }}><div><p style={styles.statNumber}>{stats.regularEmployees}</p><p style={styles.statLabel}>Employees</p></div></div>
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
    // Reusing existing styles + adding modal styles
    container: { display: 'flex', minHeight: '100vh', background: '#1f281a', color: '#fbe1b5' },
    sidebar: { width: 260, background: 'linear-gradient(180deg, #2e434f 0%, #1f281a 100%)', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(141, 162, 73, 0.2)' },
    logo: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' },
    logoIcon: { width: 40, height: 40, background: 'linear-gradient(135deg, #8da249 0%, #6b8a35 100%)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    logoText: { fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(135deg, #8da249 0%, #f89254 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    nav: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    navItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', borderRadius: 10, cursor: 'pointer', color: '#fbe1b5aa', transition: 'all 0.2s ease', fontSize: '0.9rem' },
    navItemActive: { background: 'linear-gradient(135deg, rgba(141, 162, 73, 0.2) 0%, rgba(248, 146, 84, 0.2) 100%)', color: '#8da249', borderLeft: '3px solid #8da249' },
    sidebarFooter: { marginTop: 'auto', borderTop: '1px solid rgba(141, 162, 73, 0.2)', paddingTop: '1rem' },
    main: { flex: 1, padding: '2rem', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    headerTitle: { fontSize: '2rem', fontWeight: 700, margin: 0 },
    headerSubtitle: { color: '#fbe1b5aa', margin: '0.25rem 0 0' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '1rem', background: '#2e434f', padding: '0.75rem 1.25rem', borderRadius: 50 },
    userAvatar: { width: 40, height: 40, background: 'linear-gradient(135deg, #8da249 0%, #f89254 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#1f281a' },
    userName: { margin: 0, fontWeight: 600, fontSize: '0.9rem' },
    userRole: { margin: 0, fontSize: '0.75rem', color: '#fbe1b5aa', textTransform: 'capitalize' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
    statCard: { padding: '1.5rem', borderRadius: 16, display: 'flex', alignItems: 'center', gap: '1rem' },
    statNumber: { fontSize: '2rem', fontWeight: 700, margin: 0 },
    statLabel: { margin: 0, opacity: 0.8 },
    tableCard: { background: '#2e434f', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(141, 162, 73, 0.2)' },
    tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    tableTitle: { margin: 0, fontSize: '1.25rem' },
    refreshBtn: { background: 'linear-gradient(135deg, #8da249 0%, #6b8a35 100%)', border: 'none', color: '#1f281a', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '1rem', color: '#fbe1b5aa', fontWeight: 500, fontSize: '0.875rem', borderBottom: '1px solid rgba(141, 162, 73, 0.2)' },
    tr: { borderBottom: '1px solid rgba(141, 162, 73, 0.1)' },
    td: { padding: '1rem', fontSize: '0.9rem' },
    badge: { padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 500, textTransform: 'capitalize' },
    code: { background: 'rgba(141, 162, 73, 0.2)', color: '#8da249', padding: '0.25rem 0.5rem', borderRadius: 4, fontSize: '0.8rem' },
    // Modal Styles
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: '#2e434f', padding: '2rem', borderRadius: 16, width: '90%', maxWidth: '600px', border: '1px solid rgba(141, 162, 73, 0.3)' },
    modalTitle: { margin: '0 0 1.5rem', fontSize: '1.5rem' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' },
    formGroup: { marginBottom: '1rem' },
    formLabel: { display: 'block', marginBottom: '0.5rem', color: '#fbe1b5aa', fontSize: '0.9rem' },
    input: { width: '100%', background: '#1f281a', border: '1px solid rgba(141, 162, 73, 0.3)', borderRadius: 8, padding: '0.75rem', color: '#fbe1b5', fontSize: '0.9rem' },
    buttonGroup: { display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' },
    btn: { padding: '0.75rem 1.5rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 },
    btnPrimary: { background: 'linear-gradient(135deg, #8da249 0%, #6b8a35 100%)', color: '#1f281a' },
    btnSecondary: { background: 'rgba(251, 225, 181, 0.2)', color: '#fbe1b5' },
    actionBtn: { background: 'rgba(248, 146, 84, 0.2)', border: 'none', color: '#f89254', padding: '0.25rem 0.75rem', borderRadius: 4, cursor: 'pointer' },
};
