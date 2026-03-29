const Document = require("../models/Document");

/**
 * Generate proactive business recommendations based on document history.
 */
async function getProactiveRecommendations(userId) {
    try {
        const recommendations = [];
        
        // 1. Find completed Quotations/Proposals to suggest Invoicing
        const completedQuotes = await Document.find({
            userId,
            status: 'completed',
            type: { $in: ['quotation', 'proposal'] }
        }).sort({ updatedAt: -1 }).limit(3).lean();

        completedQuotes.forEach(quote => {
            recommendations.push({
                type: 'next_step',
                title: 'Create Invoice',
                message: `Your ${quote.title} is completed. Ready to bill the client?`,
                action: `/dashboard/create-document/gst_invoice`,
                priority: 'high',
                context: { documentId: quote._id, templateId: 'gst_invoice' }
            });
        });

        // 2. Find completed Offer Letters to suggest Onboarding
        const completedOffers = await Document.find({
            userId,
            status: 'completed',
            type: 'offer_letter'
        }).sort({ updatedAt: -1 }).limit(1).lean();

        completedOffers.forEach(offer => {
            recommendations.push({
                type: 'next_step',
                title: 'Start Onboarding',
                message: `${offer.content?.candidate_name || 'Candidate'} has accepted. Start their onboarding?`,
                action: `/onboarding`,
                priority: 'medium',
                context: { documentId: offer._id }
            });
        });

        // 3. Find 'Sent' documents older than 3 days to suggest Follow-up
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3) ;

        const pendingDocs = await Document.find({
            userId,
            status: 'sent',
            updatedAt: { $lt: threeDaysAgo }
        }).limit(3).lean();

        pendingDocs.forEach(doc => {
            recommendations.push({
                type: 'follow_up',
                title: 'Send Reminder',
                message: `It's been 3 days since you sent ${doc.title}. Follow up?`,
                action: `/document/editor/${doc._id}`,
                priority: 'medium',
                context: { documentId: doc._id }
            });
        });

        // 4. Find fresh drafts to suggest Completion
        const drafts = await Document.find({
            userId,
            status: 'draft'
        }).sort({ updatedAt: -1 }).limit(2).lean();

        drafts.forEach(draft => {
            recommendations.push({
                type: 'reminder',
                title: 'Finish Draft',
                message: `You have an unfinished draft: ${draft.title}.`,
                action: `/document/editor/${draft._id}`,
                priority: 'low',
                context: { documentId: draft._id }
            });
        });

        return recommendations.sort((a, b) => {
            const priorityMap = { high: 3, medium: 2, low: 1 };
            return priorityMap[b.priority] - priorityMap[a.priority];
        });

    } catch (error) {
        console.error("Error generating recommendations:", error);
        return [];
    }
}

module.exports = {
    getProactiveRecommendations
};
