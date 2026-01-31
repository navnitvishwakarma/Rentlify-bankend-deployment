const httpStatus = require('http-status');
const User = require('../models/User');
const { successResponse } = require('../utils/response.util');

const getWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        successResponse(res, httpStatus.OK, 'Wishlist retrieved successfully', user.wishlist);
    } catch (error) {
        next(error);
    }
};

const addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }

        // Populate to return full objects if needed, or just return the list
        await user.populate('wishlist');
        successResponse(res, httpStatus.OK, 'Added to wishlist', user.wishlist);
    } catch (error) {
        next(error);
    }
};

const removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const user = await User.findById(req.user._id);

        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        await user.populate('wishlist');
        successResponse(res, httpStatus.OK, 'Removed from wishlist', user.wishlist);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
};
