const mongoose = require("mongoose");

const brandKitSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, default: "My Brand" },
    logo: { type: String, default: "" }, // URL to logo
    colors: { type: [String], default: ["#000000", "#ffffff"] }, // Array of hex codes
    fonts: {
        primary: { type: String, default: "Inter" },
        secondary: { type: String, default: "Roboto" },
    },
    watermark: { type: Boolean, default: true }, // Pro users can set to false
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BrandKit", brandKitSchema);
