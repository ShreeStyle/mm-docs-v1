const mongoose = require("mongoose");

// Organization model for team/company workspaces
const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    industry: {
        type: String,
        enum: ['startup', 'saas', 'hr-services', 'legal-services', 'finance', 'healthcare', 'education', 'retail', 'manufacturing', 'other'],
        default: 'other'
    },
    size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
        default: '1-10'
    },
    // Team members
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'manager', 'member', 'viewer'],
            default: 'member'
        },
        department: {
            type: String,
            enum: ['hr', 'legal', 'finance', 'sales', 'operations', 'it', 'other']
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    // Subscription
    plan: {
        type: String,
        enum: ['free', 'team', 'business', 'enterprise'],
        default: 'free'
    },
    subscriptionStatus: {
        type: String,
        enum: ['trial', 'active', 'suspended', 'cancelled'],
        default: 'trial'
    },
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,
    // Limits
    limits: {
        maxMembers: {
            type: Number,
            default: 5
        },
        maxDocuments: {
            type: Number,
            default: 100
        },
        maxStorage: {
            type: Number,
            default: 1024 // MB
        }
    },
    // Settings
    settings: {
        defaultWorkflow: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkflowTemplate"
        },
        requireApproval: {
            type: Boolean,
            default: false
        },
        allowExternalSharing: {
            type: Boolean,
            default: true
        },
        enableAIFeatures: {
            type: Boolean,
            default: true
        },
        defaultLanguage: {
            type: String,
            default: 'en'
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    // Branding
    branding: {
        logo: String,
        primaryColor: String,
        domain: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

organizationSchema.index({ slug: 1 });
organizationSchema.index({ 'members.userId': 1 });

module.exports = mongoose.model("Organization", organizationSchema);
