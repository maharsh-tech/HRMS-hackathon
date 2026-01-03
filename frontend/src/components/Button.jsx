import React from 'react';

export default function Button({
    children,
    type = 'button',
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    block = false,
    onClick,
    className = '',
    ...props
}) {
    const classes = [
        'btn',
        `btn-${variant}`,
        block && 'btn-block',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && <span className="spinner" />}
            {children}
        </button>
    );
}
