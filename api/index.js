const app = require('../backend/server');

// Vercel Serverless Function that wraps the Express app
module.exports = (req, res) => {
    app(req, res);
};
