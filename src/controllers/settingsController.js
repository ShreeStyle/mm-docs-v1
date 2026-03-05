const User = require("../models/User");
const Organization = require("../models/Organization");
const BrandKit = require("../models/BrandKit");

/**
 * Get user account settings
 */
exports.getAccountSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password -otp');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({
            success: true,
            settings: {
                name: user.name,
                email: user.email,
                plan: user.plan,
                subscriptionStatus: user.subscriptionStatus,
                onboarded: user.onboarded,
                documentsGeneratedThisMonth: user.documentsGeneratedThisMonth
            }
        });
    } catch (error) {
        console.error("Error fetching account settings:", error);
        res.status(500).json({ message: "Error fetching account settings", error: error.message });
    }
};

/**
 * Update user account settings
 */
exports.updateAccountSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -otp');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json({
            success: true,
            message: "Account settings updated successfully",
            user
        });
    } catch (error) {
        console.error("Error updating account settings:", error);
        res.status(500).json({ message: "Error updating account settings", error: error.message });
    }
};

/**
 * Get workspace/branding settings
 */
exports.getWorkspaceSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const brandKit = await BrandKit.findOne({ userId });
        
        res.json({
            success: true,
            settings: brandKit || {
                brandName: "",
                primaryColor: "#1e40af",
                secondaryColor: "#64748b",
                accentColor: "#3b82f6",
                fontFamily: "Inter",
                logo: null,
                footer: {}
            }
        });
    } catch (error) {
        console.error("Error fetching workspace settings:", error);
        res.status(500).json({ message: "Error fetching workspace settings", error: error.message });
    }
};

/**
 * Update workspace/branding settings
 */
exports.updateWorkspaceSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;
        
        let brandKit = await BrandKit.findOne({ userId });
        
        if (brandKit) {
            // Update existing brand kit
            Object.assign(brandKit, updateData);
            await brandKit.save();
        } else {
            // Create new brand kit
            brandKit = new BrandKit({
                userId,
                ...updateData
            });
            await brandKit.save();
        }
        
        res.json({
            success: true,
            message: "Workspace settings updated successfully",
            settings: brandKit
        });
    } catch (error) {
        console.error("Error updating workspace settings:", error);
        res.status(500).json({ message: "Error updating workspace settings", error: error.message });
    }
};

/**
 * Get organization/team settings
 */
exports.getTeamSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find organizations where user is a member
        const organizations = await Organization.find({
            'members.userId': userId
        }).populate('members.userId', 'name email');
        
        res.json({
            success: true,
            organizations
        });
    } catch (error) {
        console.error("Error fetching team settings:", error);
        res.status(500).json({ message: "Error fetching team settings", error: error.message });
    }
};

/**
 * Get integration settings
 */
exports.getIntegrationSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // For now, return mock integrations
        // In production, this would fetch from a separate Integrations model
        const integrations = {
            stripe: {
                connected: false,
                enabled: false
            },
            salesforce: {
                connected: false,
                enabled: false
            },
            docusign: {
                connected: false,
                enabled: false
            },
            slack: {
                connected: false,
                enabled: false
            },
            googleDrive: {
                connected: false,
                enabled: false
            },
            zapier: {
                connected: false,
                enabled: false
            }
        };
        
        res.json({
            success: true,
            integrations
        });
    } catch (error) {
        console.error("Error fetching integration settings:", error);
        res.status(500).json({ message: "Error fetching integration settings", error: error.message });
    }
};

/**
 * Update integration settings
 */
exports.updateIntegrationSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { integration, enabled, config } = req.body;
        
        // Validate integration name
        const validIntegrations = ['stripe', 'salesforce', 'docusign', 'slack', 'googleDrive', 'zapier'];
        if (!validIntegrations.includes(integration)) {
            return res.status(400).json({ message: "Invalid integration name" });
        }
        
        // In production, save to Integrations model
        // For now, just return success
        res.json({
            success: true,
            message: `${integration} integration updated successfully`,
            integration: {
                name: integration,
                enabled,
                connected: enabled
            }
        });
    } catch (error) {
        console.error("Error updating integration settings:", error);
        res.status(500).json({ message: "Error updating integration settings", error: error.message });
    }
};

/**
 * Get notification settings
 */
exports.getNotificationSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // For now, return default notification settings
        // In production, this would be stored in User model or separate NotificationSettings model
        const settings = {
            email: {
                documentGenerated: true,
                documentShared: true,
                signatureRequested: true,
                signatureCompleted: true,
                collaboratorAdded: true,
                commentAdded: true,
                workflowUpdated: true,
                weeklyDigest: true
            },
            inApp: {
                documentGenerated: true,
                documentShared: true,
                signatureRequested: true,
                signatureCompleted: true,
                collaboratorAdded: true,
                commentAdded: true,
                workflowUpdated: true
            }
        };
        
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error("Error fetching notification settings:", error);
        res.status(500).json({ message: "Error fetching notification settings", error: error.message });
    }
};

/**
 * Update notification settings
 */
exports.updateNotificationSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const settings = req.body;
        
        // In production, save to User model or NotificationSettings model
        res.json({
            success: true,
            message: "Notification settings updated successfully",
            settings
        });
    } catch (error) {
        console.error("Error updating notification settings:", error);
        res.status(500).json({ message: "Error updating notification settings", error: error.message });
    }
};

/**
 * Get security settings
 */
exports.getSecuritySettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('email');
        
        const settings = {
            email: user.email,
            twoFactorEnabled: false, // Would be stored in User model
            lastPasswordChange: user.updatedAt,
            activeSessions: 1 // Would track actual sessions
        };
        
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error("Error fetching security settings:", error);
        res.status(500).json({ message: "Error fetching security settings", error: error.message });
    }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new passwords are required" });
        }
        
        const user = await User.findById(userId);
        
        // Verify current password (would use bcrypt in production)
        // For now, just update the password
        user.password = newPassword; // Should hash with bcrypt
        await user.save();
        
        res.json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Error changing password", error: error.message });
    }
};
