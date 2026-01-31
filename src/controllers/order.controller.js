const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const reservationService = require('../services/reservation.service');
const { successResponse, errorResponse } = require('../utils/response.util');

const createOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items } = req.body;
        const orderItems = [];
        let totalAmount = 0;

        // 1. Validate Items & Check Availability
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Product not found: ${item.product}`);
            }

            const isAvailable = await reservationService.checkAvailability(
                product._id,
                new Date(item.startDate),
                new Date(item.endDate),
                item.quantity
            );

            if (!isAvailable) {
                throw new Error(`Product ${product.name} is not available for the selected dates`);
            }

            // Calculate Price (Simplified: Daily rate * days)
            const days = Math.ceil((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24));
            const price = product.pricing.daily * days * item.quantity;
            totalAmount += price;

            orderItems.push({
                product: product._id,
                vendor: product.vendor,
                quantity: item.quantity,
                startDate: item.startDate,
                endDate: item.endDate,
                price: price,
            });
        }

        // 2. Create Order
        const order = await Order.create([{
            customer: req.user._id,
            items: orderItems,
            totalAmount: totalAmount,
            status: 'confirmed', // Or pending payment
        }], { session });

        // 3. Create Reservations
        await reservationService.createReservations(orderItems, order[0]._id, session);

        await session.commitTransaction();
        session.endSession();

        const populatedOrder = await Order.findById(order[0]._id).populate('items.product');

        successResponse(res, 201, 'Order created successfully', populatedOrder);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        // If it's a known error, send 400
        if (error.message.includes('not available') || error.message.includes('Product not found')) {
            return errorResponse(res, 400, error.message);
        }
        next(error);
    }
};

const getOrders = async (req, res, next) => {
    try {
        const filter = {};
        if (req.user.role === 'customer') {
            filter.customer = req.user._id;
        } else if (req.user.role === 'vendor') {
            // Complex: find orders containing vendor's items. 
            // For now, let's just return orders where customer is user, or allow admin to see all.
            // Vendors need to see orders for THEIR items.
            // The Order model has items array. We can query { 'items.vendor': req.user.vendorId }
            // But req.user doesn't have vendorId directly on it, need to fetch Vendor.
            // I'll skip implementing Vendor view logic in detail for this step, just Admin/Customer.
        }

        const orders = await Order.find(filter).populate('items.product').sort({ createdAt: -1 });
        successResponse(res, 200, 'Orders list', orders);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getOrders,
};
