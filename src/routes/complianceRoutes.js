const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const complianceController = require('../controllers/complianceController');

// All routes require authentication
router.use(authMiddleware);

// Check compliance for a draft document
router.post('/check-draft', complianceController.checkDraftCompliance);

// Run compliance check on all documents
router.get('/check', complianceController.checkCompliance);

// Get compliance history
router.get('/history', complianceController.getComplianceHistory);

// Check compliance for a specific document
router.get('/document/:documentId', complianceController.checkDocumentCompliance);

module.exports = router;
