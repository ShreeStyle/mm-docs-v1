const User = require("../models/User");
const Organization = require("../models/Organization");
const BrandKit = require("../models/BrandKit");
const Document = require("../models/Document");
const { applySmartDefaults, getColorPresets } = require("../services/brandKit/smartDefaults");
const { generateContent } = require("../services/ai/aiService");
const { getProfileCompleteness } = require("../services/autofill/autofillService");

/**
 * POST /api/onboarding/complete
 * Legacy: Complete onboarding in one call (brand kit + optional first doc)
 */
exports.completeOnboarding = async (req, res) => {
    try {
        const userId = req.user.id;
        const { brandKit, firstDocument } = req.body;

        // 1. Check if user already has brand kit
        let userBrandKit = await BrandKit.findOne({ userId });

        if (!userBrandKit) {
            const brandKitWithDefaults = applySmartDefaults(brandKit || {});
            userBrandKit = await BrandKit.create({
                userId,
                ...brandKitWithDefaults,
            });
            console.log("✅ Brand Kit created with smart defaults");
        }

        // 2. Generate first document if requested
        let document = null;
        let previewUrl = null;

        if (firstDocument && firstDocument.type && firstDocument.topic) {
            const brandContext = { name: userBrandKit.name, tone: "professional" };
            const content = await generateContent(firstDocument.type, firstDocument.topic, brandContext);

            document = await Document.create({
                userId,
                title: `${firstDocument.type.charAt(0).toUpperCase() + firstDocument.type.slice(1)} - ${firstDocument.topic}`,
                type: firstDocument.type,
                content,
                brandKitId: userBrandKit._id,
            });
            previewUrl = `/api/documents/${document._id}/preview`;
            console.log("✅ First document created with brand kit applied");
        }

        // 3. Mark user as onboarded
        await User.findByIdAndUpdate(userId, { onboarded: true, onboardingStep: 4 });

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

/**
 * POST /api/onboarding/step
 * Multi-step progressive onboarding.
 * Accepts { step: 1|2|3, data: {...} }
 */
exports.saveOnboardingStep = async (req, res) => {
    try {
        const userId = req.user.id;
        const { step, data } = req.body;

        if (!step || !data) {
            return res.status(400).json({ message: "step and data are required" });
        }

        const user = await User.findById(userId);

        // ── Step 1: Company Basics ─────────────────────────────────
        if (step === 1) {
            const slug = (data.companyName || "company")
                .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            const uniqueSlug = `${slug}-${Date.now().toString(36)}`;

            // Determine currency from user country
            const currencyMap = { IN: "INR", US: "USD", GB: "GBP", AE: "AED", SG: "SGD", AU: "AUD", CA: "CAD", DE: "EUR" };
            const currency = currencyMap[user.countryCode] || "INR";

            let org = await Organization.findOne({ "members.userId": userId });

            if (!org) {
                org = await Organization.create({
                    name: data.companyName || "",
                    slug: uniqueSlug,
                    industry: data.industry || "other",
                    size: data.companySize || "1-10",
                    primaryUseCase: data.primaryUseCase || "all",
                    defaults: { currency },
                    members: [{ userId, role: "owner" }]
                });
            } else {
                org.name = data.companyName || org.name;
                org.industry = data.industry || org.industry;
                org.size = data.companySize || org.size;
                org.primaryUseCase = data.primaryUseCase || org.primaryUseCase;
                org.defaults.currency = currency;
                await org.save();
            }

            // Update user role if provided
            if (data.role) {
                user.role = data.role;
            }

            user.onboardingStep = 1;
            await user.save();

            return res.json({ message: "Step 1 saved", step: 1, org });
        }

        // ── Step 2: Brand Kit ──────────────────────────────────────
        if (step === 2) {
            let brandKit = await BrandKit.findOne({ userId });

            const brandData = {
                brandName: data.brandName || "",
                logo: data.logo || "",
                primaryColor: data.primaryColor || "#7C3AED",
                secondaryColor: data.secondaryColor || "#64748B",
                accentColor: data.accentColor || "#3B82F6",
                fontFamily: data.fontFamily || "Inter",
                footer: {
                    phone: data.phone || "",
                    website: data.website || ""
                },
                banking: {
                    bankName: data.bankName || "",
                    accountName: data.accountName || "",
                    accountNumber: data.accountNumber || "",
                    ifscCode: data.ifscCode || "",
                    upiId: data.upiId || ""
                }
            };

            if (!brandKit) {
                const defaults = applySmartDefaults(brandData);
                brandKit = await BrandKit.create({ userId, ...defaults });
            } else {
                Object.assign(brandKit, brandData);
                brandKit.footer = { ...brandKit.footer, ...brandData.footer };
                await brandKit.save();
            }

            // Also update org contact info
            const org = await Organization.findOne({ "members.userId": userId });
            if (org) {
                org.contact.phone = data.phone || org.contact.phone;
                org.contact.website = data.website || org.contact.website;
                await org.save();
            }

            user.onboardingStep = 2;
            await user.save();

            return res.json({ message: "Step 2 saved", step: 2, brandKit });
        }

        // ── Step 3: Tax & Compliance (India-gated) ─────────────────
        if (step === 3) {
            const org = await Organization.findOne({ "members.userId": userId });
            if (org) {
                if (data.gstin) org.tax.gstin = data.gstin;
                if (data.pan) org.tax.pan = data.pan;
                if (data.gstRegistrationType) org.tax.gstRegistrationType = data.gstRegistrationType;
                if (data.registeredAddress) {
                    Object.assign(org.registeredAddress, data.registeredAddress);
                }
                await org.save();
            }

            // Mark onboarding as complete
            user.onboardingStep = 4;
            user.onboarded = true;
            await user.save();

            return res.json({ message: "Step 3 saved. Onboarding complete!", step: 3, onboarded: true });
        }

        return res.status(400).json({ message: "Invalid step. Use 1, 2, or 3." });

    } catch (error) {
        console.error("Onboarding Step Error:", error);
        res.status(500).json({ message: "Error saving onboarding step", error: error.message });
    }
};

/**
 * GET /api/onboarding/status
 */
exports.getOnboardingStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const brandKit = await BrandKit.findOne({ userId });
        const documentCount = await Document.countDocuments({ userId });
        const profile = await getProfileCompleteness(userId);

        res.json({
            onboarded: user.onboarded || false,
            onboardingStep: user.onboardingStep || 0,
            hasBrandKit: !!brandKit,
            documentCount,
            needsOnboarding: !user.onboarded,
            profileCompleteness: profile
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching onboarding status", error: error.message });
    }
};

/**
 * GET /api/onboarding/color-presets
 */
exports.getColorPresets = async (req, res) => {
    try {
        const presets = getColorPresets();
        res.json({ presets });
    } catch (error) {
        res.status(500).json({ message: "Error fetching color presets", error: error.message });
    }
};

/**
 * POST /api/onboarding/skip
 */
exports.skipOnboarding = async (req, res) => {
    try {
        const userId = req.user.id;
        const defaultBrandKit = applySmartDefaults({ name: "My Brand" });

        const brandKit = await BrandKit.create({ userId, ...defaultBrandKit });
        await User.findByIdAndUpdate(userId, { onboarded: true, onboardingStep: 4 });

        res.json({ message: "Onboarding skipped, defaults applied", brandKit });
    } catch (error) {
        res.status(500).json({ message: "Error skipping onboarding", error: error.message });
    }
};
