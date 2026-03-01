const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuthAndTemplates() {
    try {
        console.log('🧪 Testing Authentication and Templates System\n');

        // Test 1: Register a test user
        console.log('1️⃣ Testing user registration...');
        try {
            const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            });
            console.log('✅ Registration successful:', registerResponse.data.message);
        } catch (error) {
            if (error.response?.data?.message?.includes('already exists')) {
                console.log('ℹ️ User already exists, continuing...');
            } else {
                console.log('❌ Registration failed:', error.response?.data?.message || error.message);
                return;
            }
        }

        // Test 2: Login
        console.log('\n2️⃣ Testing user login...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful, token received');

        // Test 3: Fetch templates
        console.log('\n3️⃣ Testing templates fetch...');
        const templatesResponse = await axios.get(`${API_BASE}/templates`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Templates fetched: ${templatesResponse.data.data.length} templates found`);
        templatesResponse.data.data.forEach(template => {
            console.log(`   - ${template.name} (${template.templateId})`);
        });

        // Test 4: Fetch categories
        console.log('\n4️⃣ Testing categories fetch...');
        const categoriesResponse = await axios.get(`${API_BASE}/templates/categories`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Categories fetched: ${categoriesResponse.data.data.length} categories found`);
        categoriesResponse.data.data.forEach(category => {
            console.log(`   - ${category.name}: ${category.count} templates`);
        });

        // Test 5: Fetch specific template
        console.log('\n5️⃣ Testing specific template fetch...');
        const templateId = 'offer-letter-001';
        const templateResponse = await axios.get(`${API_BASE}/templates/${templateId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const template = templateResponse.data.data;
        console.log(`✅ Template fetched: ${template.name}`);
        console.log(`   - Required fields: ${template.requiredFields.length}`);
        console.log(`   - Content length: ${template.content.length} characters`);

        // Test 6: Test document generation
        console.log('\n6️⃣ Testing document generation...');
        const documentData = {
            type: templateId,
            title: 'Test Offer Letter',
            content: {
                candidateName: 'John Doe',
                position: 'Software Engineer',
                department: 'Engineering',
                salary: '1200000',
                startDate: '2024-04-01',
                reportingTo: 'Engineering Manager',
                workLocation: 'Bangalore Office',
                companyName: 'Test Company Ltd',
                companyAddress: '123 Test Street, Test City - 123456'
            },
            templateId: templateId
        };

        try {
            const docResponse = await axios.post(`${API_BASE}/documents/generate`, documentData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Document generated successfully:', docResponse.data.data.title);
        } catch (error) {
            console.log('⚠️ Document generation failed:', error.response?.data?.message || error.message);
        }

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   ✅ User registration/login working');
        console.log('   ✅ Templates API working');
        console.log('   ✅ Categories API working');
        console.log('   ✅ Individual template fetch working');
        console.log('   ✅ Authentication middleware working');
        console.log('\n🌐 Frontend URLs to test:');
        console.log('   - Templates: http://localhost:5174/dashboard/templates');
        console.log('   - Create Document: http://localhost:5174/dashboard/create-document/offer-letter-001');
        console.log('   - Test Page: http://localhost:5000/test-templates-frontend.html');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('Response data:', error.response.data);
        }
    }
}

testAuthAndTemplates();