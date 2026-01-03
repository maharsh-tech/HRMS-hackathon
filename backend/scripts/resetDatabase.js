// Reset Database Script
// WARNING: This script deletes ALL data from Users, Leaves, and Attendance collections.
// Then it creates one main Admin user.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hrms-admin:admin123@hrms.xr5lbyh.mongodb.net/hrms?retryWrites=true&w=majority';

// Inline Schemas (Must match actual models to allow deletion)
const userSchema = new mongoose.Schema({}, { strict: false });
const leaveSchema = new mongoose.Schema({}, { strict: false });
const attendanceSchema = new mongoose.Schema({}, { strict: false });

async function resetDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const User = mongoose.model('User', userSchema);
        const Leave = mongoose.model('Leave', leaveSchema);
        const Attendance = mongoose.model('Attendance', attendanceSchema);

        console.log('Clearing database...');
        await Promise.all([
            User.deleteMany({}),
            Leave.deleteMany({}),
            Attendance.deleteMany({})
        ]);
        console.log('Database cleared.');

        // Re-define User with correct schema for validation
        // We need to fetch the model from mongoose again or just use simple insert
        // Since we used strict: false above, let's just use raw insert or re-model
        // Better to re-model properly for the admin to ensuring valid doc

        // Wait for a second to ensure clean state
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create Admin
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        const adminData = {
            employeeId: 'OIADMI20260001',
            email: 'admin@odoo.in',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            mustChangePassword: false,
            joiningDate: new Date(),
            createdAt: new Date()
        };

        await User.create(adminData);

        console.log('\n=================================');
        console.log('Database Reset & Admin Created!');
        console.log('=================================');
        console.log('Employee ID:', adminData.employeeId);
        console.log('Email:', adminData.email);
        console.log('Password: Admin@123');
        console.log('=================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Reset Error:', error);
        process.exit(1);
    }
}

resetDatabase();
