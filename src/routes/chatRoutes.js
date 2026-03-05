const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

// All routes require authentication
router.use(authMiddleware);

// Get or create chat session
router.get('/:documentId', chatController.getChatSession);

// Send message
router.post('/:documentId/message', chatController.sendMessage);

// Get chat history
router.get('/:documentId/history', chatController.getChatHistory);

// Clear chat history
router.delete('/:documentId/history', chatController.clearChatHistory);

// Quick actions
router.post('/:documentId/quick-action', chatController.quickAction);

module.exports = router;
