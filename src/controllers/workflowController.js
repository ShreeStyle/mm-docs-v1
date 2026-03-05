const Workflow = require("../models/Workflow");
const Document = require("../models/Document");
const User = require("../models/User");
const Organization = require("../models/Organization");

// Create workflow for document
exports.createWorkflow = async (req, res) => {
    try {
        const { documentId, workflowType, stages } = req.body;
        const userId = req.user.id;
        
        if (!documentId || !stages || stages.length === 0) {
            return res.status(400).json({ message: "Document ID and stages are required" });
        }
        
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }
        
        if (document.userId.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        // Check if workflow already exists
        const existingWorkflow = await Workflow.findOne({ documentId });
        if (existingWorkflow) {
            return res.status(400).json({ message: "Workflow already exists for this document" });
        }
        
        // Create workflow
        const workflow = await Workflow.create({
            documentId,
            workflowType: workflowType || 'sequential',
            status: 'draft',
            stages: stages.map((stage, index) => ({
                stageId: `stage_${index + 1}`,
                name: stage.name,
                role: stage.role,
                assignedTo: stage.assignedTo || [],
                status: index === 0 ? 'pending' : 'pending',
                order: index + 1,
                dueDate: stage.dueDate,
                requiredApprovals: stage.requiredApprovals || 1,
                approvals: []
            })),
            createdBy: userId,
            currentStageIndex: 0
        });
        
        res.status(201).json({
            message: "Workflow created successfully",
            workflow
        });
    } catch (error) {
        console.error("Error creating workflow:", error);
        res.status(500).json({ message: "Error creating workflow", error: error.message });
    }
};

// Get workflow for document
exports.getWorkflow = async (req, res) => {
    try {
        const { documentId } = req.params;
        
        const workflow = await Workflow.findOne({ documentId })
            .populate('createdBy', 'name email')
            .populate('stages.assignedTo', 'name email')
            .populate('stages.completedBy', 'name email')
            .populate('stages.approvals.userId', 'name email')
            .populate('rejectedBy', 'name email');
        
        if (!workflow) {
            return res.status(404).json({ message: "Workflow not found" });
        }
        
        res.json(workflow);
    } catch (error) {
        console.error("Error fetching workflow:", error);
        res.status(500).json({ message: "Error fetching workflow", error: error.message });
    }
};

// Submit workflow for approval
exports.submitForApproval = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;
        
        const workflow = await Workflow.findOne({ documentId });
        if (!workflow) {
            return res.status(404).json({ message: "Workflow not found" });
        }
        
        if (workflow.createdBy.toString() !== userId) {
            return res.status(403).json({ message: "Only the creator can submit for approval" });
        }
        
        if (workflow.status !== 'draft') {
            return res.status(400).json({ message: "Workflow already submitted" });
        }
        
        workflow.status = 'in-review';
        workflow.stages[0].status = 'in-progress';
        
        // Send notifications to first stage approvers
        const firstStage = workflow.stages[0];
        firstStage.assignedTo.forEach(approverId => {
            workflow.notifications.push({
                userId: approverId,
                type: 'approval-needed',
                sentAt: new Date(),
                read: false
            });
        });
        
        await workflow.save();
        await workflow.populate('stages.assignedTo', 'name email');
        
        res.json({
            message: "Document submitted for approval",
            workflow
        });
    } catch (error) {
        console.error("Error submitting for approval:", error);
        res.status(500).json({ message: "Error submitting for approval", error: error.message });
    }
};

// Approve/Reject stage
exports.reviewStage = async (req, res) => {
    try {
        const { documentId, stageId } = req.params;
        const { decision, comments } = req.body;
        const userId = req.user.id;
        
        if (!decision || !['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({ message: "Valid decision (approved/rejected) is required" });
        }
        
        const workflow = await Workflow.findOne({ documentId });
        if (!workflow) {
            return res.status(404).json({ message: "Workflow not found" });
        }
        
        const stage = workflow.stages.find(s => s.stageId === stageId);
        if (!stage) {
            return res.status(404).json({ message: "Stage not found" });
        }
        
        // Check if user is assigned to this stage
        const isAssigned = stage.assignedTo.some(id => id.toString() === userId);
        if (!isAssigned) {
            return res.status(403).json({ message: "You are not assigned to review this stage" });
        }
        
        // Check if user already reviewed
        const alreadyReviewed = stage.approvals.some(a => a.userId.toString() === userId);
        if (alreadyReviewed) {
            return res.status(400).json({ message: "You have already reviewed this stage" });
        }
        
        // Add approval/rejection
        stage.approvals.push({
            userId,
            decision,
            comments,
            timestamp: new Date()
        });
        
        if (decision === 'rejected') {
            // If rejected, entire workflow is rejected
            workflow.status = 'rejected';
            workflow.rejectedAt = new Date();
            workflow.rejectedBy = userId;
            workflow.rejectionReason = comments;
            stage.status = 'rejected';
            
            // Notify creator
            workflow.notifications.push({
                userId: workflow.createdBy,
                type: 'rejected',
                sentAt: new Date(),
                read: false
            });
        } else {
            // Check if stage has enough approvals
            const approvalCount = stage.approvals.filter(a => a.decision === 'approved').length;
            
            if (approvalCount >= stage.requiredApprovals) {
                // Stage approved
                stage.status = 'approved';
                stage.completedAt = new Date();
                stage.completedBy = userId;
                
                // Move to next stage
                const currentIndex = workflow.stages.findIndex(s => s.stageId === stageId);
                const nextIndex = currentIndex + 1;
                
                if (nextIndex < workflow.stages.length) {
                    // More stages remaining
                    workflow.currentStageIndex = nextIndex;
                    workflow.stages[nextIndex].status = 'in-progress';
                    
                    // Notify next stage approvers
                    workflow.stages[nextIndex].assignedTo.forEach(approverId => {
                        workflow.notifications.push({
                            userId: approverId,
                            type: 'approval-needed',
                            sentAt: new Date(),
                            read: false
                        });
                    });
                } else {
                    // All stages complete
                    workflow.status = 'approved';
                    workflow.completedAt = new Date();
                    
                    // Check SLA
                    if (workflow.sla && workflow.sla.expectedCompletionDate) {
                        workflow.sla.actualCompletionDate = new Date();
                        workflow.sla.isOnTime = workflow.sla.actualCompletionDate <= workflow.sla.expectedCompletionDate;
                    }
                    
                    // Notify creator
                    workflow.notifications.push({
                        userId: workflow.createdBy,
                        type: 'approved',
                        sentAt: new Date(),
                        read: false
                    });
                }
            }
        }
        
        await workflow.save();
        await workflow.populate('stages.assignedTo stages.approvals.userId', 'name email');
        
        res.json({
            message: decision === 'approved' ? "Stage approved" : "Workflow rejected",
            workflow
        });
    } catch (error) {
        console.error("Error reviewing stage:", error);
        res.status(500).json({ message: "Error reviewing stage", error: error.message });
    }
};

// Get workflows pending for user
exports.getPendingApprovals = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const workflows = await Workflow.find({
            'stages.assignedTo': userId,
            status: 'in-review'
        })
        .populate('documentId', 'title type')
        .populate('createdBy', 'name email')
        .populate('stages.assignedTo', 'name email');
        
        // Filter to only show stages where user hasn't approved yet
        const pendingWorkflows = workflows.map(workflow => {
            const pendingStages = workflow.stages.filter(stage => {
                const isAssigned = stage.assignedTo.some(id => id._id.toString() === userId);
                const hasReviewed = stage.approvals.some(a => a.userId.toString() === userId);
                return isAssigned && !hasReviewed && ['pending', 'in-progress'].includes(stage.status);
            });
            
            return {
                ...workflow.toObject(),
                pendingStages
            };
        }).filter(w => w.pendingStages.length > 0);
        
        res.json({ workflows: pendingWorkflows });
    } catch (error) {
        console.error("Error fetching pending approvals:", error);
        res.status(500).json({ message: "Error fetching pending approvals", error: error.message });
    }
};

// Get workflow templates for organization/role
exports.getWorkflowTemplates = async (req, res) => {
    try {
        const userId = req.user.id;
        const { role, documentType } = req.query;
        
        // Predefined workflow templates
        const templates = [
            {
                id: 'hr-standard',
                name: 'HR Standard Approval',
                description: 'Standard workflow for HR documents',
                roles: ['hr'],
                documentTypes: ['offer-letter', 'employment-contract', 'onboarding'],
                stages: [
                    { name: 'HR Manager Review', role: 'hr', order: 1, requiredApprovals: 1 },
                    { name: 'Department Head Approval', role: 'manager', order: 2, requiredApprovals: 1 },
                    { name: 'Final HR Approval', role: 'hr', order: 3, requiredApprovals: 1 }
                ]
            },
            {
                id: 'legal-standard',
                name: 'Legal Review Workflow',
                description: 'Standard workflow for legal documents',
                roles: ['legal'],
                documentTypes: ['contract', 'nda', 'agreement'],
                stages: [
                    { name: 'Legal Team Review', role: 'legal', order: 1, requiredApprovals: 1 },
                    { name: 'Senior Legal Counsel', role: 'legal', order: 2, requiredApprovals: 1 },
                    { name: 'Executive Approval', role: 'director', order: 3, requiredApprovals: 1 }
                ]
            },
            {
                id: 'finance-standard',
                name: 'Finance Approval Workflow',
                description: 'Standard workflow for financial documents',
                roles: ['finance'],
                documentTypes: ['invoice', 'payment-request', 'budget'],
                stages: [
                    { name: 'Finance Team Review', role: 'finance', order: 1, requiredApprovals: 1 },
                    { name: 'Finance Manager Approval', role: 'manager', order: 2, requiredApprovals: 1 }
                ]
            },
            {
                id: 'sales-standard',
                name: 'Sales Contract Workflow',
                description: 'Standard workflow for sales documents',
                roles: ['sales'],
                documentTypes: ['proposal', 'contract', 'quote'],
                stages: [
                    { name: 'Sales Manager Review', role: 'sales', order: 1, requiredApprovals: 1 },
                    { name: 'Legal Review', role: 'legal', order: 2, requiredApprovals: 1 },
                    { name: 'Executive Approval', role: 'director', order: 3, requiredApprovals: 1 }
                ]
            }
        ];
        
        let filteredTemplates = templates;
        
        if (role) {
            filteredTemplates = filteredTemplates.filter(t => t.roles.includes(role));
        }
        
        if (documentType) {
            filteredTemplates = filteredTemplates.filter(t => t.documentTypes.includes(documentType));
        }
        
        res.json({ templates: filteredTemplates });
    } catch (error) {
        console.error("Error fetching workflow templates:", error);
        res.status(500).json({ message: "Error fetching templates", error: error.message });
    }
};
