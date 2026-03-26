import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Palette, FileText, ArrowRight, ArrowLeft, Check,
    Upload, Globe, Users, Briefcase, Phone, Link2, SkipForward
} from 'lucide-react';
import { getApiUrl } from '../config/api';
import '../styles/Onboarding.css';

const INDUSTRIES = [
    { value: 'startup', label: 'Startup' },
    { value: 'saas', label: 'SaaS / Tech' },
    { value: 'hr-services', label: 'HR Services' },
    { value: 'legal-services', label: 'Legal Services' },
    { value: 'finance', label: 'Finance / Accounting' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail / E-commerce' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'other', label: 'Other' }
];

const COMPANY_SIZES = [
    { value: '1-10', label: '1–10' },
    { value: '11-50', label: '11–50' },
    { value: '51-200', label: '51–200' },
    { value: '201-500', label: '201–500' },
    { value: '500+', label: '500+' }
];

const USE_CASES = [
    { value: 'invoices', label: '📄 Invoices & Billing', icon: FileText },
    { value: 'contracts', label: '📝 Contracts & Agreements', icon: FileText },
    { value: 'hr-docs', label: '👥 HR Documents', icon: Users },
    { value: 'proposals', label: '💼 Proposals & Quotations', icon: Briefcase },
    { value: 'all', label: '🔄 All of the above', icon: Globe }
];

const COLOR_PRESETS = [
    { name: 'Purple', primary: '#7C3AED', secondary: '#64748B', accent: '#3B82F6' },
    { name: 'Blue', primary: '#2563EB', secondary: '#475569', accent: '#06B6D4' },
    { name: 'Green', primary: '#059669', secondary: '#6B7280', accent: '#10B981' },
    { name: 'Orange', primary: '#EA580C', secondary: '#78716C', accent: '#F59E0B' },
    { name: 'Rose', primary: '#E11D48', secondary: '#64748B', accent: '#F43F5E' },
    { name: 'Slate', primary: '#334155', secondary: '#94A3B8', accent: '#7C3AED' }
];

const STEPS = [
    { id: 1, title: 'Company Info', icon: Building2, desc: 'Tell us about your business' },
    { id: 2, title: 'Brand Kit', icon: Palette, desc: 'Customize your documents' },
    { id: 3, title: 'Tax & Compliance', icon: FileText, desc: 'For invoices & billing' }
];

export default function Onboarding() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Step 1 data
    const [companyData, setCompanyData] = useState({
        companyName: '',
        industry: 'other',
        companySize: '1-10',
        primaryUseCase: 'all',
        role: ''
    });

    // Step 2 data
    const [brandData, setBrandData] = useState({
        brandName: '',
        logo: '',
        primaryColor: '#7C3AED',
        secondaryColor: '#64748B',
        accentColor: '#3B82F6',
        fontFamily: 'Inter',
        phone: '',
        website: '',
        // Banking fields
        bankName: '',
        accountName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: ''
    });

    // Step 3 data
    const [taxData, setTaxData] = useState({
        gstin: '',
        pan: '',
        gstRegistrationType: 'unregistered'
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setCompanyData(prev => ({ ...prev, companyName: parsed.name + "'s Company" }));
            setBrandData(prev => ({ ...prev, brandName: parsed.name + "'s Company" }));
        }
    }, []);

    const getToken = () => localStorage.getItem('token');

    const saveStep = async (step, data) => {
        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/onboarding/step'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ step, data })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            return result;
        } catch (err) {
            console.error(`Step ${step} error:`, err);
            alert(err.message || 'Failed to save. Please try again.');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = async () => {
        if (currentStep === 1) {
            const result = await saveStep(1, companyData);
            if (result) setCurrentStep(2);
        } else if (currentStep === 2) {
            const result = await saveStep(2, brandData);
            if (result) {
                // If not India, skip tax step
                if (user?.countryCode && user.countryCode !== 'IN') {
                    await handleFinish();
                } else {
                    setCurrentStep(3);
                }
            }
        } else if (currentStep === 3) {
            await handleFinish();
        }
    };

    const handleFinish = async () => {
        if (currentStep === 3) {
            const result = await saveStep(3, taxData);
            if (!result) return;
        } else {
            // Skip tax by calling skip or completing step 3 with empty data
            await saveStep(3, {});
        }
        navigate('/dashboard');
    };

    const handleSkip = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/onboarding/skip'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (res.ok) navigate('/dashboard');
        } catch (err) {
            console.error('Skip error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Simple base64 preview (in production, upload to cloud)
        const reader = new FileReader();
        reader.onload = () => setBrandData(prev => ({ ...prev, logo: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleOCRUpload = async (e, docType) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('docType', docType);
            const res = await fetch(getApiUrl('/api/ocr/extract'), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            });
            const result = await res.json();
            if (res.ok && result.extracted) {
                if (docType === 'gst_certificate') {
                    setTaxData(prev => ({
                        ...prev,
                        gstin: result.extracted.gstin || prev.gstin,
                        pan: result.extracted.pan || prev.pan,
                        gstRegistrationType: result.extracted.gstRegistrationType || prev.gstRegistrationType
                    }));
                }
            }
        } catch (err) {
            console.error('OCR upload error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-bg">
                <div className="bg-glow glow-1" />
                <div className="bg-glow glow-2" />
            </div>

            <div className="onboarding-container">
                {/* Progress Indicator */}
                <div className="onboarding-progress">
                    {STEPS.map((step, i) => (
                        <div key={step.id} className={`progress-step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'done' : ''}`}>
                            <div className="progress-circle">
                                {currentStep > step.id ? <Check size={16} /> : <step.icon size={16} />}
                            </div>
                            <span className="progress-label">{step.title}</span>
                            {i < STEPS.length - 1 && <div className="progress-line" />}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="onboarding-card"
                    >
                        {/* ── Step 1: Company Info ────────────────────────── */}
                        {currentStep === 1 && (
                            <>
                                <div className="step-header">
                                    <Building2 size={28} className="step-icon" />
                                    <h2>Tell us about your business</h2>
                                    <p>This helps us personalize your documents and templates.</p>
                                </div>

                                <div className="step-form">
                                    <div className="form-group">
                                        <label>Company / Brand Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Your Company Name"
                                            value={companyData.companyName}
                                            onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Your Role / Designation</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. CEO, Finance Head, HR Manager"
                                            value={companyData.role}
                                            onChange={(e) => setCompanyData({ ...companyData, role: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Industry</label>
                                            <select
                                                value={companyData.industry}
                                                onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                                            >
                                                {INDUSTRIES.map(i => (
                                                    <option key={i.value} value={i.value}>{i.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Company Size</label>
                                            <select
                                                value={companyData.companySize}
                                                onChange={(e) => setCompanyData({ ...companyData, companySize: e.target.value })}
                                            >
                                                {COMPANY_SIZES.map(s => (
                                                    <option key={s.value} value={s.value}>{s.label} employees</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>What will you use MM Docs for?</label>
                                        <div className="use-case-grid">
                                            {USE_CASES.map(uc => (
                                                <button
                                                    key={uc.value}
                                                    type="button"
                                                    className={`use-case-btn ${companyData.primaryUseCase === uc.value ? 'selected' : ''}`}
                                                    onClick={() => setCompanyData({ ...companyData, primaryUseCase: uc.value })}
                                                >
                                                    {uc.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Step 2: Brand Kit ──────────────────────────── */}
                        {currentStep === 2 && (
                            <>
                                <div className="step-header">
                                    <Palette size={28} className="step-icon" />
                                    <h2>Set up your brand</h2>
                                    <p>Your logo and colors will appear on all documents automatically.</p>
                                </div>

                                <div className="step-form">
                                    <div className="form-group">
                                        <label>Brand / Company Name</label>
                                        <input
                                            type="text"
                                            placeholder="Displayed on documents"
                                            value={brandData.brandName}
                                            onChange={(e) => setBrandData({ ...brandData, brandName: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Logo</label>
                                        <div className="logo-upload-area" onClick={() => document.getElementById('logo-input').click()}>
                                            {brandData.logo ? (
                                                <img src={brandData.logo} alt="Logo" className="logo-preview" />
                                            ) : (
                                                <div className="upload-placeholder">
                                                    <Upload size={24} />
                                                    <span>Click to upload logo</span>
                                                    <small>PNG, JPG, SVG — max 2MB</small>
                                                </div>
                                            )}
                                            <input id="logo-input" type="file" accept="image/*" hidden onChange={handleLogoUpload} />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Brand Colors</label>
                                        <div className="color-presets">
                                            {COLOR_PRESETS.map(preset => (
                                                <button
                                                    key={preset.name}
                                                    type="button"
                                                    className={`color-preset-btn ${brandData.primaryColor === preset.primary ? 'selected' : ''}`}
                                                    onClick={() => setBrandData({
                                                        ...brandData,
                                                        primaryColor: preset.primary,
                                                        secondaryColor: preset.secondary,
                                                        accentColor: preset.accent
                                                    })}
                                                    title={preset.name}
                                                >
                                                    <div className="preset-swatch" style={{ backgroundColor: preset.primary }} />
                                                    <span>{preset.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Banking Details Sub-section */}
                                    <div style={{
                                        marginTop: '24px',
                                        padding: '16px',
                                        backgroundColor: '#F9FAFB',
                                        borderRadius: '12px',
                                        border: '1px solid #E5E7EB'
                                    }}>
                                        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <DollarSign size={16} className="text-blue-600" />
                                            Banking Details (For Invoices)
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div className="form-group">
                                                <label>Bank Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. HDFC Bank"
                                                    value={brandData.bankName}
                                                    onChange={(e) => setBrandData({ ...brandData, bankName: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Account Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Owner / Entity Name"
                                                    value={brandData.accountName}
                                                    onChange={(e) => setBrandData({ ...brandData, accountName: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Account Number</label>
                                                <input
                                                    type="text"
                                                    placeholder="0000000000"
                                                    value={brandData.accountNumber}
                                                    onChange={(e) => setBrandData({ ...brandData, accountNumber: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>IFSC Code</label>
                                                <input
                                                    type="text"
                                                    placeholder="HDFC0001234"
                                                    value={brandData.ifscCode}
                                                    onChange={(e) => setBrandData({ ...brandData, ifscCode: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Step 3: Tax & Compliance ────────────────────── */}
                        {currentStep === 3 && (
                            <>
                                <div className="step-header">
                                    <FileText size={28} className="step-icon" />
                                    <h2>Tax & Compliance Details</h2>
                                    <p>These are auto-filled in your invoices and financial documents.</p>
                                </div>

                                <div className="step-form">
                                    <div className="ocr-banner" onClick={() => document.getElementById('ocr-input').click()}>
                                        <Upload size={20} />
                                        <div>
                                            <strong>Upload GST Certificate</strong>
                                            <small>We'll auto-extract GSTIN, PAN, and address</small>
                                        </div>
                                        <input id="ocr-input" type="file" accept="image/*,.pdf" hidden
                                            onChange={(e) => handleOCRUpload(e, 'gst_certificate')} />
                                    </div>

                                    <div className="form-group">
                                        <label>GST Number (GSTIN)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 27AABCU9603R1ZM"
                                            maxLength={15}
                                            value={taxData.gstin}
                                            onChange={(e) => setTaxData({ ...taxData, gstin: e.target.value.toUpperCase() })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>PAN Number</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. AABCU9603R"
                                            maxLength={10}
                                            value={taxData.pan}
                                            onChange={(e) => setTaxData({ ...taxData, pan: e.target.value.toUpperCase() })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>GST Registration Type</label>
                                        <select
                                            value={taxData.gstRegistrationType}
                                            onChange={(e) => setTaxData({ ...taxData, gstRegistrationType: e.target.value })}
                                        >
                                            <option value="regular">Regular</option>
                                            <option value="composite">Composite</option>
                                            <option value="unregistered">Not Registered</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ── Navigation Buttons ─────────────────────────── */}
                        <div className="step-actions">
                            {currentStep > 1 ? (
                                <button className="btn-back" onClick={() => setCurrentStep(currentStep - 1)} disabled={isLoading}>
                                    <ArrowLeft size={16} /> Back
                                </button>
                            ) : (
                                <button className="btn-skip" onClick={handleSkip} disabled={isLoading}>
                                    <SkipForward size={16} /> Skip setup
                                </button>
                            )}

                            <button className="btn-next" onClick={handleNext} disabled={isLoading}>
                                {isLoading ? 'Saving...' : currentStep === 3 ? 'Finish Setup' : 'Continue'}
                                {!isLoading && <ArrowRight size={16} />}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <p className="onboarding-time">⏱ Takes less than 2 minutes</p>
            </div>
        </div>
    );
}
