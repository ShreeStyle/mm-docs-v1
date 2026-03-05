const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const workflowController = require('../controllers/workflowController');

// All routes require authentication
router.use(authMiddleware);

// Workflow templates
router.get('/templates', workflowController.getWorkflowTemplates);

// Create workflow
router.post('/', workflowController.createWorkflow);

// Get workflow
router.get('/:documentId', workflowController.getWorkflow);

// Submit for approval
router.post('/:documentId/submit', workflowController.submitForApproval);

// Review stage
router.post('/:documentId/stages/:stageId/review', workflowController.reviewStage);

// Get pending approvals for user
router.get('/pending/me', workflowController.getPendingApprovals);

module.exports = router;
