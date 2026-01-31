const express = require('express');
const invoiceController = require('../controllers/invoice.controller');
const { auth } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(auth);

router.route('/')
    .get(invoiceController.getInvoices);

router.route('/:id')
    .get(invoiceController.getInvoice);

module.exports = router;
