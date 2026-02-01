const app = require('../src/app');
const connectDB = require('../src/config/db');
// Force model registration
require('../src/models');

// Cache the database connection promise to prevent multiple connections in serverless environment
let conn = null;

module.exports = async (req, res) => {
    try {
        if (!conn) {
            conn = await connectDB();
        }

        // Pass request to Express app
        app(req, res);
    } catch (error) {
        console.error('Vercel Function Error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
};
