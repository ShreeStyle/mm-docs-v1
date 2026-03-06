import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Filter, Eye, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import { getApiUrl } from '../config/api';

const MyDocuments = () => {
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/documents');
            setDocs(response);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = (doc) => {
        navigate(`/document/editor/${doc._id}`);
    };

    const handleDownloadDocument = async (docId, format = 'pdf') => {
        try {
            const token = localStorage.getItem('token');
            const url = getApiUrl(`/api/documents/${docId}/${format === 'pdf' ? 'download' : 'download-docx'}`);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            const doc = docs.find(d => d._id === docId);
            const fileName = doc ? doc.title.replace(/[^a-z0-9]/gi, '_') : 'document';
            a.download = `${fileName}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download document');
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '32px', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>
                    <Loader2 size={48} color="#F97316" style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '16px', color: '#6B7280' }}>Loading documents...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: isMobile ? '16px' : '32px', backgroundColor: '#F8F9FB', minHeight: '100vh' }}>
            <button
                onClick={() => navigate('/dashboard')}
                style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#6B7280',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '24px',
                    padding: '8px 0'
                }}
            >
                <ArrowLeft size={16} />
                Back to Dashboard
            </button>

            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '16px' : '0',
                marginBottom: '32px'
            }}>
                <div>
                    <h2 style={{
                        fontSize: isMobile ? '22px' : '28px',
                        fontWeight: '700',
                        color: '#111827',
                        margin: 0
                    }}>My Documents</h2>
                    <p style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        margin: '4px 0 0 0'
                    }}>Manage and organize your generated documents</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                    <button style={{
                        padding: '10px 16px',
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#6B7280',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Filter size={16} />
                        Filter
                    </button>
                    <button
                        onClick={() => navigate('/documents/create')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#F97316',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={16} />
                        New Document
                    </button>
                </div>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                {docs.length > 0 ? (
                    <div>
                        {!isMobile && <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                            gap: '16px',
                            padding: '16px 24px',
                            backgroundColor: '#F9FAFB',
                            borderBottom: '1px solid #E5E7EB',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6B7280',
                            textTransform: 'uppercase'
                        }}>
                            <div>Document Name</div>
                            <div>Category</div>
                            <div>Created Date</div>
                            <div>Status</div>
                            <div>Actions</div>
                        </div>}

                        {docs.map((doc, index) => (
                            <div
                                key={doc._id || index}
                                style={{
                                    display: isMobile ? 'flex' : 'grid',
                                    flexDirection: isMobile ? 'column' : undefined,
                                    gridTemplateColumns: isMobile ? undefined : '2fr 1fr 1fr 1fr 1fr',
                                    gap: '16px',
                                    padding: isMobile ? '16px' : '16px 24px',
                                    borderBottom: index < docs.length - 1 ? '1px solid #F3F4F6' : 'none',
                                    alignItems: isMobile ? undefined : 'center'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        backgroundColor: '#FEF3E2',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FileText size={20} color="#F97316" />
                                    </div>
                                    <div>
                                        <p style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#111827',
                                            margin: 0
                                        }}>{doc.title}</p>
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#6B7280',
                                            margin: '2px 0 0 0'
                                        }}>{doc.type?.replace(/_/g, ' ') || 'Document'}</p>
                                    </div>
                                </div>

                                <div style={{
                                    backgroundColor: '#EFF6FF',
                                    color: '#1D4ED8',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    textTransform: 'capitalize',
                                    width: 'fit-content'
                                }}>
                                    {doc.type?.includes('hr') ? 'HR' :
                                        doc.type?.includes('legal') ? 'Legal' :
                                            doc.type?.includes('sales') ? 'Sales' :
                                                doc.type?.includes('finance') ? 'Finance' : 'Other'}
                                </div>

                                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                                    {new Date(doc.createdAt).toLocaleDateString()}
                                </div>

                                <div style={{
                                    backgroundColor: '#DCFCE7',
                                    color: '#166534',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textAlign: 'center',
                                    width: 'fit-content'
                                }}>
                                    Completed
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleViewDocument(doc)}
                                        style={{
                                            padding: '6px',
                                            backgroundColor: 'transparent',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            color: '#6B7280',
                                            transition: 'all 0.2s ease'
                                        }}
                                        title="View Document"
                                    >
                                        <Eye size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDownloadDocument(doc._id, 'pdf')}
                                        style={{
                                            padding: '6px',
                                            backgroundColor: 'transparent',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            color: '#6B7280',
                                            transition: 'all 0.2s ease'
                                        }}
                                        title="Download PDF"
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        padding: '80px 24px',
                        textAlign: 'center',
                        color: '#6B7280'
                    }}>
                        <FileText size={64} color="#D1D5DB" style={{ marginBottom: '24px' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>No documents yet</h3>
                        <p style={{ fontSize: '14px', margin: '0 0 24px 0' }}>Create your first document to get started</p>
                        <button
                            onClick={() => navigate('/documents/create')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#F97316',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            Create Document
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDocuments;
