const Document = require("../models/Document");
const { getAllTemplates, getTemplatesByCategory, getTemplateById } = require("../data/templateLibrary");

// Get all available templates
exports.getTemplates = async (req, res) => {
    try {
        const { category } = req.query;

        let templates;
        if (category) {
            templates = getTemplatesByCategory(category);
        } else {
            templates = getAllTemplates();
        }

        res.json({
            total: templates.length,
            templates: templates.map(t => ({
                id: t.id,
                title: t.title,
                category: t.category,
                description: t.description,
                tags: t.tags,
            }))
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching templates", error: error.message });
    }
};

// Get template details
exports.getTemplateDetails = async (req, res) => {
    try {
        const { templateId } = req.params;

        const template = getTemplateById(templateId);

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        res.json(template);

    } catch (error) {
        res.status(500).json({ message: "Error fetching template", error: error.message });
    }
};

// Clone template to user's documents
exports.cloneTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        const userId = req.user.id;
        const { customTitle } = req.body;

        const template = getTemplateById(templateId);

        if (!template) {
            return res.status(404).json({ message: "Template not found" });
        }

        // Get user's brand kit to auto-apply
        const BrandKit = require("../models/BrandKit");
        const brandKit = await BrandKit.findOne({ userId });

        // Create document from template
        const document = await Document.create({
            userId,
            title: customTitle || template.title,
            type: template.category,
            content: template.content,
            brandKitId: brandKit?._id,
        });

        res.json({
            message: "Template cloned successfully",
            document,
            previewUrl: `/api/documents/${document._id}/preview`,
            downloadUrl: `/api/documents/${document._id}/download`,
        });

    } catch (error) {
        console.error("Clone Template Error:", error);
        res.status(500).json({ message: "Error cloning template", error: error.message });
    }
};

// Get template categories
exports.getCategories = async (req, res) => {
    try {
        const categories = [
            { id: "proposals", name: "Proposals", icon: "📄", count: 2 },
            { id: "invoices", name: "Invoices", icon: "💰", count: 1 },
            { id: "resumes", name: "Resumes", icon: "👤", count: 1 },
            { id: "marketing_briefs", name: "Marketing Briefs", icon: "📊", count: 1 },
            { id: "quotations", name: "Quotations", icon: "💼", count: 1 },
        ];

        res.json({ categories });

    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};
