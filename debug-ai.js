const { generateContent } = require("./src/services/ai/aiService");

async function testAI() {
  try {
    console.log("🧪 Testing AI service directly...");
    
    const brandContext = { name: "Test Company", tone: "Professional" };
    const result = await generateContent("quotation", "Test quotation", brandContext);
    
    console.log("✅ AI service test successful!");
    console.log("Result:", JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error("❌ AI service test failed:");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

testAI();