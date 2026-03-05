const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const clauseController = require('../controllers/clauseController');

// All routes require authentication
router.use(authMiddleware);

// Clause library CRUD
router.get('/', clauseController.getClauses);
router.post('/', clauseController.createClause);
router.put('/:clauseId', clauseController.updateClause);
router.delete('/:clauseId', clauseController.deleteClause);

// AI Risk Analysis
router.get('/document/:documentId/analyze', clauseController.analyzeDocumentRisk);
router.get('/:clauseId/analyze', clauseController.analyzeClause);

// AI Suggestions
router.post('/suggestions', clauseController.getSuggestedClauses);

module.exports = router;
