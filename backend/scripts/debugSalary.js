// Debug script to see actual salary data in DB
const mongoose = require('mongoose');
const connectDB = require('../config/db');

async function debugSalary() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const User = mongoose.connection.db.collection('users');

        // Get all users
        const users = await User.find({}).toArray();

        users.forEach(user => {
            console.log(`\n=== ${user.firstName} ${user.lastName} ===`);
            console.log('Email:', user.email);
            console.log('Salary Details:', JSON.stringify(user.salaryDetails, null, 2));
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

debugSalary();
