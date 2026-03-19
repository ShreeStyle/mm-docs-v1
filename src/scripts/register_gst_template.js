const mongoose = require('mongoose');
const Template = require('../models/Template');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mmdocs';

const hbsPath = path.join(__dirname, '../templates/gst_invoice.hbs');
const hbsContent = fs.readFileSync(hbsPath, 'utf8');

const gstTemplate = {
  templateId: 'gst_invoice',
  name: 'Professional GST Invoice (Green)',
  description: 'A clean, minimal, and green-themed GST invoice strictly following Indian compliance standards.',
  category: 'finance',
  icon: '🧾',
  content: hbsContent,
  requiredFields: [
    { fieldName: 'invoiceNumber', fieldType: 'text', label: 'Invoice Number', placeholder: 'GST-001' },
    { fieldName: 'invoiceDate', fieldType: 'date', label: 'Invoice Date' },
    { fieldName: 'dueDate', fieldType: 'date', label: 'Due Date' },
    { fieldName: 'companyName', fieldType: 'text', label: 'Company Name' },
    { fieldName: 'gstNumber', fieldType: 'text', label: 'Your GSTIN', placeholder: '29ABCDE1234F1Z5' },
    { fieldName: 'clientName', fieldType: 'text', label: 'Client Name' },
    { fieldName: 'clientGST', fieldType: 'text', label: 'Client GSTIN (Optional)', required: false },
    { fieldName: 'billToAddress', fieldType: 'textarea', label: 'Billing Address' },
    { fieldName: 'invoiceItems', fieldType: 'textarea', label: 'Items (Qty | Product | Description | Unit Price)' }
  ],
  metadata: {
    version: '1.0.0',
    isActive: true,
    tags: ['gst', 'invoice', 'india', 'green']
  }
};

async function registerTemplate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Update if exists, otherwise create
    const updatedTemplate = await Template.findOneAndUpdate(
      { templateId: 'gst_invoice' },
      gstTemplate,
      { upsert: true, new: true, runValidators: true }
    );

    console.log('✅ GST Invoice template registered successfully:', updatedTemplate.name);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error registering template:', error);
    process.exit(1);
  }
}

registerTemplate();
