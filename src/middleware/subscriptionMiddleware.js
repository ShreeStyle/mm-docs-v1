const User = require("../models/User");
const Subscription = require("../models/Subscription");
const {
    canGenerateDocument,
    canExportDocument,
    canUseBrandKit,
    canExportFormat,
    PLANS,
} = require("../config/plans");

// Check and update subscription status
const checkSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if subscription has expired
        if (user.subscriptionEndDate && new Date() > user.subscriptionEndDate) {
            // Auto-downgrade to free plan if subscription expired
            if (user.plan === "pro") {
                user.plan = "free";
                user.subscriptionStatus = "expired";
                await user.save();
                console.log(`⏰ User ${user.email} subscription expired, downgraded to free`);
            }
        }

        // Reset monthly document count if needed (start of new month)
        const now = new Date();
        const lastReset = user.lastDocumentResetDate || new Date();
        
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
            user.documentsGeneratedThisMonth = 0;
            user.lastDocumentResetDate = now;
            await user.save();
            console.log(`🔄 Reset document count for user ${user.email}`);
        }

        // Attach full user and subscription info to request
        req.user.plan = user.plan;
        req.user.subscriptionStatus = user.subscriptionStatus || "trial";
        req.user.documentsGeneratedThisMonth = user.documentsGeneratedThisMonth || 0;
        req.userModel = user; // Full user model for updates
        
        next();
    } catch (error) {
        console.error("❌ Subscription check error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Require Pro plan
const requirePro = (req, res, next) => {
    if (req.user.plan !== "pro") {
        return res.status(403).json({
            message: "Access Denied: Pro subscription required for this feature",
            upgrade: true,
            currentPlan: req.user.plan,
            requiredPlan: "pro",
        });
    }
    next();
};

// Check document generation limit
const checkDocumentLimit = async (req, res, next) => {
    try {
        const user = req.userModel;
        const checkResult = canGenerateDocument(user);

        if (!checkResult.allowed) {
            return res.status(403).json({
                message: "Document generation limit reached",
                limitReached: true,
                limit: checkResult.limit,
                used: checkResult.used,
                remaining: 0,
                currentPlan: user.plan,
                upgrade: {
                    plan: "pro",
                    features: PLANS.pro.benefits,
                    price: PLANS.pro.price,
                },
            });
        }

        req.documentLimitInfo = checkResult;
        next();
    } catch (error) {
        console.error("❌ Document limit check error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Check export limit and format
const checkExportAccess = (format = "pdf") => {
    return async (req, res, next) => {
        try {
            const user = req.userModel;

            // Check if format is allowed for user's plan
            if (!canExportFormat(user, format)) {
                return res.status(403).json({
                    message: `${format.toUpperCase()} export requires Pro plan`,
                    upgrade: true,
                    currentPlan: user.plan,
                    requiredPlan: "pro",
                    allowedFormats: PLANS[user.plan].features.exports,
                });
            }

            // For now, we're not tracking individual export counts
            // But the structure is here for future implementation
            next();
        } catch (error) {
            console.error("❌ Export access check error:", error);
            res.status(500).json({ message: "Server Error", error: error.message });
        }
    };
};

// Check brand kit access
const checkBrandKitAccess = async (req, res, next) => {
    try {
        const user = req.userModel;

        if (!canUseBrandKit(user)) {
            return res.status(403).json({
                message: "Brand Kit customization requires Pro plan",
                upgrade: true,
                currentPlan: user.plan,
                requiredPlan: "pro",
                feature: "brandKit",
            });
        }

        next();
    } catch (error) {
        console.error("❌ Brand Kit access check error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get user's current plan details
const getUserPlanDetails = async (req, res, next) => {
    try {
        const user = req.userModel;
        const planDetails = PLANS[user.plan] || PLANS.free;
        const documentInfo = canGenerateDocument(user);

        req.planDetails = {
            currentPlan: user.plan,
            status: user.subscriptionStatus,
            features: planDetails.features,
            limits: planDetails.limits,
            usage: {
                documents: {
                    used: user.documentsGeneratedThisMonth || 0,
                    limit: planDetails.limits.documents,
                    remaining: documentInfo.remaining,
                },
            },
            subscriptionDates: {
                start: user.subscriptionStartDate,
                end: user.subscriptionEndDate,
            },
        };

        next();
    } catch (error) {
        console.error("❌ Plan details error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    checkSubscription,
    requirePro,
    checkDocumentLimit,
    checkExportAccess,
    checkBrandKitAccess,
    getUserPlanDetails,
};

