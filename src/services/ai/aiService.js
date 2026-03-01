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

const generateContent = async (type, topic, brandContext, providedData = {}) => {
  console.log(`🤖 AI Generating content for: ${type} - ${topic}`);
  console.log(`🎨 Brand Context: ${JSON.stringify(brandContext)}`);
  console.log(`📋 Provided Data: ${JSON.stringify(providedData)}`);

  try {
    let systemPrompt = `You are MM Docs, an elite AI Business Document SaaS by MediaaMasala.

Your role:
- Generate highly detailed, comprehensive, and professional business documents
- Never generate short, sparse, or brief documents; produce extensive and deep content
- Follow structured business formats meticulously
- Use clear, confident, sophisticated, human language
- Ensure documents are client-ready, persuasive, and thorough
- Parse the provided structured input data carefully and use ALL provided information
- PRIORITIZE PROVIDED FORM DATA over any generated placeholders or topic-based guesses

DOCUMENT CATEGORIES YOU SUPPORT:
- HR & Employee Documents: Offer Letters, Appointment Letters, Experience Certificates
- Legal & Compliance: NDAs, Service Agreements, Terms of Service, Privacy Policies
- Sales & Business: Proposals, Quotations, Sales Contracts, Partnership Agreements  
- Finance & Accounting: Invoices, Purchase Orders, Receipts, GST Invoices
- Tax & Regulatory: GST Filings, Audit Reports, Policy Documents
- Marketing & Communications: Sales Emails, Marketing Briefs, Company Profiles
- Strategic Documents: Pitch Decks, Business Plans, Investment Proposals

CRITICAL: When you receive structured input data (Employee: John | Position: Manager | etc.) OR provided form data (candidateName, salary, etc.), 
use each piece of information appropriately in the document. Do not ignore any provided details.
If a value is provided in 'providedData', use it EXACTLY as is.

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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for proposal:`, context);

      userPrompt = `Create a massive, highly detailed, deeply professional Business Proposal using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Use the context data provided to fill in specific details.
      Return ONLY valid JSON with this exact structure:
      {
        "title": "Project: Implementation of ${context.topic || topic}",
        "preparedFor": "${context.clientName || context.customerName || '[Target Audience/Client Placeholder]'}",
        "preparedBy": "${context.companyName || brandContext.name}",
        "executiveSummary": "A powerful, multi-paragraph opening statement.",
        "proposedSolution": {
          "overview": "A thorough, detailed explanation.",
          "coreModules": ["Module 1", "Module 2", "Module 3"]
        }
      }`;

    } else if (effectiveType === "quotation") {
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for quotation:`, context);

      userPrompt = `Generate a highly detailed and professional Quotation using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      PRIORITY: If 'items' array is provided in CONTEXT DATA, use it exactly.
      Return ONLY valid JSON with this structure:
      {
        "title": "Commercial Quotation for ${context.topic || topic}",
        "quoteNumber": "QTN-${Date.now().toString().slice(-6)}",
        "date": "${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "client": "${context.clientName || context.customerName || context.client || '[Client Name]'}",
        "items": ${context.items ? JSON.stringify(context.items) : `[
          { "description": "${context.description || 'Professional Services'}", "amount": "${context.amount || 0}" }
        ]`},
        "total": "${context.total || context.amount || 0}",
        "paymentTerms": ["50% advance", "50% on completion"],
        "validity": "30 days"
      }`;

    } else if (effectiveType === "profile") {
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for profile:`, context);

      userPrompt = `Create a highly professional, Corporate Style Company Profile for an entity solving: "${topic}".
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Return ONLY valid JSON with this exact structure:
      {
        "companyName": "${context.companyName || context.company || brandContext.name}",
        "industry": "${context.industry || 'Technology'}",
        "founded": "${context.founded || '2024'}",
        "about": "${context.about || 'A leading provider of innovative solutions.'}",
        "vision": "${context.vision || 'To lead the industry with excellence.'}",
        "mission": "${context.mission || 'To deliver value to our clients.'}"
      }`;

    } else if (effectiveType === "marketing_brief" || effectiveType === "sales email" || topic.toLowerCase().includes("email")) {
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for marketing_brief/email:`, context);

      userPrompt = `Write a deeply persuasive, highly professional, and robust B2B Sales Email/Brief for: "${topic}".
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Return ONLY valid JSON with this exact structure:
      {
        "subject": "${context.subject || 'Strategic Alignment Opportunity'}",
        "greeting": "Hello ${context.contactName || '[Name]'},",
        "valueProposition": "A robust, detailed paragraph explaining our value.",
        "callToAction": "A professional request for a meeting."
      }`;

    } else if (effectiveType === "resume") {
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for resume:`, context);

      userPrompt = `Create a comprehensive professional resume using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Return ONLY valid JSON with this exact structure:
      {
        "personalInfo": { 
          "name": "${context.name || context.fullName || '[Professional Name]'} ", 
          "title": "${context.title || context.position || '[Target Job Title]'}", 
          "contact": "${context.contact || context.email || 'professional.contact@email.com'}" 
        },
        "professionalSummary": "A punchy summary.",
        "experience": ${context.experience ? JSON.stringify(context.experience) : `[
          {
            "role": "${context.position || 'Senior Professional'}",
            "company": "${context.company || 'Market Leader Inc.'}",
            "period": "2020 - Present",
            "impact": ["Quantifiable achievement 1", "Innovation achievement..."]
          }
        ]`}
      }`;

      // HR & Employee Documents
    } else if (effectiveType === "offer_letter") {
      console.log(`🏢 Processing offer letter with topic: ${topic}`);

      // Parse structured input data from topic (pipes)
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for offer_letter:`, context);

      userPrompt = `Generate a formal, comprehensive Employment Offer Letter using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Use the context data provided to fill in specific details. If any information is missing, use professional placeholders.
      DO NOT USE GENERIC PLACEHOLDERS like "[Candidate Name]" if a name is provided in the context above.

      Return ONLY valid JSON with this structure:
      {
        "title": "Employment Offer Letter",
        "date": "${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "companyName": "${context.companyName || context.company || brandContext.name}",
        "candidateName": "${context.candidateName || context.employee || context.candidate || '[Candidate Name]'}",
        "position": "${context.position || '[Job Title]'}",
        "department": "${context.department || '[Department]'}",
        "startDate": "${context.startDate || context.startdate || '[Start Date]'}",
        "salary": "${context.salary || '[Annual Salary]'}",
        "reportingTo": "${context.reportingTo || context.reportingto || '[Direct Supervisor/Manager Name]'}",
        "workLocation": "${context.workLocation || '[Office Location/Remote]'}",
        "workingHours": "${context.workingHours || 'Monday to Friday, 9:00 AM to 6:00 PM'}",
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
        "contactPerson": "HR Department - hr@${(context.companyName || context.company || brandContext.name).toLowerCase().replace(/\s+/g, '')}.com",
        "closingMessage": "We are excited about the possibility of you joining our team and look forward to your positive response."
      }`;

    } else if (effectiveType === "appointment_letter") {
      // Parse structured input data from topic (pipes)
      const inputData = {};
      if (topic.includes('|')) {
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
          }
        });
      }

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for appointment_letter:`, context);

      userPrompt = `Generate a formal, comprehensive Appointment Letter using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Use the context data provided to fill in specific details. If any information is missing, use professional placeholders.
      DO NOT USE GENERIC PLACEHOLDERS like "[Employee Name]" if a name is provided in the context above.

      Return ONLY valid JSON with this structure:
      {
        "title": "Letter of Appointment",
        "date": "${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "companyName": "${context.companyName || context.company || brandContext.name}",
        "employeeName": "${context.employeeName || context.employee || context.candidate || '[Employee Name]'}",
        "position": "${context.position || '[Job Title]'}",
        "department": "${context.department || '[Department]'}",
        "appointmentDate": "${context.appointmentDate || context.startdate || context.startDate || '[Appointment Date]'}",
        "salary": "${context.salary || '[Annual Salary]'}",
        "employeeId": "${context.employeeId || '[Employee ID to be assigned]'}",
        "reportingStructure": "${context.reportingTo ? `You will report directly to ${context.reportingTo}` : `You will report directly to the ${context.department || 'Department'} Head`}",
        "keyResponsibilities": [
          "Execute core ${context.position || 'role'} functions with excellence and professionalism",
          "Collaborate effectively with team members and cross-functional departments",
          "Maintain high standards of work quality and meet established deadlines",
          "Participate in professional development and training programs",
          "Adhere to all company policies, procedures, and code of conduct"
        ],
        "probation": "90 days from the date of joining",
        "noticePeriod": "30 days during probation, 60 days after confirmation",
        "contactPerson": "HR Department - hr@${(context.companyName || context.company || brandContext.name).toLowerCase().replace(/\s+/g, '')}.com",
        "closingMessage": "We look forward to a mutually beneficial relationship."
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for experience_certificate:`, context);

      userPrompt = `Generate a professional, comprehensive Experience Certificate using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Use the context data provided to fill in specific details. If any information is missing, use professional placeholders.
      DO NOT USE GENERIC PLACEHOLDERS like "[Employee Name]" if a name is provided in the context above.

      Return ONLY valid JSON with this structure:
      {
        "title": "Experience Certificate",
        "date": "${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "companyName": "${context.companyName || context.company || brandContext.name}",
        "employeeName": "${context.employeeName || context.employee || context.candidate || '[Employee Name]'}",
        "position": "${context.position || '[Job Title]'}",
        "startDate": "${context.startDate || context.startdate || '[Start Date]'}",
        "endDate": "${context.endDate || context.enddate || '[End Date/Present]'}",
        "performance": "${context.performance || 'excellent'}",
        "skills": "${context.skills || 'professionalism, dedication, and teamwork'}",
        "contactPerson": "${context.hrName || 'HR Manager'}",
        "certificateId": "EXP-${Date.now().toString().slice(-6)}"
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for onboarding_letter:`, context);

      userPrompt = `Generate a warm, professional Employee Onboarding Letter using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Use the context data provided to fill in specific details.
      Return ONLY valid JSON with this structure:
      {
        "title": "Employee Onboarding Welcome Letter",
        "date": "${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "companyName": "${context.companyName || context.company || brandContext.name}",
        "employeeName": "${context.employeeName || context.employee || context.candidate || '[Employee Name]'}",
        "position": "${context.position || '[Job Title]'}",
        "department": "${context.department || '[Department]'}",
        "startDate": "${context.startDate || context.startdate || '[Start Date]'}",
        "welcomeMessage": "We are delighted to welcome you to the team!",
        "firstDayInstructions": [
          "Report to the main reception at 9:00 AM on your first day",
          "Bring original documents for verification",
          "Your direct supervisor will conduct an orientation session"
        ]
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for warning_letter:`, context);

      userPrompt = `Generate a formal Employee Warning Letter using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Use the context data provided to fill in specific details. If any information is missing, use professional placeholders.
      DO NOT USE GENERIC PLACEHOLDERS like "[Employee Name]" if a name is provided in the context above.

      Return ONLY valid JSON with this structure:
      {
        "title": "Employee Warning Letter",
        "date": "${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "companyName": "${context.companyName || context.company || brandContext.name}",
        "employeeName": "${context.employeeName || context.employee || context.candidate || '[Employee Name]'}",
        "position": "${context.position || '[Job Title]'}",
        "warningType": "${context.warningType || 'Written Warning'}",
        "issueDescription": "${context.issueDescription || 'performance concern'}",
        "nextSteps": [
          "Immediate improvement in performance and conduct",
          "Adherence to all company policies",
          "Regular reviews with supervisor"
        ],
        "contactPerson": "${context.hrName || 'HR Manager'}"
      }`;

    } else if (effectiveType === "nda") {
      // Parse structured input data from topic (pipes)
      const inputData = {};
      if (topic.includes('|')) {
        topic.split('|').forEach(pair => {
          const [key, value] = pair.split(':').map(s => s.trim());
          if (key && value) {
            inputData[key.toLowerCase().replace(/\s+/g, '')] = value;
          }
        });
      }

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for nda:`, context);

      userPrompt = `Generate a comprehensive Non-Disclosure Agreement using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Use the context data provided to fill in specific details.
      Return ONLY valid JSON with this structure:
      {
        "title": "Non-Disclosure Agreement (NDA)",
        "date": "${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "disclosingParty": "${context.disclosingParty || context.company || brandContext.name}",
        "receivingParty": "${context.receivingParty || context.otherparty || '[Receiving Party Name]'}",
        "effectiveDate": "${context.effectiveDate || context.effectivedate || '[Agreement Date]'}",
        "purpose": "${context.purpose || 'Business discussions'}",
        "governingLaw": "${context.governingLaw || 'applicable local laws'}"
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for service_agreement:`, context);

      userPrompt = `Generate a comprehensive Service Agreement using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Use the context data provided to fill in specific details.
      Return ONLY valid JSON with this structure:
      {
        "title": "Service Agreement",
        "date": "${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "serviceProvider": "${context.serviceProvider || context.company || brandContext.name}",
        "client": "${context.client || context.otherparty || '[Client Name]'}",
        "effectiveDate": "${context.effectiveDate || context.effectivedate || '[Agreement Date]'}",
        "serviceDescription": "${context.purpose || context.serviceDescription || 'Professional services'}",
        "paymentTerms": "${context.paymentTerms || 'As per invoice'}"
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for mou:`, context);

      userPrompt = `Generate a Memorandum of Understanding using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Return ONLY valid JSON with this structure:
      {
        "title": "Memorandum of Understanding (MOU)",
        "date": "${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "party1": "${context.party1 || context.company || brandContext.name}",
        "party2": "${context.party2 || context.otherparty || '[Second Party Name]'}",
        "effectiveDate": "${context.effectiveDate || context.effectivedate || '[Agreement Date]'}",
        "purpose": "${context.purpose || 'Mutual cooperation'}"
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for invoice:`, context);

      userPrompt = `Generate a professional, detailed Invoice using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      PRIORITY: If 'items' array is provided in CONTEXT DATA, use it exactly.
      If 'clientName' or 'customerName' is provided, use it for the 'to' section.

      Return ONLY valid JSON with this structure:
      {
        "title": "Invoice",
        "invoiceNumber": "${context.invoiceNumber || 'INV-' + Date.now().toString().slice(-6)}",
        "invoiceDate": "${context.invoiceDate || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "from": {
          "company": "${context.fromCompany || brandContext.name}",
          "address": "${context.fromAddress || '[Company Address]'}"
        },
        "to": {
          "client": "${context.toClient || context.client || context.customerName || context.clientName || '[Client Name]'}",
          "address": "${context.toAddress || '[Client Address]'}"
        },
        "items": ${context.items ? JSON.stringify(context.items) : `[
          {
            "description": "${context.description || 'Professional Services'}",
            "quantity": "${context.quantity || 1}",
            "rate": "${context.rate || context.amount || 0}",
            "amount": "${context.amount || 0}"
          }
        ]`},
        "subtotal": "${context.subtotal || context.amount || 0}",
        "tax": "${context.tax || 0}",
        "total": "${context.total || context.amount || 0}",
        "dueDate": "${context.dueDate || context.duedate || '[Due Date]'}"
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for purchase_order:`, context);

      userPrompt = `Generate a professional Purchase Order using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      PRIORITY: If 'items' array is provided in CONTEXT DATA, use it exactly.
      If 'supplierName' is provided, use it.

      Return ONLY valid JSON with this structure:
      {
        "title": "Purchase Order",
        "poNumber": "${context.poNumber || 'PO-' + Date.now().toString().slice(-6)}",
        "issueDate": "${context.issueDate || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "buyer": "${context.buyer || brandContext.name}",
        "supplier": "${context.supplier || context.supplierName || context.client || '[Supplier Name]'}",
        "items": ${context.items ? JSON.stringify(context.items) : `[
          {
            "itemNumber": "1",
            "description": "${context.items_desc || context.description || 'Goods/Services'}",
            "quantity": "${context.quantity || 1}",
            "unitPrice": "${context.rate || context.amount || 0}",
            "totalPrice": "${context.amount || 0}"
          }
        ]`},
        "totalAmount": "${context.total || context.amount || 0}",
        "deliveryDate": "${context.deliveryDate || context.duedate || '[Delivery Date]'}"
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for gst_invoice:`, context);

      userPrompt = `Generate a GST-compliant Tax Invoice using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      PRIORITY: If 'items' array is provided, use it. Include GST calculation (CGST/SGST/IGST).

      Return ONLY valid JSON with this structure:
      {
        "title": "Tax Invoice",
        "invoiceNumber": "${context.invoiceNumber || 'GST-INV-' + Date.now().toString().slice(-6)}",
        "invoiceDate": "${context.invoiceDate || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "supplier": {
          "legalName": "${context.supplierName || context.company || brandContext.name}",
          "gstin": "${context.supplierGSTIN || '[Supplier GSTIN]'}",
          "address": "${context.supplierAddress || '[Supplier Address]'}"
        },
        "buyer": {
          "legalName": "${context.buyerName || context.client || context.customerName || '[Buyer Name]'}",
          "gstin": "${context.buyerGSTIN || '[Buyer GSTIN]'}",
          "address": "${context.buyerAddress || '[Buyer Address]'}"
        },
        "items": ${context.items ? JSON.stringify(context.items) : `[
          {
            "description": "${context.description || 'Services'}",
            "hsnSac": "${context.hsnSac || '9983'}",
            "quantity": "${context.quantity || 1}",
            "rate": "${context.rate || context.amount || 0}",
            "taxableValue": "${context.amount || 0}",
            "cgst": "${(context.amount || 0) * 0.09}",
            "sgst": "${(context.amount || 0) * 0.09}",
            "total": "${(context.amount || 0) * 1.18}"
          }
        ]`},
        "grandTotal": "${context.total || (context.amount || 0) * 1.18}"
      }`;

    } else if (effectiveType === "compliance_certificate") {
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for compliance_certificate:`, context);

      userPrompt = `Generate a formal Compliance Certificate using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Return ONLY valid JSON with this structure:
      {
        "title": "Certificate of Compliance",
        "certificateNumber": "COMP-${Date.now().toString().slice(-6)}",
        "issueDate": "${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "entityName": "${context.entityName || context.company || brandContext.name}",
        "complianceType": "${context.complianceType || 'Standard Regulatory Compliance'}",
        "validityPeriod": "${context.validity || 'One Year'}",
        "authorizedBy": "${context.authorizedBy || 'Compliance Officer'}"
      }`;

    } else if (effectiveType === "dpa") {
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for dpa:`, context);

      userPrompt = `Generate a formal Data Processing Agreement (DPA) using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      Return ONLY valid JSON with this structure:
      {
        "title": "Data Processing Agreement",
        "date": "${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "controller": "${context.controller || brandContext.name}",
        "processor": "${context.processor || context.otherparty || '[Processor Name]'}",
        "effectiveDate": "${context.effectiveDate || '[Effective Date]'}",
        "securityMeasures": [
          "Encryption of personal data at rest and in transit",
          "Regular security audits and vulnerability assessments",
          "Strict access controls and identity management"
        ]
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
