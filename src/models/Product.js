const mongoose = require("mongoose");

/**
 * Product/Service Model
 * Used in Catalog for managing products and services
 * These are referenced in quotes, proposals, and invoices
 */
const productSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        default: null
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        required: true,
        default: "Other",
        index: true
    },
    // Pricing information
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: "USD"
    },
    pricingModel: {
        type: String,
        enum: ["one-time", "monthly", "yearly", "hourly", "daily", "custom"],
        default: "one-time"
    },
    // Additional pricing options
    discountPrice: {
        type: Number,
        min: 0,
        default: null
    },
    taxRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    // Inventory management (optional)
    inStock: {
        type: Boolean,
        default: true
    },
    quantity: {
        type: Number,
        min: 0,
        default: null // null means unlimited
    },
    // Product metadata
    tags: [{
        type: String,
        trim: true
    }],
    imageUrl: {
        type: String,
        default: null
    },
    // Custom fields for additional data
    customFields: {
        type: Map,
        of: String,
        default: {}
    },
    // Status
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for search optimization
productSchema.index({ name: 'text', description: 'text', sku: 'text' });
productSchema.index({ userId: 1, category: 1 });
productSchema.index({ userId: 1, isActive: 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
    const price = this.discountPrice || this.price;
    return `${this.currency} ${price.toFixed(2)}`;
});

// Method to get price with suffix
productSchema.methods.getPriceDisplay = function() {
    const price = this.discountPrice || this.price;
    const suffix = {
        'one-time': '',
        'monthly': '/month',
        'yearly': '/year',
        'hourly': '/hour',
        'daily': '/day',
        'custom': ''
    }[this.pricingModel] || '';
    
    return `${this.currency} ${price.toFixed(2)}${suffix}`;
};

// Static method to get categories by user
productSchema.statics.getCategoriesByUser = async function(userId) {
    const categories = await this.distinct('category', { userId, isActive: true });
    return categories.sort();
};

// Static method to search products
productSchema.statics.searchProducts = async function(userId, searchTerm) {
    return this.find({
        userId,
        isActive: true,
        $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { sku: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } }
        ]
    }).sort({ name: 1 });
};

module.exports = mongoose.model("Product", productSchema);
