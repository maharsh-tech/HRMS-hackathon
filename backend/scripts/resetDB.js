// Reset database - delete all users and create fresh admin
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hrms-admin:admin123@hrms.xr5lbyh.mongodb.net/hrms?retryWrites=true&w=majority';

async function resetDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.connection.db.collection('users');

        // Delete ALL users
        const deleteResult = await User.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} users`);

        // Create fresh admin with admin@gmail.com / admin
        const hashedPassword = await bcrypt.hash('admin', 10);

        const admin = {
            employeeId: 'ADMIN001',
            email: 'admin@gmail.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            mustChangePassword: false,
            joiningDate: new Date(),
            createdAt: new Date()
        };

        await User.insertOne(admin);

        console.log('\n=================================');
        console.log('Database Reset Complete!');
        console.log('=================================');
        console.log('Email: admin@gmail.com');
        console.log('Password: admin');
        console.log('=================================\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

resetDB();
