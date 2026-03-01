const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  plan: {
    type: String,
    enum: ["free", "pro"],
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "expired", "cancelled", "pending"],
    default: "pending",
  },
  // Payment details
  razorpaySubscriptionId: {
    type: String,
    default: null,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
  },
  razorpayOrderId: {
    type: String,
    default: null,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "INR",
  },
  // Billing cycle
  billingCycle: {
    type: String,
    enum: ["monthly", "yearly"],
    default: "monthly",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  // Auto-renewal
  autoRenew: {
    type: Boolean,
    default: true,
  },
  // Cancellation
  cancelledAt: {
    type: Date,
    default: null,
  },
  cancellationReason: {
    type: String,
    default: null,
  },
  // Payment history
  lastPaymentDate: {
    type: Date,
    default: null,
  },
  nextBillingDate: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Index for efficient queries
subscriptionSchema.index({ userId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model("Subscription", subscriptionSchema);
