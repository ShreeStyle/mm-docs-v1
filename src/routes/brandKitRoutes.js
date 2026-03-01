const express = require("express");
const router = express.Router();
const { uploadLogo, handleUploadError } = require("../middleware/uploadMiddleware");
const { 
    getBrandKit, 
    upsertBrandKit, 
    updateBrandKit, 
    uploadLogo: uploadLogoController,
    deleteBrandKit,
    resetBrandKit
} = require("../controllers/brandKitController");
const authMiddleware = require("../middleware/authMiddleware");
const { checkSubscription, checkBrandKitAccess } = require("../middleware/subscriptionMiddleware");

// All routes are protected and check subscription
router.use(authMiddleware);
router.use(checkSubscription);

// Get brand kit (creates default if none exists) - All plans can view
router.get("/", getBrandKit);

// Modification routes require Pro plan
router.post("/", checkBrandKitAccess, uploadLogo, handleUploadError, upsertBrandKit);
router.put("/", checkBrandKitAccess, updateBrandKit);
router.post("/upload-logo", checkBrandKitAccess, uploadLogo, handleUploadError, uploadLogoController);
router.post("/reset", checkBrandKitAccess, resetBrandKit);
router.delete("/", checkBrandKitAccess, deleteBrandKit);

module.exports = router;
