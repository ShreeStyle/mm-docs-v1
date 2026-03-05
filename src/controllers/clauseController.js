const ClauseLibrary = require("../models/ClauseLibrary");
const Document = require("../models/Document");
const { generateContent } = require("../services/ai/aiService");

// Get all clauses for a user
exports.getClauses = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, subcategory, tags } = req.query;
        
        const filter = { userId, isActive: true };
        
        if (category) filter.category = category;
        if (subcategory) filter.subcategory = subcategory;
        if (tags) filter.tags = { $in: tags.split(',') };
        
        const clauses = await ClauseLibrary.find(filter).sort({ usageCount: -1, createdAt: -1 });
        
        res.json(clauses);
    } catch (error) {
        console.error("Error fetching clauses:", error);
        res.status(500).json({ message: "Error fetching clauses", error: error.message });
    }
};

// Create new clause
exports.createClause = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, category, subcategory, content, description, tags, jurisdiction, language } = req.body;
        
        if (!title || !category || !content) {
            return res.status(400).json({ message: "Title, category, and content are required" });
        }
        
        const clause = await ClauseLibrary.create({
            userId,
            title,
            category,
            subcategory,
            content,
            description,
            tags,
            jurisdiction: jurisdiction || 'general',
            language: language || 'en',
            isDefault: false
        });
        
        res.status(201).json({ message: "Clause created successfully", clause });
    } catch (error) {
        console.error("Error creating clause:", error);
        res.status(500).json({ message: "Error creating clause", error: error.message });
    }
};

// Update clause
exports.updateClause = async (req, res) => {
    try {
        const userId = req.user.id;
        const { clauseId } = req.params;
        const updates = req.body;
        
        const clause = await ClauseLibrary.findOneAndUpdate(
            { _id: clauseId, userId },
            { $set: updates },
            { new: true }
        );
        
        if (!clause) {
            return res.status(404).json({ message: "Clause not found" });
        }
        
        res.json({ message: "Clause updated successfully", clause });
    } catch (error) {
        console.error("Error updating clause:", error);
        res.status(500).json({ message: "Error updating clause", error: error.message });
    }
};

// Delete clause
exports.deleteClause = async (req, res) => {
    try {
        const userId = req.user.id;
        const { clauseId } = req.params;
        
        const clause = await ClauseLibrary.findOneAndUpdate(
            { _id: clauseId, userId },
            { $set: { isActive: false } },
            { new: true }
        );
        
        if (!clause) {
            return res.status(404).json({ message: "Clause not found" });
        }
        
        res.json({ message: "Clause deleted successfully" });
    } catch (error) {
        console.error("Error deleting clause:", error);
        res.status(500).json({ message: "Error deleting clause", error: error.message });
    }
};

// AI Risk Analysis for a document
exports.analyzeDocumentRisk = async (req, res) => {
    try {
        const userId = req.user.id;
        const { documentId } = req.params;
        
        const document = await Document.findOne({ _id: documentId, userId });
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        // Use AI to analyze risks
        const analysisPrompt = `Analyze this ${document.type} document for potential risks, missing clauses, and ambiguous language. 
        
Document Content:
${JSON.stringify(document.content)}

Provide:
1. List of potential risks or issues
2. Missing important clauses
3. Ambiguous or unclear wording
4. Recommendations for improvement
5. Overall risk level (low/medium/high/critical)

Format response as JSON with structure:
{
    "overallRisk": "low|medium|high|critical",
    "issues": [
        {
            "type": "missing-clause|ambiguous|risky|compliance",
            "severity": "low|medium|high|critical",
            "description": "Issue description",
            "suggestion": "How to fix",
            "section": "Where in document"
        }
    ],
    "missingClauses": ["clause1", "clause2"],
    "recommendations": ["recommendation1", "recommendation2"]
}`;
        
        const aiResponse = await generateContent(
            "legal-analysis",
            analysisPrompt,
            {},
            {},
            "high"
        );
        
        // Parse AI response
        let analysis;
        try {
            analysis = JSON.parse(aiResponse);
        } catch (e) {
            // If AI doesn't return proper JSON, create a basic analysis
            analysis = {
                overallRisk: "medium",
                issues: [{
                    type: "general",
                    severity: "medium",
                    description: "Document requires manual review",
                    suggestion: "Please have this reviewed by a legal professional"
                }],
                missingClauses: [],
                recommendations: [aiResponse]
            };
        }
        
        res.json({
            message: "Risk analysis completed",
            documentId,
            analysis
        });
    } catch (error) {
        console.error("Error analyzing document risk:", error);
        res.status(500).json({ message: "Error analyzing document", error: error.message });
    }
};

// Get AI suggestions for missing clauses
exports.getSuggestedClauses = async (req, res) => {
    try {
        const userId = req.user.id;
        const { documentType, jurisdiction } = req.body;
        
        if (!documentType) {
            return res.status(400).json({ message: "Document type is required" });
        }
        
        // Get user's existing clauses
        const userClauses = await ClauseLibrary.find({
            userId,
            isActive: true
        });
        
        // Get default system clauses for this document type
        const systemClauses = await ClauseLibrary.find({
            isDefault: true,
            category: documentType,
            isActive: true
        });
        
        // Use AI to suggest additional clauses
        const aiPrompt = `For a ${documentType} document in ${jurisdiction || 'general'} jurisdiction, 
        suggest 5 essential clauses that should be included. 
        
        Format as JSON array:
        [
            {
                "title": "Clause name",
                "subcategory": "category",
                "description": "Why it's important",
                "content": "Sample clause text",
                "riskLevel": "low|medium|high"
            }
        ]`;
        
        const aiResponse = await generateContent(
            "legal-clause-suggestions",
            aiPrompt,
            {},
            {},
            "high"
        );
        
        let aiSuggestions = [];
        try {
            aiSuggestions = JSON.parse(aiResponse);
        } catch (e) {
            console.error("Failed to parse AI suggestions:", e);
        }
        
        res.json({
            userClauses,
            systemClauses,
            aiSuggestions
        });
    } catch (error) {
        console.error("Error getting clause suggestions:", error);
        res.status(500).json({ message: "Error getting suggestions", error: error.message });
    }
};

// Analyze specific clause for risks
exports.analyzeClause = async (req, res) => {
    try {
        const { clauseId } = req.params;
        const userId = req.user.id;
        
        const clause = await ClauseLibrary.findOne({ _id: clauseId, userId });
        if (!clause) {
            return res.status(404).json({ message: "Clause not found" });
        }
        
        const analysisPrompt = `Analyze this ${clause.category} clause for potential risks and issues:

"${clause.content}"

Provide JSON response with:
{
    "hasIssues": true/false,
    "issues": [
        {
            "type": "ambiguous|missing-info|risky|outdated",
            "description": "What's the issue",
            "severity": "low|medium|high|critical",
            "suggestion": "How to improve"
        }
    ],
    "overallRiskLevel": "low|medium|high"
}`;
        
        const aiResponse = await generateContent(
            "clause-analysis",
            analysisPrompt,
            {},
            {},
            "high"
        );
        
        let analysis;
        try {
            analysis = JSON.parse(aiResponse);
        } catch (e) {
            analysis = {
                hasIssues: false,
                issues: [],
                overallRiskLevel: "low"
            };
        }
        
        // Update clause with analysis
        clause.riskAnalysis = {
            hasIssues: analysis.hasIssues,
            issues: analysis.issues,
            lastAnalyzed: new Date()
        };
        clause.riskLevel = analysis.overallRiskLevel;
        await clause.save();
        
        res.json({
            message: "Clause analyzed successfully",
            clause,
            analysis
        });
    } catch (error) {
        console.error("Error analyzing clause:", error);
        res.status(500).json({ message: "Error analyzing clause", error: error.message });
    }
};
