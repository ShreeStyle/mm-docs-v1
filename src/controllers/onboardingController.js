const User = require("../models/User");
const BrandKit = require("../models/BrandKit");
const Document = require("../models/Document");
const { applySmartDefaults, getColorPresets } = require("../services/brandKit/smartDefaults");
const { generateContent } = require("../services/ai/aiService");

// Complete onboarding in one call
exports.completeOnboarding = async (req, res) => {
    try {
        const userId = req.user.id;
        const { brandKit, firstDocument } = req.body;

        // 1. Check if user already has brand kit
        let userBrandKit = await BrandKit.findOne({ userId });

        if (!userBrandKit) {
            // Apply smart defaults to brand kit
            const brandKitWithDefaults = applySmartDefaults(brandKit || {});

            // Create brand kit
            userBrandKit = await BrandKit.create({
                userId,
                ...brandKitWithDefaults,
            });

            console.log("✅ Brand Kit created with smart defaults");
        }

        // 2. Generate first document if requested
        let document = null;
        let previewUrl = null;
        let shareUrl = null;

        if (firstDocument && firstDocument.type && firstDocument.topic) {
            // Generate AI content
            const brandContext = {
                name: userBrandKit.name,
                tone: "professional",
            };

            const content = await generateContent(
                firstDocument.type,
                firstDocument.topic,
                brandContext
            );

            // Create document with auto-applied brand kit
            document = await Document.create({
                userId,
                title: `${firstDocument.type.charAt(0).toUpperCase() + firstDocument.type.slice(1)} - ${firstDocument.topic}`,
                type: firstDocument.type,
                content,
                brandKitId: userBrandKit._id, // Auto-apply brand kit
            });

            previewUrl = `/api/documents/${document._id}/preview`;

            console.log("✅ First document created with brand kit applied");
        }

        // 3. Mark user as onboarded
        await User.findByIdAndUpdate(userId, { onboarded: true });

        res.json({
            message: "Onboarding completed successfully",
            brandKit: userBrandKit,
            document,
            previewUrl,
            nextSteps: {
                preview: previewUrl,
                download: document ? `/api/documents/${document._id}/download` : null,
                share: document ? `/api/documents/${document._id}/share` : null,
            },
        });

    } catch (error) {
        console.error("Onboarding Error:", error);
        res.status(500).json({ message: "Error completing onboarding", error: error.message });
    }
};

// Get onboarding status
exports.getOnboardingStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        const brandKit = await BrandKit.findOne({ userId });
        const documentCount = await Document.countDocuments({ userId });

        res.json({
            onboarded: user.onboarded || false,
            hasBrandKit: !!brandKit,
            documentCount,
            needsOnboarding: !brandKit || documentCount === 0,
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching onboarding status", error: error.message });
    }
};

// Get color presets for brand kit wizard
exports.getColorPresets = async (req, res) => {
    try {
        const presets = getColorPresets();
        res.json({ presets });
    } catch (error) {
        res.status(500).json({ message: "Error fetching color presets", error: error.message });
    }
};

// Skip onboarding (use all defaults)
exports.skipOnboarding = async (req, res) => {
    try {
        const userId = req.user.id;

        // Create brand kit with all defaults
        const defaultBrandKit = applySmartDefaults({ name: "My Brand" });

        const brandKit = await BrandKit.create({
            userId,
            ...defaultBrandKit,
        });

        // Mark as onboarded
        await User.findByIdAndUpdate(userId, { onboarded: true });

        res.json({
            message: "Onboarding skipped, defaults applied",
            brandKit,
        });

    } catch (error) {
        res.status(500).json({ message: "Error skipping onboarding", error: error.message });
    }
};
