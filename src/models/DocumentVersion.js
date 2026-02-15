const mongoose = require("mongoose");

const documentVersionSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    versionNumber: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    content: {
        type: Object,
        required: true,
    },
    brandKitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BrandKit",
    },
    changeDescription: {
        type: String,
        default: "Auto-saved version",
    },
}, { timestamps: true });

// Compound index for efficient version queries
documentVersionSchema.index({ documentId: 1, versionNumber: -1 });

module.exports = mongoose.model("DocumentVersion", documentVersionSchema);
