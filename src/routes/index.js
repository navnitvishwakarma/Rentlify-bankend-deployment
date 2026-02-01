const express = require('express');
const authRoute = require('./auth.routes');
const vendorRoute = require('./vendor.routes');
const productRoute = require('./product.routes');
const quotationRoute = require('./quotation.routes');
const orderRoute = require('./order.routes');
const invoiceRoute = require('./invoice.routes');
const adminRoute = require('./admin.routes');
const cartRoute = require('./cart.routes');

const router = express.Router();

const defaultRoutes = [
    {
        path: '/auth',
        route: authRoute,
    },
    {
        path: '/admin',
        route: adminRoute,
    },
    {
        path: '/vendors',
        route: vendorRoute,
    },
    {
        path: '/products',
        route: productRoute,
    },
    {
        path: '/orders',
        route: orderRoute,
    },
    {
        path: '/quotations',
        route: quotationRoute,
    },
    {
        path: '/invoices',
        route: invoiceRoute,
    },
    {
        path: '/cart',
        route: cartRoute,
    },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
