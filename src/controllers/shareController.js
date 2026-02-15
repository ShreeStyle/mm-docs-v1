const crypto = require("crypto");
const Share = require("../models/Share");
const Document = require("../models/Document");
const BrandKit = require("../models/BrandKit");
const renderService = require("../services/render/renderService");

// Generate unique share ID
const generateShareId = () => {
    return crypto.randomBytes(6).toString("base64url"); // e.g., "abc123XYZ"
};

// Hash IP address for privacy
const hashIP = (ip) => {
    return crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);
};

// Create share link
exports.createShareLink = async (req, res) => {
    try {
        const { expiresIn, password } = req.body; // expiresIn in days
        const documentId = req.params.id;
        const userId = req.user.id;

        // Verify document ownership
        const document = await Document.findOne({ _id: documentId, userId });
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Check if share already exists
        let share = await Share.findOne({ documentId, userId, isActive: true });

        if (!share) {
            // Create new share
            const shareId = generateShareId();
            const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : null;

            share = await Share.create({
                shareId,
                documentId,
                userId,
                expiresAt,
                password: password || null,
            });
        }

        const shareUrl = `${req.protocol}://${req.get("host")}/api/public/${share.shareId}`;

        res.json({
            message: "Share link created successfully",
            shareUrl,
            shareId: share.shareId,
            expiresAt: share.expiresAt,
        });

    } catch (error) {
        console.error("Share Creation Error:", error);
        res.status(500).json({ message: "Error creating share link", error: error.message });
    }
};

// View public document
exports.viewPublicDocument = async (req, res) => {
    try {
        const { shareId } = req.params;
        const { password } = req.query;

        const share = await Share.findOne({ shareId }).populate("documentId");

        if (!share) {
            return res.status(404).send("<h1>Document not found</h1>");
        }

        if (!share.isValid()) {
            return res.status(403).send("<h1>This link has expired or been disabled</h1>");
        }

        // Check password if required
        if (share.password && share.password !== password) {
            return res.status(401).send("<h1>Password required</h1><p>Add ?password=YOUR_PASSWORD to the URL</p>");
        }

        // Track view
        const ipAddress = req.ip || req.connection.remoteAddress;
        share.views += 1;
        share.viewHistory.push({
            timestamp: new Date(),
            ipHash: hashIP(ipAddress),
            userAgent: req.get("user-agent") || "Unknown",
        });
        await share.save();

        // Fetch brand kit
        const brandKit = await BrandKit.findOne({ userId: share.userId });

        // Render document
        const html = await renderService.renderDocument(share.documentId, brandKit);

        res.setHeader("Content-Type", "text/html");
        res.send(html);

    } catch (error) {
        console.error("Public View Error:", error);
        res.status(500).send("<h1>Error loading document</h1>");
    }
};

// Get analytics for a document
exports.getDocumentAnalytics = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.user.id;

        // Verify ownership
        const document = await Document.findOne({ _id: documentId, userId });
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const share = await Share.findOne({ documentId, userId });

        if (!share) {
            return res.json({
                message: "No share link created yet",
                views: 0,
                viewHistory: [],
            });
        }

        res.json({
            shareId: share.shareId,
            views: share.views,
            isActive: share.isActive,
            expiresAt: share.expiresAt,
            createdAt: share.createdAt,
            viewHistory: share.viewHistory.map(v => ({
                timestamp: v.timestamp,
                userAgent: v.userAgent,
            })),
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: "Error fetching analytics", error: error.message });
    }
};

// Deactivate share link
exports.deactivateShareLink = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.user.id;

        const share = await Share.findOne({ documentId, userId });

        if (!share) {
            return res.status(404).json({ message: "Share link not found" });
        }

        share.isActive = false;
        await share.save();

        res.json({ message: "Share link deactivated successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error deactivating share link", error: error.message });
    }
};
