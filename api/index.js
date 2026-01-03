const connectDB = require('../backend/config/db');
const app = require('../backend/server');

// Vercel Serverless Function that wraps the Express app
module.exports = async (req, res) => {
    // Ensure MongoDB is connected before handling request
    await connectDB();
    app(req, res);
};
