import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createEmployee as createEmployeeApi } from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';

export default function CreateEmployeePage() {
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'employee',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [createdEmployee, setCreatedEmployee] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        } else if (formData.firstName.length < 2) {
            errors.firstName = 'First name must be at least 2 characters';
        }

        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
            errors.lastName = 'Last name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address';
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
            const response = await createEmployeeApi(token, {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                role: formData.role,
            });

            setCreatedEmployee(response);
        } catch (err) {
            setError(err.message || 'Failed to create employee. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAnother = () => {
        setCreatedEmployee(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            role: 'employee',
        });
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Success Modal
    if (createdEmployee) {
        return (
            <div className="modal-overlay">
                <div className="modal-content glass-card">
                    <div className="modal-header">
                        <div className="modal-icon success">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                        </div>
                        <h2 className="modal-title">Employee Created!</h2>
                        <p className="modal-subtitle">Share these credentials with the new employee</p>
                    </div>

                    <div className="modal-body">
                        <div className="credential-box">
                            <div className="credential-label">Employee ID</div>
                            <div className="credential-value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {createdEmployee.employeeId}
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => copyToClipboard(createdEmployee.employeeId)}
                                    style={{ padding: '0.25rem 0.5rem' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="credential-box">
                            <div className="credential-label">Temporary Password</div>
                            <div className="credential-value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {createdEmployee.tempPassword}
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => copyToClipboard(createdEmployee.tempPassword)}
                                    style={{ padding: '0.25rem 0.5rem' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="credential-box">
                            <div className="credential-label">Email</div>
                            <div className="credential-value">{createdEmployee.email}</div>
                        </div>

                        <div className="credential-box">
                            <div className="credential-label">Role</div>
                            <div className="credential-value" style={{ textTransform: 'capitalize' }}>{createdEmployee.role}</div>
                        </div>

                        <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            The employee will be prompted to change their password on first login.
                        </div>
                    </div>

                    <div className="modal-footer">
                        <Button variant="primary" block onClick={handleCreateAnother}>
                            Create Another Employee
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card glass-card" style={{ maxWidth: '500px' }}>
                <div className="auth-header">
                    <div className="auth-logo">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                    </div>
                    <h1 className="auth-title">Create Employee</h1>
                    <p className="auth-subtitle">Add a new employee to the system</p>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="John"
                            error={fieldErrors.firstName}
                            required
                        />

                        <Input
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Doe"
                            error={fieldErrors.lastName}
                            required
                        />
                    </div>

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john.doe@company.com"
                        error={fieldErrors.email}
                        required
                    />

                    <div className="form-group">
                        <label className="form-label" htmlFor="role">
                            Role <span style={{ color: 'var(--text-error)' }}>*</span>
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        block
                        loading={loading}
                    >
                        {loading ? 'Creating...' : 'Create Employee'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
