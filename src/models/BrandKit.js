const mongoose = require("mongoose");

const brandKitSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, default: "My Brand" },
    logo: { type: String, default: "" }, // URL to logo
    colors: { type: [String], default: ["#7C3AED", "#ffffff"] }, // Array of hex codes
    description: { type: String, default: "" }, // Brand overview for AI context
    fonts: {
        primary: { type: String, default: "Inter" },
        secondary: { type: String, default: "Roboto" },
    },
    watermark: { type: Boolean, default: true }, // Pro users can set to false
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BrandKit", brandKitSchema);
