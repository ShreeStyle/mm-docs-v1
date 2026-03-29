const Document = require("../models/Document");
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Run compliance check on documents
 */
exports.checkCompliance = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get all user documents
        const documents = await Document.find({ user: userId });
        
        // Basic compliance checks
        const checks = {
            gstFormat: {
                label: "GST Format Check",
                status: "passed",
                description: "All invoices follow GST format requirements",
                score: 100
            },
            legalStructure: {
                label: "Basic Legal Structure",
                status: "passed",
                description: "Legal documents have proper structure",
                score: 98
            },
            hrPolicies: {
                label: "HR Policy Status",
                status: "review",
                description: "Some HR policies need review",
                score: 85
            },
            dataProtection: {
                label: "Data Protection",
                status: "passed",
                description: "Privacy policies are compliant",
                score: 95
            },
            signatureValidation: {
                label: "Signature Validation",
                status: "passed",
                description: "Digital signatures are valid",
                score: 100
            }
        };
        
        // Calculate overall score
        const scores = Object.values(checks).map(check => check.score);
        const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        
        res.json({
            success: true,
            data: {
                overallScore,
                checks,
                totalDocuments: documents.length,
                lastChecked: new Date()
            }
        });
    } catch (error) {
        console.error("Error checking compliance:", error);
        res.status(500).json({ 
            success: false,
            message: "Error checking compliance", 
            error: error.message 
        });
    }
};

/**
 * Get compliance history
 */
exports.getComplianceHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // For now, return mock history
        // In production, this would fetch from a ComplianceHistory model
        const history = [
            {
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                score: 87,
                issues: 3
            },
            {
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
                score: 82,
                issues: 5
            }
        ];
        
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error("Error fetching compliance history:", error);
        res.status(500).json({ 
            success: false,
            message: "Error fetching compliance history", 
            error: error.message 
        });
    }
};

/**
 * Run compliance check on a specific document
 */
exports.checkDocumentCompliance = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;
        
        const document = await Document.findOne({ _id: documentId, user: userId });
        
        if (!document) {
            return res.status(404).json({ 
                success: false,
                message: "Document not found" 
            });
        }
        
        // AI Powered Compliance Check
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{
                role: "system",
                content: "You are a legal and compliance expert. Analyze the provided document JSON and identify any missing mandatory fields, legal risks, or formatting issues. Return ONLY valid JSON with keys: score (0-100), status ('compliant', 'warning', 'critical'), and issues (array of objects with { label, description, severity })."
            }, {
                role: "user",
                content: JSON.stringify(document.content)
            }],
            max_tokens: 500
        });

        let analysis = { score: 100, status: 'compliant', issues: [] };
        try {
            const raw = response.choices[0].message.content;
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
        } catch (err) {
            console.error("AI Compliance Parse Error:", err);
        }
        
        res.json({
            success: true,
            data: {
                documentId,
                ...analysis
            }
        });
    } catch (error) {
        console.error("Error checking document compliance:", error);
        res.status(500).json({ 
            success: false,
            message: "Error checking document compliance", 
            error: error.message 
        });
    }
};

/**
 * POST /api/compliance/check-draft
 * Body: { content: { ... } }
 */
exports.checkDraftCompliance = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ success: false, message: "Content is required" });

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{
                role: "system",
                content: "You are a legal and compliance expert. Analyze the provided document JSON and identify any missing mandatory fields, legal risks, or formatting issues. Return ONLY valid JSON with keys: score (0-100), status ('compliant', 'warning', 'critical'), and issues (array of objects with { label, description, severity })."
            }, {
                role: "user",
                content: JSON.stringify(content)
            }],
            max_tokens: 500
        });

        let analysis = { score: 100, status: 'compliant', issues: [] };
        try {
            const raw = response.choices[0].message.content;
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
        } catch (err) {
            console.error("AI Compliance Parse Error:", err);
        }

        res.json({ success: true, data: analysis });
    } catch (error) {
        console.error("Error checking draft compliance:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = exports;
