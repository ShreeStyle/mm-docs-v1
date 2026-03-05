const mongoose = require("mongoose");

// E-signature tracking for documents
const signatureSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
        index: true
    },
    // Signatories
    signatories: [{
        email: {
            type: String,
            required: true
        },
        name: String,
        role: String, // Employee, Employer, Client, Vendor, etc.
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" // If they're a platform user
        },
        status: {
            type: String,
            enum: ['pending', 'viewed', 'signed', 'declined'],
            default: 'pending'
        },
        order: Number, // Signing order (1, 2, 3...)
        signatureData: {
            type: String // Base64 or signature image URL
        },
        signedAt: Date,
        ipAddress: String,
        userAgent: String,
        location: Object, // { country, city }
        declinedAt: Date,
        declineReason: String,
        remindersSent: {
            type: Number,
            default: 0
        },
        lastReminderAt: Date
    }],
    // Document metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'partially-signed', 'fully-signed', 'completed', 'declined', 'expired'],
        default: 'draft'
    },
    sentAt: Date,
    completedAt: Date,
    expiresAt: Date,
    // Security
    accessCode: String, // Optional PIN for viewing
    requireAuthentication: {
        type: Boolean,
        default: false
    },
    // Audit trail
    auditTrail: [{
        event: String, // sent, viewed, signed, downloaded, etc.
        email: String,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: String,
        details: Object
    }],
    // Integration with payments (if invoice)
    paymentRequired: {
        type: Boolean,
        default: false
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentAmount: Number,
    paymentCurrency: {
        type: String,
        default: 'USD'
    },
    paymentTransactionId: String,
    paidAt: Date,
    // Settings
    settings: {
        reminderFrequency: {
            type: Number,
            default: 3 // Days
        },
        allowDecline: {
            type: Boolean,
            default: true
        },
        requireAllSignatures: {
            type: Boolean,
            default: true
        },
        signInOrder: {
            type: Boolean,
            default: false
        }
    },
    // Legal compliance
    certificate: {
        certificateId: String,
        issueDate: Date,
        validUntil: Date,
        certificateUrl: String
    }
}, { timestamps: true });

signatureSchema.index({ 'signatories.email': 1, status: 1 });
signatureSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model("Signature", signatureSchema);
