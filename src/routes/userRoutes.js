const express = require("express");
const router = express.Router();
const { createUser } = require("../controllers/userController");
const { signup } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createUser);
router.post("/signup", signup);
module.exports = router;
