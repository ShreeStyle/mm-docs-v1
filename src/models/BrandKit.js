const mongoose = require("mongoose");

const brandKitSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        unique: true // One brand kit per user
    },
    
    // Basic Info
    brandName: { 
        type: String, 
        required: true, 
        default: "My Company" 
    },
    
    // Logo
    logo: { 
        type: String, 
        default: "" 
    }, // URL to logo
    
    // Colors
    primaryColor: { 
        type: String, 
        default: "#7C3AED" 
    }, // Main brand color
    secondaryColor: { 
        type: String, 
        default: "#64748B" 
    }, // Secondary brand color
    accentColor: { 
        type: String, 
        default: "#3B82F6" 
    }, // Accent color for highlights
    
    // Typography
    fontFamily: { 
        type: String, 
        default: "Inter",
        enum: ["Inter", "Poppins", "Roboto", "Open Sans", "Lato", "Montserrat", "Raleway", "Nunito", "Work Sans", "Plus Jakarta Sans"]
    },
    
    // Brand Description
    description: { 
        type: String, 
        default: "" 
    }, // Brand overview for AI context and documents
    
    // Footer Details
    footer: {
        website: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
        customText: { type: String, default: "" }
    },
    
    // Legacy support
    colors: { 
        type: [String], 
        default: [] 
    }, // Array of hex codes for backward compatibility
    fonts: {
        primary: { type: String, default: "Inter" },
        secondary: { type: String, default: "Roboto" },
    },
    
    // Pro Features
    watermark: { 
        type: Boolean, 
        default: true 
    }, // Pro users can remove watermark
    
    // Metadata
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

// Pre-save hook to sync colors array with individual color fields
brandKitSchema.pre('save', function(next) {
    // Sync colors array for backward compatibility
    this.colors = [this.primaryColor, this.secondaryColor, this.accentColor].filter(Boolean);
    
    // Sync fonts for backward compatibility
    this.fonts.primary = this.fontFamily;
    
    next();
});

module.exports = mongoose.model("BrandKit", brandKitSchema);
