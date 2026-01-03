// Local Development Server
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
const Leave = require('./models/Leave');
const Attendance = require('./models/Attendance');
const { generateEmployeeId, generateTempPassword } = require('./utils/generateId');
const { generateToken, authMiddleware, adminOnly } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Create Employee (Admin only - protected route)
app.post('/api/employees/create', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { firstName, lastName, email, role } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email) {
            return res.status(400).json({ error: 'firstName, lastName, and email are required' });
        }

        // Validate role
        if (role && !['employee', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Role must be employee or admin' });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Generate employee ID and temp password
        const employeeId = await generateEmployeeId(firstName, lastName);
        const tempPassword = generateTempPassword();

        // Create new user
        const user = new User({
            employeeId,
            email,
            password: tempPassword,
            firstName,
            lastName,
            role: role || 'employee',
            mustChangePassword: true,
            joiningDate: new Date()
        });

        await user.save();

        res.status(201).json({
            message: 'Employee created successfully',
            employeeId: user.employeeId,
            tempPassword: tempPassword,  // Return plain password (only this once!)
            email: user.email,
            role: user.role
        });

    } catch (error) {
        console.error('Create employee error:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Get All Employees (Admin only)
app.get('/api/employees', authMiddleware, adminOnly, async (req, res) => {
    try {
        const employees = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ employees });
    } catch (error) {
        console.error('Get employees error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { employeeId, password } = req.body;

        if (!employeeId || !password) {
            return res.status(400).json({ error: 'Email/Employee ID and password are required' });
        }

        const identifier = employeeId.trim();
        console.log('--- LOGIN ATTEMPT ---');
        console.log('Input:', identifier);
        console.log('Password provided:', password ? 'YES' : 'NO');

        // Find user by employeeId OR email
        const user = await User.findOne({
            $or: [
                { employeeId: identifier },
                { email: identifier.toLowerCase() }
            ]
        });

        console.log('User found:', user ? 'YES' : 'NO');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        console.log('User Role:', user.role);
        console.log('Stored Email:', user.email);
        console.log('Stored ID:', user.employeeId);

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                employeeId: user.employeeId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                mustChangePassword: user.mustChangePassword
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Change Password endpoint
app.post('/api/auth/change-password', async (req, res) => {
    try {
        const { employeeId, oldPassword, newPassword } = req.body;

        if (!employeeId || !oldPassword || !newPassword) {
            return res.status(400).json({ error: 'employeeId, oldPassword, and newPassword are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Find user
        const user = await User.findOne({ employeeId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify old password
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        user.mustChangePassword = false;
        await user.save();

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// ==================== LEAVE MANAGEMENT ====================

// Apply for Leave (Employee)
app.post('/api/leave/apply', authMiddleware, async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;

        if (!type || !startDate || !endDate || !reason) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const leave = new Leave({
            employeeId: req.user._id,
            employeeCode: req.user.employeeId,
            type,
            startDate: start,
            endDate: end,
            days,
            reason,
            status: 'Pending'
        });

        await leave.save();

        res.status(201).json({
            message: 'Leave request submitted successfully',
            leave
        });

    } catch (error) {
        console.error('Apply leave error:', error.message);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Get My Leave Requests (Employee)
app.get('/api/leave/my', authMiddleware, async (req, res) => {
    try {
        const leaves = await Leave.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
        res.json({ leaves });
    } catch (error) {
        console.error('Get my leaves error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Leave Requests (Admin)
app.get('/api/leave/all', authMiddleware, adminOnly, async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('employeeId', 'firstName lastName email employeeId')
            .sort({ createdAt: -1 });
        res.json({ leaves });
    } catch (error) {
        console.error('Get all leaves error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Approve/Reject Leave (Admin)
app.put('/api/leave/:id/status', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { status, comments } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            {
                status,
                comments,
                approvedBy: req.user._id,
                approvedAt: new Date()
            },
            { new: true }
        );

        if (!leave) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        res.json({ message: `Leave ${status.toLowerCase()}`, leave });

    } catch (error) {
        console.error('Update leave status error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== ATTENDANCE ====================

// Check In (Employee)
app.post('/api/attendance/checkin', authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            employeeId: req.user._id,
            date: today
        });

        if (attendance && attendance.checkIn) {
            return res.status(400).json({ error: 'Already checked in today' });
        }

        const now = new Date();
        const checkInTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        if (!attendance) {
            attendance = new Attendance({
                employeeId: req.user._id,
                employeeCode: req.user.employeeId,
                date: today,
                checkIn: checkInTime,
                status: 'Present'
            });
        } else {
            attendance.checkIn = checkInTime;
            attendance.status = 'Present';
        }

        await attendance.save();

        res.json({ message: 'Checked in successfully', attendance });

    } catch (error) {
        console.error('Check in error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Check Out (Employee)
app.post('/api/attendance/checkout', authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employeeId: req.user._id,
            date: today
        });

        if (!attendance || !attendance.checkIn) {
            return res.status(400).json({ error: 'Please check in first' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ error: 'Already checked out today' });
        }

        const now = new Date();
        attendance.checkOut = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        await attendance.save();

        res.json({ message: 'Checked out successfully', attendance });

    } catch (error) {
        console.error('Check out error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get My Attendance (Employee)
app.get('/api/attendance/my', authMiddleware, async (req, res) => {
    try {
        const attendance = await Attendance.find({ employeeId: req.user._id })
            .sort({ date: -1 })
            .limit(30);
        res.json({ attendance });
    } catch (error) {
        console.error('Get my attendance error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Today's Attendance Status (Employee)
app.get('/api/attendance/today', authMiddleware, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employeeId: req.user._id,
            date: today
        });

        res.json({ attendance: attendance || null });
    } catch (error) {
        console.error('Get today attendance error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Attendance (Admin)
app.get('/api/attendance/all', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { date } = req.query;
        const queryDate = date ? new Date(date) : new Date();
        queryDate.setHours(0, 0, 0, 0);

        const attendance = await Attendance.find({ date: queryDate })
            .populate('employeeId', 'firstName lastName email employeeId');
        res.json({ attendance });
    } catch (error) {
        console.error('Get all attendance error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== PROFILE ====================

// Get My Profile
app.get('/api/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ profile: user });
    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update My Profile - For Employees (Can only update personal details)
app.put('/api/profile', authMiddleware, async (req, res) => {
    try {
        const allowedFields = [
            'phone', 'address', 'city', 'dateOfBirth', 'gender', 'photo', 'emergencyContact'
        ];

        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Ensure jobDetails and salaryDetails are NOT updated here for security
        // Use a separate Admin endpoint for those

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).select('-password');

        res.json({ message: 'Profile updated successfully', profile: user });
    } catch (error) {
        console.error('Update profile error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin: Update ANY User Profile (Details, Job, Salary)
app.put('/api/admin/employees/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const updates = req.body;

        // Prevent updating password directly here (use change password API)
        delete updates.password;
        delete updates.employeeId; // Should not change ID usually

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json({ message: 'Employee updated successfully', profile: user });
    } catch (error) {
        console.error('Admin update employee error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Export the app for Vercel Serverless Functions
module.exports = app;

// Only listen if running directly (e.g. node server.js)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Backend running at http://localhost:${PORT}`);
    });
}
