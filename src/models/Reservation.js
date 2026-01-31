const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    vendor: {
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
        index: true,
    },
    endDate: {
        type: Date,
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'completed'],
        default: 'active',
    }
}, {
    timestamps: true,
});

// Compound index to help search overlaps for a specific product
reservationSchema.index({ product: 1, startDate: 1, endDate: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
