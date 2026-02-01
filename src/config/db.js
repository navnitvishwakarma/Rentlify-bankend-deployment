const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB already connected');
            return mongoose;
        }

        const opts = {
            ...config.mongoose.options,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: false, // Fail fast if no connection
        };

        await mongoose.connect(config.mongoose.url, opts);
        console.log('MongoDB Connected successfully');
        return mongoose;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // process.exit(1); // Don't exit in serverless environment
        throw error;
    }
};

module.exports = connectDB;
