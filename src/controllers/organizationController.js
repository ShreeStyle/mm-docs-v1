const Organization = require("../models/Organization");

/**
 * Get user's primary organization
 */
exports.getOrganization = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find organization where user is a member
        const organization = await Organization.findOne({
            'members.userId': userId
        });
        
        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization not found" });
        }
        
        res.json(organization);
    } catch (error) {
        console.error("Error fetching organization:", error);
        res.status(500).json({ success: false, message: "Error fetching organization", error: error.message });
    }
};

/**
 * Update organization settings
 */
exports.updateOrganization = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;
        
        const organization = await Organization.findOneAndUpdate(
            { 'members.userId': userId, 'members.role': { $in: ['owner', 'admin'] } },
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization not found or access denied" });
        }
        
        res.json({
            success: true,
            message: "Organization updated successfully",
            organization
        });
    } catch (error) {
        console.error("Error updating organization:", error);
        res.status(500).json({ success: false, message: "Error updating organization", error: error.message });
    }
};
