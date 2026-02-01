const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const Invoice = require('../src/models/Invoice');
const Order = require('../src/models/Order');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('DB Connection Failed', err);
        process.exit(1);
    }
};

const fixVendorData = async (email) => {
    await connectDB();

    try {
        console.log(`\n--- Fixing Data for ${email} ---`);

        // 1. Fix User Role
        const user = await User.findOne({ email });
        if (!user) {
            console.error('User not found!');
            process.exit(1);
        }

        if (user.role !== 'vendor') {
            user.role = 'vendor';
            await user.save();
            console.log(`Updated User Role to 'vendor'`);
        } else {
            console.log(`User Role is correct: ${user.role}`);
        }

        // 2. Fix/Get Vendor Profile
        let vendor = await Vendor.findOne({ user: user._id });
        if (!vendor) {
            console.log('Vendor profile missing. Creating one...');
            vendor = await Vendor.create({
                user: user._id,
                businessName: "Navnit's Business (Restored)",
                address: {
                    street: "123 Main St",
                    city: "Tech City",
                    state: "TC",
                    zip: "10001",
                    country: "India"
                }
            });
            console.log(`Created new Vendor Profile: ${vendor._id}`);
        } else {
            console.log(`Found existing Vendor Profile: ${vendor._id}`);
        }

        // 3. Find Invoices that SHOULD belong to this vendor
        // Strategy: Find any invoice linked to an Order where this User is the 'customer' (wait, no, they are the vendor).
        // Strategy: Find any invoice that might have been "lost".
        // Let's look for Invoices linked to this Vendor ID first.
        const linkedInvoices = await Invoice.find({ vendor: vendor._id });
        console.log(`Currently visible invoices (Vendor ID match): ${linkedInvoices.length}`);

        // 4. Aggressive Fix: Find ANY invoice created by this USER ID (if logic was wrong before) 
        // OR update based on Orders.
        // Let's find Orders where items.vendor matches the CURRENT vendor ID.
        const orders = await Order.find({ 'items.vendor': vendor._id });
        console.log(`Found ${orders.length} orders for this vendor.`);

        for (const order of orders) {
            // Find invoices for this order
            // We want to ensure there is an invoice for this order/vendor pair
            const invoices = await Invoice.find({ order: order._id });

            // If invoice exists but has WRONG vendor ID, fix it.
            for (const inv of invoices) {
                if (inv.vendor.toString() !== vendor._id.toString()) {
                    console.log(`Fixing Invoice ${inv.invoiceNumber}: Vendor mismatch. ${inv.vendor} -> ${vendor._id}`);
                    inv.vendor = vendor._id;
                    await inv.save();
                }
            }
        }

        console.log('--- Data Fix Complete ---');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

fixVendorData('kumarnavnit623@gmail.com');
