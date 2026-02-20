require("dotenv").config();

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_key",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
};
