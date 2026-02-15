const axios = require("axios");

const BASE_URL = "http://localhost:5000";

const runVerification = async () => {
    try {
        console.log("Starting One-Click AI Generation Verification...");

        // 1. Signup a User
        const uniqueEmail = `oneclick_${Date.now()}@example.com`;
        console.log(`\n1. Creating User: ${uniqueEmail}`);
        let token;
        try {
            await axios.post(`${BASE_URL}/api/auth/signup`, {
                name: "OneClick Tester",
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

        // 2. Test One-Click Generation
        console.log("\n2. Testing One-Click AI Document Generation...");
        try {
            const res = await axios.post(
                `${BASE_URL}/api/ai/generate-document`,
                { type: "proposal", topic: "Mobile App Development for Spotify" },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.document && res.data.previewUrl) {
                console.log("✅ Document Generated & Saved!");
                console.log("   Title:", res.data.document.title);
                console.log("   Preview URL:", res.data.previewUrl);
                console.log("   Content Preview:", res.data.document.content.executiveSummary?.substring(0, 60) + "...");
            } else {
                console.error("❌ One-Click Generation Failed: Invalid Response Structure");
            }
        } catch (err) {
            console.error("❌ One-Click Generation Failed:", err.response ? err.response.data : err.message);
        }

    } catch (error) {
        console.error("Unexpected Error:", error.message);
    }
};

runVerification();
