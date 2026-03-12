require("dotenv").config();
const mongoose = require("mongoose");
const Template = require("../models/Template");

async function inspectTemplate() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    const template = await Template.findOne({ templateId: 'appointment-letter-001' });
    console.log(JSON.stringify(template.requiredFields, null, 2));
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

inspectTemplate();
