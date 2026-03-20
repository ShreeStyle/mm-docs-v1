const { renderDocument } = require('./src/services/render/renderService');
const fs = require('fs');
const path = require('path');

// Mock document object
const mockDocument = {
  type: 'gst_filing_summary',
  title: 'Test GSTR-1',
  toObject: function() {
    return {
      _id: 'mock-id',
      title: this.title,
      type: this.type,
      content: {
        companyName: 'Test Corp',
        gstNo: '27AAACN1234A1Z1',
        mobile: '9876543210',
        dateRange: 'March 2026',
        summary: {
          totalTaxableValue: 100000,
          totalCGST: 9000,
          totalSGST: 9000,
          returnTax: 2000,
          netPayable: 16000
        },
        sales: [
          {
            gstin: '27BBBCN1234A1Z1',
            customerName: 'Customer A',
            placeOfSupply: { code: '27', name: 'Maharashtra' },
            invoiceDetails: { no: 'INV/001', date: '01/03/2026', value: 118000 },
            totalTaxPct: 18,
            taxableValue: 100000,
            taxAmount: { central: 9000, state: 9000, integrated: 0, cess: 0 },
            totalTax: 18000
          }
        ],
        salesReturn: [
          {
            gstin: '27BBBCN1234A1Z1',
            customerName: 'Customer A',
            placeOfSupply: { code: '27', name: 'Maharashtra' },
            invoiceDetails: { no: 'CN/001', date: '05/03/2026', value: 11800 },
            totalTaxPct: 18,
            taxableValue: 10000,
            taxAmount: { central: 900, state: 900, integrated: 0, cess: 0 },
            totalTax: 1800
          }
        ],
        authorizedSignatory: {
          name: 'John Doe',
          designation: 'Director'
        },
        generatedDate: '20/03/2026'
      }
    };
  }
};

async function test() {
  try {
    const html = await renderDocument(mockDocument, null);
    console.log('--- RENDERED HTML SNIPPET ---');
    // Check for key values
    const checks = [
      'Test Corp',
      '27AAACN1234A1Z1',
      '1,00,000.00', // totalTaxableValue
      '18,000.00',    // totalCGST + totalSGST
      '16,000.00',    // netPayable
      'Customer A',
      'INV/001',
      'CN/001'
    ];

    checks.forEach(check => {
      if (html.includes(check)) {
        console.log(`✅ Found: ${check}`);
      } else {
        console.log(`❌ NOT Found: ${check}`);
      }
    });

    fs.writeFileSync('/tmp/gstr1_test.html', html);
    console.log('Full HTML saved to /tmp/gstr1_test.html');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
