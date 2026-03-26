const mongoose = require("mongoose");

const brandKitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    // ── Basic Info ──────────────────────────────────────────────────
    brandName: { type: String, required: true, default: "My Company" },

    // ── Assets ─────────────────────────────────────────────────────
    logo: { type: String, default: "" },      // URL to full logo
    favicon: { type: String, default: "" },   // URL to small square logo for portals/emails

    // ── Colors ─────────────────────────────────────────────────────
    primaryColor: { type: String, default: "#7C3AED" },
    secondaryColor: { type: String, default: "#64748B" },
    accentColor: { type: String, default: "#3B82F6" },

    // ── Typography ─────────────────────────────────────────────────
    fontFamily: {
        type: String,
        default: "Inter",
        enum: ["Inter", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat", "Raleway", "Nunito", "Work Sans", "Plus Jakarta Sans"]
    },

    // ── AI Context ─────────────────────────────────────────────────
    description: { type: String, default: "" }, // AI uses this for tone and context

    // ── Document Style ─────────────────────────────────────────────
    documentStyle: {
        headerStyle: {
            type: String,
            enum: ["minimal", "bold", "centered", "logo-left"],
            default: "logo-left"
        },
        tableStripeColor: { type: String, default: "#F8F7FF" }, // Alternating row color
        showWatermark: { type: Boolean, default: true }
    },

    // ── Footer Details ─────────────────────────────────────────────
    footer: {
        website: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
        customText: { type: String, default: "" }
    },
    
    // ── Banking Details (For Finance Documents) ───────────────────
    banking: {
        bankName: { type: String, default: "" },
        accountName: { type: String, default: "" },
        accountNumber: { type: String, default: "" },
        ifscCode: { type: String, default: "" },
        upiId: { type: String, default: "" }
    },

    // ── Legacy Support ─────────────────────────────────────────────
    colors: { type: [String], default: [] },
    fonts: {
        primary: { type: String, default: "Inter" },
        secondary: { type: String, default: "Roboto" }
    },

    watermark: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Sync colors array and fonts for backward compatibility
brandKitSchema.pre("save", async function () {
    this.colors = [this.primaryColor, this.secondaryColor, this.accentColor].filter(Boolean);
    if (this.fonts) {
        this.fonts.primary = this.fontFamily;
    }
});

module.exports = mongoose.model("BrandKit", brandKitSchema);
