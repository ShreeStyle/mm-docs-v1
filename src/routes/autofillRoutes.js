const express = require("express");
const router = express.Router();
const { 
    getAutofillData, 
    syncToProfile, 
    getSuggestions, 
    getRelatedData, 
    checkConsistency, 
    trackUsage 
} = require("../controllers/autofillController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes are protected
router.use(authMiddleware);

router.get("/", getAutofillData);
router.post("/sync", syncToProfile);
router.get("/suggestions", getSuggestions);
router.get("/related", getRelatedData);
router.post("/consistency", checkConsistency);
router.post("/track", trackUsage);

module.exports = router;
