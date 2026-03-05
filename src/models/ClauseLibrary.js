const mongoose = require("mongoose");

// Clause Library for reusable legal/HR/compliance clauses
const clauseLibrarySchema = new mongoose.Schema({
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
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['hr', 'legal', 'finance', 'compliance', 'sales', 'other']
    },
    subcategory: {
        type: String // termination, confidentiality, payment, liability, etc.
    },
    content: {
        type: String,
        required: true
    },
    description: String,
    tags: [String],
    isDefault: {
        type: Boolean,
        default: false // System-provided vs user-created
    },
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },
    jurisdiction: {
        type: String, // US, UK, India, EU, etc.
        default: 'general'
    },
    language: {
        type: String,
        default: 'en'
    },
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsed: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    // AI-powered risk analysis
    riskAnalysis: {
        hasIssues: Boolean,
        issues: [{
            type: { type: String }, // ambiguous, missing-info, risky
            description: String,
            severity: String, // low, medium, high, critical
            suggestion: String
        }],
        lastAnalyzed: Date
    }
}, { timestamps: true });

clauseLibrarySchema.index({ userId: 1, category: 1, isActive: 1 });
clauseLibrarySchema.index({ tags: 1 });

module.exports = mongoose.model("ClauseLibrary", clauseLibrarySchema);
