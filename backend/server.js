// Local Development Server
// This runs the same API endpoints locally that Vercel runs in production

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint (same as api/health.js)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Add more API routes here during development
// app.get('/api/example', (req, res) => { ... });

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});
