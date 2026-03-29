const UserPreference = require('../../models/UserPreference');
const Document = require('../../models/Document');
const Organization = require('../../models/Organization');
const BrandKit = require('../../models/BrandKit');

/**
 * Get smart suggestions for a specific field based on frequency and recency.
 */
async function getSmartSuggestions(userId, fieldName, limit = 5) {
    try {
        // 1. Get from refined preferences (learned patterns)
        const preferences = await UserPreference.find({ userId, fieldName })
            .sort({ frequency: -1, lastUsed: -1 })
            .limit(limit)
            .lean();

        if (preferences.length > 0) {
            return preferences.map(p => p.value);
        }

        // 2. Fallback: Search all recent documents for this field
        const recentDocs = await Document.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const values = new Set();
        recentDocs.forEach(doc => {
            if (doc.content && doc.content[fieldName]) {
                values.add(doc.content[fieldName]);
            }
        });

        return Array.from(values).slice(0, limit);
    } catch (err) {
        console.error('[IntelligenceService] Error fetching suggestions:', err);
        return [];
    }
}

/**
 * Track a used value for future suggestions (learning).
 */
async function trackFieldUsage(userId, fieldName, value, metadata = {}) {
    if (!value || String(value).trim() === '') return;

    try {
        await UserPreference.findOneAndUpdate(
            { userId, fieldName, value },
            { 
                $inc: { frequency: 1 }, 
                $set: { lastUsed: new Date(), metadata } 
            },
            { upsert: true }
        );
    } catch (err) {
        console.error('[IntelligenceService] Error tracking usage:', err);
    }
}

/**
 * Check consistency between current form data and global profiles.
 */
async function checkConsistency(userId, formData) {
    const [org, brandKit] = await Promise.all([
        Organization.findOne({ "members.userId": userId }).lean(),
        BrandKit.findOne({ userId }).lean()
    ]);

    const mismatches = [];

    const check = (field, currentVal, profileVal, label) => {
        if (currentVal && profileVal && String(currentVal).trim() !== String(profileVal).trim()) {
            mismatches.push({
                field,
                label,
                current: currentVal,
                profile: profileVal
            });
        }
    };

    if (org) {
        check('company_name', formData.company_name, org.name, 'Company Name');
        check('company_email', formData.company_email, org.contact?.email, 'Company Email');
        check('gstin', formData.gstin, org.tax?.gstin, 'GSTIN');
    }

    if (brandKit) {
        check('bank_account_number', formData.bank_account_number, brandKit.banking?.accountNumber, 'Account Number');
    }

    return mismatches;
}

/**
 * Detect cross-field dependencies (e.g., Client Name -> Address).
 * In a real agentic system, this might use a knowledge graph or past data.
 */
async function getRelatedData(userId, fieldName, value) {
    if (fieldName !== 'client_name' || !value) return null;

    try {
        // Find the most recent document for this client
        const recentDoc = await Document.findOne({ 
            userId, 
            $or: [
                { 'content.client_name': value },
                { 'content.party_name': value }
            ]
        }).sort({ createdAt: -1 }).lean();

        if (recentDoc && recentDoc.content) {
            return {
                client_address: recentDoc.content.client_address || recentDoc.content.party_address,
                client_gst: recentDoc.content.client_gst || recentDoc.content.gstin || recentDoc.content.tax_id,
                client_email: recentDoc.content.client_email,
                client_phone: recentDoc.content.client_phone
            };
        }
    } catch (err) {
        console.error('[IntelligenceService] Error fetching related data:', err);
    }
    return null;
}

module.exports = {
    getSmartSuggestions,
    trackFieldUsage,
    checkConsistency,
    getRelatedData
};
