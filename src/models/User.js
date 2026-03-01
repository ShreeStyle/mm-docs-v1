const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  plan: {
    type: String,
    enum: ["free", "pro"],
    default: "free",
  },
  onboarded: {
    type: Boolean,
    default: false,
  },
  // OTP fields for two-step verification
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  // Subscription fields
  subscriptionStatus: {
    type: String,
    enum: ["active", "expired", "cancelled", "trial"],
    default: "trial",
  },
  subscriptionStartDate: {
    type: Date,
    default: null,
  },
  subscriptionEndDate: {
    type: Date,
    default: null,
  },
  // Document usage tracking
  documentsGeneratedThisMonth: {
    type: Number,
    default: 0,
  },
  lastDocumentResetDate: {
    type: Date,
    default: () => new Date(),
  },
  // Payment tracking
  razorpayCustomerId: {
    type: String,
    default: null,
  },
  razorpaySubscriptionId: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
