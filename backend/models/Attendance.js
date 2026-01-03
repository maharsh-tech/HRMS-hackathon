const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeCode: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkIn: {
        type: String
    },
    checkOut: {
        type: String
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Half-day', 'Leave'],
        default: 'Present'
    },
    workingHours: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate entries for same employee on same date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
