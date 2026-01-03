// Local Development Server
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/User');
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

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { employeeId, password } = req.body;

        if (!employeeId || !password) {
            return res.status(400).json({ error: 'Employee ID and password are required' });
        }

        // Find user by employeeId
        const user = await User.findOne({ employeeId });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

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

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});
