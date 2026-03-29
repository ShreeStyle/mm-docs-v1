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
                    { fieldName: 'candidate_name', fieldType: 'text', label: 'Candidate Name', placeholder: 'e.g. John Doe', required: true },
                    { fieldName: 'position', fieldType: 'text', label: 'Position', placeholder: 'e.g. Senior Software Engineer', required: true },
                    { fieldName: 'department', fieldType: 'text', label: 'Department', placeholder: 'e.g. Engineering', required: true },
                    { fieldName: 'salary', fieldType: 'number', label: 'Annual Salary (₹)', placeholder: 'e.g. 1800000', required: true },
                    { fieldName: 'start_date', fieldType: 'date', label: 'Start Date', required: true },
                    { fieldName: 'reporting_to', fieldType: 'text', label: 'Reporting Manager', placeholder: 'e.g. Director of Engineering', required: true },
                    { fieldName: 'work_location', fieldType: 'text', label: 'Work Location', placeholder: 'e.g. Bangalore Office', required: true },
                    { fieldName: 'company_name', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Tech Solutions Pvt Ltd', required: true },
                    { fieldName: 'company_address', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true }
                ],
                content: await fs.promises.readFile(path.join(__dirname, '../templates/offer_letter.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{candidate_name}}', description: 'Name of the candidate', fieldMapping: 'candidate_name' },
                    { placeholder: '{{position}}', description: 'Job position', fieldMapping: 'position' },
                    { placeholder: '{{salary}}', description: 'Annual salary amount', fieldMapping: 'salary' },
                    { placeholder: '{{company_name}}', description: 'Company name', fieldMapping: 'company_name' }
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
                    { fieldName: 'employee_name', fieldType: 'text', label: 'Employee Name', placeholder: 'e.g. Jane Smith', required: true },
                    { fieldName: 'position', fieldType: 'text', label: 'Position', placeholder: 'e.g. Marketing Manager', required: true },
                    { fieldName: 'department', fieldType: 'text', label: 'Department', placeholder: 'e.g. Marketing', required: true },
                    { fieldName: 'appointment_date', fieldType: 'date', label: 'Appointment Date', required: true },
                    { fieldName: 'salary', fieldType: 'number', label: 'Annual Salary (₹)', placeholder: 'e.g. 1800000', required: true },
                    { fieldName: 'reporting_to', fieldType: 'text', label: 'Reporting Manager', placeholder: 'e.g. Head of Marketing', required: true },
                    { fieldName: 'work_location', fieldType: 'text', label: 'Work Location', placeholder: 'e.g. Mumbai Office', required: true },
                    { fieldName: 'company_name', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Business Corp Ltd', required: true },
                    { fieldName: 'company_address', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true }
                ],
                content: await fs.promises.readFile(path.join(__dirname, '../templates/appointment_letter.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{employee_name}}', description: 'Name of the employee', fieldMapping: 'employee_name' },
                    { placeholder: '{{position}}', description: 'Job position', fieldMapping: 'position' },
                    { placeholder: '{{appointment_date}}', description: 'Date of appointment', fieldMapping: 'appointment_date' }
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
                    { fieldName: 'employee_name', fieldType: 'text', label: 'Employee Name', placeholder: 'e.g. Robert Johnson', required: true },
                    { fieldName: 'position', fieldType: 'text', label: 'Position Held', placeholder: 'e.g. Project Manager', required: true },
                    { fieldName: 'department', fieldType: 'text', label: 'Department', placeholder: 'e.g. Operations', required: true },
                    { fieldName: 'joining_date', fieldType: 'date', label: 'Joining Date', required: true },
                    { fieldName: 'relieving_date', fieldType: 'date', label: 'Relieving Date', required: true },
                    { fieldName: 'work_description', fieldType: 'textarea', label: 'Work Description', placeholder: 'Brief description of work and achievements', required: true },
                    { fieldName: 'company_name', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Innovation Labs', required: true },
                    { fieldName: 'company_address', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true }
                ],
                content: await fs.promises.readFile(path.join(__dirname, '../templates/experience_certificate.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{employee_name}}', description: 'Name of the employee', fieldMapping: 'employee_name' },
                    { placeholder: '{{position}}', description: 'Position held', fieldMapping: 'position' },
                    { placeholder: '{{joining_date}}', description: 'Date of joining', fieldMapping: 'joining_date' }
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
                    { fieldName: 'employee_name', fieldType: 'text', label: 'Employee Name', placeholder: 'e.g. Alex Wilson', required: true },
                    { fieldName: 'position', fieldType: 'text', label: 'Position', placeholder: 'e.g. Sales Executive', required: true },
                    { fieldName: 'department', fieldType: 'text', label: 'Department', placeholder: 'e.g. Sales', required: true },
                    { fieldName: 'violation_type', fieldType: 'select', label: 'Violation Type', required: true, options: ['Attendance Issues', 'Performance Issues', 'Behavioral Issues', 'Policy Violation', 'Other'] },
                    { fieldName: 'incident_description', fieldType: 'textarea', label: 'Incident Description', placeholder: 'Detailed description of the incident', required: true },
                    { fieldName: 'issue_date', fieldType: 'date', label: 'Issue Date', required: true },
                    { fieldName: 'company_name', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Professional Services Ltd', required: true },
                    { fieldName: 'company_address', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true }
                ],
                content: await fs.promises.readFile(path.join(__dirname, '../templates/warning_letter.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{employee_name}}', description: 'Name of the employee', fieldMapping: 'employee_name' },
                    { placeholder: '{{violation_type}}', description: 'Type of violation', fieldMapping: 'violation_type' },
                    { placeholder: '{{incident_description}}', description: 'Description of incident', fieldMapping: 'incident_description' }
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
                    { fieldName: 'party_name', fieldType: 'text', label: 'Other Party Name', placeholder: 'e.g. ABC Corp or Individual Name', required: true },
                    { fieldName: 'party_address', fieldType: 'textarea', label: 'Other Party Address', placeholder: 'Complete address of the other party', required: true },
                    { fieldName: 'effective_date', fieldType: 'date', label: 'Effective Date', required: true },
                    { fieldName: 'duration', fieldType: 'number', label: 'Duration (Years)', placeholder: 'e.g. 2', required: true },
                    { fieldName: 'purpose', fieldType: 'textarea', label: 'Purpose/Project', placeholder: 'Brief description of the purpose or project', required: true },
                    { fieldName: 'company_name', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Your Company Ltd', required: true },
                    { fieldName: 'company_address', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true }
                ],
                content: await fs.promises.readFile(path.join(__dirname, '../templates/nda.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{party_name}}', description: 'Name of the other party', fieldMapping: 'party_name' },
                    { placeholder: '{{effective_date}}', description: 'Agreement effective date', fieldMapping: 'effective_date' },
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
                    { fieldName: 'client_name', fieldType: 'text', label: 'Client Name', placeholder: 'e.g. XYZ Corporation', required: true },
                    { fieldName: 'client_address', fieldType: 'textarea', label: 'Client Address', placeholder: 'Complete billing address', required: true },
                    { fieldName: 'invoice_number', fieldType: 'text', label: 'Invoice Number', placeholder: 'e.g. INV-2024-001', required: true },
                    { fieldName: 'invoice_date', fieldType: 'date', label: 'Invoice Date', required: true },
                    { fieldName: 'due_date', fieldType: 'date', label: 'Due Date', required: true },
                    { fieldName: 'total_amount', fieldType: 'number', label: 'Total Amount (₹)', placeholder: 'e.g. 118000', required: true },
                    { fieldName: 'service_description', fieldType: 'textarea', label: 'Service/Product Description', placeholder: 'Detailed description of services or products', required: true },
                    { fieldName: 'company_name', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Your Business Ltd', required: true },
                    { fieldName: 'company_address', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true },
                    { fieldName: 'bank_name', fieldType: 'text', label: 'Bank Name', placeholder: 'e.g. HDFC Bank', required: true },
                    { fieldName: 'bank_account_name', fieldType: 'text', label: 'Account Name', placeholder: 'e.g. Your Business Name', required: true },
                    { fieldName: 'bank_account_number', fieldType: 'text', label: 'Account No.', placeholder: 'e.g. 50100234567890', required: true },
                    { fieldName: 'bank_ifsc', fieldType: 'text', label: 'IFSC Code', placeholder: 'e.g. HDFC0001234', required: true },
                    { fieldName: 'bank_upi', fieldType: 'text', label: 'UPI ID', placeholder: 'e.g. yourbusiness@okhdfc', required: false }
                ],
                content: await fs.promises.readFile(path.join(__dirname, '../templates/invoice.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{client_name}}', description: 'Name of the client', fieldMapping: 'client_name' },
                    { placeholder: '{{invoice_number}}', description: 'Invoice number', fieldMapping: 'invoice_number' },
                    { placeholder: '{{total_amount}}', description: 'Total invoice amount', fieldMapping: 'total_amount' }
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
                    { fieldName: 'candidate_name', fieldType: 'text', label: 'Candidate Name', placeholder: 'e.g. John Doe', required: true },
                    { fieldName: 'position', fieldType: 'text', label: 'Position/Course Applied For', placeholder: 'e.g. Master of Science in CS', required: true },
                    { fieldName: 'recommender_name', fieldType: 'text', label: 'Recommender Name', placeholder: 'e.g. Prof. Alan Turing', required: true },
                    { fieldName: 'recommender_title', fieldType: 'text', label: 'Recommender Title', placeholder: 'e.g. Head of Engineering', required: true },
                    { fieldName: 'relationship', fieldType: 'text', label: 'Relationship', placeholder: 'e.g. Professor / Supervisor', required: true },
                    { fieldName: 'company_name', fieldType: 'text', label: 'Company/University Name', placeholder: 'e.g. Tech University', required: true },
                    { fieldName: 'company_address', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete address', required: true }
                ],
                content: await fs.promises.readFile(path.join(__dirname, '../templates/recommendation_letter.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{candidate_name}}', description: 'Name of the candidate', fieldMapping: 'candidate_name' },
                    { placeholder: '{{position}}', description: 'Position or course', fieldMapping: 'position' },
                    { placeholder: '{{recommender_name}}', description: 'Name of the recommender', fieldMapping: 'recommender_name' }
                ],
                metadata: { tags: ['recommendation', 'hr', 'academic'], version: '1.0.0' }
            },
            {
                templateId: 'business-proposal-001',
                name: 'Business Proposal',
                category: 'sales',
                description: 'Professional business proposal template with executive summary, methodology, and budget',
                icon: '💼',
                requiredFields: [
                    { fieldName: 'company_name', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Green Simple Company', required: true },
                    { fieldName: 'company_address', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true },
                    { fieldName: 'company_email', fieldType: 'email', label: 'Company Email', placeholder: 'e.g. hello@company.com', required: true },
                    { fieldName: 'company_phone', fieldType: 'text', label: 'Company Phone', placeholder: 'e.g. +123-456-7890', required: true },
                    { fieldName: 'company_website', fieldType: 'text', label: 'Company Website', placeholder: 'e.g. www.company.com', required: false },
                    { fieldName: 'project_title', fieldType: 'text', label: 'Project Title', placeholder: 'e.g. Digital Marketing Transformation Initiative', required: true },
                    { fieldName: 'project_type', fieldType: 'text', label: 'Project Type', placeholder: 'e.g. Marketing, Software Development', required: false },
                    { fieldName: 'project_description', fieldType: 'textarea', label: 'Executive Summary', placeholder: 'High-level project summary', required: true },
                    { fieldName: 'problem_statement', fieldType: 'textarea', label: 'Objectives', placeholder: 'Enter objectives as bullet points', required: true },
                    { fieldName: 'proposed_solution', fieldType: 'textarea', label: 'Methodology / Solution', placeholder: 'Brief explanation of the methodology', required: true },
                    { fieldName: 'target_audience', fieldType: 'textarea', label: 'Scope (Inclusions)', placeholder: 'Inclusions or Target Audience', required: true },
                    { fieldName: 'key_features', fieldType: 'textarea', label: 'Scope (Exclusions)', placeholder: 'Exclusions or Limitations', required: false },
                    { fieldName: 'project_timeline', fieldType: 'textarea', label: 'Project Timeline', placeholder: 'Timeline descriptions', required: true },
                    { fieldName: 'project_budget', fieldType: 'number', label: 'Estimated Budget (₹)', placeholder: 'e.g. 500000', required: true },
                    { fieldName: 'team_members', fieldType: 'textarea', label: 'Key Stakeholders', placeholder: 'List key stakeholders and roles', required: true },
                    { fieldName: 'deliverables', fieldType: 'textarea', label: 'Expected Outcomes / Deliverables', placeholder: 'List the deliverables', required: true },
                    { fieldName: 'client_name', fieldType: 'text', label: 'Client Contact Name', placeholder: 'e.g. Avery Davis', required: true },
                    { fieldName: 'client_company', fieldType: 'text', label: 'Client Company Name', placeholder: 'e.g. Wardiere Inc.', required: true },
                    { fieldName: 'proposal_date', fieldType: 'date', label: 'Proposal Date', required: true },
                    { fieldName: 'bank_name', fieldType: 'text', label: 'Bank Name', placeholder: 'e.g. HDFC Bank', required: false },
                    { fieldName: 'bank_account_name', fieldType: 'text', label: 'Account Name', placeholder: 'e.g. Your Business Name', required: false },
                    { fieldName: 'bank_account_number', fieldType: 'text', label: 'Account No.', placeholder: 'e.g. 50100234567890', required: false },
                    { fieldName: 'bank_ifsc', fieldType: 'text', label: 'IFSC Code', placeholder: 'e.g. HDFC0001234', required: false },
                    { fieldName: 'special_notes', fieldType: 'textarea', label: 'Risk Assessment', placeholder: 'List risks and mitigation plans', required: false }
                ],
                content: await fs.promises.readFile(path.join(__dirname, '../templates/proposal.hbs'), 'utf8'),
                placeholders: [
                    { placeholder: '{{company_name}}', description: 'Your company name', fieldMapping: 'company_name' },
                    { placeholder: '{{project_title}}', description: 'Title of the project', fieldMapping: 'project_title' },
                    { placeholder: '{{client_company}}', description: 'Client company name', fieldMapping: 'client_company' }
                ],
                metadata: { tags: ['proposal', 'sales', 'business'], version: '1.0.0' }
            }
        ];

        // Upsert all templates (update if exists, insert if not)
        const upsertPromises = defaultTemplates.map(templateData => 
            Template.findOneAndUpdate(
                { templateId: templateData.templateId },
                { $set: templateData },
                { upsert: true, new: true }
            )
        );

        const updatedTemplates = await Promise.all(upsertPromises);

        res.json({
            success: true,
            message: `Successfully synchronized ${updatedTemplates.length} templates`,
            data: updatedTemplates.map(t => ({ templateId: t.templateId, name: t.name }))
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