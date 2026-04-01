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
        
        // Use networkidle2 instead of networkidle0 to prevent timeouts from continuous external resource loading
        await page.setContent(html, { 
            waitUntil: 'networkidle2', 
            timeout: 15000 
        });

        const pdf = await page.pdf({
            preferCSSPageSize: true,
            printBackground: true,
            format: 'A4', // Fallback only if @page is missing
            margin: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
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
