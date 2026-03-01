const BrandKit = require("../models/BrandKit");
const { deleteLogoFile } = require("../middleware/uploadMiddleware");

// Get or Create Brand Kit (Single endpoint for simplicity)
exports.getBrandKit = async (req, res) => {
    try {
        let brandKit = await BrandKit.findOne({ userId: req.user.id });
        
        if (!brandKit) {
            // Create default brand kit if none exists
            brandKit = await BrandKit.create({
                userId: req.user.id,
                brandName: req.user.name || "My Company",
                primaryColor: "#7C3AED",
                secondaryColor: "#64748B",
                accentColor: "#3B82F6",
                fontFamily: "Inter",
                description: "",
                footer: {
                    website: "",
                    email: req.user.email || "",
                    phone: "",
                    address: "",
                    customText: ""
                }
            });
        }
        
        res.status(200).json(brandKit);
    } catch (error) {
        console.error("Error fetching Brand Kit:", error);
        res.status(500).json({ message: "Error fetching Brand Kit", error: error.message });
    }
};

// Create or Update Brand Kit
exports.upsertBrandKit = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = { ...req.body, userId };
        
        // Handle logo upload if file was provided
        if (req.file) {
            // Generate URL for the uploaded file
            const logoUrl = `/uploads/logos/${req.file.filename}`;
            updateData.logo = logoUrl;
            
            // Delete old logo if exists
            const existingKit = await BrandKit.findOne({ userId });
            if (existingKit && existingKit.logo) {
                deleteLogoFile(existingKit.logo);
            }
        }
        
        // Upsert (update if exists, create if not)
        const brandKit = await BrandKit.findOneAndUpdate(
            { userId },
            updateData,
            { 
                new: true, 
                upsert: true, 
                runValidators: true,
                setDefaultsOnInsert: true 
            }
        );
        
        console.log(`✅ Brand Kit ${existingKit ? 'updated' : 'created'} for user ${userId}`);
        res.status(200).json(brandKit);
        
    } catch (error) {
        console.error("Error upserting Brand Kit:", error);
        res.status(500).json({ message: "Error saving Brand Kit", error: error.message });
    }
};

// Update Brand Kit (without file upload)
exports.updateBrandKit = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const brandKit = await BrandKit.findOneAndUpdate(
            { userId },
            { ...req.body, updatedAt: Date.now() },
            { 
                new: true, 
                runValidators: true 
            }
        );

        if (!brandKit) {
            return res.status(404).json({ message: "Brand Kit not found. Please create one first." });
        }

        console.log(`✅ Brand Kit updated for user ${userId}`);
        res.status(200).json(brandKit);
        
    } catch (error) {
        console.error("Error updating Brand Kit:", error);
        res.status(500).json({ message: "Error updating Brand Kit", error: error.message });
    }
};

// Upload Logo
exports.uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const userId = req.user.id;
        const logoUrl = `/uploads/logos/${req.file.filename}`;
        
        // Update brand kit with new logo
        let brandKit = await BrandKit.findOne({ userId });
        
        // Delete old logo if exists
        if (brandKit && brandKit.logo) {
            deleteLogoFile(brandKit.logo);
        }
        
        if (!brandKit) {
            // Create new brand kit if doesn't exist
            brandKit = await BrandKit.create({
                userId,
                logo: logoUrl
            });
        } else {
            brandKit.logo = logoUrl;
            brandKit.updatedAt = Date.now();
            await brandKit.save();
        }
        
        console.log(`✅ Logo uploaded for user ${userId}: ${logoUrl}`);
        res.status(200).json({ 
            message: "Logo uploaded successfully",
            logoUrl,
            brandKit 
        });
        
    } catch (error) {
        console.error("Error uploading logo:", error);
        res.status(500).json({ message: "Error uploading logo", error: error.message });
    }
};

// Delete Brand Kit
exports.deleteBrandKit = async (req, res) => {
    try {
        const userId = req.user.id;
        const brandKit = await BrandKit.findOne({ userId });
        
        if (!brandKit) {
            return res.status(404).json({ message: "Brand Kit not found" });
        }
        
        // Delete logo file if exists
        if (brandKit.logo) {
            deleteLogoFile(brandKit.logo);
        }
        
        await BrandKit.deleteOne({ userId });
        
        console.log(`✅ Brand Kit deleted for user ${userId}`);
        res.status(200).json({ message: "Brand Kit deleted successfully" });
        
    } catch (error) {
        console.error("Error deleting Brand Kit:", error);
        res.status(500).json({ message: "Error deleting Brand Kit", error: error.message });
    }
};

// Reset to default
exports.resetBrandKit = async (req, res) => {
    try {
        const userId = req.user.id;
        const brandKit = await BrandKit.findOne({ userId });
        
        // Delete old logo if exists
        if (brandKit && brandKit.logo) {
            deleteLogoFile(brandKit.logo);
        }
        
        // Reset to defaults
        const defaultBrandKit = {
            userId,
            brandName: req.user.name || "My Company",
            logo: "",
            primaryColor: "#7C3AED",
            secondaryColor: "#64748B",
            accentColor: "#3B82F6",
            fontFamily: "Inter",
            description: "",
            footer: {
                website: "",
                email: req.user.email || "",
                phone: "",
                address: "",
                customText: ""
            }
        };
        
        const resetKit = await BrandKit.findOneAndUpdate(
            { userId },
            defaultBrandKit,
            { 
                new: true, 
                upsert: true,
                runValidators: true 
            }
        );
        
        console.log(`✅ Brand Kit reset to default for user ${userId}`);
        res.status(200).json(resetKit);
        
    } catch (error) {
        console.error("Error resetting Brand Kit:", error);
        res.status(500).json({ message: "Error resetting Brand Kit", error: error.message });
    }
};
