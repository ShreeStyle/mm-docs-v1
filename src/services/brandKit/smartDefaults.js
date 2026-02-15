// Smart defaults for brand kit creation

const generateComplementaryColor = (primaryColor) => {
    // Simple complementary color logic
    // In production, use a proper color theory library
    const colorMap = {
        "#667eea": "#ea6788", // Purple -> Pink
        "#4299e1": "#e19542", // Blue -> Orange
        "#48bb78": "#bb4878", // Green -> Magenta
        "#ed8936": "#3689ed", // Orange -> Blue
        "#f56565": "#65f5a3", // Red -> Teal
    };

    return colorMap[primaryColor] || "#764ba2"; // Default accent
};

const getDefaultFonts = (industry = "general") => {
    const fontPresets = {
        tech: { primary: "Inter", secondary: "Roboto Mono" },
        creative: { primary: "Poppins", secondary: "Montserrat" },
        corporate: { primary: "Roboto", secondary: "Open Sans" },
        general: { primary: "Inter", secondary: "Roboto" },
    };

    return fontPresets[industry] || fontPresets.general;
};

const getColorPresets = () => {
    return [
        { name: "Professional Purple", primary: "#667eea", secondary: "#764ba2" },
        { name: "Trust Blue", primary: "#4299e1", secondary: "#2c5282" },
        { name: "Growth Green", primary: "#48bb78", secondary: "#2f855a" },
        { name: "Energy Orange", primary: "#ed8936", secondary: "#c05621" },
        { name: "Bold Red", primary: "#f56565", secondary: "#c53030" },
        { name: "Elegant Black", primary: "#2d3748", secondary: "#1a202c" },
    ];
};

const generateInitialsLogo = (brandName) => {
    // Generate SVG logo from initials
    const initials = brandName
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return {
        type: "initials",
        text: initials,
        // In a real app, this would be a data URL or SVG
        placeholder: `Logo: ${initials}`,
    };
};

const applySmartDefaults = (brandKitData) => {
    const primaryColor = brandKitData.colors?.primary || brandKitData.colors?.[0] || "#667eea";
    const secondaryColor = brandKitData.colors?.secondary || brandKitData.colors?.[1] || generateComplementaryColor(primaryColor);

    const defaults = {
        name: brandKitData.name || "My Brand",
        colors: [primaryColor, secondaryColor], // Array format for schema
        fonts: {
            primary: brandKitData.fonts?.primary || "Inter",
            secondary: brandKitData.fonts?.secondary || "Roboto",
        },
        logo: brandKitData.logo || "", // Empty string if no logo
        watermark: brandKitData.watermark !== undefined ? brandKitData.watermark : true,
    };

    return defaults;
};

module.exports = {
    applySmartDefaults,
    generateComplementaryColor,
    getDefaultFonts,
    getColorPresets,
    generateInitialsLogo,
};
