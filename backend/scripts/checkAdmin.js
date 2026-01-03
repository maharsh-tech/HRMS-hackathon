// Quick test to verify admin exists
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://hrms-admin:admin123@hrms.xr5lbyh.mongodb.net/hrms?retryWrites=true&w=majority';

async function checkAdmin() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const User = mongoose.connection.db.collection('users');
    const admin = await User.findOne({ email: 'admin@gmail.com' });

    if (admin) {
        console.log('\n=== Admin Found ===');
        console.log('Email:', admin.email);
        console.log('EmployeeId:', admin.employeeId);
        console.log('Role:', admin.role);
        console.log('Password hash exists:', !!admin.password);
        console.log('Hash starts with $2:', admin.password?.startsWith('$2'));
        console.log('Hash:', admin.password?.substring(0, 20) + '...');
    } else {
        console.log('\n!!! Admin NOT found !!!');

        // List all users
        const allUsers = await User.find({}).toArray();
        console.log('\nAll users in DB:');
        allUsers.forEach(u => {
            console.log(`- ${u.email} (${u.employeeId}) - role: ${u.role}`);
        });
    }

    await mongoose.disconnect();
    process.exit(0);
}

checkAdmin().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
