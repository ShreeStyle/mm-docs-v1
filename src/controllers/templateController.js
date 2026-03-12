const Template = require('../models/Template');
const fs = require('fs');
const path = require('path');

// Get all templates
exports.getAllTemplates = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { 'metadata.isActive': true };
        
        if (category && category !== 'all') {
            filter.category = category;
        }

        const templates = await Template.find(filter)
            .select('-content') // Don't send full content in list view
            .sort({ displayOrder: 1, category: 1, name: 1 }); // Sort by displayOrder first, then category, then name

        res.json({
            success: true,
            data: templates,
            count: templates.length
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch templates',
            error: error.message
        });
    }
};

// Get single template by ID
exports.getTemplateById = async (req, res) => {
    try {
        const { templateId } = req.params;
        
        const template = await Template.findOne({ 
            templateId: templateId,
            'metadata.isActive': true 
        });

        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Increment usage count
        await Template.findByIdAndUpdate(template._id, {
            $inc: { 'metadata.usageCount': 1 }
        });

        res.json({
            success: true,
            data: template
        });
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch template',
            error: error.message
        });
    }
};

// Get template categories with counts
exports.getTemplateCategories = async (req, res) => {
    try {
        const categories = await Template.aggregate([
            { $match: { 'metadata.isActive': true } },
            { 
                $group: { 
                    _id: '$category', 
                    count: { $sum: 1 },
                    templates: { $push: { templateId: '$templateId', name: '$name' } }
                } 
            },
            { $sort: { _id: 1 } }
        ]);

        const categoryMap = {
            hr: 'HR Documents',
            legal: 'Legal Documents',
            sales: 'Sales Documents', 
            finance: 'Finance Documents',
            compliance: 'Compliance Documents'
        };

        const formattedCategories = categories.map(cat => ({
            id: cat._id,
            name: categoryMap[cat._id] || cat._id,
            count: cat.count,
            templates: cat.templates
        }));

        res.json({
            success: true,
            data: formattedCategories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

// Initialize default templates (run once)
exports.initializeTemplates = async (req, res) => {
    try {
        // Check if templates already exist
        const existingCount = await Template.countDocuments();
        if (existingCount > 0) {
            return res.json({
                success: true,
                message: `Templates already initialized. Found ${existingCount} templates.`
            });
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
                content: await fs.promises.readFile(path.join(__dirname, '../templates/offer_letter.hbs'), 'utf8'),
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
                content: await fs.promises.readFile(path.join(__dirname, '../templates/appointment_letter.hbs'), 'utf8'),
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
                content: await fs.promises.readFile(path.join(__dirname, '../templates/experience_certificate.hbs'), 'utf8'),
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
                content: await fs.promises.readFile(path.join(__dirname, '../templates/warning_letter.hbs'), 'utf8'),
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
                content: await fs.promises.readFile(path.join(__dirname, '../templates/nda.hbs'), 'utf8'),
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
                content: await fs.promises.readFile(path.join(__dirname, '../templates/invoice.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{clientName}}', description: 'Name of the client', fieldMapping: 'clientName' },
                    { placeholder: '{{invoiceNumber}}', description: 'Invoice number', fieldMapping: 'invoiceNumber' },
                    { placeholder: '{{totalAmount}}', description: 'Total invoice amount', fieldMapping: 'totalAmount' }
                ],
                metadata: { tags: ['invoice', 'billing', 'finance'], version: '1.0.0' }
            },
            {
                templateId: 'letter-of-recommendation-001',
                name: 'Letter of Recommendation',
                category: 'hr',
                description: 'Professional recommendation letter for students or employees',
                icon: '🎓',
                requiredFields: [
                    { fieldName: 'candidateName', fieldType: 'text', label: 'Candidate Name', placeholder: 'e.g. John Doe', required: true },
                    { fieldName: 'position', fieldType: 'text', label: 'Position/Course Applied For', placeholder: 'e.g. Master of Science in CS', required: true },
                    { fieldName: 'recommenderName', fieldType: 'text', label: 'Recommender Name', placeholder: 'e.g. Prof. Alan Turing', required: true },
                    { fieldName: 'recommenderTitle', fieldType: 'text', label: 'Recommender Title', placeholder: 'e.g. Head of Engineering', required: true },
                    { fieldName: 'relationship', fieldType: 'text', label: 'Relationship', placeholder: 'e.g. Professor / Supervisor', required: true },
                    { fieldName: 'companyName', fieldType: 'text', label: 'Company/University Name', placeholder: 'e.g. Tech University', required: true },
                    { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete address', required: true }
                ],
                content: await fs.promises.readFile(path.join(__dirname, '../templates/recommendation_letter.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{candidateName}}', description: 'Name of the candidate', fieldMapping: 'candidateName' },
                    { placeholder: '{{position}}', description: 'Position or course', fieldMapping: 'position' },
                    { placeholder: '{{recommenderName}}', description: 'Name of the recommender', fieldMapping: 'recommenderName' }
                ],
                metadata: { tags: ['recommendation', 'hr', 'academic'], version: '1.0.0' }
            }
        ];

        // Insert all templates
        const insertedTemplates = await Template.insertMany(defaultTemplates);

        res.json({
            success: true,
            message: `Successfully initialized ${insertedTemplates.length} templates`,
            data: insertedTemplates.map(t => ({ templateId: t.templateId, name: t.name }))
        });

    } catch (error) {
        console.error('Error initializing templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize templates',
            error: error.message
        });
    }
};