import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword as changePasswordApi } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.oldPassword) {
            errors.oldPassword = 'Current password is required';
        }

        if (!formData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
            errors.newPassword = 'Password must include uppercase, lowercase, and number';
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
            errors.newPassword = 'New password must be different from current password';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await changePasswordApi(
                user.employeeId,
                formData.oldPassword,
                formData.newPassword
            );

            // Update user to remove mustChangePassword flag
            if (user.mustChangePassword) {
                updateUser({ ...user, mustChangePassword: false });
            }

            setSuccess(true);

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card glass-card">
                    <div className="auth-header">
                        <div className="modal-icon success">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20,6 9,17 4,12" />
                            </svg>
                        </div>
                        <h1 className="auth-title">Password Changed!</h1>
                        <p className="auth-subtitle">Your password has been updated successfully.</p>
                        <p className="auth-subtitle" style={{ marginTop: '1rem' }}>
                            Redirecting to dashboard...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h1 className="auth-title">Change Password</h1>
                    <p className="auth-subtitle">
                        {user?.mustChangePassword
                            ? 'You must change your temporary password to continue.'
                            : 'Update your account password.'
                        }
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="alert alert-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <Input
                        label="Current Password"
                        name="oldPassword"
                        type="password"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        placeholder="Enter your current password"
                        error={fieldErrors.oldPassword}
                        required
                        autoComplete="current-password"
                        showPasswordToggle
                        showPassword={showPasswords.old}
                        onTogglePassword={() => togglePasswordVisibility('old')}
                    />

                    <Input
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter your new password"
                        error={fieldErrors.newPassword}
                        required
                        autoComplete="new-password"
                        showPasswordToggle
                        showPassword={showPasswords.new}
                        onTogglePassword={() => togglePasswordVisibility('new')}
                    />

                    <Input
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your new password"
                        error={fieldErrors.confirmPassword}
                        required
                        autoComplete="new-password"
                        showPasswordToggle
                        showPassword={showPasswords.confirm}
                        onTogglePassword={() => togglePasswordVisibility('confirm')}
                    />

                    <div className="alert alert-info" style={{ marginTop: '0.5rem' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        Password must be at least 8 characters with uppercase, lowercase, and a number.
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        block
                        loading={loading}
                    >
                        {loading ? 'Updating...' : 'Change Password'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
