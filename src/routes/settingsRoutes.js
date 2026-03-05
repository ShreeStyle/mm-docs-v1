const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const settingsController = require('../controllers/settingsController');

// All routes require authentication
router.use(authMiddleware);

// Account settings
router.get('/account', settingsController.getAccountSettings);
router.put('/account', settingsController.updateAccountSettings);

// Workspace/branding settings
router.get('/workspace', settingsController.getWorkspaceSettings);
router.put('/workspace', settingsController.updateWorkspaceSettings);

// Team settings
router.get('/team', settingsController.getTeamSettings);

// Integration settings
router.get('/integrations', settingsController.getIntegrationSettings);
router.put('/integrations', settingsController.updateIntegrationSettings);

// Notification settings
router.get('/notifications', settingsController.getNotificationSettings);
router.put('/notifications', settingsController.updateNotificationSettings);

// Security settings
router.get('/security', settingsController.getSecuritySettings);
router.post('/security/password', settingsController.changePassword);

module.exports = router;
