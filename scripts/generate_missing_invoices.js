const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const Order = require('../src/models/Order');
const Product = require('../src/models/Product');
const Invoice = require('../src/models/Invoice');

// Connect DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('DB Connection Failed', err);
        process.exit(1);
    }
};

const generateInvoices = async (email) => {
    await connectDB();

    try {
        // 1. Find the Vendor User
        const user = await User.findOne({ email });
        if (!user) {
            console.error('User not found:', email);
            process.exit(1);
        }
        console.log(`Found User: ${user.name} (${user._id})`);

        // 2. Find the Vendor Profile
        const vendor = await Vendor.findOne({ user: user._id });
        if (!vendor) {
            console.error('Vendor profile not found for this user.');
            process.exit(1);
        }
        console.log(`Found Vendor Profile: ${vendor.businessName} (${vendor._id})`);

        // 3. Find all Orders containing items from this vendor
        // We look for orders where at least one item has this vendor ID
        const orders = await Order.find({ 'items.vendor': vendor._id });
        console.log(`Found ${orders.length} potential orders containing this vendor's items.`);

        let createdCount = 0;

        for (const order of orders) {
            // Check if invoice already exists for this order + vendor
            const existingInvoice = await Invoice.findOne({
                order: order._id,
                vendor: vendor._id
            });

            if (existingInvoice) {
                console.log(`Invoice already exists for Order ${order._id}. Skipping.`);
                continue;
            }

            // Filter items specific to this vendor
            const vendorItems = order.items.filter(item => item.vendor.toString() === vendor._id.toString());

            if (vendorItems.length === 0) {
                continue;
            }

            // Calculate totals
            const subtotal = vendorItems.reduce((sum, item) => sum + (item.price || 0), 0);
            const taxAmount = subtotal * 0.18; // 18% Tax
            const total = subtotal + taxAmount;

            // Prepare Invoice Items data (need product name)
            const invoiceItems = [];
            for (const item of vendorItems) {
                const product = await Product.findById(item.product);
                invoiceItems.push({
                    description: product ? product.name : 'Unknown Product',
                    quantity: item.quantity,
                    unitPrice: (item.price || 0) / (item.quantity || 1),
                    amount: item.price || 0
                });
            }

            // Create Invoice
            const invoiceData = {
                invoiceNumber: `INV-BACKFILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                order: order._id,
                customer: order.customer, // Use order's customer
                vendor: vendor._id,
                items: invoiceItems,
                subtotal: subtotal,
                taxAmount: taxAmount,
                totalAmount: total,
                status: 'paid', // Assuming paid for past orders
                dueDate: order.createdAt,
                createdAt: order.createdAt // Backdate to order time
            };

            await Invoice.create(invoiceData);
            console.log(`Created Invoice for Order ${order._id}: ₹${total}`);
            createdCount++;
        }

        console.log(`\nSuccess! Created ${createdCount} missing invoices.`);

    } catch (error) {
        console.error('Error generating invoices:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

// Run
const targetEmail = 'kumarnavnit623@gmail.com';
generateInvoices(targetEmail);
