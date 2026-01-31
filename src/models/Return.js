const mongoose = require('mongoose');

const returnSchema = mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    returnDate: {
        type: Date,
        default: Date.now,
    },
    expectedReturnDate: { // From order
        type: Date,
        required: true,
    },
    itemsReturned: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
        condition: { type: String, enum: ['good', 'damaged', 'lost'], default: 'good' },
        notes: String,
    }],
    lateFee: {
        type: Number,
        default: 0,
    },
    damageFee: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'disputed'],
        default: 'completed',
    },
}, {
    timestamps: true,
});

const Return = mongoose.model('Return', returnSchema);
module.exports = Return;
