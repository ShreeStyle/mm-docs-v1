const emailService = require("../services/email/emailService");
const Share = require("../models/Share");
const Document = require("../models/Document");
const User = require("../models/User");

// Send document via email
exports.sendDocumentEmail = async (req, res) => {
    try {
        const { recipientEmail, message } = req.body;
        const documentId = req.params.id;
        const userId = req.user.id;

        if (!recipientEmail) {
            return res.status(400).json({ message: "Recipient email is required" });
        }

        // Verify document ownership
        const document = await Document.findOne({ _id: documentId, userId });
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Get user info
        const user = await User.findById(userId);

        // Create or get share link
        let share = await Share.findOne({ documentId, userId, isActive: true });

        if (!share) {
            const crypto = require("crypto");
            const shareId = crypto.randomBytes(6).toString("base64url");

            share = await Share.create({
                shareId,
                documentId,
                userId,
            });
        }

        const shareUrl = `${req.protocol}://${req.get("host")}/api/public/${share.shareId}`;

        // Send email
        await emailService.sendDocumentEmail(
            recipientEmail,
            document.title,
            shareUrl,
            user.name
        );

        res.json({
            message: "Email sent successfully",
            recipientEmail,
            shareUrl,
        });

    } catch (error) {
        console.error("Email Send Error:", error);
        res.status(500).json({ message: "Error sending email", error: error.message });
    }
};

// Test email configuration
exports.testEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email address required" });
        }

        await emailService.sendTestEmail(email);

        res.json({ message: "Test email sent successfully" });

    } catch (error) {
        res.status(500).json({
            message: "Email configuration error",
            error: error.message,
            hint: "Make sure EMAIL_USER and EMAIL_PASSWORD are set in .env"
        });
    }
};
