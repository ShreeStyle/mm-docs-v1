const Document = require('../models/Document');
const Template = require('../models/Template');

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

        // Create new document
        const document = new Document({
            userId,
            title: name || template.name,
            templateId: template.templateId,
            type: template.category,
            recipients: recipients || [],
            documentContent: {
                originalPdf: null, // Will be set when PDF is uploaded
                pages: 1,
                annotations: []
            },
            fields: [],
            status: 'draft'
        });

        await document.save();

        res.json({
            success: true,
            message: 'Document created successfully',
            data: document
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

        res.json({
            success: true,
            data: document
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
