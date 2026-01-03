const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hrms-admin:admin123@hrms.xr5lbyh.mongodb.net/hrms?retryWrites=true&w=majority';
const JWT_SECRET = process.env.JWT_SECRET || 'hrms-secret-key-change-in-production';

// User Schema
const userSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
    mustChangePassword: { type: Boolean, default: true },
    joiningDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

let User;
let isConnected = false;

async function connectDB() {
    if (!isConnected) {
        await mongoose.connect(MONGODB_URI);
        isConnected = true;
    }
    if (!User) {
        User = mongoose.models.User || mongoose.model('User', userSchema);
    }
    return User;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const UserModel = await connectDB();
        const { employeeId, password } = req.body;

        if (!employeeId || !password) {
            return res.status(400).json({ error: 'Employee ID and password are required' });
        }

        const identifier = employeeId.trim();

        // Find user by employeeId OR email
        const user = await UserModel.findOne({
            $or: [
                { employeeId: identifier },
                { email: identifier.toLowerCase() }
            ]
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, employeeId: user.employeeId, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

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
        res.status(500).json({ error: 'Server error' });
    }
}
