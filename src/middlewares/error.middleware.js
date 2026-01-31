const config = require('../config/env');
const { errorResponse } = require('../utils/response.util');

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (!statusCode) {
        statusCode = 500;
        message = 'Internal Server Error';
    }

    if (config.env === 'development') {
        console.error(err);
    }

    const response = {
        success: false,
        message: message || 'Something went wrong',
        ...(config.env === 'development' && { stack: err.stack }),
    };

    res.status(statusCode).json(response);
};

const notFoundHandler = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

module.exports = {
    errorHandler,
    notFoundHandler,
};
