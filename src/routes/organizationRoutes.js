const express = require("express");
const router = express.Router();
const {
    getOrganization,
    updateOrganization
} = require("../controllers/organizationController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes are protected
router.use(authMiddleware);

router.get("/", getOrganization);
router.put("/", updateOrganization);

module.exports = router;
