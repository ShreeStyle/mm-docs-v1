const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "Untitled Document" },
    type: {
        type: String,
        enum: [
            // Original types
            "proposal", "quotation", "invoice", "resume", "marketing_brief", "profile", "sales email", "pitch deck outline", "ask", "research", "build", "other",
            // HR & Employee Documents
            "offer_letter", "appointment_letter", "onboarding_letter", "experience_certificate", "warning_letter",
            // Legal & Compliance Documents
            "nda", "service_agreement", "terms_of_service", "privacy_policy", "mou",
            // Sales & Business Documents
            "sales_contract", "partnership_agreement",
            // Finance & Accounting Documents
            "purchase_order", "receipt", "gst_invoice", "credit_note",
            // Tax, Audit & Regulatory Documents
            "gst_filing", "audit_report", "policy_document", "regulatory_filing"
        ],
        default: "other",
    },
    content: { type: Object, default: {} }, // Flexible JSON structure for AI content
    brandKitId: { type: mongoose.Schema.Types.ObjectId, ref: "BrandKit" }, // Optional link to specific brand kit
}, { timestamps: true });

module.exports = mongoose.model("Document", documentSchema);
