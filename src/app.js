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

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
    origin: config.clientUrl,
    credentials: true,
}));

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
