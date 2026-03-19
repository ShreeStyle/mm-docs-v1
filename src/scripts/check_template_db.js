require("dotenv").config();
const mongoose = require("mongoose");
const Template = require("../models/Template");

async function checkTemplate() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUri || 'mongodb://localhost:27017/mm-docs');
    console.log("✅ Connected to MongoDB");

    const templateId = 'purchase-order-001';
    const template = await Template.findOne({ templateId });
    
    if (template) {
        console.log(`✅ Template found: ${template.name}`);
        console.log(`Category: ${template.category}`);
        console.log(`Active: ${template.metadata.isActive}`);
        console.log(`Required Fields Count: ${template.requiredFields.length}`);
        console.log(`Content length: ${template.content ? template.content.length : 0}`);
        
        if (template.content && template.content.length > 100) {
            console.log("Previewing start of content:");
            console.log(template.content.substring(0, 200) + "...");
        } else {
            console.warn("⚠️ CONTENT IS EMPTY OR TOO SHORT!");
        }
    } else {
        console.error("❌ Template NOT FOUND in DB!");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking template:", error);
    process.exit(1);
  }
}

checkTemplate();
