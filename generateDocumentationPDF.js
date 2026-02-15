const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const generatePDF = async () => {
    try {
        console.log("🚀 Starting PDF generation...");

        const htmlPath = path.join(__dirname, "MM_Docs_Complete_Guide.html");
        const pdfPath = path.join(__dirname, "MM_Docs_Complete_Guide.pdf");

        // Read HTML file
        const htmlContent = fs.readFileSync(htmlPath, "utf8");

        // Launch browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set content
        await page.setContent(htmlContent, {
            waitUntil: "networkidle0"
        });

        // Generate PDF
        await page.pdf({
            path: pdfPath,
            format: "A4",
            printBackground: true,
            margin: {
                top: "20px",
                right: "20px",
                bottom: "20px",
                left: "20px"
            }
        });

        await browser.close();

        const stats = fs.statSync(pdfPath);
        const fileSizeInKB = (stats.size / 1024).toFixed(2);

        console.log("✅ PDF Generated Successfully!");
        console.log(`📄 File: ${pdfPath}`);
        console.log(`📊 Size: ${fileSizeInKB} KB`);
        console.log("\n🎉 Your complete MM Docs guide is ready!");

    } catch (error) {
        console.error("❌ PDF Generation Failed:", error);
    }
};

generatePDF();
