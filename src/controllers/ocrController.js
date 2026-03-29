/**
 * ocrController.js
 * Uses OpenAI Vision API (already integrated) to extract structured data
 * from uploaded documents (GST certificate, PAN card, letterhead).
 */

const Organization = require("../models/Organization");
const { OpenAI } = require("openai");
const fs = require("fs");
const path = require("path");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Convert a file buffer to a base64 data URL for Vision API.
 */
function toBase64DataUrl(filePath, mimeType) {
    const buffer = fs.readFileSync(filePath);
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

/**
 * POST /api/ocr/extract
 * Body: multipart/form-data with file + docType
 * docType: "gst_certificate" | "pan_card" | "letterhead"
 */
exports.extractFromDocument = async (req, res) => {
    try {
        const { docType } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const userId = req.user.id;
        const mimeType = file.mimetype;
        const dataUrl = toBase64DataUrl(file.path, mimeType);

        // Build extraction prompt based on document type
        const prompts = {
            gst_certificate: `Extract the following fields from this GST registration certificate. Return ONLY valid JSON with keys: gstin, legalName, tradeName, registeredAddress (with line1, city, state, postalCode), gstRegistrationType, pan. If any field is not found, set it to "".`,
            pan_card: `Extract the following fields from this PAN card image. Return ONLY valid JSON with keys: pan, nameOnPan. If any field is not found, set it to "".`,
            letterhead: `Extract the following company details from this letterhead or invoice image. Return ONLY valid JSON with keys: companyName, address (full text), phone, email, website, gstin, pan. If any field is not found, set it to "".`,
            general_document: `Extract data for the following fields from this document. Return ONLY valid JSON where keys match the field names provided. Field Names: ${req.body.fields || ""}. If any field is not found, set it to "".`
        };

        const prompt = prompts[docType];
        if (!prompt) {
            return res.status(400).json({ message: "Invalid docType. Use: gst_certificate | pan_card | letterhead" });
        }

        // Call OpenAI Vision
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: dataUrl } }
                ]
            }],
            max_tokens: 500
        });

        // Clean up temp file
        fs.unlinkSync(file.path);

        // Parse JSON from response
        let extracted = {};
        try {
            const raw = response.choices[0].message.content;
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) extracted = JSON.parse(jsonMatch[0]);
        } catch (parseErr) {
            return res.status(500).json({ message: "Could not parse extracted data. Please try again." });
        }

        // Map extracted data to Organization fields
        const updateData = {};

        if (docType === "gst_certificate") {
            if (extracted.gstin) updateData["tax.gstin"] = extracted.gstin;
            if (extracted.pan) updateData["tax.pan"] = extracted.pan;
            if (extracted.legalName) updateData["legalName"] = extracted.legalName;
            if (extracted.tradeName) updateData["name"] = extracted.tradeName;
            if (extracted.gstRegistrationType) updateData["tax.gstRegistrationType"] = extracted.gstRegistrationType.toLowerCase();
            if (extracted.registeredAddress) {
                if (extracted.registeredAddress.line1) updateData["registeredAddress.line1"] = extracted.registeredAddress.line1;
                if (extracted.registeredAddress.city) updateData["registeredAddress.city"] = extracted.registeredAddress.city;
                if (extracted.registeredAddress.state) updateData["registeredAddress.state"] = extracted.registeredAddress.state;
                if (extracted.registeredAddress.postalCode) updateData["registeredAddress.postalCode"] = extracted.registeredAddress.postalCode;
            }
        }

        if (docType === "pan_card") {
            if (extracted.pan) updateData["tax.pan"] = extracted.pan;
            if (extracted.nameOnPan) updateData["legalName"] = extracted.nameOnPan;
        }

        if (docType === "letterhead") {
            if (extracted.companyName) updateData["name"] = extracted.companyName;
            if (extracted.phone) updateData["contact.phone"] = extracted.phone;
            if (extracted.email) updateData["contact.email"] = extracted.email;
            if (extracted.website) updateData["contact.website"] = extracted.website;
            if (extracted.gstin) updateData["tax.gstin"] = extracted.gstin;
            if (extracted.pan) updateData["tax.pan"] = extracted.pan;
            if (extracted.address) updateData["registeredAddress.line1"] = extracted.address;
        }

        // Auto-save to org if org exists for this user (only for org-related docs)
        let org = null;
        if (Object.keys(updateData).length > 0) {
            org = await Organization.findOneAndUpdate(
                { "members.userId": userId },
                { $set: updateData },
                { new: true }
            );
        }

        return res.json({
            message: "Extraction successful",
            extracted,
            savedToOrg: !!org,
            fieldsUpdated: Object.keys(updateData)
        });

    } catch (error) {
        console.error("OCR Extraction Error:", error);
        res.status(500).json({ message: "Extraction failed", error: error.message });
    }
};
