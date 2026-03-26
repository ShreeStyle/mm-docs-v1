const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "" }, // e.g. "CEO", "Finance Head", "HR Manager"
  plan: {
    type: String,
    enum: ["free", "pro"],
    default: "free",
  },
  onboarded: {
    type: Boolean,
    default: false,
  },
  onboardingStep: {
    type: Number,
    default: 0, // 0=signup, 1=company, 2=brand, 3=tax, 4=done
  },
  // Region & locale — auto-detected from country at signup
  countryCode: { type: String, default: "IN" }, // ISO 3166-1 alpha-2
  timezone: { type: String, default: "Asia/Kolkata" },
  language: { type: String, default: "en" },

  // OTP fields for two-step verification
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },

  // Subscription
  subscriptionStatus: {
    type: String,
    enum: ["active", "expired", "cancelled", "trial"],
    default: "trial",
  },
  subscriptionStartDate: { type: Date, default: null },
  subscriptionEndDate: { type: Date, default: null },

  // Usage tracking
  documentsGeneratedThisMonth: { type: Number, default: 0 },
  lastDocumentResetDate: { type: Date, default: () => new Date() },

  // Payment
  razorpayCustomerId: { type: String, default: null },
  razorpaySubscriptionId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
