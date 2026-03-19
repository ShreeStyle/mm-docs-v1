const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const sampleData = {
    companyName: 'ACME Corporation',
    companyAddress: '123 Business Way\nSuite 100\nInnovation City, IC 12345',
    companyPhone: '(555) 123-4567',
    companyFax: '(555) 123-4568',
    companyWebsite: 'www.acme.com',
    poDate: '10/25/2024',
    poNumber: 'PO-998877',
    vendorCompanyName: 'Global Supplies Inc.',
    vendorContact: 'Sales Department',
    vendorAddress: '789 Industry Blvd\nManufacturing Town, MT 54321',
    vendorPhone: '(444) 987-6543',
    vendorFax: '(444) 987-6544',
    shipToName: 'Warehouse Manager',
    shipToCompanyName: 'ACME Logistics Center',
    shipToAddress: '321 Shipping Lane\nDistribution Hub, DH 67890',
    shipToPhone: '(555) 000-1111',
    requisitioner: 'Alice Smith',
    shipVia: 'FedEx Priority',
    fob: 'Destination',
    shippingTerms: 'Net 30 Days',
    items: [
        { itemNumber: 'SKU-001', description: 'High-Performance Laptops', quantity: 10, unitPrice: '1200.00', total: '12,000.00' },
        { itemNumber: 'SKU-202', description: 'Ergonomic Office Chairs', quantity: 25, unitPrice: '250.00', total: '6,250.00' },
        { itemNumber: 'SKU-303', description: 'Wireless Mechanical Keyboards', quantity: 50, unitPrice: '85.00', total: '4,250.00' }
    ],
    subtotal: '22,500.00',
    tax: '1,800.00',
    shipping: '350.00',
    other: '0.00',
    total: '24,650.00',
    comments: 'Please handle the laptops with care. Deliver to the back entrance of the warehouse.',
    footerContactName: 'Procurement Dept',
    footerContactPhone: '(555) 123-4500',
    footerContactEmail: 'procurement@acme.com'
};

const templatePath = path.join(__dirname, 'src/templates/purchase_order.hbs');
const templateSource = fs.readFileSync(templatePath, 'utf8');
const template = Handlebars.compile(templateSource);
const html = template(sampleData);

fs.writeFileSync('test_purchase_order.html', html);
console.log('✅ Rendered Purchase Order to test_purchase_order.html');
