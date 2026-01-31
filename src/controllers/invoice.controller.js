const Invoice = require('../models/Invoice');
const { successResponse, errorResponse } = require('../utils/response.util');

const getInvoices = async (req, res, next) => {
    try {
        const invoices = await Invoice.find({ customer: req.user._id });
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
