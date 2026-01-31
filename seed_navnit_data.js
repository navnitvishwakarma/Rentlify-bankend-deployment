const mongoose = require('mongoose');
const User = require('./src/models/User');
const Vendor = require('./src/models/Vendor');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');
const connectDB = require('./src/config/db');

// Random helper
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        // 1. Create/Find Vendor User
        let vendorUser = await User.findOne({ email: 'kumarnavnit623@gmail.com' });
        if (!vendorUser) {
            vendorUser = await User.create({
                name: 'Navnit Kumar',
                email: 'kumarnavnit623@gmail.com',
                password: 'password123',
                role: 'vendor',
                businessName: 'Navnit Camera Rentals',
                isEmailVerified: true
            });
            console.log('Created Vendor User');
        } else {
            console.log('Vendor User exists');
        }

        // 2. Create/Find Vendor Profile
        let vendorProfile = await Vendor.findOne({ user: vendorUser._id });
        if (!vendorProfile) {
            vendorProfile = await Vendor.create({
                user: vendorUser._id,
                businessName: vendorUser.businessName,
                address: { city: 'Mumbai', state: 'Maharashtra' },
                rating: 4.8
            });
            console.log('Created Vendor Profile');
        }

        // 3. Create/Find Customer User (to place orders)
        let customerUser = await User.findOne({ email: 'customer@rentlify.com' });
        if (!customerUser) {
            customerUser = await User.create({
                name: 'John Doe',
                email: 'customer@rentlify.com',
                password: 'password123',
                role: 'customer',
                isEmailVerified: true
            });
            console.log('Created Customer User');
        }

        // 4. Create Products
        const categories = ['Cameras', 'Lenses', 'Lighting', 'Drones'];
        const productNames = ['Sony A7III', 'Canon R5', 'DJI Mavic 3', 'Godox SL60W', 'Sony 24-70mm GM'];

        let products = await Product.find({ vendor: vendorProfile._id });
        if (products.length < 5) {
            for (let i = 0; i < 5; i++) {
                const p = await Product.create({
                    vendor: vendorProfile._id,
                    name: productNames[i],
                    description: `Professional ${productNames[i]} for rent. High quality.`,
                    category: categories[i % categories.length],
                    images: ['https://placehold.co/600x400?text=' + productNames[i].replace(/ /g, '+')],
                    pricing: { daily: randomInt(500, 5000), weekly: randomInt(3000, 20000) },
                    totalQuantity: randomInt(2, 10),
                    isActive: true
                });
                products.push(p);
            }
            console.log('Created Products');
        }

        // 5. Create Orders (Past & Present)
        // We want data for the last 6 months
        // 5. Create Orders (Past & Present)
        const today = new Date();
        const months = [0, 1, 2, 3, 4, 5];

        for (const m of months) {
            const orderCount = randomInt(2, 4);
            for (let k = 0; k < orderCount; k++) {
                const date = new Date();
                date.setMonth(today.getMonth() - m);
                date.setDate(randomInt(1, 28));

                let status = 'completed';
                let itemStatus = 'completed';
                if (m === 0) {
                    status = randomItem(['confirmed', 'in-progress', 'completed']);
                    if (status === 'in-progress') itemStatus = 'active';
                }

                const product = randomItem(products);
                const quantity = 1;
                const price = product.pricing.daily * randomInt(1, 5);

                try {
                    await Order.create({
                        customer: customerUser._id,
                        totalAmount: price,
                        status: status,
                        paymentStatus: 'paid',
                        items: [{
                            product: product._id,
                            vendor: vendorProfile._id,
                            quantity: quantity,
                            startDate: date,
                            endDate: new Date(date.getTime() + 86400000 * 2), // +2 days
                            price: price,
                            status: itemStatus
                        }],
                        createdAt: date
                    });
                } catch (err) {
                    console.error("Order Failed", err.message);
                }
            }
        }
        console.log('Created Orders with History');

        console.log('✅ Seeding Complete!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`Validation Error [${key}]: ${error.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

seed();
