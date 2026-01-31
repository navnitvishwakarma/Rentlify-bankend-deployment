const mongoose = require('mongoose');
const Vendor = require('./src/models/Vendor');
const User = require('./src/models/User');
require('dotenv').config();

const getLoginForNewVendor = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const targetId = '697dd1db6228077d18ab1c89';
        console.log(`Searching for ID: ${targetId}`);

        // Check Vendor
        const vendor = await Vendor.findById(targetId).populate('user');
        if (vendor) {
            console.log('Found as VENDOR');
            console.log('Business:', vendor.businessName);
            if (vendor.user) {
                console.log('Linked User Email:', vendor.user.email);
            } else {
                console.log('No linked user found for this vendor.');
            }
        } else {
            console.log('Not found in Vendor collection.');
        }

        // Check User
        const user = await User.findById(targetId);
        if (user) {
            console.log('Found as USER');
            console.log('Name:', user.name);
            console.log('Email:', user.email);
            console.log('Role:', user.role);

            // If it is a user, maybe see if they have a vendor profile?
            const linkedVendor = await Vendor.findOne({ user: user._id });
            if (linkedVendor) {
                console.log('Linked Vendor Profile ID:', linkedVendor._id);
            }
        } else {
            console.log('Not found in User collection.');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

getLoginForNewVendor();
