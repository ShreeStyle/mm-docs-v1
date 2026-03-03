const mongoose = require('mongoose');
const Document = require('./src/models/Document');
const connectDB = require('./src/config/db');
require('dotenv').config();

async function checkRegulatoryDoc() {
    try {
        await connectDB();
        const doc = await Document.findOne({ title: /Regulatory Filing.*Kusan/ }).sort({ createdAt: -1 });
        if (doc) {
            console.log('Document Type:', doc.type);
            console.log('Content Keys:', Object.keys(doc.content));
            console.log('Has sections?:', !!doc.content.sections);
            console.log('Has filingDetails?:', !!doc.content.filingDetails);
        } else {
            console.log('Document not found');
        }
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
        mongoose.connection.close();
    }
}
checkRegulatoryDoc();
