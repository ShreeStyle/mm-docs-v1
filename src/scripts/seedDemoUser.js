// Script to create a demo user for testing
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const DEMO_USER = {
  name: "Demo User",
  email: "demo@test.com",
  password: "demo123",
  plan: "pro",
  onboarded: true,
  subscriptionStatus: "active",
  subscriptionStartDate: new Date(),
  subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
};

async function seedDemoUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI not found in environment variables");
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check if demo user exists
    const existingUser = await User.findOne({ email: DEMO_USER.email });
    
    if (existingUser) {
      console.log(`⚠️  Demo user already exists: ${DEMO_USER.email}`);
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);
      existingUser.password = hashedPassword;
      existingUser.plan = DEMO_USER.plan;
      existingUser.onboarded = DEMO_USER.onboarded;
      existingUser.subscriptionStatus = DEMO_USER.subscriptionStatus;
      await existingUser.save();
      
      console.log(`✅ Demo user updated successfully`);
      console.log(`   Email: ${DEMO_USER.email}`);
      console.log(`   Password: ${DEMO_USER.password}`);
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);

      // Create demo user
      const demoUser = await User.create({
        ...DEMO_USER,
        password: hashedPassword,
      });

      console.log("✅ Demo user created successfully!");
      console.log(`   Email: ${DEMO_USER.email}`);
      console.log(`   Password: ${DEMO_USER.password}`);
      console.log(`   Plan: ${DEMO_USER.plan}`);
      console.log(`   ID: ${demoUser._id}`);
    }

    await mongoose.connection.close();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding demo user:", error);
    process.exit(1);
  }
}

seedDemoUser();
