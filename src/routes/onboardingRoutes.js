const express = require("express");
const router = express.Router();
const {
    completeOnboarding,
    getOnboardingStatus,
    getColorPresets,
    skipOnboarding,
} = require("../controllers/onboardingController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes are protected
router.use(authMiddleware);

router.post("/complete", completeOnboarding);
router.get("/status", getOnboardingStatus);
router.get("/color-presets", getColorPresets);
router.post("/skip", skipOnboarding);

module.exports = router;
