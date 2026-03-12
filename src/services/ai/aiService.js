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

const generateContent = async (type, topic, brandContext, providedData = {}, aiQuality = "basic") => {
  console.log(`🤖 AI Generating content for: ${type} - ${topic}`);
  console.log(`🎨 Brand Context: ${JSON.stringify(brandContext)}`);
  console.log(`📋 Provided Data: ${JSON.stringify(providedData)}`);
  console.log(`⚡ AI Quality: ${aiQuality}`);

  try {
    let systemPrompt = `You are ProfessionalDocAI by MM Docs (MediaaMasala) — an expert Indian business & legal document generator.

CRITICAL RULES — NEVER BREAK THEM:
1. Use ONLY the data given (document type + form fields key-value pairs). NEVER invent, assume, add or hallucinate names, dates, amounts, addresses, clauses, GST rates, notice periods, PF/ESI applicability, etc.
2. If any CRITICAL field is missing for that document type, use professional placeholders like "[Company Name]" or "[Employee Name]".
3. Language = formal Indian business English throughout.
4. Dates = DD/MM/YYYY format always.
5. Currency = INR with words in brackets (e.g. ₹85,000 (Rupees Eighty Five Thousand Only)).
6. Use real Indian compliance style (Labour Codes 2019/2020, GST rules, DPDP Act 2023 references where relevant).

MANDATORY DISCLAIMER (include in every document's "disclaimer" field):
"This is an AI-generated template document based solely on the information provided by the user. It is NOT legal, tax, financial, HR or compliance advice. Laws (including Labour Codes 2019/2020 as implemented from 2025 onward, GST rules, DPDP Act 2023, etc.) change over time. It is mandatory to have this reviewed, customized and approved by a qualified Indian lawyer, Chartered Accountant, Company Secretary or compliance expert before signing or using. xAI / this tool bears no liability."

GOVERNING LAW CLAUSE (for agreements/contracts, include in "governingLaw" field):
"This document shall be governed by the laws of India. Subject to [City mentioned or Mumbai if not given] jurisdiction."

SIGNATURE BLOCKS (include in "signatureBlocks" field for all documents):
Include proper signature blocks with Name, Designation, Company Name, and Date fields for all parties.

TONE REQUIREMENTS:
🔴 MANDATORY: ALL content MUST be STRICTLY PROFESSIONAL, FORMAL, and BUSINESS-APPROPRIATE.
🔴 NEVER use casual, conversational, or informal language.
🔴 Use formal greetings ("Dear"), formal closings ("Yours faithfully", "Yours sincerely"), and business-standard language.
🔴 Documents should feel like they were drafted by a top-tier Indian corporate legal/HR/finance department.
🔴 No emojis, no casual language, no informal expressions.

DOCUMENT STRUCTURES:
A. HR DOCUMENTS (Offer/Appointment/Experience/Warning Letters):
   - Company letterhead style → Date (DD/MM/YYYY) → To: Name & address → Subject → Salutation → Body → Terms → Signature blocks
   - Include social security entitlements (PF/ESI/Gratuity) if data provided
   - Reference applicable Indian labour laws

B. AGREEMENTS & LEGAL (NDA/Service Agreement/MOU):
   - Title → Date → Parties with addresses → Recitals (WHEREAS...) → Definitions → Clauses → Governing Law → Signatures
   - Use Indian legal terminology and compliance standards

C. FINANCIAL (Invoice/GST Invoice/Purchase Order):
   - GST compliant fields (GSTIN, HSN/SAC, Place of Supply, CGST/SGST/IGST)
   - Amount in figures AND words (INR)
   - Bank details section
   - Proper tax breakup tables

D. BUSINESS (Proposals/Quotations/Company Profiles):
   - Professional Indian business format
   - All amounts in INR
   - Indian business terminology

BRAND KIT INTEGRATION:
- Company Name: ${brandContext.name}
- Tone: ${brandContext.tone || "Strictly Professional and Formal"}
- Context: ${brandContext.description || "N/A"}
- Primary Brand Color: ${brandContext.primaryColor || "#1e40af"}
- Secondary Color: ${brandContext.secondaryColor || "#64748b"}
- Accent Color: ${brandContext.accentColor || "#3b82f6"}
- Brand Font: ${brandContext.fontFamily || "Inter"}
${brandContext.website ? `- Company Website: ${brandContext.website}` : ''}
${brandContext.email ? `- Company Email: ${brandContext.email}` : ''}
${brandContext.phone ? `- Company Phone: ${brandContext.phone}` : ''}
${brandContext.address ? `- Company Address: ${brandContext.address}` : ''}

CRITICAL: Use provided form data EXACTLY as given. PRIORITIZE PROVIDED FORM DATA over any generated placeholders.
Return ONLY valid, richly detailed, FORMALLY WRITTEN JSON document content. No commentary.`;

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

    // For structured compliance documents, skip AI call and use template-based generation
    const structuredDocTypes = ['audit_report', 'gst_filing_summary', 'gst_filing', 'policy_document', 'regulatory_filing'];
    if (structuredDocTypes.includes(effectiveType)) {
      console.log(`✅ Using structured template for ${effectiveType} - skipping AI API call`);
      return generateMockContent(effectiveType, topic, providedData, brandContext);
    }

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

      userPrompt = `Create a HIGHLY PROFESSIONAL, INDIAN BUSINESS-STANDARD Proposal using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      INDIAN BUSINESS FORMAT:
      - Use DD/MM/YYYY date format
      - All amounts in INR (₹) with words in brackets
      - Professional Indian business language
      - Include scope, deliverables, timelines, pricing table, payment terms
      - Include disclaimer at the end
      
      Return ONLY valid JSON with this exact structure:
      {
        "title": "Business Proposal: ${context.topic || topic}",
        "date": "${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}",
        "preparedFor": "${context.clientName || context.customerName || '[Client Name]'}",
        "preparedBy": "${context.companyName || brandContext.name}",
        "executiveSummary": "A powerful, multi-paragraph opening statement.",
        "proposedSolution": {
          "overview": "A thorough, detailed explanation.",
          "coreModules": ["Module 1", "Module 2", "Module 3"]
        },
        "pricingTable": [{ "item": "Service Description", "amount": "₹0" }],
        "totalAmount": "₹0 (Rupees [Amount in Words] Only)",
        "paymentTerms": "50% advance, 50% on completion",
        "validity": "30 days from the date of this proposal",
        "disclaimer": "This is an AI-generated template. Have this reviewed before use.",
        "signatureBlocks": {
          "proposer": { "name": "________________", "designation": "Authorised Signatory", "company": "${context.companyName || brandContext.name}", "date": "________________" }
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

      userPrompt = `Generate a PROFESSIONAL, INDIAN BUSINESS-STANDARD Quotation using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      INDIAN BUSINESS FORMAT:
      - Use DD/MM/YYYY date format
      - All amounts in INR (₹) with words in brackets
      - Include GST applicability note (if applicable)
      - Professional Indian business language
      - Include items table, total, GST note, payment terms, validity, bank details

      PRIORITY: If 'items' array is provided in CONTEXT DATA, use it exactly.
      Return ONLY valid JSON with this structure:
      {
        "title": "Commercial Quotation for ${context.topic || topic}",
        "quoteNumber": "QTN/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}",
        "date": "${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}",
        "client": "${context.clientName || context.customerName || context.client || '[Client Name]'}",
        "items": ${context.items ? JSON.stringify(context.items) : `[
          { "sno": 1, "description": "${context.description || 'Professional Services'}", "amount": "₹${context.amount || 0}" }
        ]`},
        "subtotal": "₹${context.subtotal || context.amount || 0}",
        "gstNote": "GST as applicable shall be charged extra at prevailing rates.",
        "total": "₹${context.total || context.amount || 0}",
        "totalInWords": "Rupees [Amount in Words] Only",
        "paymentTerms": ["50% advance along with purchase order", "50% on completion/delivery"],
        "validity": "30 days from the date of this quotation",
        "disclaimer": "This is an AI-generated template. Verify all details and pricing before use.",
        "signatureBlocks": {
          "authorised": { "name": "________________", "designation": "Authorised Signatory", "company": "${context.companyName || brandContext.name}", "date": "________________" }
        }
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

      userPrompt = `Create a PROFESSIONALLY STRUCTURED, CORPORATE-LEVEL Company Profile using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      TONE REQUIREMENT: This is an official corporate profile. Use FORMAL, PROFESSIONAL language.
      - Write as if creating an official company document
      - Use sophisticated business language and structured formatting
      - Maintain authoritative, corporate tone throughout
      - NO casual language
      
      Return ONLY valid JSON with this exact structure:

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

      userPrompt = `Write a PROFESSIONALLY PERSUASIVE, BUSINESS-FORMAL Marketing Brief or B2B Email using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      TONE REQUIREMENT: This is a professional B2B business communication. Use PERSUASIVE yet FORMAL language.
      - Write as if from a senior business development executive
      - Use sophisticated business terminology and strategic language
      - Balance persuasive tone with professional formality
      - NO casual expressions, NO overly friendly language
      - Maintain executive-level polish throughout
      
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

      userPrompt = `Create a PROFESSIONALLY STRUCTURED, EXECUTIVE-QUALITY Resume using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      TONE REQUIREMENT: This is a professional resume/CV. Use FORMAL, PROFESSIONAL language.
      - Write as if crafted by a professional career consultant
      - Use sophisticated professional terminology and achievement-focused language
      - Maintain polished, executive-level tone throughout
      - Focus on quantifiable achievements and professional accomplishments
      - NO casual language, NO first-person informal expressions
      
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

      userPrompt = `Generate a STRICTLY FORMAL, INDIAN BUSINESS-STANDARD Employment Offer Letter using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      INDIAN COMPLIANCE REQUIREMENTS:
      - Use DD/MM/YYYY date format
      - Salary in INR with words in brackets (e.g. ₹18,00,000 (Rupees Eighteen Lakh Only) per annum)
      - Include CTC breakup if salary is provided (Basic, HRA, DA, Special Allowance, PF, ESI if applicable)
      - Mention probation period (default 6 months if not specified)
      - Mention notice period (default 1 month during probation, 2 months post-confirmation)
      - Reference applicable Indian Labour Codes 2019/2020
      - Include PF/ESI/Gratuity applicability section
      - Use "Dear Mr./Ms. [Last Name]," as greeting
      - Use "Yours faithfully" as closing

      DO NOT USE GENERIC PLACEHOLDERS if a name/value is provided in the context above.

      Return ONLY valid JSON with this structure:
      {
        "title": "Employment Offer Letter",
        "date": "${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}",
        "companyName": "${context.companyName || context.company || brandContext.name}",
        "candidateName": "${context.candidateName || context.employee || context.candidate || '[Candidate Name]'}",
        "position": "${context.position || '[Job Title]'}",
        "department": "${context.department || '[Department]'}",
        "startDate": "${context.startDate || context.startdate || '[Start Date in DD/MM/YYYY]'}",
        "salary": "${context.salary || '[Annual CTC in INR]'}",
        "salaryInWords": "Rupees [Amount in Words] Only per annum",
        "reportingTo": "${context.reportingTo || context.reportingto || '[Direct Supervisor/Manager Name]'}",
        "workLocation": "${context.workLocation || '[Office Location]'}",
        "workingHours": "${context.workingHours || 'Monday to Saturday, 9:30 AM to 6:30 PM (as per company policy)'}",
        "probationPeriod": "${context.probationPeriod || '6 months from date of joining'}",
        "noticePeriod": "${context.noticePeriod || '1 month during probation, 2 months post-confirmation'}",
        "benefits": "As per company policy including PF, ESI (if applicable), Gratuity, Leave entitlements as per the applicable Labour Codes",
        "termsAndConditions": "Employment is subject to verification of documents. Employee shall abide by the company's code of conduct, HR policies, and applicable Indian laws.",
        "nextSteps": "Kindly sign and return this letter within 7 working days as acceptance. Report on the date of joining with original documents.",
        "hrContactPerson": "${context.hrContactPerson || context.contactPerson || 'HR Manager'}",
        "closingMessage": "We are confident that your association with us shall be mutually rewarding. We look forward to welcoming you to the team.",
        "disclaimer": "This is an AI-generated template document based solely on the information provided by the user. It is NOT legal, tax, financial, HR or compliance advice. Laws change over time. Have this reviewed by a qualified professional before signing.",
        "signatureBlocks": {
          "authorised": { "name": "________________", "designation": "Authorised Signatory", "company": "${context.companyName || brandContext.name}", "date": "________________" },
          "candidate": { "name": "${context.candidateName || '[Candidate Name]'}", "date": "________________" }
        }
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

      userPrompt = `Generate a STRICTLY FORMAL, INDIAN BUSINESS-STANDARD Appointment Letter using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      INDIAN COMPLIANCE REQUIREMENTS:
      - Use DD/MM/YYYY date format
      - Salary in INR with words in brackets (e.g. ₹12,00,000 (Rupees Twelve Lakh Only) per annum)
      - Include CTC breakup structure (Basic Pay, HRA, Conveyance, Special Allowance, PF Employer, etc.)
      - Mention probation period, notice period, and confirmation criteria
      - Reference applicable Indian Labour Codes 2019/2020
      - Include PF/ESI/Gratuity/Leave entitlements
      - Use "Dear Mr./Ms. [Last Name]," as greeting
      - Use "Yours faithfully" as closing
      - This is NOW MANDATORY under new Labour Codes

      DO NOT USE GENERIC PLACEHOLDERS if a name/value is provided in the context above.

      Return ONLY valid JSON with this structure:
      {
        "title": "Letter of Appointment",
        "date": "${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}",
        "companyName": "${context.companyName || context.company || brandContext.name}",
        "employeeName": "${context.employeeName || context.employee || context.candidate || '[Employee Name]'}",
        "position": "${context.position || '[Job Title]'}",
        "department": "${context.department || '[Department]'}",
        "appointmentDate": "${context.appointmentDate || context.startdate || context.startDate || '[Appointment Date in DD/MM/YYYY]'}",
        "salary": "${context.salary || '[Annual CTC in INR]'}",
        "salaryInWords": "Rupees [Amount in Words] Only per annum",
        "employeeId": "${context.employeeId || '[Employee ID to be assigned]'}",
        "reportingStructure": "${context.reportingTo ? `You will report directly to ${context.reportingTo}` : `You will report directly to the ${context.department || 'Department'} Head`}",
        "keyResponsibilities": [
          "Execute core ${context.position || 'role'} functions with excellence and professionalism",
          "Collaborate effectively with team members and cross-functional departments",
          "Maintain high standards of work quality and meet established deadlines",
          "Participate in professional development and training programs",
          "Adhere to all company policies, procedures, and code of conduct"
        ],
        "probationPeriod": "${context.probationPeriod || '6 months from date of joining'}",
        "noticePeriod": "${context.noticePeriod || '1 month during probation, 2 months post-confirmation'}",
        "socialSecurity": "Employee shall be entitled to Provident Fund, ESI (if applicable), and Gratuity as per applicable Indian laws.",
        "leaveEntitlement": "As per company leave policy and applicable labour laws (Earned Leave, Casual Leave, Sick Leave).",
        "hrContactPerson": "${context.hrContactPerson || context.contactPerson || 'HR Manager'}",
        "closingMessage": "We look forward to a mutually beneficial and long-term professional relationship.",
        "governingLaw": "This appointment shall be governed by the laws of India. Subject to ${context.city || 'Mumbai'} jurisdiction.",
        "disclaimer": "This is an AI-generated template document. It is NOT legal, tax, financial, HR or compliance advice. Have this reviewed by a qualified professional before signing.",
        "signatureBlocks": {
          "authorised": { "name": "________________", "designation": "Authorised Signatory", "company": "${context.companyName || brandContext.name}", "date": "________________" },
          "employee": { "name": "${context.employeeName || '[Employee Name]'}", "date": "________________" }
        }
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

      userPrompt = `Generate a PROFESSIONAL, INDIAN-STANDARD Experience Certificate / Relieving Letter using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      INDIAN HR STANDARDS:
      - Use DD/MM/YYYY date format
      - Address: "To Whomsoever It May Concern"
      - Begin with "This is to certify that..."
      - Include: Period of employment, Designation held, Last drawn salary (if given)
      - Include character and conduct assessment
      - Include best wishes and recommendation
      - Use formal Indian business English
      - Reference that employee is relieved of duties with effect from [date]

      DO NOT USE GENERIC PLACEHOLDERS if a name/value is provided in the context above.

      Return ONLY valid JSON with this structure:
      {
        "title": "Experience Certificate",
        "date": "${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}",
        "companyName": "${context.companyName || context.company || brandContext.name}",
        "employeeName": "${context.employeeName || context.employee || context.candidate || '[Employee Name]'}",
        "position": "${context.position || '[Job Title]'}",
        "department": "${context.department || '[Department]'}",
        "startDate": "${context.startDate || context.startdate || '[Start Date in DD/MM/YYYY]'}",
        "endDate": "${context.endDate || context.enddate || '[End Date in DD/MM/YYYY]'}",
        "performance": "During the tenure of employment, the above-named employee demonstrated exemplary professional conduct, dedication, and integrity.",
        "skills": "${context.skills || 'professionalism, dedication, teamwork, and strong work ethic'}",
        "characterAssessment": "We found the above-named employee to be a person of good moral character and professional conduct.",
        "recommendation": "We wish them all the very best in their future endeavours and recommend them for suitable opportunities.",
        "hrContactPerson": "${context.hrContactPerson || context.hrName || 'HR Manager'}",
        "certificateId": "EXP/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}",
        "disclaimer": "This is an AI-generated template. Verify all details before issuing.",
        "signatureBlocks": {
          "authorised": { "name": "________________", "designation": "Authorised Signatory / HR Head", "company": "${context.companyName || brandContext.name}", "date": "________________", "companyStamp": "[Company Seal]" }
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for onboarding_letter:`, context);

      userPrompt = `Generate a PROFESSIONALLY STRUCTURED, BUSINESS-FORMAL Onboarding Letter using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      TONE REQUIREMENT: This is an official onboarding welcome letter. Use WARM yet PROFESSIONAL language.
      - Balance welcoming tone with professional formality
      - Write as if from a professional HR team
      - Use formal business language while being welcoming
      - NO overly casual expressions
      
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

      userPrompt = `Generate a STRICTLY FORMAL, LEGALLY APPROPRIATE Warning Letter using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      TONE REQUIREMENT: This is a formal disciplinary document. Use STRICTLY FORMAL, AUTHORITATIVE language.
      - Write as if from a corporate HR/legal department
      - Use formal, serious tone appropriate for disciplinary action
      - Maintain professional, legally sound language throughout
      - NO casual language whatsoever
      
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

      userPrompt = `Generate a LEGALLY PROFESSIONAL, INDIAN-STANDARD Non-Disclosure Agreement using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      INDIAN LEGAL REQUIREMENTS:
      - Use DD/MM/YYYY date format
      - Include WHEREAS recitals
      - Use Indian legal terminology (Indian Contract Act, 1872 references)
      - Include DPDP Act 2023 data protection compliance references
      - Structured clauses: Definitions, Obligations, Exclusions, Term, Return of Info, Remedies
      - Include proper governing law clause with Indian city jurisdiction
      - Include arbitration clause mentioning Arbitration and Conciliation Act, 1996

      Return ONLY valid JSON with this structure:
      {
        "title": "Non-Disclosure Agreement (NDA)",
        "date": "${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}",
        "disclosingParty": "${context.disclosingParty || context.company || brandContext.name}",
        "disclosingPartyAddress": "${context.disclosingPartyAddress || '[Registered Office Address]'}",
        "receivingParty": "${context.receivingParty || context.otherparty || '[Receiving Party Name]'}",
        "receivingPartyAddress": "${context.receivingPartyAddress || '[Registered Office Address]'}",
        "effectiveDate": "${context.effectiveDate || context.effectivedate || '[Agreement Date in DD/MM/YYYY]'}",
        "purpose": "${context.purpose || 'Business discussions and potential collaboration'}",
        "confidentialInformation": ["Technical data, trade secrets, know-how, research, product plans", "Financial information, business strategies, client lists", "Any information marked or designated as 'Confidential'", "Information that would reasonably be considered confidential"],
        "obligations": ["Hold and maintain Confidential Information in strict confidence", "Not disclose to any third parties without prior written consent", "Use solely for the purpose stated in this agreement", "Take reasonable precautions to protect confidentiality", "Return or destroy all Confidential Information upon request"],
        "exceptions": ["Information publicly available through no breach of this agreement", "Information known prior to disclosure", "Information independently developed without use of Confidential Information", "Information required to be disclosed by law or court order (with prior notice)"],
        "duration": "${context.duration || '3 years from the effective date'}",
        "remedies": "The Disclosing Party shall be entitled to seek injunctive relief and monetary damages for any breach.",
        "governingLaw": "This agreement shall be governed by the laws of India. Subject to ${context.city || 'Mumbai'} jurisdiction.",
        "arbitration": "Any dispute shall be resolved through arbitration as per the Arbitration and Conciliation Act, 1996.",
        "disclaimer": "This is an AI-generated template. It is NOT legal advice. Have this reviewed by a qualified Indian lawyer before signing.",
        "signatureBlocks": {
          "disclosingParty": { "name": "________________", "designation": "Authorised Signatory", "company": "${context.disclosingParty || brandContext.name}", "date": "________________" },
          "receivingParty": { "name": "________________", "designation": "Authorised Signatory", "company": "${context.receivingParty || '[Receiving Party]'}", "date": "________________" }
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

      // Merge with providedData from frontend form
      const context = { ...providedData, ...inputData };
      console.log(`📋 Consolidated context for service_agreement:`, context);

      userPrompt = `Generate a LEGALLY PROFESSIONAL, FORMALLY STRUCTURED Service Agreement using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      TONE REQUIREMENT: This is a legal service contract. Use STRICTLY FORMAL, LEGALLY APPROPRIATE language.
      - Write as if drafted by a corporate legal team
      - Use formal contract terminology and structured clauses
      - Maintain authoritative, professional tone throughout
      - NO casual language whatsoever
      
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

      userPrompt = `Generate a LEGALLY FORMAL, PROFESSIONALLY BINDING Memorandum of Understanding using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      TONE REQUIREMENT: This is a formal legal agreement. Use STRICTLY FORMAL, LEGALLY APPROPRIATE language.
      - Write as if drafted by corporate legal counsel
      - Use formal legal terminology and structured format
      - Maintain authoritative, professional tone throughout
      - NO casual language whatsoever
      
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

      userPrompt = `Generate a GST-COMPLIANT, INDIAN-STANDARD Tax Invoice using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      INDIAN GST COMPLIANCE (Rule 46):
      - Invoice number MUST be unique serial for the financial year
      - Date in DD/MM/YYYY format
      - Supplier name, address, and GSTIN (mandatory)
      - Recipient name, address, and GSTIN (if registered)
      - Place of Supply (State)
      - HSN/SAC codes for each item
      - Description, Quantity/Unit, Rate per unit
      - Taxable Value for each item
      - CGST/SGST rates and amounts (intra-state) OR IGST rate and amount (inter-state)
      - Total Amount in figures AND words (INR)
      - Bank details section for payment
      - All amounts in INR (₹)

      PRIORITY: If 'items' array is provided in CONTEXT DATA, use it exactly.

      Return ONLY valid JSON with this structure:
      {
        "title": "Tax Invoice",
        "invoiceNumber": "${context.invoiceNumber || 'INV/' + new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().slice(-2) + '/' + Date.now().toString().slice(-4)}",
        "invoiceDate": "${context.invoiceDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}",
        "placeOfSupply": "${context.placeOfSupply || '[State Name]'}",
        "from": {
          "company": "${context.fromCompany || brandContext.name}",
          "address": "${context.fromAddress || '[Registered Office Address]'}",
          "gstin": "${context.fromGSTIN || context.gstNumber || '[Supplier GSTIN]'}",
          "pan": "${context.fromPAN || '[PAN Number]'}",
          "stateCode": "${context.fromStateCode || '[State Code]'}"
        },
        "to": {
          "client": "${context.toClient || context.client || context.customerName || context.clientName || '[Client/Buyer Name]'}",
          "address": "${context.toAddress || '[Client Address]'}",
          "gstin": "${context.toGSTIN || context.clientGST || '[Client GSTIN (if registered)]'}",
          "stateCode": "${context.toStateCode || '[State Code]'}"
        },
        "items": ${context.items ? JSON.stringify(context.items) : `[
          {
            "sno": 1,
            "description": "${context.description || 'Professional Services'}",
            "hsnSac": "${context.hsnSac || '998311'}",
            "quantity": "${context.quantity || 1}",
            "unit": "${context.unit || 'Nos'}",
            "rate": "${context.rate || context.amount || 0}",
            "taxableValue": "${context.amount || 0}",
            "cgstRate": "9%",
            "cgstAmount": "0",
            "sgstRate": "9%",
            "sgstAmount": "0"
          }
        ]`},
        "subtotal": "${context.subtotal || context.amount || 0}",
        "cgstTotal": "${context.cgstTotal || 0}",
        "sgstTotal": "${context.sgstTotal || 0}",
        "igstTotal": "${context.igstTotal || 0}",
        "total": "${context.total || context.amount || 0}",
        "totalInWords": "Rupees [Amount in Words] Only",
        "dueDate": "${context.dueDate || context.duedate || '[Due Date in DD/MM/YYYY]'}",
        "paymentTerms": "${context.paymentTerms || 'Net 30 days from invoice date'}",
        "bankDetails": {
          "bankName": "${context.bankName || '[Bank Name]'}",
          "accountNumber": "${context.accountNumber || '[A/c Number]'}",
          "ifscCode": "${context.ifscCode || '[IFSC Code]'}",
          "branch": "${context.branch || '[Branch Name]'}"
        },
        "notes": "${context.notes || 'Thank you for your business. Payment is due as per terms mentioned above.'}",
        "disclaimer": "This is an AI-generated template document. Verify all tax calculations and GST compliance with a qualified CA before use.",
        "signatureBlocks": {
          "authorised": { "name": "________________", "designation": "Authorised Signatory", "company": "${context.fromCompany || brandContext.name}", "date": "________________" }
        }
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

      userPrompt = `Generate a PROFESSIONALLY FORMATTED, BUSINESS-STANDARD Purchase Order using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      TONE REQUIREMENT: This is an official procurement document. Use FORMAL, PROFESSIONAL language.
      - Write as if issued by a corporate procurement department
      - Use formal business terms and structured formatting
      - Maintain professional, authoritative tone throughout
      - NO casual language
      
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

      userPrompt = `Generate a LEGALLY COMPLIANT, PROFESSIONALLY STRUCTURED GST Tax Invoice using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      TONE REQUIREMENT: This is an official tax invoice document. Use STRICTLY FORMAL, REGULATORY-COMPLIANT language.
      - Write as if issued by a professional accounting department
      - Use formal tax and accounting terminology
      - Maintain professional, legally compliant tone throughout
      - Ensure GST compliance standards are reflected
      - NO casual language whatsoever
      
      PRIORITY: If 'items' array is provided, use it. Include GST calculation (CGST/SGST/IGST).

      Return ONLY valid JSON with this structure:
      {
        "title": "Tax Invoice",
        "invoiceNumber": "${context.invoiceNumber || 'GST-INV-' + Date.now().toString().slice(-6)}",
        "invoiceDate": "${context.invoiceDate || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}",
        "dueDate": "${context.dueDate || '[Due Date]'}",
        "companyName": "${context.supplierName || context.company || brandContext.name}",
        "companyAddress": "${context.supplierAddress || '[Supplier Address]'}",
        "gstNumber": "${context.supplierGSTIN || '[Supplier GSTIN]'}",
        "clientName": "${context.buyerName || context.client || context.customerName || '[Buyer Name]'}",
        "clientAddress": "${context.buyerAddress || '[Buyer Address]'}",
        "clientGST": "${context.buyerGSTIN || '[Buyer GSTIN]'}",
        "items": ${context.items ? JSON.stringify(context.items) : `[
          {
            "description": "${context.description || 'Services'}",
            "hsn": "${context.hsn || '998314'}",
            "quantity": "${context.quantity || 1}",
            "rate": "${context.rate || context.amount || 0}",
            "amount": "${context.amount || 0}"
          }
        ]`},
        "subtotal": "${context.subtotal || context.amount || 0}",
        "taxAmount": "${context.taxAmount || (context.amount || 0) * 0.18}",
        "cgstAmount": "${(context.amount || 0) * 0.09}",
        "sgstAmount": "${(context.amount || 0) * 0.09}",
        "totalAmount": "${context.total || (context.amount || 0) * 1.18}"
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

      userPrompt = `Generate a REGULATORY-COMPLIANT, PROFESSIONALLY CERTIFIED Compliance Certificate using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      TONE REQUIREMENT: This is an official regulatory certificate. Use STRICTLY FORMAL, AUTHORITATIVE language.
      - Write as if issued by a compliance/regulatory authority
      - Use formal regulatory terminology and official certificate language
      - Maintain authoritative, professional tone throughout
      - NO casual language whatsoever
      
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

      userPrompt = `Generate a LEGALLY BINDING, GDPR-COMPLIANT Data Processing Agreement using the following context:
      
      CONTEXT DATA:
      ${JSON.stringify(context, null, 2)}

      TONE REQUIREMENT: This is a formal legal data privacy agreement. Use STRICTLY FORMAL, LEGALLY PRECISE language.
      - Write as if drafted by a data privacy legal team
      - Use formal GDPR/data protection terminology
      - Maintain authoritative, legally compliant tone throughout
      - NO casual language whatsoever
      
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
      userPrompt = `Create a HIGHLY DETAILED, EXECUTIVE-LEVEL Strategic Document or Pitch Deck for: "${topic}".
      
      TONE REQUIREMENT: This is a strategic executive document. Use FORMAL, SOPHISTICATED BUSINESS language.
      - Write as if presenting to investors, board members, or C-level executives
      - Use sophisticated business terminology and strategic language
      - Maintain corporate polish and authoritative tone throughout
      - NO casual expressions, NO informal language
      - Every section should sound like professional strategy consultants wrote it
      
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

    // Set max_tokens based on AI quality (Free: 2000, Pro: 8000)
    const maxTokens = aiQuality === "premium" ? 8000 : 2000;
    console.log(`🎯 Max tokens for ${aiQuality} quality: ${maxTokens}`);

    const response = await openai.chat.completions.create({
      model: isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
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
    console.error("❌ Full Error:", error);

    // Provide specific error messages for common issues
    if (error.message.includes('Invalid API key') || error.message.includes('Invalid token')) {
      console.error("🔑 API Key Issue: Please check your OpenRouter API key in the .env file");
      console.error("💡 Make sure your API key starts with 'sk-or-v1-' for OpenRouter");
    } else if (error.message.includes('insufficient_quota') || error.message.includes('rate_limit')) {
      console.error("💳 Quota/Rate Limit: Please check your OpenRouter account credits and rate limits");
    } else if (error.message.includes('model_not_found')) {
      console.error("🤖 Model Issue: The requested model may not be available on OpenRouter");
    }

    console.warn("⚠️⚠️⚠️ AI GENERATION FAILED - Using fallback with your form data ⚠️⚠️⚠️");
    console.log("📦 Form data that will be used:", providedData);
    // Critical: Fallback should use the effective type if possible
    const fallbackType = ["ask", "research", "build", "other"].includes(type.toLowerCase()) ?
      (topic.toLowerCase().includes("resume") ? "resume" :
        topic.toLowerCase().includes("proposal") ? "proposal" :
          topic.toLowerCase().includes("marketing brief") ? "marketing_brief" : type) : type;
    return generateMockContent(fallbackType, topic, providedData, brandContext);
  }
};

// Helper function to convert user notes to professional appreciation text
const generateProfessionalAppreciation = (rawInput, employeeName, position) => {
  if (!rawInput || rawInput.trim().length === 0) {
    return "During their tenure, the employee demonstrated professional competence and dedication to their responsibilities.";
  }

  // Extract key skills and qualities from the input
  const text = rawInput.toLowerCase();
  const skills = [];
  const qualities = [];
  
  // Skill keywords
  if (text.includes('ui/ux') || text.includes('ui') || text.includes('ux') || text.includes('design')) {
    skills.push('UI/UX design and user experience optimization');
  }
  if (text.includes('wireframe') || text.includes('prototype')) {
    skills.push('wireframing and prototyping');
  }
  if (text.includes('user-centered') || text.includes('user behavior')) {
    skills.push('user-centered design methodologies');
  }
  if (text.includes('visual') || text.includes('aesthetic')) {
    skills.push('visual design and aesthetic refinement');
  }
  if (text.includes('functional') || text.includes('intuitive')) {
    skills.push('creating intuitive and functional interfaces');
  }
  if (text.includes('leadership')) {
    skills.push('team leadership and mentorship');
  }
  if (text.includes('collaborative') || text.includes('teamwork')) {
    qualities.push('collaborative spirit and excellent teamwork');
  }
  
  // Quality keywords
  if (text.includes('professional') || text.includes('dedication') || text.includes('dedicated')) {
    qualities.push('exceptional professionalism and dedication');
  }
  if (text.includes('exceeded') || text.includes('excel')) {
    qualities.push('consistently exceeding performance expectations');
  }
  if (text.includes('passionate') || text.includes('eager to learn')) {
    qualities.push('genuine passion for continuous learning and improvement');
  }
  if (text.includes('problem solving') || text.includes('solving')) {
    qualities.push('strong analytical and problem-solving abilities');
  }
  if (text.includes('attention to detail') || text.includes('detail')) {
    qualities.push('meticulous attention to detail');
  }

  // Build professional appreciation text
  let appreciation = `During their tenure with our organization, ${employeeName || 'the employee'} demonstrated exceptional professionalism, dedication, and competence in the role of ${position || 'their position'}.\n\n`;
  
  if (skills.length > 0) {
    appreciation += `**Key Competencies:**\n${employeeName || 'They'} excelled in ${skills.join(', ')}, consistently delivering high-quality work that exceeded organizational standards.\n\n`;
  }
  
  if (qualities.length > 0) {
    appreciation += `**Professional Qualities:**\n${employeeName || 'They'} exhibited ${qualities.join(', ')}. Their contributions significantly impacted team productivity and project success.\n\n`;
  }
  
  appreciation += `${employeeName || 'The employee'} consistently met performance targets, demonstrated strong work ethic, and maintained positive relationships with colleagues and stakeholders. Their professionalism and technical expertise made them a valuable asset to our organization.`;
  
  return appreciation;
};

// Fallback mock generation (in case API fails)
const generateMockContent = (type, topic, providedData = {}, brandContext = {}) => {
  console.log('🔄 Generating fallback content with provided data:', providedData);
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
    console.log('📝 Building offer letter fallback with data:', providedData);
    return {
      title: "Employment Offer Letter",
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      offerDate: providedData.offerDate || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      companyName: providedData.companyName || "MM Docs",
      companyAddress: providedData.companyAddress || "India",
      candidateName: providedData.candidateName || "[Candidate Name]",
      position: providedData.position || "[Job Title]",
      department: providedData.department || "[Department]",
      startDate: providedData.startDate || "[Start Date]",
      salary: providedData.salary || "[Annual Salary]",
      reportingTo: providedData.reportingTo || "[Direct Supervisor/Manager Name]",
      workLocation: providedData.workLocation || "[Office Location/Remote]",
      workingHours: providedData.workingHours || "Monday to Friday, 9:00 AM to 6:00 PM",
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
  } else if (effectiveType === "appointment_letter") {
    console.log('📝 Building appointment letter fallback with data:', providedData);
    return {
      title: "Letter of Appointment",
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      appointmentDate: providedData.appointmentDate || providedData.startDate || "[Appointment Date]",
      companyName: providedData.companyName || "MM Docs",
      companyAddress: providedData.companyAddress || "India",
      employeeName: providedData.employeeName || providedData.candidateName || "[Employee Name]",
      position: providedData.position || "[Job Title]",
      department: providedData.department || "[Department]",
      startDate: providedData.startDate || providedData.appointmentDate || "[Start Date]",
      salary: providedData.salary || "[Annual Salary]",
      employeeId: providedData.employeeId || "[To be assigned]",
      reportingTo: providedData.reportingTo || "[Reporting Manager]",
      workLocation: providedData.workLocation || "[Office Location]",
      probationPeriod: providedData.probationPeriod || "90 days",
      noticePeriod: providedData.noticePeriod || "30 days",
      keyResponsibilities: [
        `Execute core ${providedData.position || 'role'} functions with excellence and professionalism`,
        "Collaborate effectively with team members and cross-functional departments",
        "Maintain high standards of work quality and meet established deadlines",
        "Participate in professional development and training programs",
        "Adhere to all company policies, procedures, and code of conduct"
      ],
      termsAndConditions: [
        "Your appointment is subject to satisfactory completion of probationary period",
        "You will be governed by company rules, regulations, and policies",
        "Confidentiality of company information must be maintained at all times",
        "Employment can be terminated by either party with notice period as mentioned",
        "All previous employment contracts and agreements stand terminated"
      ],
      hrContactPerson: providedData.hrContactPerson || "HR Manager",
      closingMessage: "We look forward to a mutually beneficial and productive association."
    };
  } else if (effectiveType === "experience_certificate") {
    console.log('📝 Building experience certificate fallback with data:', providedData);
    
    // Generate professional appreciation from user's raw notes
    const professionalAppreciation = generateProfessionalAppreciation(
      providedData.workDescription,
      providedData.employeeName,
      providedData.position
    );
    
    return {
      title: "Experience Certificate",
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      certificateNumber: `EXP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      companyName: providedData.companyName || "MM Docs",
      companyAddress: providedData.companyAddress || "India",
      employeeName: providedData.employeeName || "[Employee Name]",
      position: providedData.position || "[Job Title]",
      department: providedData.department || "[Department]",
      joiningDate: providedData.joiningDate || "[Joining Date]",
      relievingDate: providedData.relievingDate || "[Relieving Date]",
      workDescription: professionalAppreciation,
      conductAndPerformance: "The employee exhibited professional conduct and satisfactory performance throughout their tenure with the organization.",
      reasonForLeaving: providedData.reasonForLeaving || "Personal reasons",
      hrContactPerson: providedData.hrContactPerson || "HR Manager",
      closingMessage: "We wish them success in all their future endeavors."
    };
  } else if (effectiveType === "onboarding_letter") {
    console.log('📝 Building onboarding letter fallback with data:', providedData);
    return {
      title: "Employee Onboarding Welcome Letter",
      currentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      letterDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      companyName: providedData.companyName || "MM Docs",
      companyAddress: providedData.companyAddress || "[Company Address]",
      companyEmail: providedData.companyEmail || providedData.hrEmail || "hr@company.com",
      companyPhone: providedData.companyPhone || providedData.hrPhone || "+91-XXXXXXXXXX",
      employeeName: providedData.employeeName || providedData.candidateName || "[Employee Name]",
      position: providedData.position || "[Job Title]",
      department: providedData.department || "[Department Name]",
      startDate: providedData.startDate || providedData.joiningDate || "[Start Date]",
      startTime: providedData.reportingTime || providedData.startTime || "9:00 AM",
      workLocation: providedData.reportingLocation || providedData.workLocation || "Main Office Reception",
      reportingTo: providedData.reportingTo || "[Manager Name]",
      reportingManagerTitle: providedData.reportingManagerTitle || "Department Manager",
      hrContactPerson: providedData.hrContactPerson || "HR Manager",
      hrEmail: providedData.hrEmail || providedData.companyEmail || "hr@company.com",
      hrPhone: providedData.hrPhone || providedData.companyPhone || "+91-XXXXXXXXXX",
      dressCode: providedData.dresscode || providedData.dressCode || "Business Casual",
      itEmail: providedData.itEmail || "itsupport@company.com",
      itPhone: providedData.itPhone || "+91-XXXXXXXXXX",
      managerEmail: providedData.managerEmail || "manager@company.com",
      managerPhone: providedData.managerPhone || "[Manager Phone]",
      
      welcomeMessage: `We are delighted to welcome you to ${providedData.companyName || 'our organization'}! Your skills, experience, and enthusiasm make you a valuable addition to our team. We are confident that you will find your role as ${providedData.position || 'a team member'} both challenging and rewarding.`,
      
      firstDayInstructions: {
        reportingTime: providedData.reportingTime || "9:00 AM",
        reportingLocation: providedData.reportingLocation || "Reception Area, Main Office",
        contactPerson: providedData.hrContactPerson || "HR Manager",
        dresscode: providedData.dresscode || "Business Casual",
        whatToBring: [
          "Government-issued photo ID (Aadhaar/Passport/Driver's License)",
          "Educational certificates and previous employment letters (originals and photocopies)",
          "Passport-size photographs (4 copies)",
          "Bank account details and cancelled cheque",
          "PAN card copy",
          "Any other documents mentioned in your offer letter"
        ]
      },
      
      firstWeekSchedule: [
        {
          day: "Day 1",
          activities: [
            "Welcome orientation and facility tour",
            "HR documentation and formalities completion",
            "IT setup - laptop, email, and system access",
            "Introduction to team members"
          ]
        },
        {
          day: "Day 2-3",
          activities: [
            "Department orientation and role overview",
            "Training on company systems and tools",
            "Review of key policies and procedures",
            "Initial meetings with key stakeholders"
          ]
        },
        {
          day: "Day 4-5",
          activities: [
            "Deep dive into current projects and priorities",
            "One-on-one with reporting manager",
            "Goal setting and expectations discussion",
            "Q&A session and feedback"
          ]
        }
      ],
      
      keyPoliciesHighlights: [
        {
          policy: "Working Hours",
          details: providedData.workingHours || "Monday to Friday, 9:00 AM - 6:00 PM (with 1 hour lunch break)"
        },
        {
          policy: "Attendance & Leave",
          details: "Mark attendance daily via company portal. Annual leave entitlement as per your employment contract."
        },
        {
          policy: "Code of Conduct",
          details: "Professional behavior, respect for colleagues, and adherence to company values are expected at all times."
        },
        {
          policy: "Confidentiality",
          details: "All company information, client data, and business strategies must be kept strictly confidential."
        },
        {
          policy: "IT & Security",
          details: "Follow IT security guidelines. Do not share login credentials. Report any security concerns immediately."
        }
      ],
      
      benefitsAndPerks: [
        "Comprehensive health insurance coverage",
        "Performance-based annual bonuses",
        "Professional development and training opportunities",
        "Flexible work arrangements (as per policy)",
        "Employee wellness programs",
        "Team building activities and social events",
        "Employee referral program",
        "Modern office facilities and amenities"
      ],
      
      teamIntroduction: `You will be joining the ${providedData.department || '[Department]'} team, a dynamic group of professionals committed to excellence and innovation. Your reporting manager, ${providedData.reportingTo || '[Manager Name]'}, will guide you through your initial weeks and help you integrate smoothly into the team.`,
      
      companyValues: [
        "Integrity - We operate with honesty and transparency",
        "Excellence - We strive for the highest standards in everything we do",
        "Innovation - We embrace creativity and continuous improvement",
        "Collaboration - We work together to achieve shared goals",
        "Customer Focus - We put our clients at the heart of our decisions"
      ],
      
      preOnboardingChecklist: [
        "Complete pre-employment verification forms (if any pending)",
        "Review and acknowledge the employee handbook (link will be sent via email)",
        "Set up your company email account using credentials provided separately",
        "Complete mandatory online training modules (access details in welcome email)",
        "Fill out emergency contact information form",
        "Review your employment contract and retain a signed copy"
      ],
      
      importantContacts: [
        {
          department: "Human Resources",
          contact: providedData.hrContactPerson || "HR Manager",
          email: providedData.hrEmail || "hr@company.com",
          phone: providedData.hrPhone || "+91-XXXXXXXXXX"
        },
        {
          department: "IT Support",
          contact: "IT Helpdesk",
          email: "itsupport@company.com",
          phone: "+91-XXXXXXXXXX"
        },
        {
          department: "Your Manager",
          contact: providedData.reportingTo || "[Manager Name]",
          email: providedData.managerEmail || "[manager@company.com]",
          phone: providedData.managerPhone || "[Manager Phone]"
        }
      ],
      
      closingMessage: `We are excited to have you on board and look forward to your contributions to ${providedData.companyName || 'our organization'}. If you have any questions before your start date, please don't hesitate to reach out to our HR team. Welcome to the team!`,
      
      signatureName: providedData.hrContactPerson || "HR Manager",
      signatureTitle: "Human Resources",
      signatureCompany: providedData.companyName || "MM Docs"
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
  } else if (effectiveType === "nda") {
    console.log('📝 Building NDA fallback with data:', providedData);
    const currentDate = new Date();
    const expiryYears = parseInt(providedData.duration) || 2;
    const expiryDate = new Date(currentDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + expiryYears);
    
    return {
      title: "Non-Disclosure Agreement (NDA)",
      date: currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      agreementNumber: `NDA-${currentDate.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      effectiveDate: providedData.effectiveDate || currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      expiryDate: expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      duration: `${expiryYears} years`,
      
      // Party A (Disclosing Party - Company)
      partyA: {
        name: providedData.companyName || "Disclosing Party",
        address: providedData.companyAddress || "[Company Address]",
        email: providedData.companyEmail || "[Company Email]",
        phone: providedData.companyPhone || "[Company Phone]",
        representative: providedData.companyRepresentative || "Authorized Signatory"
      },
      
      // Party B (Receiving Party)
      partyB: {
        name: providedData.partyName || "Receiving Party",
        address: providedData.partyAddress || "[Party Address]",
        email: providedData.partyEmail || "[Party Email]",
        phone: providedData.partyPhone || "[Party Phone]",
        representative: providedData.partyRepresentative || "Authorized Signatory"
      },
      
      purpose: providedData.purpose || "Business discussions, potential collaboration, and evaluation of business opportunities",
      
      recitals: [
        `WHEREAS, ${providedData.companyName || 'the Disclosing Party'} possesses certain confidential and proprietary information related to its business operations, technology, strategies, and intellectual property;`,
        `WHEREAS, ${providedData.partyName || 'the Receiving Party'} desires to receive such confidential information for the purpose of ${providedData.purpose || 'business evaluation and potential collaboration'};`,
        `WHEREAS, both parties acknowledge that the disclosure of such confidential information is necessary for ${providedData.purpose || 'evaluating potential business opportunities'};`,
        `NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:`
      ],
      
      definitions: {
        confidentialInformation: "All information, whether written, oral, electronic, or in any other form, disclosed by the Disclosing Party to the Receiving Party, including but not limited to: technical data, trade secrets, know-how, research, product plans, products, services, customers, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, and other business information.",
        disclosingParty: `${providedData.companyName || 'The party'} disclosing confidential information under this Agreement`,
        receivingParty: `${providedData.partyName || 'The party'} receiving confidential information under this Agreement`,
        effectivePeriod: `${expiryYears} years from the Effective Date`
      },
      
      obligations: [
        {
          clause: "1. Confidentiality Obligation",
          content: `The Receiving Party agrees to hold in strict confidence and not to disclose, publish, or disseminate any Confidential Information to any third party without the prior written consent of the Disclosing Party. The Receiving Party shall use the Confidential Information solely for the purpose of ${providedData.purpose || 'evaluating potential business opportunities'} and for no other purpose whatsoever.`
        },
        {
          clause: "2. Standard of Care",
          content: "The Receiving Party shall protect the Confidential Information using the same degree of care it uses to protect its own confidential information of a similar nature, but in no event less than reasonable care. The Receiving Party shall ensure that its employees, agents, and representatives who have access to the Confidential Information are bound by obligations of confidentiality at least as restrictive as those set forth in this Agreement."
        },
        {
          clause: "3. Permitted Disclosures",
          content: "The Receiving Party may disclose Confidential Information only to those of its employees, agents, consultants, and advisors who: (a) have a legitimate need to know such information for the Purpose; (b) have been informed of the confidential nature of such information; and (c) are bound by written confidentiality obligations at least as protective as those contained in this Agreement."
        },
        {
          clause: "4. Restrictions on Use",
          content: "The Receiving Party shall not: (a) use the Confidential Information for any purpose other than the Purpose; (b) copy, reproduce, or create derivative works based on the Confidential Information without prior written consent; (c) reverse engineer, disassemble, or decompile any prototypes, software, or other tangible objects embodying Confidential Information; or (d) remove or alter any confidentiality notices or proprietary legends on the Confidential Information."
        }
      ],
      
      exclusions: [
        "Information that is or becomes publicly available through no breach of this Agreement by the Receiving Party",
        "Information that was lawfully in the Receiving Party's possession prior to disclosure by the Disclosing Party",
        "Information that is independently developed by the Receiving Party without use of or reference to the Confidential Information",
        "Information that is rightfully received by the Receiving Party from a third party without breach of any confidentiality obligation",
        "Information that is required to be disclosed by law, regulation, or court order (provided that the Receiving Party gives prompt written notice to the Disclosing Party to enable them to seek a protective order)"
      ],
      
      returnOfMaterials: {
        title: "Return or Destruction of Confidential Information",
        content: "Upon termination of this Agreement or upon written request by the Disclosing Party, the Receiving Party shall promptly: (a) return all documents, materials, and other tangible items containing or representing Confidential Information; (b) permanently delete or destroy all electronic copies of Confidential Information; and (c) provide written certification of such return or destruction to the Disclosing Party."
      },
      
      noRights: {
        title: "No License or Rights Granted",
        content: "Nothing in this Agreement shall be construed as granting any rights, by license or otherwise, to any Confidential Information disclosed hereunder, or to any invention, patent, trademark, copyright, or other intellectual property right. All Confidential Information shall remain the exclusive property of the Disclosing Party."
      },
      
      term: {
        duration: `This Agreement shall commence on the Effective Date and shall continue for a period of ${expiryYears} years, unless earlier terminated by either party with thirty (30) days' written notice.`,
        survival: `The confidentiality obligations under this Agreement shall survive termination and shall remain in effect for a period of ${expiryYears + 2} years from the date of termination or until the Confidential Information ceases to be confidential through no fault of the Receiving Party, whichever occurs first.`
      },
      
      remedies: {
        content: "The Receiving Party acknowledges that any breach or threatened breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages would be an inadequate remedy. Accordingly, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity."
      },
      
      generalProvisions: [
        {
          title: "Governing Law",
          content: `This Agreement shall be governed by and construed in accordance with the laws of ${providedData.governingLaw || providedData.jurisdiction || 'India'}, without regard to its conflict of law provisions.`
        },
        {
          title: "Jurisdiction",
          content: `Any disputes arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts located in ${providedData.jurisdiction || 'the appropriate jurisdiction'}.`
        },
        {
          title: "Entire Agreement",
          content: "This Agreement constitutes the entire agreement between the parties concerning the subject matter hereof and supersedes all prior or contemporaneous agreements, understandings, and communications, whether written or oral."
        },
        {
          title: "Amendment",
          content: "This Agreement may not be amended, modified, or supplemented except by a written instrument signed by both parties."
        },
        {
          title: "Severability",
          content: "If any provision of this Agreement is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect."
        },
        {
          title: "Waiver",
          content: "No waiver of any provision of this Agreement shall be deemed or shall constitute a waiver of any other provision, nor shall any waiver constitute a continuing waiver."
        },
        {
          title: "Counterparts",
          content: "This Agreement may be executed in counterparts, each of which shall be deemed an original and all of which together shall constitute one and the same instrument."
        }
      ],
      
      notices: {
        content: "All notices and communications under this Agreement shall be in writing and shall be deemed given when delivered personally, sent by confirmed email, or sent by registered or certified mail, return receipt requested, to the addresses specified above."
      },
      
      signatories: {
        partyA: {
          name: providedData.companyName || "Disclosing Party",
          signatory: providedData.companyRepresentative || "Authorized Signatory",
          title: providedData.companyRepresentativeTitle || "Authorized Representative",
          date: providedData.effectiveDate || currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        },
        partyB: {
          name: providedData.partyName || "Receiving Party",
          signatory: providedData.partyRepresentative || "Authorized Signatory",
          title: providedData.partyRepresentativeTitle || "Authorized Representative",
          date: providedData.effectiveDate || currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        }
      },
      
      witnessSection: {
        required: true,
        witness1: {
          name: "[Witness 1 Name]",
          address: "[Witness 1 Address]",
          signature: "_________________"
        },
        witness2: {
          name: "[Witness 2 Name]",
          address: "[Witness 2 Address]",
          signature: "_________________"
        }
      }
    };
  } else if (effectiveType === "audit_report") {
    console.log('📝 Building audit report fallback with data:', providedData);
    const currentYear = new Date().getFullYear();
    const fiscalYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    
    return {
      title: "Comprehensive Audit Report",
      reportNumber: `AUDIT-${currentYear}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      auditDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      fiscalYear: providedData.fiscalYear || fiscalYear,
      companyName: providedData.companyName || providedData.clientName || "Subject Organization",
      companyAddress: providedData.companyAddress || "[Organization Address]",
      auditorName: providedData.auditorName || providedData.companyName || "MM Docs Audit & Assurance",
      auditorAddress: providedData.auditorAddress || "India",
      auditPeriod: providedData.auditPeriod || `April ${currentYear} - March ${currentYear + 1}`,
      auditType: providedData.auditType || "Financial & Compliance Audit",
      
      executiveSummary: {
        introduction: `This comprehensive audit report presents the findings, observations, and recommendations arising from our detailed examination of ${providedData.companyName || 'the organization'}'s financial statements, internal controls, and compliance procedures for the fiscal year ${providedData.fiscalYear || fiscalYear}. The audit was conducted in accordance with applicable auditing standards and industry best practices.`,
        scope: "Our audit encompassed financial statement verification, internal control assessment, regulatory compliance review, operational efficiency analysis, and risk management evaluation.",
        opinion: providedData.opinion || "In our professional opinion, the financial statements present a true and fair view of the organization's financial position as of the audit date, subject to the observations and recommendations outlined in this report.",
        keyFindings: [
          "Financial statements are materially accurate and comply with applicable accounting standards",
          "Internal control systems are adequate with minor improvements recommended",
          "Operational processes demonstrate sound governance and management oversight",
          "Compliance procedures are generally effective with opportunities for enhancement",
          "Risk management framework is robust and appropriately implemented"
        ]
      },
      
      financialOverview: {
        totalRevenue: providedData.totalRevenue || "₹24,50,00,000",
        totalExpenses: providedData.totalExpenses || "₹18,75,00,000",
        netProfit: providedData.netProfit || "₹5,75,00,000",
        totalAssets: providedData.totalAssets || "₹45,25,00,000",
        totalLiabilities: providedData.totalLiabilities || "₹22,10,00,000",
        shareholdersEquity: providedData.shareholdersEquity || "₹23,15,00,000",
        cashFlow: providedData.cashFlow || "Positive - ₹8,40,00,000",
        profitMargin: providedData.profitMargin || "23.5%",
        commentary: "The organization has demonstrated strong financial performance during the audit period with healthy revenue growth, controlled expenses, and improved profitability margins compared to the previous fiscal year."
      },
      
      auditFindings: [
        {
          category: "Financial Controls",
          status: "Satisfactory",
          observation: "The organization maintains comprehensive financial controls with appropriate segregation of duties. All material transactions are properly authorized, recorded, and reconciled.",
          recommendation: "Implement automated reconciliation tools for high-volume transaction accounts to further enhance accuracy and efficiency.",
          riskLevel: "Low",
          managementResponse: "Accepted - Implementation planned for Q3 FY2026-27"
        },
        {
          category: "Revenue Recognition",
          status: "Compliant",
          observation: "Revenue recognition policies comply with applicable accounting standards (Ind AS 115). Supporting documentation for revenue transactions is adequately maintained.",
          recommendation: "Enhance documentation for complex multi-element arrangements to provide additional clarity for future audits.",
          riskLevel: "Low",
          managementResponse: "Accepted - Enhanced templates being developed"
        },
        {
          category: "Inventory Management",
          status: "Requires Attention",
          observation: "Physical inventory counts revealed minor discrepancies with recorded balances in two warehouse locations. Differences attributable to timing and data entry errors.",
          recommendation: "Implement real-time inventory tracking system and conduct monthly cycle counts for high-value items.",
          riskLevel: "Medium",
          managementResponse: "Accepted - RFID system implementation initiated"
        },
        {
          category: "Compliance & Regulatory",
          status: "Satisfactory",
          observation: "The organization demonstrates strong compliance with applicable tax regulations, labor laws, and industry-specific requirements. All statutory filings are current.",
          recommendation: "Establish automated compliance monitoring dashboard for proactive tracking of regulatory obligations.",
          riskLevel: "Low",
          managementResponse: "Under consideration - Cost-benefit analysis in progress"
        },
        {
          category: "IT Systems & Controls",
          status: "Adequate",
          observation: "Information technology controls are generally effective. Access controls, data backup procedures, and cybersecurity measures are appropriately implemented.",
          recommendation: "Conduct comprehensive IT security audit and implement multi-factor authentication across all critical systems.",
          riskLevel: "Medium",
          managementResponse: "Accepted - MFA rollout scheduled for completion by Q2 FY2026-27"
        }
      ],
      
      internalControlAssessment: {
        controlEnvironment: "Strong - Management demonstrates commitment to integrity, ethical values, and competence.",
        riskAssessment: "Adequate - The organization has established processes to identify and analyze relevant risks.",
        controlActivities: "Effective - Policies and procedures are in place to ensure management directives are carried out.",
        informationCommunication: "Good - Relevant information is identified, captured, and communicated in a timely manner.",
        monitoring: "Satisfactory - Internal control systems are monitored and deficiencies are communicated promptly.",
        overallRating: "Satisfactory with opportunities for continuous improvement"
      },
      
      complianceStatus: {
        taxCompliance: "Full compliance with Income Tax Act, GST regulations, and all applicable tax statutes",
        statutoryCompliance: "All statutory registers, records, and filings are maintained and current",
        regulatoryCompliance: "Compliance with industry-specific regulations and licensing requirements verified",
        laborCompliance: "Adherence to labor laws, employee benefits, and workplace safety regulations confirmed",
        environmentalCompliance: providedData.environmentalCompliance || "Not applicable to current business operations",
        overallStatus: "Compliant with no material violations or regulatory concerns identified"
      },
      
      recommendationsAndActionPlan: [
        {
          priority: "High",
          recommendation: "Implement automated inventory tracking system with RFID technology",
          expectedBenefit: "Real-time inventory visibility, reduced discrepancies, improved operational efficiency",
          timeline: "3-6 months",
          estimatedInvestment: "₹15,00,000 - ₹25,00,000",
          responsibleParty: "Operations Manager & IT Head"
        },
        {
          priority: "High",
          recommendation: "Deploy multi-factor authentication across all critical business systems",
          expectedBenefit: "Enhanced cybersecurity posture, reduced risk of unauthorized access",
          timeline: "2-3 months",
          estimatedInvestment: "₹8,00,000 - ₹12,00,000",
          responsibleParty: "Chief Technology Officer"
        },
        {
          priority: "Medium",
          recommendation: "Establish automated compliance monitoring and alert system",
          expectedBenefit: "Proactive compliance management, reduced risk of regulatory violations",
          timeline: "4-6 months",
          estimatedInvestment: "₹10,00,000 - ₹18,00,000",
          responsibleParty: "Compliance Officer & CFO"
        },
        {
          priority: "Medium",
          recommendation: "Enhance revenue documentation for complex multi-element arrangements",
          expectedBenefit: "Improved audit trail, clearer revenue recognition justification",
          timeline: "1-2 months",
          estimatedInvestment: "Minimal - Internal process improvement",
          responsibleParty: "Finance Controller"
        },
        {
          priority: "Low",
          recommendation: "Implement automated bank reconciliation tools for high-volume accounts",
          expectedBenefit: "Reduced manual effort, faster month-end close, improved accuracy",
          timeline: "3-4 months",
          estimatedInvestment: "₹5,00,000 - ₹8,00,000",
          responsibleParty: "Accounts Manager"
        }
      ],
      
      conclusion: `Based on our comprehensive audit examination, we conclude that ${providedData.companyName || 'the organization'} maintains sound financial management practices, effective internal controls, and strong regulatory compliance. The financial statements present a true and fair view of the organization's financial position and performance for the fiscal year ${providedData.fiscalYear || fiscalYear}.

While our audit identified several areas for improvement, none of the findings represent material weaknesses or significant deficiencies that would impact our overall opinion. The management has demonstrated responsiveness to our recommendations and has committed to implementing appropriate corrective actions within defined timelines.

We commend the organization for maintaining transparent financial practices, robust governance frameworks, and proactive risk management. The recommendations outlined in this report are designed to further strengthen internal controls, enhance operational efficiency, and position the organization for continued growth and success.

We appreciate the cooperation and assistance provided by management and staff throughout the audit process. We remain available for any clarifications or additional guidance regarding the implementation of our recommendations.`,
      
      auditTeamSignature: {
        leadAuditor: providedData.leadAuditor || "[Lead Auditor Name]",
        credentials: "Chartered Accountant",
        firmName: providedData.auditorName || "MM Docs Audit & Assurance",
        membershipNumber: "XXXXX",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        place: "India"
      },
      
      appendices: [
        "Appendix A: Detailed Financial Statements",
        "Appendix B: Internal Control Testing Documentation",
        "Appendix C: Compliance Checklist and Evidence",
        "Appendix D: Management Representation Letter",
        "Appendix E: Audit Methodology and Sampling Approach"
      ],
      
      disclaimer: "This audit report is intended solely for the use of management, the board of directors, and regulatory authorities as applicable. It should not be distributed to or used by parties other than those specified without our prior written consent. The findings and recommendations are based on information available as of the audit date and conditions existing at that time."
    };
  } else if (effectiveType === "gst_filing_summary" || effectiveType === "gst_filing") {
    console.log('📝 Building GST Filing Summary with data:', providedData);
    const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    
    // Calculate net tax payable
    const outputTax = parseFloat(String(providedData.outputTax || '0').replace(/[^0-9.]/g, '')) || 0;
    const inputTax = parseFloat(String(providedData.inputTax || '0').replace(/[^0-9.]/g, '')) || 0;
    const netTaxPayable = Math.max(0, outputTax - inputTax);
    
    return {
      title: "GST Filing Summary",
      companyName: providedData.companyName || brandContext.name || "[Company Name]",
      companyAddress: providedData.companyAddress || "[Company Address]",
      gstNumber: providedData.gstNumber || "[GST Number]",
      filingPeriod: providedData.filingPeriod || "[Filing Period]",
      returnType: providedData.returnType || "GSTR-3B",
      filingDate: providedData.filingDate || currentDate,
      
      totalSales: providedData.totalSales || "0",
      totalPurchases: providedData.totalPurchases || "0",
      outputTax: providedData.outputTax || "0",
      inputTax: providedData.inputTax || "0",
      netTaxPayable: netTaxPayable.toFixed(2),
      
      interestPayable: providedData.interestPayable || "0",
      lateFee: providedData.lateFee || "0",
      
      taxableSupplies: providedData.taxableSupplies || [
        {
          description: "Taxable supplies @ 18%",
          amount: Math.round(parseFloat(String(providedData.totalSales || '0').replace(/[^0-9.]/g, '')) * 0.85).toLocaleString('en-IN')
        },
        {
          description: "Taxable supplies @ 5%",
          amount: Math.round(parseFloat(String(providedData.totalSales || '0').replace(/[^0-9.]/g, '')) * 0.15).toLocaleString('en-IN')
        }
      ],
      
      complianceStatus: providedData.complianceStatus || "Pending Filing",
      filingReference: providedData.filingReference || "",
      
      remarks: providedData.remarks || `This GST filing summary has been prepared for ${providedData.returnType || 'GSTR-3B'} for the period ${providedData.filingPeriod || '[Filing Period]'}. All figures are based on books of accounts and supporting documentation. Please verify all amounts before final submission to the GST portal.`,
      
      generatedDate: currentDate
    };
  } else if (effectiveType === "policy_document") {
    console.log('📝 Building Policy Document with data:', providedData);
    const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return {
      title: providedData.policyTitle || "Company Policy Document",
      policyTitle: providedData.policyTitle || "Company Policy Document",
      policySubtitle: providedData.policySubtitle || "Official Company Policy",
      policyType: providedData.policyType || "Internal Policy",
      
      companyName: providedData.companyName || brandContext.name || "[Company Name]",
      companyAddress: providedData.companyAddress || "[Company Address]",
      
      effectiveDate: providedData.effectiveDate || currentDate,
      version: providedData.version || "1.0",
      department: providedData.department || "All Departments",
      
      policyPurpose: providedData.policyPurpose || "This policy establishes guidelines and standards to ensure consistent, professional, and compliant operations across the organization.",
      
      policyScope: providedData.policyScope || "This policy applies to all employees, contractors, consultants, and stakeholders associated with the organization. It covers all work-related activities conducted on company premises or using company resources.",
      
      policyGuidelines: providedData.policyGuidelines || `
        <p>All personnel are expected to:</p>
        <ul>
          <li>Familiarize themselves with and adhere to this policy at all times</li>
          <li>Maintain professional standards in all work-related activities</li>
          <li>Report any policy violations or concerns to the appropriate authority</li>
          <li>Participate in required training and awareness programs</li>
          <li>Uphold the organization's values, ethics, and code of conduct</li>
        </ul>
        <p>Management is responsible for ensuring policy compliance, providing necessary resources, and addressing violations promptly and fairly.</p>
      `,
      
      sections: providedData.sections || [
        {
          heading: "Policy Statement",
          content: `${providedData.companyName || 'The organization'} is committed to maintaining high standards of professional conduct, compliance, and operational excellence. This policy outlines the expectations, responsibilities, and guidelines that govern our workplace and business activities.`
        },
        {
          heading: "Responsibilities",
          content: `
            <p><strong>Management:</strong> Responsible for policy implementation, resource allocation, and enforcement.</p>
            <p><strong>Employees:</strong> Required to understand, comply with, and uphold policy standards.</p>
            <p><strong>Human Resources:</strong> Oversees policy awareness, training, and violation investigations.</p>
          `
        },
        {
          heading: "Implementation",
          content: "This policy is effective from the date specified and will be communicated to all relevant stakeholders. Regular training sessions and awareness programs will be conducted to ensure understanding and compliance."
        }
      ],
      
      procedures: providedData.procedures || [
        {
          title: "Compliance Monitoring",
          description: "Regular audits and reviews will be conducted to ensure adherence to this policy. Any non-compliance will be documented and addressed through appropriate channels."
        },
        {
          title: "Reporting Mechanism",
          description: "Employees can report policy violations or concerns through designated channels, including direct supervisors, HR department, or anonymous reporting systems."
        },
        {
          title: "Review and Updates",
          description: "This policy will be reviewed periodically and updated as necessary to reflect changes in regulations, business practices, or organizational needs."
        }
      ],
      
      violations: providedData.violations || [
        {
          type: "Minor Violation",
          consequence: "Written warning and mandatory training",
          severity: "Low"
        },
        {
          type: "Moderate Violation",
          consequence: "Formal reprimand and performance improvement plan",
          severity: "Medium"
        },
        {
          type: "Serious Violation",
          consequence: "Suspension or termination as per company disciplinary policy",
          severity: "High"
        }
      ],
      
      importantNotice: providedData.importantNotice || "All employees, contractors, and stakeholders are required to read, understand, and comply with this policy. Any questions or concerns regarding this policy should be directed to the appropriate department head or human resources department. This policy may be updated from time to time, and all concerned parties will be notified of any changes.",
      
      reviewDate: providedData.reviewDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      
      approver1Name: providedData.approver1Name || "Management",
      approver1Title: providedData.approver1Title || "Authorized Signatory",
      approver2Name: providedData.approver2Name || "HR Department",
      approver2Title: providedData.approver2Title || "Human Resources",
      
      generatedDate: currentDate
    };
  } else if (effectiveType === "regulatory_filing") {
    console.log('📝 Building Regulatory Filing with data:', providedData);
    const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    
    return {
      title: providedData.filingType || "Regulatory Filing",
      
      companyName: providedData.companyName || brandContext.name || "[Company Name]",
      companyAddress: providedData.companyAddress || "[Company Address]",
      registrationNumber: providedData.registrationNumber || "",
      
      filingType: providedData.filingType || "Regulatory Compliance Filing",
      filingNumber: providedData.filingNumber || `FIL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      filingDate: providedData.filingDate || currentDate,
      filingStatus: providedData.filingStatus || "submitted",
      
      regulatoryBody: providedData.regulatoryBody || "Regulatory Authority",
      filingPeriod: providedData.filingPeriod || "",
      deadlineDate: providedData.deadlineDate || "",
      
      filingPurpose: providedData.filingPurpose || `This filing is submitted to comply with statutory requirements and regulatory obligations as mandated by applicable laws and regulations.`,
      
      filingDetails: providedData.filingDetails || `
        <p>This regulatory filing contains all required information and documentation as per statutory requirements. The filing has been prepared in accordance with applicable regulations and reporting standards.</p>
        <p><strong>Key Information Included:</strong></p>
        <ul>
          <li>Organization details and registration information</li>
          <li>Financial and operational data for the specified period</li>
          <li>Compliance certifications and declarations</li>
          <li>Supporting documentation as required by regulations</li>
        </ul>
      `,
      
      sections: providedData.sections || [
        {
          heading: "Filing Summary",
          content: `This filing covers the period ${providedData.filingPeriod || '[Filing Period]'} and includes all mandatory information required by ${providedData.regulatoryBody || 'the regulatory authority'}. All data has been verified for accuracy and completeness before submission.`
        },
        {
          heading: "Compliance Declaration",
          content: "The organization confirms full compliance with all applicable regulations and reporting requirements. All information submitted is true, accurate, and complete to the best of our knowledge and belief."
        }
      ],
      
      attachedDocuments: providedData.attachedDocuments || [
        "Certificate of Incorporation",
        "Financial Statements for the filing period",
        "Board Resolution authorizing this filing",
        "Compliance Certificates",
        "Supporting Documentation as required"
      ],
      
      complianceNotice: providedData.complianceNotice || "This filing is submitted in accordance with the applicable regulations and statutory requirements. All information provided is true, accurate, and complete to the best of our knowledge. The organization undertakes to comply with all regulatory obligations and to maintain proper records as required by law.",
      
      declarationText: providedData.declarationText || "I/We hereby declare that the information provided in this regulatory filing is true, complete, and accurate. I/We understand that any false statement or misrepresentation may result in legal penalties and regulatory action. I/We accept full responsibility for the accuracy of this submission and undertake to notify the regulatory authority of any material changes.",
      
      authorizedSignatory: providedData.authorizedSignatory || "[Authorized Signatory Name]",
      signatoryTitle: providedData.signatoryTitle || "Designated Officer",
      signatureDate: providedData.signatureDate || currentDate,
      filingPlace: providedData.filingPlace || "[Location]",
      
      generatedDate: currentDate
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
