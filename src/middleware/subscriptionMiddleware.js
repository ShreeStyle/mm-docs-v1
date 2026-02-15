const User = require("../models/User");

const checkSubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Attach subscription status to request for easy access in controllers
        req.user.subscriptionStatus = user.subscriptionStatus;
        next();
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const requirePro = (req, res, next) => {
    if (req.user.subscriptionStatus !== "pro") {
        return res.status(403).json({
            message: "Access Denied: Pro subscription required for this feature"
        });
    }
    next();
};

module.exports = { checkSubscription, requirePro };
