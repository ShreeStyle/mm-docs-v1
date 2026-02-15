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

    const primaryColor = brandKit.colors[0] || "#000000";
    const secondaryColor = brandKit.colors[1] || "#ffffff";
    const accentColor = brandKit.colors[2] || primaryColor;
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

exports.renderDocument = async (document, brandKit) => {
    try {
        const templateName = document.type || "other"; // e.g., 'proposal', 'invoice'

        // Ensure template exists, fallback to generic if specific type missing
        let template;
        try {
            template = loadTemplate(templateName);
        } catch (e) {
            template = loadTemplate("generic");
        }

        const brandCSS = generateBrandCSS(brandKit);

        // Prepare data for template
        const data = {
            ...document.toObject(),
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
