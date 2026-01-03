const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['employee', 'admin'],
        default: 'employee'
    },
    mustChangePassword: {
        type: Boolean,
        default: true
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Profile fields
    photo: {
        type: String,  // URL from ImgBB
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', ''],
        default: ''
    },
    emergencyContact: {
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        relation: { type: String, default: '' }
    },
    // Job Details
    jobDetails: {
        designation: { type: String, default: '' },
        department: { type: String, default: '' },
        employmentType: { type: String, default: 'Full-time' }, // Full-time, Part-time, Contract
        workLocation: { type: String, default: 'Office' }, // Office, Remote, Hybrid
        joiningDate: { type: Date, default: Date.now },
        manager: { type: String, default: '' } // Name or ID
    },
    // Salary Details (Confidential - typically Admin only write)
    salaryDetails: {
        // Base wage
        wage: { type: Number, default: 0 },
        wageType: { type: String, default: 'Fixed' },

        // Salary Components (auto-calculated from wage)
        basic: { type: Number, default: 0 },           // 50% of wage
        hra: { type: Number, default: 0 },             // 50% of basic
        standardAllowance: { type: Number, default: 4167 },
        performanceBonus: { type: Number, default: 0 }, // 8.33% of wage
        lta: { type: Number, default: 0 },              // 8.333% of wage
        fixedAllowance: { type: Number, default: 0 },   // wage - sum of above

        // Deductions
        pfRate: { type: Number, default: 12 },          // PF rate in %
        pfAmount: { type: Number, default: 0 },         // 12% of basic
        professionalTax: { type: Number, default: 200 },

        // Totals
        grossSalary: { type: Number, default: 0 },
        totalDeductions: { type: Number, default: 0 },
        netSalary: { type: Number, default: 0 },

        // Bank Details
        bankAccount: {
            accountNumber: { type: String, default: '' },
            bankName: { type: String, default: '' },
            ifscCode: { type: String, default: '' }
        }
    },
    // Employee Documents (Admin managed, Employee view-only)
    documents: [{
        name: { type: String, required: true },
        type: { type: String, default: 'Other' },  // Contract, Certificate, ID, Resume, Other
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
