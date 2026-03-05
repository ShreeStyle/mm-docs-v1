const Product = require("../models/Product");
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

/**
 * Get all products for a user
 */
exports.getProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, search, isActive, sortBy = 'name', order = 'asc' } = req.query;
        
        // Build query
        const query = {
            userId,
            isArchived: false
        };
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Build sort
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj = {};
        sortObj[sortBy] = sortOrder;
        
        const products = await Product.find(query).sort(sortObj);
        
        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
};

/**
 * Get single product by ID
 */
exports.getProductById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        const product = await Product.findOne({ _id: id, userId });
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }
};

/**
 * Create a new product
 */
exports.createProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name,
            sku,
            description,
            category,
            price,
            currency,
            pricingModel,
            discountPrice,
            taxRate,
            inStock,
            quantity,
            tags,
            imageUrl,
            customFields
        } = req.body;
        
        // Validation
        if (!name || !sku || !category || price === undefined) {
            return res.status(400).json({
                message: "Name, SKU, category, and price are required"
            });
        }
        
        // Check if SKU already exists for this user
        const existingSku = await Product.findOne({ userId, sku });
        if (existingSku) {
            return res.status(400).json({
                message: "A product with this SKU already exists"
            });
        }
        
        const product = new Product({
            userId,
            name,
            sku: sku.toUpperCase().trim(),
            description,
            category,
            price,
            currency: currency || 'USD',
            pricingModel: pricingModel || 'one-time',
            discountPrice,
            taxRate,
            inStock: inStock !== undefined ? inStock : true,
            quantity,
            tags,
            imageUrl,
            customFields
        });
        
        await product.save();
        
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Error creating product", error: error.message });
    }
};

/**
 * Update a product
 */
exports.updateProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const updateData = req.body;
        
        // Don't allow updating userId
        delete updateData.userId;
        
        // If SKU is being updated, check uniqueness
        if (updateData.sku) {
            updateData.sku = updateData.sku.toUpperCase().trim();
            const existingSku = await Product.findOne({
                userId,
                sku: updateData.sku,
                _id: { $ne: id }
            });
            if (existingSku) {
                return res.status(400).json({
                    message: "A product with this SKU already exists"
                });
            }
        }
        
        const product = await Product.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.json({
            success: true,
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
};

/**
 * Delete a product (soft delete by archiving)
 */
exports.deleteProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        const product = await Product.findOneAndUpdate(
            { _id: id, userId },
            { isArchived: true, isActive: false },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
};

/**
 * Permanently delete a product
 */
exports.permanentlyDeleteProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        const product = await Product.findOneAndDelete({ _id: id, userId });
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.json({
            success: true,
            message: "Product permanently deleted"
        });
    } catch (error) {
        console.error("Error permanently deleting product:", error);
        res.status(500).json({ message: "Error permanently deleting product", error: error.message });
    }
};

/**
 * Get all categories for a user
 */
exports.getCategories = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const categories = await Product.getCategoriesByUser(userId);
        
        // Add count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const count = await Product.countDocuments({
                    userId,
                    category,
                    isActive: true,
                    isArchived: false
                });
                return { name: category, count };
            })
        );
        
        res.json({
            success: true,
            categories: categoriesWithCount
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};

/**
 * Search products
 */
exports.searchProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ message: "Search query is required" });
        }
        
        const products = await Product.searchProducts(userId, q);
        
        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("Error searching products:", error);
        res.status(500).json({ message: "Error searching products", error: error.message });
    }
};

/**
 * Export products to CSV
 */
exports.exportProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const products = await Product.find({
            userId,
            isArchived: false
        }).lean();
        
        if (products.length === 0) {
            return res.status(404).json({ message: "No products to export" });
        }
        
        // Define CSV fields
        const fields = [
            'name',
            'sku',
            'description',
            'category',
            'price',
            'currency',
            'pricingModel',
            'discountPrice',
            'taxRate',
            'inStock',
            'quantity',
            'tags',
            'isActive'
        ];
        
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(products);
        
        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=products-export.csv');
        res.send(csv);
        
    } catch (error) {
        console.error("Error exporting products:", error);
        res.status(500).json({ message: "Error exporting products", error: error.message });
    }
};

/**
 * Import products from CSV
 */
exports.importProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const filePath = req.file.path;
        const results = [];
        const errors = [];
        
        // Parse CSV file
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                let imported = 0;
                let skipped = 0;
                
                for (const row of results) {
                    try {
                        // Validate required fields
                        if (!row.name || !row.sku || !row.category || !row.price) {
                            errors.push({
                                row: row,
                                error: "Missing required fields"
                            });
                            skipped++;
                            continue;
                        }
                        
                        // Check if SKU already exists
                        const existingSku = await Product.findOne({
                            userId,
                            sku: row.sku.toUpperCase().trim()
                        });
                        
                        if (existingSku) {
                            errors.push({
                                row: row,
                                error: "SKU already exists"
                            });
                            skipped++;
                            continue;
                        }
                        
                        // Create product
                        const product = new Product({
                            userId,
                            name: row.name,
                            sku: row.sku.toUpperCase().trim(),
                            description: row.description || "",
                            category: row.category,
                            price: parseFloat(row.price),
                            currency: row.currency || 'USD',
                            pricingModel: row.pricingModel || 'one-time',
                            discountPrice: row.discountPrice ? parseFloat(row.discountPrice) : null,
                            taxRate: row.taxRate ? parseFloat(row.taxRate) : 0,
                            inStock: row.inStock === 'true' || row.inStock === true,
                            quantity: row.quantity ? parseInt(row.quantity) : null,
                            tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
                            isActive: row.isActive === 'true' || row.isActive === true || row.isActive === undefined
                        });
                        
                        await product.save();
                        imported++;
                        
                    } catch (err) {
                        errors.push({
                            row: row,
                            error: err.message
                        });
                        skipped++;
                    }
                }
                
                // Delete uploaded file
                fs.unlinkSync(filePath);
                
                res.json({
                    success: true,
                    message: `Import completed: ${imported} products imported, ${skipped} skipped`,
                    imported,
                    skipped,
                    errors: errors.length > 0 ? errors : undefined
                });
            })
            .on('error', (error) => {
                // Delete uploaded file on error
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                res.status(500).json({
                    message: "Error parsing CSV file",
                    error: error.message
                });
            });
            
    } catch (error) {
        console.error("Error importing products:", error);
        res.status(500).json({ message: "Error importing products", error: error.message });
    }
};

/**
 * Get product statistics
 */
exports.getProductStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const totalProducts = await Product.countDocuments({
            userId,
            isArchived: false
        });
        
        const activeProducts = await Product.countDocuments({
            userId,
            isActive: true,
            isArchived: false
        });
        
        const outOfStock = await Product.countDocuments({
            userId,
            inStock: false,
            isArchived: false
        });
        
        const categories = await Product.distinct('category', {
            userId,
            isArchived: false
        });
        
        // Get total catalog value
        const valueAggregation = await Product.aggregate([
            {
                $match: {
                    userId: require('mongoose').Types.ObjectId(userId),
                    isActive: true,
                    isArchived: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: '$price' },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);
        
        const stats = {
            totalProducts,
            activeProducts,
            outOfStock,
            totalCategories: categories.length,
            totalValue: valueAggregation[0]?.totalValue || 0,
            avgPrice: valueAggregation[0]?.avgPrice || 0
        };
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error("Error fetching product stats:", error);
        res.status(500).json({ message: "Error fetching product stats", error: error.message });
    }
};
