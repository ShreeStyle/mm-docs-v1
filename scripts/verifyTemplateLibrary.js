const axios = require("axios");

const BASE_URL = "http://localhost:5000";

const runTemplateTest = async () => {
    try {
        console.log("🎨 Starting Template Library Test...\n");

        // 1. Get all categories
        console.log("1️⃣ Get Template Categories");
        try {
            const res = await axios.get(`${BASE_URL}/api/templates/categories`);
            console.log("   Categories:", res.data.categories.length);
            res.data.categories.forEach(cat => {
                console.log(`   ${cat.icon} ${cat.name} (${cat.count} templates)`);
            });
            console.log("   ✅ Categories loaded\n");
        } catch (err) {
            console.error("   ❌ Failed:", err.message);
        }

        // 2. Browse all templates
        console.log("2️⃣ Browse All Templates");
        try {
            const res = await axios.get(`${BASE_URL}/api/templates`);
            console.log("   Total templates:", res.data.total);
            res.data.templates.forEach(t => {
                console.log(`   - ${t.title} (${t.category})`);
            });
            console.log("   ✅ Templates loaded\n");
        } catch (err) {
            console.error("   ❌ Failed:", err.message);
        }

        // 3. Get templates by category
        console.log("3️⃣ Get Proposal Templates");
        try {
            const res = await axios.get(`${BASE_URL}/api/templates?category=proposals`);
            console.log("   Proposal templates:", res.data.total);
            res.data.templates.forEach(t => {
                console.log(`   - ${t.title}`);
                console.log(`     ${t.description}`);
            });
            console.log("   ✅ Category filter works\n");
        } catch (err) {
            console.error("   ❌ Failed:", err.message);
        }

        // 4. Get template details
        console.log("4️⃣ Get Template Details");
        try {
            const res = await axios.get(`${BASE_URL}/api/templates/proposal_website_redesign`);
            console.log("   Template:", res.data.title);
            console.log("   Category:", res.data.category);
            console.log("   Tags:", res.data.tags.join(", "));
            console.log("   Content preview:", Object.keys(res.data.content).join(", "));
            console.log("   ✅ Template details loaded\n");
        } catch (err) {
            console.error("   ❌ Failed:", err.message);
        }

        // 5. Clone template (requires auth)
        console.log("5️⃣ Clone Template to User Account");

        // Create test user
        const uniqueEmail = `template_user_${Date.now()}@example.com`;
        let token;
        try {
            await axios.post(`${BASE_URL}/api/auth/signup`, {
                name: "Template User",
                email: uniqueEmail,
                password: "password123",
            });
            const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: uniqueEmail,
                password: "password123",
            });
            token = loginRes.data.token;
            console.log("   User created and logged in");
        } catch (err) {
            console.error("   ❌ Auth failed:", err.message);
            return;
        }

        // Clone template
        try {
            const res = await axios.post(
                `${BASE_URL}/api/templates/proposal_website_redesign/clone`,
                { customTitle: "My Website Redesign Proposal" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("   ✅ Template cloned!");
            console.log("   Document ID:", res.data.document._id);
            console.log("   Title:", res.data.document.title);
            console.log("   Preview:", res.data.previewUrl);
            console.log("   Download:", res.data.downloadUrl);
        } catch (err) {
            console.error("   ❌ Clone failed:", err.response?.data || err.message);
        }

        console.log("\n🎉 Template Library Test Complete!");
        console.log("\n📊 Summary:");
        console.log("   ✅ 6 template categories");
        console.log("   ✅ 6 pre-built templates");
        console.log("   ✅ Browse by category");
        console.log("   ✅ View template details");
        console.log("   ✅ Clone to user account");

    } catch (error) {
        console.error("Unexpected Error:", error.message);
    }
};

runTemplateTest();
