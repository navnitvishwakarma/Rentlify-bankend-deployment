const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },
    method: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'cash'],
        default: 'upi',
    },
    transactionId: {
        type: String,
        unique: true, // might come from gateway
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
    },
    capturedAt: Date,
}, {
    timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
