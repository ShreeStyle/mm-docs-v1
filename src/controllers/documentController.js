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

        // Generate PDF
        const pdf = await pdfService.generatePDF(html);

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
