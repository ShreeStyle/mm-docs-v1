const mongoose = require('mongoose');
const User = require('./src/models/User');
const Document = require('./src/models/Document');
const pdfService = require('./src/services/render/pdfService');

async function run() {
    await mongoose.connect('mongodb+srv://developer:test@cluster0.abcde.mongodb.net/aidocumentation?retryWrites=true&w=majority', { useNewUrlParser: true });
    
    // Just mock the HTML and PDF generation directly
    const html = `<html><body><h1>Test Print</h1></body></html>`;
    
    try {
        console.log('Testing PDF generation...');
        const result = await pdfService.generatePDF(html, null);
        console.log('Success! Buffer size:', result.length);
    } catch(err) {
        console.error('PDF Error:', err);
    }
    
    process.exit(0);
}
// wait, I don't know the DB URI so I won't use mongoose. I will just run pdfService.generatePDF directly

async function testPdf() {
    try {
        console.log('Testing PDF generation locally...');
        const html = `<html><body><h1>Test Print directly</h1></body></html>`;
        const result = await pdfService.generatePDF(html, null);
        console.log('Success! Buffer size:', result.length);
    } catch (err) {
        console.error('PDF Error:', err);
    }
}
testPdf();
