const { verifyToken } = require("../utils/jwtUtils");

const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");
    console.log("🔍 Received Auth Header:", authHeader);

    const token = authHeader?.replace("Bearer ", "");
    console.log("🔑 Extracted Token:", token);

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("❌ Token Verification Failed:", err.message);
        res.status(400).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;
