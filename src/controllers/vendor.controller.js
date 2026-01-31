const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { successResponse, errorResponse } = require('../utils/response.util');

const getVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return errorResponse(res, 404, 'Vendor not found');
        successResponse(res, 200, 'Vendor details', vendor);
    } catch (error) {
        next(error);
    }
};

const updateVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOneAndUpdate(
            { user: req.user._id },
            req.body,
            { new: true }
        );
        successResponse(res, 200, 'Vendor updated', vendor);
    } catch (error) {
        next(error);
    }
};

const getDashboardStats = async (req, res, next) => {
    try {
        const vendorId = req.params.vendorId || (await Vendor.findOne({ user: req.user._id }))._id;
        console.log("Debug: Resolving Vendor ID:", vendorId);

        const productsCount = await Product.countDocuments({ vendor: vendorId });
        console.log("Debug: Product Count:", productsCount);

        // Orders aggregation
        const orderStats = await Order.aggregate([
            { $unwind: '$items' },
            { $match: { 'items.vendor': vendorId } },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$items.price' },
                    activeOrders: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['confirmed', 'in-progress']] }, 1, 0]
                        }
                    },
                    pendingReturns: {
                        $sum: {
                            $cond: [{ $eq: ['$items.status', 'active'] }, 1, 0] // Assuming 'active' item means rented out
                        }
                    }
                }
            }
        ]);
        console.log("Debug: Order Stats Aggregation:", JSON.stringify(orderStats, null, 2));

        // Monthly Revenue (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const revenueChart = await Order.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $unwind: '$items' },
            { $match: { 'items.vendor': vendorId } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    monthName: { $first: { $month: '$createdAt' } },
                    total: { $sum: '$items.price' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Format chart data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedChart = revenueChart.map(item => ({
            name: monthNames[item._id - 1], // Month is 1-indexed in mongo
            total: item.total
        }));

        // Recent Orders
        const recentOrders = await Order.find({ 'items.vendor': vendorId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name email');

        successResponse(res, 200, 'Dashboard Stats', {
            earnings: orderStats[0]?.totalEarnings || 0,
            products: productsCount,
            activeOrders: orderStats[0]?.activeOrders || 0,
            pendingReturns: orderStats[0]?.pendingReturns || 0,
            revenueChart: formattedChart,
            recentOrders
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVendor,
    updateVendor,
    getDashboardStats
};
