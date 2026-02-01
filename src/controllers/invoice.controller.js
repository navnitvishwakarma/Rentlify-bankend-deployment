const Invoice = require('../models/Invoice');
const Vendor = require('../models/Vendor');
const { successResponse, errorResponse } = require('../utils/response.util');

const getInvoices = async (req, res, next) => {
    try {
        const query = {};

        // 1. Filter by Role
        if (req.user.role === 'vendor') {
            const vendor = await Vendor.findOne({ user: req.user._id });
            if (!vendor) {
                return errorResponse(res, 404, 'Vendor profile not found');
            }
            query.vendor = vendor._id;
        } else if (req.user.role === 'customer') {
            query.customer = req.user._id;
        }

        // 2. Filter by specific Order
        if (req.query.orderId) {
            query.order = req.query.orderId;
        }

        // 3. Execute Query (No Debug Logs to avoid circular JSON error)
        const invoices = await Invoice.find(query)
            .populate('vendor', 'name email businessName gstNumber')
            .populate('customer', 'name email gstNumber')
            .sort({ createdAt: -1 });

        successResponse(res, 200, 'Invoices list', invoices);
    } catch (error) {
        next(error);
    }
};

const getInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('vendor', 'name email businessName gstNumber')
            .populate('customer', 'name email gstNumber');

        if (!invoice) return errorResponse(res, 404, 'Invoice not found');
        successResponse(res, 200, 'Invoice details', invoice);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getInvoices,
    getInvoice
};
