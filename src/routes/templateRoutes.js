const express = require("express");
const router = express.Router();
const {
    getTemplates,
    getTemplateDetails,
    cloneTemplate,
    getCategories,
} = require("../controllers/templateController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes (browse templates)
router.get("/", getTemplates);
router.get("/categories", getCategories);
router.get("/:templateId", getTemplateDetails);

// Protected routes (clone template)
router.post("/:templateId/clone", authMiddleware, cloneTemplate);

module.exports = router;
