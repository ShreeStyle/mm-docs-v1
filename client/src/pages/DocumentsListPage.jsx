import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { 
    FileText, Search, Filter, Download, Eye, Trash2, 
    Plus, Calendar, User, MoreVertical 
} from 'lucide-react';

const DocumentsListPage = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const location = useLocation();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);

    // Determine category from URL path
    const getCategoryFromPath = () => {
        const path = location.pathname;
        if (path.includes('/contracts')) return 'contracts';
        if (path.includes('/agreements')) return 'agreements';
        if (path.includes('/proposals')) return 'proposals';
        if (path.includes('/compliance')) return 'compliance';
        return 'all';
    };

    const category = getCategoryFromPath();

    // Fetch documents
    useEffect(() => {
        const fetchDocuments = async () => {
            if (!token) {
                setError("Please log in to access your documents");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const params = category !== 'all' ? { category } : {};
                const fetchedDocs = await api.get('/documents', { params });
                setDocs(Array.isArray(fetchedDocs) ? fetchedDocs : []);
            } catch (err) {
                console.error("Error fetching documents:", err);
                setError("Failed to load documents. Please try again.");
                setDocs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [token, category]);

    // Filter documents by search query
    const filteredDocs = docs.filter(doc => {
        const query = searchQuery.toLowerCase();
        return (
            doc.title?.toLowerCase().includes(query) ||
            doc.type?.toLowerCase().includes(query) ||
            doc.category?.toLowerCase().includes(query)
        );
    });

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    // Get category display name
    const getCategoryTitle = () => {
        if (category === 'all') return 'All Documents';
        return category.charAt(0).toUpperCase() + category.slice(1);
    };

    // Handle document view
    const handleViewDocument = (docId) => {
        // Navigate to document view or open in new tab
        window.open(`/api/documents/${docId}/view`, '_blank');
    };

    // Handle document download
    const handleDownloadDocument = async (docId, format = 'pdf') => {
        try {
            const url = `/api/documents/${docId}/${format === 'pdf' ? 'download' : 'download-docx'}`;
            window.open(url, '_blank');
        } catch (err) {
            console.error("Download Error:", err);
            alert("Failed to download document. Please try again.");
        }
    };

    // Handle document delete
    const handleDeleteDocument = async (docId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await api.delete(`/documents/${docId}`);
            setDocs(docs.filter(doc => doc._id !== docId));
        } catch (err) {
            console.error("Delete Error:", err);
            alert("Failed to delete document. Please try again.");
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid #E5E7EB',
                        borderTop: '4px solid #F97316',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading documents...</p>
                </div>
                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: '32px',
                textAlign: 'center',
                color: '#EF4444',
                minHeight: '400px'
            }}>
                <p style={{ fontSize: '16px', margin: 0 }}>{error}</p>
            </div>
        );
    }

    return (
        <div style={{
            padding: '32px',
            minHeight: '100vh',
            background: '#F8F9FB'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#111827',
                            margin: '0 0 8px 0'
                        }}>
                            {getCategoryTitle()}
                        </h1>
                        <p style={{
                            fontSize: '14px',
                            color: '#6B7280',
                            margin: 0
                        }}>
                            {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/templates')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: '#F97316',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#EA580C'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#F97316'}
                    >
                        <Plus size={18} />
                        Create Document
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', maxWidth: '500px' }}>
                    <Search
                        size={20}
                        style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9CA3AF'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            height: '44px',
                            paddingLeft: '48px',
                            paddingRight: '16px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#F97316';
                            e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>
            </div>

            {/* Documents Grid */}
            {filteredDocs.length === 0 ? (
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '64px 32px',
                    textAlign: 'center',
                    border: '1px solid #E5E7EB'
                }}>
                    <FileText size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 8px 0'
                    }}>
                        No documents found
                    </h3>
                    <p style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        margin: '0 0 24px 0'
                    }}>
                        {searchQuery 
                            ? 'Try adjusting your search query'
                            : 'Get started by creating your first document'
                        }
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={() => navigate('/dashboard/templates')}
                            style={{
                                padding: '12px 24px',
                                background: '#F97316',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Create Document
                        </button>
                    )}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '24px'
                }}>
                    {filteredDocs.map((doc) => (
                        <div
                            key={doc._id}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '20px',
                                border: '1px solid #E5E7EB',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* Document Icon & Title */}
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: '#FEF3E2',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '12px'
                                }}>
                                    <FileText size={24} color="#F97316" />
                                </div>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#111827',
                                    margin: '0 0 4px 0',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {doc.title || 'Untitled Document'}
                                </h3>
                                <p style={{
                                    fontSize: '13px',
                                    color: '#6B7280',
                                    margin: 0
                                }}>
                                    {doc.type || 'Document'}
                                </p>
                            </div>

                            {/* Document Meta */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '16px',
                                paddingBottom: '16px',
                                borderBottom: '1px solid #F3F4F6'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '12px',
                                    color: '#6B7280'
                                }}>
                                    <Calendar size={14} />
                                    {formatDate(doc.createdAt)}
                                </div>
                                {doc.category && (
                                    <span style={{
                                        padding: '4px 8px',
                                        background: '#F3F4F6',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: '500',
                                        color: '#4B5563',
                                        textTransform: 'capitalize'
                                    }}>
                                        {doc.category}
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{
                                display: 'flex',
                                gap: '8px'
                            }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewDocument(doc._id);
                                    }}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        padding: '10px',
                                        background: '#F97316',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#EA580C'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#F97316'}
                                >
                                    <Eye size={16} />
                                    View
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadDocument(doc._id, 'pdf');
                                    }}
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        padding: '10px',
                                        background: '#F3F4F6',
                                        color: '#4B5563',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
                                >
                                    <Download size={16} />
                                    Download
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteDocument(doc._id);
                                    }}
                                    style={{
                                        padding: '10px',
                                        background: '#FEE2E2',
                                        color: '#EF4444',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#FEE2E2'}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocumentsListPage;
