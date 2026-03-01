const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const auth = require('../middleware/auth');

// Get all templates (with optional category filter)
router.get('/', auth, templateController.getAllTemplates);

// Get template categories with counts
router.get('/categories', auth, templateController.getTemplateCategories);

// Get single template by ID
router.get('/:templateId', auth, templateController.getTemplateById);

// Initialize default templates (admin only - run once)
router.post('/initialize', auth, templateController.initializeTemplates);

module.exports = router;