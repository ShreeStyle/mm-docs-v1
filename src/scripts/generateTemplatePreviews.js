const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Template HTML designs with professional styling
const templateDesigns = {
    'Letter of Recommendation': `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    padding: 60px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                }
                .container {
                    background: white;
                    padding: 50px;
                    border-radius: 15px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                .header {
                    text-align: center;
                    border-bottom: 4px solid #667eea;
                    padding-bottom: 25px;
                    margin-bottom: 40px;
                }
                .logo {
                    width: 80px;
                    height: 80px;
                    background: #667eea;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 36px;
                    font-weight: bold;
                }
                h1 {
                    color: #667eea;
                    font-size: 32px;
                    margin: 0 0 10px 0;
                    font-weight: 700;
                }
                .subtitle {
                    color: #666;
                    font-size: 16px;
                    margin: 0;
                }
                .content {
                    margin: 30px 0;
                    line-height: 1.8;
                    color: #333;
                }
                .date {
                    color: #999;
                    margin-bottom: 30px;
                    font-size: 14px;
                }
                .section {
                    margin: 25px 0;
                }
                .section-title {
                    color: #667eea;
                    font-weight: 600;
                    margin-bottom: 10px;
                    font-size: 18px;
                }
                .highlight {
                    background: #f8f9ff;
                    padding: 20px;
                    border-left: 4px solid #667eea;
                    margin: 20px 0;
                    border-radius: 5px;
                }
                .signature {
                    margin-top: 50px;
                    padding-top: 30px;
                    border-top: 2px solid #eee;
                }
                .footer {
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">📄</div>
                    <h1>Letter of Recommendation</h1>
                    <p class="subtitle">Professional Reference Letter Template</p>
                </div>
                <div class="date">March 5, 2026</div>
                <div class="content">
                    <p>To Whom It May Concern,</p>
                    
                    <div class="section">
                        <p>It is with great pleasure that I write this letter of recommendation for <strong>[Candidate Name]</strong> who worked under my supervision as <strong>[Position]</strong> at <strong>[Company Name]</strong> from <strong>[Start Date]</strong> to <strong>[End Date]</strong>.</p>
                    </div>

                    <div class="highlight">
                        <div class="section-title">Professional Excellence</div>
                        <p>During their tenure, [Candidate Name] consistently demonstrated exceptional skills in [Key Skills]. They successfully led [Major Achievement] and contributed significantly to [Business Impact].</p>
                    </div>

                    <div class="section">
                        <div class="section-title">Key Strengths</div>
                        <ul style="margin: 10px 0; padding-left: 25px; line-height: 1.8;">
                            <li>Outstanding technical expertise and problem-solving abilities</li>
                            <li>Excellent communication and teamwork skills</li>
                            <li>Strong leadership and mentoring capabilities</li>
                            <li>Consistent dedication to quality and excellence</li>
                        </ul>
                    </div>

                    <div class="section">
                        <p>I have no hesitation in recommending [Candidate Name] for any position they may seek. They would be an invaluable asset to any organization.</p>
                    </div>
                </div>

                <div class="signature">
                    <p style="margin: 0;"><strong>[Your Name]</strong></p>
                    <p style="margin: 5px 0; color: #666;">[Your Title]</p>
                    <p style="margin: 5px 0; color: #666;">[Company Name]</p>
                    <p style="margin: 5px 0; color: #666;">[Contact Email] | [Phone Number]</p>
                </div>

                <div class="footer">
                    <p>Generated with MM Docs AI - Professional Document Platform</p>
                </div>
            </div>
        </body>
        </html>
    `,
    
    'Offer Letter': `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    padding: 60px;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    margin: 0;
                }
                .container {
                    background: white;
                    padding: 50px;
                    border-radius: 15px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                .header {
                    text-align: center;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    padding: 30px;
                    border-radius: 10px;
                    margin-bottom: 40px;
                }
                .logo {
                    font-size: 48px;
                    margin-bottom: 15px;
                }
                h1 {
                    font-size: 36px;
                    margin: 0 0 10px 0;
                    font-weight: 700;
                }
                .subtitle {
                    font-size: 16px;
                    margin: 0;
                    opacity: 0.9;
                }
                .content {
                    margin: 30px 0;
                    line-height: 1.8;
                    color: #333;
                }
                .info-box {
                    background: #fff5f5;
                    border: 2px solid #f5576c;
                    border-radius: 10px;
                    padding: 25px;
                    margin: 25px 0;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 12px 0;
                    padding: 10px 0;
                    border-bottom: 1px solid #ffe0e0;
                }
                .info-row:last-child {
                    border-bottom: none;
                }
                .label {
                    font-weight: 600;
                    color: #f5576c;
                }
                .value {
                    color: #333;
                    font-weight: 500;
                }
                .benefits {
                    background: #f8f9ff;
                    padding: 25px;
                    border-radius: 10px;
                    margin: 25px 0;
                }
                .benefit-item {
                    padding: 10px 0;
                    border-left: 4px solid #f093fb;
                    padding-left: 15px;
                    margin: 15px 0;
                }
                .footer {
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🎉</div>
                    <h1>Employment Offer Letter</h1>
                    <p class="subtitle">Welcome to Our Team!</p>
                </div>

                <div class="content">
                    <p>Dear <strong>[Candidate Name]</strong>,</p>
                    
                    <p>We are thrilled to offer you the position of <strong>[Position Title]</strong> at <strong>[Company Name]</strong>. Your skills and experience impressed us greatly during the interview process.</p>

                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #f5576c;">Position Details</h3>
                        <div class="info-row">
                            <span class="label">Position:</span>
                            <span class="value">[Position Title]</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Department:</span>
                            <span class="value">[Department Name]</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Start Date:</span>
                            <span class="value">[Start Date]</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Annual Salary:</span>
                            <span class="value">$[Salary]</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Work Location:</span>
                            <span class="value">[Location]</span>
                        </div>
                    </div>

                    <div class="benefits">
                        <h3 style="margin-top: 0; color: #667eea;">Benefits & Perks</h3>
                        <div class="benefit-item">✨ Comprehensive health, dental, and vision insurance</div>
                        <div class="benefit-item">💰 401(k) with company matching</div>
                        <div class="benefit-item">🏖️ Generous PTO and flexible work arrangements</div>
                        <div class="benefit-item">📚 Professional development budget</div>
                        <div class="benefit-item">🎯 Performance-based bonuses</div>
                    </div>

                    <p>We look forward to welcoming you to our team and are confident you will make significant contributions to our success.</p>

                    <p style="margin-top: 40px;"><strong>Please confirm your acceptance by [Acceptance Deadline].</strong></p>
                </div>

                <div class="footer">
                    <p>Generated with MM Docs AI - Professional Document Platform</p>
                </div>
            </div>
        </body>
        </html>
    `,

    'Invoice': `
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    padding: 60px;
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    margin: 0;
                }
                .container {
                    background: white;
                    padding: 50px;
                    border-radius: 15px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 3px solid #4facfe;
                    padding-bottom: 25px;
                    margin-bottom: 40px;
                }
                .company-info {
                    flex: 1;
                }
                .company-logo {
                    width: 70px;
                    height: 70px;
                    background: #4facfe;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                }
                h1 {
                    font-size: 48px;
                    margin: 0;
                    color: #4facfe;
                    font-weight: 700;
                }
                .invoice-details {
                    background: #f0f9ff;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 25px 0;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 30px 0;
                }
                th {
                    background: #4facfe;
                    color: white;
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                }
                td {
                    padding: 15px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .total-section {
                    background: #f0f9ff;
                    padding: 25px;
                    border-radius: 10px;
                    margin-top: 30px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    font-size: 18px;
                }
                .grand-total {
                    font-size: 24px;
                    font-weight: 700;
                    color: #4facfe;
                    padding-top: 15px;
                    border-top: 2px solid #4facfe;
                    margin-top: 15px;
                }
                .footer {
                    text-align: center;
                    color: #999;
                    font-size: 12px;
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="company-info">
                        <div class="company-logo">📧</div>
                        <h2 style="margin: 15px 0 5px 0; font-size: 24px;">[Company Name]</h2>
                        <p style="margin: 0; color: #666; font-size: 14px;">[Company Address]</p>
                    </div>
                    <div>
                        <h1>INVOICE</h1>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                    <div>
                        <h3 style="margin: 0 0 10px 0; color: #333;">Bill To:</h3>
                        <p style="margin: 0; line-height: 1.6;">
                            <strong>[Client Name]</strong><br>
                            [Client Address]<br>
                            [Client City, State ZIP]
                        </p>
                    </div>
                    <div class="invoice-details">
                        <div class="detail-row">
                            <span style="font-weight: 600;">Invoice #:</span>
                            <span>INV-2026-001</span>
                        </div>
                        <div class="detail-row">
                            <span style="font-weight: 600;">Date:</span>
                            <span>March 5, 2026</span>
                        </div>
                        <div class="detail-row">
                            <span style="font-weight: 600;">Due Date:</span>
                            <span>April 5, 2026</span>
                        </div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Rate</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Professional Services</td>
                            <td style="text-align: center;">10</td>
                            <td style="text-align: right;">$150.00</td>
                            <td style="text-align: right;">$1,500.00</td>
                        </tr>
                        <tr>
                            <td>Consulting Hours</td>
                            <td style="text-align: center;">20</td>
                            <td style="text-align: right;">$200.00</td>
                            <td style="text-align: right;">$4,000.00</td>
                        </tr>
                        <tr>
                            <td>Software License</td>
                            <td style="text-align: center;">1</td>
                            <td style="text-align: right;">$1,000.00</td>
                            <td style="text-align: right;">$1,000.00</td>
                        </tr>
                    </tbody>
                </table>

                <div class="total-section">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>$6,500.00</span>
                    </div>
                    <div class="total-row">
                        <span>Tax (0%):</span>
                        <span>$0.00</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Total Due:</span>
                        <span>$6,500.00</span>
                    </div>
                </div>

                <div style="margin-top: 40px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 5px;">
                    <p style="margin: 0; color: #92400e;"><strong>Payment Terms:</strong> Net 30 days. Late payments subject to 1.5% monthly interest.</p>
                </div>

                <div class="footer">
                    <p>Generated with MM Docs AI - Professional Document Platform</p>
                    <p>Thank you for your business!</p>
                </div>
            </div>
        </body>
        </html>
    `
};

async function generateTemplatePreviews() {
    console.log('🎨 Starting template preview generation...');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const outputDir = path.join(__dirname, '../../uploads/template-previews');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
        for (const [templateName, htmlContent] of Object.entries(templateDesigns)) {
            console.log(`\n📄 Generating: ${templateName}`);
            
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            
            // Generate filename
            const filename = templateName.toLowerCase().replace(/\s+/g, '-') + '-preview.pdf';
            const filepath = path.join(outputDir, filename);
            
            // Generate PDF
            await page.pdf({
                path: filepath,
                format: 'A4',
                margin: {
                    top: '0',
                    right: '0',
                    bottom: '0',
                    left: '0'
                },
                printBackground: true
            });
            
            console.log(`✅ Generated: ${filename}`);
            await page.close();
        }
        
        console.log('\n✨ All template previews generated successfully!');
        console.log(`📁 Location: ${outputDir}`);
        
    } catch (error) {
        console.error('❌ Error generating previews:', error);
    } finally {
        await browser.close();
    }
}

// Run if called directly
if (require.main === module) {
    generateTemplatePreviews()
        .then(() => {
            console.log('\n🎉 Preview generation complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { generateTemplatePreviews };
