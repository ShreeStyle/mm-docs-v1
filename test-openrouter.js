const OpenAI = require("openai");

const OPENAI_API_KEY = "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";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5000',
    'X-Title': 'MM Docs'
  }
});

async function testOpenRouter() {
  try {
    console.log("🧪 Testing OpenRouter API connection...");
    
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant. Respond with valid JSON only." },
        { role: "user", content: "Generate a simple test response in JSON format with a 'message' field." }
      ],
      temperature: 0.7,
      max_tokens: 100,
      response_format: { type: "json_object" }
    });

    console.log("✅ OpenRouter API test successful!");
    console.log("Response:", response.choices[0].message.content);
    
  } catch (error) {
    console.error("❌ OpenRouter API test failed:");
    console.error("Error:", error.message);
    console.error("Status:", error.status);
    console.error("Code:", error.code);
  }
}

testOpenRouter();