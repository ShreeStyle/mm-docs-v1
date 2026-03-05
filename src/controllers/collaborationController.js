const Collaboration = require("../models/Collaboration");
const Document = require("../models/Document");
const User = require("../models/User");

// Get collaboration details for a document
exports.getCollaboration = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;
        
        // Check if user has access to this document
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        let collaboration = await Collaboration.findOne({ documentId })
            .populate('collaborators.userId', 'name email')
            .populate('comments.userId', 'name email')
            .populate('comments.replies.userId', 'name email')
            .populate('activeSessions.userId', 'name email')
            .populate('activityLog.userId', 'name email');
        
        if (!collaboration) {
            // Create new collaboration record
            collaboration = await Collaboration.create({
                documentId,
                collaborators: [{
                    userId: document.userId,
                    role: 'owner',
                    addedAt: new Date()
                }]
            });
        }
        
        // Check if user is a collaborator
        const isCollaborator = collaboration.collaborators.some(
            c => c.userId._id.toString() === userId || c.userId.toString() === userId
        );
        
        if (!isCollaborator && document.userId.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        res.json(collaboration);
    } catch (error) {
        console.error("Error fetching collaboration:", error);
        res.status(500).json({ message: "Error fetching collaboration data", error: error.message });
    }
};

// Add collaborator to document
exports.addCollaborator = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { email, role } = req.body;
        const userId = req.user.id;
        
        if (!email || !role) {
            return res.status(400).json({ message: "Email and role are required" });
        }
        
        // Find user by email
        const collaboratorUser = await User.findOne({ email });
        if (!collaboratorUser) {
            return res.status(404).json({ message: "User not found with this email" });
        }
        
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        // Check if requester has permission (must be owner or editor)
        let collaboration = await Collaboration.findOne({ documentId });
        if (!collaboration) {
            collaboration = await Collaboration.create({
                documentId,
                collaborators: [{
                    userId: document.userId,
                    role: 'owner'
                }]
            });
        }
        
        const requesterRole = collaboration.collaborators.find(
            c => c.userId.toString() === userId
        )?.role;
        
        if (requesterRole !== 'owner' && requesterRole !== 'editor') {
            return res.status(403).json({ message: "You don't have permission to add collaborators" });
        }
        
        // Check if user is already a collaborator
        const existingCollaborator = collaboration.collaborators.find(
            c => c.userId.toString() === collaboratorUser._id.toString()
        );
        
        if (existingCollaborator) {
            return res.status(400).json({ message: "User is already a collaborator" });
        }
        
        // Add collaborator
        collaboration.collaborators.push({
            userId: collaboratorUser._id,
            role,
            addedBy: userId,
            addedAt: new Date()
        });
        
        // Log activity
        collaboration.activityLog.push({
            userId,
            action: 'added-collaborator',
            details: {
                collaboratorId: collaboratorUser._id,
                collaboratorEmail: email,
                role
            },
            timestamp: new Date()
        });
        
        await collaboration.save();
        
        await collaboration.populate('collaborators.userId', 'name email');
        
        res.json({
            message: "Collaborator added successfully",
            collaboration
        });
    } catch (error) {
        console.error("Error adding collaborator:", error);
        res.status(500).json({ message: "Error adding collaborator", error: error.message });
    }
};

// Update collaborator role
exports.updateCollaboratorRole = async (req, res) => {
    try {
        const { documentId, collaboratorId } = req.params;
        const { role } = req.body;
        const userId = req.user.id;
        
        const collaboration = await Collaboration.findOne({ documentId });
        if (!collaboration) {
            return res.status(404).json({ message: "Collaboration not found" });
        }
        
        // Check if requester is owner
        const isOwner = collaboration.collaborators.some(
            c => c.userId.toString() === userId && c.role === 'owner'
        );
        
        if (!isOwner) {
            return res.status(403).json({ message: "Only owners can update roles" });
        }
        
        const collaborator = collaboration.collaborators.find(
            c => c.userId.toString() === collaboratorId
        );
        
        if (!collaborator) {
            return res.status(404).json({ message: "Collaborator not found" });
        }
        
        collaborator.role = role;
        
        collaboration.activityLog.push({
            userId,
            action: 'updated-role',
            details: { collaboratorId, newRole: role },
            timestamp: new Date()
        });
        
        await collaboration.save();
        
        res.json({ message: "Role updated successfully", collaboration });
    } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).json({ message: "Error updating role", error: error.message });
    }
};

// Remove collaborator
exports.removeCollaborator = async (req, res) => {
    try {
        const { documentId, collaboratorId } = req.params;
        const userId = req.user.id;
        
        const collaboration = await Collaboration.findOne({ documentId });
        if (!collaboration) {
            return res.status(404).json({ message: "Collaboration not found" });
        }
        
        // Check if requester is owner
        const isOwner = collaboration.collaborators.some(
            c => c.userId.toString() === userId && c.role === 'owner'
        );
        
        if (!isOwner) {
            return res.status(403).json({ message: "Only owners can remove collaborators" });
        }
        
        collaboration.collaborators = collaboration.collaborators.filter(
            c => c.userId.toString() !== collaboratorId
        );
        
        collaboration.activityLog.push({
            userId,
            action: 'removed-collaborator',
            details: { collaboratorId },
            timestamp: new Date()
        });
        
        await collaboration.save();
        
        res.json({ message: "Collaborator removed successfully" });
    } catch (error) {
        console.error("Error removing collaborator:", error);
        res.status(500).json({ message: "Error removing collaborator", error: error.message });
    }
};

// Add comment to document
exports.addComment = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { content, position } = req.body;
        const userId = req.user.id;
        
        if (!content) {
            return res.status(400).json({ message: "Comment content is required" });
        }
        
        let collaboration = await Collaboration.findOne({ documentId });
        if (!collaboration) {
            return res.status(404).json({ message: "Collaboration not found" });
        }
        
        const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        collaboration.comments.push({
            commentId,
            userId,
            content,
            position,
            isResolved: false,
            replies: [],
            createdAt: new Date()
        });
        
        collaboration.activityLog.push({
            userId,
            action: 'added-comment',
            details: { commentId, content: content.substring(0, 100) },
            timestamp: new Date()
        });
        
        await collaboration.save();
        await collaboration.populate('comments.userId', 'name email');
        
        const newComment = collaboration.comments.find(c => c.commentId === commentId);
        
        res.json({
            message: "Comment added successfully",
            comment: newComment
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
};

// Reply to comment
exports.replyToComment = async (req, res) => {
    try {
        const { documentId, commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        
        if (!content) {
            return res.status(400).json({ message: "Reply content is required" });
        }
        
        const collaboration = await Collaboration.findOne({ documentId });
        if (!collaboration) {
            return res.status(404).json({ message: "Collaboration not found" });
        }
        
        const comment = collaboration.comments.find(c => c.commentId === commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        
        comment.replies.push({
            userId,
            content,
            createdAt: new Date()
        });
        
        await collaboration.save();
        await collaboration.populate('comments.replies.userId', 'name email');
        
        res.json({ message: "Reply added successfully", comment });
    } catch (error) {
        console.error("Error adding reply:", error);
        res.status(500).json({ message: "Error adding reply", error: error.message });
    }
};

// Resolve comment
exports.resolveComment = async (req, res) => {
    try {
        const { documentId, commentId } = req.params;
        const userId = req.user.id;
        
        const collaboration = await Collaboration.findOne({ documentId });
        if (!collaboration) {
            return res.status(404).json({ message: "Collaboration not found" });
        }
        
        const comment = collaboration.comments.find(c => c.commentId === commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        
        comment.isResolved = true;
        comment.resolvedBy = userId;
        comment.resolvedAt = new Date();
        
        await collaboration.save();
        
        res.json({ message: "Comment resolved successfully" });
    } catch (error) {
        console.error("Error resolving comment:", error);
        res.status(500).json({ message: "Error resolving comment", error: error.message });
    }
};

// Update active session (for real-time presence)
exports.updateSession = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { sessionId, cursorPosition } = req.body;
        const userId = req.user.id;
        
        let collaboration = await Collaboration.findOne({ documentId });
        if (!collaboration) {
            return res.status(404).json({ message: "Collaboration not found" });
        }
        
        // Remove old sessions for this user
        collaboration.activeSessions = collaboration.activeSessions.filter(
            s => s.userId.toString() !== userId
        );
        
        // Add new session
        collaboration.activeSessions.push({
            userId,
            sessionId,
            cursorPosition,
            lastActivity: new Date()
        });
        
        // Clean up inactive sessions (older than 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        collaboration.activeSessions = collaboration.activeSessions.filter(
            s => s.lastActivity > fiveMinutesAgo
        );
        
        await collaboration.save();
        await collaboration.populate('activeSessions.userId', 'name email');
        
        res.json({
            message: "Session updated",
            activeSessions: collaboration.activeSessions
        });
    } catch (error) {
        console.error("Error updating session:", error);
        res.status(500).json({ message: "Error updating session", error: error.message });
    }
};

// Get activity log
exports.getActivityLog = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { limit = 50 } = req.query;
        
        const collaboration = await Collaboration.findOne({ documentId })
            .populate('activityLog.userId', 'name email')
            .select('activityLog');
        
        if (!collaboration) {
            return res.status(404).json({ message: "Collaboration not found" });
        }
        
        const recentActivity = collaboration.activityLog
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, parseInt(limit));
        
        res.json({ activityLog: recentActivity });
    } catch (error) {
        console.error("Error fetching activity log:", error);
        res.status(500).json({ message: "Error fetching activity log", error: error.message });
    }
};
