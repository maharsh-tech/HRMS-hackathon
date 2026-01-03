// Migration script to convert old salary data to new format
// Run: node scripts/migrateSalaryData.js

const mongoose = require('mongoose');
const connectDB = require('../config/db');

async function migrateSalaryData() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const User = mongoose.connection.db.collection('users');

        // Get all users
        const users = await User.find({}).toArray();
        console.log(`Found ${users.length} users to check`);

        let migratedCount = 0;

        for (const user of users) {
            const salary = user.salaryDetails || {};

            // Check if using old field names or needs update
            if (salary.basicSalary !== undefined || !salary.wage) {
                // Calculate wage from basicSalary if present
                const oldBasic = salary.basicSalary || salary.basic || 0;
                const wage = salary.wage || (oldBasic > 0 ? oldBasic * 2 : 0); // basic is 50% of wage

                if (wage > 0) {
                    // Calculate new salary structure
                    const basic = Math.round(wage * 0.50);
                    const hra = Math.round(basic * 0.50);
                    const standardAllowance = 4167;
                    const performanceBonus = Math.round(wage * 0.0833);
                    const lta = Math.round(wage * 0.08333);
                    const subtotal = basic + hra + standardAllowance + performanceBonus + lta;
                    const fixedAllowance = Math.max(0, wage - subtotal);

                    const pfRate = 12;
                    const pfAmount = Math.round(basic * 0.12);
                    const professionalTax = 200;

                    const grossSalary = wage;
                    const totalDeductions = pfAmount + professionalTax;
                    const netSalary = grossSalary - totalDeductions;

                    const newSalaryDetails = {
                        wage,
                        wageType: 'Fixed',
                        basic,
                        hra,
                        standardAllowance,
                        performanceBonus,
                        lta,
                        fixedAllowance,
                        pfRate,
                        pfAmount,
                        professionalTax,
                        grossSalary,
                        totalDeductions,
                        netSalary,
                        bankAccount: salary.bankAccount || {
                            accountNumber: '',
                            bankName: '',
                            ifscCode: ''
                        }
                    };

                    await User.updateOne(
                        { _id: user._id },
                        { $set: { salaryDetails: newSalaryDetails } }
                    );

                    console.log(`✓ Migrated ${user.firstName} ${user.lastName} (wage: ₹${wage})`);
                    migratedCount++;
                }
            }
        }

        console.log(`\n=================================`);
        console.log(`Migration complete! ${migratedCount} users updated.`);
        console.log(`=================================\n`);

        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error.message);
        process.exit(1);
    }
}

migrateSalaryData();
