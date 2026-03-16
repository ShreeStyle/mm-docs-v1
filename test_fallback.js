const { generateContent } = require('./src/services/ai/aiService.js');
async function run() {
  // Use a fake API key to force a failure
  process.env.OPENAI_API_KEY = 'invalid';
  const result = await generateContent('business-proposal-001', 'Test Proposal', {}, { companyName: 'Test Corp' });
  console.log(Object.keys(result));
}
run();
