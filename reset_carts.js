const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cart = require('./src/models/Cart');

dotenv.config();

const resetCarts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await Cart.deleteMany({});
        console.log('All carts cleared');

        process.exit(0);
    } catch (error) {
        console.error('Error clearing carts:', error);
        process.exit(1);
    }
};

resetCarts();
