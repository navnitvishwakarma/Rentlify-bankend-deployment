const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./src/models/User');

// Load env vars
const result = dotenv.config();
if (result.error) {
    dotenv.config({ path: path.join(__dirname, '.env') });
}

const resetAdmin = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/rentlify';
        console.log('Connecting to MongoDB...');

        await mongoose.connect(mongoUrl);
        console.log('Connected.');

        const adminEmail = 'admin@rentlify.com';

        // Delete existing
        await User.deleteOne({ email: adminEmail });
        console.log('Deleted existing admin if any.');

        // Create fresh
        const adminUser = new User({
            name: 'System Administrator',
            email: adminEmail,
            password: 'admin123',
            role: 'admin',
            isEmailVerified: true,
        });

        await adminUser.save();

        console.log('Admin user recreated successfully!');
        console.log('Email:', adminEmail);
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting admin:', error);
        process.exit(1);
    }
};

resetAdmin();
