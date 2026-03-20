const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

// Register Handlebars helpers
handlebars.registerHelper("add", function(a, b) {
    const valA = parseFloat(a) || 0;
    const valB = parseFloat(b) || 0;
    return valA + valB;
});

handlebars.registerHelper("length", function(array) {
    return Array.isArray(array) ? array.length : 0;
});

handlebars.registerHelper("numberFormat", function(value) {
    const num = parseFloat(value);
    if (isNaN(num) || !isFinite(num)) return "0.00";
    return num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
});

handlebars.registerHelper("lt", function(v1, v2) {
    return v1 < v2;
});

handlebars.registerHelper("eq", function(v1, v2) {
    return v1 === v2;
});

handlebars.registerHelper("range", function(v1, v2) {
    const range = [];
    for (let i = v1; i < v2; i++) {
        range.push(i);
    }
    return range;
});

handlebars.registerHelper("calc", function(v1, v2) {
    return (parseFloat(v1 || 0) - parseFloat(v2 || 0)).toFixed(2);
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
    'sales_contract': 'sales_contract',
    'quotation': 'quotation',
    'invoice': 'invoice',
    'gst_invoice': 'gst_invoice',
    'audit_report': 'audit_report',
    'gst_filing_summary': 'gst_filing_summary',
    'gst_filing': 'gst_filing_summary',
    'policy_document': 'policy_document',
    'regulatory_filing': 'regulatory_filing',
    'partnership_agreement': 'partnership_agreement',
    'proposal': 'proposal',
    'resume': 'resume',
    'marketing_brief': 'marketing_brief',
    'letter_of_recommendation': 'recommendation_letter',
    'letter-of-recommendation-001': 'recommendation_letter',
    'email': 'email',
    'sales_email': 'email',
    'credit_note': 'credit_note',
    'receipt': 'receipt',
    'purchase_order': 'purchase_order'
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

// Helper to normalize GST data (snake_case -> camelCase, etc.)
const normalizeGstData = (data) => {
  if (!data) return data;

  const normalizeItem = (item) => {
    const normalized = { ...item };
    
    // Simple key mapping (snake_case -> camelCase)
    if (item.customer_name && !item.customerName) normalized.customerName = item.customer_name;
    if (item.gst_no && !item.gstin) normalized.gstin = item.gst_no;
    if (item.gst_number && !item.gstin) normalized.gstin = item.gst_number;
    
    // Invoice details mapping
    if (item.invoice_details && !item.invoiceDetails) normalized.invoiceDetails = item.invoice_details;
    if (normalized.invoiceDetails) {
      if (typeof normalized.invoiceDetails === 'object') {
        if (normalized.invoiceDetails.invoice_no && !normalized.invoiceDetails.no) normalized.invoiceDetails.no = normalized.invoiceDetails.invoice_no;
        if (normalized.invoiceDetails.invoice_date && !normalized.invoiceDetails.date) normalized.invoiceDetails.date = normalized.invoiceDetails.invoice_date;
        if (normalized.invoiceDetails.invoice_value && !normalized.invoiceDetails.value) normalized.invoiceDetails.value = normalized.invoiceDetails.invoice_value;
      }
    }

    // Place of Supply mapping
    if (item.place_of_supply && !item.placeOfSupply) normalized.placeOfSupply = item.place_of_supply;
    if (normalized.placeOfSupply && typeof normalized.placeOfSupply === 'object') {
      if (normalized.placeOfSupply.state_code && !normalized.placeOfSupply.code) normalized.placeOfSupply.code = normalized.placeOfSupply.state_code;
      if (normalized.placeOfSupply.state_name && !normalized.placeOfSupply.name) normalized.placeOfSupply.name = normalized.placeOfSupply.state_name;
    }

    // Tax amount mapping
    if (item.tax_amount && !item.taxAmount) normalized.taxAmount = item.tax_amount;
    if (normalized.taxAmount && typeof normalized.taxAmount === 'object') {
      if (normalized.taxAmount.central_tax && !normalized.taxAmount.central) normalized.taxAmount.central = normalized.taxAmount.central_tax;
      if (normalized.taxAmount.state_tax && !normalized.taxAmount.state) normalized.taxAmount.state = normalized.taxAmount.state_tax;
      if (normalized.taxAmount.integrated_tax && !normalized.taxAmount.integrated) normalized.taxAmount.integrated = normalized.taxAmount.integrated_tax;
    }

    if (item.total_tax && !item.totalTax) normalized.totalTax = item.total_tax;
    if (item.total_tax_pct && !item.totalTaxPct) normalized.totalTaxPct = item.total_tax_pct;
    if (item.taxable_value && !item.taxableValue) normalized.taxableValue = item.taxable_value;

    return normalized;
  };

  // Normalize root level fields
  if (data.company_name && !data.companyName) data.companyName = data.company_name;
  if (data.gst_no && !data.gstNo) data.gstNo = data.gst_no;
  if (data.gst_number && !data.gstNo) data.gstNo = data.gst_number;
  if (data.date_range && !data.dateRange) data.dateRange = data.date_range;
  if (data.filing_period && !data.dateRange) data.dateRange = data.filing_period;
  if (data.mobile_no && !data.mobile) data.mobile = data.mobile_no;

  // Normalize root summary fields
  if (data.summary && typeof data.summary === 'object') {
    if (data.summary.total_taxable_value && !data.summary.totalTaxableValue) data.summary.totalTaxableValue = data.summary.total_taxable_value;
    if (data.summary.total_cgst && !data.summary.totalCGST) data.summary.totalCGST = data.summary.total_cgst;
    if (data.summary.total_sgst && !data.summary.totalSGST) data.summary.totalSGST = data.summary.total_sgst;
    if (data.summary.return_tax && !data.summary.returnTax) data.summary.returnTax = data.summary.return_tax;
    if (data.summary.net_payable && !data.summary.netPayable) data.summary.netPayable = data.summary.net_payable;
  }

  // Normalize arrays
  if (Array.isArray(data.sales)) {
    data.sales = data.sales.map(normalizeItem);
  } else if (Array.isArray(data.sales_table)) {
    data.sales = data.sales_table.map(normalizeItem);
  }

  if (Array.isArray(data.salesReturn)) {
    data.salesReturn = data.salesReturn.map(normalizeItem);
  } else if (Array.isArray(data.returns_table)) {
    data.salesReturn = data.returns_table.map(normalizeItem);
  } else if (Array.isArray(data.credit_notes_table)) {
    data.salesReturn = data.credit_notes_table.map(normalizeItem);
  } else if (Array.isArray(data.creditNotes)) {
    data.salesReturn = data.creditNotes.map(normalizeItem);
  } else if (Array.isArray(data.credit_notes)) {
    data.salesReturn = data.credit_notes.map(normalizeItem);
  } else if (Array.isArray(data.sales_returns)) {
    data.salesReturn = data.sales_returns.map(normalizeItem);
  }

  return data;
};

exports.renderDocument = async (document, brandKit) => {
  try {
    const templateName = getTemplateForDocumentType(document.type);
    
    // Add debug logging for GST documents
    if (templateName === 'gst_filing_summary') {
      console.log('📄 RENDERING GST FILING SUMMARY:');
      console.log(' - Doc ID:', document._id);
      console.log(' - Title:', document.title);
    }

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
    const contentData = docObj.content || {};
    
    const data = {
      _id: docObj._id,
      title: docObj.title,
      type: docObj.type,
      ...contentData, // Spread the content fields to root level for Handlebars
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

    // Parse credit_note items from text format: "Qty | Description | Unit Price"
    if (document.type === 'credit_note' && data.creditNoteItems && typeof data.creditNoteItems === 'string') {
      const lines = data.creditNoteItems.split('\n').filter(line => line.trim());
      const parsedItems = lines.map(line => {
        const parts = line.split('|').map(p => p.trim());
        const qty = parseFloat(parts[0]) || 1;
        const description = parts[1] || 'Item';
        const unitPrice = parseFloat(parts[2]) || 0;
        const amount = qty * unitPrice;
        return { quantity: qty, description, unitPrice: unitPrice.toFixed(2), amount: amount.toFixed(2) };
      });
      data.items = parsedItems;
      const subtotal = parsedItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const taxRate = parseFloat(data.taxRate) || 0;
      const taxAmount = subtotal * (taxRate / 100);
      data.subtotal = subtotal.toFixed(2);
      data.taxAmount = taxAmount > 0 ? taxAmount.toFixed(2) : null;
      data.totalAmount = (subtotal + taxAmount).toFixed(2);
    }

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

    // Support for audit_report debug logging...
    if (document.type === 'audit_report' && data.auditFindings) {
      // ... (existing audit report debug logic)
    }

    // GSTR-1 Specific Data Normalization and Debugging
    if (templateName === 'gst_filing_summary') {
      console.log('📊 Pre-normalization Data Check:');
      console.log(' - sales count:', Array.isArray(data.sales) ? data.sales.length : (Array.isArray(data.sales_table) ? data.sales_table.length : 'N/A'));
      console.log(' - salesReturn count:', Array.isArray(data.salesReturn) ? data.salesReturn.length : (Array.isArray(data.returns_table) ? data.returns_table.length : 'N/A'));
      
      normalizeGstData(data);
      
      console.log('📊 Post-normalization Data Check:');
      console.log(' - sales count:', Array.isArray(data.sales) ? data.sales.length : '0');
      console.log(' - salesReturn count:', Array.isArray(data.salesReturn) ? data.salesReturn.length : '0');
      
      if (Array.isArray(data.sales) && data.sales.length > 0) {
        console.log(' - First sales record keys:', Object.keys(data.sales[0]));
      }
    }

    return template(data);

  } catch (error) {
    console.error("Rendering Error:", error);
    throw new Error("Failed to render document");
  }
};
