const axios = require("axios");

const BASE_URL = "http://localhost:5000"; // Assuming default port, will adjust if needed

const runVerification = async () => {
    try {
        console.log("Starting Authentication Verification...");

        // 1. Signup
        const uniqueEmail = `testuser_${Date.now()}@example.com`;
        console.log(`\n1. Testing Signup with email: ${uniqueEmail}`);
        try {
            const signupRes = await axios.post(`${BASE_URL}/api/auth/signup`, {
                name: "Test User",
                email: uniqueEmail,
                password: "password123",
            });
            console.log("✅ Signup Successful:", signupRes.data.message);
        } catch (err) {
            console.error("❌ Signup Failed:", err.response ? err.response.data : err.message);
            return;
        }

        // 2. Login
        console.log("\n2. Testing Login...");
        let token;
        try {
            const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: uniqueEmail,
                password: "password123",
            });
            token = loginRes.data.token;
            if (token) {
                console.log("✅ Login Successful, Token received.");
            } else {
                console.error("❌ Login Failed: No token received.");
                return;
            }
        } catch (err) {
            console.error("❌ Login Failed:", err.response ? err.response.data : err.message);
            return;
        }

        // 3. Access Protected Route (Valid Token)
        console.log("\n3. Testing Protected Route (With Token)...");
        try {
            // Using the protected user creation route as a test
            // Note: In a real app, we might want a simpler protected route for verification like /me
            // But we'll use the one we protected: POST /api/users
            const protectedRes = await axios.post(
                `${BASE_URL}/api/users`,
                {
                    name: "Protected User",
                    email: `protected_${Date.now()}@example.com`,
                    password: "password123",
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("✅ Protected Route Access Successful:", protectedRes.status);
        } catch (err) {
            console.error("❌ Protected Route Access Failed:", err.response ? err.response.data : err.message);
        }

        // 4. Access Protected Route (No Token)
        console.log("\n4. Testing Protected Route (Without Token)...");
        try {
            await axios.post(`${BASE_URL}/api/users`, {
                name: "Unauthorized User",
                email: `unauthorized_${Date.now()}@example.com`,
                password: "password123",
            });
            console.error("❌ Protected Route Access Failed: Should have been denied but succeeded.");
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log("✅ Protected Route Access Denied (Expected):", err.response.data.message);
            } else {
                console.error("❌ Protected Route Access Failed with unexpected error:", err.message);
            }
        }

    } catch (error) {
        console.error("Unexpected Error:", error.message);
    }
};

runVerification();
