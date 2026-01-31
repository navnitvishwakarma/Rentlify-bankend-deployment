const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { successResponse } = require('../utils/response.util');

const getDashboardStats = async (req, res, next) => {
    try {
        // 1. Total Revenue (Sum of all completed/confirmed orders)
        // Adjust status filter based on your business logic (e.g., only 'completed' or also 'confirmed')
        const revenueAgg = await Order.aggregate([
            { $match: { status: { $in: ['confirmed', 'completed', 'in-progress'] } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // 2. Counts
        const activeUsers = await User.countDocuments({ role: 'customer' });
        const activeRentals = await Order.countDocuments({ status: 'in-progress' });
        const totalProducts = await Product.countDocuments();

        // 3. Recent Rentals (Orders)
        const recentRentals = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name email');

        // 4. New Vendors
        const newVendors = await User.find({ role: 'vendor' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email businessName isEmailVerified');

        // 5. Growth calculation (Simplified placeholder)
        // In a real app, you'd compare with last month's data
        const growthRate = "+5%";

        const stats = {
            totalRevenue,
            activeUsers,
            activeRentals,
            totalProducts,
            growthRate,
            recentRentals,
            newVendors
        };

        successResponse(res, 200, 'Admin Dashboard Stats', stats);
    } catch (error) {
        next(error);
    }
};

const getAllVendors = async (req, res, next) => {
    try {
        const Vendor = require('../models/Vendor');
        // Fetch users who are vendors
        const vendors = await User.find({ role: 'vendor' })
            .select('name email businessName isEmailVerified createdAt')
            .sort({ createdAt: -1 });

        // Enhance with profile data
        const detailedVendors = await Promise.all(vendors.map(async (user) => {
            const profile = await Vendor.findOne({ user: user._id });
            return {
                ...user.toObject(),
                profile: profile || {}
            };
        }));

        successResponse(res, 200, 'All Vendors', detailedVendors);
    } catch (error) {
        next(error);
    }
};

const verifyVendor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) throw new Error('User not found');

        user.isEmailVerified = true;
        await user.save();

        successResponse(res, 200, 'Vendor verified successfully', user);
    } catch (error) {
        next(error);
    }
};

const suspendVendor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body; // Expecting boolean

        const user = await User.findById(id);
        if (!user) throw new Error('User not found');

        user.isActive = isActive;
        await user.save();

        // Also update vendor profile status if exists
        const Vendor = require('../models/Vendor');
        const vendor = await Vendor.findOne({ user: id });
        if (vendor) {
            vendor.isActive = isActive;
            await vendor.save();
        }

        successResponse(res, 200, `Vendor ${isActive ? 'activated' : 'suspended'} successfully`, user);
    } catch (error) {
        next(error);
    }
};

const deleteVendor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const Vendor = require('../models/Vendor');

        await Vendor.findOneAndDelete({ user: id });
        await User.findByIdAndDelete(id);

        successResponse(res, 200, 'Vendor deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getAllVendors,
    verifyVendor,
    suspendVendor,
    deleteVendor
};
