const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    images: [{
        type: String, // URLs
    }],
    pricing: {
        hourly: { type: Number, default: 0 },
        daily: { type: Number, required: true },
        weekly: { type: Number, default: 0 },
        deposit: { type: Number, default: 0 },
    },
    totalQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    attributes: [{
        key: String,
        value: String,
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Index for search
productSchema.index({ name: 'text', description: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
