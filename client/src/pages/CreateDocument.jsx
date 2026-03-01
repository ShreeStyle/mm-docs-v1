import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Download, Eye, Loader2 } from 'lucide-react';
import Handlebars from 'handlebars';
import { api } from '../utils/api';

const CreateDocument = () => {
    const { templateId } = useParams();
    const navigate = useNavigate();

    const [template, setTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [generatedDocument, setGeneratedDocument] = useState(null);
    const [error, setError] = useState(null);

    // Fetch template data on component mount
    useEffect(() => {
        if (templateId) {
            fetchTemplate();
        } else {
            setError('No template ID provided');
            setLoading(false);
        }
    }, [templateId]);

    const fetchTemplate = async () => {
        try {
            console.log('Fetching template with ID:', templateId);
            setLoading(true);
            const response = await api.get(`/templates/${templateId}`);
            console.log('Template fetch response:', response);

            if (response.success) {
                setTemplate(response.data);
                // Initialize form data with empty values
                const initialFormData = {};
                response.data.requiredFields.forEach(field => {
                    initialFormData[field.fieldName] = '';
                });
                setFormData(initialFormData);
                console.log('Template loaded successfully:', response.data.name);
            } else {
                console.error('Template fetch failed:', response);
                setError('Failed to load template');
            }
        } catch (err) {
            console.error('Error fetching template:', err);
            setError(`Template not found or failed to load: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

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

    const generateDocument = async () => {
        if (!validateForm()) return;

        try {
            setGenerating(true);

            const documentData = {
                type: template.templateId,
                title: `${template.name} - ${formData.candidateName || formData.employeeName || formData.clientName || 'Document'}`,
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
        const commonProps = {
            id: field.fieldName,
            value: formData[field.fieldName] || '',
            onChange: (e) => handleInputChange(field.fieldName, e.target.value),
            placeholder: field.placeholder,
            required: field.required,
            style: {
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
            },
            onFocus: (e) => {
                e.target.style.borderColor = '#F97316';
                e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
            },
            onBlur: (e) => {
                e.target.style.borderColor = '#E5E7EB';
                e.target.style.boxShadow = 'none';
            }
        };

        switch (field.fieldType) {
            case 'textarea':
                return <textarea {...commonProps} rows={4} />;
            case 'select':
                return (
                    <select {...commonProps}>
                        <option value="">Select {field.label}</option>
                        {field.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                );
            case 'date':
                return <input {...commonProps} type="date" />;
            case 'number':
                return <input {...commonProps} type="number" />;
            case 'email':
                return <input {...commonProps} type="email" />;
            default:
                return <input {...commonProps} type="text" />;
        }
    };

    const getPreviewContent = () => {
        if (!template || !template.content) return '';

        let content = template.content;

        // Replace placeholders with form data or professional sample data
        const previewData = {
            // Use form data if available, otherwise use professional sample data
            clientName: formData.clientName || 'ABC Corporation Pvt Ltd',
            clientAddress: new Handlebars.SafeString(formData.clientAddress ? formData.clientAddress.replace(/\n/g, '<br>') : '123 Business Street<br>Mumbai, Maharashtra - 400001<br>India'),
            invoiceNumber: formData.invoiceNumber || 'INV-2024-001',
            invoiceDate: formData.invoiceDate || new Date().toLocaleDateString('en-IN'),
            dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
            totalAmount: formData.totalAmount || '1,18,000',
            serviceDescription: new Handlebars.SafeString(formData.serviceDescription ? formData.serviceDescription.replace(/\n/g, '<br>') : 'Professional Software Development Services'),
            companyName: formData.companyName || 'Your Company Ltd',
            companyAddress: new Handlebars.SafeString(formData.companyAddress ? formData.companyAddress.replace(/\n/g, '<br>') : 'Tech Park, Sector 5<br>Bangalore, Karnataka - 560001<br>India'),
            companyPhone: '+91-9876543210',
            companyEmail: 'billing@yourcompany.com',
            gstNumber: '29ABCDE1234F1Z5',
            clientPhone: '+91-9876543211',
            clientEmail: 'contact@abccorp.com',
            clientGST: '27ABCDE5678G1Z2',
            baseAmount: formData.totalAmount ? (parseFloat(formData.totalAmount.replace(/,/g, '')) * 0.85).toLocaleString('en-IN') : '1,00,000',
            taxAmount: formData.totalAmount ? (parseFloat(formData.totalAmount.replace(/,/g, '')) * 0.15).toLocaleString('en-IN') : '18,000',
            subtotal: formData.totalAmount ? (parseFloat(formData.totalAmount.replace(/,/g, '')) * 0.85).toLocaleString('en-IN') : '1,00,000',
            taxRate: '18',
            currentDate: new Date().toLocaleDateString('en-IN'),
            paymentTerms: 'Net 30 days from invoice date',
            bankDetails: 'HDFC Bank - A/c: 1234567890, IFSC: HDFC0001234',
            upiId: 'yourcompany@paytm',
            notes: 'Thank you for choosing our services. We look forward to continued business.',
            quantity: '1',
            rate: formData.totalAmount || '1,18,000',
            // Additional fields for other templates
            candidateName: formData.candidateName || 'John Doe',
            employeeName: formData.employeeName || 'Jane Smith',
            position: formData.position || 'Senior Software Engineer',
            department: formData.department || 'Engineering',
            salary: formData.salary || '18,00,000',
            startDate: formData.startDate || '2024-04-01',
            appointmentDate: formData.appointmentDate || '2024-04-01',
            reportingTo: formData.reportingTo || 'Engineering Manager',
            workLocation: formData.workLocation || 'Bangalore Office',
            partyName: formData.partyName || 'Business Partner Corp',
            effectiveDate: formData.effectiveDate || '2024-03-01',
            duration: formData.duration || '2',

            // Adding a default items array to make the invoice look good
            items: [
                {
                    description: formData.serviceDescription || 'Professional Software Development Services - Core Product',
                    quantity: 1,
                    rate: formData.totalAmount ? (parseFloat(formData.totalAmount.replace(/,/g, '')) * 0.85 * 0.6).toLocaleString('en-IN') : '60,000',
                    amount: formData.totalAmount ? (parseFloat(formData.totalAmount.replace(/,/g, '')) * 0.85 * 0.6).toLocaleString('en-IN') : '60,000'
                },
                {
                    description: 'UI/UX Design Services - Consultation',
                    quantity: 1,
                    rate: formData.totalAmount ? (parseFloat(formData.totalAmount.replace(/,/g, '')) * 0.85 * 0.4).toLocaleString('en-IN') : '40,000',
                    amount: formData.totalAmount ? (parseFloat(formData.totalAmount.replace(/,/g, '')) * 0.85 * 0.4).toLocaleString('en-IN') : '40,000'
                }
            ]
        };

        try {
            // Use Handlebars to compile the layout
            const compiledTemplate = Handlebars.compile(content);
            const html = compiledTemplate(previewData);
            return html;
        } catch (e) {
            console.error('Error compiling template:', e);
            return '<div style="color: red; padding: 20px;">Error generating preview. Template syntax might be invalid.</div>';
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
                        height: 'fit-content'
                    }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                                Document Information
                            </h2>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                Please fill in all required fields marked with *
                            </p>
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

                        <div style={{ display: 'grid', gap: '20px' }}>
                            {template?.requiredFields.map((field) => (
                                <div key={field.fieldName}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '6px'
                                    }}>
                                        {field.label}
                                        {field.required && <span style={{ color: '#EF4444' }}>*</span>}
                                    </label>
                                    {renderFormField(field)}
                                </div>
                            ))}
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
                                    srcDoc={getPreviewContent()}
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