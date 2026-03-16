require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const templateController = require('../controllers/templateController');

// Mock req and res
const req = {};
const res = {
    json: (data) => {
        console.log("Init Templates Result:", data);
        process.exit(0);
    },
    status: (code) => {
        console.log("Status:", code);
        return { json: (data) => { console.log(data); process.exit(0); } };
    }
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mm_docs')
.then(async () => {
    console.log("Connected to MongoDB for proposal init.");
    
    // Check if business-proposal-001 exists
    const Template = require('../models/Template');
    const existing = await Template.findOne({ templateId: 'business-proposal-001' });
    if(existing) {
        console.log("Proposal template already exists. Deleting it to re-initialize layout and fields...");
        await Template.deleteOne({ templateId: 'business-proposal-001' });
    }
    
    // Check if `proposal` exists (the old generic one)
    const oldProposal = await Template.findOne({ templateId: 'proposal' });
    if (oldProposal) {
        console.log("Old generic proposal template found. Deleting...");
        await Template.deleteOne({ templateId: 'proposal' });
    }
    
    // We actually just want to re-run the initialization step entirely in case a user needs it
    console.log("Running initializeTemplates to add the new Business Proposal template.");
    await templateController.initializeTemplates(req, res);
    
}).catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
});
