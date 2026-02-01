const Vendor = require('../models/Vendor');

const getInvoices = async (req, res, next) => {
    try {
        const query = {};
        console.log(`[DEBUG] getInvoices called by User: ${req.user._id}, Role: ${req.user.role}`);

        if (req.user.role === 'vendor') {
            const vendor = await Vendor.findOne({ user: req.user._id });
            if (!vendor) {
                console.log(`[DEBUG] Vendor profile not found for user ${req.user._id}`);
                return errorResponse(res, 404, 'Vendor profile not found');
            }
            console.log(`[DEBUG] Found Vendor Profile: ${vendor._id}`);
            query.vendor = vendor._id;
        } else if (req.user.role === 'customer') {
            query.customer = req.user._id;
        }
        // Admin can see all, or we can enforce filters if needed

        if (req.query.orderId) {
            query.order = req.query.orderId;
        }

        console.log(`[DEBUG] Executing Invoice Query:`, JSON.stringify(query));
        const invoices = await Invoice.find(query)
            .populate('vendor', 'name email businessName')
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });

        console.log(`[DEBUG] Found ${invoices.length} invoices`);
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
