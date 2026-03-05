const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const memoryController = require('../controllers/memoryController');

// All routes require authentication
router.use(authMiddleware);

// Get user's document memory
router.get('/', memoryController.getDocumentMemory);

// Update document memory
router.put('/', memoryController.updateDocumentMemory);

// Learn from document
router.post('/learn', memoryController.learnFromDocument);

// Get smart suggestions
router.post('/suggestions', memoryController.getSmartSuggestions);

// Add common clause to memory
router.post('/clauses', memoryController.addCommonClause);

module.exports = router;
