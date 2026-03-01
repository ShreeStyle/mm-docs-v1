const { generateContent } = require("../services/ai/aiService");
const BrandKit = require("../models/BrandKit");
const Document = require("../models/Document");
const User = require("../models/User");
const { getAIQuality } = require("../config/plans");

exports.generateDocumentContent = async (req, res) => {
    try {
        const { type, topic } = req.body;
        const userId = req.user.id;

        if (!type || !topic) {
            return res.status(400).json({ message: "Type and Topic are required" });
        }

        // Get user's subscription for AI quality
        const user = await User.findById(userId);
        const aiQuality = getAIQuality(user);
        console.log(`⚡ Using ${aiQuality} AI quality for user ${userId}`);

        // Fetch user's complete brand kit with all fields
        const brandKit = await BrandKit.findOne({ userId });
        const brandContext = brandKit
            ? {
                name: brandKit.brandName || brandKit.name || "Your Company",
                tone: "Strictly Professional and Formal",
                description: brandKit.description || "",
                logo: brandKit.logo || "",
                primaryColor: brandKit.primaryColor || "#1e40af",
                secondaryColor: brandKit.secondaryColor || "#64748b",
                accentColor: brandKit.accentColor || "#3b82f6",
                fontFamily: brandKit.fontFamily || "Inter",
                footer: brandKit.footer || {},
                website: brandKit.footer?.website || "",
                email: brandKit.footer?.email || "",
                phone: brandKit.footer?.phone || "",
                address: brandKit.footer?.address || "",
                customText: brandKit.footer?.customText || ""
              }
            : {
                name: "Generic",
                tone: "Strictly Professional and Formal",
                primaryColor: "#1e40af",
                secondaryColor: "#64748b",
                accentColor: "#3b82f6",
                fontFamily: "Inter"
              };

        // Generate Content via AI Service
        const content = await generateContent(type, topic, brandContext, {}, aiQuality);

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
    console.log("🚀 AI Controller: generateAndSaveDocument called");
    console.log("📋 Request body:", req.body);
    console.log("👤 User ID:", req.user?.id);
    
    try {
        const { type, topic, title } = req.body;
        const userId = req.user.id;

        console.log(`🎯 Generate and save request: type=${type}, topic=${topic}, userId=${userId}`);

        if (!type || !topic) {
            console.log("❌ Missing type or topic");
            return res.status(400).json({ message: "Type and Topic are required" });
        }

        // Get user's subscription for AI quality
        const user = await User.findById(userId);
        const aiQuality = getAIQuality(user);
        console.log(`⚡ Using ${aiQuality} AI quality for user ${userId}`);

        // Fetch user's complete brand kit with all fields
        console.log("🔍 Fetching brand kit...");
        const brandKit = await BrandKit.findOne({ userId });
        console.log(`🎨 Brand kit found: ${brandKit ? 'Yes' : 'No'}`);
        
        const brandContext = brandKit
            ? {
                name: brandKit.brandName || brandKit.name || "Your Company",
                tone: "Strictly Professional and Formal",
                description: brandKit.description || "",
                logo: brandKit.logo || "",
                primaryColor: brandKit.primaryColor || "#1e40af",
                secondaryColor: brandKit.secondaryColor || "#64748b",
                accentColor: brandKit.accentColor || "#3b82f6",
                fontFamily: brandKit.fontFamily || "Inter",
                footer: brandKit.footer || {},
                website: brandKit.footer?.website || "",
                email: brandKit.footer?.email || "",
                phone: brandKit.footer?.phone || "",
                address: brandKit.footer?.address || "",
                customText: brandKit.footer?.customText || ""
              }
            : {
                name: "Generic",
                tone: "Strictly Professional and Formal",
                primaryColor: "#1e40af",
                secondaryColor: "#64748b",
                accentColor: "#3b82f6",
                fontFamily: "Inter"
              };

        // Generate AI content
        console.log(`🤖 Generating ${type} for: ${topic}`);
        const content = await generateContent(type, topic, brandContext, {}, aiQuality);
        console.log(`✅ AI content generated successfully`);

        // Auto-generate title if not provided
        const documentTitle = title || content.title || `${type.charAt(0).toUpperCase() + type.slice(1)} - ${topic}`;
        console.log(`📝 Document title: ${documentTitle}`);

        // Save as document
        console.log(`💾 Saving document to database...`);
        const document = await Document.create({
            userId,
            title: documentTitle,
            type,
            content,
            brandKitId: brandKit ? brandKit._id : null,
        });

        console.log(`✅ Document saved with ID: ${document._id}`);

        res.status(201).json({
            message: "Document generated and saved successfully! 🎉",
            document,
            previewUrl: `/api/documents/${document._id}/preview`,
        });

    } catch (error) {
        console.error("❌ AI Generation & Save Error:", error);
        console.error("❌ Error stack:", error.stack);
        console.error("❌ Error details:", {
            message: error.message,
            name: error.name,
            code: error.code
        });
        res.status(500).json({ 
            message: "Error generating document", 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
