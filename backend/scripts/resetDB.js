// Reset database using proper Mongoose User model
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

async function resetDB() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Delete ALL users
        const deleteResult = await User.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} users`);

        // Create fresh admin with admin@gmail.com / admin
        // Using the proper User model so password gets hashed correctly
        const admin = new User({
            employeeId: 'ADMIN001',
            email: 'admin@gmail.com',
            password: 'admin',  // Will be hashed by pre-save hook
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            mustChangePassword: false,
            joiningDate: new Date()
        });

        await admin.save();

        console.log('\n=================================');
        console.log('Database Reset Complete!');
        console.log('=================================');
        console.log('Email: admin@gmail.com');
        console.log('Password: admin');
        console.log('=================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

resetDB();
