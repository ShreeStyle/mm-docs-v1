const express = require("express");
const router = express.Router();
const { generateDocumentContent, generateAndSaveDocument } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes
router.post("/generate", authMiddleware, generateDocumentContent);
router.post("/generate-document", authMiddleware, generateAndSaveDocument);

module.exports = router;
