const mongoose = require('mongoose');
require('dotenv').config();
const aiService = require('./src/services/ai/aiService');

// Test the professional appreciation generation
async function testAppreciationGeneration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doc-automation');
    console.log('✅ Connected to MongoDB\n');

    // Test data matching Sanskruti's input
    const testData = {
      employeeName: 'Sanskruti',
      position: 'UI/UX Designer',
      department: 'Design',
      joiningDate: '2023-01-15',
      relievingDate: '2026-02-28',
      workDescription: `WORK PERFORMANCE & CONDUCT
During the tenure of employment, Sanskruti demonstrated exceptional professionalism,
dedication, and competence. Hi, my name is Sanskruti, and I'm a passionate UI/UX Designer
who focuses on creating clean, user-centered, and visually engaging digital experiences. I
believe good design is not just about how it looks, but how it works. I enjoy understanding user
behavior, solving real problems through intuitive interfaces, and turning complex ideas into
simple, functional designs. From wireframes and prototypes to high-fidelity designs, I aim to
create experiences that are both aesthetically pleasing and easy to use. I'm always eager to
learn, explore new design trends, and improve my skills to deliver impactful and meaningful
products.
Consistently exceeded performance targets and objectives
Demonstrated strong leadership and collaborative skills
Contributed significantly to departmental and organizational`,
      companyName: 'TechCorp Solutions'
    };

    console.log('📝 Testing Experience Certificate with Sanskruti\'s data...\n');
    console.log('Raw Input (Work Description):');
    console.log('─────────────────────────────────────────────────────────');
    console.log(testData.workDescription);
    console.log('─────────────────────────────────────────────────────────\n');

    // Generate the experience certificate
    const result = await aiService.generateContent(
      'experience_certificate',
      'Experience Certificate for Sanskruti',
      null, // brandContext
      testData,
      'standard'
    );

    console.log('✅ Generated Professional Appreciation:\n');
    console.log('─────────────────────────────────────────────────────────');
    console.log(result.workDescription);
    console.log('─────────────────────────────────────────────────────────\n');

    console.log('📄 Full Certificate Data:');
    console.log(JSON.stringify(result, null, 2));

    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testAppreciationGeneration();
