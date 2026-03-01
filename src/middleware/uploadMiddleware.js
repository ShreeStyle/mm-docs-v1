const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
const logosDir = path.join(uploadsDir, "logos");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, logosDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename: userId_timestamp_originalname
        const userId = req.user?.id || 'unknown';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${userId}_${timestamp}_${sanitizedName}${ext}`;
        cb(null, filename);
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, svg, webp)"));
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: fileFilter
});

// Middleware for single logo upload
exports.uploadLogo = upload.single('logo');

// Middleware to handle multer errors
exports.handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                message: "File is too large. Maximum size is 5MB." 
            });
        }
        return res.status(400).json({ 
            message: `Upload error: ${err.message}` 
        });
    } else if (err) {
        return res.status(400).json({ 
            message: err.message || "Error uploading file" 
        });
    }
    next();
};

// Helper to delete old logo file
exports.deleteLogoFile = (logoUrl) => {
    try {
        if (!logoUrl) return;
        
        // Extract filename from URL (assumes format: /uploads/logos/filename.ext)
        const filename = path.basename(logoUrl);
        const filepath = path.join(logosDir, filename);
        
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log(`🗑️  Deleted old logo: ${filename}`);
        }
    } catch (error) {
        console.error("Error deleting logo file:", error);
    }
};
