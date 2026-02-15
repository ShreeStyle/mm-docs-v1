const axios = require("axios");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:5000";

const runVerification = async () => {
    try {
        console.log("Starting PDF Export Verification...");

        // 1. Signup a User
        const uniqueEmail = `pdftest_${Date.now()}@example.com`;
        console.log(`\n1. Creating User: ${uniqueEmail}`);
        let token;
        try {
            await axios.post(`${BASE_URL}/api/auth/signup`, {
                name: "PDF Tester",
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

        // 2. Create Brand Kit
        console.log("\n2. Creating Brand Kit...");
        try {
            await axios.post(
                `${BASE_URL}/api/brand-kit`,
                {
                    name: "Test Brand",
                    colors: ["#FF6B6B", "#4ECDC4", "#FFE66D"],
                    fonts: { primary: "Arial", secondary: "Georgia" }
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("✅ Brand Kit Created.");
        } catch (err) {
            console.log("⚠️ Brand Kit creation skipped (may already exist)");
        }

        // 3. Generate Document
        console.log("\n3. Generating AI Document...");
        let docId;
        try {
            const res = await axios.post(
                `${BASE_URL}/api/ai/generate-document`,
                { type: "proposal", topic: "Cloud Infrastructure Migration" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            docId = res.data.document._id;
            console.log("✅ Document Generated:", res.data.document.title);
        } catch (err) {
            console.error("❌ Document Generation Failed:", err.message);
            return;
        }

        // 4. Download PDF
        console.log("\n4. Testing PDF Download...");
        try {
            const res = await axios.get(
                `${BASE_URL}/api/documents/${docId}/download`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'arraybuffer'
                }
            );

            if (res.data && res.headers['content-type'] === 'application/pdf') {
                const outputPath = path.join(__dirname, '../test_output.pdf');
                fs.writeFileSync(outputPath, res.data);
                console.log("✅ PDF Downloaded Successfully!");
                console.log(`   Saved to: ${outputPath}`);
                console.log(`   Size: ${(res.data.length / 1024).toFixed(2)} KB`);
            } else {
                console.error("❌ PDF Download Failed: Invalid response");
            }
        } catch (err) {
            console.error("❌ PDF Download Failed:", err.response ? err.response.data : err.message);
        }

    } catch (error) {
        console.error("Unexpected Error:", error.message);
    }
};

runVerification();
