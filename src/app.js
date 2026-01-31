const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const { successResponse } = require('./utils/response.util');

const routes = require('./routes');

const app = express();
const connectDB = require('./config/db');

// Connect to Database immediately when app loads
// Connect to Database immediately when app loads
// connectDB(); // Moved to server.js and api/index.js

// Security Middleware
app.use(helmet());

// Ignore favicon requests to prevent 500/404 errors in logs
app.get('/favicon.ico', (req, res) => res.status(204).end());

// CORS Configuration
// CORS Configuration
const allowedOrigins = [
    config.clientUrl,
    'http://localhost:3000',
    'http://localhost:5173',
    'https://rentlify-frontend.vercel.app',
    'https://rentlify-bankend-deployment.vercel.app'
].filter(Boolean); // Remove null/undefined

// Allow all origins in development or if clientUrl is '*'
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => o.includes(origin)) || config.env === 'development') {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));

// Logger
if (config.env !== 'test') {
    app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression
app.use(compression());

// Test Route
app.get('/', (req, res) => {
    successResponse(res, 200, 'Rentlify Backend is running!', {
        environment: config.env,
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/v1', routes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
