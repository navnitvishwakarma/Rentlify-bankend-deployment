const express = require('express');
const vendorController = require('../controllers/vendor.controller');
const { auth, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Dashboard Stats
router.get('/stats', auth, authorize('vendor'), vendorController.getDashboardStats);

router.route('/:id').get(vendorController.getVendor);
router.route('/me').put(auth, authorize('vendor'), vendorController.updateVendor);

module.exports = router;
