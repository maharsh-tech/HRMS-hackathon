import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmployees, updateEmployee, addEmployeeDocument, deleteEmployeeDocument, uploadImageToImgBB } from '../services/api';
import SalaryCalculator from '../components/SalaryCalculator';

export default function EmployeeEditPage() {
    const { id } = useParams();
    const { user, isAdmin, logout, token } = useAuth();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form states
    const [personalInfo, setPersonalInfo] = useState({});
    const [jobDetails, setJobDetails] = useState({});
    const [salaryDetails, setSalaryDetails] = useState({});

    // Documents state
    const [documents, setDocuments] = useState([]);
    const [docForm, setDocForm] = useState({ name: '', type: 'Other' });
    const [uploadingDoc, setUploadingDoc] = useState(false);

    useEffect(() => {
        if (token && id) {
            fetchEmployee();
        }
    }, [token, id]);

    const fetchEmployee = async () => {
        setLoading(true);
        try {
            const data = await getEmployees(token);
            const emp = data.employees?.find(e => e._id === id);
            if (emp) {
                setEmployee(emp);
                setPersonalInfo({
                    firstName: emp.firstName || '',
                    lastName: emp.lastName || '',
                    email: emp.email || '',
                    phone: emp.phone || '',
                    address: emp.address || '',
                    city: emp.city || '',
                    dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
                    gender: emp.gender || '',
                });
                setJobDetails({
                    designation: emp.jobDetails?.designation || '',
                    department: emp.jobDetails?.department || '',
                    employmentType: emp.jobDetails?.employmentType || 'Full-time',
                    workLocation: emp.jobDetails?.workLocation || 'Office',
                    manager: emp.jobDetails?.manager || '',
                });
                setSalaryDetails(emp.salaryDetails || {});
                setDocuments(emp.documents || []);
            }
        } catch (error) {
            console.error('Failed to fetch employee:', error);
            setMessage({ type: 'error', text: 'Failed to load employee data' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const updates = {
                ...personalInfo,
                jobDetails,
                salaryDetails,
            };

            await updateEmployee(token, id, updates);
            setMessage({ type: 'success', text: 'Employee updated successfully!' });
        } catch (error) {
            console.error('Save error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to save changes' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const handleSalaryChange = (calculatedSalary) => {
        setSalaryDetails(prev => ({
            ...prev,
            ...calculatedSalary,
            wageType: 'Fixed',
        }));
    };

    const handleDocUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !docForm.name.trim()) {
            setMessage({ type: 'error', text: 'Please enter document name and select a file' });
            return;
        }

        setUploadingDoc(true);
        try {
            // Upload file to ImgBB
            const url = await uploadImageToImgBB(file);

            // Add document to employee
            const result = await addEmployeeDocument(token, id, {
                name: docForm.name,
                type: docForm.type,
                url
            });

            setDocuments(prev => [...prev, result.document]);
            setDocForm({ name: '', type: 'Other' });
            setMessage({ type: 'success', text: 'Document uploaded successfully!' });
            e.target.value = '';
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to upload document' });
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleDeleteDoc = async (docId) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            await deleteEmployeeDocument(token, id, docId);
            setDocuments(prev => prev.filter(d => d._id !== docId));
            setMessage({ type: 'success', text: 'Document deleted successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to delete document' });
        }
    };

    if (!isAdmin) {
        return (
            <div style={styles.accessDenied}>
                <h2>Access Denied</h2>
                <p>Only administrators can edit employee details.</p>
                <Link to="/dashboard" style={styles.backLink}>← Back to Dashboard</Link>
            </div>
        );
    }

    const tabs = [
        { id: 'personal', label: '👤 Personal Info', icon: '👤' },
        { id: 'job', label: '💼 Job Details', icon: '💼' },
        { id: 'salary', label: '💰 Salary Information', icon: '💰' },
        { id: 'documents', label: '📄 Documents', icon: '📄' },
    ];

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
                        <span>📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/employees" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <span>👥</span>
                        <span>Employees</span>
                    </Link>
                    <Link to="/admin/create-employee" style={{ ...styles.navItem, textDecoration: 'none' }}>
                        <span>➕</span>
                        <span>Add Employee</span>
                    </Link>
                </nav>

                <div style={styles.sidebarFooter}>
                    <div style={styles.navItem} onClick={handleLogout}>
                        <span>🚪</span>
                        <span>Logout</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={styles.main}>
                <header style={styles.header}>
                    <div>
                        <Link to="/employees" style={styles.backLink}>← Back to Employees</Link>
                        <h1 style={styles.headerTitle}>
                            Edit Employee
                        </h1>
                        {employee && (
                            <p style={styles.headerSubtitle}>
                                {employee.firstName} {employee.lastName} • {employee.employeeId}
                            </p>
                        )}
                    </div>
                    <button
                        style={styles.saveBtn}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? '💾 Saving...' : '💾 Save Changes'}
                    </button>
                </header>

                {message.text && (
                    <div style={{
                        ...styles.message,
                        background: message.type === 'error' ? '#f5576c20' : '#38ef7d20',
                        borderColor: message.type === 'error' ? '#f5576c' : '#38ef7d',
                        color: message.type === 'error' ? '#f5576c' : '#38ef7d',
                    }}>
                        {message.text}
                    </div>
                )}

                {loading ? (
                    <div style={styles.loading}>Loading employee data...</div>
                ) : !employee ? (
                    <div style={styles.error}>Employee not found</div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div style={styles.tabs}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    style={{
                                        ...styles.tab,
                                        ...(activeTab === tab.id ? styles.tabActive : {}),
                                    }}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div style={styles.tabContent}>
                            {activeTab === 'personal' && (
                                <div style={styles.formGrid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>First Name</label>
                                        <input
                                            type="text"
                                            value={personalInfo.firstName}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Last Name</label>
                                        <input
                                            type="text"
                                            value={personalInfo.lastName}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Email</label>
                                        <input
                                            type="email"
                                            value={personalInfo.email}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Phone</label>
                                        <input
                                            type="text"
                                            value={personalInfo.phone}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Date of Birth</label>
                                        <input
                                            type="date"
                                            value={personalInfo.dateOfBirth}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Gender</label>
                                        <select
                                            value={personalInfo.gender}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
                                            style={styles.input}
                                        >
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div style={{ ...styles.inputGroup, gridColumn: 'span 2' }}>
                                        <label style={styles.label}>Address</label>
                                        <input
                                            type="text"
                                            value={personalInfo.address}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>City</label>
                                        <input
                                            type="text"
                                            value={personalInfo.city}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                                            style={styles.input}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'job' && (
                                <div style={styles.formGrid}>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Designation</label>
                                        <input
                                            type="text"
                                            value={jobDetails.designation}
                                            onChange={(e) => setJobDetails({ ...jobDetails, designation: e.target.value })}
                                            style={styles.input}
                                            placeholder="e.g., Software Engineer"
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Department</label>
                                        <input
                                            type="text"
                                            value={jobDetails.department}
                                            onChange={(e) => setJobDetails({ ...jobDetails, department: e.target.value })}
                                            style={styles.input}
                                            placeholder="e.g., Engineering"
                                        />
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Employment Type</label>
                                        <select
                                            value={jobDetails.employmentType}
                                            onChange={(e) => setJobDetails({ ...jobDetails, employmentType: e.target.value })}
                                            style={styles.input}
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Work Location</label>
                                        <select
                                            value={jobDetails.workLocation}
                                            onChange={(e) => setJobDetails({ ...jobDetails, workLocation: e.target.value })}
                                            style={styles.input}
                                        >
                                            <option value="Office">Office</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Manager</label>
                                        <input
                                            type="text"
                                            value={jobDetails.manager}
                                            onChange={(e) => setJobDetails({ ...jobDetails, manager: e.target.value })}
                                            style={styles.input}
                                            placeholder="Manager name"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'salary' && (
                                <SalaryCalculator
                                    salaryDetails={salaryDetails}
                                    onChange={handleSalaryChange}
                                />
                            )}

                            {activeTab === 'documents' && (
                                <div>
                                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', color: '#667eea' }}>Upload New Document</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto', gap: '1rem', alignItems: 'end', marginBottom: '2rem' }}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Document Name *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Employment Contract"
                                                value={docForm.name}
                                                onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                                                style={styles.input}
                                            />
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Type</label>
                                            <select
                                                value={docForm.type}
                                                onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                                                style={styles.input}
                                            >
                                                <option value="Contract">Contract</option>
                                                <option value="Certificate">Certificate</option>
                                                <option value="ID">ID Proof</option>
                                                <option value="Resume">Resume</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={{ ...styles.label, visibility: 'hidden' }}>Upload</label>
                                            <label style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.75rem 1.25rem',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: '#fff',
                                                borderRadius: 8,
                                                cursor: uploadingDoc ? 'wait' : 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                opacity: uploadingDoc ? 0.7 : 1
                                            }}>
                                                {uploadingDoc ? '⏳ Uploading...' : '📎 Upload File'}
                                                <input
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    style={{ display: 'none' }}
                                                    onChange={handleDocUpload}
                                                    disabled={uploadingDoc || !docForm.name.trim()}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#667eea' }}>Uploaded Documents ({documents.length})</h3>
                                    {documents.length === 0 ? (
                                        <p style={{ color: '#a0a0b0', fontSize: '0.9rem' }}>No documents uploaded yet.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                            {documents.map(doc => (
                                                <div key={doc._id} style={{
                                                    background: '#0f0f23',
                                                    border: '1px solid #ffffff15',
                                                    borderRadius: 12,
                                                    padding: '1rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.75rem'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{
                                                            width: 44, height: 44,
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            borderRadius: 10,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}>
                                                            <span style={{ fontSize: '1.25rem' }}>📄</span>
                                                        </div>
                                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                                            <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#a0a0b0' }}>
                                                                {doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <a
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                flex: 1,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '0.5rem',
                                                                padding: '0.5rem',
                                                                background: '#667eea20',
                                                                color: '#667eea',
                                                                borderRadius: 6,
                                                                textDecoration: 'none',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            👁 View
                                                        </a>
                                                        <button
                                                            onClick={() => handleDeleteDoc(doc._id)}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                background: '#f5576c20',
                                                                color: '#f5576c',
                                                                border: 'none',
                                                                borderRadius: 6,
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            🗑 Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        background: '#0f0f23',
        color: '#fff',
    },
    sidebar: {
        width: 260,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #ffffff10',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '2rem',
    },
    logoIcon: {
        width: 40,
        height: 40,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: '1.25rem',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        borderRadius: 10,
        cursor: 'pointer',
        color: '#a0a0b0',
        transition: 'all 0.2s ease',
        fontSize: '0.9rem',
    },
    sidebarFooter: {
        marginTop: 'auto',
        borderTop: '1px solid #ffffff10',
        paddingTop: '1rem',
    },
    main: {
        flex: 1,
        padding: '2rem',
        overflowY: 'auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
    },
    headerTitle: {
        fontSize: '2rem',
        fontWeight: 700,
        margin: '0.5rem 0 0.25rem',
    },
    headerSubtitle: {
        color: '#a0a0b0',
        margin: 0,
    },
    backLink: {
        color: '#667eea',
        textDecoration: 'none',
        fontSize: '0.9rem',
    },
    saveBtn: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        color: '#fff',
        padding: '0.875rem 1.5rem',
        borderRadius: 10,
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: 600,
    },
    message: {
        padding: '1rem',
        borderRadius: 10,
        marginBottom: '1.5rem',
        border: '1px solid',
    },
    tabs: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #ffffff10',
        paddingBottom: '1rem',
    },
    tab: {
        background: '#1a1a2e',
        border: '1px solid #ffffff20',
        color: '#a0a0b0',
        padding: '0.75rem 1.25rem',
        borderRadius: 10,
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease',
    },
    tabActive: {
        background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
        borderColor: '#667eea',
        color: '#fff',
    },
    tabContent: {
        background: '#1a1a2e',
        borderRadius: 16,
        padding: '1.5rem',
        border: '1px solid #ffffff10',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1.25rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.85rem',
        color: '#a0a0b0',
        fontWeight: 500,
    },
    input: {
        background: '#0f0f23',
        border: '1px solid #ffffff20',
        borderRadius: 8,
        padding: '0.75rem 1rem',
        color: '#fff',
        fontSize: '0.95rem',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        color: '#a0a0b0',
    },
    error: {
        textAlign: 'center',
        padding: '3rem',
        color: '#f5576c',
    },
    accessDenied: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0f0f23',
        color: '#fff',
        textAlign: 'center',
    },
};
