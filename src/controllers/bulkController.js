const Document = require("../models/Document");
const Template = require("../models/Template");
const fs = require("fs");
const csv = require("csv-parser");

/**
 * POST /api/bulk/generate
 * Body: multipart/form-data with file + templateId
 */
exports.generateBulk = async (req, res) => {
    try {
        const { templateId } = req.body;
        const file = req.file;

        if (!file || !templateId) {
            return res.status(400).json({ message: "File and Template ID are required." });
        }

        const template = await Template.findOne({ templateId });
        if (!template) {
            return res.status(404).json({ message: "Template not found." });
        }

        const results = [];
        const errors = [];
        const userId = req.user.id;

        // Parse CSV
        fs.createReadStream(file.path)
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", async () => {
                // Remove temp file
                fs.unlinkSync(file.path);

                const successes = [];
                const failures = [];

                // Process each row
                for (let i = 0; i < results.length; i++) {
                    try {
                        const row = results[i];
                        
                        // Create document data
                        const documentData = {
                            user: userId,
                            type: templateId,
                            templateId: templateId,
                            title: `${template.name} - ${row.client_name || row.employee_name || row.candidate_name || `Bulk_${i+1}`}`,
                            content: row,
                            status: 'generated'
                        };

                        const newDoc = new Document(documentData);
                        await newDoc.save();
                        successes.push({ row: i + 1, id: newDoc._id });
                    } catch (err) {
                        failures.push({ row: i + 1, error: err.message });
                    }
                }

                res.json({
                    success: true,
                    total: results.length,
                    successCount: successes.length,
                    failureCount: failures.length,
                    failures
                });
            });

    } catch (error) {
        console.error("Bulk Generation Error:", error);
        res.status(500).json({ message: "Bulk generation failed", error: error.message });
    }
};
