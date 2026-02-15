const axios = require("axios");

const BASE_URL = "http://localhost:5000";

const runVerification = async () => {
    try {
        console.log("Starting Version History Verification...\n");

        // 1. Create User
        const uniqueEmail = `version_${Date.now()}@example.com`;
        console.log(`1. Creating User: ${uniqueEmail}`);
        let token;
        try {
            await axios.post(`${BASE_URL}/api/auth/signup`, {
                name: "Version Tester",
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

        // 2. Create Document
        console.log("2. Creating Document...");
        let docId;
        try {
            const res = await axios.post(
                `${BASE_URL}/api/documents`,
                {
                    title: "Version Test Document",
                    type: "proposal",
                    content: { text: "Version 1 content" },
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            docId = res.data._id;
            console.log("✅ Document Created:", res.data.title);
        } catch (err) {
            console.error("❌ Document Creation Failed:", err.message);
            return;
        }

        // 3. Update Document (creates version)
        console.log("\n3. Updating Document (Version 2)...");
        try {
            await axios.put(
                `${BASE_URL}/api/documents/${docId}`,
                { content: { text: "Version 2 content - Updated!" } },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Document Updated");
        } catch (err) {
            console.error("❌ Update Failed:", err.response?.data || err.message);
        }

        // 4. Update Again (Version 3)
        console.log("\n4. Updating Document Again (Version 3)...");
        try {
            await axios.put(
                `${BASE_URL}/api/documents/${docId}`,
                { content: { text: "Version 3 content - Latest!" } },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Document Updated Again");
        } catch (err) {
            console.error("❌ Update Failed:", err.response?.data || err.message);
        }

        // 5. Get Version History
        console.log("\n5. Fetching Version History...");
        try {
            const res = await axios.get(
                `${BASE_URL}/api/documents/${docId}/versions`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Version History Retrieved!");
            console.log("   Total Versions:", res.data.totalVersions);
            res.data.versions.forEach(v => {
                console.log(`   - v${v.versionNumber}: ${v.changeDescription} (${new Date(v.createdAt).toLocaleString()})`);
            });
        } catch (err) {
            console.error("❌ Version History Failed:", err.response?.data || err.message);
        }

        // 6. Get Specific Version
        console.log("\n6. Fetching Version 1 Details...");
        try {
            const res = await axios.get(
                `${BASE_URL}/api/documents/${docId}/versions/1`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Version 1 Retrieved!");
            console.log("   Content:", res.data.content);
        } catch (err) {
            console.error("❌ Version Fetch Failed:", err.response?.data || err.message);
        }

        // 7. Restore Version 1
        console.log("\n7. Restoring to Version 1...");
        try {
            const res = await axios.post(
                `${BASE_URL}/api/documents/${docId}/versions/1/restore`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Version Restored!");
            console.log("   Current Content:", res.data.document.content);
        } catch (err) {
            console.error("❌ Restore Failed:", err.response?.data || err.message);
        }

        // 8. Verify Restoration
        console.log("\n8. Verifying Final Version History...");
        try {
            const res = await axios.get(
                `${BASE_URL}/api/documents/${docId}/versions`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Final Version Count:", res.data.totalVersions);
            console.log("   Latest versions:");
            res.data.versions.slice(0, 3).forEach(v => {
                console.log(`   - v${v.versionNumber}: ${v.changeDescription}`);
            });
        } catch (err) {
            console.error("❌ Verification Failed:", err.response?.data || err.message);
        }

        console.log("\n🎉 Version History Verified!");

    } catch (error) {
        console.error("Unexpected Error:", error.message);
    }
};

runVerification();
