const mongoose = require("mongoose");

// Workflow and approval system for documents
const workflowSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
        index: true
    },
    workflowType: {
        type: String,
        enum: ['sequential', 'parallel', 'conditional'],
        default: 'sequential'
    },
    status: {
        type: String,
        enum: ['draft', 'in-review', 'approved', 'rejected', 'completed'],
        default: 'draft'
    },
    // Workflow stages
    stages: [{
        stageId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true // e.g., "Manager Approval", "Legal Review", "Final Approval"
        },
        role: {
            type: String, // hr, legal, finance, manager, director
            required: true
        },
        assignedTo: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'approved', 'rejected', 'skipped'],
            default: 'pending'
        },
        order: {
            type: Number,
            required: true
        },
        dueDate: Date,
        completedAt: Date,
        completedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        comments: String,
        requiredApprovals: {
            type: Number,
            default: 1 // Number of approvals needed (for parallel approvals)
        },
        approvals: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            decision: {
                type: String,
                enum: ['approved', 'rejected']
            },
            comments: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    // Workflow metadata
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    currentStageIndex: {
        type: Number,
        default: 0
    },
    completedAt: Date,
    rejectedAt: Date,
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    rejectionReason: String,
    // Notifications
    notifications: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        type: String, // approval-needed, approved, rejected, reminder
        sentAt: Date,
        read: {
            type: Boolean,
            default: false
        }
    }],
    // SLA tracking
    sla: {
        expectedCompletionDate: Date,
        actualCompletionDate: Date,
        isOnTime: Boolean
    }
}, { timestamps: true });

workflowSchema.index({ documentId: 1, status: 1 });
workflowSchema.index({ 'stages.assignedTo': 1, status: 1 });

module.exports = mongoose.model("Workflow", workflowSchema);
