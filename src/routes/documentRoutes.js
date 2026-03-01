const express = require("express");
const router = express.Router();
const {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    renderDocument,
    downloadDocument,
    downloadDocumentDocx,
    generateDocument,
} = require("../controllers/documentController");
const {
    createShareLink,
    getDocumentAnalytics,
    deactivateShareLink,
} = require("../controllers/shareController");
const {
    getVersionHistory,
    getVersion,
    restoreVersion,
} = require("../controllers/versionController");
const {
    sendDocumentEmail,
} = require("../controllers/emailController");
const authMiddleware = require("../middleware/authMiddleware");
const {
    checkSubscription,
    checkDocumentLimit,
    checkExportAccess,
} = require("../middleware/subscriptionMiddleware");

// All routes are protected and check subscription
router.use(authMiddleware);
router.use(checkSubscription);

// Document generation with limit check
router.post("/", checkDocumentLimit, createDocument);
router.post("/generate", checkDocumentLimit, generateDocument);

// Document listing and viewing (no limits)
router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.get("/:id/preview", renderDocument);

// Export routes with format checks
router.get("/:id/download", checkExportAccess("pdf"), downloadDocument);
router.get("/:id/download-docx", checkExportAccess("docx"), downloadDocumentDocx);

// Other document operations
router.post("/:id/share", createShareLink);
router.get("/:id/analytics", getDocumentAnalytics);
router.delete("/:id/share", deactivateShareLink);
router.get("/:id/versions", getVersionHistory);
router.get("/:id/versions/:versionNumber", getVersion);
router.post("/:id/versions/:versionNumber/restore", restoreVersion);
router.post("/:id/send-email", sendDocumentEmail);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

module.exports = router;
