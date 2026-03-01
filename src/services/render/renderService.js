const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

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
    if (!brandKit) return "";

    const primaryColor = brandKit.colors[0] || "#1e40af"; // Professional navy blue
    const secondaryColor = brandKit.colors[1] || "#64748b"; // Professional gray
    const accentColor = brandKit.colors[2] || "#3b82f6"; // Professional blue
    const logoUrl = brandKit.logo || "";
    const fontPrimary = brandKit.fonts?.primary || "Inter";
    const fontSecondary = brandKit.fonts?.secondary || "Roboto";

    return `
    :root {
      --primary-color: ${primaryColor};
      --secondary-color: ${secondaryColor};
      --accent-color: ${accentColor};
      --font-primary: '${fontPrimary}', sans-serif;
      --font-secondary: '${fontSecondary}', sans-serif;
      --logo-url: url('${logoUrl}');
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
        'business_proposal': 'proposal',
        'quotation': 'quotation',
        'invoice': 'invoice',
        'gst_invoice': 'gst_invoice',
        'audit_report': 'audit_report',
        'proposal': 'proposal',
        'resume': 'resume',
        'marketing_brief': 'marketing_brief'
    };

    // If it's in the map, use it
    if (templateMap[documentType]) return templateMap[documentType];

    // Handle new template IDs (e.g., service-agreement-001 -> service_agreement)
    // Strip version/suffixes and convert hyphens to underscores
    let sanitizedType = documentType
        .replace(/-[0-9]+$/, '') // Remove -001, -002 etc
        .replace(/-/g, '_');      // Convert hyphens to underscores

    return sanitizedType;
};

exports.renderDocument = async (document, brandKit) => {
    try {
        const templateName = getTemplateForDocumentType(document.type);

        // Ensure template exists, fallback to generic if specific type missing
        let template;
        try {
            template = loadTemplate(templateName);
        } catch (e) {
            console.log(`Template ${templateName} not found, falling back to generic`);
            template = loadTemplate("generic");
        }

        const brandCSS = generateBrandCSS(brandKit);

        // Prepare data for template
        const data = {
            ...document.toObject(),
            ...document.content, // Spread the content fields to root level for Handlebars
            brandKit: brandKit ? brandKit.toObject() : {},
            brandCSS,
            generatedDate: new Date().toLocaleDateString()
        };

        return template(data);

    } catch (error) {
        console.error("Rendering Error:", error);
        throw new Error("Failed to render document");
    }
};
