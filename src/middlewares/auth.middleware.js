const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { errorResponse } = require('../utils/response.util');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 401, 'Please authenticate');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return errorResponse(res, 401, 'Please authenticate');
        }

        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await User.findById(decoded.sub);

            if (!user) {
                throw new Error();
            }

            req.user = user;
            next();
        } catch (error) {
            return errorResponse(res, 401, 'Please authenticate');
        }
    } catch (error) {
        next(error);
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return errorResponse(res, 403, 'Forbidden');
        }
        next();
    };
};

module.exports = {
    auth,
    authorize,
};
