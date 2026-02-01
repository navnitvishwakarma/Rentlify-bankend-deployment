const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const reservationService = require('../services/reservation.service');
const { successResponse, errorResponse } = require('../utils/response.util');

const createOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log("Create Order Payload:", JSON.stringify(req.body, null, 2));

    try {
        const { items } = req.body;
        const orderItems = [];
        let totalAmount = 0;

        // 1. Validate Items & Check Availability
        for (const item of items) {
            const product = await Product.findById(item.product).populate('vendor');
            if (!product) {
                throw new Error(`Product not found: ${item.product}`);
            }

            if (!product.vendor.isVerified) {
                throw new Error(`Cannot order product '${product.name}' as the vendor is not verified yet.`);
            }

            if (!product.vendor.isActive) {
                throw new Error(`Cannot order product '${product.name}' as the vendor account is suspended.`);
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
            // Calculate Price (Simplified: Daily rate * days)
            // Calculate Price (Simplified: Daily rate * days)
            let days = Math.ceil((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24));

            if (isNaN(days)) {
                throw new Error(`Invalid dates for product: ${product.name}`);
            }

            days = Math.max(1, days); // Ensure minimum 1 day charge

            const price = product.pricing.daily * days * item.quantity;

            if (isNaN(price)) {
                throw new Error(`Invalid price calculation for product: ${product.name}`);
            }

            orderItems.push({
                product: product._id,
                vendor: product.vendor._id, // Explicitly use ID
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
            status: 'confirmed',
            shippingAddress: req.body.shippingAddress, // Save shipping details
        }], { session });

        // 3. Create Reservations
        await reservationService.createReservations(orderItems, order[0]._id, session);
        console.log("Reservations created");

        // 4. Generate Invoices (Group by Vendor)
        const vendorItems = {};
        for (const item of orderItems) {
            const vendorId = item.vendor.toString();
            if (!vendorItems[vendorId]) {
                vendorItems[vendorId] = [];
            }
            vendorItems[vendorId].push(item);
        }
        console.log("Vendor groups:", Object.keys(vendorItems));

        const invoices = [];
        for (const vendorId of Object.keys(vendorItems)) {
            const itemsForVendor = vendorItems[vendorId];
            const subtotal = itemsForVendor.reduce((sum, item) => sum + item.price, 0);
            const taxAmount = subtotal * 0.18; // Assuming 18% tax
            const total = subtotal + taxAmount;

            const invoiceItems = await Promise.all(itemsForVendor.map(async (item) => {
                const product = await Product.findById(item.product);
                return {
                    description: product.name,
                    quantity: item.quantity,
                    unitPrice: item.price / item.quantity, // Derived unit price
                    amount: item.price
                };
            }));

            invoices.push({
                invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                order: order[0]._id,
                customer: req.user._id,
                vendor: vendorId,
                items: invoiceItems,
                subtotal: subtotal,
                taxAmount: taxAmount,
                totalAmount: total,
                status: 'paid', // Assuming immediate payment for now
                dueDate: new Date()
            });
        }

        console.log("Creating invoices:", invoices.length);
        await Invoice.create(invoices, { session });
        console.log("Invoices created successfully");

        await session.commitTransaction();
        session.endSession();

        const populatedOrder = await Order.findById(order[0]._id).populate('items.product');

        successResponse(res, 201, 'Order created successfully', populatedOrder);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        if (error.name === 'ValidationError') {
            return errorResponse(res, 400, error.message);
        }
        // If it's a known error, send 400
        if (error.message.includes('not available') || error.message.includes('Product not found') || error.message.includes('Cannot order product')) {
            return errorResponse(res, 400, error.message);
        }
        console.error("Create Order Error:", error);
        next(error);
    }
};

const getOrders = async (req, res, next) => {
    try {
        const filter = {};
        if (req.user.role === 'customer') {
            filter.customer = req.user._id;
        } else if (req.user.role === 'vendor') {
            const Vendor = require('../models/Vendor');
            const vendor = await Vendor.findOne({ user: req.user._id });
            if (vendor) {
                filter['items.vendor'] = vendor._id;
            }
        }

        const orders = await Order.find(filter)
            .populate('items.product')
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });
        successResponse(res, 200, 'Orders list', orders);
    } catch (error) {
        next(error);
    }
};

const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product')
            .populate('customer', 'name email phone address'); // Add phone/address if available in User model

        if (!order) {
            return errorResponse(res, 404, 'Order not found');
        }

        // Access Control
        if (req.user.role === 'customer') {
            if (order.customer._id.toString() !== req.user._id.toString()) {
                return errorResponse(res, 403, 'Forbidden');
            }
        } else if (req.user.role === 'vendor') {
            const Vendor = require('../models/Vendor');
            const vendor = await Vendor.findOne({ user: req.user._id });
            const vendorId = vendor._id.toString();

            // Check if vendor has ANY items in this order
            const hasItems = order.items.some(item => item.vendor.toString() === vendorId);
            if (!hasItems) {
                return errorResponse(res, 403, 'Forbidden');
            }

            // Optional: Filter items strictly for context
            order.items = order.items.filter(item => item.vendor.toString() === vendorId);
        }

        successResponse(res, 200, 'Order Details', order);
    } catch (error) {
        next(error);
    }
};



const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return errorResponse(res, 404, 'Order not found');
        }

        // Logic to validate state transitions can go here
        // e.g. Pending -> Confirmed -> Active -> Completed/Returned

        order.status = status;

        // Also update items status if needed (simplified)
        if (status === 'active') {
            order.items.forEach(item => item.status = 'active');
        } else if (status === 'returned' || status === 'completed') {
            order.items.forEach(item => item.status = 'returned');
            order.status = 'completed'; // Map returned to completed for order level
        }

        await order.save();

        successResponse(res, 200, 'Order status updated', order);
    } catch (error) {
        next(error);
    }
};

const getVendorActiveOrders = async (req, res, next) => {
    try {
        const Vendor = require('../models/Vendor');
        const vendor = await Vendor.findOne({ user: req.user._id });

        if (!vendor) {
            return errorResponse(res, 404, 'Vendor profile not found');
        }

        const vendorId = vendor._id.toString();

        // Find orders containing items from this vendor
        const orders = await Order.find({
            'items.vendor': vendor._id,
            'status': { $in: ['confirmed', 'in-progress'] } // Active orders only
        })
            .populate('customer', 'name email phone')
            .populate('items.product', 'name images pricing');

        const activeItems = [];
        const today = new Date();

        // Process orders to extract specific vendor items and calculate fines
        orders.forEach(order => {
            order.items.forEach(item => {
                // Filter only this vendor's items that are active
                if (item.vendor.toString() === vendorId) {
                    const endDate = new Date(item.endDate);
                    let fine = 0;
                    let overdueDays = 0;

                    // Check if overdue
                    if (today > endDate) {
                        const timeDiff = today - endDate;
                        overdueDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                        // Fine Calculation: 2x Daily Rate * Overdue Days
                        // Ensure product and pricing exist to avoid crashes
                        if (item.product && item.product.pricing) {
                            fine = (item.product.pricing.daily * 2) * overdueDays * item.quantity;
                        }
                    }

                    activeItems.push({
                        _id: item._id, // Item ID (if needed)
                        orderId: order.orderId,
                        orderDbId: order._id,
                        customer: order.customer,
                        product: item.product,
                        quantity: item.quantity,
                        startDate: item.startDate,
                        endDate: item.endDate,
                        status: item.status || order.status,
                        overdueDays: overdueDays > 0 ? overdueDays : 0,
                        fine: fine
                    });
                }
            });
        });

        // Sort by overdue first, then date
        activeItems.sort((a, b) => b.fine - a.fine || new Date(a.endDate) - new Date(b.endDate));

        successResponse(res, 200, 'Active orders retrieved', activeItems);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    getVendorActiveOrders
};
