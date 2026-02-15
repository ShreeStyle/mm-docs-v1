const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "Untitled Document" },
    type: {
        type: String,
        enum: ["proposal", "quotation", "invoice", "resume", "marketing_brief", "profile", "other"],
        default: "other",
    },
    content: { type: Object, default: {} }, // Flexible JSON structure for AI content
    brandKitId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandKit" }, // Optional link to specific brand kit
}, { timestamps: true });

module.exports = mongoose.model("Document", documentSchema);
