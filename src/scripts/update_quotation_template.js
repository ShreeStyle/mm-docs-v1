require("dotenv").config({path: "../.env"});
require("dotenv").config();
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const Template = require("../models/Template");

async function createQuotationTemplate() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
        console.log("No MongoDB URI in env. Defaulting to local mm-docs");
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUri || 'mongodb://localhost:27017/mm-docs');
    console.log("✅ Connected to MongoDB");

    const templateId = 'quotation-002';
    let template = await Template.findOne({ templateId });
    
    const contentPath = path.join(__dirname, '../templates/quotation.hbs');
    const content = fs.readFileSync(contentPath, 'utf8');

    const requiredFields = [
        { fieldName: 'companyNameHtml', fieldType: 'textarea', label: 'Company Header (HTML or Text)', placeholder: 'e.g. MANG<br>MARIO<br>CARS', required: true },
        { fieldName: 'companySlogan', fieldType: 'text', label: 'Company Slogan', placeholder: 'e.g. DRIVEN BY TRUST.', required: false },
        { fieldName: 'quotationNumber', fieldType: 'text', label: 'Quotation No', placeholder: 'e.g. 1234', required: true },
        { fieldName: 'customerId', fieldType: 'text', label: 'Customer ID', placeholder: 'e.g. 123456', required: true },
        { fieldName: 'quotationDate', fieldType: 'date', label: 'Date', required: true },
        { fieldName: 'validUntil', fieldType: 'date', label: 'Valid Until', required: true },
        { fieldName: 'clientName', fieldType: 'text', label: 'Client / Contact Name', placeholder: 'e.g. Ray Antonio', required: true },
        { fieldName: 'clientAddress', fieldType: 'textarea', label: 'Client Details (Address/Company)', placeholder: 'e.g. Tropang True Po\n123 Pag-asa St.', required: true },
        { fieldName: 'clientPhone', fieldType: 'text', label: 'Client Phone', placeholder: 'e.g. 0123 456 7890', required: false },
        { fieldName: 'projectDescription', fieldType: 'textarea', label: 'Project Description', placeholder: 'Add a brief and concise description of the project...', required: true },
        { fieldName: 'currencySymbol', fieldType: 'select', label: 'Currency Symbol', options: ['$', '€', '£', '₹', '₱'], required: true },
        { fieldName: 'subtotal', fieldType: 'number', label: 'Subtotal Amount', required: true },
        { fieldName: 'taxAmount', fieldType: 'number', label: 'Value-Added Tax (Amount)', required: false },
        { fieldName: 'othersFee', fieldType: 'number', label: 'Others Fee (Amount)', required: false },
        { fieldName: 'totalAmount', fieldType: 'number', label: 'Total Amount', required: true },
        { fieldName: 'contactPersonName', fieldType: 'text', label: 'Your Contact Name (Footer)', placeholder: 'e.g. Baby Concepcion', required: true },
        { fieldName: 'contactEmail', fieldType: 'email', label: 'Your Contact Email (Footer)', placeholder: 'e.g. hello@reallygreatsite.com', required: true },
    ];

    const placeholders = [
        { placeholder: '{{{companyNameHtml}}}', description: 'Company Name at top left', fieldMapping: 'companyNameHtml' },
        { placeholder: '{{quotationNumber}}', description: 'Quote Number', fieldMapping: 'quotationNumber' },
        { placeholder: '{{customerId}}', description: 'Customer ID', fieldMapping: 'customerId' },
        { placeholder: '{{projectDescription}}', description: 'Project Description block', fieldMapping: 'projectDescription' }
    ];

    if (!template) {
        console.log("📝 Creating new Quotation template...");
        template = new Template({
            templateId: templateId,
            name: 'Professional Quotation',
            category: 'sales',
            description: 'A clean, bold, minimal quotation template',
            icon: '💰',
            requiredFields,
            content,
            placeholders,
            metadata: { tags: ['sales', 'quotation', 'pricing'], version: '1.0.0' }
        });
    } else {
        console.log("📝 Updating existing Quotation template...");
        template.requiredFields = requiredFields;
        template.content = content;
        template.placeholders = placeholders;
    }

    await template.save();
    console.log("✅ Successfully saved Quotation template to DB!");

    await mongoose.connection.close();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating template:", error);
    process.exit(1);
  }
}

createQuotationTemplate();
