const Signature = require("../models/Signature");
const Document = require("../models/Document");
const User = require("../models/User");
const crypto = require("crypto");
const { sendEmail } = require("../services/email/emailService");

// Create signature request
exports.createSignatureRequest = async (req, res) => {
    try {
        const { documentId, signatories, expiresAt, requireAuthentication, accessCode, paymentRequired, paymentAmount } = req.body;
        const userId = req.user.id;
        
        if (!documentId || !signatories || signatories.length === 0) {
            return res.status(400).json({ message: "Document ID and signatories are required" });
        }
        
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        if (document.userId.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        // Check if signature request already exists
        const existingSignature = await Signature.findOne({ documentId, status: { $ne: 'completed' } });
        if (existingSignature) {
            return res.status(400).json({ message: "Active signature request already exists for this document" });
        }
        
        // Create signature request
        const signature = await Signature.create({
            documentId,
            createdBy: userId,
            signatories: signatories.map((sig, index) => ({
                email: sig.email,
                name: sig.name,
                role: sig.role,
                order: sig.order || index + 1,
                status: 'pending',
                remindersSent: 0
            })),
            status: 'draft',
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            requireAuthentication: requireAuthentication || false,
            accessCode: accessCode || null,
            paymentRequired: paymentRequired || false,
            paymentAmount: paymentAmount || 0,
            paymentStatus: paymentRequired ? 'pending' : null
        });
        
        res.status(201).json({
            message: "Signature request created successfully",
            signature
        });
    } catch (error) {
        console.error("Error creating signature request:", error);
        res.status(500).json({ message: "Error creating signature request", error: error.message });
    }
};

// Send signature request
exports.sendSignatureRequest = async (req, res) => {
    try {
        const { signatureId } = req.params;
        const userId = req.user.id;
        
        const signature = await Signature.findById(signatureId).populate('documentId', 'title type content');
        if (!signature) {
            return res.status(404).json({ message: "Signature request not found" });
        }
        
        if (signature.createdBy.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        if (signature.status !== 'draft') {
            return res.status(400).json({ message: "Signature request already sent" });
        }
        
        // Update status
        signature.status = 'sent';
        signature.sentAt = new Date();
        
        // Add audit trail
        signature.auditTrail.push({
            event: 'sent',
            userId,
            timestamp: new Date(),
            details: { sentTo: signature.signatories.map(s => s.email) }
        });
        
        await signature.save();
        
        // TODO: Send emails to all signatories
        // For now, just log
        console.log('Sending signature request emails to:', signature.signatories.map(s => s.email));
        
        res.json({
            message: "Signature request sent successfully",
            signature
        });
    } catch (error) {
        console.error("Error sending signature request:", error);
        res.status(500).json({ message: "Error sending signature request", error: error.message });
    }
};

// Get signature request
exports.getSignatureRequest = async (req, res) => {
    try {
        const { signatureId } = req.params;
        
        const signature = await Signature.findById(signatureId)
            .populate('documentId', 'title type content')
            .populate('createdBy', 'name email');
        
        if (!signature) {
            return res.status(404).json({ message: "Signature request not found" });
        }
        
        res.json(signature);
    } catch (error) {
        console.error("Error fetching signature request:", error);
        res.status(500).json({ message: "Error fetching signature request", error: error.message });
    }
};

// Sign document
exports.signDocument = async (req, res) => {
    try {
        const { signatureId } = req.params;
        const { email, signatureData, ipAddress, userAgent } = req.body;
        
        if (!email || !signatureData) {
            return res.status(400).json({ message: "Email and signature data are required" });
        }
        
        const signature = await Signature.findById(signatureId);
        if (!signature) {
            return res.status(404).json({ message: "Signature request not found" });
        }
        
        if (signature.status === 'expired') {
            return res.status(400).json({ message: "Signature request has expired" });
        }
        
        if (signature.expiresAt && signature.expiresAt < new Date()) {
            signature.status = 'expired';
            await signature.save();
            return res.status(400).json({ message: "Signature request has expired" });
        }
        
        // Find signatory
        const signatory = signature.signatories.find(s => s.email === email);
        if (!signatory) {
            return res.status(404).json({ message: "Signatory not found" });
        }
        
        if (signatory.status === 'signed') {
            return res.status(400).json({ message: "Already signed" });
        }
        
        // Check signing order
        if (signature.settings.signInOrder) {
            const currentOrder = signatory.order;
            const previousSignatories = signature.signatories.filter(s => s.order < currentOrder);
            const allPreviousSigned = previousSignatories.every(s => s.status === 'signed');
            
            if (!allPreviousSigned) {
                return res.status(400).json({ message: "Please wait for previous signatories to sign" });
            }
        }
        
        // Update signatory
        signatory.status = 'signed';
        signatory.signedAt = new Date();
        signatory.signatureData = signatureData;
        signatory.ipAddress = ipAddress;
        signatory.userAgent = userAgent;
        
        // Add audit trail
        signature.auditTrail.push({
            event: 'signed',
            email,
            timestamp: new Date(),
            ipAddress,
            details: { signatory: email }
        });
        
        // Check if all signed
        const allSigned = signature.signatories.every(s => s.status === 'signed');
        
        if (allSigned) {
            signature.status = 'fully-signed';
            
            // If payment required, check payment status
            if (signature.paymentRequired && signature.paymentStatus !== 'paid') {
                signature.status = 'completed'; // Waiting for payment
            } else {
                signature.status = 'completed';
                signature.completedAt = new Date();
                
                // Generate certificate
                signature.certificate = {
                    certificateId: `CERT_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
                    issueDate: new Date(),
                    validUntil: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years
                };
            }
        } else {
            const signedCount = signature.signatories.filter(s => s.status === 'signed').length;
            signature.status = signedCount > 0 ? 'partially-signed' : 'sent';
        }
        
        await signature.save();
        
        res.json({
            message: "Document signed successfully",
            signature,
            allSigned
        });
    } catch (error) {
        console.error("Error signing document:", error);
        res.status(500).json({ message: "Error signing document", error: error.message });
    }
};

// Decline to sign
exports.declineSignature = async (req, res) => {
    try {
        const { signatureId } = req.params;
        const { email, reason } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        const signature = await Signature.findById(signatureId);
        if (!signature) {
            return res.status(404).json({ message: "Signature request not found" });
        }
        
        const signatory = signature.signatories.find(s => s.email === email);
        if (!signatory) {
            return res.status(404).json({ message: "Signatory not found" });
        }
        
        signatory.status = 'declined';
        signatory.declinedAt = new Date();
        signatory.declineReason = reason;
        
        signature.status = 'declined';
        
        // Add audit trail
        signature.auditTrail.push({
            event: 'declined',
            email,
            timestamp: new Date(),
            details: { reason }
        });
        
        await signature.save();
        
        res.json({
            message: "Signature declined",
            signature
        });
    } catch (error) {
        console.error("Error declining signature:", error);
        res.status(500).json({ message: "Error declining signature", error: error.message });
    }
};

// Get signature requests for user
exports.getUserSignatureRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        // Find all signature requests where user is a signatory or creator
        const signatures = await Signature.find({
            $or: [
                { createdBy: userId },
                { 'signatories.email': user.email }
            ]
        })
        .populate('documentId', 'title type')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
        
        res.json({ signatures });
    } catch (error) {
        console.error("Error fetching signature requests:", error);
        res.status(500).json({ message: "Error fetching signature requests", error: error.message });
    }
};

// Get pending signatures for user
exports.getPendingSignatures = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        
        const signatures = await Signature.find({
            'signatories.email': user.email,
            'signatories.status': 'pending',
            status: { $in: ['sent', 'partially-signed'] }
        })
        .populate('documentId', 'title type')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
        
        res.json({ signatures });
    } catch (error) {
        console.error("Error fetching pending signatures:", error);
        res.status(500).json({ message: "Error fetching pending signatures", error: error.message });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { signatureId } = req.params;
        const { paymentStatus, transactionId } = req.body;
        
        const signature = await Signature.findById(signatureId);
        if (!signature) {
            return res.status(404).json({ message: "Signature request not found" });
        }
        
        signature.paymentStatus = paymentStatus;
        signature.paymentTransactionId = transactionId;
        
        if (paymentStatus === 'paid') {
            signature.paidAt = new Date();
            
            // If fully signed and paid, mark as completed
            if (signature.status === 'fully-signed') {
                signature.status = 'completed';
                signature.completedAt = new Date();
            }
        }
        
        // Add audit trail
        signature.auditTrail.push({
            event: 'payment-updated',
            timestamp: new Date(),
            details: { status: paymentStatus, transactionId }
        });
        
        await signature.save();
        
        res.json({
            message: "Payment status updated",
            signature
        });
    } catch (error) {
        console.error("Error updating payment status:", error);
        res.status(500).json({ message: "Error updating payment status", error: error.message });
    }
};
