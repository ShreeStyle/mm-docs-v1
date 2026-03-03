const mongoose = require('mongoose');
const Document = require('./src/models/Document');
const connectDB = require('./src/config/db');
require('dotenv').config();

async function testAuditStructure() {
    try {
        // Connect to MongoDB using existing config
        await connectDB();
        console.log('Connected to MongoDB');

        // Find the most recent audit_report document
        const auditDoc = await Document.findOne({ type: 'audit_report' }).sort({ createdAt: -1 });
        
        if (!auditDoc) {
            console.log('No audit report found in database');
            mongoose.connection.close();
            return;
        }

        console.log('\n=== AUDIT DOCUMENT ANALYSIS ===\n');
        console.log('Document ID:', auditDoc._id);
        console.log('Document Type:', auditDoc.type);
        console.log('Title:', auditDoc.title);
        console.log('\n=== CONTENT STRUCTURE ===\n');
        console.log('Content type:', typeof auditDoc.content);
        console.log('Content keys:', Object.keys(auditDoc.content));
        
        if (auditDoc.content.auditFindings) {
            console.log('\n=== AUDIT FINDINGS ===\n');
            console.log('auditFindings type:', typeof auditDoc.content.auditFindings);
            console.log('auditFindings is Array?:', Array.isArray(auditDoc.content.auditFindings));
            
            if (typeof auditDoc.content.auditFindings === 'string') {
                console.log('⚠️  WARNING: auditFindings is a STRING, not an array!');
                console.log('String content:', auditDoc.content.auditFindings.substring(0, 200));
            } else if (Array.isArray(auditDoc.content.auditFindings)) {
                console.log('✓ auditFindings is properly stored as an array');
                console.log('Number of findings:', auditDoc.content.auditFindings.length);
                console.log('First finding:', JSON.stringify(auditDoc.content.auditFindings[0], null, 2));
            } else {
                console.log('auditFindings value:', auditDoc.content.auditFindings);
            }
        } else {
            console.log('\n⚠️  No auditFindings property in content');
        }

        if (auditDoc.content.executiveSummary) {
            console.log('\n=== EXECUTIVE SUMMARY ===\n');
            console.log('executiveSummary type:', typeof auditDoc.content.executiveSummary);
            
            if (auditDoc.content.executiveSummary.keyFindings) {
                console.log('keyFindings type:', typeof auditDoc.content.executiveSummary.keyFindings);
                console.log('keyFindings is Array?:', Array.isArray(auditDoc.content.executiveSummary.keyFindings));
                
                if (typeof auditDoc.content.executiveSummary.keyFindings === 'string') {
                    console.log('⚠️  WARNING: keyFindings is a STRING, not an array!');
                } else if (Array.isArray(auditDoc.content.executiveSummary.keyFindings)) {
                    console.log('✓ keyFindings is properly stored as an array');
                    console.log('Number of key findings:', auditDoc.content.executiveSummary.keyFindings.length);
                    console.log('Key findings:', JSON.stringify(auditDoc.content.executiveSummary.keyFindings, null, 2));
                }
            } else {
                console.log('No keyFindings in executiveSummary');
            }
        } else {
            console.log('\n⚠️  No executiveSummary property in content');
        }

        console.log('\n=== FULL CONTENT (first 500 chars) ===\n');
        console.log(JSON.stringify(auditDoc.content, null, 2).substring(0, 500));

        mongoose.connection.close();
        console.log('\n✓ Test complete');

    } catch (error) {
        console.error('Error:', error);
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close();
        }
    }
}

testAuditStructure();
