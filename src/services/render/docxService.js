const HTMLToDOCX = require("html-to-docx");

exports.generateDOCX = async (htmlContent) => {
    try {
        console.log("📝 Generating DOCX...");

        // Ensure some basic styling is applied to the DOCX if needed, HTMLToDOCX converts basic inline CSS and some tags
        const fileBuffer = await HTMLToDOCX(htmlContent, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
        });

        console.log("✅ DOCX Generated Successfully");
        return fileBuffer;
    } catch (error) {
        console.error("❌ DOCX Generation Error:", error);
        throw new Error("Failed to generate DOCX");
    }
};
