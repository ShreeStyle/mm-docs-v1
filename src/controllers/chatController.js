const DocumentChat = require("../models/DocumentChat");
const Document = require("../models/Document");
const { generateContent } = require("../services/ai/aiService");
const { getAIQuality } = require("../config/plans");
const User = require("../models/User");

// Get or create chat session
exports.getChatSession = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;
        
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        if (document.userId.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        let chat = await DocumentChat.findOne({ documentId, userId });
        
        if (!chat) {
            // Create new chat session
            chat = await DocumentChat.create({
                documentId,
                userId,
                messages: [],
                documentContext: {
                    title: document.title,
                    type: document.type,
                    contentSummary: JSON.stringify(document.content).substring(0, 500),
                    lastUpdated: document.updatedAt
                },
                stats: {
                    totalMessages: 0,
                    totalTokensUsed: 0
                }
            });
        }
        
        res.json(chat);
    } catch (error) {
        console.error("Error fetching chat session:", error);
        res.status(500).json({ message: "Error fetching chat session", error: error.message });
    }
};

// Send message to document chat
exports.sendMessage = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { message } = req.body;
        const userId = req.user.id;
        
        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }
        
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        if (document.userId.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        let chat = await DocumentChat.findOne({ documentId, userId });
        if (!chat) {
            chat = await DocumentChat.create({
                documentId,
                userId,
                messages: [],
                documentContext: {
                    title: document.title,
                    type: document.type,
                    contentSummary: JSON.stringify(document.content).substring(0, 500),
                    lastUpdated: document.updatedAt
                }
            });
        }
        
        // Add user message
        const userMessageId = `msg_${Date.now()}_user`;
        chat.messages.push({
            messageId: userMessageId,
            role: 'user',
            content: message,
            timestamp: new Date()
        });
        
        // Get user's AI quality
        const user = await User.findById(userId);
        const aiQuality = getAIQuality(user);
        
        // Prepare context for AI
        const documentContent = JSON.stringify(document.content, null, 2);
        const conversationHistory = chat.messages.slice(-5).map(m => 
            `${m.role}: ${m.content}`
        ).join('\n\n');
        
        const aiPrompt = `You are an AI assistant helping a user understand and work with their ${document.type} document titled "${document.title}".

Document Content:
${documentContent}

Previous conversation:
${conversationHistory}

User's question: ${message}

Please provide a helpful, accurate response. You can:
- Summarize sections of the document
- Explain clauses or terms
- Identify potential risks or issues
- Suggest improvements
- Rewrite sections in different tones
- Answer specific questions about the content

If the user asks to rewrite or modify something, provide the rewritten version clearly.
If you reference specific parts of the document, cite them.
Be professional, clear, and concise.`;
        
        const startTime = Date.now();
        const aiResponse = await generateContent(
            "document-chat",
            aiPrompt,
            {},
            {},
            aiQuality
        );
        const responseTime = Date.now() - startTime;
        
        // Add AI response
        const aiMessageId = `msg_${Date.now()}_ai`;
        chat.messages.push({
            messageId: aiMessageId,
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date(),
            aiModel: aiQuality,
            responseTime
        });
        
        // Update stats
        chat.stats.totalMessages = chat.messages.length;
        chat.stats.lastInteraction = new Date();
        
        await chat.save();
        
        res.json({
            message: "Response generated",
            userMessage: chat.messages.find(m => m.messageId === userMessageId),
            aiMessage: chat.messages.find(m => m.messageId === aiMessageId)
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Error processing message", error: error.message });
    }
};

// Get chat history
exports.getChatHistory = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;
        const { limit = 50 } = req.query;
        
        const chat = await DocumentChat.findOne({ documentId, userId });
        
        if (!chat) {
            return res.json({ messages: [] });
        }
        
        const recentMessages = chat.messages
            .slice(-parseInt(limit))
            .sort((a, b) => a.timestamp - b.timestamp);
        
        res.json({
            messages: recentMessages,
            stats: chat.stats
        });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Error fetching chat history", error: error.message });
    }
};

// Clear chat history
exports.clearChatHistory = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;
        
        const chat = await DocumentChat.findOne({ documentId, userId });
        
        if (!chat) {
            return res.status(404).json({ message: "Chat session not found" });
        }
        
        chat.messages = [];
        chat.stats.totalMessages = 0;
        await chat.save();
        
        res.json({ message: "Chat history cleared" });
    } catch (error) {
        console.error("Error clearing chat history:", error);
        res.status(500).json({ message: "Error clearing chat history", error: error.message });
    }
};

// Quick actions for document chat
exports.quickAction = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { action } = req.body;
        const userId = req.user.id;
        
        if (!action) {
            return res.status(400).json({ message: "Action is required" });
        }
        
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        const documentContent = JSON.stringify(document.content, null, 2);
        
        let prompt = '';
        
        switch (action) {
            case 'summarize':
                prompt = `Provide a concise summary of this ${document.type} document:\n\n${documentContent}`;
                break;
            case 'risks':
                prompt = `Analyze this ${document.type} document and highlight potential risks, missing clauses, or areas of concern:\n\n${documentContent}`;
                break;
            case 'key-points':
                prompt = `Extract the key points and important clauses from this ${document.type} document:\n\n${documentContent}`;
                break;
            case 'simplify':
                prompt = `Explain this ${document.type} document in simple, easy-to-understand language:\n\n${documentContent}`;
                break;
            case 'formal':
                prompt = `Rewrite this ${document.type} document in a more formal, professional tone:\n\n${documentContent}`;
                break;
            case 'casual':
                prompt = `Rewrite this ${document.type} document in a more casual, approachable tone:\n\n${documentContent}`;
                break;
            default:
                return res.status(400).json({ message: "Invalid action" });
        }
        
        const user = await User.findById(userId);
        const aiQuality = getAIQuality(user);
        
        const result = await generateContent(
            `quick-action-${action}`,
            prompt,
            {},
            {},
            aiQuality
        );
        
        res.json({
            action,
            result
        });
    } catch (error) {
        console.error("Error performing quick action:", error);
        res.status(500).json({ message: "Error performing quick action", error: error.message });
    }
};
