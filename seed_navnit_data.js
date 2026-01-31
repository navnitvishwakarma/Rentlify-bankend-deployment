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

        // 3. Create Multiple Customers
        const customers = [];
        for (let i = 0; i < 15; i++) {
            const email = `customer${i}@rentlify.com`;
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    name: `Customer ${i}`,
                    email: email,
                    password: 'password123',
                    role: 'customer',
                    isEmailVerified: true
                });
            }
            customers.push(user);
        }
        console.log(`Created ${customers.length} Customers`);

        // 4. Create Multiple Vendors
        const vendors = []; // [{ user, profile }]
        for (let i = 0; i < 8; i++) {
            const email = `vendor${i}@rentlify.com`;
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    name: `Vendor ${i}`,
                    email: email,
                    password: 'password123',
                    role: 'vendor',
                    businessName: `Vendor Business ${i}`,
                    isEmailVerified: true
                });
            }
            let profile = await Vendor.findOne({ user: user._id });
            if (!profile) {
                profile = await Vendor.create({
                    user: user._id,
                    businessName: user.businessName,
                    address: { city: 'Delhi', state: 'New Delhi' },
                    rating: 4.0 + (Math.random())
                });
            }
            vendors.push({ user, profile });
        }
        // Add main navnit vendor
        vendors.push({ user: vendorUser, profile: vendorProfile });
        console.log(`Created ${vendors.length} Vendors`);


        // 5. Create Products for All Vendors
        const categories = ['Cameras', 'Lenses', 'Lighting', 'Drones', 'Audio', 'Mounts'];
        const productNames = ['Sony A7III', 'Canon R5', 'DJI Mavic 3', 'Godox SL60W', 'Sony 24-70mm GM', 'Rode Wireless Go', 'GoPro Hero 11'];

        let allProducts = [];

        for (const v of vendors) {
            let existingProducts = await Product.find({ vendor: v.profile._id });
            if (existingProducts.length < 3) {
                for (let k = 0; k < randomInt(3, 8); k++) {
                    const name = randomItem(productNames) + ' ' + randomInt(1, 100);
                    const p = await Product.create({
                        vendor: v.profile._id,
                        name: name,
                        description: `Professional gear from ${v.user.name}.`,
                        category: randomItem(categories),
                        images: ['https://placehold.co/600x400?text=' + name.replace(/ /g, '+')],
                        pricing: { daily: randomInt(500, 5000), weekly: randomInt(3000, 20000) },
                        totalQuantity: randomInt(1, 5),
                        isActive: true
                    });
                    existingProducts.push(p);
                }
            }
            allProducts = allProducts.concat(existingProducts);
        }
        console.log(`Ensured Products for all vendors`);

        // 6. Create Orders (Past & Present)
        const today = new Date();
        const months = [0, 1, 2, 3, 4, 5];

        for (const m of months) {
            const orderCount = randomInt(8, 20); // More orders
            for (let k = 0; k < orderCount; k++) {
                // Random customer
                const customer = randomItem(customers);
                // Random product
                const product = randomItem(allProducts);

                const date = new Date();
                date.setMonth(today.getMonth() - m);
                date.setDate(randomInt(1, 28));

                let status = 'completed';
                let itemStatus = 'completed';

                // Month 0 (Current)
                if (m === 0) {
                    const r = Math.random();
                    if (r < 0.3) { status = 'confirmed'; itemStatus = 'pending'; } // Upcoming
                    else if (r < 0.7) { status = 'in-progress'; itemStatus = 'active'; } // Active now
                    else { status = 'completed'; itemStatus = 'completed'; }
                } else if (m === 1) {
                    if (Math.random() < 0.1) { status = 'in-progress'; itemStatus = 'active'; }
                }

                const days = randomInt(2, 7);
                const price = product.pricing.daily * days;

                try {
                    await Order.create({
                        customer: customer._id,
                        totalAmount: price,
                        status: status,
                        paymentStatus: 'paid', // Assume paid for simplicity
                        items: [{
                            product: product._id,
                            vendor: product.vendor,
                            quantity: 1,
                            startDate: date,
                            endDate: new Date(date.getTime() + 86400000 * days),
                            price: price,
                            status: itemStatus
                        }],
                        createdAt: date
                    });
                } catch (e) {
                    // ignore duplicates or validation errors during seed
                }
            }
        }
        console.log('Created extensive order history');

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
