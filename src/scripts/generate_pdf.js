const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const productData = {
    name: "DocuFlow AI",
    subTitle: "The Intelligent Document Lifecycle Platform",
    overview: {
        whatItIs: "DocuFlow AI is an end-to-end, AI-powered document management and automation platform designed to streamline how businesses create, manage, and execute documents. It combines an intuitive, block-based editor with advanced artificial intelligence to transform static documents into dynamic, interactive assets.",
        problemSolved: "Traditional document workflows are fragmented, manual, and prone to errors. Businesses often juggle multiple tools for drafting, internal approvals, external signing, and payment collection. DocuFlow AI consolidates this entire lifecycle into a single, intelligent workspace, reducing turnaround time from days to minutes.",
        targetAudience: "Sales teams (contracts/proposals), Legal departments (agreements/compliance), HR (onboarding/policies), and Finance (invoices/billing)."
    },
    features: [
        {
            title: "AI-Powered Smart Editor",
            description: "A Canva-like, drag-and-drop interface for building documents using modular blocks. Users can create professional documents without needing advanced design or technical skills.",
            howItWorks: [
                "Select a block (Text, Image, Table, or Interactive Field).",
                "Drag it into the document canvas.",
                "Customize styling and content in real-time."
            ],
            useCase: "A sales manager drafting a custom proposal with dynamic tables for pricing."
        },
        {
            title: "Smart Fill & AI Assistance",
            description: "Leverages OpenAI technology to automatically populate document fields, draft content from simple prompts, and ensure brand consistency.",
            howItWorks: [
                "Provide a short prompt or source data.",
                "AI generates the relevant clauses or populates the agreement.",
                "Review and refine the AI-generated content."
            ],
            useCase: "Quickly generating a non-disclosure agreement (NDA) by simply providing the participant names."
        },
        {
            title: "Integrated E-Signatures",
            description: "Legally binding electronic signatures built directly into the document workflow, eliminating the need for third-party signing tools.",
            howItWorks: [
                "Add a signature field to any part of the document.",
                "Recipient receives a secure link to sign.",
                "Document is automatically locked once all parties have signed."
            ],
            useCase: "An HR lead sending an employment contract that is signed by the new hire instantly."
        },
        {
            title: "Clause Library & Brand Kit",
            description: "Maintain consistency across all documents with a centralized library of pre-approved legal clauses and a brand kit for logos and colors.",
            howItWorks: [
                "Save frequently used clauses to the library.",
                "Define brand assets like logos and primary colors.",
                "Apply brand styling to any document with a single click."
            ],
            useCase: "A legal team ensuring all contracts use the exact same indemnification clause every time."
        }
    ],
    userJourney: [
        { step: "1. Signup & Setup", detail: "Create an account and configure your Organization and Brand Kit." },
        { step: "2. Create or Choose Template", detail: "Draft a new document using the AI Editor or pick from a library of pre-built templates (Invoices, NDAs, Proposals)." },
        { step: "3. Collaborative Editing", detail: "Invite team members to collaborate, add comments, and approve versions through internal workflows." },
        { step: "4. Send for Review/Signature", detail: "Send the final document to external recipients via a secure, trackable link." },
        { step: "5. Completion & Storage", detail: "Recipients sign or pay (via Razorpay integration). The finalized document is securely stored with full audit trails." }
    ],
    functionalities: [
        { title: "Automation Logic", detail: "Rule-based triggers for approval workflows and automated notifications when a document is viewed or signed." },
        { title: "AI Capabilities", detail: "Smart summarization of complex documents and 'Document Chat' for asking natural language questions about the content." },
        { title: "Data Handling", detail: "Secure handling of sensitive document data with roles-based access control and persistent storage in MongoDB." }
    ],
    businessValue: {
        roi: "Reduces administrative overhead by up to 60%.",
        time: "Accelerates contract closing cycles from average 7 days to 2 hours.",
        effort: "Eliminates manual data entry with AI-driven smart filling."
    },
    scenarios: [
        {
            user: "Sales Executive",
            flow: "Generates a professional proposal in minutes, tracks when the client opens it, and collects both signature and initial payment in one flow."
        },
        {
            user: "Operations Manager",
            flow: "Automates monthly invoice generation for hundreds of clients using CSV data imports and automated email delivery."
        }
    ],
    technical: {
        architecture: "A modern, high-performance stack built on Node.js and React, utilizing MongoDB for scalable data storage.",
        integrations: "Fully integrated with OpenAI for intelligence, Razorpay for global payments, and Nodemailer for secure communications."
    },
    future: [
        "Dynamic CRM integrations (Salesforce, HubSpot).",
        "Blockchain-based timestamping for immutable audit logs.",
        "Advanced predictive analytics for contract renewal forecasting."
    ]
};

const generateHTML = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} Documentation</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #2d3436;
            margin: 0;
            padding: 0;
            background-color: #fff;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }

        .title-page {
            height: 90vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            border-bottom: 2px solid #f1f2f6;
            page-break-after: always;
        }

        .title-page h1 {
            font-size: 48px;
            margin-bottom: 10px;
            color: #0984e3;
        }

        .title-page h2 {
            font-size: 24px;
            font-weight: 300;
            color: #636e72;
        }

        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }

        h2 {
            font-size: 28px;
            color: #0984e3;
            border-bottom: 1px solid #dfe6e9;
            padding-bottom: 10px;
            margin-top: 50px;
        }

        h3 {
            font-size: 20px;
            color: #2d3436;
            margin-top: 25px;
        }

        .highlight {
            background-color: #f1f2f6;
            padding: 20px;
            border-left: 5px solid #0984e3;
            margin: 20px 0;
            border-radius: 4px;
        }

        .feature-grid {
            margin-top: 20px;
        }

        .feature-item {
            margin-bottom: 30px;
        }

        ul {
            padding-left: 20px;
        }

        li {
            margin-bottom: 10px;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #b2bec3;
            border-top: 1px solid #dfe6e9;
            padding-top: 20px;
        }

        .page-break {
            page-break-before: always;
        }

        .step-list {
            list-style-type: none;
            padding: 0;
        }

        .step-item {
            display: flex;
            margin-bottom: 15px;
            align-items: flex-start;
        }

        .step-number {
            background: #0984e3;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 14px;
            font-weight: bold;
            flex-shrink: 0;
            margin-right: 15px;
            margin-top: 3px;
        }

        .business-value-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }

        .value-card {
            padding: 20px;
            border: 1px solid #dfe6e9;
            border-radius: 8px;
            background: #fafafa;
        }

        .value-card h4 {
            margin: 0 0 10px 0;
            color: #0984e3;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Title Page -->
        <div class="title-page">
            <h1>${data.name}</h1>
            <h2>${data.subTitle}</h2>
            <p style="margin-top: 100px; color: #b2bec3;">Confidential Product Overview for Executive Review</p>
        </div>

        <!-- 1. Product Overview -->
        <div class="section">
            <h2>1. Product Overview</h2>
            <h3>What is ${data.name}?</h3>
            <p>${data.overview.whatItIs}</p>
            
            <h3>What problem does it solve?</h3>
            <p>${data.overview.problemSolved}</p>

            <h3>Target Audience</h3>
            <div class="highlight">
                <p><strong>Primary Users:</strong> ${data.overview.targetAudience}</p>
            </div>
        </div>

        <!-- 2. Key Features -->
        <div class="section">
            <h2>2. Key Features</h2>
            <div class="feature-grid">
                ${data.features.map(f => `
                    <div class="feature-item">
                        <h3>${f.title}</h3>
                        <p>${f.description}</p>
                        <p><strong>How it works:</strong></p>
                        <ul>
                            ${f.howItWorks.map(step => `<li>${step}</li>`).join('')}
                        </ul>
                        <p><strong>Example Use Case:</strong> ${f.useCase}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 3. User Journey -->
        <div class="section page-break">
            <h2>3. User Journey</h2>
            <div class="step-list">
                ${data.userJourney.map((j, i) => `
                    <div class="step-item">
                        <div class="step-number">${i+1}</div>
                        <div>
                            <strong>${j.step.split('. ')[1]}</strong><br>
                            ${j.detail}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 4. Core Functionalities -->
        <div class="section">
            <h2>4. Core Functionalities</h2>
            ${data.functionalities.map(func => `
                <div class="feature-item">
                    <h3>${func.title}</h3>
                    <p>${func.detail}</p>
                </div>
            `).join('')}
        </div>

        <!-- 5. Business Value -->
        <div class="section page-break">
            <h2>5. Business Value</h2>
            <p>DocuFlow AI delivers tangible value by transforming documentation from a cost center into a competitive advantage.</p>
            <div class="business-value-grid">
                <div class="value-card">
                    <h4>Return on Investment</h4>
                    <p>${data.businessValue.roi}</p>
                </div>
                <div class="value-card">
                    <h4>Time Savings</h4>
                    <p>${data.businessValue.time}</p>
                </div>
                <div class="value-card">
                    <h4>Operational Efficiency</h4>
                    <p>${data.businessValue.effort}</p>
                </div>
            </div>
        </div>

        <!-- 6. Example Scenarios -->
        <div class="section">
            <h2>6. Example Scenarios</h2>
            ${data.scenarios.map(scen => `
                <div class="highlight">
                    <p><strong>User: ${scen.user}</strong></p>
                    <p>${scen.flow}</p>
                </div>
            `).join('')}
        </div>

        <!-- 7. Technical Overview -->
        <div class="section">
            <h2>7. Technical Overview</h2>
            <h3>High-Level Architecture</h3>
            <p>${data.technical.architecture}</p>
            
            <h3>Key Integrations</h3>
            <p>${data.technical.integrations}</p>
        </div>

        <!-- 8. Future Scope -->
        <div class="section">
            <h2>8. Future Scope</h2>
            <ul>
                ${data.future.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>

        <div class="footer">
            <p>&copy; 2026 DocuFlow AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

async function generatePDF() {
    console.log('Starting PDF generation...');
    const html = generateHTML(productData);
    
    // Use a temporary file to store the HTML
    const tempHtmlFile = path.join(__dirname, 'temp_doc.html');
    fs.writeFileSync(tempHtmlFile, html);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Load the local HTML file
    await page.goto(`file://${tempHtmlFile}`, { waitUntil: 'networkidle0' });

    const outputPath = path.join(process.cwd(), 'DocuFlow_AI_Product_Documentation.pdf');
    
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20px',
            bottom: '20px',
            right: '20px',
            left: '20px'
        }
    });

    await browser.close();
    
    // Clean up temporary HTML file
    fs.unlinkSync(tempHtmlFile);
    
    console.log(`PDF successfully generated at: ${outputPath}`);
    return outputPath;
}

generatePDF().catch(err => {
    console.error('Error generating PDF:', err);
    process.exit(1);
});
