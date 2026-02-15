const axios = require("axios");

const BASE_URL = "http://localhost:5000";

const runVerification = async () => {
    try {
        console.log("Starting Real AI Verification...");

        // 1. Signup a User
        const uniqueEmail = `realai_${Date.now()}@example.com`;
        console.log(`\n1. Creating User: ${uniqueEmail}`);
        let token;
        try {
            await axios.post(`${BASE_URL}/api/auth/signup`, {
                name: "Real AI Tester",
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

        // 2. Test Real AI Generation
        console.log("\n2. Testing REAL OpenAI GPT-4 Generation...");
        console.log("   (This will take a few seconds...)");
        try {
            const res = await axios.post(
                `${BASE_URL}/api/ai/generate-document`,
                {
                    type: "proposal",
                    topic: "AI-Powered Customer Service Platform for Amazon"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.document && res.data.document.content) {
                console.log("\n✅ REAL AI Document Generated!");
                console.log("   Title:", res.data.document.title);
                console.log("\n   Executive Summary:");
                console.log("   " + res.data.document.content.executiveSummary);
                console.log("\n   Methodology:");
                res.data.document.content.methodology.forEach((phase, i) => {
                    console.log(`   ${i + 1}. ${phase}`);
                });
                console.log("\n   Preview URL:", res.data.previewUrl);
            } else {
                console.error("❌ Real AI Generation Failed: Invalid Response");
            }
        } catch (err) {
            console.error("❌ Real AI Generation Failed:", err.response ? err.response.data : err.message);
        }

    } catch (error) {
        console.error("Unexpected Error:", error.message);
    }
};

runVerification();
