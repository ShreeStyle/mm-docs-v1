const Razorpay = require("razorpay");
const crypto = require("crypto");
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require("../config/config");
const User = require("../models/User");

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID || "rzp_test_dummy",
    key_secret: RAZORPAY_KEY_SECRET || "dummy_secret",
});

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const options = {
            amount: 999 * 100, // amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_order_${userId}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        if (!order) return res.status(500).json({ message: "Some error occurred while creating order" });

        res.json(order);
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;
        const userId = req.user.id;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", RAZORPAY_KEY_SECRET || "dummy_secret")
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update user plan to PRO
            await User.findByIdAndUpdate(userId, { plan: "pro" });

            res.json({
                message: "Payment successful and plan upgraded to Pro",
                paymentId: razorpay_payment_id
            });
        } else {
            res.status(400).json({
                message: "Invalid Signature",
            });
        }
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ message: "Error verifying payment", error: error.message });
    }
};
