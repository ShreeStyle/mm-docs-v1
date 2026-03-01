const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test function
const testTemplatesAPI = async () => {
    try {
        console.log('🧪 Testing Templates API...\n');

        // Test 1: Get all templates
        console.log('1. Testing GET /templates');
        const templatesResponse = await axios.get(`${BASE_URL}/templates`, {
            headers: {
                'Authorization': 'Bearer test-token' // You'll need a real token
            }
        });
        console.log(`✅ Found ${templatesResponse.data.data.length} templates`);

        // Test 2: Get categories
        console.log('\n2. Testing GET /templates/categories');
        const categoriesResponse = await axios.get(`${BASE_URL}/templates/categories`, {
            headers: {
                'Authorization': 'Bearer test-token'
            }
        });
        console.log(`✅ Found ${categoriesResponse.data.data.length} categories`);

        // Test 3: Get specific template
        if (templatesResponse.data.data.length > 0) {
            const firstTemplate = templatesResponse.data.data[0];
            console.log(`\n3. Testing GET /templates/${firstTemplate.templateId}`);
            const templateResponse = await axios.get(`${BASE_URL}/templates/${firstTemplate.templateId}`, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });
            console.log(`✅ Retrieved template: ${templateResponse.data.data.name}`);
            console.log(`   - Required fields: ${templateResponse.data.data.requiredFields.length}`);
            console.log(`   - Has content: ${templateResponse.data.data.content ? 'Yes' : 'No'}`);
        }

        console.log('\n🎉 All tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
};

// Run tests
testTemplatesAPI();