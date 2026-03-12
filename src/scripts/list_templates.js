require("dotenv").config();
const mongoose = require("mongoose");
const Template = require("../models/Template");

async function listTemplates() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    const templates = await Template.find({}, 'templateId name');
    console.log("Templates in DB:");
    templates.forEach(t => console.log(`- ${t.templateId}: ${t.name}`));
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

listTemplates();
