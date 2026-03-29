import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Download, Eye, Loader2, UploadCloud, Scan } from 'lucide-react';
import Handlebars from 'handlebars';
import { api } from '../utils/api';
import { useFormIntelligence } from '../hooks/useFormIntelligence';
import { Sparkles, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

const CreateDocument = () => {
    const { templateId } = useParams();
    const navigate = useNavigate();

    const [template, setTemplate] = useState(null);
    const iframeRef = useRef(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [scanning, setScanning] = useState(false);
    const fileInputRef = useRef(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [generatedDocument, setGeneratedDocument] = useState(null);
    const [complianceData, setComplianceData] = useState(null);
    const [checkingCompliance, setCheckingCompliance] = useState(false);
    const [error, setError] = useState(null);

    // Fetch template and autofill data on component mount
    useEffect(() => {
        if (templateId === 'gst_filing_summary') {
            navigate('/gst-filing-summary');
            return;
        }

        if (templateId) {
            initPage();
        } else {
            setError('No template ID provided');
            setLoading(false);
        }
    }, [templateId]);

    const [autofilledFields, setAutofilledFields] = useState(new Set());
    const [syncToProfile, setSyncToProfile] = useState(true);

    const {
        suggestions,
        mismatches,
        isChecking,
        fetchSuggestions,
        fetchRelatedData,
        performConsistencyCheck,
        trackUsage
    } = useFormIntelligence(templateId);

    // Run consistency check when formData changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (Object.keys(formData).length > 0) {
                performConsistencyCheck(formData);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [formData, performConsistencyCheck]);

    // Update iframe preview directly via DOM ref whenever formData or template changes
    useEffect(() => {
        if (iframeRef.current && template) {
            const html = getPreviewContent();
            iframeRef.current.srcdoc = html;
        }
    }, [formData, template]);

    const initPage = async () => {
        setLoading(true);
        try {
            const [templateRes, autofillRes] = await Promise.all([
                api.get(`/templates/${templateId}`),
                api.get(`/autofill?type=${templateId}`).catch(() => ({ success: false }))
            ]);

            if (templateRes.success) {
                setTemplate(templateRes.data);
                
                // Initialize form data
                const initialFormData = {};
                const autofillMap = autofillRes.success ? autofillRes.data : {};
                const autofilled = new Set();
                
                templateRes.data.requiredFields.forEach(field => {
                    if (autofillMap[field.fieldName]) {
                        initialFormData[field.fieldName] = autofillMap[field.fieldName];
                        autofilled.add(field.fieldName);
                    } else {
                        initialFormData[field.fieldName] = '';
                    }
                });
                
                setFormData(initialFormData);
                setAutofilledFields(autofilled);
                console.log('Template and autofill loaded successfully');
            } else {
                setError('Failed to load template');
            }
        } catch (err) {
            console.error('Error initializing page:', err);
            setError(`Initialization failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = async (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Agentic Behavior: Field Intelligence (Suggestions)
        if (value.length > 1) {
            fetchSuggestions(fieldName);
        }

        // Agentic Behavior: Field Dependency Logic (e.g. Client -> Address)
        if (fieldName === 'client_name' && value.length > 3) {
            const related = await fetchRelatedData(fieldName, value);
            if (related) {
                setFormData(prev => ({
                    ...prev,
                    ...related
                }));
                // Mark related fields as autofilled
                setAutofilledFields(prev => {
                    const next = new Set(prev);
                    Object.keys(related).forEach(k => next.add(k));
                    return next;
                });
            }
        }

        // Agentic Behavior: Country/Currency Dependency
        if (fieldName === 'country') {
            const currencyMap = {
                'India': '₹',
                'United States': '$',
                'United Kingdom': '£',
                'Europe': '€',
                'Australia': 'A$'
            };
            if (currencyMap[value]) {
                setFormData(prev => ({ ...prev, currency_symbol: currencyMap[value] }));
            }
        }
    };

    const runComplianceCheck = async () => {
        if (!template || !template.complianceRules || template.complianceRules.length === 0) {
            setComplianceData(null);
            return;
        }

        setCheckingCompliance(true);
        setError(null);

        try {
            const response = await api.post('/compliance/check', {
                templateId: template.templateId,
                formData: formData,
                rules: template.complianceRules
            });

            if (response.success) {
                setComplianceData(response.data);
            } else {
                setError(response.message || 'Failed to check compliance');
                setComplianceData(null);
            }
        } catch (err) {
            console.error('Compliance check error:', err);
            setError(`Compliance check failed: ${err.message}`);
            setComplianceData(null);
        } finally {
            setCheckingCompliance(false);
        }
    };

    // Run compliance check when formData changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (Object.keys(formData).length > 0) {
                runComplianceCheck();
            }
        }, 1500); // Debounce for 1.5 seconds
        return () => clearTimeout(timer);
    }, [formData, template]);

    const validateForm = () => {
        const requiredFields = template.requiredFields.filter(field => field.required);
        const missingFields = requiredFields.filter(field => !formData[field.fieldName]?.trim());

        if (missingFields.length > 0) {
            setError(`Please fill in required fields: ${missingFields.map(f => f.label).join(', ')}`);
            return false;
        }

        setError(null);
        return true;
    };

    const handleOcrScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScanning(true);
        setError(null);

        try {
            const formDataOcr = new FormData();
            formDataOcr.append('file', file);
            formDataOcr.append('docType', 'general_document');
            formDataOcr.append('fields', template.requiredFields.map(f => f.fieldName).join(', '));

            const response = await fetch(`${api.API_BASE_URL || '/api'}/ocr/extract`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formDataOcr
            });

            const data = await response.json();

            if (data.extracted) {
                // Merge extracted data into formData
                const newFormData = { ...formData };
                const newlyAutofilled = new Set(autofilledFields);

                Object.entries(data.extracted).forEach(([key, value]) => {
                    if (value && String(value).trim() !== "" && formData.hasOwnProperty(key)) {
                        newFormData[key] = value;
                        newlyAutofilled.add(key);
                    }
                });

                setFormData(newFormData);
                setAutofilledFields(newlyAutofilled);
                console.log('OCR Extraction applied to form');
            } else {
                throw new Error(data.message || 'Extraction failed');
            }
        } catch (err) {
            console.error('OCR Error:', err);
            setError(`AI Scan failed: ${err.message}. You can still fill the form manually.`);
        } finally {
            setScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const generateDocument = async () => {
        if (!validateForm()) return;

        try {
            setGenerating(true);

            // Sync edits back to profile if enabled
            if (syncToProfile) {
                try {
                    await api.post('/autofill/sync', formData);
                    console.log('Autofill data synced to profile');
                } catch (syncErr) {
                    console.error('Failed to sync autofill data:', syncErr);
                    // Don't block document generation if sync fails
                }
            }

            const documentData = {
                type: template.templateId,
                topic: `Generate a professional ${template.category} document for: ${formData.company_name || 'our company'}, client: ${formData.client_name || 'our client'}. Additional details: ${Object.entries(formData).map(([k, v]) => `${k}: ${v}`).join(', ')}`,
                title: `${template.name} - ${formData.candidate_name || formData.employee_name || formData.client_name || 'Document'}`,
                content: formData,
                templateId: template.templateId
            };

            const response = await api.post('/documents/generate', documentData);

            if (response.success) {
                setGeneratedDocument(response.document);
                setPreviewMode(true);
            } else {
                setError('Failed to generate document');
            }
        } catch (err) {
            console.error('Error generating document:', err);
            setError('Failed to generate document. Please try again.');
        } finally {
            setGenerating(false);
            // Track all used fields for behavioral learning
            Object.entries(formData).forEach(([field, value]) => {
                trackUsage(field, value);
            });
        }
    };

    const downloadDocument = async (format = 'pdf') => {
        if (!generatedDocument) return;

        try {
            const url = `/api/documents/${generatedDocument._id}/${format === 'pdf' ? 'download' : 'download-docx'}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${generatedDocument.title.replace(/[^a-z0-9]/gi, '_')}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download Error:", err);
            setError("Failed to download document. Please try again.");
        }
    };

    const renderFormField = (field) => {
        const fieldMismatches = mismatches.find(m => m.field === field.fieldName);
        const fieldSuggestions = suggestions[field.fieldName] || [];

        const commonProps = {
            id: field.fieldName,
            value: formData[field.fieldName] || '',
            onChange: (e) => handleInputChange(field.fieldName, e.target.value),
            placeholder: field.placeholder,
            required: field.required,
            autoComplete: "off",
            style: {
                width: '100%',
                padding: '12px',
                border: `1px solid ${fieldMismatches ? '#F59E0B' : '#E5E7EB'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                backgroundColor: fieldMismatches ? '#FFFBEB' : 'white'
            },
            onFocus: (e) => {
                e.target.style.borderColor = '#F97316';
                e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
            },
            onBlur: (e) => {
                e.target.style.borderColor = fieldMismatches ? '#F59E0B' : '#E5E7EB';
                e.target.style.boxShadow = 'none';
            }
        };

        return (
            <div style={{ position: 'relative' }}>
                {field.fieldType === 'textarea' ? (
                    <textarea {...commonProps} rows={4} />
                ) : field.fieldType === 'select' ? (
                    <select {...commonProps}>
                        <option value="">Select {field.label}</option>
                        {field.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                ) : (
                    <input {...commonProps} type={field.fieldType || 'text'} />
                )}

                {/* Agentic Behavior: Smart Suggestions Dropdown */}
                {fieldSuggestions.length > 0 && formData[field.fieldName] && !fieldSuggestions.includes(formData[field.fieldName]) && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        marginTop: '4px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        zIndex: 50,
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        <div style={{ padding: '8px 12px', fontSize: '10px', color: '#9CA3AF', fontWeight: 'bold', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={10} color="#F97316" /> SMART SUGGESTIONS
                        </div>
                        {fieldSuggestions.map((sug, i) => (
                            <div
                                key={i}
                                onClick={() => handleInputChange(field.fieldName, sug)}
                                style={{
                                    padding: '10px 12px',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    borderBottom: i === fieldSuggestions.length - 1 ? 'none' : '1px solid #F3F4F6',
                                    transition: 'background-color 0.2s',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <span>{sug}</span>
                                <ChevronRight size={14} color="#D1D5DB" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Mismatch indicator */}
                {fieldMismatches && (
                    <div style={{ position: 'absolute', right: '12px', top: '12px' }}>
                        <AlertCircle size={18} color="#D97706" title={`Stored value: ${fieldMismatches.profile}`} />
                    </div>
                )}
            </div>
        );
    };

    const getPreviewContent = () => {
        if (!template || !template.content) return '';

        let content = template.content;

        // Replace placeholders with form data or professional sample data
        const previewData = {
            ...formData,
            // Fallbacks for better preview experience
            client_name: formData.client_name || formData.party_name || 'ABC Corporation Pvt Ltd',
            party_name: formData.party_name || formData.client_name || 'Business Partner Corp',
            company_name: formData.company_name || 'Your Company Ltd',
            effective_date: formData.effective_date || new Date().toLocaleDateString('en-IN'),
            proposal_date: formData.proposal_date || new Date().toLocaleDateString('en-IN'),
            project_title: formData.project_title || 'Digital Marketing Transformation Initiative',
            project_description: formData.project_description || 'Provide a comprehensive summary of the project goals, vision, and strategic approach.',
            problem_statement: formData.problem_statement || 'Define specific goals and objectives.',
            proposed_solution: formData.proposed_solution || 'Detailed methodology.',
            target_audience: formData.target_audience || 'List project inclusions.',
            key_features: formData.key_features || 'List project exclusions.',
            project_timeline: formData.project_timeline || 'Detailed timeline.',
            project_budget: formData.project_budget || '0.00',
            team_members: formData.team_members || 'Key stakeholders and team roles.',
            deliverables: formData.deliverables || 'List the deliverables.',
            services: formData.services || formData.service_description || 'Professional Services',
            
            client_address: formData.client_address || formData.party_address || '123 Business Street\nMumbai, Maharashtra',
            company_address: formData.company_address || 'Tech Park, Sector 5\nBangalore, Karnataka',
            
            invoice_number: formData.invoice_number || 'INV-2024-001',
            invoice_date: formData.invoice_date || new Date().toLocaleDateString('en-IN'),
            total_amount: formData.total_amount || '1,18,000',
            document_date: new Date().toLocaleDateString('en-IN'),
            
            // Legacy fallbacks (optional)
            clientName: formData.client_name,
            companyName: formData.company_name,
            invoiceNumber: formData.invoice_number,

            items: formData.items || [
                { itemNumber: 'SKU-001', description: 'Product/Service 1', quantity: 1, unit_price: '100.00', total: '100.00' },
                { itemNumber: 'SKU-002', description: 'Product/Service 2', quantity: 2, unit_price: '50.00', total: '100.00' }
            ],
            subtotal: formData.subtotal || '200.00',
            tax: formData.tax || '-',
            shipping: formData.shipping || '-',
            total: formData.total || '200.00',
        };

        try {
            console.log('Rendering preview with data:', previewData);
            // Use Handlebars to compile the layout
            const compiledTemplate = Handlebars.compile(content);
            const html = compiledTemplate(previewData);
            return html;
        } catch (e) {
            console.error('CRITICAL: Error compiling template:', e);
            return `<div style="color: red; padding: 20px; font-family: sans-serif;">
                <h3>Error generating preview</h3>
                <p>Template syntax might be invalid or a field is causing issues.</p>
                <pre style="background: #eee; padding: 10px; border-radius: 4px;">${e.message}</pre>
            </div>`;
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#F8F9FB'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} className="animate-spin" color="#F97316" />
                    <p style={{ marginTop: '16px', color: '#6B7280' }}>Loading template...</p>
                </div>
            </div>
        );
    }

    if (error && !template) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#F8F9FB'
            }}>
                <div style={{ textAlign: 'center', maxWidth: '400px', padding: '32px' }}>
                    <FileText size={64} color="#EF4444" style={{ marginBottom: '16px' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                        Template Not Found
                    </h2>
                    <p style={{ color: '#6B7280', marginBottom: '24px' }}>{error}</p>
                    <button
                        onClick={() => navigate('/dashboard/templates')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#F97316',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Back to Templates
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#F8F9FB', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: '1px solid #E5E7EB',
                padding: '16px 32px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => navigate('/dashboard/templates')}
                        style={{
                            padding: '8px',
                            backgroundColor: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ArrowLeft size={20} color="#6B7280" />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                            Create {template?.name}
                        </h1>
                        <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>
                            Fill in the required information to generate your document
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '32px', maxWidth: '1600px', margin: '0 auto' }}>
                    {/* Form Section */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        height: 'fit-content',
                        position: 'relative'
                    }}>
                        {/* Compliance Guardian Floating Badge */}
                        {complianceData && (
                            <div style={{
                                position: 'absolute',
                                top: '24px',
                                right: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 12px',
                                backgroundColor: complianceData.status === 'compliant' ? '#F0FDF4' : complianceData.status === 'warning' ? '#FFFBEB' : '#FEF2F2',
                                borderRadius: '20px',
                                border: `1px solid ${complianceData.status === 'compliant' ? '#DCFCE7' : complianceData.status === 'warning' ? '#FDE68A' : '#FECACA'}`,
                                cursor: 'help'
                            }} title="AI Compliance Guardian Score">
                                <div style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    borderRadius: '50%', 
                                    backgroundColor: complianceData.status === 'compliant' ? '#16A34A' : complianceData.status === 'warning' ? '#D97706' : '#DC2626' 
                                }} />
                                <span style={{ fontSize: '12px', fontWeight: '700', color: complianceData.status === 'compliant' ? '#16A34A' : complianceData.status === 'warning' ? '#B45309' : '#B91C1C' }}>
                                    {complianceData.score}% Compliant
                                </span>
                            </div>
                        )}
                        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                                    Document Information
                                </h2>
                                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                    Please fill in all required fields marked with *
                                </p>
                            </div>
                            
                            {/* Agentic Behavior: Scan-to-Fill Button */}
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleOcrScan} 
                                    style={{ display: 'none' }} 
                                    accept="image/*,application/pdf"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={scanning}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 16px',
                                        backgroundColor: '#EEF2FF',
                                        color: '#4F46E5',
                                        border: '1px solid #C7D2FE',
                                        borderRadius: '10px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: scanning ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 4px rgba(79, 70, 229, 0.05)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#E0E7FF';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#EEF2FF';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {scanning ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Scan size={16} />
                                    )}
                                    {scanning ? 'AI Scanning...' : 'AI Scan document to fill'}
                                </button>
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '-8px', 
                                    right: '-8px', 
                                    backgroundColor: '#4F46E5', 
                                    color: 'white', 
                                    fontSize: '9px', 
                                    padding: '2px 6px', 
                                    borderRadius: '10px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>NEW</div>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                backgroundColor: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '24px'
                            }}>
                                <p style={{ color: '#DC2626', fontSize: '14px', margin: 0 }}>{error}</p>
                            </div>
                        )}

                        {/* Agentic Behavior: Consistency Banner */}
                        {mismatches.length > 0 && (
                            <div style={{
                                backgroundColor: '#FFFBEB',
                                border: '1px solid #FDE68A',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '24px',
                                display: 'flex',
                                gap: '12px'
                            }}>
                                <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0 }} />
                                <div>
                                    <p style={{ color: '#92400E', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>Profile Mismatch Detected</p>
                                    <p style={{ color: '#B45309', fontSize: '12px', margin: '0 0 8px 0' }}>
                                        Some fields differ from your stored profile. You can update your profile globally when generating.
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {mismatches.map(m => (
                                            <span key={m.field} style={{ fontSize: '10px', backgroundColor: 'rgba(217, 119, 6, 0.1)', color: '#D97706', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                                                {m.label}: {m.profile}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gap: '20px' }}>
                            {template?.requiredFields.map((field) => (
                                <div key={field.fieldName}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <label style={{
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#374151'
                                        }}>
                                            {field.label}
                                            {field.required && <span style={{ color: '#EF4444' }}>*</span>}
                                        </label>
                                        {autofilledFields.has(field.fieldName) && (
                                            <span style={{ 
                                                fontSize: '10px', 
                                                backgroundColor: '#F0FDF4', 
                                                color: '#16A34A', 
                                                padding: '2px 8px', 
                                                borderRadius: '12px',
                                                border: '1px solid #DCFCE7',
                                                fontWeight: '600'
                                            }}>
                                                ✨ Autofilled
                                            </span>
                                        )}
                                    </div>
                                    {renderFormField(field)}
                                </div>
                            ))}
                        </div>

                        {/* Sync to Profile Checkbox */}
                        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={syncToProfile} 
                                    onChange={(e) => setSyncToProfile(e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: '#F97316' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Sync edits back to profile</div>
                                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Updated values will be saved for future documents.</div>
                                </div>
                            </label>
                        </div>

                        <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setPreviewMode(true)}
                                disabled={generating}
                                style={{
                                    flex: 1,
                                    padding: '12px 24px',
                                    backgroundColor: 'transparent',
                                    color: '#F97316',
                                    border: '1px solid #F97316',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: generating ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: generating ? 0.5 : 1
                                }}
                            >
                                <Eye size={16} />
                                Preview
                            </button>
                            <button
                                onClick={generateDocument}
                                disabled={generating}
                                style={{
                                    flex: 2,
                                    padding: '12px 24px',
                                    backgroundColor: '#F97316',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: generating ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: generating ? 0.5 : 1
                                }}
                            >
                                {generating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText size={16} />
                                        Generate Document
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                                Document Preview
                            </h2>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                Live preview of your document with current data
                            </p>
                        </div>

                        {/* A4 Document Container */}
                        <div style={{
                            width: '100%',
                            maxWidth: '794px', // A4 width at 96 DPI
                            margin: '0 auto',
                            backgroundColor: 'white',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #E5E7EB',
                            position: 'relative'
                        }}>
                            {/* Document Content */}
                            <div style={{
                                width: '100%',
                                minHeight: '1000px', // A4 height approx at 96 DPI
                                backgroundColor: 'white',
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <iframe
                                    ref={iframeRef}
                                    style={{
                                        width: '100%',
                                        height: '1123px',
                                        border: 'none',
                                        overflow: 'auto'
                                    }}
                                    title="Document Preview"
                                />
                            </div>

                            {/* Subtle page indicator */}
                            <div style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '15px',
                                fontSize: '10px',
                                color: '#bbb',
                                fontFamily: 'monospace'
                            }}>
                                Page 1
                            </div>
                        </div>

                        {generatedDocument && (
                            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => downloadDocument('pdf')}
                                    style={{
                                        flex: 1,
                                        padding: '12px 24px',
                                        backgroundColor: '#10B981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Download size={16} />
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => downloadDocument('docx')}
                                    style={{
                                        flex: 1,
                                        padding: '12px 24px',
                                        backgroundColor: '#3B82F6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Download size={16} />
                                    Download DOCX
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateDocument;