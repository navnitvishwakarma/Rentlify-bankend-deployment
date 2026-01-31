const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
    key: {
        type: String, // e.g., 'general_config'
        required: true,
        unique: true,
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Flexible structure
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true,
});

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
