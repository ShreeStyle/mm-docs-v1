import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../utils/api';
import { BASE_URL } from '../config/api';
import Handlebars from 'handlebars';

const TemplatesPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [error, setError] = useState(null);

    // Fetch templates and categories on component mount
    useEffect(() => {
        fetchTemplates();
        fetchCategories();
    }, [selectedCategory]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
            const response = await api.get(`/templates${params}`);

            console.log('🔍 API Response:', response);
            console.log('🔍 Templates received:', response.data?.length);
            console.log('🔍 First 3 templates:', response.data?.slice(0, 3));
            console.log('🔍 Template types:', response.data?.map(t => `${t.name}: ${t.templateType}`));

            if (response.success) {
                // Sort templates by displayOrder (ascending), then by name
                const sortedTemplates = response.data.sort((a, b) => {
                    // Featured templates (with displayOrder) come first
                    if (a.displayOrder && !b.displayOrder) return -1;
                    if (!a.displayOrder && b.displayOrder) return 1;
                    if (a.displayOrder && b.displayOrder) return a.displayOrder - b.displayOrder;
                    // Then sort by name
                    return a.name.localeCompare(b.name);
                });
                
                console.log('🔍 After sorting:', sortedTemplates.map(t => `${t.name} (${t.displayOrder})`));
                
                setTemplates(sortedTemplates);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            setError('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/templates/categories');
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleTemplateSelect = (template) => {
        console.log('Opening template editor for:', template.id || template.templateId);
        
        // Force redirection for specialized GST page
        if (template.id === 'gst_filing_summary' || template.templateId === 'gst_filing_summary') {
            navigate('/gst-filing-summary');
            return;
        }

        // Navigate to Canva-style template editor
        navigate(`/template/editor/${template.templateId}`);
    };

    const handlePreviewTemplate = async (template) => {
        console.log('🔍 Previewing template:', template.templateId);
        console.log('🔍 Template Type:', template.templateType);
        console.log('🔍 PDF URL:', template.pdfUrl);
        try {
            // Fetch full template data including content
            const response = await api.get(`/templates/${template.templateId}`);
            console.log('📦 Template preview response:', response);
            console.log('📦 Response template type:', response.data?.templateType);
            console.log('📦 Response PDF URL:', response.data?.pdfUrl);
            if (response.success) {
                setSelectedTemplate(response.data);
                setPreviewMode(true);
            } else {
                console.error('Template preview failed:', response);
                setError('Failed to load template preview');
            }
        } catch (error) {
            console.error('Error fetching template details:', error);
            setError(`Failed to load template preview: ${error.message}`);
        }
    };

    const closePreview = () => {
        setSelectedTemplate(null);
        setPreviewMode(false);
    };

    // Enhanced Preview Modal Component
    const PreviewModal = ({ template, onClose }) => {
        if (!template) return null;
        
        console.log('🎨 PreviewModal rendering with template:', template.name);
        console.log('🎨 Is PDF template?', template.templateType === 'pdf');
        console.log('🎨 PDF URL:', template.pdfUrl);

        const getPreviewContent = () => {
            const content = template.content || '';

            // Realistic professional sample data
            const previewData = {
                // Invoice specific
                clientName: 'ABC Corporation Pvt Ltd',
                clientAddress: '123 Business Street\nMumbai, Maharashtra - 400001\nIndia',
                invoiceNumber: 'INV-2024-001',
                invoiceDate: new Date().toLocaleDateString('en-IN'),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
                totalAmount: '1,18,000',
                serviceDescription: 'Professional Software Development Services\n• Web Application Development\n• API Integration\n• Database Design & Implementation',
                companyName: 'Your Company Ltd',
                companyAddress: 'Tech Park, Sector 5\nBangalore, Karnataka - 560001\nIndia',
                companyPhone: '+91-9876543210',
                companyEmail: 'billing@yourcompany.com',
                gstNumber: '29ABCDE1234F1Z5',
                clientPhone: '+91-9876543211',
                clientEmail: 'contact@abccorp.com',
                clientGST: '27ABCDE5678G1Z2',
                baseAmount: '1,00,000',
                taxAmount: '18,000',
                subtotal: '1,00,000',
                taxRate: '18',
                paymentTerms: 'Net 30 days from invoice date',
                bankDetails: 'HDFC Bank - A/c: 1234567890, IFSC: HDFC0001234',
                upiId: 'yourcompany@paytm',
                notes: 'Thank you for choosing our services. We look forward to continued business.',
                quantity: '1',
                rate: '1,18,000',

                // HR templates
                candidateName: 'John Doe',
                employeeName: 'Jane Smith',
                position: 'Senior Software Engineer',
                department: 'Engineering',
                salary: '18,00,000',
                startDate: '2024-04-01',
                appointmentDate: '2024-04-01',
                reportingTo: 'Engineering Manager',
                workLocation: 'Bangalore Office',
                joiningDate: '2022-01-15',
                relievingDate: '2024-03-31',
                workDescription: 'Led multiple software development projects, mentored junior developers, and contributed to architectural decisions.',
                violationType: 'Attendance Issues',
                incidentDescription: 'Repeated late arrivals and unauthorized absences affecting team productivity.',
                issueDate: new Date().toLocaleDateString('en-IN'),

                // Legal templates
                partyName: 'Business Partner Corp',
                partyAddress: '456 Corporate Avenue\nDelhi, NCR - 110001\nIndia',
                effectiveDate: '2024-03-01',
                duration: '2',
                purpose: 'Joint software development project for enterprise solutions',

                // Purchase Order
                poDate: new Date().toLocaleDateString('en-IN'),
                poNumber: 'PO-123456',
                vendorCompanyName: 'GLOBAL SUPPLIES INC.',
                vendorContact: 'Sales Dept',
                vendorAddress: '789 Industrial Way\nMumbai, MH 400001',
                shipToName: 'Warehouse Manager',
                shipToAddress: '321 Receiving Lane\nBangalore, KA 560001',
                requisitioner: 'Alice Smith',
                shipVia: 'UPS Ground',
                fob: 'Destination',
                shippingTerms: 'Net 30',
                items: [
                    { itemNumber: 'SKU-001', description: 'Product Alpha', quantity: 10, unitPrice: '150.00', total: '1,500.00' },
                    { itemNumber: 'SKU-002', description: 'Product Beta', quantity: 5, unitPrice: '200.00', total: '1,000.00' }
                ],
                tax: '150.00',
                shipping: '50.00',
                total: '2,700.00',

                currentDate: new Date().toLocaleDateString('en-IN')
            };

            try {
                const compiledTemplate = Handlebars.compile(content);
                return compiledTemplate(previewData);
            } catch (e) {
                console.error('Error rendering template preview:', e);
                return `<div style="color: red; padding: 20px;">Preview Error: ${e.message}</div>`;
            }
        };

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    maxWidth: '900px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    position: 'relative',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    width: '100%'
                }}>
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: '#F3F4F6',
                            color: '#6B7280',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}
                    >
                        ×
                    </button>

                    {/* Template Header */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ fontSize: '32px' }}>
                                {template.icon}
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '24px',
                                    fontWeight: '600',
                                    color: '#111827',
                                    margin: '0 0 4px 0'
                                }}>{template.name}</h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#6B7280',
                                    margin: 0
                                }}>{template.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* For PDF templates, show PDF viewer */}
                    {template.templateType === 'pdf' ? (
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '12px'
                            }}>PDF Preview:</h4>
                            <div style={{
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                height: '600px',
                                backgroundColor: '#F9FAFB'
                            }}>
                                <iframe
                                    src={`${BASE_URL}${template.pdfUrl}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none'
                                    }}
                                    title={template.name}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Required Fields */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '12px'
                                }}>Required Fields:</h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '8px'
                                }}>
                                    {template.requiredFields?.map((field) => (
                                        <div
                                            key={field.fieldName}
                                            style={{
                                                backgroundColor: '#F3F4F6',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            <div style={{ fontWeight: '600', color: '#374151' }}>
                                                {field.label}
                                            </div>
                                            <div style={{ color: '#6B7280', fontSize: '11px' }}>
                                                {field.fieldType} {field.required && '(Required)'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Template Preview */}
                            <div style={{
                                backgroundColor: '#F9FAFB',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                padding: '24px',
                                marginBottom: '24px',
                                maxHeight: '400px',
                                overflow: 'auto'
                            }}>
                                <h4 style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '16px'
                                }}>Document Preview:</h4>

                                <div style={{
                                    fontFamily: 'Times New Roman, serif',
                                    fontSize: '12px',
                                    lineHeight: '1.6',
                                    color: '#000',
                                    backgroundColor: 'white',
                                    padding: '20px',
                                    borderRadius: '4px',
                                    border: '1px solid #E5E7EB'
                                }}>
                                    <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: 'transparent',
                                color: '#6B7280',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                handleTemplateSelect(template);
                                onClose();
                            }}
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
                            {template.templateType === 'pdf' ? 'Download PDF' : 'Use This Template'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const categoryMap = {
        all: 'All Templates',
        hr: 'HR Documents',
        legal: 'Legal Documents',
        sales: 'Sales Documents',
        finance: 'Finance Documents',
        compliance: 'Compliance Documents'
    };

    return (
        <div style={{ padding: '32px', backgroundColor: '#F8F9FB', minHeight: '100vh' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    marginBottom: '24px',
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    color: '#6B7280',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#F3F4F6';
                    e.target.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#E5E7EB';
                }}
            >
                <ArrowLeft size={16} />
                Back to Dashboard
            </button>

            {/* Header */}
            {/* Page Header */}
            <div style={{ marginBottom: '28px' }}>
                <h2 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#111827',
                    margin: '0 0 8px 0'
                }}>Document Templates</h2>
                <p style={{
                    fontSize: '15px',
                    color: '#6B7280',
                    margin: '0 0 16px 0'
                }}>Ready-to-use document structures. Select a template to create a document with your data.</p>
                <p style={{
                    fontSize: '13px',
                    color: '#9CA3AF',
                    margin: 0
                }}>Showing all {templates.length} {templates.length === 1 ? 'template' : 'templates'}</p>
            </div>

            {/* Error Message */}
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

            {/* Category Filter */}
            <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '32px',
                flexWrap: 'wrap'
            }}>
                {Object.entries(categoryMap).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: selectedCategory === key ? '#F97316' : 'white',
                            color: selectedCategory === key ? 'white' : '#6B7280',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {label}
                        {key !== 'all' && categories.find(c => c.id === key) && (
                            <span style={{
                                marginLeft: '8px',
                                backgroundColor: selectedCategory === key ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontSize: '11px'
                            }}>
                                {categories.find(c => c.id === key)?.count || 0}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <Loader2 size={48} className="animate-spin" color="#F97316" />
                    <p style={{ color: '#6B7280', marginTop: '16px' }}>Loading templates...</p>
                </div>
            )}

            {/* Templates Grid */}
            {!loading && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px'
                }}>
                    {templates.map((template) => (
                        <div
                            key={template.templateId}
                            style={{
                                backgroundColor: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '12px',
                                padding: '20px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                            }}
                            onClick={(e) => {
                                handleTemplateSelect(template);
                            }}
                        >
                            {/* Featured Badge */}
                            {template.metadata?.featured && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '20px',
                                    backgroundColor: '#F97316',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
                                    zIndex: 10
                                }}>
                                    ⭐ Featured
                                </div>
                            )}

                            {/* Visual Document Preview */}
                            <div style={{
                                width: '100%',
                                height: '380px',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                overflow: 'hidden',
                                border: '1px solid #E5E7EB',
                                position: 'relative'
                            }}>
                                {(() => {
                                    console.log(`🎯 Rendering ${template.name}: templateType="${template.templateType}", pdfUrl="${template.pdfUrl}"`);
                                    return template.templateType === 'pdf' ? (
                                    <>
                                        {/* PDF Preview */}
                                        <iframe
                                            src={`${BASE_URL}${template.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                border: 'none',
                                                pointerEvents: 'none',
                                                transform: 'scale(1)',
                                                transformOrigin: 'top left'
                                            }}
                                            title={`${template.name} preview`}
                                        />
                                        {/* Small logo badge */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            left: '8px',
                                            backgroundColor: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            color: '#059669',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <span style={{ fontSize: '12px' }}>📄</span> PandaDoc
                                        </div>
                                    </>
                                ) : (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        fontSize: '64px',
                                        opacity: 0.3
                                    }}>
                                        {template.icon}
                                    </div>
                                );
                                })()}
                            </div>

                            {/* Template Title */}
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0 0 8px 0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>{template.name}</h3>

                            {/* Creator info */}
                            <div style={{
                                fontSize: '12px',
                                color: '#9CA3AF',
                                marginBottom: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}>
                                <div>Prepared for: <span style={{ color: '#6B7280', fontWeight: '500' }}>Your Company</span></div>
                                <div>Created by: <span style={{ color: '#6B7280', fontWeight: '500' }}>{categoryMap[template.category]}</span></div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTemplateSelect(template);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: '#F97316',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#EA580C';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#F97316';
                                }}
                            >
                                Download PDF
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && templates.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                        No templates found
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                        Try selecting a different category or initialize templates first
                    </p>
                </div>
            )}

            {/* Preview Modal */}
            {previewMode && selectedTemplate && (
                <PreviewModal
                    template={selectedTemplate}
                    onClose={closePreview}
                />
            )}
        </div>
    );
};

export default TemplatesPage;