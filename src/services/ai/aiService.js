const { OPENAI_API_KEY } = require("../../config/config");
const OpenAI = require("openai");

// Check if using OpenRouter (key starts with sk-or-v1-)
const isOpenRouter = OPENAI_API_KEY && OPENAI_API_KEY.startsWith('sk-or-v1-');

console.log(`🔑 API Key configured: ${OPENAI_API_KEY ? 'Yes' : 'No'}`);
console.log(`🌐 Using OpenRouter: ${isOpenRouter ? 'Yes' : 'No'}`);

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
  defaultHeaders: isOpenRouter ? {
    'HTTP-Referer': 'http://localhost:5000',
    'X-Title': 'MM Docs'
  } : undefined
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
- Parse the provided structured input data carefully and use ALL provided information

DOCUMENT CATEGORIES YOU SUPPORT:
- HR & Employee Documents: Offer Letters, Appointment Letters, Experience Certificates
- Legal & Compliance: NDAs, Service Agreements, Terms of Service, Privacy Policies
- Sales & Business: Proposals, Quotations, Sales Contracts, Partnership Agreements  
- Finance & Accounting: Invoices, Purchase Orders, Receipts, GST Invoices
- Tax & Regulatory: GST Filings, Audit Reports, Policy Documents
- Marketing & Communications: Sales Emails, Marketing Briefs, Company Profiles
- Strategic Documents: Pitch Decks, Business Plans, Investment Proposals

CRITICAL: When you receive structured input data (Employee: John | Position: Manager | etc.), 
use each piece of information appropriately in the document. Do not ignore any provided details.

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
    console.log(`🔍 Initial type: ${type}, Effective type: ${effectiveType}`);
    
    if (["ask", "research", "build", "other"].includes(effectiveType)) {
      const topicLower = topic.toLowerCase();
      // HR & Employee Documents
      if (topicLower.includes("offer letter")) effectiveType = "offer_letter";
      else if (topicLower.includes("appointment letter")) effectiveType = "appointment_letter";
      else if (topicLower.includes("onboarding letter")) effectiveType = "onboarding_letter";
      else if (topicLower.includes("experience certificate")) effectiveType = "experience_certificate";
      else if (topicLower.includes("warning letter")) effectiveType = "warning_letter";
      // Legal & Compliance Documents
      else if (topicLower.includes("nda") || topicLower.includes("non-disclosure")) effectiveType = "nda";
      else if (topicLower.includes("service agreement")) effectiveType = "service_agreement";
      else if (topicLower.includes("terms of service")) effectiveType = "terms_of_service";
      else if (topicLower.includes("privacy policy")) effectiveType = "privacy_policy";
      else if (topicLower.includes("mou") || topicLower.includes("memorandum")) effectiveType = "mou";
      // Sales & Business Documents
      else if (topicLower.includes("business proposal") || topicLower.includes("proposal")) effectiveType = "proposal";
      else if (topicLower.includes("quotation") || topicLower.includes("estimate") || topicLower.includes("quote")) effectiveType = "quotation";
      else if (topicLower.includes("sales contract")) effectiveType = "sales_contract";
      else if (topicLower.includes("partnership agreement")) effectiveType = "partnership_agreement";
      // Finance & Accounting Documents
      else if (topicLower.includes("invoice") || topicLower.includes("bill")) effectiveType = "invoice";
      else if (topicLower.includes("purchase order")) effectiveType = "purchase_order";
      else if (topicLower.includes("receipt")) effectiveType = "receipt";
      else if (topicLower.includes("gst invoice")) effectiveType = "gst_invoice";
      else if (topicLower.includes("credit note")) effectiveType = "credit_note";
      // Tax, Audit & Regulatory Documents
      else if (topicLower.includes("gst filing")) effectiveType = "gst_filing";
      else if (topicLower.includes("audit report")) effectiveType = "audit_report";
      else if (topicLower.includes("policy document")) effectiveType = "policy_document";
      else if (topicLower.includes("regulatory filing")) effectiveType = "regulatory_filing";
      // Existing types
      else if (topicLower.includes("resume") || topicLower.includes("cv")) effectiveType = "resume";
      else if (topicLower.includes("marketing brief") || topicLower.includes("campaign")) effectiveType = "marketing_brief";
      else if (topicLower.includes("profile") || topicLower.includes("about us")) effectiveType = "profile";
    }

    console.log(`📝 Final effective type: ${effectiveType}`);
    console.log(`📋 Topic for processing: ${topic}`);

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

    // HR & Employee Documents
    } else if (effectiveType === "offer_letter") {
      console.log(`🏢 Processing offer letter with topic: ${topic}`);
      
      // Parse structured input data
      const inputData = {};
      if (topic.includes('|')) {
        console.log(`📊 Parsing structured data from topic`);
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
            console.log(`   - ${key}: ${value}`);
          }
        });
      }
      console.log(`📋 Parsed input data:`, inputData);

      userPrompt = `Generate a comprehensive, professional Employment Offer Letter using the provided information: "${topic}".

Use the structured data provided to fill in specific details. If any information is missing, use professional placeholders.

Return ONLY valid JSON with this structure:
{
  "title": "Employment Offer Letter",
  "date": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "companyName": "${inputData.company || brandContext.name}",
  "candidateName": "${inputData.employee || '[Candidate Name]'}",
  "position": "${inputData.position || '[Job Title]'}",
  "department": "${inputData.department || '[Department]'}",
  "startDate": "${inputData.startdate || '[Start Date]'}",
  "salary": "${inputData.salary || '[Annual Salary]'}",
  "reportingTo": "${inputData.reportingto || '[Direct Supervisor/Manager Name]'}",
  "workLocation": "[Office Location/Remote]",
  "workingHours": "Monday to Friday, 9:00 AM to 6:00 PM",
  "benefits": [
    "Comprehensive health insurance coverage for employee and family",
    "Annual paid time off (PTO) as per company policy",
    "Professional development and training opportunities",
    "Performance-based annual bonus eligibility",
    "Retirement savings plan with company matching"
  ],
  "termsAndConditions": [
    "Employment is contingent upon successful completion of background verification and reference checks",
    "This is an at-will employment arrangement",
    "Employee must sign and comply with company confidentiality and non-disclosure agreements",
    "Employee handbook and policies will be provided during onboarding",
    "Probationary period of 90 days applies"
  ],
  "nextSteps": [
    "Please confirm your acceptance by signing and returning this letter within 7 days",
    "Complete pre-employment documentation and background checks",
    "Attend new employee orientation on your start date"
  ],
  "contactPerson": "HR Department - hr@${(inputData.company || brandContext.name).toLowerCase().replace(/\s+/g, '')}.com",
  "closingMessage": "We are excited about the possibility of you joining our team and look forward to your positive response."
}`;

    } else if (effectiveType === "appointment_letter") {
      // Parse structured input data
      const inputData = {};
      if (topic.includes('|')) {
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
          }
        });
      }

      userPrompt = `Generate a formal Appointment Letter using the provided information: "${topic}".

Return ONLY valid JSON with this structure:
{
  "title": "Letter of Appointment",
  "date": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "companyName": "${brandContext.name}",
  "employeeName": "${inputData.employee || '[Employee Name]'}",
  "position": "${inputData.position || '[Job Title]'}",
  "department": "${inputData.department || '[Department]'}",
  "appointmentDate": "${inputData.startdate || '[Appointment Date]'}",
  "salary": "${inputData.salary || '[Annual Salary]'}",
  "employeeId": "[Employee ID to be assigned]",
  "reportingStructure": "You will report directly to the ${inputData.department || 'Department'} Head",
  "keyResponsibilities": [
    "Execute core ${inputData.position || 'role'} functions with excellence and professionalism",
    "Collaborate effectively with team members and cross-functional departments",
    "Maintain high standards of work quality and meet established deadlines",
    "Participate in professional development and training programs",
    "Adhere to all company policies, procedures, and code of conduct"
  ],
  "workingConditions": {
    "workingHours": "Standard business hours: 9:00 AM to 6:00 PM, Monday through Friday",
    "location": "[Office Location/Remote Work Arrangement]",
    "probationPeriod": "90 days from the date of joining"
  },
  "compensation": {
    "baseSalary": "${inputData.salary || '[Annual Salary]'}",
    "paymentSchedule": "Monthly salary payment on the last working day of each month",
    "benefits": "As per company policy and employment agreement"
  },
  "acknowledgment": "This appointment is subject to satisfactory completion of all pre-employment requirements and adherence to company policies.",
  "authorizedSignatory": "HR Manager, ${brandContext.name}"
}`;

    } else if (effectiveType === "experience_certificate") {
      // Parse structured input data
      const inputData = {};
      if (topic.includes('|')) {
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
          }
        });
      }

      userPrompt = `Generate a professional Experience Certificate using the provided information: "${topic}".

Return ONLY valid JSON with this structure:
{
  "title": "Experience Certificate",
  "date": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "companyName": "${brandContext.name}",
  "employeeName": "${inputData.employee || '[Employee Name]'}",
  "position": "${inputData.position || '[Job Title]'}",
  "department": "${inputData.department || '[Department]'}",
  "employmentPeriod": {
    "startDate": "${inputData.startdate || '[Start Date]'}",
    "endDate": "[End Date]"
  },
  "employeeId": "[Employee ID]",
  "workPerformance": "During the tenure, ${inputData.employee || 'the employee'} demonstrated exceptional professionalism, dedication, and competence in their role as ${inputData.position || 'team member'}.",
  "keyAchievements": [
    "Consistently met and exceeded performance targets and objectives",
    "Demonstrated strong leadership and collaborative skills",
    "Contributed significantly to ${inputData.department || 'department'} goals and initiatives",
    "Maintained high standards of work quality and professional conduct"
  ],
  "characterAssessment": "We found ${inputData.employee || 'the employee'} to be honest, hardworking, and reliable. They maintained excellent relationships with colleagues and clients.",
  "reasonForLeaving": "[Reason for separation - resignation/completion of contract/etc.]",
  "recommendation": "We recommend ${inputData.employee || 'the employee'} for future employment opportunities and wish them success in their career endeavors.",
  "contactForVerification": "For any verification or additional information, please contact HR Department at hr@${brandContext.name.toLowerCase().replace(/\s+/g, '')}.com",
  "authorizedSignatory": {
    "name": "[HR Manager Name]",
    "designation": "HR Manager",
    "company": "${brandContext.name}"
  }
}`;

    } else if (effectiveType === "onboarding_letter") {
      // Parse structured input data
      const inputData = {};
      if (topic.includes('|')) {
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
          }
        });
      }

      userPrompt = `Generate a comprehensive Employee Onboarding Letter using the provided information: "${topic}".

Return ONLY valid JSON with this structure:
{
  "title": "Employee Onboarding Welcome Letter",
  "date": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "companyName": "${brandContext.name}",
  "employeeName": "${inputData.employee || '[Employee Name]'}",
  "position": "${inputData.position || '[Job Title]'}",
  "department": "${inputData.department || '[Department]'}",
  "startDate": "${inputData.startdate || '[Start Date]'}",
  "welcomeMessage": "We are delighted to welcome you to the ${brandContext.name} family! We are excited about the skills and experience you bring to our ${inputData.department || 'team'}.",
  "firstDayInstructions": [
    "Report to the main reception at 9:00 AM on your first day",
    "Bring original documents for verification (ID proof, address proof, educational certificates)",
    "You will be provided with your employee ID card and access credentials",
    "Your direct supervisor will conduct an orientation session"
  ],
  "onboardingSchedule": [
    {
      "day": "Day 1",
      "activities": "Documentation completion, IT setup, workplace tour, and team introductions"
    },
    {
      "day": "Week 1",
      "activities": "Department orientation, role-specific training, and initial project assignments"
    },
    {
      "day": "Month 1",
      "activities": "Performance review, feedback session, and goal setting for probation period"
    }
  ],
  "documentsRequired": [
    "Government-issued photo ID (Aadhar/Passport/Driving License)",
    "Address proof (Utility bill/Bank statement)",
    "Educational certificates and transcripts",
    "Previous employment experience letters",
    "Passport-size photographs (2 copies)"
  ],
  "benefitsOverview": [
    "Comprehensive health insurance coverage",
    "Paid time off and sick leave as per policy",
    "Professional development and training opportunities",
    "Employee assistance programs and wellness initiatives"
  ],
  "contactInformation": {
    "hrContact": "HR Department - hr@${brandContext.name.toLowerCase().replace(/\s+/g, '')}.com",
    "itSupport": "IT Helpdesk - it@${brandContext.name.toLowerCase().replace(/\s+/g, '')}.com",
    "supervisor": "${inputData.department || 'Department'} Head - [supervisor@company.com]"
  },
  "closingMessage": "We look forward to a successful and rewarding journey together. Welcome aboard!"
}`;

    } else if (effectiveType === "warning_letter") {
      // Parse structured input data
      const inputData = {};
      if (topic.includes('|')) {
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
          }
        });
      }

      userPrompt = `Generate a formal Employee Warning Letter using the provided information: "${topic}".

Return ONLY valid JSON with this structure:
{
  "title": "Employee Warning Letter",
  "date": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "companyName": "${brandContext.name}",
  "employeeName": "${inputData.employee || '[Employee Name]'}",
  "position": "${inputData.position || '[Job Title]'}",
  "department": "${inputData.department || '[Department]'}",
  "employeeId": "[Employee ID]",
  "warningType": "[Verbal Warning/Written Warning/Final Warning]",
  "issueDescription": "This letter serves as a formal warning regarding [specific performance/conduct issue that needs to be addressed].",
  "incidentDetails": {
    "date": "[Date of incident/issue]",
    "description": "Detailed description of the performance issue, policy violation, or conduct concern that has prompted this warning.",
    "witnesses": "[If applicable - names of witnesses or documentation]"
  },
  "policyViolation": "This behavior/performance issue violates company policy section [X.X] regarding [specific policy area].",
  "previousDiscussions": [
    "Informal discussion on [date] regarding similar concerns",
    "Previous coaching session on [date] about performance expectations"
  ],
  "expectationsGoingForward": [
    "Immediate improvement in [specific area] is required",
    "Adherence to all company policies and procedures",
    "Professional conduct and communication with colleagues and clients",
    "Meeting all performance standards and deadlines"
  ],
  "consequencesOfNonCompliance": "Failure to demonstrate immediate and sustained improvement may result in further disciplinary action, up to and including termination of employment.",
  "supportOffered": [
    "Additional training and resources will be provided",
    "Regular check-ins with supervisor for progress monitoring",
    "Access to employee assistance programs if applicable"
  ],
  "reviewPeriod": "Your performance will be closely monitored for the next 90 days, with formal reviews at 30, 60, and 90-day intervals.",
  "acknowledgment": "By signing below, you acknowledge that you have received and understand this warning. Your signature does not indicate agreement with the content.",
  "authorizedBy": {
    "name": "[Supervisor/HR Manager Name]",
    "designation": "[Title]",
    "date": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"
  }
}`;

    } else if (effectiveType === "nda") {
      // Parse structured input data
      const inputData = {};
      if (topic.includes('|')) {
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
          }
        });
      }

      userPrompt = `Generate a comprehensive Non-Disclosure Agreement using the provided information: "${topic}".

Return ONLY valid JSON with this structure:
{
  "title": "Non-Disclosure Agreement (NDA)",
  "date": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "disclosingParty": "${brandContext.name}",
  "receivingParty": "${inputData.otherparty || '[Receiving Party Name]'}",
  "effectiveDate": "${inputData.effectivedate || '[Agreement Date]'}",
  "purpose": "${inputData.purpose || 'Business discussions and potential collaboration opportunities'}",
  "confidentialInformation": [
    "Technical data, proprietary methodologies, and trade secrets",
    "Business strategies, financial information, and operational procedures",
    "Customer lists, supplier information, and market research data",
    "Product development plans and intellectual property",
    "Any information marked as confidential or that would reasonably be considered confidential"
  ],
  "obligations": [
    "Maintain strict confidentiality of all disclosed information",
    "Use confidential information solely for the stated purpose",
    "Not disclose confidential information to third parties without prior written consent",
    "Take reasonable precautions to protect confidential information",
    "Return or destroy all confidential information upon request"
  ],
  "exceptions": [
    "Information that is publicly available through no breach of this agreement",
    "Information independently developed without use of confidential information",
    "Information rightfully received from third parties without confidentiality restrictions",
    "Information required to be disclosed by law or court order"
  ],
  "duration": "This agreement shall remain in effect for a period of 3 years from the effective date, unless terminated earlier by mutual consent",
  "remedies": "The parties acknowledge that breach of this agreement may cause irreparable harm, and the disclosing party shall be entitled to seek injunctive relief and monetary damages",
  "governingLaw": "This agreement shall be governed by and construed in accordance with the laws of [Jurisdiction]",
  "signatures": {
    "disclosingParty": "${brandContext.name}",
    "receivingParty": "${inputData.otherparty || '[Receiving Party Name]'}"
  }
}`;

    } else if (effectiveType === "service_agreement") {
      // Parse structured input data
      const inputData = {};
      if (topic.includes('|')) {
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
          }
        });
      }

      userPrompt = `Generate a comprehensive Service Agreement using the provided information: "${topic}".

Return ONLY valid JSON with this structure:
{
  "title": "Service Agreement",
  "date": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "serviceProvider": "${brandContext.name}",
  "client": "${inputData.otherparty || '[Client Name]'}",
  "effectiveDate": "${inputData.effectivedate || '[Agreement Date]'}",
  "serviceDescription": "${inputData.purpose || 'Professional services as mutually agreed upon'}",
  "scope": [
    "Detailed scope of services to be provided",
    "Deliverables and milestones",
    "Performance standards and quality metrics",
    "Timeline and project phases"
  ],
  "terms": [
    "Service provider will deliver services with professional competence",
    "Client will provide necessary cooperation and information",
    "All work will be performed in accordance with industry standards",
    "Changes to scope require written agreement from both parties"
  ],
  "payment": {
    "amount": "[Service Fee]",
    "schedule": "Payment terms as agreed",
    "lateFees": "Late payment charges may apply"
  },
  "duration": "This agreement shall remain in effect until completion of services or termination",
  "termination": "Either party may terminate with 30 days written notice",
  "liability": "Service provider's liability is limited to the amount paid for services",
  "governingLaw": "This agreement is governed by applicable local laws"
}`;

    } else if (effectiveType === "mou") {
      // Parse structured input data
      const inputData = {};
      if (topic.includes('|')) {
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
          }
        });
      }

      userPrompt = `Generate a Memorandum of Understanding using the provided information: "${topic}".

Return ONLY valid JSON with this structure:
{
  "title": "Memorandum of Understanding (MOU)",
  "date": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "party1": "${brandContext.name}",
  "party2": "${inputData.otherparty || '[Second Party Name]'}",
  "effectiveDate": "${inputData.effectivedate || '[Agreement Date]'}",
  "purpose": "${inputData.purpose || 'Mutual cooperation and collaboration'}",
  "objectives": [
    "Establish framework for cooperation",
    "Define mutual responsibilities and benefits",
    "Create foundation for future collaboration",
    "Promote shared goals and interests"
  ],
  "responsibilities": {
    "party1": [
      "Provide expertise and resources as agreed",
      "Maintain confidentiality of shared information",
      "Act in good faith throughout the collaboration"
    ],
    "party2": [
      "Provide necessary cooperation and support",
      "Share relevant information as required",
      "Maintain professional standards"
    ]
  },
  "duration": "This MOU shall remain in effect for [duration] unless terminated earlier",
  "termination": "Either party may terminate with 60 days written notice",
  "nonBinding": "This MOU represents intent to cooperate and is not legally binding",
  "governingPrinciples": "Both parties agree to act in good faith and mutual respect"
}`;

    } else if (effectiveType === "invoice") {
      // Parse structured input data
      const inputData = {};
      if (topic.includes('|')) {
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
          }
        });
      }

      userPrompt = `Generate a professional Invoice using the provided information: "${topic}".

Return ONLY valid JSON with this structure:
{
  "title": "Invoice",
  "invoiceNumber": "INV-${Date.now().toString().slice(-6)}",
  "invoiceDate": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "from": {
    "company": "${brandContext.name}",
    "address": "[Company Address]",
    "email": "billing@${brandContext.name.toLowerCase().replace(/\s+/g, '')}.com"
  },
  "to": {
    "client": "${inputData.client || '[Client Name]'}",
    "address": "[Client Address]"
  },
  "items": [
    {
      "description": "${inputData.items || 'Professional services rendered'}",
      "quantity": "1",
      "rate": "${inputData.amount || '[Rate]'}",
      "amount": "${inputData.amount || '[Amount]'}"
    }
  ],
  "subtotal": "${inputData.amount || '[Subtotal]'}",
  "tax": "[Tax Amount if applicable]",
  "total": "${inputData.amount || '[Total Amount]'}",
  "paymentTerms": "Payment due within 30 days of invoice date",
  "dueDate": "${inputData.duedate || '[Due Date]'}",
  "notes": "Thank you for your business!"
}`;

    } else if (effectiveType === "purchase_order") {
      // Parse structured input data
      const inputData = {};
      if (topic.includes('|')) {
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
          }
        });
      }

      userPrompt = `Generate a comprehensive Purchase Order using the provided information: "${topic}".

Return ONLY valid JSON with this structure:
{
  "title": "Purchase Order",
  "poNumber": "PO-${Date.now().toString().slice(-6)}",
  "issueDate": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "buyer": "${brandContext.name}",
  "supplier": "${inputData.client || '[Supplier Company Name]'}",
  "deliveryAddress": "[Delivery Location - To be confirmed]",
  "requestedDeliveryDate": "${inputData.duedate || '[Required Delivery Date]'}",
  "items": [
    {
      "itemNumber": "1",
      "description": "${inputData.items || 'Professional services and deliverables as specified'}",
      "quantity": "1",
      "unitPrice": "${inputData.amount || '[Unit Price]'}",
      "totalPrice": "${inputData.amount || '[Line Total]'}"
    }
  ],
  "subtotal": "${inputData.amount || '[Subtotal Amount]'}",
  "tax": "[Tax Amount - As applicable]",
  "totalAmount": "${inputData.amount || '[Total PO Amount]'}",
  "paymentTerms": "Net 30 days from delivery and acceptance of goods/services",
  "specialInstructions": [
    "All items must meet specified quality standards",
    "Delivery confirmation required upon receipt",
    "Invoice to be submitted with delivery documentation"
  ],
  "terms": [
    "This purchase order constitutes a binding agreement",
    "Supplier must acknowledge receipt within 48 hours",
    "Any changes must be approved in writing",
    "Delivery must be made to the specified address during business hours"
  ],
  "contactPerson": "Procurement Department - procurement@${brandContext.name.toLowerCase().replace(/\s+/g, '')}.com"
}`;

    } else if (effectiveType === "gst_invoice") {
      // Parse structured input data
      const inputData = {};
      if (topic.includes('|')) {
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
          }
        });
      }

      userPrompt = `Generate a comprehensive GST-compliant Invoice using the provided information: "${topic}".

Return ONLY valid JSON with this structure:
{
  "title": "Tax Invoice",
  "invoiceNumber": "INV-${Date.now().toString().slice(-6)}",
  "invoiceDate": "${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}",
  "supplier": {
    "legalName": "${brandContext.name}",
    "address": "[Supplier Address - To be updated]",
    "gstin": "[Supplier GSTIN - To be updated]",
    "email": "billing@${brandContext.name.toLowerCase().replace(/\s+/g, '')}.com"
  },
  "buyer": {
    "legalName": "${inputData.client || '[Buyer Legal Name]'}",
    "address": "[Buyer Address - To be confirmed]",
    "gstin": "[Buyer GSTIN - If applicable]"
  },
  "items": [
    {
      "description": "${inputData.items || 'Professional services as per agreement'}",
      "hsnSac": "998314",
      "quantity": "1",
      "rate": "${inputData.amount || '[Rate per Unit]'}",
      "taxableValue": "${inputData.amount || '[Taxable Value]'}",
      "cgst": "[CGST Amount - 9%]",
      "sgst": "[SGST Amount - 9%]",
      "totalAmount": "${inputData.amount || '[Total Line Amount]'}"
    }
  ],
  "taxSummary": {
    "totalTaxableValue": "${inputData.amount || '[Total Taxable Value]'}",
    "totalCGST": "[Total CGST Amount]",
    "totalSGST": "[Total SGST Amount]",
    "totalTax": "[Total Tax Amount]",
    "grandTotal": "[Grand Total Amount]"
  },
  "paymentTerms": "Payment due within 30 days of invoice date",
  "dueDate": "${inputData.duedate || '[Payment Due Date]'}",
  "bankDetails": {
    "bankName": "[Bank Name]",
    "accountNumber": "[Account Number]",
    "ifscCode": "[IFSC Code]",
    "accountType": "Current Account"
  },
  "declaration": "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
  "authorizedSignatory": "For ${brandContext.name}"
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

    console.log(`🚀 Making OpenAI API call with model: ${isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini"}`);
    console.log(`📝 System prompt length: ${systemPrompt.length}`);
    console.log(`📝 User prompt length: ${userPrompt.length}`);

    const response = await openai.chat.completions.create({
      model: isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    console.log(`✅ OpenAI API response received`);
    console.log(`📄 Response content length: ${response.choices[0].message.content.length}`);
    
    const content = JSON.parse(response.choices[0].message.content);
    console.log("✅ AI Generation Successful");
    return content;

  } catch (error) {
    console.error("❌ OpenAI API Error:", error.message);
    console.error("❌ Error Status:", error.status);
    console.error("❌ Error Code:", error.code);
    
    // Provide specific error messages for common issues
    if (error.message.includes('Invalid API key') || error.message.includes('Invalid token')) {
      console.error("🔑 API Key Issue: Please check your OpenRouter API key in the .env file");
      console.error("💡 Make sure your API key starts with 'sk-or-v1-' for OpenRouter");
    } else if (error.message.includes('insufficient_quota') || error.message.includes('rate_limit')) {
      console.error("💳 Quota/Rate Limit: Please check your OpenRouter account credits and rate limits");
    } else if (error.message.includes('model_not_found')) {
      console.error("🤖 Model Issue: The requested model may not be available on OpenRouter");
    }
    
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
  } else if (effectiveType === "offer_letter") {
    return {
      title: "Employment Offer Letter",
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      companyName: "MM Docs",
      candidateName: "[Candidate Name]",
      position: "[Job Title]",
      department: "[Department]",
      startDate: "[Start Date]",
      salary: "[Annual Salary]",
      reportingTo: "[Direct Supervisor/Manager Name]",
      workLocation: "[Office Location/Remote]",
      workingHours: "Monday to Friday, 9:00 AM to 6:00 PM",
      benefits: [
        "Comprehensive health insurance coverage for employee and family",
        "Annual paid time off (PTO) as per company policy",
        "Professional development and training opportunities",
        "Performance-based annual bonus eligibility",
        "Retirement savings plan with company matching"
      ],
      termsAndConditions: [
        "Employment is contingent upon successful completion of background verification and reference checks",
        "This is an at-will employment arrangement",
        "Employee must sign and comply with company confidentiality and non-disclosure agreements",
        "Employee handbook and policies will be provided during onboarding",
        "Probationary period of 90 days applies"
      ],
      nextSteps: [
        "Please confirm your acceptance by signing and returning this letter within 7 days",
        "Complete pre-employment documentation and background checks",
        "Attend new employee orientation on your start date"
      ],
      contactPerson: "HR Department - hr@mmdocs.com",
      closingMessage: "We are excited about the possibility of you joining our team and look forward to your positive response."
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
  } else if (effectiveType === "warning_letter") {
    return {
      title: "Employee Warning Letter",
      issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      refNumber: `WRN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      companyName: "MM Docs",
      companyAddress: "[Company Address - Street, City, State, PIN]",
      companyEmail: "hr@mmdocs.com",
      companyPhone: "+91-XXXXXXXXXX",
      companyWebsite: "www.mmdocs.com",
      employeeName: "[Employee Name]",
      employeeId: "[Employee ID]",
      position: "[Job Title]",
      department: "[Department Name]",
      reportingTo: "[Reporting Manager]",
      joiningDate: "[Joining Date]",
      warningLevel: "WRITTEN",
      incidentDate: "[Incident Date]",
      violationType: "[Policy Violation Type]",
      incidentDescription: "[Detailed description of the incident or performance issue]",
      specificViolations: [
        "Company Code of Conduct violation",
        "Performance standards not met",
        "Attendance and punctuality issues",
        "Professional behavior concerns"
      ],
      monitoringPeriod: "90",
      additionalConsequences: {
        "Training Required": "Mandatory compliance training within 30 days",
        "Performance Review": "Weekly performance check-ins with supervisor"
      },
      improvementActions: [
        "Review and acknowledge all company policies",
        "Attend mandatory training sessions as directed",
        "Meet performance standards consistently",
        "Maintain professional conduct at all times",
        "Submit weekly progress reports to supervisor"
      ],
      reviewDate: "[Review Date - 30 days from issue date]",
      hrContactPerson: "HR Manager",
      managerTitle: "Human Resources Manager",
      hrEmail: "hr@mmdocs.com",
      hrPhone: "+91-XXXXXXXXXX",
      currentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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
