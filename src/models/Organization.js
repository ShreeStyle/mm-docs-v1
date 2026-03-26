const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
    // ── Core Identity ──────────────────────────────────────────────
    name: { type: String, required: true },           // DBA / trading name
    legalName: { type: String, default: "" },         // Full registered company name
    slug: { type: String, unique: true, required: true },
    industry: {
        type: String,
        enum: ["startup", "saas", "hr-services", "legal-services", "finance", "healthcare", "education", "retail", "manufacturing", "other"],
        default: "other"
    },
    size: {
        type: String,
        enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
        default: "1-10"
    },
    primaryUseCase: {
        type: String,
        enum: ["invoices", "contracts", "hr-docs", "proposals", "all"],
        default: "all"
    },

    // ── Contact ────────────────────────────────────────────────────
    contact: {
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        website: { type: String, default: "" }
    },

    // ── Registered Address ─────────────────────────────────────────
    registeredAddress: {
        line1: { type: String, default: "" },
        line2: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        postalCode: { type: String, default: "" },
        country: { type: String, default: "India" }
    },

    // ── Tax / Compliance ───────────────────────────────────────────
    tax: {
        gstin: { type: String, default: "" },             // 15-char GST Number (India)
        pan: { type: String, default: "" },               // 10-char PAN (India)
        taxId: { type: String, default: "" },             // Generic VAT/EIN for non-India
        msmeUdyamNo: { type: String, default: "" },       // MSME registration (optional)
        gstRegistrationType: {
            type: String,
            enum: ["regular", "composite", "unregistered"],
            default: "unregistered"
        }
    },

    // ── Banking ────────────────────────────────────────────────────
    banking: {
        accountName: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
        ifscCode: { type: String, default: "" },
        bankName: { type: String, default: "" },
        branch: { type: String, default: "" },
        upiId: { type: String, default: "" },
        swiftCode: { type: String, default: "" }          // For international wire transfers
    },

    // ── Document Defaults ──────────────────────────────────────────
    defaults: {
        currency: { type: String, default: "INR" },
        paymentTerms: { type: String, default: "Net 30" },
        invoicePrefix: { type: String, default: "INV-" },
        quotationPrefix: { type: String, default: "QT-" },
        poPrefix: { type: String, default: "PO-" },
        taxRate: { type: Number, default: 18 },
        nextInvoiceNumber: { type: Number, default: 1001 },
        defaultDiscount: { type: Number, default: 0 }
    },

    // ── Signatory ──────────────────────────────────────────────────
    signatory: {
        name: { type: String, default: "" },
        designation: { type: String, default: "" },
        signatureImageUrl: { type: String, default: "" }
    },

    // ── Default Disclaimers ────────────────────────────────────────
    disclaimer: {
        invoiceFooter: { type: String, default: "" },    // Footer text on all invoices
        contractDisclaimer: { type: String, default: "" } // Standard T&C for contracts
    },

    // ── Team Members ───────────────────────────────────────────────
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: {
            type: String,
            enum: ["owner", "admin", "manager", "member", "viewer"],
            default: "member"
        },
        department: {
            type: String,
            enum: ["hr", "legal", "finance", "sales", "operations", "it", "other"]
        },
        joinedAt: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true }
    }],

    // ── Subscription / Plan ────────────────────────────────────────
    plan: {
        type: String,
        enum: ["free", "team", "business", "enterprise"],
        default: "free"
    },
    subscriptionStatus: {
        type: String,
        enum: ["trial", "active", "suspended", "cancelled"],
        default: "trial"
    },
    subscriptionStartDate: Date,
    subscriptionEndDate: Date,

    // ── Limits ─────────────────────────────────────────────────────
    limits: {
        maxMembers: { type: Number, default: 5 },
        maxDocuments: { type: Number, default: 100 },
        maxStorage: { type: Number, default: 1024 } // MB
    },

    // ── Settings ───────────────────────────────────────────────────
    settings: {
        defaultWorkflow: { type: mongoose.Schema.Types.ObjectId, ref: "WorkflowTemplate" },
        requireApproval: { type: Boolean, default: false },
        allowExternalSharing: { type: Boolean, default: true },
        enableAIFeatures: { type: Boolean, default: true },
        defaultLanguage: { type: String, default: "en" },
        timezone: { type: String, default: "Asia/Kolkata" }
    },

    // ── Branding ───────────────────────────────────────────────────
    branding: {
        logo: String,
        primaryColor: String,
        domain: String
    },

    isActive: { type: Boolean, default: true }
}, { timestamps: true });

organizationSchema.index({ slug: 1 });
organizationSchema.index({ "members.userId": 1 });

module.exports = mongoose.model("Organization", organizationSchema);
