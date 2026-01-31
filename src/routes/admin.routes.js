const express = require('express');
const adminController = require('../controllers/admin.controller');
const { auth } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(auth);

router.get('/stats', adminController.getDashboardStats);
router.get('/vendors', adminController.getAllVendors);
router.patch('/vendors/:id/verify', adminController.verifyVendor);
router.patch('/vendors/:id/suspend', adminController.suspendVendor);
router.delete('/vendors/:id', adminController.deleteVendor);

module.exports = router;
