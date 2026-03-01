const mongoose = require('mongoose');
const Template = require('./src/models/Template');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const updateInvoiceTemplate = async () => {
    try {
        console.log('🔄 Updating Professional Invoice Template...');
        
        // Read the updated invoice template
        const invoiceContent = fs.readFileSync(path.join(__dirname, 'src/templates/invoice.hbs'), 'utf8');
        
        // Update the invoice template in database
        const result = await Template.findOneAndUpdate(
            { templateId: 'invoice-001' },
            { 
                content: invoiceContent,
                name: 'Professional Invoice',
                description: 'Modern, professional invoice template with clean design and proper formatting',
                'metadata.version': '2.0.0'
            },
            { new: true }
        );

        if (result) {
            console.log('✅ Invoice template updated successfully!');
            console.log(`   - Template: ${result.name}`);
            console.log(`   - Version: ${result.metadata.version}`);
            console.log(`   - Content length: ${result.content.length} characters`);
        } else {
            console.log('❌ Invoice template not found in database');
        }

    } catch (error) {
        console.error('❌ Error updating invoice template:', error);
    }
};

const main = async () => {
    await connectDB();
    await updateInvoiceTemplate();
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
};

main();