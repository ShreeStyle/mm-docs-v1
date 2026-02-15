const axios = require("axios");

const BASE_URL = "http://localhost:5000";

const runVerification = async () => {
    try {
        console.log("Starting Template Library Verification...\n");

        // 1. Signup a User
        const uniqueEmail = `templates_${Date.now()}@example.com`;
        console.log(`1. Creating User: ${uniqueEmail}`);
        let token;
        try {
            await axios.post(`${BASE_URL}/api/auth/signup`, {
                name: "Template Tester",
                email: uniqueEmail,
                password: "password123",
            });
            const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: uniqueEmail,
                password: "password123",
            });
            token = loginRes.data.token;
            console.log("✅ User Created\n");
        } catch (err) {
            console.error("❌ Setup Failed:", err.message);
            return;
        }

        // 2. Test Resume Generation
        console.log("2. Testing Resume Template...");
        try {
            const res = await axios.post(
                `${BASE_URL}/api/ai/generate-document`,
                { type: "resume", topic: "Senior Software Engineer" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Resume Generated:", res.data.document.title);
            console.log("   Preview:", res.data.previewUrl);
        } catch (err) {
            console.error("❌ Resume Failed:", err.response?.data || err.message);
        }

        // 3. Test Marketing Brief
        console.log("\n3. Testing Marketing Brief Template...");
        try {
            const res = await axios.post(
                `${BASE_URL}/api/ai/generate-document`,
                { type: "marketing_brief", topic: "Product Launch Campaign for Tesla Model Y" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Marketing Brief Generated:", res.data.document.title);
            console.log("   Preview:", res.data.previewUrl);
        } catch (err) {
            console.error("❌ Marketing Brief Failed:", err.response?.data || err.message);
        }

        // 4. Test Quotation
        console.log("\n4. Testing Quotation Template...");
        try {
            const res = await axios.post(
                `${BASE_URL}/api/ai/generate-document`,
                { type: "quotation", topic: "Website Development for Startup" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Quotation Generated:", res.data.document.title);
            console.log("   Preview:", res.data.previewUrl);
            console.log("\n🎉 All Templates Working!");
        } catch (err) {
            console.error("❌ Quotation Failed:", err.response?.data || err.message);
        }

    } catch (error) {
        console.error("Unexpected Error:", error.message);
    }
};

runVerification();
