const Joi = require('joi');

const register = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(8),
        role: Joi.string().valid('admin', 'vendor', 'customer').default('customer'),
        businessName: Joi.string().when('role', { is: 'vendor', then: Joi.required() }),
        gstNumber: Joi.string().allow('').optional(),
    }),
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    }),
};

const refreshTokens = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

module.exports = {
    register,
    login,
    refreshTokens,
};
