const express = require('express');
const quotationController = require('../controllers/quotation.controller');
const { auth } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(auth);

router.route('/')
    .get(quotationController.getQuotations)
    .post(quotationController.createQuotation);

router.route('/:id')
    .get(quotationController.getQuotation);

module.exports = router;
