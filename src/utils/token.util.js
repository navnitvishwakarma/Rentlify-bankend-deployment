const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (userId, role, secret, expiresIn) => {
    const payload = {
        sub: userId,
        role: role,
        iat: Math.floor(Date.now() / 1000),
    };
    return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token, secret) => {
    return jwt.verify(token, secret);
};

const generateAuthTokens = async (user) => {
    const accessTokenExpires = config.jwt.accessExpirationMinutes;
    const accessToken = generateToken(user._id, user.role, config.jwt.secret, accessTokenExpires);

    const refreshTokenExpires = config.jwt.refreshExpirationDays;
    const refreshToken = generateToken(user._id, user.role, config.jwt.secret, refreshTokenExpires);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires,
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires,
        },
    };
};

module.exports = {
    generateToken,
    verifyToken,
    generateAuthTokens,
};
