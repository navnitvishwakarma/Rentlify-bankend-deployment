const express = require('express');
const adminController = require('../controllers/admin.controller');
const { auth } = require('../middlewares/auth.middleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(auth);

router.get('/stats', adminController.getDashboardStats);

module.exports = router;
