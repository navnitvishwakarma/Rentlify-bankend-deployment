const Quotation = require('../models/Quotation');
const { successResponse, errorResponse } = require('../utils/response.util');

const createQuotation = async (req, res, next) => {
    try {
        const quotation = await Quotation.create({
            customer: req.user._id,
            ...req.body
        });
        successResponse(res, 201, 'Quotation created', quotation);
    } catch (error) {
        next(error);
    }
};

const getQuotations = async (req, res, next) => {
    try {
        const quotations = await Quotation.find({ customer: req.user._id });
        successResponse(res, 200, 'Quotations list', quotations);
    } catch (error) {
        next(error);
    }
};

const getQuotation = async (req, res, next) => {
    try {
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) return errorResponse(res, 404, 'Quotation not found');
        successResponse(res, 200, 'Quotation details', quotation);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createQuotation,
    getQuotations,
    getQuotation
};
