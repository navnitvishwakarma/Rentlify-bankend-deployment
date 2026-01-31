const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { successResponse, errorResponse } = require('../utils/response.util');

const createProduct = async (req, res, next) => {
    try {
        // Ensure user is vendor
        const vendor = await Vendor.findOne({ user: req.user._id });
        if (!vendor) {
            return errorResponse(res, 404, 'Vendor profile not found');
        }

        const product = await Product.create({
            ...req.body,
            vendor: vendor._id,
        });

        successResponse(res, 201, 'Product created', product);
    } catch (error) {
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const filters = {};
        if (req.query.category) filters.category = req.query.category;
        if (req.query.search) {
            filters.$text = { $search: req.query.search };
        }

        const products = await Product.find(filters).populate('vendor', 'businessName');
        successResponse(res, 200, 'Products list', products);
    } catch (error) {
        next(error);
    }
};

const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('vendor', 'businessName rating');
        if (!product) {
            return errorResponse(res, 404, 'Product not found');
        }
        successResponse(res, 200, 'Product details', product);
    } catch (error) {
        next(error);
    }
};

const getMyProducts = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user._id });
        if (!vendor) {
            return errorResponse(res, 404, 'Vendor profile not found');
        }

        const products = await Product.find({ vendor: vendor._id });
        successResponse(res, 200, 'My products', products);
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user._id });
        if (!vendor) return errorResponse(res, 404, 'Vendor profile not found');

        let product = await Product.findById(req.params.id);
        if (!product) return errorResponse(res, 404, 'Product not found');

        // Check ownership
        if (product.vendor.toString() !== vendor._id.toString()) {
            return errorResponse(res, 403, 'Not authorized to update this product');
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        successResponse(res, 200, 'Product updated', product);
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user._id });
        if (!vendor) return errorResponse(res, 404, 'Vendor profile not found');

        const product = await Product.findById(req.params.id);
        if (!product) return errorResponse(res, 404, 'Product not found');

        // Check ownership
        if (product.vendor.toString() !== vendor._id.toString()) {
            return errorResponse(res, 403, 'Not authorized to delete this product');
        }

        await Product.findByIdAndDelete(req.params.id);

        successResponse(res, 200, 'Product deleted');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
};
