const { injectWatermark } = require("../watermark/watermarkService");

// Use puppeteer-core with chrome-aws-lambda for Vercel compatibility
let puppeteer;
let chromium;

if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    // Use puppeteer-core with chromium for serverless environments
    puppeteer = require("puppeteer-core");
    chromium = require("@sparticuz/chromium");
} else {
    // Use regular puppeteer for local development
    puppeteer = require("puppeteer");
}

exports.generatePDF = async (html, user = null) => {
    let browser;
    try {
        console.log("🖨️ Generating PDF...");

        // Inject watermark if user is on free plan
        if (user) {
            html = injectWatermark(html, user);
            console.log(`📄 Watermark ${user.plan === 'free' ? 'added' : 'not needed'} for ${user.email || 'user'}`);
        }

        // Launch browser based on environment
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
        } else {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }

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
