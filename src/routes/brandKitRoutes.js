const express = require("express");
const router = express.Router();
const { createBrandKit, getBrandKit, updateBrandKit } = require("../controllers/brandKitController");
const authMiddleware = require("../middleware/authMiddleware");
const { checkSubscription } = require("../middleware/subscriptionMiddleware");

// All routes are protected and check subscription
router.use(authMiddleware);
router.use(checkSubscription);

router.post("/", createBrandKit);
router.get("/", getBrandKit);
router.put("/", updateBrandKit); // Update only supports updating the user's single brand kit for now

module.exports = router;
