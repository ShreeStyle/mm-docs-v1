const Document = require('../models/Document');
const Template = require('../models/Template');
const { buildAutofillMap } = require('../services/autofill/autofillService');
const pdfService = require('../services/render/pdfService');
// Create document from template with recipients
exports.createFromTemplate = async (req, res) => {
    try {
        const { templateId, name, recipients } = req.body;
        const userId = req.user.id;

        // Fetch template
        const template = await Template.findOne({ templateId });
        if (!template) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Fetch Autofill Map
        console.log(`🤖 Building autofill map for userId: ${userId}, type: ${template.category}`);
        const autofillMap = await buildAutofillMap(userId, template.category);

        // Pre-fill fields from template requiredFields
        const fields = (template.requiredFields || []).map(ref => {
            // Check if this field maps to an autofill key
            // Try fieldName, then label (slugified), then check common mappings
            const mappingKey = ref.fieldName?.toLowerCase() || ref.label?.toLowerCase().replace(/\s+/g, '_');
            const autofillValue = autofillMap[mappingKey] || autofillMap[ref.fieldName];

            return {
                fieldType: ref.fieldType === 'select' ? 'dropdown' : (ref.fieldType || 'text'),
                label: ref.label,
                page: 1, // Default to page 1 for now
                position: { x: 100, y: 100 }, // Default position, will be adjusted in editor
                size: { width: 200, height: 40 },
                properties: {
                    required: ref.required || false,
                    assignedTo: 'SENDER', // Default to sender for pre-filled fields
                    defaultValue: autofillValue || ref.placeholder || '',
                    options: ref.options || []
                },
                value: autofillValue || '' // Pre-fill the value!
            };
        });

        // Create new document
        const document = new Document({
            userId,
            title: name || template.name,
            templateId: template.templateId,
            type: template.category,
            recipients: recipients || [],
            documentContent: {
                originalPdf: null, 
                pages: 1,
                annotations: []
            },
            fields: fields,
            status: 'draft'
        });

        await document.save();

        res.json({
            success: true,
            message: 'Document created successfully with autofill! 🎉',
            data: document,
            autofillApplied: Object.keys(autofillMap).length
        });
    } catch (error) {
        console.error('Error creating document from template:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create document',
            error: error.message
        });
    }
};

// Get document by ID
exports.getDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;

        const document = await Document.findOne({
            _id: documentId,
            userId
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Fetch latest autofill map to help frontend fill missing fields
        const autofillMap = await buildAutofillMap(userId, document.type);

        res.json({
            success: true,
            data: document,
            autofillMap
        });
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch document',
            error: error.message
        });
    }
};

// Update document
exports.updateDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        const document = await Document.findOneAndUpdate(
            { _id: documentId, userId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.json({
            success: true,
            message: 'Document updated successfully',
            data: document
        });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update document',
            error: error.message
        });
    }
};

// Update document fields
exports.updateFields = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;
        const { fields } = req.body;

        const document = await Document.findOneAndUpdate(
            { _id: documentId, userId },
            { $set: { fields } },
            { new: true }
        );

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.json({
            success: true,
            message: 'Fields updated successfully',
            data: document
        });
    } catch (error) {
        console.error('Error updating fields:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update fields',
            error: error.message
        });
    }
};

// Update recipients
exports.updateRecipients = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;
        const { recipients } = req.body;

        const document = await Document.findOneAndUpdate(
            { _id: documentId, userId },
            { $set: { recipients } },
            { new: true }
        );

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.json({
            success: true,
            message: 'Recipients updated successfully',
            data: document
        });
    } catch (error) {
        console.error('Error updating recipients:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update recipients',
            error: error.message
        });
    }
};

// Send document to recipients
exports.sendDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;

        const document = await Document.findOne({
            _id: documentId,
            userId
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Update document status
        document.status = 'sent';
        document.sentAt = new Date();
        await document.save();

        // TODO: Send emails to recipients
        // This would involve email service integration
        
        res.json({
            success: true,
            message: 'Document sent successfully',
            data: document
        });
    } catch (error) {
        console.error('Error sending document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send document',
            error: error.message
        });
    }
};

// Delete document
exports.deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;

        const document = await Document.findOneAndDelete({
            _id: documentId,
            userId
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document',
            error: error.message
        });
    }
};

// Generate WYSIWYG PDF from Editor HTML
exports.generateEditorPDF = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;
        const { html } = req.body;

        if (!html) {
            return res.status(400).json({ success: false, message: 'HTML payload is required' });
        }

        const document = await Document.findOne({ _id: documentId, userId });
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        // The exact HTML is already generated in the frontend. We just wrap it safely for Puppeteer.
        // We add styles to normalize margins so the injected HTML matches the page bounds perfectly.
        const pdfHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>${document.title}</title>
                    <style>
                        body { margin: 0; padding: 0; background-color: white; }
                        * { box-sizing: border-box; }
                        /* Ensure the canvas area prints scaled correctly */
                        @page { size: auto; margin: 0mm; } 
                    </style>
                </head>
                <body>
                    ${html}
                </body>
            </html>
        `;

        const user = req.userModel || null; 
        const pdf = await pdfService.generatePDF(pdfHtml, user);

        const filename = `${document.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdf);

    } catch (error) {
        console.error('Error generating editor PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF',
            error: error.message
        });
    }
};

