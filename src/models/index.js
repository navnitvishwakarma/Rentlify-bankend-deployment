// Centralized model registration
const User = require('./User');
const Vendor = require('./Vendor');
const Product = require('./Product');
const Cart = require('./Cart');
const Order = require('./Order');
const Invoice = require('./Invoice');
const Reservation = require('./Reservation');
const Quotation = require('./Quotation');
const Payment = require('./Payment');
const Pickup = require('./Pickup');
const Return = require('./Return');
const Settings = require('./Settings');

module.exports = {
    User,
    Vendor,
    Product,
    Cart,
    Order,
    Invoice,
    Reservation,
    Quotation,
    Payment,
    Pickup,
    Return,
    Settings
};
