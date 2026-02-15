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

// All routes are protected
router.use(authMiddleware);

router.post("/", createDocument);
router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.get("/:id/preview", renderDocument);
router.get("/:id/download", downloadDocument);
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
