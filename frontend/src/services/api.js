const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Health check endpoint
 */
export async function healthCheck() {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
}

/**
 * Login with employee ID and password
 * @param {string} employeeId - Employee ID (e.g., "OIADMI20260001")
 * @param {string} password - Password
 * @returns {Promise<{message: string, token: string, user: object}>}
 */
export async function login(employeeId, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Login failed');
    }

    return data;
}

/**
 * Change password for an employee
 * @param {string} employeeId - Employee ID
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<{message: string}>}
 */
export async function changePassword(employeeId, oldPassword, newPassword) {
    const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, oldPassword, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Password change failed');
    }

    return data;
}

/**
 * Create a new employee (Admin only)
 * @param {string} token - JWT auth token
 * @param {object} employeeData - Employee data
 * @param {string} employeeData.firstName
 * @param {string} employeeData.lastName
 * @param {string} employeeData.email
 * @param {string} employeeData.role - "employee" or "admin"
 * @returns {Promise<{employeeId: string, tempPassword: string, email: string, role: string}>}
 */
export async function createEmployee(token, employeeData) {
    const res = await fetch(`${API_BASE}/api/employees/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Employee creation failed');
    }

    return data;
}

/**
 * Get all employees (Admin only)
 * @param {string} token - JWT auth token
 * @returns {Promise<{employees: array}>}
 */
export async function getEmployees(token) {
    const res = await fetch(`${API_BASE}/api/employees`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch employees');
    }

    return data;
}

// ==================== LEAVE APIs ====================

export async function applyLeave(token, leaveData) {
    const res = await fetch(`${API_BASE}/api/leave/apply`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(leaveData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to apply leave');
    return data;
}

export async function getMyLeaves(token) {
    const res = await fetch(`${API_BASE}/api/leave/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch leaves');
    return data;
}

export async function getAllLeaves(token) {
    const res = await fetch(`${API_BASE}/api/leave/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch leaves');
    return data;
}

export async function updateLeaveStatus(token, leaveId, status, comments = '') {
    const res = await fetch(`${API_BASE}/api/leave/${leaveId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, comments }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update leave');
    return data;
}

// ==================== ATTENDANCE APIs ====================

export async function checkIn(token) {
    const res = await fetch(`${API_BASE}/api/attendance/checkin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to check in');
    return data;
}

export async function checkOut(token) {
    const res = await fetch(`${API_BASE}/api/attendance/checkout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to check out');
    return data;
}

export async function getMyAttendance(token) {
    const res = await fetch(`${API_BASE}/api/attendance/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch attendance');
    return data;
}

export async function getTodayAttendance(token) {
    const res = await fetch(`${API_BASE}/api/attendance/today`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch today attendance');
    return data;
}
