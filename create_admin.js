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

const connectDB = require('./src/config/db');

const createAdmin = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@rentlify.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists:', adminEmail);
            console.log('Role:', existingAdmin.role);

            // Force update password and ensure role is admin
            existingAdmin.password = 'admin123';
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('Admin credentials updated (Password: admin123, Role: admin)');

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
