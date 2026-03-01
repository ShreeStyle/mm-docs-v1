const mongoose = require('mongoose');
const Template = require('./src/models/Template');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const initializeTemplates = async () => {
    try {
        // Check if templates already exist
        const existingCount = await Template.countDocuments();
        if (existingCount > 0) {
            console.log(`Templates already initialized. Found ${existingCount} templates.`);
            return;
        }

        const defaultTemplates = [
            {
                templateId: 'offer-letter-001',
                name: 'Employment Offer Letter',
                category: 'hr',
                description: 'Professional employment offer letter with compensation details and terms',
                icon: '📄',
                requiredFields: [
                    { fieldName: 'candidateName', fieldType: 'text', label: 'Candidate Name', placeholder: 'e.g. John Doe', required: true },
                    { fieldName: 'position', fieldType: 'text', label: 'Position', placeholder: 'e.g. Senior Software Engineer', required: true },
                    { fieldName: 'department', fieldType: 'text', label: 'Department', placeholder: 'e.g. Engineering', required: true },
                    { fieldName: 'salary', fieldType: 'number', label: 'Annual Salary (₹)', placeholder: 'e.g. 1800000', required: true },
                    { fieldName: 'startDate', fieldType: 'date', label: 'Start Date', required: true },
                    { fieldName: 'reportingTo', fieldType: 'text', label: 'Reporting Manager', placeholder: 'e.g. Director of Engineering', required: true },
                    { fieldName: 'workLocation', fieldType: 'text', label: 'Work Location', placeholder: 'e.g. Bangalore Office', required: true },
                    { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Tech Solutions Pvt Ltd', required: true },
                    { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true }
                ],
                content: fs.readFileSync(path.join(__dirname, 'src/templates/offer_letter.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{candidateName}}', description: 'Name of the candidate', fieldMapping: 'candidateName' },
                    { placeholder: '{{position}}', description: 'Job position', fieldMapping: 'position' },
                    { placeholder: '{{salary}}', description: 'Annual salary amount', fieldMapping: 'salary' },
                    { placeholder: '{{companyName}}', description: 'Company name', fieldMapping: 'companyName' }
                ],
                metadata: { tags: ['employment', 'hr', 'offer'], version: '1.0.0' }
            },
            {
                templateId: 'appointment-letter-001',
                name: 'Appointment Letter',
                category: 'hr',
                description: 'Official appointment confirmation letter with terms and conditions',
                icon: '📋',
                requiredFields: [
                    { fieldName: 'employeeName', fieldType: 'text', label: 'Employee Name', placeholder: 'e.g. Jane Smith', required: true },
                    { fieldName: 'position', fieldType: 'text', label: 'Position', placeholder: 'e.g. Marketing Manager', required: true },
                    { fieldName: 'department', fieldType: 'text', label: 'Department', placeholder: 'e.g. Marketing', required: true },
                    { fieldName: 'appointmentDate', fieldType: 'date', label: 'Appointment Date', required: true },
                    { fieldName: 'reportingTo', fieldType: 'text', label: 'Reporting Manager', placeholder: 'e.g. Head of Marketing', required: true },
                    { fieldName: 'workLocation', fieldType: 'text', label: 'Work Location', placeholder: 'e.g. Mumbai Office', required: true },
                    { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Business Corp Ltd', required: true },
                    { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true }
                ],
                content: fs.readFileSync(path.join(__dirname, 'src/templates/appointment_letter.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{employeeName}}', description: 'Name of the employee', fieldMapping: 'employeeName' },
                    { placeholder: '{{position}}', description: 'Job position', fieldMapping: 'position' },
                    { placeholder: '{{appointmentDate}}', description: 'Date of appointment', fieldMapping: 'appointmentDate' }
                ],
                metadata: { tags: ['appointment', 'hr', 'employment'], version: '1.0.0' }
            },
            {
                templateId: 'experience-certificate-001',
                name: 'Experience Certificate',
                category: 'hr',
                description: 'Work experience verification certificate for employees',
                icon: '🏆',
                requiredFields: [
                    { fieldName: 'employeeName', fieldType: 'text', label: 'Employee Name', placeholder: 'e.g. Robert Johnson', required: true },
                    { fieldName: 'position', fieldType: 'text', label: 'Position Held', placeholder: 'e.g. Project Manager', required: true },
                    { fieldName: 'department', fieldType: 'text', label: 'Department', placeholder: 'e.g. Operations', required: true },
                    { fieldName: 'joiningDate', fieldType: 'date', label: 'Joining Date', required: true },
                    { fieldName: 'relievingDate', fieldType: 'date', label: 'Relieving Date', required: true },
                    { fieldName: 'workDescription', fieldType: 'textarea', label: 'Work Description', placeholder: 'Brief description of work and achievements', required: true },
                    { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Innovation Labs', required: true },
                    { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true }
                ],
                content: fs.readFileSync(path.join(__dirname, 'src/templates/experience_certificate.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{employeeName}}', description: 'Name of the employee', fieldMapping: 'employeeName' },
                    { placeholder: '{{position}}', description: 'Position held', fieldMapping: 'position' },
                    { placeholder: '{{joiningDate}}', description: 'Date of joining', fieldMapping: 'joiningDate' }
                ],
                metadata: { tags: ['experience', 'certificate', 'hr'], version: '1.0.0' }
            },
            {
                templateId: 'warning-letter-001',
                name: 'Warning Letter',
                category: 'hr',
                description: 'Employee disciplinary warning letter for policy violations',
                icon: '⚠️',
                requiredFields: [
                    { fieldName: 'employeeName', fieldType: 'text', label: 'Employee Name', placeholder: 'e.g. Alex Wilson', required: true },
                    { fieldName: 'position', fieldType: 'text', label: 'Position', placeholder: 'e.g. Sales Executive', required: true },
                    { fieldName: 'department', fieldType: 'text', label: 'Department', placeholder: 'e.g. Sales', required: true },
                    { fieldName: 'violationType', fieldType: 'select', label: 'Violation Type', required: true, options: ['Attendance Issues', 'Performance Issues', 'Behavioral Issues', 'Policy Violation', 'Other'] },
                    { fieldName: 'incidentDescription', fieldType: 'textarea', label: 'Incident Description', placeholder: 'Detailed description of the incident', required: true },
                    { fieldName: 'issueDate', fieldType: 'date', label: 'Issue Date', required: true },
                    { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Professional Services Ltd', required: true },
                    { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true }
                ],
                content: fs.readFileSync(path.join(__dirname, 'src/templates/warning_letter.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{employeeName}}', description: 'Name of the employee', fieldMapping: 'employeeName' },
                    { placeholder: '{{violationType}}', description: 'Type of violation', fieldMapping: 'violationType' },
                    { placeholder: '{{incidentDescription}}', description: 'Description of incident', fieldMapping: 'incidentDescription' }
                ],
                metadata: { tags: ['warning', 'disciplinary', 'hr'], version: '1.0.0' }
            },
            {
                templateId: 'nda-001',
                name: 'Non-Disclosure Agreement',
                category: 'legal',
                description: 'Confidentiality and non-disclosure agreement for business partnerships',
                icon: '🔒',
                requiredFields: [
                    { fieldName: 'partyName', fieldType: 'text', label: 'Other Party Name', placeholder: 'e.g. ABC Corp or Individual Name', required: true },
                    { fieldName: 'partyAddress', fieldType: 'textarea', label: 'Other Party Address', placeholder: 'Complete address of the other party', required: true },
                    { fieldName: 'effectiveDate', fieldType: 'date', label: 'Effective Date', required: true },
                    { fieldName: 'duration', fieldType: 'number', label: 'Duration (Years)', placeholder: 'e.g. 2', required: true },
                    { fieldName: 'purpose', fieldType: 'textarea', label: 'Purpose/Project', placeholder: 'Brief description of the purpose or project', required: true },
                    { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Your Company Ltd', required: true },
                    { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true }
                ],
                content: fs.readFileSync(path.join(__dirname, 'src/templates/nda.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{partyName}}', description: 'Name of the other party', fieldMapping: 'partyName' },
                    { placeholder: '{{effectiveDate}}', description: 'Agreement effective date', fieldMapping: 'effectiveDate' },
                    { placeholder: '{{duration}}', description: 'Agreement duration', fieldMapping: 'duration' }
                ],
                metadata: { tags: ['nda', 'confidentiality', 'legal'], version: '1.0.0' }
            },
            {
                templateId: 'invoice-001',
                name: 'Professional Invoice',
                category: 'finance',
                description: 'Standard billing invoice for services and products',
                icon: '🧾',
                requiredFields: [
                    { fieldName: 'clientName', fieldType: 'text', label: 'Client Name', placeholder: 'e.g. XYZ Corporation', required: true },
                    { fieldName: 'clientAddress', fieldType: 'textarea', label: 'Client Address', placeholder: 'Complete billing address', required: true },
                    { fieldName: 'invoiceNumber', fieldType: 'text', label: 'Invoice Number', placeholder: 'e.g. INV-2024-001', required: true },
                    { fieldName: 'invoiceDate', fieldType: 'date', label: 'Invoice Date', required: true },
                    { fieldName: 'dueDate', fieldType: 'date', label: 'Due Date', required: true },
                    { fieldName: 'totalAmount', fieldType: 'number', label: 'Total Amount (₹)', placeholder: 'e.g. 118000', required: true },
                    { fieldName: 'serviceDescription', fieldType: 'textarea', label: 'Service/Product Description', placeholder: 'Detailed description of services or products', required: true },
                    { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Your Business Ltd', required: true },
                    { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true }
                ],
                content: fs.readFileSync(path.join(__dirname, 'src/templates/invoice.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{clientName}}', description: 'Name of the client', fieldMapping: 'clientName' },
                    { placeholder: '{{invoiceNumber}}', description: 'Invoice number', fieldMapping: 'invoiceNumber' },
                    { placeholder: '{{totalAmount}}', description: 'Total invoice amount', fieldMapping: 'totalAmount' }
                ],
                metadata: { tags: ['invoice', 'billing', 'finance'], version: '1.0.0' }
            }
        ];

        // Insert all templates
        const insertedTemplates = await Template.insertMany(defaultTemplates);

        console.log(`✅ Successfully initialized ${insertedTemplates.length} templates:`);
        insertedTemplates.forEach(t => {
            console.log(`   - ${t.name} (${t.templateId})`);
        });

    } catch (error) {
        console.error('❌ Error initializing templates:', error);
    }
};

const main = async () => {
    await connectDB();
    await initializeTemplates();
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
};

main();