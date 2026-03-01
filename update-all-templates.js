// Script to update ALL templates in MongoDB with new premium designs
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const TEMPLATE_MAP = {
    'offer-letter-001': 'offer_letter.hbs',
    'appointment-letter-001': 'appointment_letter.hbs',
    'experience-certificate-001': 'experience_certificate.hbs',
    'warning-letter-001': 'warning_letter.hbs',
    'nda-001': 'nda.hbs',
    'invoice-001': 'invoice.hbs',
};

async function updateAllTemplates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const Template = mongoose.model('Template', new mongoose.Schema({}, { strict: false }), 'templates');

        for (const [templateId, filename] of Object.entries(TEMPLATE_MAP)) {
            const filePath = path.join(__dirname, 'src/templates', filename);

            if (!fs.existsSync(filePath)) {
                console.log(`⚠️  File not found: ${filename}, skipping.`);
                continue;
            }

            const content = fs.readFileSync(filePath, 'utf8');
            const result = await Template.updateOne(
                { templateId },
                { $set: { content } }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ ${templateId} → updated from ${filename}`);
            } else if (result.matchedCount > 0) {
                console.log(`⏩ ${templateId} → already up to date`);
            } else {
                console.log(`❌ ${templateId} → not found in DB`);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDone. Disconnected from MongoDB.');
    }
}

updateAllTemplates();
