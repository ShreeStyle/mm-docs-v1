const puppeteer = require("puppeteer");

exports.generatePDF = async (html) => {
    let browser;
    try {
        console.log("🖨️ Generating PDF...");

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        console.log("✅ PDF Generated Successfully");
        return pdf;

    } catch (error) {
        console.error("❌ PDF Generation Error:", error);
        throw new Error("Failed to generate PDF");
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
