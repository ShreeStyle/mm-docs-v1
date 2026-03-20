const { renderDocument } = require('./src/services/render/renderService');
const fs = require('fs');
const path = require('path');

// Mock document object with snake_case content
const mockDocument = {
  type: 'gst_filing_summary',
  title: 'Test GSTR-1 Robustness',
  toObject: function() {
    return {
      _id: 'mock-id-robust',
      title: this.title,
      type: this.type,
      content: {
        companyName: 'Robust Corp',
        gst_no: '27AAAAA0000A1Z1',
        mobile: '9999999999',
        filingPeriod: 'April 2026',
        summary: {
          total_taxable_value: 500000,
          total_cgst: 45000,
          total_sgst: 45000,
          return_tax: 5000,
          net_payable: 85000
        },
        sales_table: [
          {
            gst_no: '27BBBBB0000B1Z1',
            customer_name: 'Snake Case Customer',
            place_of_supply: { state_code: '27', state_name: 'Maharashtra' },
            invoice_details: { invoice_no: 'SNC-001', invoice_date: '01/04/2026', invoice_value: 590000 },
            total_tax_pct: 18,
            taxable_value: 500000,
            tax_amount: { central_tax: 45000, state_tax: 45000, integrated_tax: 0, cess: 0 },
            total_tax: 90000
          }
        ],
        returns_table: [
          {
            gst_no: '27BBBBB0000B1Z1',
            customer_name: 'Snake Case Customer',
            place_of_supply: { state_code: '27', state_name: 'Maharashtra' },
            invoice_details: { invoice_no: 'RTN-001', invoice_date: '05/04/2026', invoice_value: 5900 },
            total_tax_pct: 18,
            taxable_value: 5000,
            tax_amount: { central_tax: 450, state_tax: 450, integrated_tax: 0, cess: 0 },
            total_tax: 900
          }
        ],
        signatoryName: 'Jane Smith',
        signatoryDesignation: 'CEO',
        generatedDate: '20/04/2026'
      }
    };
  }
};

async function test() {
  try {
    console.log('--- STARTING ROBUSTNESS TEST ---');
    const html = await renderDocument(mockDocument, null);
    console.log('--- RENDERED HTML SNIPPET ---');
    
    // Check for normalized values
    const checks = [
      'Robust Corp',
      '27AAAAA0000A1Z1',
      '5,00,000.00', // total_taxable_value -> totalTaxableValue
      '90,000.00',    // total_cgst + total_sgst -> totalCGST + totalSGST
      '85,000.00',    // net_payable -> netPayable
      'Snake Case Customer', // customer_name -> customerName
      'SNC-001',           // invoice_no -> no
      'RTN-001'            // invoice_no -> no
    ];

    let allPassed = true;
    checks.forEach(check => {
      if (html.includes(check)) {
        console.log(`✅ Found: ${check}`);
      } else {
        console.log(`❌ NOT Found: ${check}`);
        allPassed = false;
      }
    });

    if (allPassed) {
      console.log('🚀 ALL ROBUSTNESS CHECKS PASSED!');
    } else {
      console.log('⚠️ SOME ROBUSTNESS CHECKS FAILED.');
    }

    fs.writeFileSync('/tmp/gstr1_robust_test.html', html);
    console.log('Full HTML saved to /tmp/gstr1_robust_test.html');
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
