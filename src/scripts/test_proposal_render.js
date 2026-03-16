require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { renderDocument } = require('../services/render/renderService');
const pdfService = require('../services/render/pdfService');
const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const BrandKit = require('../models/BrandKit');

async function testPDF() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mm_docs');
        console.log("Connected to DB");

        const mockData = {
            companyName: 'Green Simple Company',
            companyAddress: '123 Forest Avenue\nGreendale, CA 90210',
            companyEmail: 'hello@greensimple.com',
            companyPhone: '+1-555-0198',
            companyWebsite: 'www.greensimple.com',
            projectTitle: 'Digital Marketing Transformation Initiative',
            projectType: 'Marketing',
            projectDescription: 'The Digital Marketing Transformation Initiative aims to enhance the company’s online presence, improve customer engagement, and drive higher conversion rates through a comprehensive strategy. This project will utilize data-driven approaches, cutting-edge tools, and targeted campaigns to achieve measurable results that align with the company’s growth objectives.',
            problemStatement: '• Increase website traffic by 30% within six months.\n• Boost social media engagement rates by 25% in the next quarter.\n• Achieve a 20% improvement in lead conversion rates by the end of Q3.\n• Enhance brand visibility through SEO and content marketing strategies.',
            proposedSolution: '1. Conduct an audit of current digital assets and identify opportunities.\n2. Create a tailored digital marketing plan based on the audit findings.\n3. Implement SEO strategies, launch ad campaigns, and publish content.\n4. Track performance metrics and adjust strategies as needed.\n5. Assess project outcomes against predefined KPIs and prepare a final report.',
            targetAudience: '• SEO optimization for the company website.\n• Social media management and advertising.\n• Email marketing campaigns.\n• Content creation (blogs, videos, infographics).\n• Performance analytics and reporting.\n• Offline marketing activities.',
            keyFeatures: '• Development of new software platforms.',
            projectTimeline: 'Phase 1: Planning (June 1 - June 15)\nPhase 2: Strategy (June 16 - June 28)\nPhase 3: Execution (July 1 - Jan 31)\nPhase 4: Monitoring (Feb 1 - Feb 15)\nPhase 5: Closing (June 1)',
            projectBudget: 35000,
            teamMembers: '• Digital Marketing Team (Strategy and execution)\n• Content Creators (Develop marketing content)\n• Analytics Specialist (Monitor and report)\n• Senior Management (Approvals and guidance)\n• Finance Department (Budget allocation)',
            deliverables: '• Optimized website with improved SEO rankings.\n• Monthly social media performance reports.\n• Three high-quality content pieces per month.\n• Bi-weekly email newsletters.',
            clientName: 'Avery Davis',
            clientCompany: 'Wardiere Inc.',
            proposalDate: 'June 2030',
            specialNotes: 'Risk: Delayed content creation (Medium Likelihood, High Impact)\nMitigation: Develop content calendar'
        };

        const mockDoc = new Document({
            userId: new mongoose.Types.ObjectId(),
            title: 'Test Business Proposal',
            type: 'business-proposal-001',
            content: mockData
        });

        console.log("Rendering HTML...");
        const html = await renderDocument(mockDoc, null);

        console.log("Generating dummy PDF...");
        const pdfBuffer = await pdfService.generatePDF(html, { plan: 'pro', email: 'test@example.com' });

        const outputPath = path.join(__dirname, '../../test_business_proposal.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);
        
        console.log(`PDF saved to: ${outputPath}`);
        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
}

testPDF();
