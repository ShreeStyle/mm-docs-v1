const { renderDocument } = require('./src/services/render/renderService');
const fs = require('fs');

async function test() {
  const mockDoc = {
    type: 'gst_filing_summary',
    toObject: () => ({
      content: {
        companyName: 'Final Test',
        gstNo: '27FINAL',
        // mobile: '99999', // Hiding this
        sales: [{ customerName: 'Sale 1', totalTax: 100 }],
        credit_notes: [{ customer_name: 'Return 1', total_tax: 10 }] // Testing snake_case and alternate key
      }
    })
  };

  const html = await renderDocument(mockDoc, null);
  
  const checks = [
    'Final Test',
    'Return 1',
    'Sale 1'
  ];

  checks.forEach(c => {
    if (html.includes(c)) console.log(`✅ Found: ${c}`);
    else console.log(`❌ NOT Found: ${c}`);
  });

  if (html.includes('Mob:')) console.log('❌ "Mob:" found but should be hidden');
  else console.log('✅ "Mob:" correctly hidden');

  fs.writeFileSync('/tmp/gstr1_final_test.html', html);
}

test();
