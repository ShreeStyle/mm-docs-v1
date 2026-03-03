const mongoose = require('mongoose');
const Document = require('./src/models/Document');
const BrandKit = require('./src/models/BrandKit');
const renderService = require('./src/services/render/renderService');
const fs = require('fs');
const connectDB = require('./src/config/db');
require('dotenv').config();

async function testRenderAudit() {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB\n');

        // Find the most recent audit_report document
        const auditDoc = await Document.findOne({ type: 'audit_report' }).sort({ createdAt: -1 });
        
        if (!auditDoc) {
            console.log('❌ No audit report found in database');
            mongoose.connection.close();
            return;
        }

        console.log('📄 Found audit report:', auditDoc.title);
        console.log('📅 Created:', auditDoc.createdAt);
        console.log('\n🔍 Analyzing content structure:');
        console.log('  - auditFindings:', Array.isArray(auditDoc.content.auditFindings) ? `Array[${auditDoc.content.auditFindings.length}]` : typeof auditDoc.content.auditFindings);
        console.log('  - executiveSummary.keyFindings:', Array.isArray(auditDoc.content.executiveSummary?.keyFindings) ? `Array[${auditDoc.content.executiveSummary.keyFindings.length}]` : typeof auditDoc.content.executiveSummary?.keyFindings);

        // Get user's brand kit
        const brandKit = await BrandKit.findOne({ userId: auditDoc.userId });
        console.log('🎨 Brand kit:', brandKit ? 'Found' : 'Not found');

        console.log('\n🎨 Rendering document...\n');
        
        // Render the document
        const html = await renderService.renderDocument(auditDoc, brandKit);

        // Save to file
        const outputPath = './test-audit-output.html';
        fs.writeFileSync(outputPath, html);
        console.log(`✅ Rendered HTML saved to: ${outputPath}`);
        console.log(`📏 HTML length: ${html.length} characters\n`);

        // Check for JSON strings in the output (indicator of the problem)
        const hasJsonStrings = html.includes('{"category"') || html.includes('[{"');
        if (hasJsonStrings) {
            console.log('⚠️  WARNING: Found JSON strings in rendered HTML!');
            
            // Find and show the problematic sections
            const jsonMatch = html.match(/\{"category"[^<]{0,200}/);
            if (jsonMatch) {
                console.log('🔍 Sample of problematic content:', jsonMatch[0]);
            }
        } else {
            console.log('✅ No JSON strings found - rendering appears correct');
        }

        // Check if audit findings section exists
        if (html.includes('Audit Findings')) {
            console.log('✅ "Audit Findings" section found in HTML');
            
            // Extract a sample of the findings section
            const findingsStart = html.indexOf('Audit Findings');
            const findingsSample = html.substring(findingsStart, findingsStart + 500);
            console.log('\n📋 Sample of Audit Findings section:');
            console.log(findingsSample.replace(/<[^>]+>/g, ' ').substring(0, 300).trim());
        }

        console.log('\n✅ Test complete!');
        console.log(`💡 Open ${outputPath} in your browser to view the rendered document`);

        mongoose.connection.close();

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close();
        }
    }
}

testRenderAudit();
