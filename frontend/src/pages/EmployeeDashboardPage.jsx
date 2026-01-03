import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    applyLeave, getMyLeaves, getMyAttendance, getTodayAttendance, 
    checkIn, checkOut, getProfile, updateProfile, uploadImageToImgBB 
} from '../services/api';

export default function EmployeeDashboardPage() {
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [myLeaves, setMyLeaves] = useState([]);
    const [myAttendance, setMyAttendance] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({});
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // Leave form state
    const [leaveForm, setLeaveForm] = useState({
        type: 'Paid Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [leavesData, attendanceData, todayData, profileData] = await Promise.all([
                getMyLeaves(token),
                getMyAttendance(token),
                getTodayAttendance(token),
                getProfile(token)
            ]);
            setMyLeaves(leavesData.leaves || []);
            setMyAttendance(attendanceData.attendance || []);
            setTodayAttendance(todayData.attendance);
            setProfile(profileData.profile);
            setProfileForm(profileData.profile);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await applyLeave(token, leaveForm);
            setMessage({ text: 'Leave request submitted successfully!', type: 'success' });
            setLeaveForm({ type: 'Paid Leave', startDate: '', endDate: '', reason: '' });
            const leavesData = await getMyLeaves(token);
            setMyLeaves(leavesData.leaves || []);
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        try {
            await checkIn(token);
            setMessage({ text: 'Checked in successfully!', type: 'success' });
            const todayData = await getTodayAttendance(token);
            setTodayAttendance(todayData.attendance);
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    const handleCheckOut = async () => {
        try {
            await checkOut(token);
            setMessage({ text: 'Checked out successfully!', type: 'success' });
            const todayData = await getTodayAttendance(token);
            setTodayAttendance(todayData.attendance);
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updated = await updateProfile(token, profileForm);
            setProfile(updated.profile);
            setIsEditingProfile(false);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadingPhoto(true);
            try {
                const url = await uploadImageToImgBB(file);
                setProfileForm(prev => ({ ...prev, photo: url }));
                // Immediate update or let them save? Let's just update form for now
            } catch (error) {
                setMessage({ text: 'Failed to upload image: ' + error.message, type: 'error' });
            } finally {
                setUploadingPhoto(false);
            }
        }
    };

    const handleEmergencyContactChange = (field, value) => {
        setProfileForm({
            ...profileForm,
            emergencyContact: {
                ...profileForm.emergencyContact,
                [field]: value
            }
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': case 'Present': return { bg: '#38ef7d20', color: '#38ef7d' };
            case 'Rejected': case 'Absent': return { bg: '#f5576c20', color: '#f5576c' };
            case 'Pending': case 'Half-day': return { bg: '#ffb34720', color: '#ffb347' };
            default: return { bg: '#667eea20', color: '#667eea' };
        }
    };

    const getInitials = () => {
        if (!user) return 'U';
        return ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() || 'U';
    };

    // Calculate Monthly Report logic
    const getMonthlyReport = () => {
        const report = {};
        myAttendance.forEach(att => {
            const date = new Date(att.date);
            const key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
            if (!report[key]) {
                report[key] = { Present: 0, Absent: 0, Late: 0, 'Half-day': 0, total: 0, records: [] };
            }
            report[key].records.push(att);
            report[key].total++;
            if (report[key][att.status] !== undefined) {
                report[key][att.status]++;
            } else {
                // If status is not explicitly tracked above, maybe map it?
                // Assuming status is one of Present, Absent, Half-day
                if (att.status === 'Present') report[key].Present++;
                else if (att.status === 'Absent') report[key].Absent++;
                else if (att.status === 'Half-day') report[key]['Half-day']++;
            }
        });
        return report;
    };

    const monthlyReport = getMonthlyReport();

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
                    <div style={{...styles.navItem, ...(activeTab === 'overview' ? styles.navItemActive : {})}} onClick={() => setActiveTab('overview')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                        <span>Overview</span>
                    </div>
                    <div style={{...styles.navItem, ...(activeTab === 'profile' ? styles.navItemActive : {})}} onClick={() => setActiveTab('profile')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        <span>My Profile</span>
                    </div>
                    <div style={{...styles.navItem, ...(activeTab === 'attendance' ? styles.navItemActive : {})}} onClick={() => setActiveTab('attendance')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        <span>My Attendance</span>
                    </div>
                    <div style={{...styles.navItem, ...(activeTab === 'report' ? styles.navItemActive : {})}} onClick={() => setActiveTab('report')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                        <span>Monthly Report</span>
                    </div>
                    <div style={{...styles.navItem, ...(activeTab === 'leave' ? styles.navItemActive : {})}} onClick={() => setActiveTab('leave')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                        <span>Apply Leave</span>
                    </div>
                    <Link to="/change-password" style={{...styles.navItem, textDecoration: 'none'}}>
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
                {message.text && (
                    <div style={{
                        ...styles.message,
                        background: message.type === 'success' ? '#38ef7d20' : '#f5576c20',
                        color: message.type === 'success' ? '#38ef7d' : '#f5576c',
                        borderLeft: `4px solid ${message.type === 'success' ? '#38ef7d' : '#f5576c'}`
                    }}>
                        {message.text}
                        <button onClick={() => setMessage({ text: '', type: '' })} style={styles.closeBtn}>×</button>
                    </div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        <header style={styles.header}>
                            <div>
                                <h1 style={styles.headerTitle}>Welcome, {user?.firstName}!</h1>
                                <p style={styles.headerSubtitle}>Employee ID: {user?.employeeId}</p>
                            </div>
                            <div style={styles.userInfo}>
                                {profile?.photo ? (
                                    <img src={profile.photo} alt="Profile" style={{...styles.userAvatar, objectFit: 'cover'}} />
                                ) : (
                                    <div style={styles.userAvatar}>{getInitials()}</div>
                                )}
                            </div>
                        </header>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Today's Status</h3>
                            <div style={styles.attendanceActions}>
                                <div style={styles.attendanceInfo}>
                                    <div><span style={styles.label}>Check In:</span><span style={styles.value}>{todayAttendance?.checkIn || '--:--'}</span></div>
                                    <div><span style={styles.label}>Check Out:</span><span style={styles.value}>{todayAttendance?.checkOut || '--:--'}</span></div>
                                    <div>
                                        <span style={styles.label}>Status:</span>
                                        <span style={{...styles.badge, ...getStatusStyle(todayAttendance?.status || 'Not Marked')}}>
                                            {todayAttendance?.status || 'Not Marked'}
                                        </span>
                                    </div>
                                </div>
                                <div style={styles.buttons}>
                                    <button style={{...styles.btn, ...styles.btnPrimary}} onClick={handleCheckIn} disabled={todayAttendance?.checkIn}>Check In</button>
                                    <button style={{...styles.btn, ...styles.btnSecondary}} onClick={handleCheckOut} disabled={!todayAttendance?.checkIn || todayAttendance?.checkOut}>Check Out</button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Feed */}
                        <div style={styles.card}>
                        
                            <h3 style={styles.cardTitle}>Recent Activity</h3>
                            <div style={styles.activityFeed}>
                                {myAttendance.slice(0, 3).map(att => (
                                    <div key={'att'+att._id} style={styles.activityItem}>
                                        <div style={{...styles.activityIcon, background: '#38ef7d20', color: '#38ef7d'}}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                                        </div>
                                        <div>
                                            <p style={styles.activityText}>Marked attendance as <strong>{att.status}</strong></p>
                                            <p style={styles.activityTime}>{new Date(att.date).toLocaleDateString()} at {att.checkIn || 'N/A'}</p>
                                        </div>
                                    </div>
                                ))}
                                {myLeaves.slice(0, 2).map(leave => (
                                    <div key={'leave'+leave._id} style={styles.activityItem}>
                                        <div style={{...styles.activityIcon, background: '#ffb34720', color: '#ffb347'}}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                                        </div>
                                        <div>
                                            <p style={styles.activityText}>Applied for <strong>{leave.type}</strong> ({leave.days} days)</p>
                                            <p style={styles.activityTime}>Status: <span style={{color: getStatusStyle(leave.status).color}}>{leave.status}</span> • {new Date(leave.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {myAttendance.length === 0 && myLeaves.length === 0 && (
                                    <p style={{color: '#a0a0b0', fontSize: '0.9rem', textAlign: 'center', padding: '1rem'}}>No recent activity.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <>
                        <header style={styles.header}>
                            <div><h1 style={styles.headerTitle}>My Profile</h1><p style={styles.headerSubtitle}>Personal & Job Details</p></div>
                            {!isEditingProfile && <button style={{...styles.btn, ...styles.btnPrimary}} onClick={() => setIsEditingProfile(true)}>Edit Personal Info</button>}
                        </header>

                        <div style={styles.card}>
                            {isEditingProfile ? (
                                <form onSubmit={handleProfileUpdate}>
                                    <div style={styles.profileHeader}>
                                        <div style={styles.photoUpload}>
                                            {profileForm.photo ? <img src={profileForm.photo} style={styles.photoPreview} /> : <div style={styles.photoPlaceholder}>{getInitials()}</div>}
                                            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{marginTop: '0.5rem'}} />
                                            {uploadingPhoto && <span style={{fontSize: '0.8rem', color: '#667eea'}}>Uploading...</span>}
                                        </div>
                                    </div>

                                    <h3 style={styles.sectionTitle}>Personal Information</h3>
                                    <div style={styles.formGrid}>
                                        <div style={styles.formGroup}><label style={styles.formLabel}>Phone</label><input type="tel" style={styles.input} value={profileForm.phone || ''} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} /></div>
                                        <div style={styles.formGroup}><label style={styles.formLabel}>DOB</label><input type="date" style={styles.input} value={profileForm.dateOfBirth?.split('T')[0] || ''} onChange={e => setProfileForm({...profileForm, dateOfBirth: e.target.value})} /></div>
                                        <div style={styles.formGroup}><label style={styles.formLabel}>Gender</label><select style={styles.input} value={profileForm.gender || ''} onChange={e => setProfileForm({...profileForm, gender: e.target.value})}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                                    </div>

                                    <h3 style={styles.sectionTitle}>Address</h3>
                                    <div style={styles.formGrid}>
                                        <div style={styles.formGroup}><label style={styles.formLabel}>Address</label><input type="text" style={styles.input} value={profileForm.address || ''} onChange={e => setProfileForm({...profileForm, address: e.target.value})} /></div>
                                        <div style={styles.formGroup}><label style={styles.formLabel}>City</label><input type="text" style={styles.input} value={profileForm.city || ''} onChange={e => setProfileForm({...profileForm, city: e.target.value})} /></div>
                                    </div>

                                    <div style={styles.buttonGroup}>
                                        <button type="button" style={{...styles.btn, ...styles.btnSecondary}} onClick={() => setIsEditingProfile(false)}>Cancel</button>
                                        <button type="submit" style={{...styles.btn, ...styles.btnPrimary}} disabled={loading || uploadingPhoto}>{loading ? 'Saving...' : 'Save Changes'}</button>
                                    </div>
                                </form>
                            ) : (
                                <div style={styles.profileView}>
                                    <div style={styles.profileHeader}>
                                        {profile?.photo ? <img src={profile.photo} style={styles.photoPreview} /> : <div style={styles.photoPlaceholder}>{getInitials()}</div>}
                                        <div style={styles.profileName}>
                                            <h2>{user?.firstName} {user?.lastName}</h2>
                                            <p>{profile?.jobDetails?.designation || 'Designation Not Set'} • {profile?.jobDetails?.department || 'Department Not Set'}</p>
                                        </div>
                                    </div>

                                    <h3 style={styles.sectionTitle}>Job Details</h3>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Role</span><span style={styles.infoValue}>{user?.role}</span></div>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Emp ID</span><span style={styles.infoValue}>{user?.employeeId}</span></div>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Joining Date</span><span style={styles.infoValue}>{new Date(user?.joiningDate).toLocaleDateString()}</span></div>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Employment Type</span><span style={styles.infoValue}>{profile?.jobDetails?.employmentType || 'N/A'}</span></div>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Work Location</span><span style={styles.infoValue}>{profile?.jobDetails?.workLocation || 'N/A'}</span></div>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Manager</span><span style={styles.infoValue}>{profile?.jobDetails?.manager || 'N/A'}</span></div>
                                    </div>

                                    <h3 style={styles.sectionTitle}>Salary Details</h3>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Basic Salary</span><span style={styles.infoValue}>${profile?.salaryDetails?.basicSalary?.toLocaleString() || '0'}</span></div>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>HRA</span><span style={styles.infoValue}>${profile?.salaryDetails?.hra?.toLocaleString() || '0'}</span></div>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Allowances</span><span style={styles.infoValue}>${profile?.salaryDetails?.allowances?.toLocaleString() || '0'}</span></div>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Deductions</span><span style={{...styles.infoValue, color: '#f5576c'}}>-${profile?.salaryDetails?.deductions?.toLocaleString() || '0'}</span></div>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Net Salary</span><span style={{...styles.infoValue, color: '#38ef7d', fontSize: '1.2rem'}}>${profile?.salaryDetails?.netSalary?.toLocaleString() || '0'}</span></div>
                                    </div>
                                    <div style={{marginTop: '1rem', padding: '1rem', background: '#ffffff05', borderRadius: 8}}>
                                        <h4 style={{margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#a0a0b0'}}>Bank Account Details</h4>
                                        <div style={{display: 'flex', gap: '2rem'}}>
                                            <div><span style={styles.infoLabel}>Bank: </span><span style={{fontWeight: 500}}>{profile?.salaryDetails?.bankAccount?.bankName || 'N/A'}</span></div>
                                            <div><span style={styles.infoLabel}>Account: </span><span style={{fontWeight: 500}}>{profile?.salaryDetails?.bankAccount?.accountNumber || 'N/A'}</span></div>
                                        </div>
                                    </div>

                                    <h3 style={styles.sectionTitle}>Personal Details</h3>
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Mobile</span><span style={styles.infoValue}>{profile?.phone || 'N/A'}</span></div>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Email</span><span style={styles.infoValue}>{user?.email}</span></div>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>DOB</span><span style={styles.infoValue}>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</span></div>
                                        <div style={styles.infoItem}><span style={styles.infoLabel}>Address</span><span style={styles.infoValue}>{profile?.address || 'N/A'}, {profile?.city}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Monthly Report Tab */}
                {activeTab === 'report' && (
                    <>
                        <header style={styles.header}>
                            <h1 style={styles.headerTitle}>Monthly Attendance Report</h1>
                        </header>
                        {Object.keys(monthlyReport).length === 0 ? <div style={styles.card}><p style={styles.empty}>No attendance data available.</p></div> : (
                            Object.entries(monthlyReport).map(([month, data]) => (
                                <div key={month} style={styles.card}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                                        <h3 style={styles.cardTitle}>{month}</h3>
                                        <div style={{display: 'flex', gap: '1rem'}}>
                                            <span style={{...styles.badge, background: '#38ef7d20', color: '#38ef7d'}}>Present: {data.Present}</span>
                                            <span style={{...styles.badge, background: '#f5576c20', color: '#f5576c'}}>Absent: {data.Absent}</span>
                                        </div>
                                    </div>
                                    <div style={styles.tableWrapper}>
                                        <table style={styles.table}>
                                            <thead><tr><th style={styles.th}>Date</th><th style={styles.th}>Check In</th><th style={styles.th}>Check Out</th><th style={styles.th}>Status</th></tr></thead>
                                            <tbody>
                                                {data.records.map(att => (
                                                    <tr key={att._id} style={styles.tr}>
                                                        <td style={styles.td}>{new Date(att.date).toLocaleDateString()}</td>
                                                        <td style={styles.td}>{att.checkIn || '--:--'}</td>
                                                        <td style={styles.td}>{att.checkOut || '--:--'}</td>
                                                        <td style={styles.td}><span style={{...styles.badge, ...getStatusStyle(att.status)}}>{att.status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}

                {/* Attendance Tab */}
                {activeTab === 'attendance' && (
                    <>
                        <header style={styles.header}><h1 style={styles.headerTitle}>All Attendance</h1></header>
                        <div style={styles.card}>
                            {myAttendance.length === 0 ? <p style={styles.empty}>No records.</p> : (
                                <div style={styles.tableWrapper}>
                                    <table style={styles.table}>
                                        <thead><tr><th style={styles.th}>Date</th><th style={styles.th}>In</th><th style={styles.th}>Out</th><th style={styles.th}>Status</th></tr></thead>
                                        <tbody>
                                            {myAttendance.map(att => (
                                                <tr key={att._id} style={styles.tr}>
                                                    <td style={styles.td}>{new Date(att.date).toLocaleDateString()}</td>
                                                    <td style={styles.td}>{att.checkIn || '-'}</td>
                                                    <td style={styles.td}>{att.checkOut || '-'}</td>
                                                    <td style={styles.td}><span style={{...styles.badge, ...getStatusStyle(att.status)}}>{att.status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Leave Tab */}
                {activeTab === 'leave' && (
                    <>
                        <header style={styles.header}><h1 style={styles.headerTitle}>Apply for Leave</h1></header>
                        <div style={styles.card}>
                            <form onSubmit={handleApplyLeave}>
                                <div style={styles.formGrid}>
                                    <div style={styles.formGroup}><label style={styles.formLabel}>Type</label><select style={styles.input} value={leaveForm.type} onChange={e => setLeaveForm({...leaveForm, type: e.target.value})}><option>Paid Leave</option><option>Sick Leave</option><option>Unpaid Leave</option></select></div>
                                    <div style={styles.formGroup}><label style={styles.formLabel}>Start</label><input type="date" style={styles.input} value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} required /></div>
                                    <div style={styles.formGroup}><label style={styles.formLabel}>End</label><input type="date" style={styles.input} value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} required /></div>
                                </div>
                                <div style={styles.formGroup}><label style={styles.formLabel}>Reason</label><textarea style={{...styles.input, minHeight: 100}} value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} required /></div>
                                <button type="submit" style={{...styles.btn, ...styles.btnPrimary}} disabled={loading}>Submit Request</button>
                            </form>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

const styles = {
    container: { display: 'flex', minHeight: '100vh', background: '#0f0f23', color: '#fff' },
    sidebar: { width: 260, background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid #ffffff10' },
    logo: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' },
    logoIcon: { width: 40, height: 40, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    logoText: { fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    nav: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    navItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', borderRadius: 10, cursor: 'pointer', color: '#a0a0b0', transition: 'all 0.2s ease', fontSize: '0.9rem' },
    navItemActive: { background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)', color: '#667eea', borderLeft: '3px solid #667eea' },
    sidebarFooter: { marginTop: 'auto', borderTop: '1px solid #ffffff10', paddingTop: '1rem' },
    main: { flex: 1, padding: '2rem', overflowY: 'auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
    headerTitle: { fontSize: '2rem', fontWeight: 700, margin: 0 },
    headerSubtitle: { color: '#a0a0b0', margin: '0.25rem 0 0' },
    userInfo: { display: 'flex', alignItems: 'center' },
    userAvatar: { width: 48, height: 48, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, overflow: 'hidden' },
    card: { background: '#1a1a2e', borderRadius: 16, padding: '1.5rem', border: '1px solid #ffffff10', marginBottom: '1.5rem' },
    cardTitle: { margin: '0 0 1rem', fontSize: '1.25rem' },
    message: { padding: '1rem', borderRadius: 8, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeBtn: { background: 'none', border: 'none', color: 'inherit', fontSize: '1.25rem', cursor: 'pointer' },
    attendanceActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
    attendanceInfo: { display: 'flex', gap: '2rem' },
    label: { color: '#a0a0b0', marginRight: '0.5rem' },
    value: { fontWeight: 600, fontSize: '1.1rem' },
    buttons: { display: 'flex', gap: '1rem' },
    btn: { padding: '0.75rem 1.5rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 },
    btnPrimary: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' },
    btnSecondary: { background: '#ffffff20', color: '#fff' },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '1rem', color: '#a0a0b0', fontWeight: 500, fontSize: '0.875rem', borderBottom: '1px solid #ffffff10' },
    tr: { borderBottom: '1px solid #ffffff08' },
    td: { padding: '1rem', fontSize: '0.9rem' },
    badge: { padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 500 },
    empty: { textAlign: 'center', color: '#a0a0b0', padding: '2rem' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
    formGroup: { marginBottom: '1rem' },
    formLabel: { display: 'block', marginBottom: '0.5rem', color: '#a0a0b0', fontSize: '0.9rem' },
    input: { width: '100%', background: '#0f0f23', border: '1px solid #ffffff20', borderRadius: 8, padding: '0.75rem', color: '#fff', fontSize: '0.9rem' },
    sectionTitle: { fontSize: '1.1rem', margin: '1.5rem 0 1rem', color: '#667eea' },
    profileHeader: { display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' },
    photoUpload: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
    photoPreview: { width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid #667eea' },
    photoPlaceholder: { width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700 },
    profileName: { flex: 1 },
    infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' },
    infoItem: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
    infoLabel: { fontSize: '0.8rem', color: '#a0a0b0' },
    infoValue: { fontSize: '1rem', fontWeight: 500 },
    buttonGroup: { display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' },
};
