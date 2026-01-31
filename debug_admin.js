const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// Load env vars
const result = dotenv.config();
if (result.error) {
    dotenv.config({ path: path.join(__dirname, '.env') });
}

const debugAdmin = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/rentlify';
        console.log('Connecting to MongoDB...');

        await mongoose.connect(mongoUrl);
        console.log('Connected.');

        const adminEmail = 'admin@rentlify.com';
        const user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.error('ERROR: Admin user NOT found in database!');
        } else {
            console.log('User found:');
            console.log('  ID:', user._id);
            console.log('  Email:', user.email);
            console.log('  Role:', user.role);
            console.log('  Email Verified:', user.isEmailVerified);
            console.log('  Password Hash:', user.password ? 'Present (Hidden)' : 'MISSING');

            // Test password
            const isMatch = await bcrypt.compare('admin123', user.password);
            console.log('---------------------------------------------------');
            console.log(`Password check for "admin123": ${isMatch ? 'PASSED ✅' : 'FAILED ❌'}`);
            console.log('---------------------------------------------------');

            if (!isMatch) {
                console.log('Attempting to fix password...');
                user.password = 'admin123'; // Triggers pre-save hook
                await user.save();
                console.log('Password updated. Re-verifying...');
                const newMatch = await bcrypt.compare('admin123', user.password);
                console.log(`Re-verification: ${newMatch ? 'PASSED ✅' : 'FAILED ❌'}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Debug script error:', error);
        process.exit(1);
    }
};

debugAdmin();
