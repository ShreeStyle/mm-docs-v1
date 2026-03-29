const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const { generateBulk } = require("../controllers/bulkController");

const upload = multer({ dest: "uploads/" });

router.use(authMiddleware);

// POST /api/bulk/generate — upload CSV and generate docs
router.post("/generate", upload.single("file"), generateBulk);

module.exports = router;
