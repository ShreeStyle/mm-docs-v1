const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const analyticsController = require('../controllers/analyticsController');

// All routes require authentication
router.use(authMiddleware);

// Simple dashboard stats (for main Dashboard page)
router.get('/stats', analyticsController.getDashboardStats);

// Dashboard analytics
router.get('/dashboard', analyticsController.getDashboardAnalytics);

// Document analytics
router.get('/documents', analyticsController.getDocumentAnalytics);

// Productivity metrics
router.get('/productivity', analyticsController.getProductivityMetrics);

// Team analytics
router.get('/team', analyticsController.getTeamAnalytics);

// Export analytics
router.get('/export', analyticsController.exportAnalytics);

module.exports = router;
