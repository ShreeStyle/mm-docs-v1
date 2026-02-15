const BrandKit = require("../models/BrandKit");

exports.createBrandKit = async (req, res) => {
    try {
        const { name, logo, colors, fonts } = req.body;
        const userId = req.user.id;
        const isPro = req.user.subscriptionStatus === "pro";

        // Restriction: Free users can only have limited colors (e.g., max 2)
        if (!isPro && colors && colors.length > 2) {
            return res.status(403).json({
                message: "Free plan allows max 2 brand colors. Upgrade to Pro for unlimited.",
            });
        }

        // Restriction: Free users cannot use custom fonts (mock check)
        // For now, we assume 'Inter' and 'Roboto' are free. Anything else is Pro.
        const freeFonts = ["Inter", "Roboto", "Open Sans", "Lato"];
        if (
            !isPro &&
            fonts &&
            (!freeFonts.includes(fonts.primary) || !freeFonts.includes(fonts.secondary))
        ) {
            return res.status(403).json({
                message: "Custom fonts are a Pro feature.",
            });
        }

        // Check if user already has a brand kit (Free limit: 1)
        if (!isPro) {
            const existingKit = await BrandKit.findOne({ userId });
            if (existingKit) {
                return res.status(403).json({
                    message: "Free plan allows only 1 Brand Kit. Upgrade to Pro.",
                });
            }
        }

        const brandKit = await BrandKit.create({
            userId,
            name,
            logo,
            colors,
            fonts,
            watermark: !isPro, // Force watermark for free users
        });

        res.status(201).json(brandKit);
    } catch (error) {
        res.status(500).json({ message: "Error creating Brand Kit", error: error.message });
    }
};

exports.getBrandKit = async (req, res) => {
    try {
        const brandKit = await BrandKit.findOne({ userId: req.user.id });
        if (!brandKit) {
            return res.status(404).json({ message: "Brand Kit not found" });
        }
        res.json(brandKit);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Brand Kit", error: error.message });
    }
};

exports.updateBrandKit = async (req, res) => {
    try {
        const { colors, fonts, watermark } = req.body;
        const isPro = req.user.subscriptionStatus === "pro";

        // Pro checks for updates
        if (!isPro) {
            if (colors && colors.length > 2) {
                return res.status(403).json({ message: "Free plan max 2 colors." });
            }
            if (watermark === false) {
                return res.status(403).json({ message: "Removing watermark is a Pro feature." });
            }
            // Add font check here if needed similar to create
        }

        const brandKit = await BrandKit.findOneAndUpdate(
            { userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!brandKit) {
            return res.status(404).json({ message: "Brand Kit not found" });
        }

        res.json(brandKit);
    } catch (error) {
        res.status(500).json({ message: "Error updating Brand Kit", error: error.message });
    }
};
