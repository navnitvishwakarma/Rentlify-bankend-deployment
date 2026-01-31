const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { errorResponse } = require('../utils/response.util');
const { generateAuthTokens, verifyToken } = require('../utils/token.util');
const config = require('../config/env');

const createUser = async (userBody) => {
    try {
        if (await User.isEmailTaken(userBody.email)) {
            throw new Error('Email already taken');
        }
        const user = await User.create(userBody);

        // If vendor, create vendor profile
        if (user.role === 'vendor' && userBody.businessName) {
            try {
                await Vendor.create({
                    user: user._id,
                    businessName: userBody.businessName,
                });
            } catch (vendorError) {
                // Rollback user if vendor creation fails
                await User.findByIdAndDelete(user._id);
                console.log('VENDOR ERROR DETAILS:', JSON.stringify(vendorError, null, 2));
                console.log('VENDOR ERROR MESSAGE:', vendorError.message);
                throw new Error(`Vendor creation failed: ${vendorError.message}`);
            }
        }

        return user;
    } catch (error) {
        throw error;
    }
};

// Add helper to User model or here? Doing here for now to avoid Model circular deps if any
User.isEmailTaken = async function (email) {
    const user = await this.findOne({ email });
    return !!user;
};


const loginUserWithEmailAndPassword = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user || !(await user.isPasswordMatch(password))) {
        throw new Error('Incorrect email or password');
    }
    return user;
};

const refreshAuth = async (refreshToken) => {
    try {
        const refreshTokenDoc = verifyToken(refreshToken, config.jwt.secret);
        const user = await User.findById(refreshTokenDoc.sub);
        if (!user) {
            throw new Error();
        }
        return generateAuthTokens(user);
    } catch (error) {
        throw new Error('Please authenticate');
    }
};

module.exports = {
    createUser,
    loginUserWithEmailAndPassword,
    refreshAuth,
};
