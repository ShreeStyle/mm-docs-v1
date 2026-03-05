const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const collaborationController = require('../controllers/collaborationController');

// All routes require authentication
router.use(authMiddleware);

// Get collaboration details
router.get('/:documentId', collaborationController.getCollaboration);

// Manage collaborators
router.post('/:documentId/collaborators', collaborationController.addCollaborator);
router.put('/:documentId/collaborators/:collaboratorId', collaborationController.updateCollaboratorRole);
router.delete('/:documentId/collaborators/:collaboratorId', collaborationController.removeCollaborator);

// Comments
router.post('/:documentId/comments', collaborationController.addComment);
router.post('/:documentId/comments/:commentId/reply', collaborationController.replyToComment);
router.put('/:documentId/comments/:commentId/resolve', collaborationController.resolveComment);

// Real-time sessions
router.post('/:documentId/session', collaborationController.updateSession);

// Activity log
router.get('/:documentId/activity', collaborationController.getActivityLog);

module.exports = router;
