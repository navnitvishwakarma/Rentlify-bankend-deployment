const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./src/models/User');

// Load env vars
// Try default first, then specific path if needed
const result = dotenv.config();
if (result.error) {
    console.log("Error loading .env, trying explicit path");
    dotenv.config({ path: path.join(__dirname, '.env') });
}

const createAdmin = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/rentlify';
        console.log('Connecting to MongoDB...', mongoUrl.replace(/:([^:@]+)@/, ':****@')); // Mask password

        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@rentlify.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists:', adminEmail);
            console.log('Role:', existingAdmin.role);
            if (existingAdmin.role !== 'admin') {
                console.log('User exists but not admin. Updating role...');
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('Role updated to admin.');
            }
            process.exit(0);
        }

        const adminUser = await User.create({
            name: 'System Administrator',
            email: adminEmail,
            password: 'admin123', // Will be hashed by pre-save hook
            role: 'admin',
            isEmailVerified: true,
        });

        console.log('Admin user created successfully!');
        console.log('Email:', adminUser.email);
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
