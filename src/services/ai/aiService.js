const { OPENAI_API_KEY } = require("../../config/config");
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const generateContent = async (type, topic, brandContext) => {
    console.log(`🤖 AI Generating content for: ${type} - ${topic}`);
    console.log(`🎨 Brand Context: ${JSON.stringify(brandContext)}`);

    try {
        let systemPrompt = "";
        let userPrompt = "";

        if (type === "proposal") {
            systemPrompt = `You are a professional business proposal writer. Generate a comprehensive, persuasive proposal in JSON format. The brand is "${brandContext.name}" with a ${brandContext.tone} tone.`;

            userPrompt = `Create a detailed business proposal for: "${topic}". 

Return ONLY valid JSON with this exact structure:
{
  "title": "Proposal for [topic]",
  "executiveSummary": "A compelling 2-3 sentence summary",
  "methodology": ["Phase 1: ...", "Phase 2: ...", "Phase 3: ..."],
  "pricing": [
    {"item": "Service name", "price": "$amount"},
    {"item": "Another service", "price": "$amount"}
  ],
  "conclusion": "A strong closing statement"
}`;

        } else if (type === "invoice") {
            systemPrompt = `You are a professional accountant. Generate a formal invoice in JSON format for "${brandContext.name}".`;

            userPrompt = `Create an invoice for: "${topic}".

Return ONLY valid JSON with this exact structure:
{
  "invoiceNumber": "INV-[random number]",
  "billedTo": "${topic}",
  "items": [
    {"description": "Service A", "amount": 1000},
    {"description": "Service B", "amount": 500}
  ],
  "total": 1500,
  "notes": "Thank you for your business!"
}`;

        } else if (type === "resume") {
            systemPrompt = `You are a professional resume writer. Generate a compelling resume in JSON format.`;

            userPrompt = `Create a professional resume for: "${topic}".

Return ONLY valid JSON with this exact structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1 (555) 123-4567",
  "location": "City, State",
  "summary": "A compelling 2-3 sentence professional summary",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "period": "Jan 2020 - Present",
      "responsibilities": ["Achievement 1", "Achievement 2", "Achievement 3"]
    }
  ],
  "education": [
    {"degree": "Bachelor of Science in Computer Science", "institution": "University Name", "year": "2019"}
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
}`;

        } else if (type === "marketing_brief") {
            systemPrompt = `You are a marketing strategist. Generate a comprehensive marketing brief in JSON format for "${brandContext.name}".`;

            userPrompt = `Create a marketing brief for: "${topic}".

Return ONLY valid JSON with this exact structure:
{
  "title": "Marketing Campaign: [topic]",
  "subtitle": "Strategic Marketing Plan",
  "objective": "Clear campaign objective statement",
  "audience": {
    "demographics": "Age, gender, income level, etc.",
    "psychographics": "Interests, values, lifestyle",
    "painPoints": "What problems they face"
  },
  "strategies": [
    {"channel": "Social Media", "description": "Strategy description"},
    {"channel": "Email Marketing", "description": "Strategy description"},
    {"channel": "Content Marketing", "description": "Strategy description"},
    {"channel": "Paid Advertising", "description": "Strategy description"}
  ],
  "timeline": "3 months",
  "budget": "$10,000"
}`;

        } else if (type === "quotation") {
            systemPrompt = `You are a professional sales consultant. Generate a detailed project quotation in JSON format for "${brandContext.name}".`;

            userPrompt = `Create a project quotation for: "${topic}".

Return ONLY valid JSON with this exact structure:
{
  "quoteNumber": "Q-[random number]",
  "clientName": "Client Company Name",
  "clientEmail": "client@example.com",
  "validUntil": "30 days from today",
  "projectDescription": "Brief description of the project scope",
  "items": [
    {"name": "Item 1", "description": "Description", "quantity": 1, "rate": 1000, "amount": 1000},
    {"name": "Item 2", "description": "Description", "quantity": 2, "rate": 500, "amount": 1000}
  ],
  "subtotal": 2000,
  "taxRate": 10,
  "tax": 200,
  "total": 2200,
  "terms": ["Payment due within 30 days", "50% deposit required", "Prices valid for 30 days"]
}`;

        } else {
            systemPrompt = `You are a professional content writer for "${brandContext.name}".`;
            userPrompt = `Create content about: "${topic}". Return JSON with "summary" and "details" fields.`;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(response.choices[0].message.content);
        console.log("✅ AI Generation Successful");
        return content;

    } catch (error) {
        console.error("❌ OpenAI API Error:", error.message);

        // Fallback to mock if API fails
        console.log("⚠️ Falling back to mock generation...");
        return generateMockContent(type, topic);
    }
};

// Fallback mock generation (in case API fails)
const generateMockContent = (type, topic) => {
    if (type === "proposal") {
        return {
            title: `Proposal for ${topic}`,
            executiveSummary: `This proposal outlines a strategic approach to ${topic}, tailored specifically for your needs.`,
            methodology: [
                "Phase 1: Discovery & Research",
                "Phase 2: Strategy & Design",
                "Phase 3: Implementation & Launch",
            ],
            pricing: [
                { item: "Consultation", price: "$500" },
                { item: "Development", price: "$2500" },
            ],
            conclusion: "We look forward to partnering with you on this exciting initiative.",
        };
    } else if (type === "invoice") {
        return {
            invoiceNumber: `INV-${Date.now()}`,
            billedTo: topic,
            items: [
                { description: "Service A", amount: 1000 },
                { description: "Service B", amount: 500 }
            ],
            total: 1500,
            notes: "Thank you for your business!"
        };
    } else {
        return {
            summary: `AI generated content for ${topic}.`,
            details: "This is a generic placeholder for other document types.",
        };
    }
};

module.exports = { generateContent };
