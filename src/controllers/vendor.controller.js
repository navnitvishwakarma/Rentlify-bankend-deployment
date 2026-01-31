const Vendor = require('../models/Vendor');
const { successResponse, errorResponse } = require('../utils/response.util');

const getVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return errorResponse(res, 404, 'Vendor not found');
        successResponse(res, 200, 'Vendor details', vendor);
    } catch (error) {
        next(error);
    }
};

const updateVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOneAndUpdate(
            { user: req.user._id },
            req.body,
            { new: true }
        );
        successResponse(res, 200, 'Vendor updated', vendor);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVendor,
    updateVendor,
};
