const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const testConnection = async () => {
    const uri = process.env.MONGODB_URL || process.env.MONGODB_URI;
    console.log('Testing connection to:', uri.replace(/:([^:@]+)@/, ':****@'));

    try {
        await mongoose.connect(uri);
        console.log('✅ Success! Connected to MongoDB Atlas.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        process.exit(1);
    }
};

testConnection();
