const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    fieldName: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    frequency: {
        type: Number,
        default: 1
    },
    lastUsed: {
        type: Date,
        default: Date.now
    },
    metadata: {
        category: String, // e.g., 'finance', 'hr'
        templateId: String
    }
}, {
    timestamps: true
});

// Primary index for fetching suggestions for a specific field
userPreferenceSchema.index({ userId: 1, fieldName: 1, frequency: -1 });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
