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

        // Delete any existing admin with our target email or any old admin
        await User.deleteMany({
            $or: [
                { email: 'admin@gmail.com' },
                { role: 'admin' }
            ]
        });
        console.log('Cleaned up existing admin users');

        // Create new admin
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = new User({
            employeeId: 'ADMIN001',
            email: 'admin@gmail.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            mustChangePassword: false,
            joiningDate: new Date()
        });

        await admin.save();

        console.log('\n=================================');
        console.log('Admin Created Successfully!');
        console.log('=================================');
        console.log('Employee ID:', admin.employeeId);
        console.log('Email:', admin.email);
        console.log('Password: admin123');
        console.log('=================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

seedAdmin();

