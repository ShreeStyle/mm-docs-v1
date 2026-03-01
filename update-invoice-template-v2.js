// Script to update the invoice template in MongoDB with the new design
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function updateTemplate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const Template = mongoose.model('Template', new mongoose.Schema({}, { strict: false }), 'templates');

        const newContent = fs.readFileSync(path.join(__dirname, 'src/templates/invoice.hbs'), 'utf8');

        const result = await Template.updateOne(
            { templateId: 'invoice-001' },
            { $set: { content: newContent } }
        );

        console.log('Update result:', result);

        if (result.modifiedCount > 0) {
            console.log('✅ Invoice template updated successfully!');
        } else if (result.matchedCount > 0) {
            console.log('⚠️ Template found but no changes made (already up to date?)');
        } else {
            console.log('❌ No template found with templateId: invoice-001');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

updateTemplate();
