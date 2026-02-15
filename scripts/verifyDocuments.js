const axios = require("axios");

const BASE_URL = "http://localhost:5000";

const runVerification = async () => {
    try {
        console.log("Starting Document System Verification...");

        // 1. Signup a User
        const uniqueEmail = `docuser_${Date.now()}@example.com`;
        console.log(`\n1. Creating User: ${uniqueEmail}`);
        let token;
        try {
            await axios.post(`${BASE_URL}/api/auth/signup`, {
                name: "Doc User",
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

        // 2. Create Document
        console.log("\n2. Testing Create Document...");
        let docId;
        try {
            const res = await axios.post(
                `${BASE_URL}/api/documents`,
                {
                    title: "My First Proposal",
                    type: "proposal",
                    content: { section1: "Introduction", section2: "Pricing" },
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            docId = res.data._id;
            console.log("✅ Document Created:", res.data.title);
        } catch (err) {
            console.error("❌ Create Document Failed:", err.response ? err.response.data : err.message);
        }

        // 3. Get All Documents
        console.log("\n3. Testing Get All Documents...");
        try {
            const res = await axios.get(`${BASE_URL}/api/documents`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.length > 0) {
                console.log(`✅ Fetched ${res.data.length} document(s).`);
            } else {
                console.error("❌ Failed: No documents found.");
            }
        } catch (err) {
            console.error("❌ Get Documents Failed:", err.message);
        }

        // 4. Update Document
        console.log("\n4. Testing Update Document...");
        try {
            const res = await axios.put(
                `${BASE_URL}/api/documents/${docId}`,
                { title: "Updated Proposal Title" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.title === "Updated Proposal Title") {
                console.log("✅ Document Updated Successfully.");
            } else {
                console.error("❌ Update Failed: Title mismatch.");
            }
        } catch (err) {
            console.error("❌ Update Document Failed:", err.message);
        }

        // 5. Delete Document
        console.log("\n5. Testing Delete Document...");
        try {
            await axios.delete(`${BASE_URL}/api/documents/${docId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("✅ Document Deleted Successfully.");
        } catch (err) {
            console.error("❌ Delete Document Failed:", err.message);
        }

    } catch (error) {
        console.error("Unexpected Error:", error.message);
    }
};

runVerification();
