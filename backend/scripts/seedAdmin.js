// Seed script to create the first admin user
// Run once: node scripts/seedAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hrms-admin:admin123@hrms.xr5lbyh.mongodb.net/hrms?retryWrites=true&w=majority';

// Inline User Schema (to avoid path issues)
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

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.model('User', userSchema);

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin already exists:', existingAdmin.employeeId);
            process.exit(0);
        }

        // Create first admin
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        const admin = new User({
            employeeId: 'OIADMI20260001',
            email: 'admin@odoo.in',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            mustChangePassword: false,  // Admin can keep this password
            joiningDate: new Date()
        });

        await admin.save();

        console.log('\n=================================');
        console.log('First Admin Created Successfully!');
        console.log('=================================');
        console.log('Employee ID:', admin.employeeId);
        console.log('Email:', admin.email);
        console.log('Password: Admin@123');
        console.log('=================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

seedAdmin();
