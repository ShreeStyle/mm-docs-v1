const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema({
    shareId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    expiresAt: {
        type: Date,
        default: null, // null means no expiration
    },
    password: {
        type: String,
        default: null, // Optional password protection
    },
    views: {
        type: Number,
        default: 0,
    },
    viewHistory: [{
        timestamp: { type: Date, default: Date.now },
        ipHash: String, // Hashed IP for privacy
        userAgent: String,
    }],
}, { timestamps: true });

// Check if share is valid
shareSchema.methods.isValid = function () {
    if (!this.isActive) return false;
    if (this.expiresAt && this.expiresAt < new Date()) return false;
    return true;
};

module.exports = mongoose.model("Share", shareSchema);
