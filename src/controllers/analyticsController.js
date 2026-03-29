const Analytics = require("../models/Analytics");
const Document = require("../models/Document");
const Signature = require("../models/Signature");
const Collaboration = require("../models/Collaboration");
const DocumentChat = require("../models/DocumentChat");
const User = require("../models/User");
const Template = require("../models/Template");
const mongoose = require("mongoose");
const activityService = require("../services/activityService");

// Get simple dashboard stats (for main Dashboard page)
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Calculate date ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        
        // Total documents
        const totalDocuments = await Document.countDocuments({ userId });
        
        // Documents this month
        const documentsThisMonth = await Document.countDocuments({
            userId,
            createdAt: { $gte: startOfMonth }
        });
        
        // Documents last month
        const documentsLastMonth = await Document.countDocuments({
            userId,
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });
        
        // Calculate percentage change
        const documentsChange = documentsLastMonth > 0
            ? (((documentsThisMonth - documentsLastMonth) / documentsLastMonth) * 100).toFixed(1)
            : documentsThisMonth > 0 ? 100 : 0;
        
        // Templates used (count of documents)
        const templatesUsed = await Document.distinct('type', { userId }).then(types => types.length);
        
        // Recent documents
        const recentDocuments = await Document.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title type category createdAt');
        
        // Pending approvals (mock for now)
        const pendingApprovals = 0;
        
        // Average generation time (mock - would calculate from timestamps)
        const avgGenerationTime = 45; // seconds
        
        const stats = {
            overview: {
                totalDocuments,
                documentsThisMonth,
                documentsChange: parseFloat(documentsChange),
                avgGenerationTime,
                templatesUsed,
                pendingApprovals
            },
            recentDocuments,
            topTemplates: [
                { name: 'NDA', count: Math.floor(totalDocuments * 0.3) },
                { name: 'Employment Contract', count: Math.floor(totalDocuments * 0.25) },
                { name: 'Sales Proposal', count: Math.floor(totalDocuments * 0.2) },
                { name: 'Invoice', count: Math.floor(totalDocuments * 0.15) }
            ]
        };
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
    }
};

// Get analytics dashboard data
exports.getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = 'monthly', startDate, endDate } = req.query;
        
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else {
            // Default to last 30 days
            dateFilter.createdAt = {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            };
        }
        
        // Documents analytics
        const totalDocuments = await Document.countDocuments({ userId, ...dateFilter });
        const documentsByType = await Document.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId), ...dateFilter } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Signature analytics
        const signaturesCreated = await Signature.countDocuments({ createdBy: userId, ...dateFilter });
        const signaturesCompleted = await Signature.countDocuments({ 
            createdBy: userId, 
            status: 'completed',
            ...dateFilter 
        });
        const signaturesPending = await Signature.countDocuments({ 
            createdBy: userId, 
            status: { $in: ['sent', 'partially-signed'] }
        });
        
        // Collaboration analytics
        const collaborations = await Collaboration.find({
            'collaborators.userId': userId
        });
        const totalCollaborators = new Set(
            collaborations.flatMap(c => c.collaborators.map(col => col.userId.toString()))
        ).size;
        const totalComments = collaborations.reduce((sum, c) => sum + c.comments.length, 0);
        
        // AI usage analytics
        const chatSessions = await DocumentChat.countDocuments({ userId });
        const totalChats = await DocumentChat.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, total: { $sum: '$stats.totalMessages' } } }
        ]);
        
        // Time saved estimation (assuming 2 hours per document manually)
        const timeSavedMinutes = totalDocuments * 120;
        
        // Recent activity
        const recentDocuments = await Document.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title type createdAt');
        
        const analytics = {
            overview: {
                totalDocuments,
                documentsThisMonth: totalDocuments,
                signaturesCompleted,
                signaturesPending,
                timeSavedMinutes,
                activeCollaborators: totalCollaborators
            },
            documents: {
                byType: documentsByType,
                total: totalDocuments
            },
            signatures: {
                created: signaturesCreated,
                completed: signaturesCompleted,
                pending: signaturesPending,
                completionRate: signaturesCreated > 0 ? (signaturesCompleted / signaturesCreated * 100).toFixed(1) : 0
            },
            collaboration: {
                totalCollaborators,
                totalComments,
                documentsShared: collaborations.length
            },
            ai: {
                chatSessions,
                totalMessages: totalChats[0]?.total || 0
            },
            recentActivity: recentDocuments
        };
        
        res.json(analytics);
    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Error fetching analytics", error: error.message });
    }
};

// Get detailed document analytics
exports.getDocumentAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const documents = await Document.find({ userId }).sort({ createdAt: -1 });
        
        const analytics = {
            total: documents.length,
            byType: {},
            byMonth: {},
            averagePerMonth: 0
        };
        
        documents.forEach(doc => {
            // By type
            analytics.byType[doc.type] = (analytics.byType[doc.type] || 0) + 1;
            
            // By month
            const month = doc.createdAt.toISOString().substring(0, 7);
            analytics.byMonth[month] = (analytics.byMonth[month] || 0) + 1;
        });
        
        // Calculate average per month
        const months = Object.keys(analytics.byMonth).length;
        analytics.averagePerMonth = months > 0 ? (analytics.total / months).toFixed(1) : 0;
        
        res.json(analytics);
    } catch (error) {
        console.error("Error fetching document analytics:", error);
        res.status(500).json({ message: "Error fetching document analytics", error: error.message });
    }
};

// Get productivity metrics
exports.getProductivityMetrics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { days = 30 } = req.query;
        
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        const documents = await Document.find({
            userId,
            createdAt: { $gte: startDate }
        }).sort({ createdAt: 1 });
        
        // Daily document creation
        const dailyActivity = {};
        documents.forEach(doc => {
            const date = doc.createdAt.toISOString().split('T')[0];
            dailyActivity[date] = (dailyActivity[date] || 0) + 1;
        });
        
        // Calculate productivity score (0-100)
        const avgDocsPerDay = documents.length / days;
        const productivityScore = Math.min(100, Math.round(avgDocsPerDay * 20));
        
        // Peak productivity hours (mock data for now)
        const peakHours = [9, 10, 11, 14, 15];
        
        const metrics = {
            totalDocuments: documents.length,
            averagePerDay: avgDocsPerDay.toFixed(2),
            productivityScore,
            dailyActivity,
            peakHours,
            timeSaved: {
                minutes: documents.length * 120,
                hours: (documents.length * 2).toFixed(1),
                days: (documents.length * 2 / 8).toFixed(1)
            }
        };
        
        res.json(metrics);
    } catch (error) {
        console.error("Error fetching productivity metrics:", error);
        res.status(500).json({ message: "Error fetching productivity metrics", error: error.message });
    }
};

// Get team analytics (if organization)
exports.getTeamAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { organizationId } = req.query;
        
        if (!organizationId) {
            return res.status(400).json({ message: "Organization ID is required" });
        }
        
        // Get all team members
        const organization = await Organization.findById(organizationId).populate('members.userId', 'name email');
        
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }
        
        // Check if requester is part of organization
        const isMember = organization.members.some(m => m.userId._id.toString() === userId);
        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        const memberIds = organization.members.map(m => m.userId._id);
        
        // Team-wide document stats
        const teamDocuments = await Document.countDocuments({ userId: { $in: memberIds } });
        
        // Most active members
        const memberActivity = await Document.aggregate([
            { $match: { userId: { $in: memberIds } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        
        // Populate member details
        await User.populate(memberActivity, { path: '_id', select: 'name email' });
        
        const analytics = {
            teamSize: organization.members.length,
            totalDocuments: teamDocuments,
            averagePerMember: (teamDocuments / organization.members.length).toFixed(1),
            mostActiveMembers: memberActivity.map(m => ({
                user: m._id,
                documents: m.count
            }))
        };
        
        res.json(analytics);
    } catch (error) {
        console.error("Error fetching team analytics:", error);
        res.status(500).json({ message: "Error fetching team analytics", error: error.message });
    }
};

// Export analytics data
exports.exportAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { format = 'json' } = req.query;
        
        // Gather all analytics data
        const documents = await Document.find({ userId }).select('-content');
        const signatures = await Signature.find({ createdBy: userId });
        const collaborations = await Collaboration.find({ 'collaborators.userId': userId });
        const chats = await DocumentChat.find({ userId }).select('-messages');
        
        const data = {
            exportDate: new Date().toISOString(),
            documents: documents.length,
            signatures: signatures.length,
            collaborations: collaborations.length,
            chats: chats.length,
            details: {
                documents,
                signatures,
                collaborations: collaborations.length,
                chats: chats.length
            }
        };
        
        if (format === 'json') {
            res.json(data);
        } else if (format === 'csv') {
            // Simple CSV export
            const csv = `Type,Count\nDocuments,${documents.length}\nSignatures,${signatures.length}\nCollaborations,${collaborations.length}\nChats,${chats.length}`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=analytics.csv');
            res.send(csv);
        } else {
            res.status(400).json({ message: "Invalid format. Use 'json' or 'csv'" });
        }
    } catch (error) {
        console.error("Error exporting analytics:", error);
        res.status(500).json({ message: "Error exporting analytics", error: error.message });
    }
};

// Get proactive recommendations for the user
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        const recommendations = await activityService.getProactiveRecommendations(userId);
        
        res.status(200).json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.status(500).json({ message: "Error fetching recommendations", error: error.message });
    }
};
