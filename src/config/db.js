const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB already connected');
            return mongoose;
        }

        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        console.log('MongoDB Connected successfully');
        return mongoose;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // process.exit(1); // Don't exit in serverless environment
        throw error;
    }
};

module.exports = connectDB;
