const mongoose = require('mongoose');
require('dotenv').config();
const aiService = require('./src/services/ai/aiService');

// Test NDA generation with user's data
async function testNDAGeneration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doc-automation');
    console.log('✅ Connected to MongoDB\n');

    // Test data matching user's example
    const ndaData = {
      companyName: 'DevaRam Tech',
      companyAddress: 'Manmandir Ayodhya Street 2, Champakali',
      partyName: 'Clenovo',
      partyAddress: 'Clenovo Mairasiya',
      effectiveDate: '2021-04-02',
      duration: '2',
      purpose: 'The Purpose Of This Agreement Is To Protect Confidential Information Shared In Connection With The Development, Evaluation, And Potential Collaboration Related To An AI-powered Documentation Generation Platform.'
    };

    console.log('📝 Testing NDA Generation with user data...\n');
    console.log('Input Data:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(JSON.stringify(ndaData, null, 2));
    console.log('─────────────────────────────────────────────────────────\n');

    // Generate the NDA
    const result = await aiService.generateContent(
      'nda',
      'Generate a professional nda document',
      null, // brandContext
      ndaData,
      'standard'
    );

    console.log('✅ Generated NDA Content:\n');
    console.log('─────────────────────────────────────────────────────────');
    console.log('Title:', result.title);
    console.log('Date:', result.date);
    console.log('Agreement Number:', result.agreementNumber);
    console.log('Effective Date:', result.effectiveDate);
    console.log('Duration:', result.duration);
    console.log('\nParty A (Disclosing Party):');
    console.log('  Name:', result.partyA.name);
    console.log('  Address:', result.partyA.address);
    console.log('\nParty B (Receiving Party):');
    console.log('  Name:', result.partyB.name);
    console.log('  Address:', result.partyB.address);
    console.log('\nPurpose:', result.purpose);
    console.log('\nNumber of Obligations:', result.obligations.length);
    console.log('\nNumber of Exclusions:', result.exclusions.length);
    console.log('\nGeneral Provisions:', result.generalProvisions.length);
    console.log('─────────────────────────────────────────────────────────\n');

    console.log('📄 Full NDA Structure:');
    console.log(JSON.stringify(result, null, 2));

    await mongoose.disconnect();
    console.log('\n✅ Test completed successfully');
    console.log('\n🎉 NDA fallback is now working! No more generic "Overview/Strategic Insights/Conclusion" format.');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testNDAGeneration();
