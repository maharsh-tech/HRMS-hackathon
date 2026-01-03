// Script to remove all non-admin users
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://hrms-admin:admin123@hrms.xr5lbyh.mongodb.net/hrms?retryWrites=true&w=majority';

async function cleanup() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await mongoose.connection.db.collection('users').deleteMany({ role: { $ne: 'admin' } });
        console.log('Deleted', result.deletedCount, 'non-admin users');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

cleanup();
