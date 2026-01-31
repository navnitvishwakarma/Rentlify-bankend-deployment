const express = require('express');
const validate = require('../middlewares/validate.middleware');
const orderValidation = require('../validations/order.validation');
const orderController = require('../controllers/order.controller');
const { auth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(auth);

router.route('/')
    .get(orderController.getOrders)
    .post(validate(orderValidation.createOrder), orderController.createOrder);

module.exports = router;
