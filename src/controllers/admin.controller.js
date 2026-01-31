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

module.exports = {
    getDashboardStats
};
