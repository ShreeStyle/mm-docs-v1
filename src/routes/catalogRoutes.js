const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const catalogController = require('../controllers/catalogController');
const multer = require('multer');
const path = require('path');

// Configure multer for CSV file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/temp/');
    },
    filename: function (req, file, cb) {
        cb(null, `catalog-import-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (path.extname(file.originalname).toLowerCase() !== '.csv') {
            return cb(new Error('Only CSV files are allowed'));
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// All routes require authentication
router.use(authMiddleware);

// Product CRUD operations
router.get('/products', catalogController.getProducts);
router.get('/products/:id', catalogController.getProductById);
router.post('/products', catalogController.createProduct);
router.put('/products/:id', catalogController.updateProduct);
router.delete('/products/:id', catalogController.deleteProduct);
router.delete('/products/:id/permanent', catalogController.permanentlyDeleteProduct);

// Categories
router.get('/categories', catalogController.getCategories);

// Search
router.get('/search', catalogController.searchProducts);

// Import/Export
router.get('/export', catalogController.exportProducts);
router.post('/import', upload.single('file'), catalogController.importProducts);

// Statistics
router.get('/stats', catalogController.getProductStats);

module.exports = router;
