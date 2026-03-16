const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

// Register Handlebars helpers
handlebars.registerHelper("add", function(value, addition) {
    return parseInt(value) + parseInt(addition);
});

handlebars.registerHelper("length", function(array) {
    return Array.isArray(array) ? array.length : 0;
});

// Load template function
const loadTemplate = (templateName) => {
  const templatePath = path.join(__dirname, "../../templates", `${templateName}.hbs`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template ${templateName} not found`);
  }
  const source = fs.readFileSync(templatePath, "utf8");
  return handlebars.compile(source);
};

// Generate CSS variables from Brand Kit
const generateBrandCSS = (brandKit) => {
  if (!brandKit) {
    // Default professional theme
    return `
        :root {
          --primary-color: #1e40af;
          --secondary-color: #64748b;
          --accent-color: #3b82f6;
          --font-primary: 'Inter', sans-serif;
          --font-secondary: 'Roboto', sans-serif;
        }
      `;
  }

  const primaryColor = brandKit.primaryColor || brandKit.colors?.[0] || "#1e40af";
  const secondaryColor = brandKit.secondaryColor || brandKit.colors?.[1] || "#64748b";
  const accentColor = brandKit.accentColor || brandKit.colors?.[2] || "#3b82f6";
  const logoUrl = brandKit.logo || "";
  const fontFamily = brandKit.fontFamily || brandKit.fonts?.primary || "Inter";
  const fontSecondary = brandKit.fonts?.secondary || "Roboto";

  return `
    :root {
      --primary-color: ${primaryColor};
      --secondary-color: ${secondaryColor};
      --accent-color: ${accentColor};
      --font-primary: '${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --font-secondary: '${fontSecondary}', sans-serif;
      --brand-name: '${brandKit.brandName || 'My Company'}';
    }
    
    /* Professional branding styles */
    body {
      font-family: var(--font-primary);
      color: var(--secondary-color);
      line-height: 1.6;
    }
    
    h1, h2, h3, h4, h5, h6 {
      color: var(--primary-color);
      font-weight: 600;
    }
    
    .brand-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 30px 0;
      border-bottom: 3px solid var(--primary-color);
      margin-bottom: 30px;
    }
    
    .brand-logo {
      max-width: 150px;
      max-height: 80px;
      object-fit: contain;
    }
    
    .brand-name {
      font-size: 28px;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0;
    }
    
    table thead {
      background-color: var(--primary-color);
      color: white;
    }
    
    table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    
    table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .highlight, .important {
      color: var(--primary-color);
      font-weight: 600;
    }
    
    .accent {
      color: var(--accent-color);
    }
    
    .document-footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid var(--primary-color);
      font-size: 12px;
      color: var(--secondary-color);
    }
    
    .footer-contact {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 10px;
    }
    
    .footer-contact-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    @media print {
      .brand-header { page-break-after: avoid; }
      .document-footer { page-break-before: avoid; }
    }
  `;
};

// Map document types to professional templates
const getTemplateForDocumentType = (documentType) => {
  // Basic mapping for backward compatibility and clean names
  const templateMap = {
    'offer_letter': 'offer_letter',
    'appointment_letter': 'appointment_letter',
    'experience_certificate': 'experience_certificate',
    'onboarding_letter': 'onboarding_letter',
    'warning_letter': 'warning_letter',
    'nda': 'nda',
    'service_agreement': 'service_agreement',
    'mou': 'mou',
    'privacy_policy': 'privacy_policy',
    'terms_of_service': 'terms_conditions',  // file is terms_conditions.hbs
    'terms_conditions': 'terms_conditions',
    'business_proposal': 'proposal',
    'business-proposal': 'proposal',
    'business-proposal-001': 'proposal',
    'quotation': 'quotation',
    'invoice': 'invoice',
    'gst_invoice': 'gst_invoice',
    'audit_report': 'audit_report',
    'gst_filing_summary': 'gst_filing_summary',
    'gst_filing': 'gst_filing_summary',
    'policy_document': 'policy_document',
    'regulatory_filing': 'regulatory_filing',
    'proposal': 'proposal',
    'resume': 'resume',
    'marketing_brief': 'marketing_brief',
    'letter_of_recommendation': 'recommendation_letter',
    'letter-of-recommendation-001': 'recommendation_letter',
    'email': 'email',
    'sales_email': 'email'
  };

  // If it's in the map, use it
  if (templateMap[documentType]) return templateMap[documentType];

  // Handle new template IDs (e.g., service-agreement-001 -> service_agreement)
  // Strip version/suffixes and convert hyphens/spaces to underscores
  let sanitizedType = documentType
    .toLowerCase()
    .replace(/-[0-9]+$/, '') // Remove -001, -002 etc
    .replace(/[-\s]/g, '_');  // Convert hyphens and spaces to underscores

  return sanitizedType;
};

// Generate brand header HTML
const generateBrandHeader = (brandKit) => {
  if (!brandKit) return '';

  const logoUrl = brandKit.logo ? `http://localhost:5000${brandKit.logo}` : '';
  const brandName = brandKit.brandName || 'My Company';

  if (logoUrl) {
    return `
        <div class="brand-header">
            <img src="${logoUrl}" alt="${brandName}" class="brand-logo" />
            <h1 class="brand-name">${brandName}</h1>
        </div>
        `;
  } else {
    return `
        <div class="brand-header">
            <h1 class="brand-name">${brandName}</h1>
        </div>
        `;
  }
};

// Generate footer HTML
const generateFooterHTML = (brandKit) => {
  if (!brandKit || !brandKit.footer) return '';

  const footer = brandKit.footer;
  const items = [];

  if (footer.website) items.push(`<div class="footer-contact-item">🌐 ${footer.website}</div>`);
  if (footer.email) items.push(`<div class="footer-contact-item">✉️ ${footer.email}</div>`);
  if (footer.phone) items.push(`<div class="footer-contact-item">📞 ${footer.phone}</div>`);
  if (footer.address) items.push(`<div class="footer-contact-item">📍 ${footer.address}</div>`);

  if (items.length === 0 && !footer.customText) return '';

  let footerHTML = '<div class="document-footer">';
  if (items.length > 0) {
    footerHTML += '<div class="footer-contact">' + items.join('') + '</div>';
  }
  if (footer.customText) {
    footerHTML += `<div class="footer-custom">${footer.customText}</div>`;
  }
  footerHTML += '</div>';

  return footerHTML;
};

exports.renderDocument = async (document, brandKit) => {
  try {
    const templateName = getTemplateForDocumentType(document.type);

    let template;
    try {
      console.log(`🔍 Attempting to load template: ${templateName}`);
      template = loadTemplate(templateName);
      console.log(`✅ Successfully loaded: ${templateName}`);
    } catch (e) {
      console.error(`❌ Template ${templateName} not found or error loading:`, e.message);
      console.log(`⚠️ Falling back to generic template`);
      template = loadTemplate("generic");
    }

    const brandCSS = generateBrandCSS(brandKit);
    const brandHeader = generateBrandHeader(brandKit);
    const footerHTML = generateFooterHTML(brandKit);

    // Prepare data for template
    const docObj = document.toObject();
    const data = {
      _id: docObj._id,
      title: docObj.title,
      type: docObj.type,
      ...docObj.content, // Spread the content fields to root level for Handlebars
      brandKit: brandKit ? brandKit.toObject() : {},
      brandCSS,
      brandHeader,
      footerHTML,
      brandName: brandKit?.brandName || 'My Company',
      primaryColor: brandKit?.primaryColor || '#1e40af',
      secondaryColor: brandKit?.secondaryColor || '#64748b',
      accentColor: brandKit?.accentColor || '#3b82f6',
      fontFamily: brandKit?.fontFamily || 'Inter',
      generatedDate: new Date().toLocaleDateString()
    };

    // Ensure sections are objects if they came in as strings (common AI/formatting issue)
    if (Array.isArray(data.sections)) {
      data.sections = data.sections.map(section => {
        if (typeof section === 'string') {
          try {
            // Attempt to parse if it's a JSON string
            if (section.trim().startsWith('{')) {
              return JSON.parse(section);
            }
            // Otherwise wrap it
            return { heading: "Section", content: section };
          } catch (e) {
            return { heading: "Section", content: section };
          }
        }
        return section;
      });
    }

    // Debug logging to verify array structures
    if (document.type === 'audit_report' && data.auditFindings) {
      console.log('🔍 AUDIT REPORT DEBUG:');
      console.log('  - auditFindings type:', typeof data.auditFindings);
      console.log('  - auditFindings is Array?:', Array.isArray(data.auditFindings));
      console.log('  - auditFindings length:', data.auditFindings?.length);
      if (Array.isArray(data.auditFindings) && data.auditFindings.length > 0) {
        console.log('  - First finding structure:', JSON.stringify(data.auditFindings[0]).substring(0, 150));
      }
      if (data.executiveSummary?.keyFindings) {
        console.log('  - keyFindings type:', typeof data.executiveSummary.keyFindings);
        console.log('  - keyFindings is Array?:', Array.isArray(data.executiveSummary.keyFindings));
        console.log('  - keyFindings length:', data.executiveSummary.keyFindings?.length);
        if (Array.isArray(data.executiveSummary.keyFindings)) {
          console.log('  - keyFindings:', JSON.stringify(data.executiveSummary.keyFindings));
        }
      }
    }

    return template(data);

  } catch (error) {
    console.error("Rendering Error:", error);
    throw new Error("Failed to render document");
  }
};
