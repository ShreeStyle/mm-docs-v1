// Script to INSERT all new templates into MongoDB
// Run: node insert-new-templates.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, 'src/templates');

function readTemplate(filename) {
    return fs.readFileSync(path.join(TEMPLATES_DIR, filename), 'utf8');
}

const newTemplates = [
    // ── LEGAL ──────────────────────────────────────────
    {
        templateId: 'service-agreement-001',
        name: 'Service Agreement',
        category: 'legal',
        description: 'Professional service agreement with scope, obligations, payment, IP, and termination clauses',
        icon: '📜',
        requiredFields: [
            { fieldName: 'clientName', fieldType: 'text', label: 'Client Name', placeholder: 'e.g. ABC Corporation', required: true },
            { fieldName: 'clientAddress', fieldType: 'textarea', label: 'Client Address', placeholder: 'Complete client address', required: true },
            { fieldName: 'serviceDescription', fieldType: 'textarea', label: 'Service Description', placeholder: 'Describe the services to be provided', required: true },
            { fieldName: 'totalAmount', fieldType: 'number', label: 'Total Fee (₹)', placeholder: 'e.g. 500000', required: true },
            { fieldName: 'effectiveDate', fieldType: 'date', label: 'Agreement Date', required: true },
            { fieldName: 'duration', fieldType: 'text', label: 'Duration', placeholder: 'e.g. 12 months', required: true },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Your Company Ltd', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true },
        ],
        content: readTemplate('service_agreement.hbs'),
        placeholders: [
            { placeholder: '{{clientName}}', description: 'Client name', fieldMapping: 'clientName' },
            { placeholder: '{{totalAmount}}', description: 'Total service fee', fieldMapping: 'totalAmount' },
            { placeholder: '{{effectiveDate}}', description: 'Agreement date', fieldMapping: 'effectiveDate' },
        ],
        metadata: { tags: ['service', 'agreement', 'contract', 'legal'], version: '1.0.0' }
    },
    {
        templateId: 'terms-conditions-001',
        name: 'Terms & Conditions',
        category: 'legal',
        description: 'Comprehensive terms and conditions document covering user obligations, payments, IP, privacy, and liability',
        icon: '📑',
        requiredFields: [
            { fieldName: 'effectiveDate', fieldType: 'date', label: 'Effective Date', required: true },
            { fieldName: 'serviceDescription', fieldType: 'textarea', label: 'Service Description', placeholder: 'Describe your services', required: false },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Your Company Ltd', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true },
            { fieldName: 'companyEmail', fieldType: 'text', label: 'Company Email', placeholder: 'e.g. contact@company.com', required: false },
            { fieldName: 'companyPhone', fieldType: 'text', label: 'Company Phone', placeholder: 'e.g. +91-XXXXXXXXXX', required: false },
        ],
        content: readTemplate('terms_conditions.hbs'),
        placeholders: [
            { placeholder: '{{companyName}}', description: 'Company name', fieldMapping: 'companyName' },
            { placeholder: '{{effectiveDate}}', description: 'Effective date', fieldMapping: 'effectiveDate' },
        ],
        metadata: { tags: ['terms', 'conditions', 'legal', 'policy'], version: '1.0.0' }
    },
    {
        templateId: 'power-of-attorney-001',
        name: 'Power of Attorney',
        category: 'legal',
        description: 'General/Special Power of Attorney with powers granted, scope, and witness sections',
        icon: '⚖️',
        requiredFields: [
            { fieldName: 'principalName', fieldType: 'text', label: 'Principal (Grantor) Name', placeholder: 'e.g. John Doe', required: true },
            { fieldName: 'principalAddress', fieldType: 'textarea', label: 'Principal Address', placeholder: 'Complete address of the principal', required: true },
            { fieldName: 'attorneyName', fieldType: 'text', label: 'Attorney (Agent) Name', placeholder: 'e.g. Jane Smith', required: true },
            { fieldName: 'attorneyAddress', fieldType: 'textarea', label: 'Attorney Address', placeholder: 'Complete address of the attorney', required: true },
            { fieldName: 'purposeDescription', fieldType: 'textarea', label: 'Purpose / Scope', placeholder: 'Describe the scope and purpose of this POA', required: true },
            { fieldName: 'effectiveDate', fieldType: 'date', label: 'Effective Date', required: true },
        ],
        content: readTemplate('power_of_attorney.hbs'),
        placeholders: [
            { placeholder: '{{principalName}}', description: 'Principal name', fieldMapping: 'principalName' },
            { placeholder: '{{attorneyName}}', description: 'Attorney name', fieldMapping: 'attorneyName' },
            { placeholder: '{{effectiveDate}}', description: 'Effective date', fieldMapping: 'effectiveDate' },
        ],
        metadata: { tags: ['power-of-attorney', 'poa', 'legal', 'authority'], version: '1.0.0' }
    },
    {
        templateId: 'legal-notice-001',
        name: 'Legal Notice',
        category: 'legal',
        description: 'Formal legal notice with facts, demands, deadline, and consequences sections',
        icon: '⚠️',
        requiredFields: [
            { fieldName: 'senderName', fieldType: 'text', label: 'Sender / Advocate Name', placeholder: 'e.g. Adv. Rajesh Kumar', required: true },
            { fieldName: 'senderAddress', fieldType: 'textarea', label: 'Sender Address', placeholder: 'Complete sender address', required: true },
            { fieldName: 'recipientName', fieldType: 'text', label: 'Recipient Name', placeholder: 'e.g. XYZ Corporation', required: true },
            { fieldName: 'recipientAddress', fieldType: 'textarea', label: 'Recipient Address', placeholder: 'Complete recipient address', required: true },
            { fieldName: 'noticeSubject', fieldType: 'text', label: 'Subject of Notice', placeholder: 'e.g. Breach of Contract / Recovery of Dues', required: true },
            { fieldName: 'noticeDescription', fieldType: 'textarea', label: 'Statement of Facts', placeholder: 'Detailed description of the issue', required: true },
            { fieldName: 'noticeDate', fieldType: 'date', label: 'Notice Date', required: true },
        ],
        content: readTemplate('legal_notice.hbs'),
        placeholders: [
            { placeholder: '{{senderName}}', description: 'Sender name', fieldMapping: 'senderName' },
            { placeholder: '{{recipientName}}', description: 'Recipient name', fieldMapping: 'recipientName' },
            { placeholder: '{{noticeSubject}}', description: 'Notice subject', fieldMapping: 'noticeSubject' },
        ],
        metadata: { tags: ['legal-notice', 'cease-desist', 'demand', 'legal'], version: '1.0.0' }
    },

    // ── FINANCE ────────────────────────────────────────
    {
        templateId: 'gst-invoice-001',
        name: 'GST Tax Invoice',
        category: 'finance',
        description: 'GST-compliant tax invoice with CGST/SGST breakdown, HSN codes, and bank details',
        icon: '🧾',
        requiredFields: [
            { fieldName: 'clientName', fieldType: 'text', label: 'Client Name', placeholder: 'e.g. ABC Pvt Ltd', required: true },
            { fieldName: 'clientAddress', fieldType: 'textarea', label: 'Client Address', required: true },
            { fieldName: 'clientGST', fieldType: 'text', label: 'Client GSTIN', placeholder: 'e.g. 29AABCU9603R1ZM', required: true },
            { fieldName: 'invoiceNumber', fieldType: 'text', label: 'Invoice Number', placeholder: 'e.g. GST/2024/001', required: true },
            { fieldName: 'invoiceDate', fieldType: 'date', label: 'Invoice Date', required: true },
            { fieldName: 'dueDate', fieldType: 'date', label: 'Due Date', required: true },
            { fieldName: 'gstNumber', fieldType: 'text', label: 'Your GSTIN', placeholder: 'e.g. 29AABCU9603R1ZM', required: true },
            { fieldName: 'totalAmount', fieldType: 'number', label: 'Total Amount (₹)', placeholder: 'e.g. 118000', required: true },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', required: true },
        ],
        content: readTemplate('gst_invoice.hbs'),
        placeholders: [
            { placeholder: '{{clientName}}', description: 'Client name', fieldMapping: 'clientName' },
            { placeholder: '{{invoiceNumber}}', description: 'Invoice number', fieldMapping: 'invoiceNumber' },
            { placeholder: '{{totalAmount}}', description: 'Total amount', fieldMapping: 'totalAmount' },
        ],
        metadata: { tags: ['gst', 'tax-invoice', 'finance', 'billing'], version: '1.0.0' }
    },
    {
        templateId: 'quotation-001',
        name: 'Quotation / Estimate',
        category: 'finance',
        description: 'Professional quotation with itemized pricing, validity period, and terms',
        icon: '💰',
        requiredFields: [
            { fieldName: 'clientName', fieldType: 'text', label: 'Client Name', placeholder: 'e.g. XYZ Corporation', required: true },
            { fieldName: 'clientAddress', fieldType: 'textarea', label: 'Client Address', required: true },
            { fieldName: 'quotationNumber', fieldType: 'text', label: 'Quotation Number', placeholder: 'e.g. QT-2024-001', required: true },
            { fieldName: 'quotationDate', fieldType: 'date', label: 'Quotation Date', required: true },
            { fieldName: 'totalAmount', fieldType: 'number', label: 'Total Amount (₹)', placeholder: 'e.g. 250000', required: true },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', required: true },
        ],
        content: readTemplate('quotation.hbs'),
        placeholders: [
            { placeholder: '{{clientName}}', description: 'Client name', fieldMapping: 'clientName' },
            { placeholder: '{{quotationNumber}}', description: 'Quotation number', fieldMapping: 'quotationNumber' },
            { placeholder: '{{totalAmount}}', description: 'Total amount', fieldMapping: 'totalAmount' },
        ],
        metadata: { tags: ['quotation', 'estimate', 'pricing', 'finance'], version: '1.0.0' }
    },
    {
        templateId: 'payment-receipt-001',
        name: 'Payment Receipt',
        category: 'finance',
        description: 'Payment confirmation receipt with amount, method, transaction details',
        icon: '🧾',
        requiredFields: [
            { fieldName: 'clientName', fieldType: 'text', label: 'Received From', placeholder: 'e.g. Client Name', required: true },
            { fieldName: 'clientAddress', fieldType: 'textarea', label: 'Client Address', required: true },
            { fieldName: 'receiptNumber', fieldType: 'text', label: 'Receipt Number', placeholder: 'e.g. RCT-2024-001', required: true },
            { fieldName: 'receiptDate', fieldType: 'date', label: 'Receipt Date', required: true },
            { fieldName: 'totalAmount', fieldType: 'number', label: 'Amount Received (₹)', placeholder: 'e.g. 50000', required: true },
            { fieldName: 'serviceDescription', fieldType: 'textarea', label: 'Payment For', placeholder: 'Description of service/product paid for', required: true },
            { fieldName: 'paymentMethod', fieldType: 'select', label: 'Payment Method', required: true, options: ['Bank Transfer', 'UPI', 'Cheque', 'Cash', 'Credit Card', 'Other'] },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', required: true },
        ],
        content: readTemplate('payment_receipt.hbs'),
        placeholders: [
            { placeholder: '{{clientName}}', description: 'Client name', fieldMapping: 'clientName' },
            { placeholder: '{{totalAmount}}', description: 'Amount received', fieldMapping: 'totalAmount' },
            { placeholder: '{{receiptNumber}}', description: 'Receipt number', fieldMapping: 'receiptNumber' },
        ],
        metadata: { tags: ['receipt', 'payment', 'finance', 'confirmation'], version: '1.0.0' }
    },
    {
        templateId: 'credit-note-001',
        name: 'Credit Note',
        category: 'finance',
        description: 'Credit/adjustment note issued against an original invoice with reason and amount',
        icon: '📋',
        requiredFields: [
            { fieldName: 'clientName', fieldType: 'text', label: 'Client Name', required: true },
            { fieldName: 'clientAddress', fieldType: 'textarea', label: 'Client Address', required: true },
            { fieldName: 'creditNoteNumber', fieldType: 'text', label: 'Credit Note Number', placeholder: 'e.g. CN-2024-001', required: true },
            { fieldName: 'creditNoteDate', fieldType: 'date', label: 'Credit Note Date', required: true },
            { fieldName: 'originalInvoiceNumber', fieldType: 'text', label: 'Original Invoice Number', placeholder: 'e.g. INV-2024-001', required: true },
            { fieldName: 'reason', fieldType: 'textarea', label: 'Reason for Credit', placeholder: 'e.g. Service not delivered, Pricing error', required: true },
            { fieldName: 'totalAmount', fieldType: 'number', label: 'Credit Amount (₹)', placeholder: 'e.g. 10000', required: true },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', required: true },
        ],
        content: readTemplate('credit_note.hbs'),
        placeholders: [
            { placeholder: '{{clientName}}', description: 'Client name', fieldMapping: 'clientName' },
            { placeholder: '{{totalAmount}}', description: 'Credit amount', fieldMapping: 'totalAmount' },
            { placeholder: '{{originalInvoiceNumber}}', description: 'Original invoice', fieldMapping: 'originalInvoiceNumber' },
        ],
        metadata: { tags: ['credit-note', 'adjustment', 'finance'], version: '1.0.0' }
    },
    {
        templateId: 'purchase-order-001',
        name: 'Purchase Order',
        category: 'finance',
        description: 'Official purchase order with vendor details, items, delivery, and payment terms',
        icon: '📦',
        requiredFields: [
            { fieldName: 'vendorName', fieldType: 'text', label: 'Vendor Name', placeholder: 'e.g. Supplier Pvt Ltd', required: true },
            { fieldName: 'vendorAddress', fieldType: 'textarea', label: 'Vendor Address', required: true },
            { fieldName: 'poNumber', fieldType: 'text', label: 'PO Number', placeholder: 'e.g. PO-2024-001', required: true },
            { fieldName: 'poDate', fieldType: 'date', label: 'PO Date', required: true },
            { fieldName: 'deliveryDate', fieldType: 'date', label: 'Expected Delivery Date', required: true },
            { fieldName: 'totalAmount', fieldType: 'number', label: 'Total Order Amount (₹)', placeholder: 'e.g. 100000', required: true },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', required: true },
        ],
        content: readTemplate('purchase_order.hbs'),
        placeholders: [
            { placeholder: '{{vendorName}}', description: 'Vendor name', fieldMapping: 'vendorName' },
            { placeholder: '{{poNumber}}', description: 'PO number', fieldMapping: 'poNumber' },
            { placeholder: '{{totalAmount}}', description: 'Order total', fieldMapping: 'totalAmount' },
        ],
        metadata: { tags: ['purchase-order', 'procurement', 'finance'], version: '1.0.0' }
    },

    // ── SALES ──────────────────────────────────────────
    {
        templateId: 'proposal-001',
        name: 'Business Proposal',
        category: 'sales',
        description: 'Professional business proposal with executive summary, scope, deliverables, pricing, and timeline',
        icon: '📊',
        requiredFields: [
            { fieldName: 'clientName', fieldType: 'text', label: 'Client Name', required: true },
            { fieldName: 'clientAddress', fieldType: 'textarea', label: 'Client Address', required: true },
            { fieldName: 'proposalTitle', fieldType: 'text', label: 'Proposal Title', placeholder: 'e.g. Web Development Proposal', required: true },
            { fieldName: 'executiveSummary', fieldType: 'textarea', label: 'Executive Summary', placeholder: 'Brief overview of the proposal', required: true },
            { fieldName: 'scopeOfWork', fieldType: 'textarea', label: 'Scope of Work', placeholder: 'Detailed description of work', required: true },
            { fieldName: 'totalAmount', fieldType: 'number', label: 'Total Investment (₹)', placeholder: 'e.g. 500000', required: true },
            { fieldName: 'proposalDate', fieldType: 'date', label: 'Proposal Date', required: true },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', required: true },
        ],
        content: readTemplate('proposal.hbs'),
        placeholders: [
            { placeholder: '{{clientName}}', description: 'Client name', fieldMapping: 'clientName' },
            { placeholder: '{{proposalTitle}}', description: 'Proposal title', fieldMapping: 'proposalTitle' },
            { placeholder: '{{totalAmount}}', description: 'Total investment', fieldMapping: 'totalAmount' },
        ],
        metadata: { tags: ['proposal', 'business', 'sales', 'pitch'], version: '1.0.0' }
    },
    {
        templateId: 'sales-quotation-001',
        name: 'Sales Quotation',
        category: 'sales',
        description: 'Sales-focused quotation with product/service pricing, discounts, and client acceptance',
        icon: '💼',
        requiredFields: [
            { fieldName: 'clientName', fieldType: 'text', label: 'Client Name', required: true },
            { fieldName: 'clientAddress', fieldType: 'textarea', label: 'Client Address', required: true },
            { fieldName: 'quoteNumber', fieldType: 'text', label: 'Quote Number', placeholder: 'e.g. SQ-2024-001', required: true },
            { fieldName: 'quoteDate', fieldType: 'date', label: 'Quote Date', required: true },
            { fieldName: 'totalAmount', fieldType: 'number', label: 'Grand Total (₹)', placeholder: 'e.g. 150000', required: true },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', required: true },
        ],
        content: readTemplate('sales_quotation.hbs'),
        placeholders: [
            { placeholder: '{{clientName}}', description: 'Client name', fieldMapping: 'clientName' },
            { placeholder: '{{quoteNumber}}', description: 'Quote number', fieldMapping: 'quoteNumber' },
            { placeholder: '{{totalAmount}}', description: 'Grand total', fieldMapping: 'totalAmount' },
        ],
        metadata: { tags: ['sales', 'quotation', 'pricing'], version: '1.0.0' }
    },
    {
        templateId: 'client-agreement-001',
        name: 'Client Agreement',
        category: 'sales',
        description: 'Client engagement agreement covering scope, payment, confidentiality, IP, and termination',
        icon: '🤝',
        requiredFields: [
            { fieldName: 'clientName', fieldType: 'text', label: 'Client Name', required: true },
            { fieldName: 'clientAddress', fieldType: 'textarea', label: 'Client Address', required: true },
            { fieldName: 'serviceDescription', fieldType: 'textarea', label: 'Service Description', placeholder: 'Describe the services', required: true },
            { fieldName: 'totalAmount', fieldType: 'number', label: 'Total Value (₹)', placeholder: 'e.g. 300000', required: true },
            { fieldName: 'effectiveDate', fieldType: 'date', label: 'Agreement Date', required: true },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', required: true },
        ],
        content: readTemplate('client_agreement.hbs'),
        placeholders: [
            { placeholder: '{{clientName}}', description: 'Client name', fieldMapping: 'clientName' },
            { placeholder: '{{totalAmount}}', description: 'Agreement value', fieldMapping: 'totalAmount' },
            { placeholder: '{{effectiveDate}}', description: 'Agreement date', fieldMapping: 'effectiveDate' },
        ],
        metadata: { tags: ['client', 'agreement', 'engagement', 'sales'], version: '1.0.0' }
    },

    // ── COMPLIANCE ─────────────────────────────────────
    {
        templateId: 'audit-report-001',
        name: 'Audit Report',
        category: 'compliance',
        description: 'Internal/external audit report with findings severity, recommendations, and auditor opinion',
        icon: '🔍',
        requiredFields: [
            { fieldName: 'auditorName', fieldType: 'text', label: 'Auditor Name', placeholder: 'e.g. Rajesh Kumar CA', required: true },
            { fieldName: 'auditStartDate', fieldType: 'date', label: 'Audit Start Date', required: true },
            { fieldName: 'auditEndDate', fieldType: 'date', label: 'Audit End Date', required: true },
            { fieldName: 'reportDate', fieldType: 'date', label: 'Report Date', required: true },
            { fieldName: 'executiveSummary', fieldType: 'textarea', label: 'Executive Summary', placeholder: 'Summary of audit findings', required: true },
            { fieldName: 'auditScope', fieldType: 'textarea', label: 'Scope of Audit', placeholder: 'What was covered in the audit', required: true },
            { fieldName: 'detailedFindings', fieldType: 'textarea', label: 'Detailed Findings', placeholder: 'Describe findings in detail', required: true },
            { fieldName: 'recommendations', fieldType: 'textarea', label: 'Recommendations', placeholder: 'Suggested corrective actions', required: true },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', required: true },
        ],
        content: readTemplate('audit_report.hbs'),
        placeholders: [
            { placeholder: '{{auditorName}}', description: 'Auditor name', fieldMapping: 'auditorName' },
            { placeholder: '{{executiveSummary}}', description: 'Executive summary', fieldMapping: 'executiveSummary' },
        ],
        metadata: { tags: ['audit', 'report', 'compliance', 'internal-audit'], version: '1.0.0' }
    },
    {
        templateId: 'privacy-policy-001',
        name: 'Privacy Policy',
        category: 'compliance',
        description: 'DPDP Act 2023 compliant privacy policy with data collection, usage, rights, and contact sections',
        icon: '🔐',
        requiredFields: [
            { fieldName: 'effectiveDate', fieldType: 'date', label: 'Effective Date', required: true },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', required: true },
            { fieldName: 'companyEmail', fieldType: 'text', label: 'Contact Email', placeholder: 'e.g. privacy@company.com', required: true },
            { fieldName: 'companyPhone', fieldType: 'text', label: 'Contact Phone', placeholder: 'e.g. +91-XXXXXXXXXX', required: false },
        ],
        content: readTemplate('privacy_policy.hbs'),
        placeholders: [
            { placeholder: '{{companyName}}', description: 'Company name', fieldMapping: 'companyName' },
            { placeholder: '{{effectiveDate}}', description: 'Effective date', fieldMapping: 'effectiveDate' },
        ],
        metadata: { tags: ['privacy', 'policy', 'dpdp', 'compliance', 'data-protection'], version: '1.0.0' }
    },
    {
        templateId: 'compliance-certificate-001',
        name: 'Compliance Certificate',
        category: 'compliance',
        description: 'Certificate confirming compliance with applicable standards and regulations',
        icon: '✅',
        requiredFields: [
            { fieldName: 'complianceStandard', fieldType: 'text', label: 'Compliance Standard', placeholder: 'e.g. ISO 27001, SOC 2, GDPR', required: true },
            { fieldName: 'complianceScope', fieldType: 'textarea', label: 'Scope of Compliance', placeholder: 'What area is covered by this certificate', required: true },
            { fieldName: 'issueDate', fieldType: 'date', label: 'Issue Date', required: true },
            { fieldName: 'expiryDate', fieldType: 'date', label: 'Expiry Date', required: true },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', required: true },
        ],
        content: readTemplate('compliance_certificate.hbs'),
        placeholders: [
            { placeholder: '{{complianceStandard}}', description: 'Compliance standard', fieldMapping: 'complianceStandard' },
            { placeholder: '{{issueDate}}', description: 'Issue date', fieldMapping: 'issueDate' },
        ],
        metadata: { tags: ['compliance', 'certificate', 'certification', 'standards'], version: '1.0.0' }
    },
    {
        templateId: 'dpa-001',
        name: 'Data Processing Agreement',
        category: 'compliance',
        description: 'DPDP Act 2023 compliant DPA covering data processing, security measures, breach notification',
        icon: '🛡️',
        requiredFields: [
            { fieldName: 'controllerName', fieldType: 'text', label: 'Data Controller Name', placeholder: 'e.g. Your Company Ltd', required: true },
            { fieldName: 'controllerAddress', fieldType: 'textarea', label: 'Controller Address', required: true },
            { fieldName: 'processorName', fieldType: 'text', label: 'Data Processor Name', placeholder: 'e.g. Service Provider Ltd', required: true },
            { fieldName: 'processorAddress', fieldType: 'textarea', label: 'Processor Address', required: true },
            { fieldName: 'processingPurpose', fieldType: 'textarea', label: 'Purpose of Processing', placeholder: 'Why personal data is being processed', required: true },
            { fieldName: 'effectiveDate', fieldType: 'date', label: 'Effective Date', required: true },
        ],
        content: readTemplate('dpa.hbs'),
        placeholders: [
            { placeholder: '{{controllerName}}', description: 'Data controller', fieldMapping: 'controllerName' },
            { placeholder: '{{processorName}}', description: 'Data processor', fieldMapping: 'processorName' },
            { placeholder: '{{effectiveDate}}', description: 'Effective date', fieldMapping: 'effectiveDate' },
        ],
        metadata: { tags: ['dpa', 'data-processing', 'gdpr', 'dpdp', 'compliance'], version: '1.0.0' }
    },
];

async function insertTemplates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const Template = mongoose.model('Template', new mongoose.Schema({}, { strict: false }), 'templates');

        let inserted = 0, skipped = 0, errors = 0;

        for (const template of newTemplates) {
            const existing = await Template.findOne({ templateId: template.templateId });
            if (existing) {
                // Update existing
                await Template.updateOne({ templateId: template.templateId }, { $set: template });
                console.log(`🔄 ${template.templateId} — updated`);
                skipped++;
            } else {
                await Template.create(template);
                console.log(`✅ ${template.templateId} — inserted`);
                inserted++;
            }
        }

        console.log(`\n📊 Summary: ${inserted} inserted, ${skipped} updated, ${errors} errors`);
        console.log(`Total templates in DB: ${await Template.countDocuments()}`);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

insertTemplates();
