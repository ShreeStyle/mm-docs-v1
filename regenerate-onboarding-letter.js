const mongoose = require('mongoose');
const User = require('./src/models/User');
const Document = require('./src/models/Document');
const BrandKit = require('./src/models/BrandKit');
const { generateContent } = require('./src/services/ai/aiService');

const MONGODB_URI = 'mongodb://localhost:27017/aidocumentation';

const onboardingData = {
  companyName: "APDM Pharmaceuticals Pvt. Ltd.",
  companyAddress: "7th Floor, 403, Patron, Rajpath Rangoli Rd, Opp. Kensvilla Golf Academy, PRL Colony, Bodakdev, Ahmedabad, Gujarat 380059",
  companyEmail: "hr@apdmpharma.com",
  companyPhone: "+91-79-4890-2345",
  employeeName: "Neha Patel",
  candidateName: "Neha Patel",
  position: "Quality Assurance Manager",
  department: "Quality Control & Regulatory Affairs",
  startDate: "March 15, 2026",
  joiningDate: "March 15, 2026",
  reportingTo: "Dr. Amit Desai",
  reportingManagerTitle: "Head of Quality Control",
  hrContactPerson: "Priya Sharma",
  hrEmail: "priya.sharma@apdmpharma.com",
  hrPhone: "+91-79-4890-2301",
  reportingTime: "9:30 AM",
  reportingLocation: "7th Floor Reception, Patron Building",
  dresscode: "Business Formal",
  workingHours: "Monday to Saturday, 9:30 AM - 6:30 PM",
  managerEmail: "amit.desai@apdmpharma.com",
  managerPhone: "+91-79-4890-2310"
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

async function regenerateOnboardingLetter() {
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

    console.log('\n📋 Generating NEW Onboarding Letter...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // generateContent(type, topic, brandContext, providedData, aiQuality)
    const brandContext = {
      name: brandKit.brandName,
      primaryColor: brandKit.primaryColor,
      font: brandKit.font,
      footerText: brandKit.footerText
    };
    
    const content = await generateContent(
      'onboarding_letter',
      'Professional Employee Onboarding Welcome Letter',
      brandContext,
      onboardingData,
      'basic'
    );

    // Delete old onboarding letter
    console.log('🗑️  Deleting old onboarding letter...');
    await Document.deleteMany({ 
      userId: user._id, 
      type: 'onboarding_letter' 
    });

    // Create new document
    const document = new Document({
      userId: user._id,
      title: `Onboarding Letter - ${onboardingData.companyName}`,
      type: 'onboarding_letter',
      content: content,
      status: 'completed'
    });

    await document.save();
    console.log(`✅ NEW Onboarding Letter Generated!`);
    console.log(`   Document ID: ${document._id}`);
    console.log(`   Title: ${document.title}`);
    console.log(`   Type: ${document.type}`);
    console.log(`   Employee: ${onboardingData.employeeName}`);
    console.log(`   Position: ${onboardingData.position}`);
    console.log(`   Start Date: ${onboardingData.startDate}`);
    console.log('\n✨ Professional onboarding letter is ready to view!');
    console.log('🌐 Open http://localhost:5173 and refresh the page\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function main() {
  try {
    await connectDB();
    await regenerateOnboardingLetter();
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
