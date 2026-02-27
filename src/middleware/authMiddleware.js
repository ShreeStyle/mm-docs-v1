const { verifyToken } = require("../utils/jwtUtils");

const authMiddleware = (req, res, next) => {
    console.log(`🔍 Auth middleware called for: ${req.method} ${req.path}`);
    const authHeader = req.header("Authorization");
    console.log("🔍 Received Auth Header:", authHeader);

    const token = authHeader?.replace("Bearer ", "");
    console.log("🔑 Extracted Token:", token ? `${token.substring(0, 20)}...` : 'None');

    if (!token) {
        console.log("❌ No token provided");
        return res.status(401).json({ 
            message: "Access Denied: No token provided",
            code: "NO_TOKEN"
        });
    }

    try {
        const decoded = verifyToken(token);
        console.log("✅ Token verified for user:", decoded.id);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("❌ Token Verification Failed:", err.message);
        
        let message = "Invalid Token";
        let code = "INVALID_TOKEN";
        
        if (err.name === 'TokenExpiredError') {
            message = "Token has expired. Please log in again.";
            code = "TOKEN_EXPIRED";
        } else if (err.name === 'JsonWebTokenError') {
            message = "Invalid token format. Please log in again.";
            code = "MALFORMED_TOKEN";
        }
        
        res.status(401).json({ message, code });
    }
};

module.exports = authMiddleware;
