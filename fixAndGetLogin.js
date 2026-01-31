const mongoose = require('mongoose');
const Vendor = require('./src/models/Vendor');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
require('dotenv').config();

const fixAndGetLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const userId = '697dd1db6228077d18ab1c89';
        console.log(`Checking User ID: ${userId}`);

        const user = await User.findById(userId);
        if (!user) {
            console.log('User NOT found with this ID.');
            process.exit(1);
        }

        console.log('User FOUND:');
        console.log(`Email: ${user.email}`);
        console.log(`Name: ${user.name}`);

        // Find associated Vendor profile
        let vendor = await Vendor.findOne({ user: userId });

        if (!vendor) {
            console.log('No Vendor profile found for this user. Creating one...');
            vendor = await Vendor.create({
                user: userId,
                businessName: `${user.name}'s Business`, // Default name
                businessType: 'Retail',
                phone: '1234567890',
                address: 'Default Address'
            });
            console.log('Created new Vendor profile.');
        }

        console.log(`Vendor Profile ID: ${vendor._id}`);

        // Fix Product Assignment
        console.log('Re-assigning products to the correct Vendor ID...');
        const result = await Product.updateMany({}, { $set: { vendor: vendor._id } });
        console.log(`Fixed ${result.modifiedCount} products. Assigned to Vendor ID: ${vendor._id}`);

        console.log('--- LOGIN DETAILS ---');
        console.log(`Email: ${user.email}`);
        console.log('---------------------');

        mongoose.disconnect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixAndGetLogin();
