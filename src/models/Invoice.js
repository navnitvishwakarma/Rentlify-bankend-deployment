const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    invoiceNumber: {
        type: String,
        unique: true,
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    items: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        amount: Number,
    }],
    subtotal: {
        type: Number,
        required: true,
    },
    taxAmount: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paidAmount: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'paid', 'overdue', 'void'],
        default: 'draft',
    },
    dueDate: {
        type: Date,
    }
}, {
    timestamps: true,
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
