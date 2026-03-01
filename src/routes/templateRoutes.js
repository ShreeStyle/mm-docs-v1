const express = require("express");
const router = express.Router();
const templateController = require("../controllers/templateController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all templates (with optional category filter)
router.get("/", authMiddleware, templateController.getAllTemplates);

// Get template categories with counts
router.get("/categories", authMiddleware, templateController.getTemplateCategories);

// Get single template by ID
router.get("/:templateId", authMiddleware, templateController.getTemplateById);

// Initialize default templates (admin only - run once)
router.post("/initialize", authMiddleware, templateController.initializeTemplates);

module.exports = router;
