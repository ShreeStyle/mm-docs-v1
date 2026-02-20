const { OPENAI_API_KEY } = require("../../config/config");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const generateContent = async (type, topic, brandContext) => {
  console.log(`🤖 AI Generating content for: ${type} - ${topic}`);
  console.log(`🎨 Brand Context: ${JSON.stringify(brandContext)}`);

  try {
    let systemPrompt = `You are MM Docs, an elite AI Business Document SaaS by MediaaMasala.

Your role:
- Generate highly detailed, comprehensive, and professional business documents
- Never generate short, sparse, or brief documents; produce extensive and deep content
- Follow structured business formats meticulously
- Use clear, confident, sophisticated, human language
- Ensure documents are client-ready, persuasive, and thorough

Quality standards:
- Deeply logical structure with extensive elaboration per section
- Assertive, highly professional tone
- No unnecessary fluff, but rich with professional context and strategy
- No emojis
- No legal guarantees

Branding:
- Company Name: ${brandContext.name}
- Tone: ${brandContext.tone || "Deeply Professional and Strategic"}
- Context: ${brandContext.description || "N/A"}

You act as an expert document generator, not a chatbot.
Do not explain what you are doing.
Do not include commentary.
Return ONLY valid, richly detailed JSON document content.`;

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
      userPrompt = `Create a massive, highly detailed, deeply professional Business Proposal for: "${topic}".
You MUST ensure extreme depth, covering extensive industry context, granular details about specific modules, and highly elaborated expected outcomes. Every section must have substantial detail.

Return ONLY valid JSON with this exact structure (the values must be extensively detailed paragraphs and long lists):
{
  "title": "Project: Implementation of [Topic / Product Name]",
  "preparedFor": "[Target Audience/Client Placeholder]",
  "preparedBy": "${brandContext.name}",
  "executiveSummary": "A powerful, multi-paragraph opening outlining the strategic imperative, the current landscape, the proposed implementation, and the ultimate objective of the engagement.",
  "currentChallenges": [
    "Challenge 1: Describe the industry pain point in deep detail (3-4 sentences).",
    "Challenge 2: Detail the operational inefficiency in depth.",
    "Challenge 3: Describe competitive pressures or technological lags comprehensively.",
    "Challenge 4: Outline financial or strategic risks currently faced."
  ],
  "proposedSolution": {
    "overview": "A thorough, detailed explanation of the proposed modular, cloud-first platform/service and how it directly counters the challenges mentioned.",
    "coreModules": [
      "Module 1: Name - In-depth description of its functionality and direct benefit.",
      "Module 2: Name - Extensive breakdown of how it integrates into existing workflows.",
      "Module 3: Name - Detailed overview of features and strategic advantages.",
      "Module 4: Name - Explanation of the technical edge and user experience benefits."
    ],
    "optionalEnhancements": [
      "Enhancement 1: Deep dive into premium features and their ROI.",
      "Enhancement 2: Details on advanced analytics or dedicated support tiers."
    ]
  },
  "implementationApproach": [
    { "phase": "Phase 1: Discovery & Strategy", "description": "Highly detailed breakdown of stakeholder interviews, current state analysis, and strategic roadmap creation." },
    { "phase": "Phase 2: Design & Architecture", "description": "Elaborate description of system design, UI/UX conceptualization, and technical blueprinting." },
    { "phase": "Phase 3: Development & Integration", "description": "Detailed timeline of core engineering, iterative testing, and API integrations." },
    { "phase": "Phase 4: Quality Assurance", "description": "Comprehensive explanation of security audits, load testing, and UAT." },
    { "phase": "Phase 5: Deployment & Optimization", "description": "Detailed go-live strategy, post-launch hypercare, and ongoing iteration plans." }
  ],
  "deliverables": [
    "Deliverable 1: Comprehensive Strategy and Architecture Document",
    "Deliverable 2: Fully deployed and configured core platform",
    "Deliverable 3: Extensive administrative and user training manuals",
    "Deliverable 4: Custom analytics dashboards and reporting suites"
  ],
  "expectedOutcomes": [
    "Outcome 1: Highly specific, quantifiable prediction (e.g. 25-35% reduction in systematic errors resulting in $X savings).",
    "Outcome 2: Detailed improvement in user engagement or operational speed.",
    "Outcome 3: Long-term strategic positioning benefits and market share defense.",
    "Outcome 4: Scalability metrics and future-proofing advantages."
  ],
  "assumptions": [
    "Assumption 1: Timely and unhindered access to key stakeholders for discovery.",
    "Assumption 2: Availability of necessary technical documentation and API access.",
    "Assumption 3: Resource allocation from the client side for UAT sign-offs within 48 hours."
  ],
  "conclusion": "A deeply confident, persuasive, and visionary closing statement synthesizing the value proposition and outlining the immediate next steps to initiate the partnership."
}`;

    } else if (effectiveType === "quotation" || effectiveType === "invoice") {
      userPrompt = `Using the provided context and data, generate a highly detailed and professional Quotation document for: "${topic}".

Requirements:
- Use a comprehensive business quotation structure
- Provide deep, explanatory descriptions for every line item
- DO NOT just put 1-2 words for descriptions. They must be full, descriptive sentences justifying the value.
- Add detailed payment terms and robust validity clauses
- Return ONLY valid JSON.

Return ONLY valid JSON with this exact structure:
{
  "title": "Comprehensive Commercial Proposal & Pricing",
  "components": [
    { "component": "Strategic Discovery & Platform Setup", "description": "Extensive system configuration, environment deployment, and initial architectural alignment with existing infrastructure.", "amount": "[Realistic Amount, e.g. $15,000]" },
    { "component": "Core Software License (Annual)", "description": "Full access to the core suite of enterprise modules including secure data processing and role-based access control.", "amount": "[Realistic Amount]" },
    { "component": "Advanced Analytics & Reporting Module", "description": "Implementation of custom executive dashboards, predictive data models, and automated compliance reporting.", "amount": "[Realistic Amount]" },
    { "component": "Enterprise Training & Onboarding", "description": "Comprehensive, multi-session training programs for administrative staff and end-users, including dedicated manuals.", "amount": "[Realistic Amount]" }
  ],
  "total": "Sum of the amounts",
  "paymentTerms": [
    "50% Advance Payment required to initiate project scheduling.",
    "25% Milestone Payment upon completion of User Acceptance Testing (UAT).",
    "25% Final Payment due Net-15 upon successful Go-Live deployment."
  ],
  "validity": "This quotation remains valid for 30 days from the date of issue. Prices are subject to renegotiation thereafter.",
  "support": "Includes 6 months of hypercare and Priority Tier 1 support post-launch."
}`;

    } else if (effectiveType === "profile") {
      userPrompt = `Create a highly professional, Corporate Style Company Profile for an entity solving: "${topic}".

Return ONLY valid JSON with this exact structure:
{
  "companyName": "${brandContext.name}",
  "industry": "Primary Industry (e.g. SaaS | Technology)",
  "founded": "2024",
  "presence": "Global / Relevant Region",
  "about": "A solid, corporate paragraph describing the company's focus on building intelligent, scalable solutions.",
  "vision": "A powerful vision statement (e.g., To become a trusted digital backbone...).",
  "mission": "An actionable mission statement.",
  "coreCompetencies": ["Competency 1", "Competency 2", "Competency 3", "Competency 4"],
  "differentiators": ["Differentiator 1", "Differentiator 2", "Differentiator 3", "Differentiator 4"]
}`;

    } else if (effectiveType === "marketing_brief" || effectiveType === "sales email" || topic.toLowerCase().includes("email")) {
      userPrompt = `Write a deeply persuasive, highly professional, and robust B2B Sales Email for: "${topic}".
DO NOT generate a short email. It must read like a bespoke, consultative outreach from a top-tier executive.

Return ONLY valid JSON with this exact structure:
{
  "subject": "A compelling, thought-provoking, and highly professional subject line",
  "greeting": "Hello [Name],",
  "opening": "A highly customized, engaging opening paragraph (3-4 sentences) that establishes profound relevance, acknowledges their specific industry challenges, and sets a consultative tone.",
  "valueProposition": "A robust, detailed paragraph explaining exactly how your solution fundamentally shifts their operational capability, complete with strategic context.",
  "keyBenefits": [
    "Benefit 1: A long sentence detailing exactly how you reduce operational inefficiencies and the resulting financial impact.",
    "Benefit 2: A long sentence explaining how your solution drives rapid scalability without proportional overhead increases.",
    "Benefit 3: A long sentence highlighting risk mitigation, compliance reinforcement, or technical superiority."
  ],
  "callToAction": "A professional, low-friction, multi-sentence request for a brief strategic alignment call to explore potential synergies.",
  "signOff": "Warm regards,\\n${brandContext.name}\\nProviding Next-Generation Infrastructure"
}`;

    } else if (effectiveType === "resume") {
      userPrompt = `Create a comprehensive professional resume based on: "${topic}".

Return ONLY valid JSON with this exact structure:
{
  "personalInfo": { "name": "[Professional Name Placeholder]", "title": "[Target Job Title]", "contact": "professional.contact@email.com" },
  "professionalSummary": "A punchy, 3-sentence summary highlighting core expertise and unique value.",
  "experience": [
    {
      "role": "Senior [Role Title]",
      "company": "Market Leader Inc.",
      "period": "2020 - Present",
      "impact": ["Quantifiable achievement 1 (e.g. Increased revenue by 25%)", "Leadership achievement...", "Innovation achievement..."]
    }
  ],
  "coreCompetencies": ["Strategy & Execution", "Team Leadership", "Industry-Specific Skill...", "Advanced Technology..."],
  "education": [{"degree": "Advanced Professional Degree", "institution": "Prestige Institute", "year": "2016"}]
}`;

    } else {
      userPrompt = `Create a massive, highly detailed, deeply structured, hyper-professional Pitch Deck Outline for: "${topic}".
The output must be extensive, providing intense strategic depth for investors or board members. Do NOT give brief pointers; provide full explanatory paragraphs for every slide section.

Return ONLY valid JSON with this exact structure:
{
  "title": "[Product/Project Name] Strategic Pitch Deck Overview",
  "marketProblem": "A deep, multi-paragraph analysis of the systemic operational inefficiencies, market gaps, or core problems. Detail the exact pain points customers face today and why legacy solutions fail.",
  "ourSolution": "A comprehensive, highly detailed explanation of your unified/innovative solution. Explain the paradigm shift and how the technology directly answers the market problem.",
  "productOverview": [
    "Feature 1: Extensive description of the flagship capability and its direct competitive edge.",
    "Feature 2: Extensive description of the secondary capability and its contribution to user retention.",
    "Feature 3: Extensive description of the underlying architecture that enables ultimate scalability."
  ],
  "targetMarket": "A highly granular breakdown of the specific demographics, Total Addressable Market (TAM), Serviceable Obtainable Market (SOM), and the precise initial wedge strategy.",
  "revenueModel": "A highly detailed explanation of the pricing strategy, predicted LTV:CAC ratios, upselling pathways, and enterprise scaling mechanics.",
  "competitiveAdvantage": "A deep analysis of your core moat, including technological advantages, network effects, IP protection, or speed-to-market advantages that cannot be easily replicated.",
  "goToMarketStrategy": "A thorough, multi-channel acquisition strategy detailing direct enterprise sales, strategic channel partnerships, and inbound demand generation.",
  "visionAndRoadmap": "A visionary, long-term product trajectory encompassing the next 12, 24, and 36 months of feature rollouts and geographic expansion."
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
      executiveSummary: `This comprehensive proposal outlines a strategic framework for ${topic}, designed to maximize operational efficiency, drive measurable long-term value, and strengthen your market position. We have conducted a preliminary analysis of your current digital infrastructure and identified key opportunities for high-impact growth. Our approach prioritizes scalable architecture, user-centric design, and data-driven decision making to ensure that every investment translates into tangible business outcomes. By partnering with us, you gain access to a dedicated team of experts committed to delivering excellence and pushing the boundaries of what is possible for your brand.`,
      objectives: ["Establish operational excellence", "Optimize resource allocation", "Achieve measurable ROI"],
      scope: {
        included: ["Comprehensive Audit & Strategy", "Full-scale Implementation", "Quality Assurance & Testing", "User Training Session"],
        excluded: ["Third-party software licenses", "Ongoing maintenance (unless signed)", "Content creation beyond scope"]
      },
      methodology: [
        { phase: "Ph I: Discovery", details: "Deep research into the current state and requirements." },
        { phase: "Ph II: Strategy", details: "Designing the core framework and alignment." },
        { phase: "Ph III: Delivery", details: "Full implementation and quality assurance." },
        { phase: "Ph IV: Review", details: "Final handover and performance optimization." }
      ],
      deliverables: ["Strategy Document", "Implementation Roadmap", "Final Executable Assets", "Training Manual"],
      timeline: "Estimated Duration: 6-8 Weeks",
      investment: [
        { service: "Consultation & Strategy", amount: "₹50,000", justification: "Expert oversight and planning." },
        { service: "Implementation", amount: "₹1,50,000", justification: "Core execution and delivery." }
      ],
      assumptions: ["Timely access to stakeholders", "Availability of necessary data"],
      conclusion: "We are confident that this initiative will lead to significant strategic advantages and look forward to a successful partnership."
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
      components: [
        { component: `${topicTitle} Strategic Planning`, description: "Consultation, deep market analysis, and planning", amount: "$2,500" },
        { component: "Implementation Engine", description: "Full deployment and integration of the core architecture", amount: "$7,500" }
      ],
      total: "$10,000",
      paymentTerms: ["50% Advance", "50% on Go-Live"],
      validity: "30 days",
      support: "6 months included"
    };
  } else if (effectiveType === "sales email") {
    return {
      subject: `Accelerate Your Growth: Strategic Solutions for ${topicTitle}`,
      greeting: "Hello [Name],",
      opening: `I'm reaching out because I noticed the incredible work you're doing. In today's highly competitive landscape, finding the right strategic leverage in ${topicTitle} is critical.`,
      valueProposition: `Our advanced platform uses predictive technology to fundamentally optimize your processes, allowing you to scale without drastically increasing your operational overhead.`,
      keyBenefits: [
        "Reduce manual operation time by up to 40% immediately.",
        "Enhance data visibility and actionable analytics across your entire team.",
        "Ensure enterprise-grade compliance and risk mitigation from day one."
      ],
      callToAction: "I would love to schedule a brief 10-minute strategic alignment call this Thursday to explore potential synergies. Would you be open to this?",
      signOff: "Warm regards,\nMM Docs\nProviding Next-Generation Infrastructure"
    };
  } else if (effectiveType === "profile") {
    return {
      companyName: topicTitle || "Enterprise Innovators Ltd.",
      industry: "Technology & SaaS",
      founded: "2024",
      presence: "Global Context",
      about: "A forward-thinking technology enterprise committed to engineering resilient, scalable, and highly secure digital solutions for the modern business landscape.",
      vision: "To become the absolute standard for enterprise digital transformation and operational excellence worldwide.",
      mission: "To equip high-growth companies with the technological infrastructure required to dominate their competitive markets.",
      coreCompetencies: ["Enterprise Architecture", "Predictive Analytics", "Cloud Infrastructure", "Cybersecurity"],
      differentiators: ["Unmatched Speed to Market", "Elite Support Tiers", "Seamless Integration", "Agile Innovation Engine"]
    };
  } else if (effectiveType === "pitch deck outline" || effectiveType === "pitch") {
    return {
      title: `${topicTitle} Strategic Pitch Deck Overview`,
      marketProblem: "The market currently suffers from highly fragmented legacy systems that drain operational efficiency. Customers demand real-time synchronization, yet existing platforms fail to deliver without massive overhead.",
      ourSolution: "We have engineered a unified, cloud-first platform that consolidates data processing, delivering immediate latency reduction and an incredibly intuitive user experience.",
      productOverview: [
        "Core Analytics Engine: Real-time dynamic reporting and predictive dashboards.",
        "Seamless API Gateway: Zero-friction integration with existing legacy software.",
        "Automated Compliance Module: Built-in regulatory safeguards updated continuously."
      ],
      targetMarket: "Our primary focus is mid-market enterprises and hyper-growth scale-ups currently spending over $50k annually on fragmented SaaS tools.",
      revenueModel: "A tiered, annual SaaS subscription model starting at $15,000/year, scaling dynamically with active user seats and data volume.",
      competitiveAdvantage: "First-mover advantage in autonomous data structuring, protected by proprietary machine learning models that improve with every user interaction.",
      goToMarketStrategy: "A dual-pronged approach leveraging direct outbound enterprise sales and strategic channel partnerships with major consulting firms.",
      visionAndRoadmap: "Over the next 18 months, we plan to roll out full predictive AI modeling and expand vertically into the healthcare and financial sectors."
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
