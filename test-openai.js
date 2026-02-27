const { OPENAI_API_KEY } = require("./src/config/config");
const OpenAI = require("openai");

// Check if using OpenRouter (key starts with sk-or-v1-)
const isOpenRouter = OPENAI_API_KEY && OPENAI_API_KEY.startsWith('sk-or-v1-');

console.log(`🔑 API Key: ${OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 20) + '...' : 'Not found'}`);
console.log(`🌐 Using OpenRouter: ${isOpenRouter ? 'Yes' : 'No'}`);

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
  defaultHeaders: isOpenRouter ? {
    'HTTP-Referer': 'http://localhost:5000',
    'X-Title': 'MM Docs'
  } : undefined
});

async function testAPI() {
  try {
    console.log("🧪 Testing API connection...");
    
    const response = await openai.chat.completions.create({
      model: isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'Hello, API is working!'" }
      ],
      max_tokens: 50
    });

    console.log("✅ API Test Successful!");
    console.log("📝 Response:", response.choices[0].message.content);
    
  } catch (error) {
    console.error("❌ API Test Failed!");
    console.error("❌ Error:", error.message);
    console.error("❌ Status:", error.status);
    console.error("❌ Code:", error.code);
    
    if (error.message.includes('Invalid API key') || error.message.includes('Invalid token')) {
      console.error("\n🔑 SOLUTION: Check your OpenRouter API key");
      console.error("   1. Go to https://openrouter.ai/keys");
      console.error("   2. Create a new API key");
      console.error("   3. Update your .env file with the new key");
      console.error("   4. Make sure the key starts with 'sk-or-v1-'");
    } else if (error.message.includes('insufficient_quota')) {
      console.error("\n💳 SOLUTION: Add credits to your OpenRouter account");
      console.error("   1. Go to https://openrouter.ai/credits");
      console.error("   2. Add credits to your account");
    }
  }
}

testAPI();