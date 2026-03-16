require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mm_docs')
.then(async () => {
    console.log("Connected to MongoDB");
    const Template = require('../models/Template');
    const content = await fs.promises.readFile(path.join(__dirname, '../templates/proposal.hbs'), 'utf8');
    
    await Template.updateOne(
        { templateId: 'business-proposal-001' },
        { $set: { content: content } }
    );
    console.log("Updated business-proposal-001 content from proposal.hbs");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
