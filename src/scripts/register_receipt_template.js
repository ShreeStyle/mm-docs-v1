require("dotenv").config();
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const Template = require("../models/Template");

async function createReceiptTemplate() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUri || 'mongodb://localhost:27017/mm-docs');
    console.log("✅ Connected to MongoDB");

    const templateId = 'receipt-001';
    let template = await Template.findOne({ templateId });
    
    // Read the Handlebars content
    const contentPath = path.join(__dirname, '../templates/receipt.hbs');
    const content = fs.readFileSync(contentPath, 'utf8');

    const requiredFields = [
        { fieldName: 'receiptNumber', fieldType: 'text', label: 'Receipt #', placeholder: 'e.g. REC-2026-001', required: true },
        { fieldName: 'receiptDate', fieldType: 'date', label: 'Receipt Date', required: true },
        { fieldName: 'customerName', fieldType: 'text', label: 'Customer Name', placeholder: 'e.g. John Doe', required: true },
        { fieldName: 'customerAddress', fieldType: 'textarea', label: 'Customer Address', placeholder: 'Complete address', required: false },
        { fieldName: 'receiptItems', fieldType: 'textarea', label: 'Receipt Items (One per line)', placeholder: 'Format: QTY | DESCRIPTION | UNIT PRICE\ne.g. 1 | Web Design Services | 25000', required: true },
        { fieldName: 'taxRate', fieldType: 'number', label: 'Tax Rate (%)', placeholder: 'e.g. 5', required: false },
        { fieldName: 'bankInfo', fieldType: 'textarea', label: 'Bank Info', placeholder: 'Payment details...', required: false },
        { fieldName: 'terms', fieldType: 'textarea', label: 'Terms & Conditions', placeholder: 'Standard terms...', required: false },
        { fieldName: 'footerPhone', fieldType: 'text', label: 'Footer Phone', placeholder: '+91 000 000 0000', required: false },
        { fieldName: 'footerEmail', fieldType: 'text', label: 'Footer Email', placeholder: 'contact@example.com', required: false },
        { fieldName: 'footerWebsite', fieldType: 'text', label: 'Footer Website', placeholder: 'www.example.com', required: false }
    ];

    const placeholders = [
        { placeholder: '{{companyName}}', description: 'Company Name', fieldMapping: 'companyName' },
        { placeholder: '{{receiptNumber}}', description: 'Receipt Number', fieldMapping: 'receiptNumber' },
        { placeholder: '{{customerName}}', description: 'Customer Name', fieldMapping: 'customerName' }
    ];

    if (!template) {
        console.log("📝 Creating new Receipt template...");
        template = new Template({
            templateId: templateId,
            name: 'Professional Receipt',
            category: 'finance',
            description: 'A professional blue-themed payment receipt with itemized entries',
            icon: '📄',
            requiredFields,
            content,
            placeholders,
            metadata: { tags: ['finance', 'receipt', 'payment'], version: '1.0.0' }
        });
    } else {
        console.log("📝 Updating existing Receipt template...");
        template.name = 'Professional Receipt';
        template.requiredFields = requiredFields;
        template.content = content;
        template.placeholders = placeholders;
    }

    await template.save();
    console.log("✅ Successfully saved Receipt template to DB!");

    await mongoose.connection.close();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating template:", error);
    process.exit(1);
  }
}

createReceiptTemplate();
