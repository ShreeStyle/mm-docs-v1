const mongoose = require('mongoose');
const User = require('./src/models/User');
const Document = require('./src/models/Document');
const BrandKit = require('./src/models/BrandKit');
const { generateContent } = require('./src/services/ai/aiService');

const MONGODB_URI = 'mongodb://localhost:27017/aidocumentation';

const currentYear = new Date().getFullYear();

const auditReportData = {
  companyName: "GreenEnergy Solutions Pvt. Ltd.",
  clientName: "GreenEnergy Solutions Pvt. Ltd.",
  companyAddress: "Plot 45, Tech Park, Electronic City, Bangalore - 560100, Karnataka, India",
  auditorName: "FinAudit Associates",
  auditorAddress: "Mumbai, Maharashtra, India",
  fiscalYear: `FY ${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
  auditPeriod: `April ${currentYear} - March ${currentYear + 1}`,
  auditType: "Financial & Compliance Audit",
  opinion: "Unqualified Opinion - Financial statements present a true and fair view",
  totalRevenue: "₹42,75,00,000",
  totalExpenses: "₹31,50,00,000",
  netProfit: "₹11,25,00,000",
  totalAssets: "₹85,60,00,000",
  totalLiabilities: "₹38,40,00,000",
  shareholdersEquity: "₹47,20,00,000",
  cashFlow: "Positive - ₹15,80,00,000",
  profitMargin: "26.3%",
  leadAuditor: "CA Rajesh Kumar Sharma",
  environmentalCompliance: "Full compliance with Environmental Protection Act and Green Energy Regulations"
};

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function regenerateAuditReport() {
  try {
    console.log('🔍 Finding demo user...');
    const user = await User.findOne({ email: 'demo@test.com' });
    if (!user) {
      console.error('❌ Demo user not found');
      process.exit(1);
    }
    console.log(`✅ Found user: ${user.email}`);

    console.log('🎨 Finding brand kit...');
    let brandKit = await BrandKit.findOne({ userId: user._id });
    if (!brandKit) {
      brandKit = {
        brandName: 'MM Docs',
        primaryColor: '#F97316',
        font: 'Arial',
        footerText: 'Generated with MM Docs AI • Professional Workspace'
      };
    }
    console.log(`✅ Using brand kit: ${brandKit.brandName}`);

    console.log('\n📋 Generating NEW Audit Report...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // generateContent(type, topic, brandContext, providedData, aiQuality)
    const brandContext = {
      name: brandKit.brandName,
      primaryColor: brandKit.primaryColor,
      font: brandKit.font,
      footerText: brandKit.footerText
    };
    
    const content = await generateContent(
      'audit_report',
      'Comprehensive Financial and Compliance Audit Report',
      brandContext,
      auditReportData,
      'basic'
    );

    // Delete old audit report
    console.log('🗑️  Deleting old audit report...');
    await Document.deleteMany({ 
      userId: user._id, 
      type: 'audit_report' 
    });

    // Create new document
    const document = new Document({
      userId: user._id,
      title: `${auditReportData.companyName} - Audit Report FY${auditReportData.fiscalYear}`,
      type: 'audit_report',
      content: content,
      status: 'completed'
    });

    await document.save();
    console.log(`✅ NEW Audit Report Generated!`);
    console.log(`   Document ID: ${document._id}`);
    console.log(`   Title: ${document.title}`);
    console.log(`   Type: ${document.type}`);
    console.log(`   Status: ${document.status}`);
    console.log('\n✨ Professional audit report is ready to view!');
    console.log('🌐 Open http://localhost:5173 and refresh the page\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await regenerateAuditReport();
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
