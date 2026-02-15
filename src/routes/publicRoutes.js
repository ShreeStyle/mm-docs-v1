const express = require("express");
const router = express.Router();
const {
    createShareLink,
    viewPublicDocument,
    getDocumentAnalytics,
    deactivateShareLink,
} = require("../controllers/shareController");
const authMiddleware = require("../middleware/authMiddleware");

// Public route (no auth required)
router.get("/:shareId", viewPublicDocument);

module.exports = router;
