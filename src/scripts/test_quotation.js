const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const templatePath = path.join(__dirname, '../templates/quotation.hbs');
const templateSource = fs.readFileSync(templatePath, 'utf8');

const compiledTemplate = Handlebars.compile(templateSource);

const testData = {
    companyNameHtml: 'MANG<br>MARIO<br>CARS',
    companySlogan: 'DRIVEN BY TRUST',
    quotationNumber: '1234',
    customerId: '123456',
    quotationDate: '01/25/2030',
    validUntil: '02/25/2030',
    clientName: 'Ray Antonio',
    clientAddress: 'Tropang True Po\n123 Pag-asa St., Bayanihan City 1234',
    clientPhone: '0123 456 7890',
    projectDescription: 'Add a brief and concise description of the project, item, or service here.',
    currencySymbol: '₱',
    subtotal: '1,500',
    taxAmount: '100',
    othersFee: '0',
    totalAmount: '1,600',
    contactPersonName: 'Baby Concepcion',
    contactEmail: 'hello@reallygreatsite.com',
    items: [
        { description: 'Description of item or service goes here', quantity: 5, rate: 100, amount: 500 },
        { description: 'Description of item or service goes here', quantity: 5, rate: 100, amount: 500 },
        { description: 'Description of item or service goes here', quantity: 5, rate: 100, amount: 500 }
    ]
};

const html = compiledTemplate(testData);

const outputPath = path.join(__dirname, '../../test_quotation.html');
fs.writeFileSync(outputPath, html);
console.log('✅ Wrote test quote to', outputPath);
