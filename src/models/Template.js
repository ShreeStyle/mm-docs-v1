const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    templateId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['hr', 'legal', 'sales', 'finance', 'compliance']
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: '📄'
    },
    displayOrder: {
        type: Number,
        default: null // null means no special ordering, sort by name
    },
    previewImage: {
        type: String,
        default: null // Path to preview image/PDF
    },
    requiredFields: [{
        fieldName: {
            type: String,
            required: true
        },
        fieldType: {
            type: String,
            required: true,
            enum: ['text', 'textarea', 'number', 'date', 'email', 'select']
        },
        label: {
            type: String,
            required: true
        },
        placeholder: String,
        required: {
            type: Boolean,
            default: true
        },
        options: [String] // For select fields
    }],
    content: {
        type: String,
        required: true // HTML template with placeholders
    },
    placeholders: [{
        placeholder: String,
        description: String,
        fieldMapping: String // Maps to requiredFields.fieldName
    }],
    metadata: {
        version: {
            type: String,
            default: '1.0.0'
        },
        tags: [String],
        isActive: {
            type: Boolean,
            default: true
        },
        featured: {
            type: Boolean,
            default: false
        },
        usageCount: {
            type: Number,
            default: 0
        },
        createdAt: Date,
        updatedAt: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries including displayOrder
templateSchema.index({ displayOrder: 1, category: 1, 'metadata.isActive': 1 });

module.exports = mongoose.model('Template', templateSchema);