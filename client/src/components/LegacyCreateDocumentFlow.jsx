import React, { useState, useEffect } from 'react';
import {
    Search, FileText, Plus, Star, Clock, DollarSign,
    Bell, MoreHorizontal, ArrowUp, X, Zap, Wand2,
    LayoutGrid, FilePlus, Layers, Package, GitBranch,
    BarChart, Menu, ChevronRight, Edit3, Download,
    Filter, Eye, AlertCircle, Users, TrendingUp,
    CheckSquare, Shield, Settings, LogOut, FileSpreadsheet, Save, Check, Calculator, Handshake
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import { getApiUrl } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function LegacyCreateDocumentFlow({ 
    currentView, setCurrentView, 
    selectedDocType, setSelectedDocType,
    user, brandKit, organization,
    isMobile, isTablet,
    docs, setDocs,
    setError, token
}) {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(null);

    // ── Components ────────────────────────────────────────────────────────────

    const StepIndicator = ({ currentStep }) => {
        const steps = [
            { id: 1, label: 'Select Category' },
            { id: 2, label: 'Smart Form Input' },
            { id: 3, label: 'View Document' }
        ];

        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, marginBottom: 60, marginTop: 20 }}>
                {steps.map((step, idx) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;
                    
                    // Colors from mockup
                    const activeColor = '#6366F1';
                    const completedColor = '#6366F1';
                    const inactiveColor = '#A3A3A3';

                    return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                background: isCompleted ? activeColor : isActive ? `linear-gradient(135deg, ${activeColor}, #8B5CF6)` : '#BCBCBC',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: 16,
                                fontWeight: 600,
                                zIndex: 2,
                                boxShadow: isActive ? `0 0 0 6px ${activeColor}20` : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                {isCompleted ? <Check size={22} strokeWidth={3} /> : step.id}
                            </div>
                            <span style={{ 
                                fontSize: 12, 
                                fontWeight: 600, 
                                color: isActive || isCompleted ? '#1F2937' : '#9CA3AF',
                                whiteSpace: 'nowrap' 
                            }}>{step.label}</span>
                            
                            {/* Connector line */}
                            {idx < steps.length - 1 && (
                                <div style={{
                                    position: 'absolute',
                                    top: 22,
                                    left: 70,
                                    width: 100,
                                    height: 1,
                                    background: currentStep > step.id ? activeColor : '#E5E7EB',
                                    zIndex: 1
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const CreateDocumentPage = () => {
        // Document categories definition
        const categories = [
            {
                id: 'hr',
                name: 'HR',
                icon: Users,
                description: 'Employee contracts, offer letters, and HR policies.',
                color: '#6366F1',
                bgColor: '#F5F7FF',
                miniIcons: [Users, Star, Shield]
            },
            {
                id: 'sales',
                name: 'Sales',
                icon: TrendingUp,
                description: 'Sales proposals, contracts, and business deals.',
                color: '#F97316',
                bgColor: '#FFF8F1',
                miniIcons: [TrendingUp, Handshake, Bell]
            },
            {
                id: 'finance',
                name: 'Finance',
                icon: DollarSign,
                description: 'Invoices, payment records, and financial documentation.',
                color: '#10B981',
                bgColor: '#F2FDF9',
                miniIcons: [FileSpreadsheet, DollarSign, Calculator]
            },
            {
                id: 'compliance',
                name: 'Compliance',
                icon: CheckSquare,
                description: 'Audit reports, policies, and regulatory documentation.',
                color: '#F59E0B',
                bgColor: '#FFFBF2',
                miniIcons: [Shield, CheckSquare, Clock]
            }
        ];

        // All document types organized by category
        const documentsByCategory = {
            hr: [
                { label: 'Offer Letter', type: 'offer_letter' },
                { label: 'Appointment Letter', type: 'appointment_letter' },
                { label: 'Onboarding Letter', type: 'onboarding_letter' },
                { label: 'Experience Certificate', type: 'experience_certificate' },
                { label: 'Warning Letter', type: 'warning_letter' }
            ],

            sales: [
                { label: 'Business Proposal', type: 'business_proposal' },
                { label: 'Quotation', type: 'quotation' },
                { label: 'Sales Contract', type: 'sales_contract' },
                { label: 'Partnership Agreement', type: 'partnership_agreement' }
            ],
            finance: [
                { label: 'Invoice', type: 'invoice' },
                { label: 'Purchase Order', type: 'purchase_order' },
                { label: 'Receipt', type: 'receipt' },
                { label: 'GST Invoice', type: 'gst_invoice' },
                { label: 'Credit Note', type: 'credit_note' }
            ],
            compliance: [
                { label: 'GST Filing Summary', type: 'gst_filing_summary' },
                { label: 'Audit Report', type: 'audit_report' },
                { label: 'Policy Document', type: 'policy_document' },
                { label: 'Regulatory Filing', type: 'regulatory_filing' }
            ]
        };

        // If currentView is a category (hr, legal, etc.), show documents in that category
        if (['hr', 'sales', 'finance', 'compliance'].includes(currentView)) {
            const category = categories.find(cat => cat.id === currentView);
            const documents = documentsByCategory[currentView];

            return (
                <div style={{
                    padding: isMobile ? '16px' : '32px',
                    maxWidth: '700px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #F3F4F6' }}>
                            <button
                                onClick={() => setCurrentView('create')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#6B7280',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    padding: '0',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: '500'
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#111827'}
                                onMouseLeave={(e) => e.target.style.color = '#6B7280'}
                            >
                                <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                                Back to Categories
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '10px',
                                    backgroundColor: category.bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: category.color
                                }}>
                                    <category.icon size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '20px',
                                        fontWeight: '600',
                                        color: '#111827',
                                        margin: 0,
                                        letterSpacing: '-0.01em'
                                    }}>{category.name}</h3>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#6B7280',
                                        margin: '2px 0 0 0'
                                    }}>{category.description}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '20px 24px 24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {documents.map((doc, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedDocType(doc.type);
                                            setCurrentView('generate-document');
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            backgroundColor: 'white',
                                            color: '#374151',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            fontSize: '15px',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = category.color;
                                            e.currentTarget.style.backgroundColor = category.bgColor;
                                            e.currentTarget.style.color = category.color;
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#E5E7EB';
                                            e.currentTarget.style.color = '#374151';
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <span>{doc.label}</span>
                                        <ChevronRight size={18} style={{ opacity: 0.4 }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Determine current step
        const step = currentView === 'generate-document' ? 2 : currentView === 'view-document' ? 3 : 1;

        return (
            <div style={{
                padding: isMobile ? '16px' : '24px 40px',
                maxWidth: '1200px',
                margin: '0 auto',
                fontFamily: 'Inter, sans-serif'
            }}>
                <StepIndicator currentStep={step} />

                <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontSize: 32, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>1. Select Category</h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                    gap: 12,
                    marginBottom: 32
                }}>
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory === cat.id;

                        return (
                            <motion.div
                                key={cat.id}
                                whileHover={{ y: -3, boxShadow: '0 6px 12px -4px rgba(0,0,0,0.08)' }}
                                onClick={() => setSelectedCategory(cat.id)}
                                style={{
                                    background: '#fff',
                                    border: `1px solid ${isSelected ? cat.color : '#E5E7EB'}`,
                                    borderRadius: 12,
                                    padding: '0 0 12px 0',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: isSelected ? `0 0 0 2px ${cat.color}15, 0 4px 10px -6px rgba(0,0,0,0.06)` : '0 1px 2px rgba(0,0,0,0.01)',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: 240
                                }}
                            >
                                {/* Illustration Area */}
                                <div style={{
                                    height: 110,
                                    background: `radial-gradient(circle at center, ${cat.bgColor}, #fff)`,
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}>
                                    {/* Circular Waves (CSS Radar) */}
                                    {[1, 2, 3].map(i => (
                                        <motion.div 
                                            key={i}
                                            animate={{
                                                scale: [1, 1.02, 1],
                                                opacity: [0.15, 0.3, 0.15]
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                delay: i * 0.5,
                                                ease: "linear"
                                            }}
                                            style={{
                                                position: 'absolute',
                                                width: 40 + (i * 30),
                                                height: 40 + (i * 30),
                                                border: `1px solid ${cat.color}${i === 1 ? '25' : '10'}`,
                                                borderRadius: '50%',
                                            }} 
                                        />
                                    ))}

                                    {/* Central Icon */}
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 10,
                                        background: '#fff', color: cat.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 3px 8px -2px rgba(0,0,0,0.08)', zIndex: 10,
                                        border: `1px solid ${cat.color}08`
                                    }}>
                                        <Icon size={20} strokeWidth={1.5} />
                                    </div>

                                    {/* Floating Mini Icons */}
                                    {cat.miniIcons.map((MIcon, idx) => {
                                        const pos = [
                                            { top: '12%', left: '12%' },
                                            { top: '8%', right: '18%' },
                                            { top: '22%', right: '6%' }
                                        ][idx];
                                        return (
                                            <motion.div 
                                                key={idx}
                                                animate={{
                                                    y: [0, -3, 0]
                                                }}
                                                transition={{
                                                    duration: 3 + idx,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                style={{
                                                    position: 'absolute', 
                                                    ...pos,
                                                    width: 26, height: 26, borderRadius: '50%',
                                                    background: '#fff', color: cat.color,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    boxShadow: '0 3px 6px -2px rgba(0,0,0,0.05)',
                                                    zIndex: 5,
                                                    border: `1px solid ${cat.color}05`
                                                }}
                                            >
                                                <MIcon size={12} strokeWidth={2} />
                                            </motion.div>
                                        );
                                    })}

                                    {/* Selection Checkmark */}
                                    <AnimatePresence>
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    background: cat.color,
                                                    color: '#fff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    zIndex: 20,
                                                    boxShadow: `0 2px 6px ${cat.color}20`
                                                }}
                                            >
                                                <Check size={12} strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Content Area */}
                                <div style={{ padding: '12px 12px 0', flex: 1 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.01em' }}>{cat.name}</h3>
                                    <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.3, margin: 0, fontWeight: 400 }}>{cat.description}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #F3F4F6', paddingTop: 40 }}>
                    <button
                        disabled={!selectedCategory}
                        onClick={() => {
                            if (selectedCategory) setCurrentView(selectedCategory);
                        }}
                        style={{
                            padding: '16px 64px',
                            background: selectedCategory ? '#4F46E5' : '#F3F4F6',
                            color: selectedCategory ? '#fff' : '#9CA3AF',
                            border: 'none',
                            borderRadius: 12,
                            fontSize: 18,
                            fontWeight: 700,
                            cursor: selectedCategory ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: selectedCategory ? '0 8px 24px -6px rgba(79, 70, 229, 0.4)' : 'none',
                            transform: selectedCategory ? 'scale(1)' : 'scale(0.98)'
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    };


    const DocumentGenerationPage = () => {
        const [validationErrors, setValidationErrors] = useState([]);
        const [formData, setFormData] = useState({
            companyName: organization?.name || brandKit?.brandName || '',
            companyAddress: organization?.registeredAddress ? 
                `${organization.registeredAddress.line1}${organization.registeredAddress.line2 ? ', ' + organization.registeredAddress.line2 : ''}, ${organization.registeredAddress.city}, ${organization.registeredAddress.state} - ${organization.registeredAddress.postalCode}` : 
                brandKit?.footer?.address || '',
            bankName: brandKit?.banking?.bankName || organization?.banking?.bankName || '',
            accountName: brandKit?.banking?.accountName || organization?.banking?.accountName || '',
            accountNumber: brandKit?.banking?.accountNumber || organization?.banking?.accountNumber || '',
            ifscCode: brandKit?.banking?.ifscCode || organization?.banking?.ifscCode || '',
            upiId: brandKit?.banking?.upiId || organization?.banking?.upiId || '',
            gstNumber: organization?.tax?.gstin || '',
            pan: organization?.tax?.pan || '',
            signatureName: organization?.signatory?.name || user?.name || ''
        });
        const [isGenerating, setIsGenerating] = useState(false);
        const [generationStepText, setGenerationStepText] = useState("");

        // Pre-fill form with Organization/BrandKit data on mount
        useEffect(() => {
            if (organization || brandKit) {
                setFormData(prev => ({
                    ...prev,
                    companyName: prev.companyName || organization?.name || brandKit?.brandName || '',
                    companyAddress: prev.companyAddress || (organization?.registeredAddress ? 
                        `${organization.registeredAddress.line1}${organization.registeredAddress.line2 ? ', ' + organization.registeredAddress.line2 : ''}, ${organization.registeredAddress.city}, ${organization.registeredAddress.state} - ${organization.registeredAddress.postalCode}` : 
                        brandKit?.footer?.address || ''),
                    bankName: prev.bankName || brandKit?.banking?.bankName || organization?.banking?.bankName || '',
                    accountName: prev.accountName || brandKit?.banking?.accountName || organization?.banking?.accountName || '',
                    accountNumber: prev.accountNumber || brandKit?.banking?.accountNumber || organization?.banking?.accountNumber || '',
                    ifscCode: prev.ifscCode || brandKit?.banking?.ifscCode || organization?.banking?.ifscCode || '',
                    upiId: prev.upiId || brandKit?.banking?.upiId || organization?.banking?.upiId || '',
                    gstNumber: prev.gstNumber || organization?.tax?.gstin || '',
                    pan: prev.pan || organization?.tax?.pan || '',
                    signatureName: prev.signatureName || organization?.signatory?.name || user?.name || ''
                }));
            }
        }, [organization, brandKit, user]);


        // Get form fields based on document type
        const getFormFields = () => {
            const commonFields = [
                { id: 'companyName', label: 'Company Name', type: 'text', placeholder: 'e.g. Your Company Name', required: true },
                { id: 'companyAddress', label: 'Company Address', type: 'textarea', placeholder: '123 Tech Park, Bangalore - 560001', required: true }
            ];

            const fieldsByType = {
                // HR Documents
                offer_letter: [
                    ...commonFields,
                    { id: 'candidateName', label: 'Candidate Name', type: 'text', placeholder: 'e.g. Priya Sharma', required: true },
                    { id: 'position', label: 'Position', type: 'text', placeholder: 'e.g. Senior Software Engineer', required: true },
                    { id: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Engineering', required: true },
                    { id: 'salary', label: 'Annual Salary (₹)', type: 'number', placeholder: 'e.g. 1800000', required: true },
                    { id: 'startDate', label: 'Start Date', type: 'date', required: true },
                    { id: 'reportingTo', label: 'Reporting Manager', type: 'text', placeholder: 'e.g. Director of Engineering', required: true },
                    { id: 'workLocation', label: 'Work Location', type: 'text', placeholder: 'e.g. Bangalore Office / Remote', required: true }
                ],
                appointment_letter: [
                    ...commonFields,
                    { id: 'employeeName', label: 'Employee Name', type: 'text', placeholder: 'e.g. Priya Sharma', required: true },
                    { id: 'employeeAddress', label: 'Employee Address', type: 'textarea', placeholder: 'Complete address of the employee', required: true },
                    { id: 'position', label: 'Position', type: 'text', placeholder: 'e.g. Senior Software Engineer', required: true },
                    { id: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Engineering', required: true },
                    { id: 'salary', label: 'Annual Salary (₹)', type: 'number', placeholder: 'e.g. 1500000', required: true },
                    { id: 'appointmentDate', label: 'Appointment Date', type: 'date', required: true },
                    { id: 'reportingTo', label: 'Reporting Manager', type: 'text', placeholder: 'e.g. Director of Engineering', required: true }
                ],
                experience_certificate: [
                    ...commonFields,
                    { id: 'employeeName', label: 'Employee Name', type: 'text', placeholder: 'e.g. Priya Sharma', required: true },
                    { id: 'position', label: 'Position Held', type: 'text', placeholder: 'e.g. Senior Software Engineer', required: true },
                    { id: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Engineering', required: true },
                    { id: 'joiningDate', label: 'Joining Date', type: 'date', required: true },
                    { id: 'relievingDate', label: 'Relieving Date', type: 'date', required: true },
                    { id: 'workDescription', label: 'Work Description', type: 'textarea', placeholder: 'Brief description of work and achievements', required: true }
                ],
                onboarding_letter: [
                    ...commonFields,
                    { id: 'companyEmail', label: 'Company Email', type: 'email', placeholder: 'e.g. hr@company.com', required: true },
                    { id: 'companyPhone', label: 'Company Phone', type: 'tel', placeholder: 'e.g. +91-80-1234-5678', required: true },
                    { id: 'employeeName', label: 'Employee Full Name', type: 'text', placeholder: 'e.g. Neha Patel', required: true },
                    { id: 'position', label: 'Designation/Position', type: 'text', placeholder: 'e.g. Quality Assurance Manager', required: true },
                    { id: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Quality Control & Regulatory Affairs', required: true },
                    { id: 'startDate', label: 'Joining Date', type: 'date', required: true },
                    { id: 'reportingTime', label: 'Reporting Time', type: 'time', placeholder: 'e.g. 09:30', required: true },
                    { id: 'reportingLocation', label: 'Reporting Location', type: 'text', placeholder: 'e.g. 7th Floor Reception, Main Building', required: true },
                    { id: 'reportingTo', label: 'Reporting Manager Name', type: 'text', placeholder: 'e.g. Dr. Amit Desai', required: true },
                    { id: 'managerEmail', label: 'Manager Email', type: 'email', placeholder: 'e.g. amit.desai@company.com', required: true },
                    { id: 'managerPhone', label: 'Manager Phone', type: 'tel', placeholder: 'e.g. +91-80-1234-5679', required: true },
                    { id: 'hrContactPerson', label: 'HR Contact Person Name', type: 'text', placeholder: 'e.g. Priya Sharma', required: true },
                    { id: 'hrEmail', label: 'HR Email', type: 'email', placeholder: 'e.g. priya.sharma@company.com', required: true },
                    { id: 'hrPhone', label: 'HR Phone', type: 'tel', placeholder: 'e.g. +91-80-1234-5680', required: true },
                    { id: 'dresscode', label: 'Dress Code', type: 'select', options: ['Business Formal', 'Business Casual', 'Smart Casual', 'Casual'], required: true },
                    { id: 'workingHours', label: 'Working Hours', type: 'text', placeholder: 'e.g. Monday to Saturday, 9:30 AM - 6:30 PM', required: true }
                ],
                warning_letter: [
                    ...commonFields,
                    { id: 'employeeName', label: 'Employee Name', type: 'text', placeholder: 'e.g. Rajesh Kumar', required: true },
                    { id: 'employeeId', label: 'Employee ID', type: 'text', placeholder: 'e.g. EMP-2024-123', required: true },
                    { id: 'position', label: 'Position', type: 'text', placeholder: 'e.g. Senior Developer', required: true },
                    { id: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Engineering', required: true },
                    { id: 'warningType', label: 'Warning Type', type: 'select', options: ['First Warning', 'Second Warning', 'Final Warning'], required: true },
                    { id: 'warningSubject', label: 'Warning Subject', type: 'text', placeholder: 'e.g. Attendance Issue / Performance Issue', required: true },
                    { id: 'incidentDate', label: 'Incident Date', type: 'date', required: true },
                    { id: 'issueDescription', label: 'Issue Description', type: 'textarea', placeholder: 'Detailed description of the issue or violation', required: true },
                    { id: 'expectedImprovement', label: 'Expected Improvement', type: 'textarea', placeholder: 'What needs to improve and by when', required: true },
                    { id: 'reviewPeriod', label: 'Review Period', type: 'text', placeholder: 'e.g. 30 days / 90 days', required: true }
                ],

                // Legal Documents
                nda: [
                    ...commonFields,
                    { id: 'partyName', label: 'Other Party Name', type: 'text', placeholder: 'e.g. ABC Corp or Individual Name', required: true },
                    { id: 'partyAddress', label: 'Other Party Address', type: 'textarea', placeholder: 'Complete address of the other party', required: true },
                    { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
                    { id: 'duration', label: 'Duration (Years)', type: 'number', placeholder: 'e.g. 2', required: true },
                    { id: 'purpose', label: 'Purpose/Project', type: 'textarea', placeholder: 'Brief description of the purpose or project', required: true },
                    { id: 'jurisdiction', label: 'Governing Jurisdiction (City)', type: 'text', placeholder: 'e.g. Mumbai, Bangalore, New Delhi', required: false }
                ],
                service_agreement: [
                    ...commonFields,
                    { id: 'companyCIN', label: 'Company CIN', type: 'text', placeholder: 'Enter Company Identification Number', required: true },
                    { id: 'consultantName', label: 'Consultant Name', type: 'text', placeholder: 'e.g. Rajesh Kumar', required: true },
                    { id: 'consultantAddress', label: 'Consultant Address', type: 'textarea', placeholder: 'Complete address of the consultant', required: true },
                    { id: 'fatherName', label: "Father's Name", type: 'text', placeholder: "Consultant's Father's Name", required: true },
                    { id: 'uidPan', label: 'UID / PAN', type: 'text', placeholder: 'Enter Aadhaar or PAN number', required: true },
                    { id: 'executionDate', label: 'Execution Date', type: 'date', required: true },
                    { id: 'serviceType', label: 'Service Type', type: 'text', placeholder: 'e.g. Software Development / Consulting', required: true },
                    { id: 'serviceDescription', label: 'Service Description', type: 'textarea', placeholder: 'Detailed description of services to be provided', required: true },
                    { id: 'contractValue', label: 'Contract Value (₹)', type: 'number', placeholder: 'e.g. 500000', required: true },
                    { id: 'startDate', label: 'Start Date', type: 'date', required: true },
                    { id: 'endDate', label: 'End Date', type: 'date', required: true },
                    { id: 'paymentTerms', label: 'Payment Terms', type: 'textarea', placeholder: 'e.g. 50% advance, 50% on completion', required: true }
                ],
                terms_of_service: [
                    ...commonFields,
                    { id: 'serviceName', label: 'Service/Product Name', type: 'text', placeholder: 'e.g. MyApp Platform', required: true },
                    { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
                    { id: 'serviceDescription', label: 'Service Description', type: 'textarea', placeholder: 'Brief description of the service or product', required: true },
                    { id: 'userObligations', label: 'User Obligations', type: 'textarea', placeholder: 'Key obligations and responsibilities of users', required: true },
                    { id: 'restrictions', label: 'Restrictions/Prohibited Activities', type: 'textarea', placeholder: 'Prohibited activities and restrictions', required: true },
                    { id: 'jurisdiction', label: 'Governing Jurisdiction (City)', type: 'text', placeholder: 'e.g. Mumbai, Bangalore, New Delhi', required: false }
                ],
                privacy_policy: [
                    ...commonFields,
                    { id: 'serviceName', label: 'Service/Product Name', type: 'text', placeholder: 'e.g. MyApp Platform', required: true },
                    { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
                    { id: 'dataCollected', label: 'Data Collected', type: 'textarea', placeholder: 'Types of data collected from users (e.g. name, email, IP address)', required: true },
                    { id: 'dataUsage', label: 'Data Usage', type: 'textarea', placeholder: 'How user data will be used (e.g. service improvement, analytics)', required: true },
                    { id: 'dataSecurity', label: 'Security Measures', type: 'textarea', placeholder: 'Security measures to protect user data (e.g. encryption, access controls)', required: true },
                    { id: 'dpoEmail', label: 'Data Protection Officer (DPO) Email', type: 'email', placeholder: 'e.g. privacy@company.com', required: true }
                ],
                mou: [
                    ...commonFields,
                    { id: 'partyName', label: 'Other Party / First Party Name', type: 'text', placeholder: 'e.g. Partner Company Name', required: true },
                    { id: 'partyAddress', label: 'Other Party Address', type: 'textarea', placeholder: 'Complete address of the other party', required: true },
                    { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
                    { id: 'purpose', label: 'Purpose/Objective of MOU', type: 'textarea', placeholder: 'Detailed purpose and scope of this understanding', required: true },
                    { id: 'background', label: 'Background / Context', type: 'textarea', placeholder: 'Why are the parties entering into this MOU? Describe business context.', required: false },
                    { id: 'collaborationAreas', label: 'Areas of Collaboration', type: 'textarea', placeholder: 'e.g. Joint R&D, Marketing activities, Technology sharing (one per line)', required: false },
                    { id: 'partyARoles', label: 'Party A (Other Party) Responsibilities', type: 'textarea', placeholder: 'Key responsibilities of the first/other party', required: false },
                    { id: 'partyBRoles', label: 'Party B (Your Company) Responsibilities', type: 'textarea', placeholder: 'Key responsibilities of your company', required: false },
                    { id: 'duration', label: 'Duration (Years)', type: 'number', placeholder: 'e.g. 3', required: true }
                ],

                // Sales Documents
                business_proposal: [
                    ...commonFields,
                    { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'e.g. XYZ Corporation', required: true },
                    { id: 'clientAddress', label: 'Client Address', type: 'textarea', placeholder: 'Complete client address', required: true },
                    { id: 'projectTitle', label: 'Project Title', type: 'text', placeholder: 'e.g. Digital Transformation Initiative', required: true },
                    { id: 'projectValue', label: 'Project Value (₹)', type: 'number', placeholder: 'e.g. 5000000', required: true },
                    { id: 'timeline', label: 'Project Timeline', type: 'text', placeholder: 'e.g. 6 months', required: true },
                    { id: 'projectDescription', label: 'Project Description', type: 'textarea', placeholder: 'Detailed project scope and deliverables', required: true }
                ],
                sales_contract: [
                    ...commonFields,
                    { id: 'sellerName', label: 'Seller Name', type: 'text', placeholder: 'e.g. Daniel Gallego', required: true },
                    { id: 'sellerHandle', label: 'Seller @Handle', type: 'text', placeholder: 'e.g. @reallygreatsite', required: false },
                    { id: 'buyerName', label: 'Buyer Name', type: 'text', placeholder: 'e.g. Korina Villanueva', required: true },
                    { id: 'buyerHandle', label: 'Buyer @Handle', type: 'text', placeholder: 'e.g. @reallygreatsite', required: false },
                    { id: 'buyerAddress', label: 'Buyer Address', type: 'textarea', placeholder: 'Complete buyer address', required: true },
                    { id: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g. Vintage Camera', required: true },
                    { id: 'condition', label: 'Product Condition', type: 'text', placeholder: 'e.g. Excellent', required: true },
                    { id: 'quantity', label: 'Quantity', type: 'text', placeholder: 'e.g. 1', required: true },
                    { id: 'price', label: 'Price (₹)', type: 'number', placeholder: 'e.g. 1200', required: true },
                    { id: 'paymentTerms', label: 'Payment Terms', type: 'textarea', placeholder: 'e.g. The Buyer agrees to pay...', required: true },
                    { id: 'deliveryTerms', label: 'Delivery Terms', type: 'textarea', placeholder: 'e.g. The Seller agrees to deliver...', required: true },
                    { id: 'warrantyTerms', label: 'Warranty Terms', type: 'textarea', placeholder: 'e.g. The Seller guarantees...', required: true }
                ],

                partnership_agreement: [
                    ...commonFields,
                    { id: 'partner1Name', label: 'Partner 1 Name', type: 'text', placeholder: 'e.g. Matt Zhang', required: true },
                    { id: 'partner1Address', label: 'Partner 1 Address', type: 'textarea', placeholder: '123 Anywhere ST., Any City 12345', required: true },
                    { id: 'partner1Title', label: 'Partner 1 Title', type: 'text', placeholder: 'e.g. Co-Founder', required: true },
                    { id: 'partner2Name', label: 'Partner 2 Name', type: 'text', placeholder: 'e.g. Anna Katrina Marchesi', required: true },
                    { id: 'partner2Address', label: 'Partner 2 Address', type: 'textarea', placeholder: '123 Anywhere ST., Any City 12345', required: true },
                    { id: 'partner2Title', label: 'Partner 2 Title', type: 'text', placeholder: 'e.g. Co-Founder', required: true },
                    { id: 'businessName', label: 'Partnership Business Name', type: 'text', placeholder: 'e.g. Fauget Studio', required: true },
                    { id: 'businessPurpose', label: 'Business Purpose', type: 'textarea', placeholder: 'e.g. Provide graphic design services for small businesses.', required: true },
                    { id: 'partner1Contribution', label: 'Partner 1 Contribution', type: 'textarea', placeholder: 'e.g. $30,000 in capital', required: true },
                    { id: 'partner2Contribution', label: 'Partner 2 Contribution', type: 'textarea', placeholder: 'e.g. Design expertise, portfolio, and client contacts.', required: true },
                    { id: 'partner1ProfitShare', label: 'Partner 1 Profit/Loss %', type: 'text', placeholder: 'e.g. 60%', required: true },
                    { id: 'partner2ProfitShare', label: 'Partner 2 Profit/Loss %', type: 'text', placeholder: 'e.g. 40%', required: true },
                    { id: 'partner1Responsibilities', label: 'Partner 1 Responsibilities', type: 'textarea', placeholder: 'e.g. Finance, client acquisition, and managing the studio.', required: true },
                    { id: 'partner2Responsibilities', label: 'Partner 2 Responsibilities', type: 'textarea', placeholder: 'e.g. Design work, client communication, and project delivery.', required: true },
                    { id: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'e.g. Borcelle Bank', required: true },
                    { id: 'commencementDate', label: 'Commencement Date', type: 'date', required: true },
                    { id: 'disputeResolution', label: 'Dispute Resolution', type: 'textarea', placeholder: 'e.g. In the event of a dispute, the partners agree to...', required: true },
                    { id: 'governingLaw', label: 'Governing Law', type: 'text', placeholder: 'e.g. This Agreement shall be governed by the laws of the State of [State].', required: true },
                    { id: 'entireAgreement', label: 'Entire Agreement', type: 'textarea', placeholder: 'e.g. This Agreement constitutes the full agreement...', required: true }
                ],
                quotation: [
                    ...commonFields,
                    { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'e.g. XYZ Corporation', required: true },
                    { id: 'clientAddress', label: 'Client Address', type: 'textarea', placeholder: 'Complete client address', required: true },
                    { id: 'quotationNumber', label: 'Quotation Number', type: 'text', placeholder: 'e.g. QUO-2026-001', required: true },
                    { id: 'validUntil', label: 'Valid Until', type: 'date', required: true },
                    { id: 'totalAmount', label: 'Total Amount (₹)', type: 'number', placeholder: 'e.g. 250000', required: true },
                    { id: 'serviceDescription', label: 'Service Description', type: 'textarea', placeholder: 'Detailed description of services/products', required: true }
                ],

                // Finance Documents
                invoice: [
                    ...commonFields,
                    { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'e.g. Richard Sanchez', required: true },
                    { id: 'clientCompany', label: 'Client Company', type: 'text', placeholder: 'e.g. Thynk Unlimited', required: true },
                    { id: 'clientAddress', label: 'Client Address', type: 'textarea', placeholder: 'e.g. 123 Anywhere St., Any City', required: true },
                    { id: 'invoiceNumber', label: 'Invoice Number', type: 'text', placeholder: 'e.g. 01234', required: true },
                    { id: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
                    { id: 'dueDate', label: 'Due Date', type: 'date', required: true },
                    { id: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'e.g. Borcele Bank', required: true },
                    { id: 'accountName', label: 'Account Name', type: 'text', placeholder: 'e.g. Adeline Palmerston', required: true },
                    { id: 'accountNumber', label: 'Account No.', type: 'text', placeholder: 'e.g. 0123 4567 8901', required: true },
                    { id: 'invoiceItems', label: 'Invoice Items', type: 'textarea', placeholder: 'Describe items: e.g. Brand consultation 100 1\nLogo design 100 1', required: true },
                    { id: 'taxPercentage', label: 'Tax Percentage (%)', type: 'number', placeholder: 'e.g. 10', required: true },
                    { id: 'signatureName', label: 'Signature Name', type: 'text', placeholder: 'e.g. Adeline Palmerston', required: true }
                ],
                purchase_order: [
                    ...commonFields,
                    { id: 'vendorName', label: 'Vendor Name', type: 'text', placeholder: 'e.g. ABC Suppliers Pvt. Ltd.', required: true },
                    { id: 'vendorAddress', label: 'Vendor Address', type: 'textarea', placeholder: 'Complete vendor address', required: true },
                    { id: 'vendorContact', label: 'Vendor Contact / Dept', type: 'text', placeholder: 'e.g. Sales Department', required: false },
                    { id: 'shipToName', label: 'Ship To (Name)', type: 'text', placeholder: 'e.g. Receiver Name', required: true },
                    { id: 'shipToCompanyName', label: 'Ship To (Company)', type: 'text', placeholder: 'e.g. Recipient Company', required: false },
                    { id: 'shipToAddress', label: 'Ship To Address', type: 'textarea', placeholder: 'Complete delivery address', required: true },
                    { id: 'shipToPhone', label: 'Ship To Phone', type: 'text', placeholder: 'e.g. +91-98765-43210', required: false },
                    { id: 'poNumber', label: 'Purchase Order #', type: 'text', placeholder: 'e.g. PO-2026-001', required: true },
                    { id: 'poDate', label: 'PO Date', type: 'date', required: true },
                    { id: 'requisitioner', label: 'Requisitioner', type: 'text', placeholder: 'e.g. Name of requester', required: false },
                    { id: 'shipVia', label: 'Ship Via', type: 'text', placeholder: 'e.g. FedEx / Surface', required: false },
                    { id: 'fob', label: 'F.O.B.', type: 'text', placeholder: 'e.g. Shipping point', required: false },
                    { id: 'shippingTerms', label: 'Shipping Terms', type: 'text', placeholder: 'e.g. Net 30', required: false },
                    { id: 'poItems', label: 'Order Items (One per line)', type: 'textarea', placeholder: 'Format: ITEM# | DESCRIPTION | QTY | UNIT PRICE\ne.g. 101 | Laptop | 2 | 50000', required: true },
                    { id: 'taxRate', label: 'Tax Rate (%)', type: 'number', placeholder: 'e.g. 18', required: false },
                    { id: 'shippingCost', label: 'Shipping Cost (₹)', type: 'number', placeholder: 'e.g. 500', required: false },
                    { id: 'otherCharges', label: 'Other Charges (₹)', type: 'number', placeholder: 'e.g. 100', required: false },
                    { id: 'comments', label: 'Comments or Special Instructions', type: 'textarea', placeholder: 'Any additional instructions for the vendor', required: false }
                ],
                receipt: [
                    ...commonFields,
                    { id: 'receiptNumber', label: 'Receipt Number', type: 'text', placeholder: 'e.g. REC-10001', required: true },
                    { id: 'receiptDate', label: 'Receipt Date', type: 'date', required: true },
                    { id: 'customerName', label: 'Customer Name (Received From)', type: 'text', placeholder: 'e.g. Priya Sharma', required: true },
                    { id: 'customerAddress', label: 'Customer Address', type: 'textarea', placeholder: 'Customer street address, city, state', required: true },
                    { id: 'receiptItems', label: 'Receipt Items (Format: Qty | Description | Unit Price)', type: 'textarea', placeholder: '1 | Consulting Services | 5000\n1 | Software License | 2000', required: true },
                    { id: 'taxRate', label: 'Tax Rate (%)', type: 'number', placeholder: 'e.g. 5', required: false },
                    { id: 'bankInfo', label: 'Payment Instruction (e.g. Bank/Check)', type: 'text', placeholder: 'e.g. ICICI Bank - Acct: 12345678', required: false },
                    { id: 'terms', label: 'Terms and Conditions', type: 'textarea', placeholder: 'Payment is due within 14 days of project completion...', required: false },
                    { id: 'footerPhone', label: 'Footer Phone', type: 'tel', placeholder: 'e.g. +1 234 56 789', required: false },
                    { id: 'footerEmail', label: 'Footer Email', type: 'email', placeholder: 'e.g. company@email.com', required: false },
                    { id: 'footerWebsite', label: 'Footer Website', type: 'text', placeholder: 'e.g. company.com', required: false }
                ],
                credit_note: [
                    ...commonFields,
                    { id: 'clientName', label: 'Customer Name', type: 'text', placeholder: 'e.g. John Smith', required: true },
                    { id: 'clientAddress', label: 'Customer Address', type: 'textarea', placeholder: 'Complete customer address', required: true },
                    { id: 'shipToName', label: 'Ship To (Name)', type: 'text', placeholder: 'e.g. John Smith', required: false },
                    { id: 'shipToAddress', label: 'Ship To Address', type: 'textarea', placeholder: 'Complete shipping address', required: false },
                    { id: 'creditNoteNumber', label: 'Credit Note #', type: 'text', placeholder: 'e.g. US-001', required: true },
                    { id: 'creditNoteDate', label: 'Credit Note Date', type: 'date', required: false },
                    { id: 'poNumber', label: 'P.O. #', type: 'text', placeholder: 'e.g. 2312/2019', required: false },
                    { id: 'dueDate', label: 'Due Date', type: 'date', required: false },
                    { id: 'invoiceNumber', label: 'Original Invoice #', type: 'text', placeholder: 'e.g. INV-2025-001', required: true },
                    { id: 'invoiceDate', label: 'Original Invoice Date', type: 'date', required: false },
                    { id: 'creditNoteItems', label: 'Credit Note Items (Format: Qty | Description | Unit Price)', type: 'textarea', placeholder: '1 | Front and rear brake cables | 100\n2 | New set of pedal arms | 15\n3 | Labor 3hrs | 5', required: true },
                    { id: 'taxRate', label: 'Sales Tax (%)', type: 'number', placeholder: 'e.g. 6.25', required: false },
                    { id: 'reason', label: 'Reason for Credit', type: 'textarea', placeholder: 'e.g. Product return / Overcharge / Discount adjustment', required: true },
                    { id: 'signatureName', label: 'Authorized Signature Name', type: 'text', placeholder: 'e.g. John Smith', required: false },
                    { id: 'terms', label: 'Terms & Conditions', type: 'textarea', placeholder: 'e.g. Payment is due within 15 days...', required: false }
                ],
                gst_invoice: [
                    ...commonFields,
                    { id: 'gstNumber', label: 'Company GSTIN', type: 'text', placeholder: 'e.g. 29ABCDE1234F1Z5', required: true },
                    { id: 'invoiceNumber', label: 'Invoice Number', type: 'text', placeholder: 'e.g. GST-2026-001', required: true },
                    { id: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
                    { id: 'dueDate', label: 'Due Date', type: 'date', required: false },
                    { id: 'customerId', label: 'Customer ID', type: 'text', placeholder: 'e.g. CUST-123', required: false },
                    { id: 'clientName', label: 'Bill To (Name)', type: 'text', placeholder: 'e.g. John Doe', required: true },
                    { id: 'clientGST', label: 'Billing GSTIN', type: 'text', placeholder: 'e.g. 27FGHIJ5678K2L9', required: false },
                    { id: 'billToAddress', label: 'Billing Address', type: 'textarea', placeholder: 'Complete billing address', required: true },
                    { id: 'shipToName', label: 'Ship To (Name)', type: 'text', placeholder: 'e.g. John Doe', required: false },
                    { id: 'shipToAddress', label: 'Shipping Address', type: 'textarea', placeholder: 'Leave blank if same as billing', required: false },
                    { id: 'invoiceItems', label: 'Invoice Items (Format: Qty | Product | Description | Unit Price)', type: 'textarea', placeholder: '3 | Cloth | abc | 110\n5 | Furniture | White wool | 550', required: true },
                    { id: 'discount', label: 'Discount (₹)', type: 'number', placeholder: 'e.g. 140', required: false },
                    { id: 'taxRate', label: 'Tax Rate (%)', type: 'number', placeholder: 'e.g. 18', required: false },
                    { id: 'otherCharges', label: 'Other Charges (₹)', type: 'number', placeholder: 'e.g. 0', required: false },
                    { id: 'terms', label: 'Terms and Conditions', type: 'textarea', placeholder: '1. Total payment due in 30 days...', required: false }
                ],

                // Compliance Documents
                gst_filing_summary: [
                    ...commonFields,
                    { id: 'gstNumber', label: 'GST Number', type: 'text', placeholder: 'e.g. 29ABCDE1234F1Z5', required: true },
                    { id: 'filingPeriod', label: 'Filing Period', type: 'text', placeholder: 'e.g. January 2026 / Q4 FY2025-26', required: true },
                    { id: 'returnType', label: 'Return Type', type: 'select', options: ['GSTR-1', 'GSTR-3B', 'GSTR-4', 'GSTR-9'], required: true },
                    { id: 'totalSales', label: 'Total Sales (₹)', type: 'number', placeholder: 'e.g. 5000000', required: true },
                    { id: 'totalPurchases', label: 'Total Purchases (₹)', type: 'number', placeholder: 'e.g. 3000000', required: true },
                    { id: 'outputTax', label: 'Output GST (₹)', type: 'number', placeholder: 'e.g. 900000', required: true },
                    { id: 'inputTax', label: 'Input GST (₹)', type: 'number', placeholder: 'e.g. 540000', required: true }
                ],
                'gst-filing-summary-001': [
                    ...commonFields,
                    { id: 'gstNumber', label: 'GST Number', type: 'text', placeholder: 'e.g. 29ABCDE1234F1Z5', required: true },
                    { id: 'filingPeriod', label: 'Filing Period', type: 'text', placeholder: 'e.g. January 2026 / Q4 FY2025-26', required: true },
                    { id: 'returnType', label: 'Return Type', type: 'select', options: ['GSTR-1', 'GSTR-3B', 'GSTR-4', 'GSTR-9'], required: true },
                    { id: 'totalSales', label: 'Total Sales (₹)', type: 'number', placeholder: 'e.g. 5000000', required: true },
                    { id: 'totalPurchases', label: 'Total Purchases (₹)', type: 'number', placeholder: 'e.g. 3000000', required: true },
                    { id: 'outputTax', label: 'Output GST (₹)', type: 'number', placeholder: 'e.g. 900000', required: true },
                    { id: 'inputTax', label: 'Input GST (₹)', type: 'number', placeholder: 'e.g. 540000', required: true }
                ],
                audit_report: [
                    ...commonFields,
                    { id: 'auditPeriod', label: 'Audit Period', type: 'text', placeholder: 'e.g. FY 2025-26', required: true },
                    { id: 'auditType', label: 'Audit Type', type: 'select', options: ['Internal Audit', 'External Audit', 'Tax Audit', 'Compliance Audit'], required: true },
                    { id: 'auditorName', label: 'Auditor Name', type: 'text', placeholder: 'e.g. CA Rajesh Kumar', required: true },
                    { id: 'auditDate', label: 'Audit Date', type: 'date', required: true },
                    { id: 'findings', label: 'Key Findings', type: 'textarea', placeholder: 'Summary of audit findings and observations', required: true }
                ],
                policy_document: [
                    ...commonFields,
                    { id: 'policyTitle', label: 'Policy Title', type: 'text', placeholder: 'e.g. Work From Home Policy', required: true },
                    { id: 'policyNumber', label: 'Policy Number', type: 'text', placeholder: 'e.g. POL-HR-2026-001', required: true },
                    { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
                    { id: 'department', label: 'Applicable Department', type: 'text', placeholder: 'e.g. All Departments / HR / Finance', required: true },
                    { id: 'policyObjective', label: 'Policy Objective', type: 'textarea', placeholder: 'Main objectives and purpose of this policy', required: true },
                    { id: 'policyScope', label: 'Policy Scope', type: 'textarea', placeholder: 'Who this policy applies to and its coverage', required: true },
                    { id: 'policyGuidelines', label: 'Key Guidelines', type: 'textarea', placeholder: 'Main guidelines and procedures', required: true }
                ],
                regulatory_filing: [
                    ...commonFields,
                    { id: 'filingType', label: 'Filing Type', type: 'text', placeholder: 'e.g. ROC Filing / Tax Filing / Compliance Report', required: true },
                    { id: 'filingNumber', label: 'Filing Reference Number', type: 'text', placeholder: 'e.g. ROC-2026-12345', required: true },
                    { id: 'regulatoryBody', label: 'Regulatory Body', type: 'text', placeholder: 'e.g. Ministry of Corporate Affairs / Income Tax Dept', required: true },
                    { id: 'filingDate', label: 'Filing Date', type: 'date', required: true },
                    { id: 'filingPeriod', label: 'Filing Period', type: 'text', placeholder: 'e.g. FY 2025-26 / January 2026', required: true },
                    { id: 'filingDetails', label: 'Filing Details', type: 'textarea', placeholder: 'Summary of filing details and compliance information', required: true }
                ]
            };

            // Normalize selectedDocType (e.g. 'offer-letter-001' -> 'offer_letter')
            const normalizedType = selectedDocType 
                ? selectedDocType.split('-').slice(0, -1).join('_') || selectedDocType.replace(/-/g, '_')
                : '';
            
            return fieldsByType[normalizedType] || fieldsByType[selectedDocType] || commonFields;
        };

        const handleInputChange = (fieldId, value) => {
            setFormData(prev => ({
                ...prev,
                [fieldId]: value
            }));

            // Clear validation errors when user starts filling the form
            if (validationErrors.length > 0) {
                setValidationErrors([]);
            }
        };

        const generatePreviewContent = () => {
            const currentDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Generate preview based on document type and form data
            const previews = {
                offer_letter: {
                    title: 'Employment Offer Letter',
                    content: `
Dear ${formData.candidateName || '[Candidate Name]'},

We are pleased to offer you the position of ${formData.position || '[Position]'} at ${formData.companyName || '[Company Name]'} with an annual compensation of ₹${formData.salary ? Number(formData.salary).toLocaleString() : '[Salary]'}.

Your expected date of joining is ${formData.startDate || '[Start Date]'} with a probation period of 3 months.

Position Details:
• Position: ${formData.position || '[Position]'}
• Department: ${formData.department || '[Department]'}
• Reporting To: ${formData.reportingTo || '[Reporting Manager]'}
• Work Location: ${formData.workLocation || '[Work Location]'}

Terms & Conditions:
• This offer is contingent upon successful background verification
• Employee must comply with company policies and confidentiality agreements
• This offer is valid for 7 days from the date of issue

We are excited about the possibility of you joining our team and look forward to your positive response.

Best regards,
HR Department
${formData.companyName || '[Company Name]'}
                    `
                },
                appointment_letter: {
                    title: 'Letter of Appointment',
                    content: `
LETTER OF APPOINTMENT

Date: ${currentDate}
Ref: APT-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}

${formData.employeeName || '[Employee Name]'}
${formData.employeeAddress || '[Employee Address]'}

Subject: Appointment as ${formData.position || '[Position]'}

Dear ${formData.employeeName || '[Employee Name]'},

We are pleased to inform you that you have been appointed as ${formData.position || '[Position]'} in the ${formData.department || '[Department]'} department of ${formData.companyName || '[Company Name]'}, effective from ${formData.appointmentDate || '[Appointment Date]'}.

Employment Details:
• Position: ${formData.position || '[Position]'}
• Department: ${formData.department || '[Department]'}
• Reporting To: ${formData.reportingTo || '[Reporting Manager]'}
• Annual Salary: ₹${formData.salary ? Number(formData.salary).toLocaleString() : '[Salary]'}

Terms and Conditions:
• You will be governed by the rules and regulations of the company
• Confidentiality of company information must be maintained
• Notice period of ${formData.noticePeriod || '30 days'} is required

Please confirm your acceptance by signing and returning a copy of this letter.

Congratulations and welcome to ${formData.companyName || '[Company Name]'}!

For ${formData.companyName || '[Company Name]'}
HR Department
                    `
                },
                experience_certificate: {
                    title: 'Experience Certificate',
                    content: `
EXPERIENCE CERTIFICATE

Certificate No: EXP-${formData.employeeId || 'EMP001'}-2024
Date: ${currentDate}

This is to certify that ${formData.employeeName || '[Employee Name]'} has been employed with ${formData.companyName || '[Company Name]'} in the following capacity:

Employee Details:
• Name: ${formData.employeeName || '[Employee Name]'}
• Position: ${formData.position || '[Position]'}
• Department: ${formData.department || '[Department]'}
• Employee ID: ${formData.employeeId || '[Employee ID]'}
• Employment Period: ${formData.startDate || '[Start Date]'} to ${formData.endDate || '[End Date]'}

During the tenure, ${formData.employeeName || 'the employee'} demonstrated exceptional professionalism, dedication, and competence in their role. They consistently met performance targets and maintained high standards of work quality.

Key Achievements:
• Consistently exceeded performance objectives
• Demonstrated strong leadership and collaborative skills
• Contributed significantly to department goals
• Maintained excellent professional conduct

We found ${formData.employeeName || 'the employee'} to be honest, hardworking, and reliable. They maintained excellent relationships with colleagues and clients.

Reason for Leaving: ${formData.reasonForLeaving || '[Reason for separation]'}

We recommend ${formData.employeeName || 'the employee'} for future employment opportunities and wish them success in their career endeavors.

For verification, please contact: hr@${(formData.companyName || 'company').toLowerCase().replace(/\s+/g, '')}.com

${formData.companyName || '[Company Name]'}
HR Manager
                    `
                },
                nda: {
                    title: 'Non-Disclosure Agreement',
                    content: `
NON-DISCLOSURE AGREEMENT

Date: ${currentDate}
Effective Date: ${formData.effectiveDate || currentDate}

DISCLOSING PARTY: ${formData.companyName || '[Company Name]'}
Address: ${formData.companyAddress || '[Company Address]'}

RECEIVING PARTY: ${formData.partyName || '[Other Party Name]'}
Address: ${formData.partyAddress || '[Other Party Address]'}

PURPOSE: ${formData.purpose || '[Purpose of disclosure - business discussions, potential collaboration, etc.]'}

CONFIDENTIAL INFORMATION:
This agreement covers all technical data, business strategies, financial information, customer lists, and any information marked as confidential.

OBLIGATIONS:
• Maintain strict confidentiality of all disclosed information
• Use information solely for the stated purpose
• Not disclose to third parties without written consent
• Take reasonable precautions to protect information

DURATION: ${formData.duration || '3'} years from the effective date

GOVERNING LAW: ${formData.jurisdiction || 'India'}

SIGNATURES:

${formData.companyName || '[Company Name]'}    ${formData.partyName || '[Other Party Name]'}
_________________________    _________________________
Authorized Signatory          Authorized Signatory
                    `
                },
                invoice: {
                    title: 'Invoice',
                    content: `
INVOICE # ${formData.invoiceNumber || '01234'}

ISSUED TO:
${formData.clientName || '[Client Name]'}
${formData.clientCompany || '[Client Company]'}
${formData.clientAddress || '[Client Address]'}

PAY TO:
${formData.bankName || '[Bank Name]'}
Account Name: ${formData.accountName || '[Account Name]'}
Account No.: ${formData.accountNumber || '[Account Number]'}
IFSC Code: ${formData.ifscCode || '[IFSC Code]'}
${formData.upiId ? `UPI ID: ${formData.upiId}` : ''}

DETAILS:
Date: ${formData.invoiceDate || currentDate}
Due Date: ${formData.dueDate || '[Due Date]'}

ITEMS:
${formData.invoiceItems || '[Line Items Description]'}

Tax: ${formData.taxPercentage || '0'}%

Thank you for your business!

Best regards,
${formData.signatureName || '[Signature Name]'}
                    `
                },
                business_proposal: {
                    title: 'Business Proposal',
                    content: `
BUSINESS PROPOSAL

Prepared For: ${formData.clientName || '[Client Name]'}
${formData.clientAddress || ''}

Prepared By: ${formData.companyName || '[Company Name]'}
${formData.companyAddress || ''}
Date: ${currentDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT: ${formData.projectTitle || '[Project Title]'}

EXECUTIVE SUMMARY:
We are pleased to present this proposal for ${formData.projectTitle || '[Project Title]'}. Our team at ${formData.companyName || '[Company Name]'} is committed to delivering exceptional results within the proposed timeline and budget.

PROJECT DESCRIPTION:
${formData.projectDescription || '[Detailed project scope, deliverables, and methodology will be outlined here]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INVESTMENT & TIMELINE:
• Total Project Value: ₹${formData.projectValue ? Number(formData.projectValue).toLocaleString() : '[Project Value]'}
• Timeline: ${formData.timeline || '[Timeline]'}

WHY CHOOSE US:
• Proven track record in similar projects
• Expert team with industry experience
• Commitment to quality and timely delivery
• Comprehensive support and maintenance

We look forward to the opportunity to work with ${formData.clientName || '[Client Name]'} and contribute to your success.

Best regards,
${formData.companyName || '[Company Name]'}
                    `
                },
                quotation: {
                    title: 'Quotation',
                    content: `
QUOTATION

${formData.companyName || '[Company Name]'}
${formData.companyAddress || '[Company Address]'}

TO: ${formData.clientName || '[Client Name]'}
${formData.clientAddress || '[Client Address]'}

Quote #: QUO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}
Date: ${currentDate}
Valid Until: ${formData.validityDate || '[Validity Date]'}

ITEMS/SERVICES:
${formData.itemDescription || '[Item/Service Description]'}
Quantity: ${formData.quantity || '1'}
Rate: ₹${formData.rate ? Number(formData.rate).toLocaleString() : '[Rate]'}

TOTAL AMOUNT: ₹${formData.totalAmount ? Number(formData.totalAmount).toLocaleString() : '[Total Amount]'}

BANKING DETAILS:
Bank: ${formData.bankName || '[Bank Name]'} | A/C: ${formData.accountNumber || '[Account Number]'}
IFSC: ${formData.ifscCode || '[IFSC Code]'} | UPI: ${formData.upiId || '[UPI ID]'}

TERMS & CONDITIONS:
• ${formData.paymentTerms || 'Payment terms as agreed'}
• This quotation is valid for ${formData.validity || '30 days'}
• All prices are inclusive of applicable taxes

Thank you for considering our services.

${formData.companyName || '[Company Name]'}
                    `
                },
                sales_contract: {
                    title: 'Sales Contract',
                    content: `
SALES CONTRACT

Contract Date: ${currentDate}
Contract #: SC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}

SELLER: 
${formData.sellerName || formData.companyName || '[Seller Name]'}
${formData.sellerHandle ? formData.sellerHandle + '\n' : ''}${formData.companyAddress || '[Seller Address]'}

BUYER: 
${formData.buyerName || formData.clientName || '[Buyer Name]'}
${formData.buyerHandle ? formData.buyerHandle + '\n' : ''}${formData.buyerAddress || formData.clientAddress || '[Buyer Address]'}

1. ITEM DETAILS:
• Product: ${formData.productName || formData.productDescription || '[Product Name]'}
• Condition: ${formData.condition || '[Condition]'}
• Quantity: ${formData.quantity || '1'}
• Price: ₹${formData.price || formData.totalAmount || '[Price]'}

2. PAYMENT TERMS:
${formData.paymentTerms || '[Payment Terms]'}

3. DELIVERY:
${formData.deliveryTerms || formData.deliveryDate || '[Delivery Details]'}

4. WARRANTY:
${formData.warrantyTerms || formData.warrantyPeriod || '[Warranty Details]'}

AUTHORISED SIGNATURES:

${formData.sellerName || formData.companyName || '[Seller Name]'}              ${formData.buyerName || formData.clientName || '[Buyer Name]'}
_________________________              _________________________
Authorized Signatory                   Authorized Signatory
                    `
                },
                mou: {
                    title: 'Memorandum of Understanding',
                    content: `
MEMORANDUM OF UNDERSTANDING

Between: ${formData.companyName || '[Company Name]'}
Address: ${formData.companyAddress || '[Company Address]'}

And: ${formData.partyName || '[Other Party Name]'}
Address: ${formData.partyAddress || '[Other Party Address]'}

Date: ${currentDate}
Effective Date: ${formData.effectiveDate || '[Effective Date]'}

PURPOSE:
${formData.purpose || '[Purpose of MOU - This section will detail the specific objectives, scope, and mutual understanding between the parties]'}

TERMS:
1. Duration: ${formData.duration || '[Duration]'} years from the effective date
2. Both parties agree to maintain confidentiality of shared information
3. This MOU serves as a framework for future collaboration
4. Either party may terminate with 30 days written notice

AUTHORIZED SIGNATURES:

For ${formData.companyName || '[Company Name]'}:
_________________________
Authorized Signatory

For ${formData.partyName || '[Other Party Name]'}:
_________________________
Authorized Signatory
                    `
                },
                partnership_agreement: {
                    title: 'Partnership Agreement',
                    content: `
PARTNERSHIP AGREEMENT

This Partnership Agreement ("Agreement") is made and entered into on ${formData.commencementDate || '[Date]'}, by and between:

Partner 1:
${formData.partner1Name || '[Partner 1 Name]'}
${formData.partner1Address || '[Partner 1 Address]'}

Partner 2:
${formData.partner2Name || '[Partner 2 Name]'}
${formData.partner2Address || '[Partner 2 Address]'}

The partners wish to form a business partnership on the terms set out below:

1. Name and Business Purpose
The partnership will conduct its business under the name "${formData.businessName || '[Business Name]'}". The purpose of the partnership is to ${formData.businessPurpose || '[Business Purpose]'}.

2. Contributions
• ${formData.partner1Name || 'Partner 1'} agrees to contribute: ${formData.partner1Contribution || '[Contribution]'}
• ${formData.partner2Name || 'Partner 2'} agrees to contribute: ${formData.partner2Contribution || '[Contribution]'}

3. Profit and Loss Sharing
The partners agree to share profits and losses as follows:
• ${formData.partner1Name || 'Partner 1'}: ${formData.partner1ProfitShare || '[%]'}
• ${formData.partner2Name || 'Partner 2'}: ${formData.partner2ProfitShare || '[%]'}

4. Management and Responsibilities
• ${formData.partner1Name || 'Partner 1'} will be responsible for: ${formData.partner1Responsibilities || '[Responsibilities]'}
• ${formData.partner2Name || 'Partner 2'} will be responsible for: ${formData.partner2Responsibilities || '[Responsibilities]'}
• Major decisions, such as taking on new partners, will require the consent of both parties.

5. Banking and Financial Records
The partnership's finances will be maintained in a joint bank account at ${formData.bankName || '[Bank Name]'}, and each partner will have access to all financial records upon request.

6. Term and Termination
This partnership will commence on ${formData.commencementDate || '[Date]'}, and will continue until terminated by mutual agreement or upon the incapacity of one of the partners.

7. Dispute Resolution
${formData.disputeResolution || 'In the event of a dispute, the partners agree to first attempt mediation through a professional mediator.'}

8. Governing Law
${formData.governingLaw || 'This Agreement shall be governed by the laws of the State of [State].'}

9. Entire Agreement
${formData.entireAgreement || 'This Agreement constitutes the full agreement between the partners, overriding any prior agreements.'}

IN WITNESS WHEREOF, the partners have executed this Partnership Agreement as of the date first above written.

_________________________    _________________________
${formData.partner1Name || '[Partner 1 Name]'}          ${formData.partner2Name || '[Partner 2 Name]'}
${formData.partner1Title || '[Title]'}                 ${formData.partner2Title || '[Title]'}
Date: ${currentDate}           Date: ${currentDate}
                    `
                },
                warning_letter: {
                    title: 'Employee Warning Letter',
                    content: `
EMPLOYEE WARNING LETTER

Date: ${currentDate}
Warning Type: ${formData.warningType || '[Verbal/Written/Final Warning]'}

TO: ${formData.employeeName || '[Employee Name]'}
Position: ${formData.position || '[Position]'}
Department: ${formData.department || '[Department]'}
Employee ID: ${formData.employeeId || '[Employee ID]'}

SUBJECT: ${formData.warningSubject || '[Warning Subject]'}

Dear ${formData.employeeName || '[Employee Name]'},

This letter serves as a formal warning regarding ${formData.issueDescription || '[specific performance/conduct issue that needs to be addressed]'}.

INCIDENT DETAILS:
Date of Incident: ${formData.incidentDate || '[Date of incident]'}
Description: ${formData.incidentDescription || '[Detailed description of the issue]'}

EXPECTATIONS GOING FORWARD:
• Immediate improvement in ${formData.improvementArea || '[specific area]'} is required
• Adherence to all company policies and procedures
• Professional conduct with colleagues and clients
• Meeting all performance standards and deadlines

CONSEQUENCES:
Failure to demonstrate immediate and sustained improvement may result in further disciplinary action, up to and including termination of employment.

REVIEW PERIOD:
Your performance will be monitored for the next ${formData.reviewPeriod || '90 days'}.

${formData.companyName || '[Company Name]'}
HR Department
                    `
                },
                onboarding_letter: {
                    title: 'Employee Onboarding Welcome Letter',
                    content: `
EMPLOYEE ONBOARDING WELCOME LETTER

Date: ${currentDate}

${formData.companyName}
${formData.companyAddress || ''}
Email: ${formData.companyEmail || ''}
Phone: ${formData.companyPhone || ''}

Dear ${formData.employeeName},

Welcome to ${formData.companyName}! We are delighted to have you join our ${formData.department} team as ${formData.position}.

FIRST DAY INSTRUCTIONS:
• Report Date: ${formData.startDate} at ${formData.reportingTime || '9:00 AM'}
• Report to: ${formData.reportingLocation}
• Reporting Manager: ${formData.reportingTo}
• Dress Code: ${formData.dresscode}
• Working Hours: ${formData.workingHours}

CONTACT INFORMATION:
Reporting Manager: ${formData.reportingTo}
• Email: ${formData.managerEmail}
• Phone: ${formData.managerPhone}

HR Contact: ${formData.hrContactPerson}
• Email: ${formData.hrEmail}
• Phone: ${formData.hrPhone}

REQUIRED DOCUMENTS:
• Government-issued photo ID
• Address proof
• Educational certificates
• Previous employment letters
• Passport-size photographs (2 copies)

We look forward to a successful journey together. Welcome aboard!

Best regards,
${formData.companyName}
HR Department
                    `
                },
                terms_of_service: {
                    title: 'Terms of Service',
                    content: `
TERMS OF SERVICE

These Terms of Service (the “Terms”) govern your access to and use of ${formData.serviceName || '[Service Name]'}, provided by ${formData.companyName || '[Company Name]'} (“Company”, “we”, “us”, or “our”).

Effective Date: ${formData.effectiveDate || '[Effective Date]'}

1. ACCEPTANCE OF TERMS:
By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy.

2. SERVICE DESCRIPTION:
${formData.serviceDescription || '[Describe your service or product here]'}

3. USER OBLIGATIONS:
As a user of our service, you agree to:
${formData.userObligations || '[Key user obligations and responsibilities]'}

4. PROHIBITED ACTIVITIES:
You shall not:
${formData.restrictions || '[Prohibited activities and restrictions]'}

5. INTELLECTUAL PROPERTY:
All content, features, and functionality are and will remain the exclusive property of ${formData.companyName || '[Company Name]'} and its licensors.

6. LIMITATION OF LIABILITY:
In no event shall ${formData.companyName || '[Company Name]'} be liable for any indirect, incidental, special, consequential or punitive damages.

7. GOVERNING LAW:
These Terms shall be governed and construed in accordance with the laws of India.

8. CONTACT US:
If you have any questions about these Terms, please contact us.
                    `
                },
                privacy_policy: {
                    title: 'Privacy Policy',
                    content: `
PRIVACY POLICY

This Privacy Policy describes how ${formData.companyName || '[Company Name]'} (“Company”, “we”, “us”, or “our”) collects, uses, and shares your personal information when you use ${formData.serviceName || '[Service Name]'}.

Effective Date: ${formData.effectiveDate || '[Effective Date]'}

1. DATA WE COLLECT:
${formData.dataCollected || '[Describe types of personal data collected]'}

2. HOW WE USE YOUR DATA:
We use your data for the following purposes:
${formData.dataUsage || '[Describe how data is used to provide and improve services]'}

3. DATA SECURITY:
We implement professional security measures to protect your data, including:
${formData.dataSecurity || '[Describe key security measures]'}

4. YOUR DATA RIGHTS:
In accordance with the Digital Personal Data Protection Act 2023, you have the right to access, update, and request deletion of your data.

5. THIRD-PARTY SHARING:
We do not sell your personal data. We only share data with trusted partners necessary for service delivery.

6. CONTACT US:
If you have any questions about this Privacy Policy or our data practices, please contact us at: ${formData.contactEmail || '[Privacy Contact Email]'}
                    `
                },
                service_agreement: {
                    title: 'Service Agreement',
                    content: `
SERVICE AGREEMENT

This SERVICE AGREEMENT (the “Agreement”) is made and executed on this ${formData.executionDate ? new Date(formData.executionDate).getDate() : '[Day]'} day of ${formData.executionDate ? new Date(formData.executionDate).toLocaleString('default', { month: 'long' }) : '[Month]'} ${formData.executionDate ? new Date(formData.executionDate).getFullYear() : '[Year]'} by and between:

${formData.companyName || '[Company Name]'}, a company incorporated under the Companies Act, 2013, having CIN: ${formData.companyCIN || '[Company CIN]'}, and having its registered office at ${formData.companyAddress || '[Company Address]'}, represented by its Authorized Signatory, (hereinafter referred to as the “COMPANY”).

AND

${formData.consultantName || '[Consultant Name]'} S/o ${formData.fatherName || "[Father's Name]"}, R/o ${formData.consultantAddress || '[Consultant Address]'} (hereinafter referred to as the “CONSULTANT”). UID/PAN No: ${formData.uidPan || '[UID/PAN]'}.

1. ENGAGEMENT AND SCOPE OF SERVICES:
The COMPANY hereby engages the CONSULTANT to provide ${formData.serviceType || '[Service Type]'} services as described below:
${formData.serviceDescription || '[Detailed Service Description]'}

2. TENURE:
This Agreement shall be effective from ${formData.startDate || '[Start Date]'} and shall remain valid until ${formData.endDate || '[End Date]'}, unless terminated earlier.

3. PROFESSIONAL FEES AND PAYMENT TERMS:
In consideration for the services, the COMPANY shall pay a total contract value of ₹${formData.contractValue ? Number(formData.contractValue).toLocaleString() : '[Contract Value]'}.
Payment Terms: ${formData.paymentTerms || '[Payment Terms]'}

4. CONFIDENTIALITY:
The CONSULTANT shall maintain strict confidentiality regarding all COMPANY information and shall not disclose it to any third party.

5. TERMINATION:
Either party may terminate this agreement with 30 days written notice.

6. GOVERNING LAW:
This Agreement shall be governed by the laws of India.

SIGNATURES:

For ${formData.companyName || '[Company Name]'}         CONSULTANT
_________________________         _________________________
Authorized Signatory              ${formData.consultantName || '[Name]'}
                    `
                },
                purchase_order: {
                    title: 'Purchase Order',
                    content: (() => {
                        const items = (formData.poItems || '').split('\n')
                            .filter(line => line.trim())
                            .map(line => {
                                const parts = line.split('|').map(s => s.trim());
                                const itemNo = parts[0] || '';
                                const desc = parts[1] || '';
                                const qty = parseFloat(parts[2]) || 0;
                                const price = parseFloat(parts[3]) || 0;
                                return { itemNo, desc, qty, price, total: qty * price };
                            });
                        
                        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
                        const tax = subtotal * (parseFloat(formData.taxRate) / 100 || 0);
                        const shipping = parseFloat(formData.shippingCost) || 0;
                        const other = parseFloat(formData.otherCharges) || 0;
                        const grandTotal = subtotal + tax + shipping + other;

                        return (
                            <div style={{ width: '100%', fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'normal' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                    <div style={{ border: '2px solid #1E40AF', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', borderBottom: '1px solid #1E40AF' }}>
                                            <div style={{ backgroundColor: '#EFF6FF', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #1E40AF', color: '#1E40AF' }}>DATE</div>
                                            <div style={{ padding: '4px 12px', fontSize: '13px' }}>{formData.poDate || new Date().toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <div style={{ backgroundColor: '#EFF6FF', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #1E40AF', color: '#1E40AF' }}>PO #</div>
                                            <div style={{ padding: '4px 12px', fontSize: '13px', fontWeight: 'bold' }}>{formData.poNumber || '[Enter PO#]'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                                    <div style={{ padding: '15px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                                        <h4 style={{ color: '#1E40AF', margin: '0 0 10px 0', borderBottom: '2px solid #1E40AF', fontSize: '12px', paddingBottom: '4px' }}>VENDOR</h4>
                                        <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                            <p style={{ margin: '0', fontWeight: 'bold' }}>{formData.vendorName || '[Vendor Name]'}</p>
                                            <p style={{ margin: '0' }}>{formData.vendorAddress || '[Vendor Address]'}</p>
                                            {formData.vendorContact && <p style={{ margin: '5px 0 0 0', fontStyle: 'italic', fontSize: '11px' }}>Attn: {formData.vendorContact}</p>}
                                        </div>
                                    </div>
                                    <div style={{ padding: '15px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                                        <h4 style={{ color: '#1E40AF', margin: '0 0 10px 0', borderBottom: '2px solid #1E40AF', fontSize: '12px', paddingBottom: '4px' }}>SHIP TO</h4>
                                        <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                            <p style={{ margin: '0', fontWeight: 'bold' }}>{formData.shipToName || '[Receiver Name]'}</p>
                                            {formData.shipToCompanyName && <p style={{ margin: '0', fontWeight: '600' }}>{formData.shipToCompanyName}</p>}
                                            <p style={{ margin: '0' }}>{formData.shipToAddress || '[Ship To Address]'}</p>
                                            {formData.shipToPhone && <p style={{ margin: '5px 0 0 0', fontSize: '11px' }}>Ph: {formData.shipToPhone}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '4px', marginBottom: '25px', border: '1px solid #E2E8F0' }}>
                                    <div style={{ borderRight: '1px solid #CBD5E1', padding: '0 10px' }}>
                                        <label style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Requisitioner</label>
                                        <div style={{ fontSize: '12px' }}>{formData.requisitioner || '-'}</div>
                                    </div>
                                    <div style={{ borderRight: '1px solid #CBD5E1', padding: '0 10px' }}>
                                        <label style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Ship Via</label>
                                        <div style={{ fontSize: '12px' }}>{formData.shipVia || '-'}</div>
                                    </div>
                                    <div style={{ borderRight: '1px solid #CBD5E1', padding: '0 10px' }}>
                                        <label style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>F.O.B.</label>
                                        <div style={{ fontSize: '12px' }}>{formData.fob || '-'}</div>
                                    </div>
                                    <div style={{ padding: '0 10px' }}>
                                        <label style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Terms</label>
                                        <div style={{ fontSize: '12px' }}>{formData.shippingTerms || '-'}</div>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#1E40AF', color: 'white' }}>
                                            <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', fontWeight: 'bold' }}>ITEM #</th>
                                            <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', fontWeight: 'bold' }}>DESCRIPTION</th>
                                            <th style={{ padding: '10px', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>QTY</th>
                                            <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold' }}>UNIT PRICE</th>
                                            <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', fontWeight: 'bold' }}>TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.length > 0 ? items.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                                <td style={{ padding: '10px', fontSize: '12px' }}>{item.itemNo}</td>
                                                <td style={{ padding: '10px', fontSize: '12px' }}>{item.desc}</td>
                                                <td style={{ padding: '10px', textAlign: 'center', fontSize: '12px' }}>{item.qty}</td>
                                                <td style={{ padding: '10px', textAlign: 'right', fontSize: '12px' }}>₹{item.price.toLocaleString()}</td>
                                                <td style={{ padding: '10px', textAlign: 'right', fontSize: '12px', fontWeight: '600' }}>₹{item.total.toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '13px', fontStyle: 'italic' }}>Enter items in the form to see the populated table.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                                    <div style={{ padding: '15px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px dashed #CBD5E1' }}>
                                        <h5 style={{ margin: '0 0 8px 0', fontSize: '10px', color: '#64748B', fontWeight: 'bold' }}>SPECIAL INSTRUCTIONS</h5>
                                        <div style={{ fontSize: '12px', lineHeight: '1.5', color: '#475569' }}>{formData.comments || 'No special instructions.'}</div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#475569' }}>
                                            <span>Subtotal</span>
                                            <span>₹{subtotal.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#475569' }}>
                                            <span>Tax ({formData.taxRate || 0}%)</span>
                                            <span>₹{tax.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#475569' }}>
                                            <span>Shipping</span>
                                            <span>₹{shipping.toLocaleString()}</span>
                                        </div>
                                        {other > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#475569' }}>
                                                <span>Other</span>
                                                <span>₹{other.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 10px', marginTop: '10px', backgroundColor: '#1E40AF', borderRadius: '4px', color: 'white', fontWeight: 'bold', fontSize: '15px' }}>
                                            <span>TOTAL</span>
                                            <span>₹{grandTotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()
                },
                gst_filing_summary: {
                    title: 'GST Filing Summary',
                    content: (() => {
                        return (
                            <div style={{ width: '100%', fontFamily: 'Inter, sans-serif', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                <div style={{ borderBottom: '2px solid #F97316', paddingBottom: '15px', marginBottom: '20px', textAlign: 'center' }}>
                                    <h1 style={{ margin: 0, color: '#F97316', fontSize: '24px', fontWeight: 'bold' }}>GST Filing Summary</h1>
                                    <p style={{ margin: '5px 0 0 0', color: '#6B7280', fontSize: '14px' }}>Period: {formData.filingPeriod || '[Filing Period]'}</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                    <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 'bold' }}>Company Name</p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: '600' }}>{formData.companyName || '[Company Name]'}</p>
                                    </div>
                                    <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 'bold' }}>GSTIN</p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: '600' }}>{formData.gstNumber || '[GSTIN Number]'}</p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', borderLeft: '4px solid #F97316', paddingLeft: '10px', marginBottom: '15px' }}>Filing Overview</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #F3F4F6' }}>
                                            <span style={{ fontSize: '13px', color: '#6B7280' }}>Return Type:</span>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{formData.returnType || 'N/A'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #F3F4F6' }}>
                                            <span style={{ fontSize: '13px', color: '#6B7280' }}>Filing Period:</span>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{formData.filingPeriod || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', borderLeft: '4px solid #F97316', paddingLeft: '10px', marginBottom: '15px' }}>Financial Summary</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            <tr style={{ backgroundColor: '#F9FAFB' }}>
                                                <td style={{ padding: '12px', fontSize: '13px', color: '#374151' }}>Total Taxable Sales</td>
                                                <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }}>₹{Number(formData.totalSales || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: '12px', fontSize: '13px', color: '#374151' }}>Total Taxable Purchases</td>
                                                <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }}>₹{Number(formData.totalPurchases || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr style={{ backgroundColor: '#EFF6FF' }}>
                                                <td style={{ padding: '12px', fontSize: '13px', color: '#1E40AF', fontWeight: 'bold' }}>Output Tax Liability</td>
                                                <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', color: '#1E40AF', fontWeight: 'bold' }}>₹{Number(formData.outputTax || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr style={{ backgroundColor: '#F0FDF4' }}>
                                                <td style={{ padding: '12px', fontSize: '13px', color: '#166534', fontWeight: 'bold' }}>Input Tax Credit (ITC)</td>
                                                <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', color: '#166534', fontWeight: 'bold' }}>₹{Number(formData.inputTax || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr style={{ borderTop: '2px solid #F97316' }}>
                                                <td style={{ padding: '12px', fontSize: '15px', color: '#111827', fontWeight: '900' }}>Net GST Payable / Refund</td>
                                                <td style={{ padding: '12px', fontSize: '15px', textAlign: 'right', color: '#F97316', fontWeight: '900' }}>
                                                    ₹{Math.max(0, Number(formData.outputTax || 0) - Number(formData.inputTax || 0)).toLocaleString()}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ padding: '15px', backgroundColor: '#FFF7ED', borderRadius: '8px', border: '1px dashed #FFEDD5', marginTop: '10px' }}>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#9A3412', lineHeight: '1.5' }}>
                                        <strong>Note:</strong> This is a summary generated based on provided self-declared figures. Please ensure all data matches your accounting records before final filing on the GST portal.
                                    </p>
                                </div>
                            </div>
                        );
                    })()
                },
                'gst-filing-summary-001': {
                    title: 'GST Filing Summary',
                    content: (() => {
                        return (
                            <div style={{ width: '100%', fontFamily: 'Inter, sans-serif', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                <div style={{ borderBottom: '2px solid #F97316', paddingBottom: '15px', marginBottom: '20px', textAlign: 'center' }}>
                                    <h1 style={{ margin: 0, color: '#F97316', fontSize: '24px', fontWeight: 'bold' }}>GST Filing Summary</h1>
                                    <p style={{ margin: '5px 0 0 0', color: '#6B7280', fontSize: '14px' }}>Period: {formData.filingPeriod || '[Filing Period]'}</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                    <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 'bold' }}>Company Name</p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: '600' }}>{formData.companyName || '[Company Name]'}</p>
                                    </div>
                                    <div style={{ padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '6px' }}>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 'bold' }}>GSTIN</p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: '600' }}>{formData.gstNumber || '[GSTIN Number]'}</p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', borderLeft: '4px solid #F97316', paddingLeft: '10px', marginBottom: '15px' }}>Filing Overview</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #F3F4F6' }}>
                                            <span style={{ fontSize: '13px', color: '#6B7280' }}>Return Type:</span>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{formData.returnType || 'N/A'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #F3F4F6' }}>
                                            <span style={{ fontSize: '13px', color: '#6B7280' }}>Filing Period:</span>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{formData.filingPeriod || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', borderLeft: '4px solid #F97316', paddingLeft: '10px', marginBottom: '15px' }}>Financial Summary</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            <tr style={{ backgroundColor: '#F9FAFB' }}>
                                                <td style={{ padding: '12px', fontSize: '13px', color: '#374151' }}>Total Taxable Sales</td>
                                                <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }}>₹{Number(formData.totalSales || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: '12px', fontSize: '13px', color: '#374151' }}>Total Taxable Purchases</td>
                                                <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', fontWeight: 'bold' }}>₹{Number(formData.totalPurchases || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr style={{ backgroundColor: '#EFF6FF' }}>
                                                <td style={{ padding: '12px', fontSize: '13px', color: '#1E40AF', fontWeight: 'bold' }}>Output Tax Liability</td>
                                                <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', color: '#1E40AF', fontWeight: 'bold' }}>₹{Number(formData.outputTax || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr style={{ backgroundColor: '#F0FDF4' }}>
                                                <td style={{ padding: '12px', fontSize: '13px', color: '#166534', fontWeight: 'bold' }}>Input Tax Credit (ITC)</td>
                                                <td style={{ padding: '12px', fontSize: '13px', textAlign: 'right', color: '#166534', fontWeight: 'bold' }}>₹{Number(formData.inputTax || 0).toLocaleString()}</td>
                                            </tr>
                                            <tr style={{ borderTop: '2px solid #F97316' }}>
                                                <td style={{ padding: '12px', fontSize: '15px', color: '#111827', fontWeight: '900' }}>Net GST Payable / Refund</td>
                                                <td style={{ padding: '12px', fontSize: '15px', textAlign: 'right', color: '#F97316', fontWeight: '900' }}>
                                                    ₹{Math.max(0, Number(formData.outputTax || 0) - Number(formData.inputTax || 0)).toLocaleString()}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ padding: '15px', backgroundColor: '#FFF7ED', borderRadius: '8px', border: '1px dashed #FFEDD5', marginTop: '10px' }}>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#9A3412', lineHeight: '1.5' }}>
                                        <strong>Note:</strong> This is a summary generated based on provided self-declared figures. Please ensure all data matches your accounting records before final filing on the GST portal.
                                    </p>
                                </div>
                            </div>
                        );
                    })()
                },
                receipt: {
                    title: 'Payment Receipt',
                    content: (() => {
                        const items = (formData.receiptItems || '').split('\n')
                            .filter(line => line.trim())
                            .map(line => {
                                const parts = line.split('|').map(s => s.trim());
                                const qty = parseFloat(parts[0]) || 0;
                                const desc = parts[1] || '...';
                                const price = parseFloat(parts[2]) || 0;
                                return { qty, desc, price, total: qty * price };
                            });
                        
                        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
                        const tax = subtotal * (parseFloat(formData.taxRate) / 100 || 0);
                        const total = subtotal + tax;

                        return (
                            <div style={{ width: '100%', fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'normal', color: '#374151' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                                    <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                        <p style={{ margin: '0', fontWeight: 'bold', color: '#1E40AF', textTransform: 'uppercase', fontSize: '11px' }}>FROM</p>
                                        <p style={{ margin: '0', fontWeight: '800', fontSize: '15px' }}>{formData.companyName || 'YOUR COMPANY'}</p>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{formData.companyAddress || 'Your Address 123\nCA 12345'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ width: '200px', height: '60px', border: '1px solid #E5E7EB', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '12px', marginBottom: '15px', backgroundColor: '#F9FAFB' }}>
                                            {brandKit?.logo ? <img src={brandKit.logo} alt="Logo" style={{ maxHeight: '100%', maxWidth: '100%' }} /> : 'Logo Placeholder'}
                                        </div>
                                        <h1 style={{ color: '#1E40AF', fontSize: '32px', fontWeight: '900', margin: '0', letterSpacing: '0.05em' }}>RECEIPT</h1>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '35px' }}>
                                    <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                        <p style={{ margin: '0', fontWeight: 'bold', color: '#1E40AF', textTransform: 'uppercase', fontSize: '11px' }}>TO</p>
                                        <p style={{ margin: '0', fontWeight: '700' }}>{formData.customerName || 'Customer Name'}</p>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{formData.customerAddress || 'Customer Address 123\nCA 12345'}</div>
                                    </div>
                                    <div style={{ minWidth: '180px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1E40AF' }}>Receipt #:</span>
                                            <span style={{ fontSize: '13px' }}>{formData.receiptNumber || '0000001'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1E40AF' }}>Receipt Date:</span>
                                            <span style={{ fontSize: '13px' }}>{formData.receiptDate || new Date().toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px', fontSize: '12px' }}>
                                    <thead>
                                        <tr style={{ border: '1px solid #1E40AF' }}>
                                            <th style={{ backgroundColor: '#FFFFFF', color: '#1E40AF', padding: '8px', textAlign: 'left', borderRight: '1px solid #E2E8F0', width: '50px' }}>QTY</th>
                                            <th style={{ backgroundColor: '#FFFFFF', color: '#1E40AF', padding: '8px', textAlign: 'left', borderRight: '1px solid #E2E8F0' }}>Description</th>
                                            <th style={{ backgroundColor: '#FFFFFF', color: '#1E40AF', padding: '8px', textAlign: 'right', borderRight: '1px solid #E2E8F0', width: '100px' }}>Unit Price</th>
                                            <th style={{ backgroundColor: '#FFFFFF', color: '#1E40AF', padding: '8px', textAlign: 'right', width: '100px' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.length > 0 ? items.map((item, idx) => (
                                            <tr key={idx} style={{ border: '1px solid #E2E8F0', borderTop: 'none' }}>
                                                <td style={{ padding: '8px', borderRight: '1px solid #E2E8F0' }}>{item.qty}</td>
                                                <td style={{ padding: '8px', borderRight: '1px solid #E2E8F0' }}>{item.desc}</td>
                                                <td style={{ padding: '8px', textAlign: 'right', borderRight: '1px solid #E2E8F0' }}>{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td style={{ padding: '8px', textAlign: 'right' }}>{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        )) : (
                                            <tr style={{ border: '1px solid #E2E8F0', borderTop: 'none' }}>
                                                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontStyle: 'italic' }}>No items added yet.</td>
                                            </tr>
                                        )}
                                        {/* Fill remaining space to match screenshot look */}
                                        {[...Array(Math.max(0, 5 - items.length))].map((_, i) => (
                                            <tr key={`empty-${i}`} style={{ border: '1px solid #E2E8F0', borderTop: 'none', height: '30px' }}>
                                                <td style={{ borderRight: '1px solid #E2E8F0' }}></td>
                                                <td style={{ borderRight: '1px solid #E2E8F0' }}></td>
                                                <td style={{ borderRight: '1px solid #E2E8F0' }}></td>
                                                <td></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
                                    <div style={{ minWidth: '200px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                            <span style={{ fontSize: '13px' }}>Subtotal</span>
                                            <span style={{ fontSize: '13px' }}>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                            <span style={{ fontSize: '13px' }}>Sales Tax ({formData.taxRate || '5'}%)</span>
                                            <span style={{ fontSize: '13px' }}>{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', marginTop: '5px', backgroundColor: '#EFF6FF', borderTop: '2px solid #1E40AF', borderBottom: '2px solid #1E40AF' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '900', color: '#1E40AF' }}>Total</span>
                                            <span style={{ fontSize: '14px', fontWeight: '900', color: '#1E40AF' }}>{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '40px' }}>
                                    <h4 style={{ color: '#1E40AF', margin: '0 0 8px 0', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>TERMS AND CONDITIONS</h4>
                                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                                        <p style={{ margin: '0 0 5px 0' }}>{formData.terms || 'Payment is due within 14 days of project completion'}</p>
                                        <p style={{ margin: '0 0 5px 0' }}>All checks to be made out to ________________</p>
                                        <p style={{ margin: '0' }}>Thank you for your business!</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '15px', fontSize: '11px', color: '#64748B' }}>
                                    <span>Tel: {formData.footerPhone || '+1 234 56 789'}</span>
                                    <span>Email: {formData.footerEmail || brandKit?.email || 'company@email.com'}</span>
                                    <span>Web: {formData.footerWebsite || brandKit?.website || 'company.com'}</span>
                                </div>
                            </div>
                        )
                    })()
                },
                gst_invoice: {
                    title: 'GST Tax Invoice',
                    content: (() => {
                        const items = (formData.invoiceItems || '').split('\n')
                            .filter(line => line.trim())
                            .map(line => {
                                const parts = line.split('|').map(s => s.trim());
                                const qty = parseFloat(parts[0]) || 0;
                                const product = parts[1] || '';
                                const description = parts[2] || '';
                                const unitPrice = parseFloat(parts[3]) || 0;
                                return { qty, product, description, unitPrice, total: qty * unitPrice };
                            });
                        
                        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
                        const discount = parseFloat(formData.discount) || 0;
                        const taxableValue = subtotal - discount;
                        const taxRate = parseFloat(formData.taxRate) || 18;
                        const taxAmount = taxableValue * (taxRate / 100);
                        const other = parseFloat(formData.otherCharges) || 0;
                        const total = taxableValue + taxAmount + other;

                        const greenPrimary = '#10B981';

                        return (
                            <div style={{ width: '100%', fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'normal', scale: '0.9', transformOrigin: 'top center', color: '#111827' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: `2px solid ${greenPrimary}`, paddingBottom: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '50px', height: '50px', backgroundColor: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '10px', fontWeight: 'bold' }}>LOGO</div>
                                        <div>
                                            <h2 style={{ margin: '0', color: '#111827', fontSize: '24px', fontWeight: '800' }}>{formData.companyName || brandKit?.name || 'Company Name'}</h2>
                                            <p style={{ margin: '0', fontSize: '11px', color: '#6B7280' }}>{(formData.companyAddress || brandKit?.address || 'Company Address')}</p>
                                            <p style={{ margin: '0', fontSize: '11px', color: '#111827', fontWeight: 'bold' }}>GSTIN: {formData.gstNumber || '29ABCDE1234F1Z5'}</p>
                                        </div>
                                    </div>
                                    <h1 style={{ margin: '0', color: greenPrimary, fontSize: '32px', fontWeight: '900', letterSpacing: '2px' }}>TAX INVOICE</h1>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '25px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 120px', gap: '0', border: '1px solid #E5E7EB' }}>
                                        <div style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>DATE</div>
                                        <div style={{ padding: '4px 8px', fontSize: '11px', borderBottom: '1px solid #E5E7EB' }}>{formData.invoiceDate || new Date().toLocaleDateString()}</div>
                                        <div style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>INVOICE #</div>
                                        <div style={{ padding: '4px 8px', fontSize: '11px', borderBottom: '1px solid #E5E7EB', fontWeight: 'bold' }}>{formData.invoiceNumber || '[123456]'}</div>
                                        <div style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>CUSTOMER ID</div>
                                        <div style={{ padding: '4px 8px', fontSize: '11px', borderBottom: '1px solid #E5E7EB' }}>{formData.customerId || '[123]'}</div>
                                        <div style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', borderRight: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>DUE DATE</div>
                                        <div style={{ padding: '4px 8px', fontSize: '11px' }}>{formData.dueDate || new Date().toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                                    <div style={{ border: '1px solid #E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
                                        <div style={{ backgroundColor: greenPrimary, color: 'white', padding: '6px 15px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>BILL TO</div>
                                        <div style={{ padding: '15px', fontSize: '13px', lineHeight: '1.5' }}>
                                            <p style={{ margin: '0', fontWeight: 'bold' }}>{formData.clientName || '[Customer Name]'}</p>
                                            <div style={{ whiteSpace: 'pre-wrap' }}>{formData.billToAddress || '[Address]' }</div>
                                            {formData.clientGST && <p style={{ margin: '5px 0 0 0', fontWeight: '600' }}>GSTIN: {formData.clientGST}</p>}
                                        </div>
                                    </div>
                                    <div style={{ border: '1px solid #E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
                                        <div style={{ backgroundColor: greenPrimary, color: 'white', padding: '6px 15px', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>SHIP TO</div>
                                        <div style={{ padding: '15px', fontSize: '13px', lineHeight: '1.5' }}>
                                            <p style={{ margin: '0', fontWeight: 'bold' }}>{formData.shipToName || formData.clientName || '[Receiver Name]'}</p>
                                            <div style={{ whiteSpace: 'pre-wrap' }}>{formData.shipToAddress || formData.billToAddress || '[Address]' }</div>
                                        </div>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: greenPrimary, color: 'white' }}>
                                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>No.</th>
                                            <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>PRODUCT</th>
                                            <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>QTY</th>
                                            <th style={{ padding: '8px', textAlign: 'right', fontSize: '12px' }}>PRICE</th>
                                            <th style={{ padding: '8px', textAlign: 'right', fontSize: '12px' }}>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.length > 0 ? items.map((item, idx) => (
                                            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                                <td style={{ padding: '8px', fontSize: '12px', borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB' }}>{idx + 1}</td>
                                                <td style={{ padding: '8px', fontSize: '12px', borderRight: '1px solid #E5E7EB' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{item.product}</div>
                                                    <div style={{ fontSize: '10px', color: '#6B7280' }}>{item.description}</div>
                                                </td>
                                                <td style={{ padding: '8px', textAlign: 'center', fontSize: '12px', borderRight: '1px solid #E5E7EB' }}>{item.qty}</td>
                                                <td style={{ padding: '8px', textAlign: 'right', fontSize: '12px', borderRight: '1px solid #E5E7EB' }}>₹{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td style={{ padding: '8px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', borderRight: '1px solid #E5E7EB' }}>₹{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px', border: '1px solid #E5E7EB' }}>Fill in invoice items to populate the table</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
                                    <div>
                                        <div style={{ backgroundColor: greenPrimary, color: 'white', padding: '4px 12px', fontWeight: 'bold', fontSize: '12px', marginBottom: '0', textTransform: 'uppercase' }}>Terms & Conditions</div>
                                        <div style={{ border: '1px solid #E5E7EB', padding: '12px', fontSize: '11px', minHeight: '100px', backgroundColor: 'white', whiteSpace: 'pre-wrap' }}>
                                            {formData.terms || '1. Total payment due in 30 days\n2. Please include the invoice number on your check'}
                                        </div>
                                    </div>
                                    <div style={{ alignSelf: 'start' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '13px', borderBottom: '1px solid #E5E7EB' }}>
                                            <span style={{ fontWeight: '600' }}>Subtotal</span>
                                            <span>₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '13px', borderBottom: '1px solid #E5E7EB' }}>
                                            <span style={{ fontWeight: '600' }}>Discount</span>
                                            <span>₹{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '13px', borderBottom: '1px solid #E5E7EB' }}>
                                            <span style={{ fontWeight: '600' }}>Tax ({taxRate}%)</span>
                                            <span>₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 10px', backgroundColor: '#F3F4F6', fontWeight: '900', fontSize: '16px', marginTop: '5px', borderRadius: '4px' }}>
                                            <span style={{ color: '#111827' }}>TOTAL</span>
                                            <span style={{ color: greenPrimary }}>₹{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px', borderTop: '1px solid #E5E7EB', paddingTop: '15px' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '11px', fontWeight: 'bold', color: greenPrimary, textTransform: 'uppercase' }}>PAYMENT DETAILS</h4>
                                        <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                                            <p style={{ margin: '0' }}><strong>Bank:</strong> {formData.bankName || '[Bank Name]'}</p>
                                            <p style={{ margin: '0' }}><strong>Account:</strong> {formData.accountName || '[Account Name]'}</p>
                                            <p style={{ margin: '0' }}><strong>A/C No:</strong> {formData.accountNumber || '[Account Number]'}</p>
                                            <p style={{ margin: '0' }}><strong>IFSC:</strong> {formData.ifscCode || '[IFSC Code]'}</p>
                                            {formData.upiId && <p style={{ margin: '0' }}><strong>UPI:</strong> {formData.upiId}</p>}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ border: '1px solid #E5E7EB', padding: '10px', display: 'inline-block', borderRadius: '4px' }}>
                                            <div style={{ width: '60px', height: '60px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '8px' }}>QR CODE</div>
                                        </div>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#6B7280' }}>Scan to Pay</p>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '40px', color: '#6B7280', fontSize: '12px' }}>
                                    <p style={{ marginTop: '15px', fontWeight: '900', color: greenPrimary, fontStyle: 'italic', fontSize: '16px' }}>Thank You For Your Business!</p>
                                </div>
                            </div>
                        )
                    })()
                }
            };

            return previews[selectedDocType] || (() => {
                if (selectedDocType === 'credit_note') {
                    const cnItems = (formData.creditNoteItems || '').split('\n')
                        .filter(line => line.trim())
                        .map(line => {
                            const parts = line.split('|').map(s => s.trim());
                            const qty = parseFloat(parts[0]) || 1;
                            const description = parts[1] || 'Item';
                            const unitPrice = parseFloat(parts[2]) || 0;
                            const amount = (qty * unitPrice).toFixed(2);
                            return { qty, description, unitPrice: unitPrice.toFixed(2), amount };
                        });
                    const subtotal = cnItems.reduce((s, i) => s + parseFloat(i.amount), 0);
                    const taxRate = parseFloat(formData.taxRate) || 0;
                    const taxAmount = subtotal * (taxRate / 100);
                    const total = (subtotal + taxAmount).toFixed(2);

                    return {
                        title: 'Credit Note',
                        content: (
                            <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
                                {/* Maroon header bar */}
                                <div style={{ background: '#801818', height: '12px', borderRadius: '4px 4px 0 0', marginBottom: '20px' }} />

                                <h1 style={{ fontSize: '30px', fontWeight: '300', letterSpacing: '2px', color: '#333', textTransform: 'uppercase', marginBottom: '20px' }}>Credit Note</h1>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', fontWeight: '700', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Customer</div>
                                        <div style={{ fontWeight: '600' }}>{formData.clientName || '[Customer Name]'}</div>
                                        <div style={{ fontSize: '12px', color: '#555', whiteSpace: 'pre-line' }}>{formData.clientAddress || '[Address]'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '10px', fontWeight: '700', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>Ship To</div>
                                        <div style={{ fontWeight: '600' }}>{formData.shipToName || formData.clientName || '[Ship To]'}</div>
                                        <div style={{ fontSize: '12px', color: '#555', whiteSpace: 'pre-line' }}>{formData.shipToAddress || formData.clientAddress || '[Address]'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                                        <div><strong style={{ color: '#999' }}>Credit Note #</strong> {formData.creditNoteNumber || '--'}</div>
                                        <div><strong style={{ color: '#999' }}>Date</strong> {formData.creditNoteDate || '--'}</div>
                                        {formData.invoiceNumber && <div><strong style={{ color: '#999' }}>Invoice #</strong> {formData.invoiceNumber}</div>}
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />

                                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                                    <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#333' }}>{formData.companyName || '[Company Name]'}</h2>
                                    <p style={{ fontSize: '12px', color: '#666' }}>{formData.companyAddress || '[Company Address]'}</p>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#801818', color: 'white' }}>
                                            <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px' }}>Description</th>
                                            <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px' }}>Unit Price</th>
                                            <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px' }}>Qty</th>
                                            <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cnItems.length > 0 ? cnItems.map((item, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '10px', fontSize: '13px' }}>{item.description}</td>
                                                <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>{item.unitPrice}</td>
                                                <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>{item.qty}</td>
                                                <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: '500' }}>{item.amount}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} style={{ padding: '14px', color: '#9ca3af', textAlign: 'center', fontSize: '12px' }}>
                                                    Enter items above (Qty | Description | Unit Price)
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <div style={{ width: '240px', fontSize: '13px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#555' }}>
                                            <span style={{ fontWeight: '700', color: '#999', textTransform: 'uppercase', fontSize: '11px' }}>Subtotal</span>
                                            <span>{subtotal.toFixed(2)}</span>
                                        </div>
                                        {taxRate > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#555' }}>
                                                <span style={{ fontWeight: '700', color: '#999', textTransform: 'uppercase', fontSize: '11px' }}>Tax ({taxRate}%)</span>
                                                <span>{taxAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #e5e7eb', marginTop: '6px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '14px' }}>Total</span>
                                            <span style={{ fontWeight: '700', fontSize: '18px' }}>₹ {total}</span>
                                        </div>
                                    </div>
                                </div>

                                {formData.reason && (
                                    <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fff5f5', borderLeft: '3px solid #801818', borderRadius: '4px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#801818', textTransform: 'uppercase', marginBottom: '4px' }}>Reason for Credit</div>
                                        <div style={{ fontSize: '13px', color: '#333' }}>{formData.reason}</div>
                                    </div>
                                )}

                                <div style={{ background: '#801818', height: '12px', borderRadius: '0 0 4px 4px', marginTop: '20px' }} />
                            </div>
                        )
                    };
                }
                return {
                    title: selectedDocType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    content: 'Document preview will appear here as you fill the form...'
                };
            })();
        };

        const handleGenerate = async () => {
            setIsGenerating(true);
            setGenerationStepText("Analyzing requirements...");
            setValidationErrors([]); // Clear previous errors

            // Simulated steps
            const steps = [
                "Drafting document structure...",
                "Applying brand styles...",
                "Finalizing context...",
                "Completing document generation..."
            ];
            let stepIndex = 0;
            const stepInterval = setInterval(() => {
                if (stepIndex < steps.length) {
                    setGenerationStepText(steps[stepIndex]);
                    stepIndex++;
                }
            }, 2000);

            try {
                // Validate required fields
                const requiredFields = formFields.filter(field => field.required);
                const missingFields = requiredFields.filter(field => !formData[field.id] || formData[field.id].toString().trim() === '');

                if (missingFields.length > 0) {
                    const errorMessages = missingFields.map(f => f.label);
                    setValidationErrors(errorMessages);
                    alert(`❌ Please fill in all required fields:\n\n${errorMessages.join('\n')}\n\nDocument generation is blocked until all required information is provided.`);
                    clearInterval(stepInterval);
                    setIsGenerating(false);
                    return;
                }

                // Create a comprehensive topic/prompt for AI generation
                const createPrompt = () => {
                    const basePrompt = `Generate a professional ${selectedDocType.replace(/_/g, ' ')} document`;

                    // Build context from form data
                    const context = [];

                    if (formData.companyName) context.push(`for company: ${formData.companyName}`);
                    if (formData.candidateName) context.push(`candidate: ${formData.candidateName}`);
                    if (formData.employeeName) context.push(`employee: ${formData.employeeName}`);
                    if (formData.clientName) context.push(`client: ${formData.clientName}`);
                    if (formData.consultantName) context.push(`consultant: ${formData.consultantName}`);
                    if (formData.partyName) context.push(`party: ${formData.partyName}`);
                    if (formData.position) context.push(`position: ${formData.position}`);
                    if (formData.salary) context.push(`salary: ₹${Number(formData.salary).toLocaleString()}`);
                    if (formData.projectTitle) context.push(`project: ${formData.projectTitle}`);
                    if (formData.totalAmount || formData.projectValue || formData.baseAmount) {
                        const amount = formData.totalAmount || formData.projectValue || formData.baseAmount;
                        context.push(`amount: ₹${Number(amount).toLocaleString()}`);
                    }

                    // Add specific details based on document type
                    const specificDetails = [];
                    Object.entries(formData).forEach(([key, value]) => {
                        if (value && !['companyName', 'candidateName', 'employeeName', 'clientName', 'partyName'].includes(key)) {
                            specificDetails.push(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${value}`);
                        }
                    });

                    return `${basePrompt}${context.length ? ` ${context.join(', ')}` : ''}${specificDetails.length ? `. Additional details: ${specificDetails.join(', ')}` : ''}. 
                    IMPORTANT: PRIORITIZE THE FOLLOWING FORM DATA OVER ANY GENERATED CONTENT: ${JSON.stringify(formData)}.
                    Make it professional, comprehensive, and industry-standard.`;
                };

                const prompt = createPrompt();
                console.log('Generated prompt:', prompt);

                // Prepare document data for AI generation
                const documentData = {
                    type: selectedDocType,
                    topic: prompt,
                    title: `${selectedDocType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${formData.companyName || formData.clientName || formData.candidateName || formData.employeeName || 'Document'}`
                };

                console.log('Generating document with data:', documentData);

                // Call the document generation endpoint
                console.log('🔄 Fetching document generation API');
                console.log('🔑 Token:', token ? 'Present' : 'Missing');

                const response = await fetch(getApiUrl('/api/documents/generate'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...documentData,
                        content: formData
                    })
                }).catch(error => {
                    console.error('❌ Fetch error:', error);
                    throw new Error(`Network error: ${error.message}. Please check your connection.`);
                });

                console.log('✅ Response status:', response?.status);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                    throw new Error(errorData.message || 'Failed to generate document');
                }

                const result = await response.json();
                console.log('Document generated successfully:', result);

                // Update the documents list
                const updatedDocs = await api.get('/documents');
                setDocs(updatedDocs);

                // Navigate to view the generated document in the rich text editor
                navigate(`/document/editor/${result.document._id}`);

                // Reset form data
                setFormData({});

            } catch (error) {
                console.error('Generation error:', error);
                setError(`Failed to generate document: ${error.message}`);
                alert(`Failed to generate document: ${error.message}`);
            } finally {
                clearInterval(stepInterval);
                setIsGenerating(false);
                setGenerationStepText("");
            }
        };

        const formFields = getFormFields();
        const preview = generatePreviewContent();

        return (
            <div style={{ padding: '32px', position: 'relative' }}>
                <AnimatePresence>
                    {isGenerating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                zIndex: 9999,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    border: '4px solid #E5E7EB',
                                    borderTopColor: '#6366F1',
                                    borderRadius: '50%',
                                    marginBottom: '24px'
                                }}
                            />
                            <motion.h3
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: '#111827',
                                    marginBottom: '8px'
                                }}
                            >
                                {generationStepText}
                            </motion.h3>
                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                                style={{ color: '#6B7280', fontSize: '16px' }}
                            >
                                We are using professional templates to draft your content.
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <button
                        onClick={() => setCurrentView('create')}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#6B7280',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '16px',
                            padding: '8px 0'
                        }}
                    >
                        ← Back to Document Types
                    </button>
                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#111827',
                        margin: 0
                    }}>Generate {selectedDocType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
                    <p style={{
                        fontSize: '16px',
                        color: '#6B7280',
                        margin: '4px 0 0 0'
                    }}>Fill in the details below to generate your professional document</p>
                </div>

                {/* Split Layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', height: 'calc(100vh - 200px)' }}>
                    {/* Form Section */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        padding: '24px',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 20px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            📝 Document Details
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {validationErrors.length > 0 && (
                                <div style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#FEE2E2',
                                    border: '1px solid #FCA5A5',
                                    borderRadius: '8px',
                                    color: '#991B1B',
                                    fontSize: '14px'
                                }}>
                                    <strong>⚠️ Missing Required Fields:</strong>
                                    <ul style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
                                        {validationErrors.map((error, idx) => (
                                            <li key={idx}>{error}</li>
                                        ))}
                                    </ul>
                                    <p style={{ marginTop: '8px', marginBottom: '0', fontSize: '13px' }}>
                                        All fields must be completed before generating the document.
                                    </p>
                                </div>
                            )}

                            {formFields.map((field) => {
                                const hasError = field.required && validationErrors.includes(field.label);
                                const borderColor = hasError ? '#EF4444' : '#D1D5DB';

                                return (
                                    <div key={field.id}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: hasError ? '#EF4444' : '#374151',
                                            marginBottom: '6px'
                                        }}>
                                            {field.label} {field.required && <span style={{ color: '#EF4444' }}>*</span>}
                                        </label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                value={formData[field.id] || ''}
                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                placeholder={field.placeholder}
                                                rows={3}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    border: `2px solid ${borderColor}`,
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontFamily: 'Inter, sans-serif',
                                                    resize: 'vertical',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s ease',
                                                    backgroundColor: hasError ? '#FEF2F2' : 'white'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = hasError ? '#EF4444' : '#F97316'}
                                                onBlur={(e) => e.target.style.borderColor = borderColor}
                                            />
                                        ) : field.type === 'select' ? (
                                            <select
                                                value={formData[field.id] || ''}
                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    border: `2px solid ${borderColor}`,
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontFamily: 'Inter, sans-serif',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s ease',
                                                    backgroundColor: hasError ? '#FEF2F2' : 'white'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = hasError ? '#EF4444' : '#F97316'}
                                                onBlur={(e) => e.target.style.borderColor = borderColor}
                                            >
                                                <option value="">Select {field.label}</option>
                                                {field.options?.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={formData[field.id] || ''}
                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                placeholder={field.placeholder}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    border: `2px solid ${borderColor}`,
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontFamily: 'Inter, sans-serif',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s ease',
                                                    backgroundColor: hasError ? '#FEF2F2' : 'white'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = hasError ? '#EF4444' : '#F97316'}
                                                onBlur={(e) => e.target.style.borderColor = borderColor}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Generate Button */}
                        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    backgroundColor: isGenerating ? '#9CA3AF' : '#F97316',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: 'white',
                                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {isGenerating ? (
                                    <>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid transparent',
                                            borderTop: '2px solid white',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} />
                                        Generate Professional Document
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Live Preview Section */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        border: '1px solid #E5E7EB',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Preview Header */}
                        <div style={{
                            padding: '20px 24px',
                            backgroundColor: '#F9FAFB',
                            borderBottom: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#10B981'
                            }} />
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#111827',
                                margin: 0
                            }}>📄 LIVE PREVIEW</h3>
                        </div>

                        {/* Preview Content */}
                        <div style={{
                            flex: 1,
                            padding: '32px',
                            overflowY: 'auto',
                            backgroundColor: '#FEFEFE'
                        }}>
                            {/* Document Header */}
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    backgroundColor: '#F97316',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px auto'
                                }}>
                                    <span style={{ color: 'white', fontSize: '20px', fontWeight: '600' }}>
                                        {(formData.companyName || 'MM').charAt(0)}
                                    </span>
                                </div>
                                <h1 style={{
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: '#111827',
                                    margin: '0 0 8px 0'
                                }}>{formData.companyName || '[Company Name]'}</h1>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#6B7280',
                                    margin: 0
                                }}>{formData.companyAddress || '[Company Address]'}</p>
                            </div>

                            {/* Document Title */}
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <h2 style={{
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    color: '#111827',
                                    margin: '0 0 8px 0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>{preview.title}</h2>
                                <div style={{
                                    width: '60px',
                                    height: '3px',
                                    backgroundColor: '#F97316',
                                    margin: '0 auto'
                                }} />
                            </div>

                            {/* Document Content */}
                            <div style={{
                                fontSize: '14px',
                                lineHeight: '1.7',
                                color: '#374151',
                                whiteSpace: 'pre-line',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {preview.content}
                            </div>

                            {/* Document Footer */}
                            <div style={{
                                marginTop: '48px',
                                paddingTop: '24px',
                                borderTop: '1px solid #E5E7EB',
                                textAlign: 'center'
                            }}>
                                <p style={{
                                    fontSize: '12px',
                                    color: '#9CA3AF',
                                    margin: 0
                                }}>
                                    Generated with MM Docs AI • {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    if (currentView === 'generate-document') {
        return <DocumentGenerationPage />;
    }
    return <CreateDocumentPage />;
}
