import React from 'react';

export default function Input({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    disabled,
    required,
    autoComplete,
    showPasswordToggle,
    onTogglePassword,
    showPassword,
}) {
    const inputType = showPasswordToggle
        ? (showPassword ? 'text' : 'password')
        : type;

    return (
        <div className="form-group">
            {label && (
                <label className="form-label" htmlFor={name}>
                    {label}
                    {required && <span style={{ color: 'var(--text-error)' }}> *</span>}
                </label>
            )}
            <div className="input-wrapper">
                <input
                    id={name}
                    name={name}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    autoComplete={autoComplete}
                    className={`form-input ${error ? 'error' : ''}`}
                />
                {showPasswordToggle && (
                    <button
                        type="button"
                        className="input-toggle"
                        onClick={onTogglePassword}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {error && (
                <span className="form-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </span>
            )}
        </div>
    );
}
