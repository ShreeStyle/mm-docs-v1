const Document = require("../models/Document");
const BrandKit = require("../models/BrandKit");
const renderService = require("../services/render/renderService");
const pdfService = require("../services/render/pdfService");
const docxService = require("../services/render/docxService");

// Download a document as PDF
exports.downloadDocument = async (req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Fetch Brand Kit
        let brandKit = null;
        if (document.brandKitId) {
            brandKit = await BrandKit.findOne({ _id: document.brandKitId, userId: req.user.id });
        }
        if (!brandKit) {
            brandKit = await BrandKit.findOne({ userId: req.user.id });
        }

        // Render HTML
        const html = await renderService.renderDocument(document, brandKit);

        // Generate PDF with user context for watermarking
        const user = req.userModel; // From subscription middleware
        const pdf = await pdfService.generatePDF(html, user);

        // Send as download
        const filename = `${document.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdf);

    } catch (error) {
        console.error("PDF Download Error:", error);
        res.status(500).json({ message: "Error generating PDF", error: error.message });
    }
};

// Download a document as DOCX
exports.downloadDocumentDocx = async (req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Fetch Brand Kit
        let brandKit = null;
        if (document.brandKitId) {
            brandKit = await BrandKit.findOne({ _id: document.brandKitId, userId: req.user.id });
        }
        if (!brandKit) {
            brandKit = await BrandKit.findOne({ userId: req.user.id });
        }

        // Render HTML
        const html = await renderService.renderDocument(document, brandKit);

        // Generate DOCX
        const docx = await docxService.generateDOCX(html);

        // Send as download
        const filename = `${document.title.replace(/[^a-z0-9]/gi, '_')}.docx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(docx);

    } catch (error) {
        console.error("DOCX Download Error:", error);
        res.status(500).json({ message: "Error generating DOCX", error: error.message });
    }
};

// Render a document to HTML
exports.renderDocument = async (req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Fetch Brand Kit (use attached kit or fallback to user's default)
        let brandKit = null;
        if (document.brandKitId) {
            brandKit = await BrandKit.findOne({ _id: document.brandKitId, userId: req.user.id });
        }
        if (!brandKit) {
            brandKit = await BrandKit.findOne({ userId: req.user.id });
        }

        const html = await renderService.renderDocument(document, brandKit);

        // Return HTML directly
        res.setHeader("Content-Type", "text/html");
        res.send(html);

    } catch (error) {
        res.status(500).json({ message: "Error rendering document", error: error.message });
    }
};

// Create a new document
exports.createDocument = async (req, res) => {
    try {
        const { title, type, content, brandKitId } = req.body;
        const userId = req.user.id;

        const document = await Document.create({
            userId,
            title,
            type,
            content,
            brandKitId,
        });

        // Increment document count
        const user = req.userModel;
        user.documentsGeneratedThisMonth = (user.documentsGeneratedThisMonth || 0) + 1;
        await user.save();

        console.log(`📊 Document count for ${user.email}: ${user.documentsGeneratedThisMonth}`);

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: "Error creating document", error: error.message });
    }
};

// Get all documents for the user
exports.getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ userId: req.user.id }).sort({ updatedAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: "Error fetching documents", error: error.message });
    }
};

// Get a single document by ID
exports.getDocumentById = async (req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: "Error fetching document", error: error.message });
    }
};

// Update a document
exports.updateDocument = async (req, res) => {
    try {
        // Create version before updating
        const versionController = require("./versionController");
        await versionController.createVersion(req.params.id, req.user.id, "Auto-save before update");

        const document = await Document.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: "Error updating document", error: error.message });
    }
};

// Create a new document with AI generation and template rendering
exports.generateDocument = async (req, res) => {
    try {
        const { type, topic, title, content: providedData } = req.body;
        const userId = req.user.id;

        console.log(`🚀 Generating document: type=${type}, topic=${topic}, userId=${userId}`);
        console.log(`📦 Provided Data: ${JSON.stringify(providedData)}`);

        if (!type || !topic) {
            return res.status(400).json({ message: "Type and topic are required" });
        }

        // Import AI service
        const { generateContent } = require("../services/ai/aiService");
        const BrandKit = require("../models/BrandKit");

        // Fetch user's brand kit
        console.log("🔍 Fetching brand kit...");
        const brandKit = await BrandKit.findOne({ userId });
        console.log(`🎨 Brand kit found: ${brandKit ? 'Yes' : 'No'}`);

        const brandContext = brandKit
            ? { name: brandKit.name, tone: "Professional", description: brandKit.description, logo: brandKit.logo }
            : { name: "MM Docs", tone: "Professional" };

        // Generate AI content
        console.log(`🤖 Generating ${type} content...`);
        console.log(`📝 Topic: ${topic}`);
        console.log(`🎨 Brand context: ${JSON.stringify(brandContext)}`);
        const content = await generateContent(type, topic, brandContext, providedData);
        console.log(`✅ AI content generated successfully`);
        console.log(`📄 Generated content type: ${typeof content}`);
        console.log(`📄 Generated content keys: ${Object.keys(content)}`);

        // Validate that content is an object
        if (!content || typeof content !== 'object') {
            throw new Error('AI service returned invalid content format');
        }

        // Auto-generate title if not provided
        const documentTitle = title || content.title || `${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleDateString()}`;
        console.log(`📝 Document title: ${documentTitle}`);

        // Save document to database
        console.log(`💾 Saving document to database...`);
        const document = await Document.create({
            userId,
            title: documentTitle,
            type,
            content,
            brandKitId: brandKit ? brandKit._id : null,
        });

        console.log(`✅ Document saved with ID: ${document._id}`);

        // Increment document count
        const user = req.userModel;
        user.documentsGeneratedThisMonth = (user.documentsGeneratedThisMonth || 0) + 1;
        await user.save();

        console.log(`📊 Document count for ${user.email}: ${user.documentsGeneratedThisMonth}`);

        // Get remaining documents for this month
        const { canGenerateDocument } = require("../config/plans");
        const limitInfo = canGenerateDocument(user);

        res.status(201).json({
            success: true,
            message: "Document generated and saved successfully! 🎉",
            document,
            previewUrl: `/api/documents/${document._id}/preview`,
            usage: {
                documentsUsed: user.documentsGeneratedThisMonth,
                documentsRemaining: limitInfo.remaining,
                limit: limitInfo.limit,
            },
        });

    } catch (error) {
        console.error("❌ Document Generation Error:", error);
        console.error("❌ Error stack:", error.stack);
        res.status(500).json({
            message: "Error generating document",
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
// Delete a document
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting document", error: error.message });
    }
};

// Rename a document
exports.renameDocument = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title || title.trim() === '') {
            return res.status(400).json({ message: "Document title is required" });
        }

        const document = await Document.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { title: title.trim() },
            { new: true, runValidators: true }
        );

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        res.json({ 
            success: true, 
            message: "Document renamed successfully", 
            document 
        });
    } catch (error) {
        res.status(500).json({ message: "Error renaming document", error: error.message });
    }
};

// Make a copy of a document
exports.copyDocument = async (req, res) => {
    try {
        const originalDocument = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!originalDocument) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Create a copy with a new title
        const copiedDocument = await Document.create({
            userId: req.user.id,
            title: `${originalDocument.title} (Copy)`,
            type: originalDocument.type,
            content: originalDocument.content,
            brandKitId: originalDocument.brandKitId,
            status: 'draft'
        });

        res.status(201).json({ 
            success: true, 
            message: "Document copied successfully", 
            document: copiedDocument 
        });
    } catch (error) {
        res.status(500).json({ message: "Error copying document", error: error.message });
    }
};

// Archive a document
exports.archiveDocument = async (req, res) => {
    try {
        const document = await Document.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { status: 'archived', archivedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        res.json({ 
            success: true, 
            message: "Document archived successfully", 
            document 
        });
    } catch (error) {
        res.status(500).json({ message: "Error archiving document", error: error.message });
    }
};

// Unarchive a document
exports.unarchiveDocument = async (req, res) => {
    try {
        const document = await Document.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { status: 'draft', $unset: { archivedAt: "" } },
            { new: true, runValidators: true }
        );

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        res.json({ 
            success: true, 
            message: "Document unarchived successfully", 
            document 
        });
    } catch (error) {
        res.status(500).json({ message: "Error unarchiving document", error: error.message });
    }
};

// Convert document to template
exports.convertToTemplate = async (req, res) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const Template = require("../models/Template");

        // Create a template from the document
        const template = await Template.create({
            userId: req.user.id,
            name: document.title,
            category: document.type,
            description: `Template created from ${document.title}`,
            preview: document.preview || null,
            content: document.content,
            isCustom: true
        });

        res.status(201).json({ 
            success: true, 
            message: "Document converted to template successfully", 
            template 
        });
    } catch (error) {
        res.status(500).json({ message: "Error converting to template", error: error.message });
    }
};
