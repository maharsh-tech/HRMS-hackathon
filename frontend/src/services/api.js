// Use VITE_API_BASE_URL if set (local dev), otherwise default to empty string (relative path for Vercel)
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
console.log('API Service Initialized with Base URL:', API_BASE || "Relative Path (Production)");

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

    let data;
    try {
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Login Non-JSON response:', text);
            // Show the first 100 chars of the response to help debug
            throw new Error(`Server error: ${text.substring(0, 100)}`);
        }
    } catch (e) {
        throw new Error(e.message);
    }

    if (!res.ok) {
        throw new Error(data.error || 'Login failed');
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

// ==================== PROFILE APIs ====================

export async function getProfile(token) {
    const res = await fetch(`${API_BASE}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
    return data;
}

export async function updateProfile(token, profileData) {
    const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
    });
    let data;
    try {
        const text = await res.text();
        data = JSON.parse(text);
    } catch (e) {
        console.error('Update Profile Non-JSON response:', e);
        throw new Error('Server returned non-JSON response');
    }

    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
}

export async function uploadImageToImgBB(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await fetch('https://api.imgbb.com/1/upload?key=9f36f6eb657e0040be10186ed9c73b74', {
        method: 'POST',
        body: formData
    });

    let data;
    try {
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('ImgBB Non-JSON response:', text);
            throw new Error('ImgBB returned non-JSON response: ' + text.substring(0, 50));
        }
    } catch (error) {
        throw new Error('Failed to parse ImgBB response');
    }

    if (!data.success) throw new Error('Image upload failed: ' + (data.error?.message || 'Unknown error'));
    return data.data.url;
}

export async function updateEmployee(token, id, data) {
    const res = await fetch(`${API_BASE}/api/admin/employees/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    let result;
    try {
        const text = await res.text();
        result = JSON.parse(text);
    } catch (e) {
        console.error('Update Employee Non-JSON response:', e);
        throw new Error('Server returned non-JSON response');
    }

    if (!res.ok) throw new Error(result.error || 'Failed to update employee');
    return result;
}
