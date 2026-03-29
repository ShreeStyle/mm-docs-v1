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
    // Standardizing to snake_case for all keys to match user requirement.
    const map = {
        // ── Mandatory Fields (Requested) ───────────────────────────
        company_name: getVal(org?.name, brandKit?.brandName, lastDoc?.content?.company_name || lastDoc?.content?.companyName),
        company_logo: getVal(brandKit?.logo, org?.branding?.logo, lastDoc?.content?.company_logo || lastDoc?.content?.logo_url),
        company_address: getVal(formatAddress(org?.registeredAddress), brandKit?.footer?.address, lastDoc?.content?.company_address || lastDoc?.content?.companyAddress),
        company_email: getVal(org?.contact?.email, brandKit?.footer?.email || user?.email, lastDoc?.content?.company_email || lastDoc?.content?.email),
        company_phone: getVal(org?.contact?.phone, brandKit?.footer?.phone, lastDoc?.content?.company_phone || lastDoc?.content?.phone),
        company_website: getVal(org?.contact?.website, brandKit?.footer?.website, lastDoc?.content?.company_website),
        
        gstin: getVal(org?.tax?.gstin, null, lastDoc?.content?.gstin),
        tax_id: getVal(org?.tax?.taxId || org?.tax?.gstin, null, lastDoc?.content?.tax_id),
        pan: getVal(org?.tax?.pan, null, lastDoc?.content?.pan),

        bank_name: getVal(brandKit?.banking?.bankName, org?.banking?.bankName, lastDoc?.content?.bank_name || lastDoc?.content?.bankName),
        bank_account_name: getVal(brandKit?.banking?.accountName, org?.banking?.accountName, lastDoc?.content?.bank_account_name || lastDoc?.content?.accountName),
        bank_account_number: getVal(brandKit?.banking?.accountNumber, org?.banking?.accountNumber, lastDoc?.content?.bank_account_number || lastDoc?.content?.accountNumber),
        bank_ifsc: getVal(brandKit?.banking?.ifscCode, org?.banking?.ifscCode, lastDoc?.content?.bank_ifsc || lastDoc?.content?.ifscCode),
        bank_upi: getVal(brandKit?.banking?.upiId, org?.banking?.upiId, lastDoc?.content?.bank_upi || lastDoc?.content?.upiId),
        bank_details: getVal(formatBankingBlock(brandKit?.banking), formatBankingBlock(org?.banking), lastDoc?.content?.bank_details),

        // ── Personal Info ──────────────────────────────────────────
        sender_name: user?.name || "",
        sender_role: user?.role || "",
        sender_email: user?.email || "",

        // ── Document Specifics ─────────────────────────────────────
        document_date: today,
        due_date: calcDueDate(paymentTerms),
        currency: currency,
        currency_symbol: getCurrencySymbol(currency),
        payment_terms: paymentTerms,
        tax_rate: org?.defaults?.taxRate ?? 18,

        invoice_prefix: invoicePrefix,
        invoice_number: invoiceNumber,
        full_invoice_number: fullInvoiceNumber,

        signatory_name: org?.signatory?.name || user?.name || "",
        signatory_designation: org?.signatory?.designation || user?.role || "",
        signature_image_url: org?.signatory?.signatureImageUrl || "",

        // ── Branding & Style ───────────────────────────────────────
        primary_color: brandKit?.primaryColor || "#7C3AED",
        font_family: brandKit?.fontFamily || "Inter"
    };

    // Add logging if mandatory fields are missing
    const mandatory = ['company_name', 'company_logo', 'company_address', 'company_email', 'company_phone'];
    mandatory.forEach(field => {
        if (!map[field]) {
            console.warn(`[Autofill] Missing mandatory field: ${field}. failed sources: Org, BrandKit, LastDoc.`);
        }
    });

    return map;
}

/**
 * Sync edited fields back to Organization/BrandKit.
 */
async function syncAutofillToProfile(userId, data) {
    const [org, brandKit] = await Promise.all([
        Organization.findOne({ "members.userId": userId }),
        BrandKit.findOne({ userId })
    ]);

    let orgSaved = false;
    let brandSaved = false;

    if (org) {
        if (data.company_name) { org.name = data.company_name; orgSaved = true; }
        if (data.company_email) { org.contact.email = data.company_email; orgSaved = true; }
        if (data.company_phone) { org.contact.phone = data.company_phone; orgSaved = true; }
        if (data.company_website) { org.contact.website = data.company_website; orgSaved = true; }
        if (data.gstin) { org.tax.gstin = data.gstin; orgSaved = true; }
        if (data.pan) { org.tax.pan = data.pan; orgSaved = true; }
        
        // Banking (Org fallback)
        if (data.bank_name) { org.banking.bankName = data.bank_name; orgSaved = true; }
        if (data.bank_account_number) { org.banking.accountNumber = data.bank_account_number; orgSaved = true; }
        if (data.bank_ifsc) { org.banking.ifscCode = data.bank_ifsc; orgSaved = true; }
        if (data.bank_upi) { org.banking.upiId = data.bank_upi; orgSaved = true; }

        if (orgSaved) await org.save();
    }

    if (brandKit) {
        if (data.company_name) { brandKit.brandName = data.company_name; brandSaved = true; }
        if (data.company_logo) { brandKit.logo = data.company_logo; brandSaved = true; }
        
        // Banking (BrandKit priority)
        if (data.bank_name) { brandKit.banking.bankName = data.bank_name; brandSaved = true; }
        if (data.bank_account_name) { brandKit.banking.accountName = data.bank_account_name; brandSaved = true; }
        if (data.bank_account_number) { brandKit.banking.accountNumber = data.bank_account_number; brandSaved = true; }
        if (data.bank_ifsc) { brandKit.banking.ifscCode = data.bank_ifsc; brandSaved = true; }
        if (data.bank_upi) { brandKit.banking.upiId = data.bank_upi; brandSaved = true; }

        if (brandSaved) await brandKit.save();
    }

    return { orgSaved, brandSaved };
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

module.exports = { buildAutofillMap, incrementInvoiceNumber, getProfileCompleteness, syncAutofillToProfile };
