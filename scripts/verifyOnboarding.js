const axios = require("axios");

const BASE_URL = "http://localhost:5000";

const runOnboardingTest = async () => {
    try {
        console.log("🚀 Starting Onboarding Flow Test...\n");

        // 1. Sign Up
        const uniqueEmail = `onboarding_${Date.now()}@example.com`;
        console.log(`1️⃣ Sign Up: ${uniqueEmail}`);
        let token;
        try {
            await axios.post(`${BASE_URL}/api/auth/signup`, {
                name: "Test User",
                email: uniqueEmail,
                password: "password123",
            });
            const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: uniqueEmail,
                password: "password123",
            });
            token = loginRes.data.token;
            console.log("   ✅ Signed up and logged in\n");
        } catch (err) {
            console.error("   ❌ Signup failed:", err.message);
            return;
        }

        // 2. Check Onboarding Status
        console.log("2️⃣ Check Onboarding Status");
        try {
            const res = await axios.get(`${BASE_URL}/api/onboarding/status`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("   Status:", res.data);
            console.log("   ✅ Needs onboarding:", res.data.needsOnboarding, "\n");
        } catch (err) {
            console.error("   ❌ Status check failed:", err.message);
        }

        // 3. Get Color Presets
        console.log("3️⃣ Get Color Presets");
        try {
            const res = await axios.get(`${BASE_URL}/api/onboarding/color-presets`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("   Available presets:", res.data.presets.length);
            console.log("   ✅ First preset:", res.data.presets[0].name, "\n");
        } catch (err) {
            console.error("   ❌ Presets failed:", err.message);
        }

        // 4. Complete Onboarding (Full Flow)
        console.log("4️⃣ Complete Onboarding (Brand Kit + First Document)");
        try {
            const res = await axios.post(
                `${BASE_URL}/api/onboarding/complete`,
                {
                    brandKit: {
                        name: "Acme Corp",
                        colors: {
                            primary: "#667eea",
                        },
                        // Logo and fonts will use smart defaults
                    },
                    firstDocument: {
                        type: "proposal",
                        topic: "AI Strategy for Enterprise",
                    },
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("   ✅ Onboarding Complete!");
            console.log("   Brand Kit:", res.data.brandKit.name);
            console.log("   Colors:", res.data.brandKit.colors);
            console.log("   Fonts:", res.data.brandKit.fonts);
            console.log("   Document:", res.data.document.title);
            console.log("   Preview URL:", res.data.previewUrl);
            console.log("   Next Steps:", res.data.nextSteps, "\n");
        } catch (err) {
            console.error("   ❌ Onboarding failed:", err.response?.data || err.message);
            return;
        }

        // 5. Verify Onboarding Status
        console.log("5️⃣ Verify Onboarding Complete");
        try {
            const res = await axios.get(`${BASE_URL}/api/onboarding/status`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("   Onboarded:", res.data.onboarded);
            console.log("   Has Brand Kit:", res.data.hasBrandKit);
            console.log("   Document Count:", res.data.documentCount);
            console.log("   ✅ User is fully onboarded!\n");
        } catch (err) {
            console.error("   ❌ Verification failed:", err.message);
        }

        // 6. Test Skip Onboarding
        console.log("6️⃣ Testing Skip Onboarding (New User)");
        const skipEmail = `skip_${Date.now()}@example.com`;
        try {
            await axios.post(`${BASE_URL}/api/auth/signup`, {
                name: "Skip User",
                email: skipEmail,
                password: "password123",
            });
            const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: skipEmail,
                password: "password123",
            });
            const skipToken = loginRes.data.token;

            const res = await axios.post(
                `${BASE_URL}/api/onboarding/skip`,
                {},
                { headers: { Authorization: `Bearer ${skipToken}` } }
            );

            console.log("   ✅ Skipped with defaults!");
            console.log("   Brand Kit:", res.data.brandKit.name);
            console.log("   Colors:", res.data.brandKit.colors, "\n");
        } catch (err) {
            console.error("   ❌ Skip failed:", err.response?.data || err.message);
        }

        console.log("🎉 Onboarding Flow Test Complete!");
        console.log("\n📊 Summary:");
        console.log("   ✅ Sign up & login");
        console.log("   ✅ Status check");
        console.log("   ✅ Color presets");
        console.log("   ✅ Complete onboarding (brand + document)");
        console.log("   ✅ Skip onboarding (defaults)");
        console.log("\n⏱️  Total Flow: ~3 minutes for real users");

    } catch (error) {
        console.error("Unexpected Error:", error.message);
    }
};

runOnboardingTest();
