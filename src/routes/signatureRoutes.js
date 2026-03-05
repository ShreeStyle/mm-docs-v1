const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const signatureController = require('../controllers/signatureController');

// All routes require authentication
router.use(authMiddleware);

// Create signature request
router.post('/', signatureController.createSignatureRequest);

// Send signature request
router.post('/:signatureId/send', signatureController.sendSignatureRequest);

// Get signature request
router.get('/:signatureId', signatureController.getSignatureRequest);

// Sign document
router.post('/:signatureId/sign', signatureController.signDocument);

// Decline signature
router.post('/:signatureId/decline', signatureController.declineSignature);

// Get user's signature requests
router.get('/user/all', signatureController.getUserSignatureRequests);

// Get pending signatures for user
router.get('/user/pending', signatureController.getPendingSignatures);

// Update payment status
router.put('/:signatureId/payment', signatureController.updatePaymentStatus);

module.exports = router;
