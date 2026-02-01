const express = require('express');
const cartController = require('../controllers/cart.controller');
const { auth } = require('../middlewares/auth.middleware');

const router = express.Router();

// All cart routes require authentication
router.use(auth);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.patch('/:itemId', cartController.updateCartItem);
router.delete('/:itemId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
