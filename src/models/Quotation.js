const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    price: { // Unit price (e.g., daily rate * days)
        type: Number,
        required: true,
    },
    total: { // Price * Quantity
        type: Number,
        required: true,
    }
});

const quotationSchema = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [quotationItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'confirmed', 'rejected'],
        default: 'draft',
    },
    validUntil: {
        type: Date,
    },
}, {
    timestamps: true,
});

const Quotation = mongoose.model('Quotation', quotationSchema);
module.exports = Quotation;
