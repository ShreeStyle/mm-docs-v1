const express = require("express");
const router = express.Router();
const {
    testEmail,
} = require("../controllers/emailController");
const authMiddleware = require("../middleware/authMiddleware");

// Test email configuration
router.post("/test", authMiddleware, testEmail);

module.exports = router;
