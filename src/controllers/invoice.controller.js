const Vendor = require('../models/Vendor');

const getInvoices = async (req, res, next) => {
    try {
        const query = {};

        if (req.user.role === 'vendor') {
            const vendor = await Vendor.findOne({ user: req.user._id });
            if (!vendor) {
                return errorResponse(res, 404, 'Vendor profile not found');
            }
            query.vendor = vendor._id;
        } else if (req.user.role === 'customer') {
            query.customer = req.user._id;
        }
        // Admin can see all, or we can enforce filters if needed

        if (req.query.orderId) {
            query.order = req.query.orderId;
        }

        const invoices = await Invoice.find(query)
            .populate('vendor', 'name email businessName')
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });

        successResponse(res, 200, 'Invoices list', invoices);
    } catch (error) {
        next(error);
    }
};

const getInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
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
