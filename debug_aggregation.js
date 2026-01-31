const mongoose = require('mongoose');
const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');
const Order = require('./src/models/Order');
const Product = require('./src/models/Product');
const connectDB = require('./src/config/db');

require('dotenv').config();

const runDebug = async () => {
    try {
        await connectDB();
        console.log("Connected to DB");

        const vendorUser = await User.findOne({ email: 'kumarnavnit623@gmail.com' });
        if (!vendorUser) {
            console.log("Vendor User not found");
            return;
        }
        console.log("Vendor User ID:", vendorUser._id);

        const vendor = await Vendor.findOne({ user: vendorUser._id });
        if (!vendor) {
            console.log("Vendor Profile not found");
            return;
        }
        console.log("Vendor Profile ID:", vendor._id);

        const vendorId = vendor._id;

        // Check raw orders first
        const rawOrdersCount = await Order.countDocuments();
        console.log("Total Orders in DB:", rawOrdersCount);

        const vendorOrdersCount = await Order.countDocuments({ 'items.vendor': vendorId });
        console.log("Orders containing this vendor:", vendorOrdersCount);

        // Run Aggregation
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
                            $cond: [{ $eq: ['$items.status', 'active'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        console.log("Aggregation Result:", JSON.stringify(orderStats, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

runDebug();
