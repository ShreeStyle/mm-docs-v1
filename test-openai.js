require("dotenv").config();
const { OPENAI_API_KEY } = require("./src/config/config");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function testGeneration() {
    let systemPrompt = `You are MM Docs, an elite AI Business Document SaaS by MediaaMasala... Return ONLY valid JSON.`;
    let userPrompt = `Write a deeply persuasive, highly professional, and robust B2B Sales Email for: "Target Audience: Marketing...".
Return ONLY valid JSON with this exact structure:
{
  "subject": "A compelling, thought-provoking, and highly professional subject line",
  "greeting": "Hello [Name],",
  "opening": "A highly customized... paragraph.",
  "valueProposition": "A robust, detailed paragraph...",
  "keyBenefits": [
    "Benefit 1...",
    "Benefit 2..."
  ],
  "callToAction": "A professional... request...",
  "signOff": "Warm regards,\\nMM Docs"
}`;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });
        console.log("Success:", response.choices[0].message.content);
    } catch (err) {
        console.error("Error:", err);
    }
}
testGeneration();
