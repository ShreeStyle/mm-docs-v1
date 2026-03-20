const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Template = require('../models/Template');
require('dotenv').config();

const registerGstTemplate = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/aidocumentation';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const templatePath = path.join(__dirname, '../templates/gst_filing_summary.hbs');
        const content = fs.readFileSync(templatePath, 'utf8');

        const gstTemplate = {
            templateId: 'gst-filing-summary-001',
            name: 'GST Filing Summary',
            category: 'finance',
            description: 'Professional GST Filing Summary (GSTR-1 format) with sales and return tables',
            icon: '📊',
            requiredFields: [
                { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', required: true },
                { fieldName: 'gstNo', fieldType: 'text', label: 'GSTIN', required: true },
                { fieldName: 'dateRange', fieldType: 'text', label: 'Filing Period', required: true }
            ],
            content: content,
            metadata: { 
                isActive: true,
                tags: ['gst', 'finance', 'tax', 'summary'],
                version: '1.0.0'
            }
        };

        const existing = await Template.findOne({ templateId: 'gst-filing-summary-001' });
        if (existing) {
            await Template.updateOne({ templateId: 'gst-filing-summary-001' }, gstTemplate);
            console.log('Updated existing GST template');
        } else {
            await Template.create(gstTemplate);
            console.log('Created new GST template');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Error registering GST template:', err);
    }
};

registerGstTemplate();
