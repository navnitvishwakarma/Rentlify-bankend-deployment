const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    vendor: { // Snapshot of vendor for easier queries
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    // Tracking individual item status if needed (e.g. one item picked up, another not)
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'pending',
    }
});

const orderSchema = mongoose.Schema({
    orderId: { // Human readable ID
        type: String,
        unique: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation',
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['confirmed', 'in-progress', 'completed', 'cancelled'],
        default: 'confirmed',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'refunded'],
        default: 'pending',
    },
    securityDeposit: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Auto-generate OrderID (simple version)
orderSchema.pre('save', function (next) {
    if (!this.orderId) {
        this.orderId = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
