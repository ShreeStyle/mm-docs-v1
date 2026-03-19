require("dotenv").config();
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const Template = require("../models/Template");

async function createPurchaseOrderTemplate() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
        console.log("No MongoDB URI in env. Defaulting to local mm-docs");
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUri || 'mongodb://localhost:27017/mm-docs');
    console.log("✅ Connected to MongoDB");

    const templateId = 'purchase-order-001';
    let template = await Template.findOne({ templateId });
    
    // Read the Handlebars content
    const contentPath = path.join(__dirname, '../templates/purchase_order.hbs');
    const content = fs.readFileSync(contentPath, 'utf8');

    const requiredFields = [
        // Vendor Info
        { fieldName: 'vendorName', fieldType: 'text', label: 'Vendor Name', placeholder: 'e.g. ABC Suppliers Pvt. Ltd.', required: true },
        { fieldName: 'vendorAddress', fieldType: 'textarea', label: 'Vendor Address', placeholder: 'Complete vendor address', required: true },
        { fieldName: 'vendorContact', fieldType: 'text', label: 'Vendor Contact / Dept', placeholder: 'e.g. Sales Department', required: false },
        
        // Ship To Info
        { fieldName: 'shipToName', fieldType: 'text', label: 'Ship To (Name)', placeholder: 'e.g. Receiver Name', required: true },
        { fieldName: 'shipToCompanyName', fieldType: 'text', label: 'Ship To (Company)', placeholder: 'e.g. Acme Corp', required: false },
        { fieldName: 'shipToAddress', fieldType: 'textarea', label: 'Ship To Address', placeholder: 'Complete delivery address', required: true },
        { fieldName: 'shipToPhone', fieldType: 'text', label: 'Ship To Phone', placeholder: 'e.g. +91-98765-43210', required: false },
        
        // PO Metadata
        { fieldName: 'poNumber', fieldType: 'text', label: 'Purchase Order #', placeholder: 'e.g. PO-2026-001', required: true },
        { fieldName: 'poDate', fieldType: 'date', label: 'PO Date', required: true },
        
        // Logistics Info
        { fieldName: 'requisitioner', fieldType: 'text', label: 'Requisitioner', placeholder: 'e.g. Name of requester', required: false },
        { fieldName: 'shipVia', fieldType: 'text', label: 'Ship Via', placeholder: 'e.g. FedEx / Surface', required: false },
        { fieldName: 'fob', fieldType: 'text', label: 'F.O.B.', placeholder: 'e.g. Shipping point', required: false },
        { fieldName: 'shippingTerms', fieldType: 'text', label: 'Shipping Terms', placeholder: 'e.g. Net 30', required: false },
        
        // Items & Totals
        { fieldName: 'poItems', fieldType: 'textarea', label: 'Order Items (One per line)', placeholder: 'Format: ITEM# | DESCRIPTION | QTY | UNIT PRICE\ne.g. 101 | Laptop | 2 | 50000', required: true },
        { fieldName: 'taxRate', fieldType: 'number', label: 'Tax Rate (%)', placeholder: 'e.g. 18', required: false },
        { fieldName: 'shippingCost', fieldType: 'number', label: 'Shipping Cost (₹)', placeholder: 'e.g. 500', required: false },
        { fieldName: 'otherCharges', fieldType: 'number', label: 'Other Charges (₹)', placeholder: 'e.g. 100', required: false },
        
        // Comments
        { fieldName: 'comments', fieldType: 'textarea', label: 'Comments or Special Instructions', placeholder: 'Any additional instructions for the vendor', required: false }
    ];

    const placeholders = [
        { placeholder: '{{companyName}}', description: 'Company Name', fieldMapping: 'companyName' },
        { placeholder: '{{poNumber}}', description: 'PO Number', fieldMapping: 'poNumber' },
        { placeholder: '{{vendorCompanyName}}', description: 'Vendor Name', fieldMapping: 'vendorCompanyName' }
    ];

    if (!template) {
        console.log("📝 Creating new Purchase Order template...");
        template = new Template({
            templateId: templateId,
            name: 'Professional Purchase Order',
            category: 'finance',
            description: 'A professional, boxed purchase order template matching the reference design',
            icon: '📦',
            requiredFields,
            content,
            placeholders,
            metadata: { tags: ['finance', 'purchase order', 'procurement'], version: '1.0.0' }
        });
    } else {
        console.log("📝 Updating existing Purchase Order template...");
        template.name = 'Professional Purchase Order';
        template.requiredFields = requiredFields;
        template.content = content;
        template.placeholders = placeholders;
    }

    await template.save();
    console.log("✅ Successfully saved Purchase Order template to DB!");

    await mongoose.connection.close();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating template:", error);
    process.exit(1);
  }
}

createPurchaseOrderTemplate();
