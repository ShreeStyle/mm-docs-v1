const mongoose = require("mongoose");
const User = require("../src/models/User");
require("dotenv").config();

// Connect to DB (using local URI directly for script simplicity)
const MONGO_URI = "mongodb://localhost:27017/aidocumentation";

const upgradeUser = async () => {
    const email = process.argv[2];

    if (!email) {
        console.error("❌ Please provide an email address.");
        console.log("Usage: node scripts/upgradeUser.js <email>");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`❌ User with email ${email} not found.`);
            process.exit(1);
        }

        user.subscriptionStatus = "pro";
        await user.save();

        console.log(`✅ Success! User ${email} has been upgraded to PRO.`);
        console.log("You can now test Pro features in Postman.");

    } catch (error) {
        console.error("❌ Error upgrading user:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

upgradeUser();
