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

    // Detect specific document type from topic if type is generic
    let effectiveType = type.toLowerCase();
    if (["ask", "research", "build", "other"].includes(effectiveType)) {
      const topicLower = topic.toLowerCase();
      if (topicLower.includes("resume") || topicLower.includes("cv")) effectiveType = "resume";
      else if (topicLower.includes("proposal") || topicLower.includes("pitch")) effectiveType = "proposal";
      else if (topicLower.includes("invoice") || topicLower.includes("bill")) effectiveType = "invoice";
      else if (topicLower.includes("marketing brief") || topicLower.includes("campaign")) effectiveType = "marketing_brief";
      else if (topicLower.includes("quotation") || topicLower.includes("estimate") || topicLower.includes("quote")) effectiveType = "quotation";
      else if (topicLower.includes("profile") || topicLower.includes("about us")) effectiveType = "profile";
    }

    if (effectiveType === "proposal") {
      systemPrompt = `You are an elite business strategist and professional proposal writer.
Generate a high-stakes, persuasive project proposal for "${brandContext.name}".
The tone should be ${brandContext.tone || "Professional, confident, and authoritative"}.
Use sophisticated business language, high-impact terminology, and clear value propositions.`;

      userPrompt = `Create a detailed, multi-section proposal for: "${topic}".
Include sections for Executive Summary, Project Objectives, Detailed Methodology (3 phases), Resource Requirements, Success Metrics, Pricing, and a Formal Conclusion.

Return ONLY valid JSON with this structure:
{
  "title": "Strategic Proposal: [Full Topic Name]",
  "executiveSummary": "A compelling, vision-led summary (150-200 words)",
  "objectives": ["Primary Goal...", "Secondary Goal...", "Key Outcome..."],
  "methodology": [
    { "phase": "I: Strategic Discovery", "details": "Comprehensive research and stakeholder alignment..." },
    { "phase": "II: Execution Framework", "details": "Phased implementation with agile feedback loops..." },
    { "phase": "III: Optimization & Review", "details": "Final delivery, training, and outcome measurement..." }
  ],
  "investment": [
    {"service": "Core Development & Strategy", "amount": "₹X,XXX", "justification": "High-level architectural design..."},
    {"service": "Integration & Quality Assurance", "amount": "₹X,XXX", "justification": "Full-cycle testing and system syncing..."}
  ],
  "conclusion": "A visionary closing statement linking the project to long-term success."
}`;

    } else if (effectiveType === "resume") {
      systemPrompt = `You are a top-tier executive career coach and professional resume writer.
Generate an outstanding, results-oriented resume for an individual specialized in "${topic}".
The content must be professional, punchy, and use powerful action verbs (e.g., Pioneered, Orchestrated, Optimized).`;

      userPrompt = `Create a comprehensive professional resume based on: "${topic}".
Synthesize industry-standard responsibilities, technical skills, and plausible high-impact achievements for this role.

Return ONLY valid JSON with this structure:
{
  "personalInfo": { "name": "[Professional Name Placeholder]", "title": "[Target Job Title]", "contact": "professional.contact@email.com" },
  "professionalSummary": "A punchy, 3-sentence summary highlighting core expertise and unique value.",
  "experience": [
    {
      "role": "Senior [Role Title]",
      "company": "Market Leader Inc.",
      "period": "2020 - Present",
      "impact": ["Quantifiable achievement 1 (e.g. Increased revenue by 25%)", "Leadership achievement...", "Innovation achievement..."]
    },
    {
      "role": "[Previous Role]",
      "company": "Innovations Group",
      "period": "2017 - 2020",
      "impact": ["Technical contribution...", "Efficiency improvement...", "Strategic project lead..."]
    }
  ],
  "coreCompetencies": ["Strategy & Execution", "Team Leadership", "Industry-Specific Skill...", "Advanced Technology..."],
  "education": [{"degree": "Advanced Professional Degree", "institution": "Prestige Institute", "year": "2016"}]
}`;

    } else if (effectiveType === "marketing_brief") {
      systemPrompt = `You are a world-class Marketing Director and Brand Strategist.
Generate a data-driven, creative marketing brief for "${brandContext.name}".
Use modern marketing terminology (ROI, CTR, Persona Mapping, Omnichannel).`;

      userPrompt = `Develop a comprehensive marketing brief for: "${topic}".
Analyze target demographics, psychographics, competitive landscape, and multi-channel strategies.

Return ONLY valid JSON with this structure:
{
  "campaignTitle": "Campaign: [Creative Title]",
  "strategicOverview": "Brief explanation of why this campaign is needed now.",
  "targetAudience": {
    "persona": "Primary User Profile Name",
    "insights": "Detailed belief/behavior that will be leveraged",
    "demographics": "Age, Geo, Income bucket"
  },
  "keyMessaging": ["Core Claim...", "Secondary Benefit...", "Call to Action..."],
  "executionChannels": [
    { "channel": "Digital Advertising", "tactic": "Retargeting and Lookalike modeling..." },
    { "channel": "Content Engine", "tactic": "Thought leadership and short-form video..." }
  ],
  "kpis": ["Customer Acquisition Cost goals", "Market Share expansion", "Engagement velocity"]
}`;

    } else if (effectiveType === "research") {
      systemPrompt = `You are a specialized Market Research Analyst.
Perform a deep-dive analysis on the specified topic. Provide structured, insightful, and data-backed content.`;

      userPrompt = `Research and analyze: "${topic}".
Provide a clear breakdown of current trends, market challenges, and future opportunities.

Return ONLY valid JSON with this structure:
{
  "marketLandscape": "Contextual overview of the industry current state.",
  "keyTrends": ["Trend 1: Innovation in...", "Trend 2: Shift toward...", "Trend 3: Regulatory impact..."],
  "competitiveAnalysis": "Summary of how top players are positioning themselves.",
  "opportunities": ["Unmet need in...", "Emerging technology for...", "Optimized workflow in..."],
  "riskAssessment": "Key blockers or challenges to watch out for."
}`;

    } else if (type === "ask") {
      systemPrompt = `You are an expert consultant assisting a user from "${brandContext.name}".
Provide a clear, structured, and highly valuable response to their inquiry.`;

      userPrompt = `Answer the following inquiry with depth and clarity: "${topic}".

Return ONLY valid JSON with this structure:
{
  "executiveResponse": "Direct, high-level answer to the question.",
  "detailedBreakdown": [
    { "point": "Critical Factor 1", "explanation": "In-depth analysis of this factor..." },
    { "point": "Critical Factor 2", "explanation": "Practical implementation strategy..." }
  ],
  "proactiveAdvice": "Strategic next steps or advice related to this inquiry.",
  "furtherReading": "Keywords or topics for deeper investigation."
}`;

    } else if (effectiveType === "invoice" || effectiveType === "quotation") {
      systemPrompt = `You are a professional business accountant generating formal documents for "${brandContext.name}".`;
      userPrompt = `Create a formal ${effectiveType} for: "${topic}". Generate professional item descriptions and competitive pricing.
Return JSON with "title", "reference", "items" (array with name, description, amount), and "summary".`;

    } else {
      systemPrompt = `You are a professional content writer for "${brandContext.name}".`;
      userPrompt = `Create a high-quality business document about: "${topic}".
Break the content into logical sections with clear headings. Use professional business English.

Return ONLY valid JSON with this structure:
{
  "title": "[Professional Title]",
  "sections": [
    { "heading": "Introduction", "content": "Professional overview..." },
    { "heading": "Key Analysis", "content": "Detailed data and insights..." },
    { "heading": "Recommendations", "content": "Strategic next steps..." }
  ]
}`;
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
    console.log("⚠️ Falling back to mock generation...");
    // Critical: Fallback should use the effective type if possible
    const fallbackType = ["ask", "research", "build", "other"].includes(type.toLowerCase()) ?
      (topic.toLowerCase().includes("resume") ? "resume" :
        topic.toLowerCase().includes("proposal") ? "proposal" :
          topic.toLowerCase().includes("marketing brief") ? "marketing_brief" : type) : type;
    return generateMockContent(fallbackType, topic);
  }
};

// Fallback mock generation (in case API fails)
const generateMockContent = (type, topic) => {
  const topicTitle = topic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const effectiveType = type.toLowerCase();

  if (effectiveType === "proposal") {
    return {
      title: `Strategic Proposal: ${topicTitle}`,
      executiveSummary: `This comprehensive proposal outlines a strategic framework for ${topic}, designed to maximize efficiency and drive long-term value.`,
      objectives: ["Establish operational excellence", "Optimize resource allocation", "Achieve measurable ROI"],
      methodology: [
        { phase: "Ph I: Discovery", details: "Deep research into the currents state and requirements." },
        { phase: "Ph II: Strategy", details: "Designing the core framework and alignment." },
        { phase: "Ph III: Delivery", details: "Full implementation and quality assurance." }
      ],
      investment: [
        { service: "Consultation & Strategy", amount: "₹50,000", justification: "Expert oversight and planning." },
        { service: "Implementation", amount: "₹1,50,000", justification: "Core execution and delivery." }
      ],
      conclusion: "We are confident that this initiative will lead to significant strategic advantages."
    };
  } else if (effectiveType === "resume") {
    return {
      personalInfo: { name: "Professional Candidate", title: `${topicTitle} Specialist`, contact: "pro.contact@email.com" },
      professionalSummary: `Dedicated professional with deep expertise in ${topic}, focused on driving innovation and delivering high-impact results.`,
      experience: [
        {
          role: `Senior ${topicTitle} Lead`,
          company: "Enterprise Solutions",
          period: "2021 - Present",
          impact: ["Pioneered new workflows", "Increased efficiency by 30%", "Led cross-functional teams"]
        }
      ],
      coreCompetencies: ["Strategic Planning", "Technical Excellence", "Team Leadership"],
      education: [{ degree: "Advanced Degree", institution: "Global University", year: "2018" }]
    };
  } else if (effectiveType === "marketing_brief") {
    return {
      campaignTitle: `Campaign: Elevate ${topicTitle}`,
      strategicOverview: `This brief defines the strategic roadmap for the upcoming ${topic} campaign.`,
      targetAudience: { persona: "The Motivated Professional", insights: "Seeking efficiency and growth", demographics: "25-45, Urban, Professional" },
      keyMessaging: ["Innovative solutions", "Proven results", "Scalable growth"],
      executionChannels: [
        { channel: "Digital", tactic: "Social media and search optimization" },
        { channel: "In-Person", tactic: "Interactive workshops and events" }
      ],
      kpis: ["20% Increase in engagement", "Lower CAC", "Brand lift"]
    };
  } else if (effectiveType === "invoice" || effectiveType === "quotation") {
    return {
      title: `Professional ${topicTitle}`,
      reference: `REF-${Date.now().toString().slice(-6)}`,
      items: [
        { name: `${topicTitle} Services`, description: "Consultation and planning", amount: 2500 },
        { name: "Project Execution", description: "Implementation and delivery", amount: 7500 }
      ],
      summary: "Standard professional services document."
    };
  } else {
    return {
      title: topicTitle,
      sections: [
        { heading: "Overview", content: `Detailed analysis and professional overview of ${topic}.` },
        { heading: "Strategic Insights", content: `Key findings and market-aligned insights for high-impact decision making.` },
        { heading: "Conclusion", content: `Strategic synthesis and recommended next steps for ${topic}.` }
      ]
    };
  }
};

module.exports = { generateContent };
