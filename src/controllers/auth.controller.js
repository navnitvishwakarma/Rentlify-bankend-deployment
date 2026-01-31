const authService = require('../services/auth.service');
const tokenService = require('../utils/token.util');
const { successResponse, errorResponse } = require('../utils/response.util');

const register = async (req, res, next) => {
    console.log("DEBUG: Register Controller Hit");
    try {
        const user = await authService.createUser(req.body);
        const tokens = await tokenService.generateAuthTokens(user);
        successResponse(res, 201, 'User registered successfully', { user, tokens });
    } catch (error) {
        if (error.message === 'Email already taken') {
            return errorResponse(res, 400, error.message);
        }
        // next(error);
        return errorResponse(res, 500, error.message);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authService.loginUserWithEmailAndPassword(email, password);
        const tokens = await tokenService.generateAuthTokens(user);
        successResponse(res, 200, 'Login successful', { user, tokens });
    } catch (error) {
        if (error.message === 'Incorrect email or password') {
            return errorResponse(res, 401, error.message);
        }
        // next(error);
        return errorResponse(res, 500, error.message);
    }
};

const refreshTokens = async (req, res, next) => {
    try {
        const tokens = await authService.refreshAuth(req.body.refreshToken);
        successResponse(res, 200, 'Token refreshed', { tokens });
    } catch (error) {
        errorResponse(res, 401, 'Please authenticate');
    }
};

const getMe = async (req, res) => {
    successResponse(res, 200, 'User profile', { user: req.user });
};



module.exports = {
    register,
    login,
    refreshTokens,
    getMe,
};
