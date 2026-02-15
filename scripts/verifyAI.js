const axios = require("axios");

const BASE_URL = "http://localhost:5000";

const runVerification = async () => {
    try {
        console.log("Starting AI Feature Verification...");

        // 1. Signup a User
        const uniqueEmail = `aiuser_${Date.now()}@example.com`;
        console.log(`\n1. Creating User: ${uniqueEmail}`);
        let token;
        try {
            await axios.post(`${BASE_URL}/api/auth/signup`, {
                name: "AI Tester",
                email: uniqueEmail,
                password: "password123",
            });
            const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: uniqueEmail,
                password: "password123",
            });
            token = loginRes.data.token;
            console.log("✅ User Created and Logged in.");
        } catch (err) {
            console.error("❌ Setup Failed:", err.message);
            return;
        }

        // 2. Test Proposal Generation
        console.log("\n2. Testing AI Proposal Generation (Mock)...");
        try {
            const res = await axios.post(
                `${BASE_URL}/api/ai/generate`,
                { type: "proposal", topic: "Website Redesign for Apple" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.content && res.data.content.title) {
                console.log("✅ AI Proposal Generated:", res.data.content.title);
                console.log("   Preview:", res.data.content.executiveSummary.substring(0, 50) + "...");
            } else {
                console.error("❌ Proposal Generation Failed: Invalid Structure");
            }
        } catch (err) {
            console.error("❌ Proposal Generation Failed:", err.response ? err.response.data : err.message);
        }

        // 3. Test Invoice Generation
        console.log("\n3. Testing AI Invoice Generation (Mock)...");
        try {
            const res = await axios.post(
                `${BASE_URL}/api/ai/generate`,
                { type: "invoice", topic: "Google Inc." },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.content && res.data.content.invoiceNumber) {
                console.log("✅ AI Invoice Generated:", res.data.content.invoiceNumber);
            } else {
                console.error("❌ Invoice Generation Failed: Invalid Structure");
            }
        } catch (err) {
            console.error("❌ Invoice Generation Failed:", err.response ? err.response.data : err.message);
        }

    } catch (error) {
        console.error("Unexpected Error:", error.message);
    }
};

runVerification();
