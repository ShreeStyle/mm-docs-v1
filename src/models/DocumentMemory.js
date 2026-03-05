const mongoose = require("mongoose");

// Smart Document Memory - Learns from user's document generation patterns
const documentMemorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization", // For team-wide memory
        default: null
    },
    // Brand voice and style memory
    brandVoice: {
        tone: { type: String, default: "professional" }, // professional, casual, formal, friendly
        vocabulary: [String], // Commonly used words/phrases
        writingStyle: String, // concise, detailed, technical, simple
        preferredPhrases: [String]
    },
    // Frequently used clauses (for legal/HR docs)
    commonClauses: [{
        type: { type: String }, // termination, confidentiality, payment, etc.
        text: String,
        category: String, // hr, legal, finance
        usageCount: { type: Number, default: 0 },
        lastUsed: Date
    }],
    // Document preferences
    documentPreferences: {
        defaultTemplates: [{
            category: String,
            templateId: String
        }],
        formatting: {
            preferredFont: String,
            fontSize: Number,
            lineSpacing: String,
            margins: String
        },
        structure: {
            includeCoverPage: Boolean,
            includeTableOfContents: Boolean,
            includeFooter: Boolean,
            includePageNumbers: Boolean
        }
    },
    // Historical document patterns
    patterns: {
        mostUsedDocTypes: [{
            type: String,
            count: Number
        }],
        averageDocLength: Number,
        commonRecipients: [String],
        frequentKeywords: [String]
    },
    // AI learning data
    aiLearning: {
        acceptedSuggestions: [String],
        rejectedSuggestions: [String],
        customInstructions: String,
        improvementFeedback: [{
            documentId: mongoose.Schema.Types.ObjectId,
            feedback: String,
            timestamp: Date
        }]
    }
}, { timestamps: true });

documentMemorySchema.index({ userId: 1, organizationId: 1 });

module.exports = mongoose.model("DocumentMemory", documentMemorySchema);
