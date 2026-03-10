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

// Send collaboration invitation
exports.sendInvitation = async (req, res) => {
    try {
        const { recipientEmail, accessLevel, message } = req.body;
        const documentId = req.params.id;
        const userId = req.user.id;
        const mongoose = require('mongoose');
        const Template = require("../models/Template");

        if (!recipientEmail) {
            return res.status(400).json({ message: "Recipient email is required" });
        }

        // Support multiple emails (comma or semicolon separated)
        const emails = recipientEmail.split(/[,;]/).map(e => e.trim()).filter(e => e);

        if (emails.length === 0) {
            return res.status(400).json({ message: "No valid email addresses provided" });
        }

        // Find document - handle both ObjectId and template slug
        let document;
        if (mongoose.Types.ObjectId.isValid(documentId)) {
            // Try finding by ObjectId first
            document = await Document.findOne({ _id: documentId, userId });
        }
        
        if (!document) {
            // Try finding by templateId (slug)
            document = await Document.findOne({ templateId: documentId, userId });
        }

        // If still not found, check if it's a template and create a document from it
        if (!document) {
            const template = await Template.findOne({ templateId: documentId });
            
            if (template) {
                // Create a new document from this template
                document = await Document.create({
                    userId,
                    title: template.name,
                    templateId: template.templateId,
                    type: template.category,
                    content: {},
                    status: 'draft'
                });
                
                console.log(`✅ Created document ${document._id} from template ${template.templateId}`);
            }
        }

        if (!document) {
            return res.status(404).json({ message: "Document or template not found" });
        }

        // Get user info
        const user = await User.findById(userId);

        // Create or get share link
        let share = await Share.findOne({ documentId: document._id, userId, isActive: true });

        if (!share) {
            const crypto = require("crypto");
            const shareId = crypto.randomBytes(6).toString("base64url");

            share = await Share.create({
                shareId,
                documentId: document._id,
                userId
            });
        }

        const documentUrl = `${req.protocol}://${req.get("host")}/api/public/${share.shareId}`;

        // Send invitation emails
        const results = [];
        for (const email of emails) {
            try {
                await emailService.sendInvitationEmail(
                    email,
                    document.title,
                    documentUrl,
                    user.name,
                    accessLevel || 'viewer'
                );
                results.push({ email, success: true });
            } catch (error) {
                console.error(`Failed to send invitation to ${email}:`, error);
                results.push({ email, success: false, error: error.message });
            }
        }

        const successCount = results.filter(r => r.success).length;

        res.json({
            message: `Invitation sent to ${successCount} of ${emails.length} recipient(s)`,
            results,
            documentUrl,
            documentId: document._id // Return the document ID in case it was just created
        });

    } catch (error) {
        console.error("Invitation Send Error:", error);
        res.status(500).json({ message: "Error sending invitation", error: error.message });
    }
};
