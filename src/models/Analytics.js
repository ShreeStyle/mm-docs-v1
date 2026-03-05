const mongoose = require("mongoose");

// Analytics and usage tracking
const analyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        default: null
    },
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    // Document metrics
    documents: {
        totalGenerated: {
            type: Number,
            default: 0
        },
        byType: [{
            type: String,
            count: Number
        }],
        byCategory: [{
            category: String,
            count: Number
        }],
        completed: {
            type: Number,
            default: 0
        },
        inProgress: {
            type: Number,
            default: 0
        }
    },
    // Template usage
    templates: {
        mostUsed: [{
            templateId: String,
            templateName: String,
            usageCount: Number
        }],
        totalTemplatesUsed: Number
    },
    // Time metrics
    timeMetrics: {
        averageGenerationTime: Number, // seconds
        totalTimeSaved: Number, // minutes (estimated vs manual)
        peakUsageHours: [Number] // Array of hours (0-23)
    },
    // Collaboration metrics
    collaboration: {
        documentsShared: Number,
        collaborators: Number,
        commentsAdded: Number,
        approvalsCompleted: Number
    },
    // AI usage
    aiMetrics: {
        totalAIRequests: Number,
        tokensUsed: Number,
        averageResponseTime: Number,
        chatSessions: Number
    },
    // Signature metrics
    signatures: {
        sentForSignature: Number,
        completed: Number,
        pending: Number,
        declined: Number,
        averageCompletionTime: Number // hours
    },
    // User activity
    activity: {
        activeUsers: Number,
        newUsers: Number,
        documentViews: Number,
        documentDownloads: Number
    },
    // Financial (for invoices, payments)
    financial: {
        invoicesGenerated: Number,
        totalAmount: Number,
        paidInvoices: Number,
        pendingAmount: Number
    }
}, { timestamps: true });

analyticsSchema.index({ userId: 1, period: 1, date: -1 });
analyticsSchema.index({ organizationId: 1, period: 1, date: -1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
