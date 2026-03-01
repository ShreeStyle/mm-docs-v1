import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

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
            
            if (response.success) {
                setTemplates(response.data);
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
        console.log('Navigating to create document with template:', template.templateId);
        // Navigate to create document page with template ID
        navigate(`/dashboard/create-document/${template.templateId}`);
    };

    const handlePreviewTemplate = async (template) => {
        console.log('Previewing template:', template.templateId);
        try {
            // Fetch full template data including content
            const response = await api.get(`/templates/${template.templateId}`);
            console.log('Template preview response:', response);
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

        const getPreviewContent = () => {
            let content = template.content || '';
            
            // Replace placeholders with realistic professional sample data
            const sampleData = {
                // Invoice specific
                clientName: 'ABC Corporation Pvt Ltd',
                clientAddress: '123 Business Street<br>Mumbai, Maharashtra - 400001<br>India',
                invoiceNumber: 'INV-2024-001',
                invoiceDate: new Date().toLocaleDateString('en-IN'),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
                totalAmount: '1,18,000',
                serviceDescription: 'Professional Software Development Services<br>• Web Application Development<br>• API Integration<br>• Database Design & Implementation',
                companyName: 'Your Company Ltd',
                companyAddress: 'Tech Park, Sector 5<br>Bangalore, Karnataka - 560001<br>India',
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
                partyAddress: '456 Corporate Avenue<br>Delhi, NCR - 110001<br>India',
                effectiveDate: '2024-03-01',
                duration: '2',
                purpose: 'Joint software development project for enterprise solutions',
                
                currentDate: new Date().toLocaleDateString('en-IN')
            };

            // Replace all placeholders with sample data
            Object.keys(sampleData).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                content = content.replace(regex, sampleData[key]);
            });
            
            // Handle Handlebars conditional blocks for preview
            content = content.replace(/{{#if\s+[\w.]+}}([\s\S]*?){{\/if}}/g, '$1');
            content = content.replace(/{{#unless\s+[\w.]+}}([\s\S]*?){{\/unless}}/g, '');
            content = content.replace(/{{else}}[\s\S]*?(?={{\/if}})/g, '');
            content = content.replace(/{{#each\s+[\w.]+}}([\s\S]*?){{\/each}}/g, '$1');
            
            // Remove any remaining Handlebars syntax
            content = content.replace(/{{[^}]*}}/g, '');
            
            // Clean up extra whitespace
            content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

            return content;
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
                            Use This Template
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
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ 
                    fontSize: '28px', 
                    fontWeight: '700', 
                    color: '#111827', 
                    margin: '0 0 8px 0' 
                }}>Document Templates</h2>
                <p style={{ 
                    fontSize: '16px', 
                    color: '#6B7280', 
                    margin: 0 
                }}>Professional templates for all your business document needs</p>
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '24px'
                }}>
                    {templates.map((template) => (
                        <div
                            key={template.templateId}
                            style={{
                                backgroundColor: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            {/* Template Header */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px',
                                marginBottom: '16px'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    backgroundColor: '#FEF3E2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px'
                                }}>
                                    {template.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ 
                                        fontSize: '16px', 
                                        fontWeight: '600', 
                                        color: '#111827', 
                                        margin: '0 0 4px 0' 
                                    }}>{template.name}</h3>
                                    <div style={{
                                        backgroundColor: '#FEF3E2',
                                        color: '#F97316',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        display: 'inline-block'
                                    }}>
                                        {categoryMap[template.category]}
                                    </div>
                                </div>
                            </div>

                            {/* Template Description */}
                            <p style={{ 
                                fontSize: '14px', 
                                color: '#6B7280', 
                                margin: '0 0 16px 0',
                                lineHeight: '1.4'
                            }}>{template.description}</p>

                            {/* Required Fields Count */}
                            <div style={{
                                backgroundColor: '#F9FAFB',
                                border: '1px solid #F3F4F6',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '16px'
                            }}>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: '#9CA3AF',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                }}>Required Fields:</div>
                                <div style={{ 
                                    fontSize: '13px', 
                                    color: '#374151',
                                    fontWeight: '500'
                                }}>{template.requiredFields?.length || 0} fields to fill</div>
                            </div>

                            {/* Usage Stats */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px',
                                fontSize: '12px',
                                color: '#9CA3AF'
                            }}>
                                <span>Used {template.metadata?.usageCount || 0} times</span>
                                <span>v{template.metadata?.version || '1.0.0'}</span>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ 
                                display: 'flex', 
                                gap: '8px' 
                            }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTemplateSelect(template);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        backgroundColor: '#F97316',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Use Template
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePreviewTemplate(template);
                                    }}
                                    style={{
                                        padding: '10px 12px',
                                        backgroundColor: 'transparent',
                                        color: '#F97316',
                                        border: '1px solid #F97316',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <Eye size={16} />
                                </button>
                            </div>
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