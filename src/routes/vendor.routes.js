const express = require('express');
const vendorController = require('../controllers/vendor.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Dashboard Stats
router.get('/stats', auth, authorize('vendor'), vendorController.getDashboardStats);

// Current Vendor Routes
router.route('/me').put(auth, authorize('vendor'), vendorController.updateVendor);
router.route('/me').get(auth, authorize('vendor'), async (req, res, next) => {
    // Helper to get own profile
    req.params.id = (await require('../models/Vendor').findOne({ user: req.user._id }))._id;
    vendorController.getVendor(req, res, next);
});

router.route('/:id').get(vendorController.getVendor);

module.exports = router;
