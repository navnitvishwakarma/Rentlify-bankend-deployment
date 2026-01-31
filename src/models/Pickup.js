const mongoose = require('mongoose');

const pickupSchema = mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true, // simplified: one pickup per order for now, or make array
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    processedBy: { // Vendor/Staff
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    pickupDate: {
        type: Date,
        default: Date.now,
    },
    itemsSnapshot: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        condition: { type: String, default: 'good' },
    }],
    notes: String,
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'verified'],
        default: 'completed',
    },
}, {
    timestamps: true,
});

const Pickup = mongoose.model('Pickup', pickupSchema);
module.exports = Pickup;
