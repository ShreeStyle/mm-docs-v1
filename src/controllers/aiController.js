const { generateContent } = require("../services/ai/aiService");
const BrandKit = require("../models/BrandKit");
const Document = require("../models/Document");

exports.generateDocumentContent = async (req, res) => {
    try {
        const { type, topic } = req.body;
        const userId = req.user.id;

        if (!type || !topic) {
            return res.status(400).json({ message: "Type and Topic are required" });
        }

        const brandContext = brandKit
            ? { name: brandKit.name, tone: "Professional", description: brandKit.description, logo: brandKit.logo } // tone could be added to BrandKit later
            : { name: "Generic", tone: "Neutral" };

        // Generate Content via AI Service
        const content = await generateContent(type, topic, brandContext);

        res.json({
            message: "Content generated successfully ✨",
            type,
            topic,
            content,
        });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ message: "Error generating content", error: error.message });
    }
};

// Generate AI content AND save as document (One-Click!)
exports.generateAndSaveDocument = async (req, res) => {
    try {
        const { type, topic, title } = req.body;
        const userId = req.user.id;

        if (!type || !topic) {
            return res.status(400).json({ message: "Type and Topic are required" });
        }

        // Fetch user's brand kit
        const brandKit = await BrandKit.findOne({ userId });
        const brandContext = brandKit
            ? { name: brandKit.name, tone: "Professional", description: brandKit.description, logo: brandKit.logo }
            : { name: "Generic", tone: "Neutral" };

        // Generate AI content
        console.log(`🤖 Generating ${type} for: ${topic}`);
        const content = await generateContent(type, topic, brandContext);

        // Auto-generate title if not provided
        const documentTitle = title || content.title || `${type.charAt(0).toUpperCase() + type.slice(1)} - ${topic}`;

        // Save as document
        const document = await Document.create({
            userId,
            title: documentTitle,
            type,
            content,
            brandKitId: brandKit ? brandKit._id : null,
        });

        res.status(201).json({
            message: "Document generated and saved successfully! 🎉",
            document,
            previewUrl: `/api/documents/${document._id}/preview`,
        });

    } catch (error) {
        console.error("AI Generation & Save Error:", error);
        res.status(500).json({ message: "Error generating document", error: error.message });
    }
};
