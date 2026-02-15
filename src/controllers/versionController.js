const DocumentVersion = require("../models/DocumentVersion");
const Document = require("../models/Document");

// Create a version snapshot
exports.createVersion = async (documentId, userId, changeDescription = "Auto-saved version") => {
    try {
        const document = await Document.findOne({ _id: documentId, userId });
        if (!document) {
            throw new Error("Document not found");
        }

        // Get the latest version number
        const latestVersion = await DocumentVersion.findOne({ documentId })
            .sort({ versionNumber: -1 })
            .select("versionNumber");

        const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

        // Create version snapshot
        const version = await DocumentVersion.create({
            documentId,
            userId,
            versionNumber,
            title: document.title,
            type: document.type,
            content: document.content,
            brandKitId: document.brandKitId,
            changeDescription,
        });

        console.log(`📸 Version ${versionNumber} created for document ${documentId}`);
        return version;

    } catch (error) {
        console.error("Version Creation Error:", error);
        throw error;
    }
};

// Get all versions for a document
exports.getVersionHistory = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.user.id;

        // Verify ownership
        const document = await Document.findOne({ _id: documentId, userId });
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const versions = await DocumentVersion.find({ documentId })
            .sort({ versionNumber: -1 })
            .select("-content") // Exclude content for list view
            .limit(50); // Limit to last 50 versions

        res.json({
            documentId,
            currentTitle: document.title,
            totalVersions: versions.length,
            versions: versions.map(v => ({
                versionNumber: v.versionNumber,
                title: v.title,
                changeDescription: v.changeDescription,
                createdAt: v.createdAt,
            })),
        });

    } catch (error) {
        console.error("Version History Error:", error);
        res.status(500).json({ message: "Error fetching version history", error: error.message });
    }
};

// Get specific version details
exports.getVersion = async (req, res) => {
    try {
        const { id: documentId, versionNumber } = req.params;
        const userId = req.user.id;

        const version = await DocumentVersion.findOne({
            documentId,
            userId,
            versionNumber: parseInt(versionNumber),
        });

        if (!version) {
            return res.status(404).json({ message: "Version not found" });
        }

        res.json(version);

    } catch (error) {
        res.status(500).json({ message: "Error fetching version", error: error.message });
    }
};

// Restore a previous version
exports.restoreVersion = async (req, res) => {
    try {
        const { id: documentId, versionNumber } = req.params;
        const userId = req.user.id;

        // Get the version to restore
        const version = await DocumentVersion.findOne({
            documentId,
            userId,
            versionNumber: parseInt(versionNumber),
        });

        if (!version) {
            return res.status(404).json({ message: "Version not found" });
        }

        // Create a snapshot of current state before restoring
        await exports.createVersion(documentId, userId, `Before restoring to v${versionNumber}`);

        // Update document with version content
        const document = await Document.findOneAndUpdate(
            { _id: documentId, userId },
            {
                title: version.title,
                type: version.type,
                content: version.content,
                brandKitId: version.brandKitId,
            },
            { new: true }
        );

        // Create new version for the restore action
        await exports.createVersion(documentId, userId, `Restored from v${versionNumber}`);

        res.json({
            message: `Document restored to version ${versionNumber}`,
            document,
        });

    } catch (error) {
        console.error("Version Restore Error:", error);
        res.status(500).json({ message: "Error restoring version", error: error.message });
    }
};
