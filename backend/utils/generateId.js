const User = require('../models/User');

/**
 * Generate Employee ID in format: OI[FIRST2][LAST2][YEAR][SERIAL]
 * Example: OIJODO20260001
 */
async function generateEmployeeId(firstName, lastName, joiningYear) {
    // Get first 2 letters of first and last name (uppercase)
    const first2 = firstName.substring(0, 2).toUpperCase();
    const last2 = lastName.substring(0, 2).toUpperCase();

    // Get year
    const year = joiningYear || new Date().getFullYear();

    // Find count of employees joined this year
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59);

    const count = await User.countDocuments({
        joiningDate: { $gte: yearStart, $lte: yearEnd }
    });

    // Serial number (padded to 4 digits)
    const serial = String(count + 1).padStart(4, '0');

    // Format: OI + FIRST2 + LAST2 + YEAR + SERIAL
    return `OI${first2}${last2}${year}${serial}`;
}

/**
 * Generate temporary password
 * Format: TempXXXX! (where XXXX is random)
 */
function generateTempPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = 'Temp';
    for (let i = 0; i < 4; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    password += '!';
    return password;
}

module.exports = { generateEmployeeId, generateTempPassword };
