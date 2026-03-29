const { buildAutofillMap, syncAutofillToProfile } = require("../services/autofill/autofillService");
const intelligenceService = require("../services/autofill/intelligenceService");

/**
 * GET /api/autofill
 * Returns the flat mapping of all andatory fields for the current user.
 */
exports.getAutofillData = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.query; // optional document type for last-doc fallback
        
        const map = await buildAutofillMap(userId, type);

        res.json({
            success: true,
            data: map
        });
    } catch (error) {
        console.error("Error fetching autofill data:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch autofill data",
            error: error.message
        });
    }
};

/**
 * POST /api/autofill/sync
 * Saves edited autofill values back to Org/BrandKit profiles.
 */
exports.syncToProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for sync"
            });
        }

        const result = await syncAutofillToProfile(userId, data);

        res.json({
            success: true,
            message: "Profile synced successfully",
            result
        });
    } catch (error) {
        console.error("Error syncing autofill to profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to sync profile",
            error: error.message
        });
    }
};

/**
 * GET /api/autofill/suggestions
 * Returns predictive suggestions for a field.
 */
exports.getSuggestions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { field } = req.query;
        
        const suggestions = await intelligenceService.getSmartSuggestions(userId, field);
        res.json({ success: true, suggestions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * GET /api/autofill/related
 * Returns related data based on a field's value (e.g. client_name -> address).
 */
exports.getRelatedData = async (req, res) => {
    try {
        const userId = req.user.id;
        const { field, value } = req.query;
        
        const relatedData = await intelligenceService.getRelatedData(userId, field, value);
        res.json({ success: true, relatedData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/autofill/consistency
 * Checks if provided form data matches profile information.
 */
exports.checkConsistency = async (req, res) => {
    try {
        const userId = req.user.id;
        const formData = req.body;
        
        const mismatches = await intelligenceService.checkConsistency(userId, formData);
        res.json({ success: true, mismatches });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * POST /api/autofill/track
 * Tracks field usage for future learning.
 */
exports.trackUsage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { field, value, templateId } = req.body;
        
        await intelligenceService.trackFieldUsage(userId, field, value, { templateId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
