/**
 * autofillService.js
 * Builds a flat key→value map of all autofill placeholders from
 * the user's profile, organization, and brand kit.
 * This map is injected into every document at generation time.
 */

const User = require("../../models/User");
const Organization = require("../../models/Organization");
const BrandKit = require("../../models/BrandKit");

/**
 * Format a registered address object into a single string.
 */
function formatAddress(addr = {}) {
    return [addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.country]
        .filter(Boolean)
        .join(", ");
}

/**
 * Calculate due date from document date + payment terms.
 * e.g. "Net 30" → documentDate + 30 days
 */
function calcDueDate(paymentTerms = "Net 30") {
    const today = new Date();
    const match = paymentTerms.match(/\d+/);
    const days = match ? parseInt(match[0]) : 30;
    const due = new Date(today);
    due.setDate(due.getDate() + days);
    return due.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Format the banking block for invoice payment instructions.
 */
function formatBankingBlock(banking = {}) {
    const lines = [];
    if (banking.bankName) lines.push(`Bank: ${banking.bankName}`);
    if (banking.accountName) lines.push(`A/C Name: ${banking.accountName}`);
    if (banking.accountNumber) lines.push(`A/C No: ${banking.accountNumber}`);
    if (banking.ifscCode) lines.push(`IFSC: ${banking.ifscCode}`);
    if (banking.branch) lines.push(`Branch: ${banking.branch}`);
    if (banking.upiId) lines.push(`UPI: ${banking.upiId}`);
    return lines.join(" | ");
}

/**
 * Get the currency symbol from currency code.
 */
function getCurrencySymbol(code = "INR") {
    const map = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ", SGD: "S$" };
    return map[code] || code;
}

/**
 * Build the complete autofill map for a given userId.
 * Returns a flat object keyed by placeholder name (no {{ }}).
 */
/**
 * Build the complete autofill map for a given userId.
 * Returns a flat object keyed by placeholder name (no {{ }}).
 */
async function buildAutofillMap(userId, documentType = null) {
    const [user, org, brandKit] = await Promise.all([
        User.findById(userId).lean(),
        Organization.findOne({ "members.userId": userId }).lean(),
        BrandKit.findOne({ userId }).lean()
    ]);

    // Priority 3: Last used document values (optional)
    let lastDoc = null;
    if (documentType) {
        lastDoc = await require("../../models/Document").findOne({ userId, type: documentType }).sort({ createdAt: -1 }).lean();
    }

    const today = new Date().toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric"
    });

    const currency = org?.defaults?.currency || "INR";
    const paymentTerms = org?.defaults?.paymentTerms || "Net 30";

    // ── Auto-increment invoice number ─────────────────────────────
    const invoicePrefix = org?.defaults?.invoicePrefix || "INV-";
    const invoiceNumber = org?.defaults?.nextInvoiceNumber || 1001;
    const fullInvoiceNumber = `${invoicePrefix}${invoiceNumber}`;

    // Helper to get fallback value
    const getVal = (primary, fallback, lastUsed = null) => {
        if (primary && String(primary).trim() !== "") return primary;
        if (fallback && String(fallback).trim() !== "") return fallback;
        if (lastUsed && String(lastUsed).trim() !== "") return lastUsed;
        return "";
    };

    // Mapping logic as requested: Org (primary) -> BrandKit (fallback) -> Last Doc
    const map = {
        // ── Mandatory Fields (Requested) ───────────────────────────
        company_name: getVal(org?.name, brandKit?.brandName, lastDoc?.content?.company_name),
        company_logo: getVal(brandKit?.logo, null, lastDoc?.content?.company_logo || lastDoc?.content?.logo_url),
        company_address: getVal(formatAddress(org?.registeredAddress), brandKit?.footer?.address, lastDoc?.content?.company_address),
        email: getVal(org?.contact?.email, user?.email, lastDoc?.content?.email || lastDoc?.content?.company_email),
        phone: getVal(org?.contact?.phone, brandKit?.footer?.phone, lastDoc?.content?.phone || lastDoc?.content?.company_phone),
        gstin: getVal(org?.tax?.gstin, null, lastDoc?.content?.gstin),
        tax_id: getVal(org?.tax?.taxId || org?.tax?.gstin, null, lastDoc?.content?.tax_id),
        bank_details: getVal(formatBankingBlock(brandKit?.banking), formatBankingBlock(org?.banking), lastDoc?.content?.bank_details),
        bank_account_name: brandKit?.banking?.accountName || org?.banking?.accountName || "",
        bank_account_number: brandKit?.banking?.accountNumber || org?.banking?.accountNumber || "",
        bank_ifsc: brandKit?.banking?.ifscCode || org?.banking?.ifscCode || "",
        bank_name: brandKit?.banking?.bankName || org?.banking?.bankName || "",
        bank_upi: brandKit?.banking?.upiId || org?.banking?.upiId || "",

        // ── Additional Fields ──────────────────────────────────────
        sender_name: user?.name || "",
        sender_role: user?.role || "",
        company_legal_name: org?.legalName || org?.name || "",
        company_website: org?.contact?.website || brandKit?.footer?.website || "",
        
        pan: org?.tax?.pan || "",
        msme_no: org?.tax?.msmeUdyamNo || "",
        gst_type: org?.tax?.gstRegistrationType || "",

        currency: currency,
        currency_symbol: getCurrencySymbol(currency),
        payment_terms: paymentTerms,
        tax_rate: org?.defaults?.taxRate ?? 18,

        invoice_prefix: invoicePrefix,
        invoice_number: invoiceNumber,
        full_invoice_number: fullInvoiceNumber,

        document_date: today,
        due_date: calcDueDate(paymentTerms),

        signatory_name: org?.signatory?.name || user?.name || "",
        signatory_designation: org?.signatory?.designation || user?.role || "",
        signature_image_url: org?.signatory?.signatureImageUrl || "",

        logo_url: brandKit?.logo || "", // Alias for company_logo
        primary_color: brandKit?.primaryColor || "#7C3AED",
        font_family: brandKit?.fontFamily || "Inter"
    };

    // Add logging if mandatory fields are missing
    const mandatory = ['company_name', 'company_logo', 'company_address', 'email', 'phone'];
    mandatory.forEach(field => {
        if (!map[field]) {
            console.warn(`[Autofill] Missing mandatory field: ${field}. failed sources: Org, BrandKit, LastDoc.`);
        }
    });

    return map;
}

/**
 * Increment the invoice number after each invoice is generated.
 */
async function incrementInvoiceNumber(userId) {
    const org = await Organization.findOne({ "members.userId": userId });
    if (org) {
        org.defaults.nextInvoiceNumber = (org.defaults.nextInvoiceNumber || 1001) + 1;
        await org.save();
    }
}

/**
 * Calculate profile completeness percentage (0–100).
 */
async function getProfileCompleteness(userId) {
    const [user, org, brandKit] = await Promise.all([
        User.findById(userId).lean(),
        Organization.findOne({ "members.userId": userId }).lean(),
        BrandKit.findOne({ userId }).lean()
    ]);

    const checks = [
        { key: "name", value: user?.name, label: "Your Name" },
        { key: "role", value: user?.role, label: "Your Role / Designation" },
        { key: "company_name", value: org?.name, label: "Company Name" },
        { key: "logo", value: brandKit?.logo, label: "Company Logo" },
        { key: "address", value: org?.registeredAddress?.line1, label: "Registered Address" },
        { key: "phone", value: org?.contact?.phone, label: "Company Phone" },
        { key: "website", value: org?.contact?.website, label: "Company Website" },
        { key: "gstin", value: org?.tax?.gstin, label: "GSTIN" },
        { key: "pan", value: org?.tax?.pan, label: "PAN Number" },
        { key: "bank_details", value: org?.banking?.accountNumber, label: "Bank Details" },
        { key: "signatory", value: org?.signatory?.name, label: "Authorized Signatory" },
        { key: "invoice_footer", value: org?.disclaimer?.invoiceFooter, label: "Invoice Footer / Disclaimer" }
    ];

    const filled = checks.filter(c => c.value && String(c.value).trim() !== "");
    const missing = checks.filter(c => !c.value || String(c.value).trim() === "");

    return {
        percentage: Math.round((filled.length / checks.length) * 100),
        filled: filled.map(c => c.label),
        missing: missing.map(c => c.label)
    };
}

module.exports = { buildAutofillMap, incrementInvoiceNumber, getProfileCompleteness };
