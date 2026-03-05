const mongoose = require("mongoose");

// AI Document Chat - Chat with generated documents
const documentChatSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Chat history
    messages: [{
        messageId: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['user', 'assistant', 'system'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        // For citations and references
        references: [{
            section: String,
            content: String,
            position: Object
        }],
        // AI metadata
        aiModel: String,
        tokensUsed: Number,
        responseTime: Number
    }],
    // Document context (cached for performance)
    documentContext: {
        title: String,
        type: String,
        contentSummary: String,
        keyPoints: [String],
        lastUpdated: Date
    },
    // Chat statistics
    stats: {
        totalMessages: {
            type: Number,
            default: 0
        },
        totalTokensUsed: {
            type: Number,
            default: 0
        },
        lastInteraction: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

documentChatSchema.index({ documentId: 1, userId: 1 });
documentChatSchema.index({ userId: 1, 'stats.lastInteraction': -1 });

module.exports = mongoose.model("DocumentChat", documentChatSchema);
