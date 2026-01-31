const express = require('express');
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth');

const router = express.Router();

router.get('/wishlist', auth(), userController.getWishlist);
router.post('/wishlist', auth(), userController.addToWishlist);
router.delete('/wishlist/:productId', auth(), userController.removeFromWishlist);

module.exports = router;
