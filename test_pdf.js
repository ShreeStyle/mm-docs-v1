const fs = require('fs');
const Handlebars = require('handlebars');
const pdfService = require('./src/services/render/pdfService');

(async () => {
  try {
    const template = Handlebars.compile(fs.readFileSync('src/templates/experience_certificate.hbs', 'utf8'));
    const html = template({ companyName: 'Test', employeeName: 'John', position: 'Dev' });
    console.log('HTML rendered. Starting Puppeteer...');
    // Mock user
    const user = { plan: 'pro', email: 'test@example.com' };
    const pdf = await pdfService.generatePDF(html, user);
    console.log('PDF generated! Size:', pdf.length);
  } catch (err) {
    console.error('ERROR:', err);
  }
})();
