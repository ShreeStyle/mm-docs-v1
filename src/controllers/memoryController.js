const DocumentMemory = require("../models/DocumentMemory");
const Document = require("../models/Document");
const ClauseLibrary = require("../models/ClauseLibrary");

// Get user's document memory
exports.getDocumentMemory = async (req, res) => {
    try {
        const userId = req.user.id;
        
        let memory = await DocumentMemory.findOne({ userId });
        
        // Create default memory if doesn't exist
        if (!memory) {
            memory = await DocumentMemory.create({
                userId,
                brandVoice: {
                    tone: "professional",
                    writingStyle: "concise"
                },
                commonClauses: [],
                documentPreferences: {
                    defaultTemplates: [],
                    formatting: {
                        preferredFont: "Inter",
                        fontSize: 11,
                        lineSpacing: "1.5",
                        margins: "normal"
                    }
                }
            });
        }
        
        res.json(memory);
    } catch (error) {
        console.error("Error fetching document memory:", error);
        res.status(500).json({ message: "Error fetching document memory", error: error.message });
    }
};

// Update document memory based on user behavior
exports.updateDocumentMemory = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        
        const memory = await DocumentMemory.findOneAndUpdate(
            { userId },
            { $set: updates },
            { new: true, upsert: true }
        );
        
        res.json({ message: "Document memory updated", memory });
    } catch (error) {
        console.error("Error updating document memory:", error);
        res.status(500).json({ message: "Error updating document memory", error: error.message });
    }
};

// Learn from document generation
exports.learnFromDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const { documentId, feedback, suggestionsAccepted, suggestionsRejected } = req.body;
        
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        let memory = await DocumentMemory.findOne({ userId });
        if (!memory) {
            memory = await DocumentMemory.create({ userId });
        }
        
        // Track accepted/rejected suggestions
        if (suggestionsAccepted && suggestionsAccepted.length > 0) {
            memory.aiLearning.acceptedSuggestions.push(...suggestionsAccepted);
        }
        
        if (suggestionsRejected && suggestionsRejected.length > 0) {
            memory.aiLearning.rejectedSuggestions.push(...suggestionsRejected);
        }
        
        // Add feedback
        if (feedback) {
            memory.aiLearning.improvementFeedback.push({
                documentId,
                feedback,
                timestamp: new Date()
            });
        }
        
        // Update document type patterns
        const existingPattern = memory.patterns.mostUsedDocTypes.find(
            p => p.type === document.type
        );
        
        if (existingPattern) {
            existingPattern.count += 1;
        } else {
            memory.patterns.mostUsedDocTypes.push({
                type: document.type,
                count: 1
            });
        }
        
        await memory.save();
        
        res.json({ message: "Learning captured successfully", memory });
    } catch (error) {
        console.error("Error learning from document:", error);
        res.status(500).json({ message: "Error processing learning data", error: error.message });
    }
};

// Get AI-powered suggestions based on memory
exports.getSmartSuggestions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { documentType, context } = req.body;
        
        const memory = await DocumentMemory.findOne({ userId });
        if (!memory) {
            return res.json({ suggestions: [] });
        }
        
        const suggestions = [];
        
        // Suggest commonly used clauses for this document type
        if (documentType) {
            const relevantClauses = memory.commonClauses
                .filter(c => c.category === documentType)
                .sort((a, b) => b.usageCount - a.usageCount)
                .slice(0, 5);
            
            if (relevantClauses.length > 0) {
                suggestions.push({
                    type: 'clauses',
                    title: 'Your Frequently Used Clauses',
                    items: relevantClauses
                });
            }
        }
        
        // Suggest brand voice preferences
        if (memory.brandVoice.preferredPhrases && memory.brandVoice.preferredPhrases.length > 0) {
            suggestions.push({
                type: 'phrases',
                title: 'Your Preferred Phrases',
                items: memory.brandVoice.preferredPhrases.slice(0, 5)
            });
        }
        
        // Suggest document preferences
        if (memory.documentPreferences.defaultTemplates.length > 0) {
            suggestions.push({
                type: 'templates',
                title: 'Your Go-To Templates',
                items: memory.documentPreferences.defaultTemplates
            });
        }
        
        res.json({ suggestions });
    } catch (error) {
        console.error("Error getting smart suggestions:", error);
        res.status(500).json({ message: "Error fetching suggestions", error: error.message });
    }
};

// Add common clause to memory
exports.addCommonClause = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, text, category } = req.body;
        
        if (!type || !text || !category) {
            return res.status(400).json({ message: "Type, text, and category are required" });
        }
        
        const memory = await DocumentMemory.findOneAndUpdate(
            { userId },
            { 
                $push: { 
                    commonClauses: {
                        type,
                        text,
                        category,
                        usageCount: 1,
                        lastUsed: new Date()
                    }
                }
            },
            { new: true, upsert: true }
        );
        
        res.json({ message: "Clause added to memory", memory });
    } catch (error) {
        console.error("Error adding clause:", error);
        res.status(500).json({ message: "Error adding clause", error: error.message });
    }
};
