const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "Untitled Document" },
    type: {
        type: String,
        default: "other",
    },
    content: { type: Object, default: {} }, // Flexible JSON structure for AI content
    brandKitId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandKit" }, // Optional link to specific brand kit
    
    // Template information
    templateId: { type: String },
    
    // Document Editor Features (PandaDoc-style)
    recipients: [{
        role: { type: String, enum: ['CLIENT', 'SENDER', 'CUSTOM'], required: true }, // CLIENT, SENDER, or custom role
        name: { type: String, required: true },
        email: { type: String, required: true },
        order: { type: Number, default: 0 },
        addedAt: { type: Date, default: Date.now }
    }],
    
    // PDF/Document content
    documentContent: {
        originalPdf: String, // URL or file path to original PDF
        pages: { type: Number, default: 1 },
        annotations: [{ // Paint/drawing annotations
            type: { type: String, enum: ['pencil', 'highlighter', 'text', 'shape', 'eraser'] },
            page: Number,
            data: Object, // Canvas data for the annotation
            color: String,
            size: Number,
            position: {
                x: Number,
                y: Number
            }
        }]
    },
    
    // Fillable fields (Signature, Text, Date, etc.)
    fields: [{
        fieldType: { type: String, enum: ['signature', 'initials', 'text', 'date', 'file-upload', 'radio', 'checkbox', 'dropdown', 'card-details', 'stamp'], required: true },
        label: { type: String, required: true },
        page: { type: Number, required: true },
        position: {
            x: { type: Number, required: true },
            y: { type: Number, required: true }
        },
        size: {
            width: { type: Number, required: true },
            height: { type: Number, required: true }
        },
        properties: {
            required: { type: Boolean, default: false },
            assignedTo: String, // recipient role (CLIENT/SENDER)
            defaultValue: String,
            validation: Object,
            options: [String] // For dropdown, radio, checkbox
        },
        value: String // Filled value
    }],
    
    // Document status
    status: { 
        type: String, 
        enum: ['draft', 'sent', 'in-progress', 'completed', 'cancelled'], 
        default: 'draft' 
    },
    
    // Tracking
    sentAt: Date,
    completedAt: Date,
    
}, { timestamps: true });

module.exports = mongoose.model("Document", documentSchema);
