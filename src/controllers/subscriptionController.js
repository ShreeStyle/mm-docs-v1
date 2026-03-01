const User = require("../models/User");
const Subscription = require("../models/Subscription");
const { PLANS } = require("../config/plans");
const crypto = require("crypto");

// Razorpay configuration
const Razorpay = require("razorpay");

const razorpay = process.env.RAZORPAY_KEY_ID ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;

/**
 * Get all available plans
 */
exports.getPlans = async (req, res) => {
    try {
        const plans = Object.keys(PLANS).map((key) => ({
            id: key,
            ...PLANS[key],
        }));

        res.json({
            success: true,
            plans,
        });
    } catch (error) {
        console.error("❌ Get plans error:", error);
        res.status(500).json({ message: "Error fetching plans", error: error.message });
    }
};

/**
 * Get current user's subscription details
 */
exports.getUserSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const subscription = await Subscription.findOne({
            userId: user._id,
            status: "active",
        }).sort({ createdAt: -1 });

        const planDetails = PLANS[user.plan] || PLANS.free;

        res.json({
            success: true,
            subscription: {
                plan: user.plan,
                status: user.subscriptionStatus,
                startDate: user.subscriptionStartDate,
                endDate: user.subscriptionEndDate,
                autoRenew: subscription?.autoRenew || false,
                features: planDetails.features,
                limits: planDetails.limits,
                usage: {
                    documents: {
                        used: user.documentsGeneratedThisMonth || 0,
                        limit: planDetails.limits.documents,
                        remaining: planDetails.limits.documents === -1 ? -1 : 
                                  Math.max(0, planDetails.limits.documents - (user.documentsGeneratedThisMonth || 0)),
                    },
                },
            },
        });
    } catch (error) {
        console.error("❌ Get subscription error:", error);
        res.status(500).json({ message: "Error fetching subscription", error: error.message });
    }
};

/**
 * Create Razorpay order for subscription
 */
exports.createSubscriptionOrder = async (req, res) => {
    try {
        const { planId } = req.body;

        if (!PLANS[planId]) {
            return res.status(400).json({ message: "Invalid plan" });
        }

        if (!razorpay) {
            return res.status(500).json({ 
                message: "Payment gateway not configured. Please contact support.",
                demo: true,
            });
        }

        const plan = PLANS[planId];
        const amount = plan.price * 100; // Convert to paise

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount,
            currency: plan.currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: req.user.id,
                plan: planId,
            },
        });

        // Create pending subscription record
        const subscription = await Subscription.create({
            userId: req.user.id,
            plan: planId,
            status: "pending",
            amount: plan.price,
            currency: plan.currency,
            billingCycle: plan.billingCycle,
            razorpayOrderId: order.id,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            subscriptionId: subscription._id,
            razorpayKey: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("❌ Create order error:", error);
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
};

/**
 * Verify payment and activate subscription
 */
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            subscriptionId,
        } = req.body;

        if (!razorpay) {
            // Demo mode - activate subscription without payment verification
            const subscription = await Subscription.findById(subscriptionId);
            if (!subscription) {
                return res.status(404).json({ message: "Subscription not found" });
            }

            subscription.status = "active";
            subscription.razorpayPaymentId = "demo_payment_" + Date.now();
            subscription.lastPaymentDate = new Date();
            subscription.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await subscription.save();

            // Update user
            const user = await User.findById(req.user.id);
            user.plan = subscription.plan;
            user.subscriptionStatus = "active";
            user.subscriptionStartDate = subscription.startDate;
            user.subscriptionEndDate = subscription.endDate;
            await user.save();

            return res.json({
                success: true,
                message: "Subscription activated (Demo mode)",
                subscription: {
                    plan: user.plan,
                    status: user.subscriptionStatus,
                    endDate: user.subscriptionEndDate,
                },
            });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        // Update subscription
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        subscription.status = "active";
        subscription.razorpayPaymentId = razorpay_payment_id;
        subscription.lastPaymentDate = new Date();
        subscription.nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await subscription.save();

        // Update user
        const user = await User.findById(req.user.id);
        user.plan = subscription.plan;
        user.subscriptionStatus = "active";
        user.subscriptionStartDate = subscription.startDate;
        user.subscriptionEndDate = subscription.endDate;
        user.razorpaySubscriptionId = subscription._id;
        await user.save();

        console.log(`✅ Subscription activated for user ${user.email}: ${user.plan}`);

        res.json({
            success: true,
            message: "Subscription activated successfully",
            subscription: {
                plan: user.plan,
                status: user.subscriptionStatus,
                endDate: user.subscriptionEndDate,
            },
        });
    } catch (error) {
        console.error("❌ Verify payment error:", error);
        res.status(500).json({ message: "Error verifying payment", error: error.message });
    }
};

/**
 * Cancel subscription
 */
exports.cancelSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const subscription = await Subscription.findOne({
            userId: user._id,
            status: "active",
        }).sort({ createdAt: -1 });

        if (!subscription) {
            return res.status(404).json({ message: "No active subscription found" });
        }

        subscription.status = "cancelled";
        subscription.cancelledAt = new Date();
        subscription.autoRenew = false;
        await subscription.save();

        // User keeps pro access until end date
        console.log(`⏸️ Subscription cancelled for ${user.email}, access until ${user.subscriptionEndDate}`);

        res.json({
            success: true,
            message: "Subscription cancelled. You will have Pro access until your current billing period ends.",
            endDate: user.subscriptionEndDate,
        });
    } catch (error) {
        console.error("❌ Cancel subscription error:", error);
        res.status(500).json({ message: "Error cancelling subscription", error: error.message });
    }
};

/**
 * Admin: Manually upgrade user (for testing/support)
 */
exports.manualUpgrade = async (req, res) => {
    try {
        const { userId, plan, days } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (days || 30));

        user.plan = plan;
        user.subscriptionStatus = "active";
        user.subscriptionStartDate = new Date();
        user.subscriptionEndDate = endDate;
        await user.save();

        await Subscription.create({
            userId: user._id,
            plan: plan,
            status: "active",
            amount: PLANS[plan].price,
            currency: PLANS[plan].currency,
            billingCycle: "monthly",
            startDate: new Date(),
            endDate: endDate,
            razorpayPaymentId: "manual_upgrade",
        });

        console.log(`✅ Manual upgrade: ${user.email} → ${plan} until ${endDate}`);

        res.json({
            success: true,
            message: `User upgraded to ${plan}`,
            user: {
                email: user.email,
                plan: user.plan,
                status: user.subscriptionStatus,
                endDate: user.subscriptionEndDate,
            },
        });
    } catch (error) {
        console.error("❌ Manual upgrade error:", error);
        res.status(500).json({ message: "Error upgrading user", error: error.message });
    }
};
