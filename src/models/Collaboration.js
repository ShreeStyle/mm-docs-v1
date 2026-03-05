const mongoose = require("mongoose");

// Real-time collaboration on documents
const collaborationSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
        index: true
    },
    // Collaborators with permissions
    collaborators: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role: {
            type: String,
            enum: ['owner', 'editor', 'commenter', 'viewer'],
            default: 'viewer'
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        lastActive: Date
    }],
    // Comments and discussions
    comments: [{
        commentId: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true
        },
        position: {
            type: Object // { paragraph: 2, startChar: 10, endChar: 25 }
        },
        isResolved: {
            type: Boolean,
            default: false
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        resolvedAt: Date,
        replies: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            content: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Active editing sessions (for real-time presence)
    activeSessions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        sessionId: String,
        cursorPosition: Object,
        lastActivity: {
            type: Date,
            default: Date.now
        }
    }],
    // Activity log
    activityLog: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        action: {
            type: String, // viewed, edited, commented, shared, etc.
            required: true
        },
        details: Object,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        allowComments: {
            type: Boolean,
            default: true
        },
        allowEditing: {
            type: Boolean,
            default: true
        },
        trackChanges: {
            type: Boolean,
            default: true
        }
    }
}, { timestamps: true });

collaborationSchema.index({ documentId: 1, 'collaborators.userId': 1 });
collaborationSchema.index({ 'comments.isResolved': 1 });

module.exports = mongoose.model("Collaboration", collaborationSchema);
