const authService = require('../services/auth.service');
const tokenService = require('../utils/token.util');
const { successResponse, errorResponse } = require('../utils/response.util');

const fs = require('fs');

const register = async (req, res) => {
    try {
        fs.appendFileSync('debug.log', "DEBUG V2: Register Hit\n");
        const user = await authService.createUser(req.body);
        const tokens = await tokenService.generateAuthTokens(user);
        successResponse(res, 201, 'User registered successfully', { user, tokens });
    } catch (error) {
        fs.appendFileSync('debug.log', "V2 ERROR: " + error.message + "\n");
        fs.appendFileSync('debug.log', JSON.stringify(error, null, 2) + "\n");

        if (error.message === 'Email already taken') {
            return errorResponse(res, 400, error.message);
        }
        return errorResponse(res, 500, `V2 Error: ${error.message}`);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await authService.loginUserWithEmailAndPassword(email, password);
        const tokens = await tokenService.generateAuthTokens(user);
        successResponse(res, 200, 'Login successful', { user, tokens });
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
};

const refreshTokens = async (req, res) => res.send('ok');
const getMe = async (req, res) => res.send('ok');

module.exports = {
    register,
    login,
    refreshTokens,
    getMe,
};
