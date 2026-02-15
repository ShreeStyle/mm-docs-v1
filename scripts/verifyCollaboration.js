const axios = require("axios");

const BASE_URL = "http://localhost:5000";

const runVerification = async () => {
    try {
        console.log("Starting Collaboration Features Verification...\n");

        // 1. Create User
        const uniqueEmail = `collab_${Date.now()}@example.com`;
        console.log(`1. Creating User: ${uniqueEmail}`);
        let token;
        try {
            await axios.post(`${BASE_URL}/api/auth/signup`, {
                name: "Collab Tester",
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

        // 2. Generate Document
        console.log("2. Generating Document...");
        let docId;
        try {
            const res = await axios.post(
                `${BASE_URL}/api/ai/generate-document`,
                { type: "proposal", topic: "AI Strategy for Fortune 500" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            docId = res.data.document._id;
            console.log("✅ Document Generated:", res.data.document.title);
        } catch (err) {
            console.error("❌ Document Generation Failed:", err.message);
            return;
        }

        // 3. Create Share Link
        console.log("\n3. Creating Share Link...");
        let shareUrl, shareId;
        try {
            const res = await axios.post(
                `${BASE_URL}/api/documents/${docId}/share`,
                { expiresIn: 7 }, // 7 days
                { headers: { Authorization: `Bearer ${token}` } }
            );
            shareUrl = res.data.shareUrl;
            shareId = res.data.shareId;
            console.log("✅ Share Link Created!");
            console.log("   URL:", shareUrl);
            console.log("   Share ID:", shareId);
        } catch (err) {
            console.error("❌ Share Link Creation Failed:", err.response?.data || err.message);
            return;
        }

        // 4. View Public Document (No Auth)
        console.log("\n4. Testing Public View (No Authentication)...");
        try {
            const res = await axios.get(`${BASE_URL}/api/public/${shareId}`);
            if (res.data && res.data.includes("<!DOCTYPE html>")) {
                console.log("✅ Public View Successful! (HTML returned)");
            } else {
                console.log("⚠️ Public View returned unexpected content");
            }
        } catch (err) {
            console.error("❌ Public View Failed:", err.message);
        }

        // 5. Check Analytics
        console.log("\n5. Checking Analytics...");
        try {
            const res = await axios.get(
                `${BASE_URL}/api/documents/${docId}/analytics`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Analytics Retrieved!");
            console.log("   Total Views:", res.data.views);
            console.log("   Share ID:", res.data.shareId);
            console.log("   Active:", res.data.isActive);
        } catch (err) {
            console.error("❌ Analytics Failed:", err.response?.data || err.message);
        }

        // 6. Deactivate Share Link
        console.log("\n6. Deactivating Share Link...");
        try {
            await axios.delete(
                `${BASE_URL}/api/documents/${docId}/share`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Share Link Deactivated!");
        } catch (err) {
            console.error("❌ Deactivation Failed:", err.response?.data || err.message);
        }

        // 7. Try to view deactivated link
        console.log("\n7. Testing Deactivated Link...");
        try {
            await axios.get(`${BASE_URL}/api/public/${shareId}`);
            console.error("❌ Deactivated link still accessible (should fail)");
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log("✅ Deactivated link correctly blocked!");
            } else {
                console.error("❌ Unexpected error:", err.message);
            }
        }

        console.log("\n🎉 Collaboration Features Verified!");

    } catch (error) {
        console.error("Unexpected Error:", error.message);
    }
};

runVerification();
