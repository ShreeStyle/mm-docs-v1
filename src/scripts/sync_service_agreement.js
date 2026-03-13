require("dotenv").config();
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const Template = require("../models/Template");

async function syncServiceAgreement() {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        const content = fs.readFileSync(path.join(__dirname, '../templates/service_agreement.hbs'), 'utf8');
        const templateId = 'service-agreement-001';

        const templateData = {
            templateId,
            name: 'Service Agreement',
            category: 'legal',
            description: 'Professional service agreement between a company and a consultant',
            icon: '🤝',
            requiredFields: [
                { fieldName: 'executionDay', fieldType: 'number', label: 'Day of execution', placeholder: 'e.g. 13', required: true },
                { fieldName: 'executionMonth', fieldType: 'text', label: 'Month of execution', placeholder: 'e.g. March', required: true },
                { fieldName: 'executionYear', fieldType: 'number', label: 'Year of execution', placeholder: 'e.g. 2026', required: true },
                { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. My Company Pvt Ltd', required: true },
                { fieldName: 'companyCIN', fieldType: 'text', label: 'Company CIN', placeholder: 'Company Identification Number', required: true },
                { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Registered Office Address', placeholder: 'Complete office address', required: true },
                { fieldName: 'partyName', fieldType: 'text', label: 'Consultant Name', placeholder: 'e.g. John Doe', required: true },
                { fieldName: 'fatherName', fieldType: 'text', label: 'Father\'s Name', placeholder: 'Enter father\'s name', required: true },
                { fieldName: 'uidPan', fieldType: 'text', label: 'UID/PAN Number', placeholder: 'Aadhar or PAN number', required: true },
                { fieldName: 'partyAddress', fieldType: 'textarea', label: 'Consultant Address', placeholder: 'Residential address', required: true },
                { fieldName: 'startDate', fieldType: 'date', label: 'Effective/Start Date', required: true },
                { fieldName: 'endDate', fieldType: 'date', label: 'Tenure End Date', required: true },
                { fieldName: 'tenureYears', fieldType: 'number', label: 'Tenure (Years)', placeholder: 'e.g. 2', required: true },
                { fieldName: 'noticePeriod', fieldType: 'number', label: 'Notice Period (Days)', placeholder: 'e.g. 30', required: true },
                { fieldName: 'signatoryName', fieldType: 'text', label: 'Authorised Signatory Name', placeholder: 'Name for company signature', required: true }
            ],
            content: content,
            placeholders: [
                { placeholder: '{{companyName}}', description: 'Company Name', fieldMapping: 'companyName' },
                { placeholder: '{{partyName}}', description: 'Consultant Name', fieldMapping: 'partyName' },
                { placeholder: '{{executionMonth}}', description: 'Execution Month', fieldMapping: 'executionMonth' }
            ],
            metadata: { isActive: true, featured: true, tags: ['legal', 'service', 'consultant'] }
        };

        const result = await Template.findOneAndUpdate(
            { templateId },
            templateData,
            { upsert: true, new: true }
        );

        console.log("Successfully synced Service Agreement template to DB");
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Error syncing template:", error);
        process.exit(1);
    }
}

syncServiceAgreement();
