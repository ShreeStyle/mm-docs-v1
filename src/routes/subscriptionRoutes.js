const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/authMiddleware");
const { checkSubscription } = require("../middleware/subscriptionMiddleware");

// Apply authentication to all subscription routes
router.use(authMiddleware);
router.use(checkSubscription);

// Get all available plans
router.get("/plans", subscriptionController.getPlans);

// Get current user's subscription
router.get("/current", subscriptionController.getUserSubscription);

// Create subscription order
router.post("/create-order", subscriptionController.createSubscriptionOrder);

// Verify payment and activate subscription
router.post("/verify-payment", subscriptionController.verifyPayment);

// Cancel subscription
router.post("/cancel", subscriptionController.cancelSubscription);

// Admin: Manual upgrade (for testing/support)
router.post("/manual-upgrade", subscriptionController.manualUpgrade);

module.exports = router;
