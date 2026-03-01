import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
    Search, Home, Inbox, Settings, Layers, Trash2,
    UserPlus, ChevronDown, Plus, Sparkles, Clock,
    Calendar, CheckSquare, MoreHorizontal, ArrowUp,
    Paperclip, AtSign, Globe, FileText, Bot, Zap,
    ChevronRight, Layout, LogOut, BarChart, Star,
    TrendingUp, DollarSign, Shield, Users, Bell,
    Filter, Download, Eye, Edit3, Archive, User
} from 'lucide-react';

const LogoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L22 10L28 4V24C28 26.2091 26.2091 28 24 28H8C5.79086 28 4 26.2091 4 24V4L10 10L16 4Z" fill="#F97316" />
    </svg>
);

export default function Dashboard() {
    const { user, logout, login, token } = useAuth();
    const navigate = useNavigate();

    // Navigation state
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDocType, setSelectedDocType] = useState(null);

    // Data states
    const [docs, setDocs] = useState([]);
    const [brandKit, setBrandKit] = useState(null);
    const [error, setError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDoc, setGeneratedDoc] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form states
    const [genericDocData, setGenericDocData] = useState({
        employeeName: '', position: '', department: '', startDate: '', salary: '', reportingTo: '',
        partyName: '', agreementType: '', effectiveDate: '', terms: '',
        clientName: '', amount: '', dueDate: '', items: '',
        period: '', companyName: '', details: ''
    });

    const [isPro, setIsPro] = useState(user?.plan === 'pro');

    // Document viewing and downloading functions
    const handleViewDocument = (doc) => {
        console.log('Viewing document:', doc);
        setGeneratedDoc(doc);
        setCurrentView('view-document');
    };

    const handleDownloadDocument = async (docId, format = 'pdf') => {
        try {
            const token = localStorage.getItem('token');
            const url = `http://localhost:5000/api/documents/${docId}/${format === 'pdf' ? 'download' : 'download-docx'}`;

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

            // Find the document to get its title
            const doc = docs.find(d => d._id === docId);
            const fileName = doc ? doc.title.replace(/[^a-z0-9]/gi, '_') : 'document';

            a.download = `${fileName}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download Error:", err);
            alert("Failed to download document. Please try again.");
        }
    };
    // Sidebar menu items
    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, active: currentView === 'dashboard' },
        { id: 'create', label: 'Create Document', icon: Plus, active: currentView === 'create' },
        { id: 'documents', label: 'My Documents', icon: FileText, active: currentView === 'documents' },
        { id: 'templates', label: 'Template Library', icon: Layers, active: currentView === 'templates' || ['hr', 'legal', 'sales', 'finance', 'compliance'].includes(currentView) },
        { id: 'compliance-center', label: 'Compliance Center', icon: Shield, active: currentView === 'compliance-center' },
        { id: 'settings', label: 'Settings', icon: Settings, active: currentView === 'settings' }
    ];

    // Load data on component mount
    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setError("Please log in to access your documents");
                return;
            }
            setError(null);
            try {
                const fetchedDocs = await api.get('/documents');
                setDocs(fetchedDocs);
                try {
                    const fetchedBrandKit = await api.get('/brand-kit');
                    setBrandKit(fetchedBrandKit);
                } catch (err) {
                    console.log("No brand kit found or error fetching", err.message);
                }
            } catch (err) {
                console.error("Error fetching documents:", err.message);
                if (err.message.includes('Access Denied') || err.message.includes('Invalid Token')) {
                    setError("Session expired. Please log in again.");
                } else {
                    setError("Error connecting to backend. Please check your connection and try again.");
                }
            }
        };
        fetchData();
    }, [token]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    // Sidebar Component
    const Sidebar = () => (
        <div style={{
            width: '280px',
            height: '100vh',
            backgroundColor: '#FAFAFA',
            borderRight: '1px solid #E5E7EB',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
        }}>
            {/* Logo Section */}
            <div style={{
                padding: '24px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <LogoIcon />
                <div>
                    <h1 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#111827',
                        margin: 0,
                        fontFamily: 'Inter, sans-serif'
                    }}>MM Docs</h1>
                    <p style={{
                        fontSize: '12px',
                        color: '#6B7280',
                        margin: 0,
                        fontWeight: '500'
                    }}>AI Document Platform</p>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav style={{ flex: 1, padding: '24px 16px' }}>
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'templates') {
                                    setSelectedCategory(null);
                                    setSelectedDocType(null);
                                }
                                setGeneratedDoc(null);
                                setCurrentView(item.id);
                            }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                marginBottom: '4px',
                                backgroundColor: item.active ? '#F97316' : 'transparent',
                                color: item.active ? 'white' : '#6B7280',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                                if (!item.active) {
                                    e.target.style.backgroundColor = '#F3F4F6';
                                    e.target.style.color = '#374151';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!item.active) {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = '#6B7280';
                                }
                            }}
                        >
                            <Icon size={20} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Profile Section */}
            <div style={{
                padding: '24px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#F97316',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '16px'
                }}>
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0
                    }}>{user?.name || 'User'}</p>
                    <p style={{
                        fontSize: '12px',
                        color: '#6B7280',
                        margin: 0
                    }}>{isPro ? 'Pro Plan' : 'Free Plan'}</p>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#6B7280',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#F3F4F6';
                        e.target.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6B7280';
                    }}
                >
                    <LogOut size={16} />
                </button>
            </div>
        </div>
    );
    // Top Header Component
    const TopHeader = () => (
        <div style={{
            height: '80px',
            backgroundColor: 'white',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div>
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0,
                    textTransform: 'capitalize'
                }}>{currentView === 'dashboard' ? 'Dashboard' : currentView.replace(/([A-Z])/g, ' $1').trim()}</h1>
                {currentView === 'dashboard' && (
                    <p style={{
                        fontSize: '16px',
                        color: '#6B7280',
                        margin: '4px 0 0 0'
                    }}>Good evening, {user?.name?.split(' ')[0]} – MM Docs Excellence & Strategic Mastery</p>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Search Bar */}
                <div style={{
                    position: 'relative',
                    width: '320px'
                }}>
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
                        placeholder="Search documents, templates..."
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
                            backgroundColor: '#F9FAFB',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#F97316';
                            e.target.style.backgroundColor = 'white';
                            e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.backgroundColor = '#F9FAFB';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                {/* Notifications */}
                <button style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                }}>
                    <Bell size={20} color="#6B7280" />
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#EF4444',
                        borderRadius: '50%'
                    }} />
                </button>

                {/* Profile Avatar */}
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: '#F97316',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer'
                }}>
                    {user?.name?.charAt(0) || 'U'}
                </div>
            </div>
        </div>
    );
    // Dashboard Overview Page
    const DashboardOverview = () => (
        <div style={{ padding: '32px' }}>
            {/* Overview Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px',
                marginBottom: '32px'
            }}>
                {/* Total Documents */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: '#FEF3E2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FileText size={24} color="#F97316" />
                        </div>
                        <div style={{
                            backgroundColor: docs.length > 0 ? '#DCFCE7' : '#F3F4F6',
                            color: docs.length > 0 ? '#166534' : '#6B7280',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {docs.length > 0 ? '+12%' : 'Start'}
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                        {docs.length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
                        Total Documents Created
                    </div>
                </div>

                {/* Revenue Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: '#DCFCE7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <DollarSign size={24} color="#16A34A" />
                        </div>
                        <div style={{
                            backgroundColor: '#DCFCE7',
                            color: '#166534',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            +8%
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                        ₹{isPro ? '999' : '0'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
                        Monthly Revenue
                    </div>
                </div>

                {/* Most Used Category */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: '#EDE9FE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Star size={24} color="#7C3AED" />
                        </div>
                        <div style={{
                            backgroundColor: '#DCFCE7',
                            color: '#166534',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            Popular
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                        {docs.length > 0 ? 'Sales' : 'None'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
                        Most Used Category
                    </div>
                </div>

                {/* Time Saved */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: '#FEF3E2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Clock size={24} color="#F97316" />
                        </div>
                        <div style={{
                            backgroundColor: '#DCFCE7',
                            color: '#166534',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            +22%
                        </div>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                        {Math.round(docs.length * 2)}h
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
                        Estimated Time Saved
                    </div>
                </div>
            </div>
            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                {/* Recent Activity */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB' }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: 0
                        }}>Recent Activity</h3>
                        <p style={{
                            fontSize: '14px',
                            color: '#6B7280',
                            margin: '4px 0 0 0'
                        }}>Your latest document generation activity</p>
                    </div>

                    <div style={{ padding: '0' }}>
                        {docs.length > 0 ? (
                            docs.slice(0, 5).map((doc, index) => (
                                <div
                                    key={doc._id || index}
                                    onClick={() => handleViewDocument(doc)}
                                    style={{
                                        padding: '16px 24px',
                                        borderBottom: index < 4 ? '1px solid #F3F4F6' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
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
                                            }}>{doc.type?.replace(/_/g, ' ') || 'Document'} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div style={{
                                        backgroundColor: '#DCFCE7',
                                        color: '#166534',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        Completed
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{
                                padding: '48px 24px',
                                textAlign: 'center',
                                color: '#6B7280'
                            }}>
                                <FileText size={48} color="#D1D5DB" style={{ marginBottom: '16px' }} />
                                <p style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 8px 0' }}>No documents yet</p>
                                <p style={{ fontSize: '14px', margin: 0 }}>Create your first document to see activity here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    height: 'fit-content'
                }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB' }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#111827',
                            margin: 0
                        }}>Quick Actions</h3>
                        <p style={{
                            fontSize: '14px',
                            color: '#6B7280',
                            margin: '4px 0 0 0'
                        }}>Popular document templates</p>
                    </div>

                    <div style={{ padding: '24px' }}>
                        <button
                            onClick={() => setCurrentView('create')}
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: '#F97316',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#EA580C';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#F97316';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            <Plus size={20} />
                            New Document
                        </button>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { label: 'Create Offer Letter', category: 'hr', type: 'offer_letter' },
                                { label: 'Generate Invoice', category: 'finance', type: 'invoice' },
                                { label: 'Create NDA', category: 'legal', type: 'nda' },
                                { label: 'Business Proposal', category: 'sales', type: 'proposal' }
                            ].map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentView('create');
                                        setSelectedCategory(action.category);
                                        setSelectedDocType(action.type);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        backgroundColor: 'transparent',
                                        color: '#6B7280',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = '#F97316';
                                        e.target.style.color = '#F97316';
                                        e.target.style.backgroundColor = '#FEF3E2';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = '#E5E7EB';
                                        e.target.style.color = '#6B7280';
                                        e.target.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    // Create Document Page
    const CreateDocumentPage = () => (
        <div style={{ padding: '32px' }}>
            {!selectedCategory ? (
                <>
                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                        <h2 style={{
                            fontSize: '32px',
                            fontWeight: '700',
                            color: '#111827',
                            margin: '0 0 8px 0'
                        }}>Select Category</h2>
                        <p style={{
                            fontSize: '18px',
                            color: '#6B7280',
                            margin: 0
                        }}>Choose the document category to get started</p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '24px',
                        maxWidth: '1200px',
                        margin: '0 auto'
                    }}>
                        {[
                            { id: 'hr', label: 'HR', icon: UserPlus, color: '#3B82F6', bgColor: '#EFF6FF' },
                            { id: 'legal', label: 'Legal', icon: Shield, color: '#10B981', bgColor: '#ECFDF5' },
                            { id: 'sales', label: 'Sales', icon: TrendingUp, color: '#F59E0B', bgColor: '#FFFBEB' },
                            { id: 'finance', label: 'Finance', icon: DollarSign, color: '#EF4444', bgColor: '#FEF2F2' },
                            { id: 'compliance', label: 'Compliance', icon: CheckSquare, color: '#8B5CF6', bgColor: '#F3E8FF' }
                        ].map((category) => {
                            const Icon = category.icon;
                            return (
                                <div
                                    key={category.id}
                                    onClick={() => {
                                        setSelectedCategory(category.id);
                                        setCurrentView('templates');
                                    }}
                                    style={{
                                        backgroundColor: 'white',
                                        border: '2px solid #E5E7EB',
                                        borderRadius: '20px',
                                        padding: '32px 24px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                        minHeight: '180px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = '#F97316';
                                        e.target.style.transform = 'translateY(-4px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = '#E5E7EB';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                    }}
                                >
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '16px',
                                        backgroundColor: category.bgColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '16px'
                                    }}>
                                        <Icon size={32} color={category.color} />
                                    </div>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#111827',
                                        margin: 0
                                    }}>{category.label}</h3>
                                </div>
                            );
                        })}
                    </div>

                    {/* AI Suggestions */}
                    <div style={{ marginTop: '48px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <h3 style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0 0 8px 0'
                            }}>AI Suggestions</h3>
                            <p style={{
                                fontSize: '16px',
                                color: '#6B7280',
                                margin: 0
                            }}>Popular templates to get you started</p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '24px',
                            maxWidth: '800px',
                            margin: '0 auto'
                        }}>
                            {[
                                { label: 'Create Offer Letter', category: 'hr', type: 'offer_letter', icon: FileText },
                                { label: 'Generate Invoice', category: 'finance', type: 'invoice', icon: DollarSign },
                                { label: 'Business Proposal', category: 'sales', type: 'proposal', icon: TrendingUp },
                                { label: 'Generate NDA', category: 'legal', type: 'nda', icon: Shield }
                            ].map((suggestion, index) => {
                                const Icon = suggestion.icon;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedCategory(suggestion.category);
                                            setSelectedDocType(suggestion.type);
                                            setCurrentView('templates');
                                        }}
                                        style={{
                                            backgroundColor: 'white',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '16px',
                                            padding: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'left'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = '#F97316';
                                            e.target.style.backgroundColor = '#FEF3E2';
                                            e.target.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = '#E5E7EB';
                                            e.target.style.backgroundColor = 'white';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            backgroundColor: '#FEF3E2',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Icon size={24} color="#F97316" />
                                        </div>
                                        <div>
                                            <h4 style={{
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: '#111827',
                                                margin: 0
                                            }}>{suggestion.label}</h4>
                                            <p style={{
                                                fontSize: '14px',
                                                color: '#6B7280',
                                                margin: '4px 0 0 0'
                                            }}>Generate professional {suggestion.label.toLowerCase()}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
                <div>
                    <button
                        onClick={() => setSelectedCategory(null)}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#6B7280',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginBottom: '24px',
                            padding: '8px 0'
                        }}
                    >
                        ← Back to Categories
                    </button>

                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 8px 0',
                        textTransform: 'capitalize'
                    }}>
                        {selectedCategory} Documents
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: '#6B7280',
                        margin: '0 0 32px 0'
                    }}>Choose a document type to generate</p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '12px'
                    }}>
                        {(() => {
                            const documentTypes = {
                                hr: [
                                    { id: 'offer_letter', label: 'Offer Letter', icon: '📄', description: 'Employment offer letter' },
                                    { id: 'appointment_letter', label: 'Appointment Letter', icon: '📋', description: 'Official appointment letter' },
                                    { id: 'onboarding_letter', label: 'Onboarding Letter', icon: '👋', description: 'Welcome and onboarding letter' },
                                    { id: 'experience_certificate', label: 'Experience Certificate', icon: '🏆', description: 'Work experience certificate' },
                                    { id: 'warning_letter', label: 'Warning Letter', icon: '⚠️', description: 'Employee warning letter' }
                                ],
                                legal: [
                                    { id: 'nda', label: 'NDA', icon: '🔒', description: 'Non-disclosure agreement' },
                                    { id: 'service_agreement', label: 'Service Agreement', icon: '📝', description: 'Service contract agreement' },
                                    { id: 'terms_of_service', label: 'Terms of Service', icon: '📜', description: 'Terms and conditions' },
                                    { id: 'privacy_policy', label: 'Privacy Policy', icon: '🛡️', description: 'Privacy policy document' },
                                    { id: 'mou', label: 'MOU', icon: '🤝', description: 'Memorandum of understanding' }
                                ],
                                sales: [
                                    { id: 'business_proposal', label: 'Business Proposal', icon: '💼', description: 'Business proposal document' },
                                    { id: 'quotation', label: 'Quotation', icon: '💰', description: 'Price quotation' },
                                    { id: 'sales_contract', label: 'Sales Contract', icon: '📋', description: 'Sales agreement contract' },
                                    { id: 'partnership_agreement', label: 'Partnership Agreement', icon: '🤝', description: 'Business partnership agreement' }
                                ],
                                finance: [
                                    { id: 'invoice', label: 'Invoice', icon: '🧾', description: 'Standard invoice' },
                                    { id: 'purchase_order', label: 'Purchase Order', icon: '📦', description: 'Purchase order document' },
                                    { id: 'receipt', label: 'Receipt', icon: '🧾', description: 'Payment receipt' },
                                    { id: 'gst_invoice', label: 'GST Invoice', icon: '📊', description: 'GST compliant invoice' },
                                    { id: 'credit_note', label: 'Credit Note', icon: '💳', description: 'Credit note document' }
                                ],
                                compliance: [
                                    { id: 'gst_filing_summary', label: 'GST Filing Summary', icon: '📈', description: 'GST filing summary report' },
                                    { id: 'audit_report', label: 'Audit Report', icon: '🔍', description: 'Financial audit report' },
                                    { id: 'policy_document', label: 'Policy Document', icon: '📋', description: 'Company policy document' },
                                    { id: 'regulatory_filing', label: 'Regulatory Filing', icon: '🏛️', description: 'Regulatory compliance filing' }
                                ]
                            };

                            const currentTypes = documentTypes[selectedCategory] || [];

                            return currentTypes.map((docType) => (
                                <div
                                    key={docType.id}
                                    onClick={() => setSelectedDocType(docType.id)}
                                    style={{
                                        backgroundColor: 'white',
                                        border: selectedDocType === docType.id ? '2px solid #F97316' : '2px solid #E5E7EB',
                                        borderRadius: '12px',
                                        padding: '20px 16px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: selectedDocType === docType.id ? '0 4px 12px rgba(249, 115, 22, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                                        minHeight: '140px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: selectedDocType === docType.id ? '#FEF3E2' : 'white'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedDocType !== docType.id) {
                                            e.target.style.borderColor = '#F97316';
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedDocType !== docType.id) {
                                            e.target.style.borderColor = '#E5E7EB';
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                        }
                                    }}
                                >
                                    <div style={{
                                        fontSize: '32px',
                                        marginBottom: '12px'
                                    }}>
                                        {docType.icon}
                                    </div>
                                    <h3 style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#111827',
                                        margin: '0 0 6px 0',
                                        textAlign: 'center',
                                        lineHeight: '1.2'
                                    }}>{docType.label}</h3>
                                    <p style={{
                                        fontSize: '11px',
                                        color: '#6B7280',
                                        margin: 0,
                                        textAlign: 'center',
                                        lineHeight: '1.3'
                                    }}>{docType.description}</p>
                                </div>
                            ));
                        })()}
                    </div>

                    {selectedDocType && (
                        <div style={{
                            marginTop: '32px',
                            padding: '24px',
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}>
                                <div>
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#111827',
                                        margin: '0 0 4px 0'
                                    }}>Ready to Generate</h3>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#6B7280',
                                        margin: 0
                                    }}>
                                        Selected: {(() => {
                                            const allTypes = {
                                                hr: [
                                                    { id: 'offer_letter', label: 'Offer Letter' },
                                                    { id: 'appointment_letter', label: 'Appointment Letter' },
                                                    { id: 'onboarding_letter', label: 'Onboarding Letter' },
                                                    { id: 'experience_certificate', label: 'Experience Certificate' },
                                                    { id: 'warning_letter', label: 'Warning Letter' }
                                                ],
                                                legal: [
                                                    { id: 'nda', label: 'NDA - Non Disclosure Agreement' },
                                                    { id: 'service_agreement', label: 'Service Agreement' },
                                                    { id: 'terms_of_service', label: 'Terms of Service' },
                                                    { id: 'privacy_policy', label: 'Privacy Policy' },
                                                    { id: 'mou', label: 'MOU - Memorandum of Understanding' }
                                                ],
                                                sales: [
                                                    { id: 'business_proposal', label: 'Business Proposal' },
                                                    { id: 'quotation', label: 'Quotation' },
                                                    { id: 'sales_contract', label: 'Sales Contract' },
                                                    { id: 'partnership_agreement', label: 'Partnership Agreement' }
                                                ],
                                                finance: [
                                                    { id: 'invoice', label: 'Invoice' },
                                                    { id: 'purchase_order', label: 'Purchase Order' },
                                                    { id: 'receipt', label: 'Receipt' },
                                                    { id: 'gst_invoice', label: 'GST Invoice' },
                                                    { id: 'credit_note', label: 'Credit Note' }
                                                ],
                                                compliance: [
                                                    { id: 'gst_filing_summary', label: 'GST Filing Summary' },
                                                    { id: 'audit_report', label: 'Audit Report' },
                                                    { id: 'policy_document', label: 'Policy Document' },
                                                    { id: 'regulatory_filing', label: 'Regulatory Filing' }
                                                ]
                                            };
                                            const currentTypes = allTypes[selectedCategory] || [];
                                            const selectedType = currentTypes.find(type => type.id === selectedDocType);
                                            return selectedType ? selectedType.label : selectedDocType;
                                        })()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setCurrentView('generate-document');
                                    }}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#F97316',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#EA580C';
                                        e.target.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#F97316';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <Sparkles size={16} />
                                    Generate Document
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
    // My Documents Page
    const MyDocumentsPage = () => {
        console.log('Documents in MyDocumentsPage:', docs);

        return (
            <div style={{ padding: '32px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#111827',
                            margin: 0
                        }}>My Documents</h2>
                        <p style={{
                            fontSize: '16px',
                            color: '#6B7280',
                            margin: '4px 0 0 0'
                        }}>Manage and organize your generated documents</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
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
                            onClick={() => setCurrentView('create')}
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
                            {/* Table Header */}
                            <div style={{
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
                            </div>

                            {/* Table Rows */}
                            {docs.map((doc, index) => (
                                <div
                                    key={doc._id || index}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                                        gap: '16px',
                                        padding: '16px 24px',
                                        borderBottom: index < docs.length - 1 ? '1px solid #F3F4F6' : 'none',
                                        alignItems: 'center'
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
                                        textTransform: 'capitalize'
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
                                        textAlign: 'center'
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
                                            onMouseEnter={(e) => {
                                                e.target.style.borderColor = '#F97316';
                                                e.target.style.color = '#F97316';
                                                e.target.style.backgroundColor = '#FEF3E2';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.borderColor = '#E5E7EB';
                                                e.target.style.color = '#6B7280';
                                                e.target.style.backgroundColor = 'transparent';
                                            }}
                                            title="View Document"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDownloadDocument(doc._id, 'pdf')}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                // Create a simple context menu for format selection
                                                const menu = document.createElement('div');
                                                menu.style.cssText = `
                                                    position: fixed;
                                                    top: ${e.clientY}px;
                                                    left: ${e.clientX}px;
                                                    background: white;
                                                    border: 1px solid #E5E7EB;
                                                    border-radius: 8px;
                                                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                                                    z-index: 1000;
                                                    padding: 8px 0;
                                                    min-width: 120px;
                                                `;

                                                const pdfOption = document.createElement('button');
                                                pdfOption.textContent = 'Download PDF';
                                                pdfOption.style.cssText = `
                                                    width: 100%;
                                                    padding: 8px 16px;
                                                    border: none;
                                                    background: transparent;
                                                    text-align: left;
                                                    cursor: pointer;
                                                    font-size: 14px;
                                                `;
                                                pdfOption.onclick = () => {
                                                    handleDownloadDocument(doc._id, 'pdf');
                                                    document.body.removeChild(menu);
                                                };

                                                const docxOption = document.createElement('button');
                                                docxOption.textContent = 'Download DOCX';
                                                docxOption.style.cssText = `
                                                    width: 100%;
                                                    padding: 8px 16px;
                                                    border: none;
                                                    background: transparent;
                                                    text-align: left;
                                                    cursor: pointer;
                                                    font-size: 14px;
                                                `;
                                                docxOption.onclick = () => {
                                                    handleDownloadDocument(doc._id, 'docx');
                                                    document.body.removeChild(menu);
                                                };

                                                menu.appendChild(pdfOption);
                                                menu.appendChild(docxOption);
                                                document.body.appendChild(menu);

                                                // Remove menu when clicking elsewhere
                                                const removeMenu = (e) => {
                                                    if (!menu.contains(e.target)) {
                                                        document.body.removeChild(menu);
                                                        document.removeEventListener('click', removeMenu);
                                                    }
                                                };
                                                setTimeout(() => document.addEventListener('click', removeMenu), 0);
                                            }}
                                            style={{
                                                padding: '6px',
                                                backgroundColor: 'transparent',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                color: '#6B7280',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.borderColor = '#10B981';
                                                e.target.style.color = '#10B981';
                                                e.target.style.backgroundColor = '#ECFDF5';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.borderColor = '#E5E7EB';
                                                e.target.style.color = '#6B7280';
                                                e.target.style.backgroundColor = 'transparent';
                                            }}
                                            title="Download PDF (right-click for more options)"
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
                                onClick={() => {
                                    setCurrentView('create');
                                    setSelectedCategory(null);
                                    setSelectedDocType(null);
                                }}
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
    // Compliance Center Page
    const ComplianceCenterPage = () => (
        <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0
                }}>Compliance Center</h2>
                <p style={{
                    fontSize: '16px',
                    color: '#6B7280',
                    margin: '4px 0 0 0'
                }}>AI-powered compliance monitoring and validation</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                {/* Compliance Score */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '32px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: '50%',
                        background: 'conic-gradient(#10B981 0deg 331.2deg, #E5E7EB 331.2deg 360deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px auto',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>92</div>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>/ 100</div>
                        </div>
                    </div>

                    <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 8px 0'
                    }}>Compliance Score</h3>
                    <p style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        margin: '0 0 16px 0'
                    }}>Overall compliance rating</p>

                    <div style={{
                        backgroundColor: '#DCFCE7',
                        color: '#166534',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-block'
                    }}>
                        +5 from last month
                    </div>
                </div>

                {/* Compliance Checks */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    padding: '32px'
                }}>
                    <h3 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 24px 0'
                    }}>Compliance Checks</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { label: 'GST Format Check', status: 'passed', description: 'All invoices follow GST format requirements' },
                            { label: 'Basic Legal Structure', status: 'passed', description: 'Legal documents have proper structure' },
                            { label: 'HR Policy Status', status: 'review', description: 'Some HR policies need review' },
                            { label: 'Data Protection', status: 'passed', description: 'Privacy policies are compliant' },
                            { label: 'Signature Validation', status: 'passed', description: 'Digital signatures are valid' }
                        ].map((check, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '16px',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '12px',
                                border: '1px solid #F3F4F6'
                            }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor:
                                        check.status === 'passed' ? '#10B981' :
                                            check.status === 'review' ? '#F59E0B' : '#EF4444'
                                }} />

                                <div style={{ flex: 1 }}>
                                    <h4 style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#111827',
                                        margin: '0 0 4px 0'
                                    }}>{check.label}</h4>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#6B7280',
                                        margin: 0
                                    }}>{check.description}</p>
                                </div>

                                <div style={{
                                    backgroundColor:
                                        check.status === 'passed' ? '#DCFCE7' :
                                            check.status === 'review' ? '#FEF3C7' : '#FEE2E2',
                                    color:
                                        check.status === 'passed' ? '#166534' :
                                            check.status === 'review' ? '#92400E' : '#DC2626',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textTransform: 'capitalize'
                                }}>
                                    {check.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // Document Generation Page with Form and Live Preview
    const DocumentGenerationPage = () => {
        const [formData, setFormData] = useState({});
        const [isGenerating, setIsGenerating] = useState(false);

        // Get form fields based on document type
        const getFormFields = () => {
            const commonFields = [
                { id: 'companyName', label: 'Company Name', type: 'text', placeholder: 'e.g. Acme Technologies Pvt. Ltd.', required: true },
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
                    { id: 'position', label: 'Position', type: 'text', placeholder: 'e.g. Senior Software Engineer', required: true },
                    { id: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Engineering', required: true },
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

                // Legal Documents
                nda: [
                    ...commonFields,
                    { id: 'partyName', label: 'Other Party Name', type: 'text', placeholder: 'e.g. ABC Corp or Individual Name', required: true },
                    { id: 'partyAddress', label: 'Other Party Address', type: 'textarea', placeholder: 'Complete address of the other party', required: true },
                    { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
                    { id: 'duration', label: 'Duration (Years)', type: 'number', placeholder: 'e.g. 2', required: true },
                    { id: 'purpose', label: 'Purpose/Project', type: 'textarea', placeholder: 'Brief description of the purpose or project', required: true }
                ],
                mou: [
                    ...commonFields,
                    { id: 'partyName', label: 'Other Party Name', type: 'text', placeholder: 'e.g. Partner Company Name', required: true },
                    { id: 'partyAddress', label: 'Other Party Address', type: 'textarea', placeholder: 'Complete address of the other party', required: true },
                    { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
                    { id: 'purpose', label: 'Purpose of MOU', type: 'textarea', placeholder: 'Detailed purpose and scope of understanding', required: true },
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
                    { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'e.g. XYZ Corporation', required: true },
                    { id: 'clientAddress', label: 'Client Address', type: 'textarea', placeholder: 'Complete billing address', required: true },
                    { id: 'invoiceNumber', label: 'Invoice Number', type: 'text', placeholder: 'e.g. INV-2026-001', required: true },
                    { id: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
                    { id: 'dueDate', label: 'Due Date', type: 'date', required: true },
                    { id: 'totalAmount', label: 'Total Amount (₹)', type: 'number', placeholder: 'e.g. 118000', required: true },
                    { id: 'serviceDescription', label: 'Service/Product Description', type: 'textarea', placeholder: 'Detailed description of services or products', required: true }
                ],
                gst_invoice: [
                    ...commonFields,
                    { id: 'gstNumber', label: 'Company GST Number', type: 'text', placeholder: 'e.g. 29ABCDE1234F1Z5', required: true },
                    { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'e.g. XYZ Corporation', required: true },
                    { id: 'clientGST', label: 'Client GST Number', type: 'text', placeholder: 'e.g. 27FGHIJ5678K2L9', required: true },
                    { id: 'clientAddress', label: 'Client Address', type: 'textarea', placeholder: 'Complete billing address', required: true },
                    { id: 'invoiceNumber', label: 'Invoice Number', type: 'text', placeholder: 'e.g. GST-INV-2026-001', required: true },
                    { id: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
                    { id: 'baseAmount', label: 'Base Amount (₹)', type: 'number', placeholder: 'e.g. 100000', required: true },
                    { id: 'serviceDescription', label: 'Service/Product Description', type: 'textarea', placeholder: 'Detailed description for GST compliance', required: true }
                ],

                // Compliance Documents
                audit_report: [
                    ...commonFields,
                    { id: 'auditPeriod', label: 'Audit Period', type: 'text', placeholder: 'e.g. FY 2025-26', required: true },
                    { id: 'auditType', label: 'Audit Type', type: 'select', options: ['Internal Audit', 'External Audit', 'Tax Audit', 'Compliance Audit'], required: true },
                    { id: 'auditorName', label: 'Auditor Name', type: 'text', placeholder: 'e.g. CA Rajesh Kumar', required: true },
                    { id: 'auditDate', label: 'Audit Date', type: 'date', required: true },
                    { id: 'findings', label: 'Key Findings', type: 'textarea', placeholder: 'Summary of audit findings and observations', required: true }
                ]
            };

            return fieldsByType[selectedDocType] || commonFields;
        };

        const handleInputChange = (fieldId, value) => {
            setFormData(prev => ({
                ...prev,
                [fieldId]: value
            }));
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

We are pleased to inform you that you have been appointed as ${formData.position || '[Position]'} in the ${formData.department || '[Department]'} department of ${formData.companyName || '[Company Name]'}, effective from ${formData.startDate || '[Start Date]'}.

Employment Details:
• Position: ${formData.position || '[Position]'}
• Department: ${formData.department || '[Department]'}
• Reporting To: ${formData.reportingTo || '[Reporting Manager]'}
• Work Location: ${formData.workLocation || '[Work Location]'}
• Probation Period: ${formData.probationPeriod || '90 days'}

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
INVOICE

${formData.companyName || '[Company Name]'}
${formData.companyAddress || '[Company Address]'}

BILL TO:
${formData.clientName || '[Client Name]'}
${formData.clientAddress || '[Client Address]'}

Invoice #: ${formData.invoiceNumber || 'INV-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
Invoice Date: ${formData.invoiceDate || currentDate}
Due Date: ${formData.dueDate || '[Due Date]'}

DESCRIPTION:
${formData.serviceDescription || '[Service/Product Description]'}

AMOUNT: ₹${formData.totalAmount ? Number(formData.totalAmount).toLocaleString() : '[Total Amount]'}

PAYMENT TERMS:
${formData.paymentTerms || 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.'}

Thank you for your business!

${formData.companyName || '[Company Name]'}
                    `
                },
                proposal: {
                    title: 'Business Proposal',
                    content: `
BUSINESS PROPOSAL

To: ${formData.clientName || '[Client Name]'}
From: ${formData.companyName || '[Company Name]'}
Date: ${currentDate}

PROJECT: ${formData.projectTitle || '[Project Title]'}

EXECUTIVE SUMMARY:
We are pleased to present this proposal for ${formData.projectTitle || '[Project Title]'}. Our team at ${formData.companyName || '[Company Name]'} is committed to delivering exceptional results within the proposed timeline.

PROJECT DETAILS:
${formData.projectDescription || '[Detailed project scope, deliverables, and methodology will be outlined here]'}

INVESTMENT:
Total Project Value: ₹${formData.projectValue ? Number(formData.projectValue).toLocaleString() : '[Project Value]'}
Timeline: ${formData.timeline || '[Timeline]'}

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

SELLER: ${formData.companyName || '[Company Name]'}
Address: ${formData.companyAddress || '[Company Address]'}

BUYER: ${formData.clientName || '[Client Name]'}
Address: ${formData.clientAddress || '[Client Address]'}

PRODUCT/SERVICE: ${formData.productDescription || '[Product/Service Description]'}

CONTRACT TERMS:
• Total Contract Value: ₹${formData.contractValue ? Number(formData.contractValue).toLocaleString() : '[Contract Value]'}
• Delivery Date: ${formData.deliveryDate || '[Delivery Date]'}
• Payment Terms: ${formData.paymentTerms || '[Payment Terms]'}
• Warranty Period: ${formData.warrantyPeriod || '[Warranty Period]'}

TERMS AND CONDITIONS:
1. This contract is binding upon both parties
2. Any modifications must be in writing and signed by both parties
3. Delivery shall be made to the specified address
4. Payment shall be made as per agreed terms

SIGNATURES:

${formData.companyName || '[Company Name]'}    ${formData.clientName || '[Client Name]'}
_________________________    _________________________
Authorized Signatory          Authorized Signatory
Date: _______________         Date: _______________
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

Dear ${formData.employeeName || '[Employee Name]'},

Welcome to ${formData.companyName || '[Company Name]'}! We are delighted to have you join our ${formData.department || '[Department]'} team as ${formData.position || '[Position]'}.

FIRST DAY INSTRUCTIONS:
• Report Date: ${formData.startDate || '[Start Date]'} at 9:00 AM
• Report to: Main Reception
• Bring: Original documents for verification

ONBOARDING SCHEDULE:
Day 1: Documentation, IT setup, workplace tour, team introductions
Week 1: Department orientation, role-specific training
Month 1: Performance review and goal setting

REQUIRED DOCUMENTS:
• Government-issued photo ID
• Address proof
• Educational certificates
• Previous employment letters
• Passport-size photographs (2 copies)

BENEFITS OVERVIEW:
• Health insurance coverage
• Paid time off and sick leave
• Professional development opportunities
• Employee assistance programs

CONTACT INFORMATION:
HR: hr@${(formData.companyName || 'company').toLowerCase().replace(/\s+/g, '')}.com
IT Support: it@${(formData.companyName || 'company').toLowerCase().replace(/\s+/g, '')}.com

We look forward to a successful journey together. Welcome aboard!

${formData.companyName || '[Company Name]'}
HR Department
                    `
                }
            };

            return previews[selectedDocType] || {
                title: selectedDocType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                content: 'Document preview will appear here as you fill the form...'
            };
        };

        const handleGenerate = async () => {
            setIsGenerating(true);
            try {
                // Validate required fields
                const requiredFields = formFields.filter(field => field.required);
                const missingFields = requiredFields.filter(field => !formData[field.id]);

                if (missingFields.length > 0) {
                    alert(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
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

                    return `${basePrompt}${context.length ? ` ${context.join(', ')}` : ''}${specificDetails.length ? `. Additional details: ${specificDetails.join(', ')}` : ''}. Make it professional, comprehensive, and industry-standard.`;
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
                const response = await fetch('http://localhost:5000/api/documents/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        ...documentData,
                        content: formData
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to generate document');
                }

                const result = await response.json();
                console.log('Document generated successfully:', result);

                // Update the documents list
                const updatedDocs = await api.get('/documents');
                setDocs(updatedDocs);

                // Set the generated document for viewing
                setGeneratedDoc(result.document);

                // Navigate to view the generated document
                setCurrentView('view-document');

                // Reset form data
                setFormData({});

            } catch (error) {
                console.error('Generation error:', error);
                setError(`Failed to generate document: ${error.message}`);
                alert(`Failed to generate document: ${error.message}`);
            } finally {
                setIsGenerating(false);
            }
        };

        const formFields = getFormFields();
        const preview = generatePreviewContent();

        return (
            <div style={{ padding: '32px' }}>
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
                            {formFields.map((field) => (
                                <div key={field.id}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
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
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontFamily: 'Inter, sans-serif',
                                                resize: 'vertical',
                                                outline: 'none',
                                                transition: 'border-color 0.2s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#F97316'}
                                            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontFamily: 'Inter, sans-serif',
                                                outline: 'none',
                                                transition: 'border-color 0.2s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#F97316'}
                                            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
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
                                                border: '1px solid #D1D5DB',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontFamily: 'Inter, sans-serif',
                                                outline: 'none',
                                                transition: 'border-color 0.2s ease'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#F97316'}
                                            onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                                        />
                                    )}
                                </div>
                            ))}
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
    const DocumentViewerPage = () => {
        if (!generatedDoc) {
            return (
                <div style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: '#6B7280',
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <FileText size={64} color="#D1D5DB" style={{ marginBottom: '24px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>No Document Selected</h3>
                    <p style={{ fontSize: '16px', margin: '0 0 24px 0' }}>Please select a document to view</p>
                    <button
                        onClick={() => setCurrentView('documents')}
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
                        Back to Documents
                    </button>
                </div>
            );
        }

        return (
            <div style={{ padding: '20px', maxHeight: '100vh', overflow: 'hidden' }}>
                {/* Compact Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #E5E7EB'
                }}>
                    <div>
                        <button
                            onClick={() => setCurrentView('documents')}
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#6B7280',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginBottom: '6px',
                                padding: '4px 0'
                            }}
                        >
                            ← Back to Documents
                        </button>
                        <h2 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#111827',
                            margin: 0
                        }}>{generatedDoc.title}</h2>
                        <p style={{
                            fontSize: '11px',
                            color: '#6B7280',
                            margin: '2px 0 0 0'
                        }}>
                            {generatedDoc.type?.replace(/_/g, ' ') || 'Document'} • {new Date(generatedDoc.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            onClick={() => handleDownloadDocument(generatedDoc._id, 'pdf')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#374151',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Download size={12} />
                            PDF
                        </button>
                        <button
                            onClick={() => handleDownloadDocument(generatedDoc._id, 'docx')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#F97316',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Download size={12} />
                            DOCX
                        </button>
                    </div>
                </div>

                {/* Compact Document Content */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    height: 'calc(100vh - 140px)'
                }}>
                    <div style={{
                        height: '100%',
                        overflowY: 'auto',
                        padding: '20px'
                    }}>
                        {/* Company Header - Compact */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '20px',
                            paddingBottom: '12px',
                            borderBottom: '2px solid #F97316'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginBottom: '6px'
                            }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    backgroundColor: '#F97316',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    {(brandKit?.name || generatedDoc.content?.companyName || 'MM').charAt(0)}
                                </div>
                                <div>
                                    <h1 style={{
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: '#111827',
                                        margin: 0
                                    }}>{brandKit?.name || generatedDoc.content?.companyName || 'MM Docs'}</h1>
                                    <p style={{
                                        fontSize: '10px',
                                        color: '#6B7280',
                                        margin: 0
                                    }}>{generatedDoc.content?.companyAddress || 'Professional Document Platform'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Document Title - Compact */}
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#111827',
                                margin: '0 0 4px 0',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {generatedDoc.content?.title || generatedDoc.title}
                            </h2>
                            <p style={{
                                fontSize: '11px',
                                color: '#6B7280',
                                margin: 0
                            }}>
                                {generatedDoc.content?.date || new Date().toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        {/* AI Generated Content Display */}
                        <div style={{
                            fontSize: '12px',
                            lineHeight: '1.5',
                            color: '#374151',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            {typeof generatedDoc.content === 'string' ? (
                                // Handle string content
                                generatedDoc.content.split('\n').map((line, i) => (
                                    <p key={i} style={{
                                        marginBottom: line.trim() ? '10px' : '5px',
                                        fontSize: line.length < 50 && line.trim() ? '14px' : '12px',
                                        fontWeight: line.length < 50 && line.trim() ? '600' : '400',
                                        color: line.length < 50 && line.trim() ? '#111827' : '#374151'
                                    }}>
                                        {line || '\u00A0'}
                                    </p>
                                ))
                            ) : generatedDoc.content && typeof generatedDoc.content === 'object' ? (
                                // Handle structured content from AI
                                <div>
                                    {/* Render all content fields dynamically */}
                                    {Object.entries(generatedDoc.content).map(([key, value]) => {
                                        // Skip certain meta fields
                                        if (['title', 'date', 'companyName', 'companyAddress'].includes(key)) {
                                            return null;
                                        }

                                        return (
                                            <div key={key} style={{ marginBottom: '16px' }}>
                                                {/* Field Title */}
                                                <h3 style={{
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#111827',
                                                    marginBottom: '8px',
                                                    borderLeft: '3px solid #F97316',
                                                    paddingLeft: '8px',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </h3>

                                                {/* Field Content */}
                                                <div style={{ paddingLeft: '12px' }}>
                                                    {Array.isArray(value) ? (
                                                        // Handle arrays (lists)
                                                        <ul style={{
                                                            listStyle: 'none',
                                                            padding: 0,
                                                            margin: 0
                                                        }}>
                                                            {value.map((item, index) => (
                                                                <li key={index} style={{
                                                                    display: 'flex',
                                                                    alignItems: 'flex-start',
                                                                    marginBottom: '6px',
                                                                    fontSize: '12px',
                                                                    lineHeight: '1.4'
                                                                }}>
                                                                    <span style={{
                                                                        color: '#F97316',
                                                                        marginRight: '8px',
                                                                        fontSize: '12px',
                                                                        fontWeight: '600'
                                                                    }}>•</span>
                                                                    <span style={{ color: '#374151' }}>
                                                                        {typeof item === 'object' ? JSON.stringify(item, null, 2) : item}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : typeof value === 'object' && value !== null ? (
                                                        // Handle nested objects
                                                        <div style={{
                                                            backgroundColor: '#F9FAFB',
                                                            padding: '12px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #E5E7EB'
                                                        }}>
                                                            {Object.entries(value).map(([subKey, subValue]) => (
                                                                <div key={subKey} style={{ marginBottom: '8px' }}>
                                                                    <span style={{
                                                                        fontSize: '11px',
                                                                        fontWeight: '600',
                                                                        color: '#6B7280',
                                                                        textTransform: 'uppercase',
                                                                        display: 'block',
                                                                        marginBottom: '2px'
                                                                    }}>
                                                                        {subKey.replace(/([A-Z])/g, ' $1')}
                                                                    </span>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#111827',
                                                                        fontWeight: '500'
                                                                    }}>
                                                                        {typeof subValue === 'object' ? JSON.stringify(subValue, null, 2) : subValue}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        // Handle simple text values
                                                        <p style={{
                                                            fontSize: '12px',
                                                            lineHeight: '1.5',
                                                            color: '#374151',
                                                            margin: 0,
                                                            whiteSpace: 'pre-wrap'
                                                        }}>
                                                            {value}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                // Fallback for any other content type
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    color: '#6B7280'
                                }}>
                                    <p>Document content could not be displayed</p>
                                    <p style={{ fontSize: '11px', marginTop: '8px' }}>
                                        Content type: {typeof generatedDoc.content}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Compact Footer */}
                        <div style={{
                            marginTop: '20px',
                            paddingTop: '12px',
                            borderTop: '1px solid #E5E7EB',
                            textAlign: 'center'
                        }}>
                            <p style={{
                                fontSize: '9px',
                                color: '#9CA3AF',
                                margin: 0
                            }}>
                                Generated with MM Docs AI • {brandKit?.name || "Professional"} Workspace
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Templates Page - Professional Template Management
    const TemplatesPage = () => {
        const [selectedCategory, setSelectedCategory] = useState('all');
        const [selectedTemplate, setSelectedTemplate] = useState(null);
        const [previewMode, setPreviewMode] = useState(false);

        const templateCategories = {
            all: 'All Templates',
            hr: 'HR Documents',
            legal: 'Legal Documents',
            sales: 'Sales Documents',
            finance: 'Finance Documents',
            compliance: 'Compliance Documents'
        };

        const templates = {
            hr: [
                {
                    id: 'offer_letter',
                    name: 'Offer Letter',
                    description: 'Professional employment offer letter with compensation details',
                    icon: '📄',
                    preview: 'Employment offer with salary, benefits, and terms',
                    fields: ['candidateName', 'position', 'salary', 'startDate', 'department'],
                    color: '#3B82F6'
                },
                {
                    id: 'appointment_letter',
                    name: 'Appointment Letter',
                    description: 'Official appointment confirmation letter',
                    icon: '📋',
                    preview: 'Formal appointment with role details and conditions',
                    fields: ['employeeName', 'position', 'department', 'appointmentDate'],
                    color: '#10B981'
                },
                {
                    id: 'experience_certificate',
                    name: 'Experience Certificate',
                    description: 'Work experience verification certificate',
                    icon: '🏆',
                    preview: 'Professional experience validation document',
                    fields: ['employeeName', 'position', 'joiningDate', 'relievingDate'],
                    color: '#F59E0B'
                },
                {
                    id: 'warning_letter',
                    name: 'Warning Letter',
                    description: 'Employee disciplinary warning letter',
                    icon: '⚠️',
                    preview: 'Formal warning for policy violations',
                    fields: ['employeeName', 'violationType', 'incidentDescription'],
                    color: '#EF4444'
                },
                {
                    id: 'onboarding_letter',
                    name: 'Onboarding Letter',
                    description: 'Welcome and onboarding instructions',
                    icon: '👋',
                    preview: 'New employee welcome and orientation guide',
                    fields: ['employeeName', 'position', 'startDate', 'orientation'],
                    color: '#8B5CF6'
                }
            ],
            legal: [
                {
                    id: 'nda',
                    name: 'Non-Disclosure Agreement',
                    description: 'Confidentiality and non-disclosure agreement',
                    icon: '🔒',
                    preview: 'Legal confidentiality protection document',
                    fields: ['partyName', 'effectiveDate', 'duration', 'purpose'],
                    color: '#059669'
                },
                {
                    id: 'service_agreement',
                    name: 'Service Agreement',
                    description: 'Professional service contract agreement',
                    icon: '📝',
                    preview: 'Comprehensive service terms and conditions',
                    fields: ['clientName', 'serviceType', 'duration', 'terms'],
                    color: '#7C3AED'
                }
            ],
            sales: [
                {
                    id: 'business_proposal',
                    name: 'Business Proposal',
                    description: 'Professional business proposal document',
                    icon: '💼',
                    preview: 'Comprehensive business proposal with pricing',
                    fields: ['clientName', 'projectTitle', 'projectValue', 'timeline'],
                    color: '#DC2626'
                },
                {
                    id: 'quotation',
                    name: 'Quotation',
                    description: 'Price quotation and service details',
                    icon: '💰',
                    preview: 'Detailed pricing and service quotation',
                    fields: ['clientName', 'quotationNumber', 'totalAmount', 'validUntil'],
                    color: '#EA580C'
                }
            ],
            finance: [
                {
                    id: 'invoice',
                    name: 'Invoice',
                    description: 'Professional invoice for services/products',
                    icon: '🧾',
                    preview: 'Standard billing invoice with payment terms',
                    fields: ['clientName', 'invoiceNumber', 'totalAmount', 'dueDate'],
                    color: '#0891B2'
                },
                {
                    id: 'gst_invoice',
                    name: 'GST Invoice',
                    description: 'GST compliant invoice with tax calculations',
                    icon: '📊',
                    preview: 'Tax compliant invoice with GST breakdown',
                    fields: ['clientName', 'gstNumber', 'baseAmount', 'invoiceDate'],
                    color: '#7C2D12'
                }
            ],
            compliance: [
                {
                    id: 'audit_report',
                    name: 'Audit Report',
                    description: 'Financial and compliance audit report',
                    icon: '🔍',
                    preview: 'Comprehensive audit findings and recommendations',
                    fields: ['auditPeriod', 'auditType', 'auditorName', 'findings'],
                    color: '#BE185D'
                }
            ]
        };

        const getAllTemplates = () => {
            if (selectedCategory === 'all') {
                return Object.values(templates).flat();
            }
            return templates[selectedCategory] || [];
        };

        const handleTemplateSelect = (template) => {
            // Find the category for this template
            const templateCategory = Object.keys(templates).find(cat =>
                templates[cat].some(t => t.id === template.id)
            );

            // Set the states in the main Dashboard component
            setSelectedCategory(templateCategory);
            setSelectedDocType(template.id);
            setCurrentView('create');
        };

        const handlePreviewTemplate = (template) => {
            setSelectedTemplate(template);
            setPreviewMode(true);
        };

        const closePreview = () => {
            setSelectedTemplate(null);
            setPreviewMode(false);
        };

        // Preview Modal Component
        const PreviewModal = ({ template, onClose }) => {
            if (!template) return null;

            const sampleData = {
                offer_letter: {
                    candidateName: 'John Doe',
                    position: 'Senior Software Engineer',
                    salary: '1800000',
                    startDate: '2024-04-01',
                    department: 'Engineering',
                    companyName: 'Tech Solutions Pvt Ltd',
                    companyAddress: '123 Tech Park, Bangalore - 560001'
                },
                appointment_letter: {
                    employeeName: 'Jane Smith',
                    position: 'Marketing Manager',
                    department: 'Marketing',
                    appointmentDate: '2024-04-01',
                    companyName: 'Business Corp Ltd',
                    companyAddress: '456 Business Center, Mumbai - 400001'
                },
                experience_certificate: {
                    employeeName: 'Robert Johnson',
                    position: 'Project Manager',
                    joiningDate: '2022-01-15',
                    relievingDate: '2024-03-31',
                    companyName: 'Innovation Labs',
                    companyAddress: '789 Innovation Hub, Hyderabad - 500001'
                },
                warning_letter: {
                    employeeName: 'Alex Wilson',
                    violationType: 'Attendance Issues',
                    incidentDescription: 'Repeated tardiness and unauthorized absences',
                    companyName: 'Professional Services Ltd',
                    companyAddress: '321 Corporate Plaza, Chennai - 600001'
                }
            };

            const data = sampleData[template.id] || {};

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
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        position: 'relative',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
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
                                <div style={{
                                    fontSize: '32px'
                                }}>
                                    {template.icon}
                                </div>
                                <div>
                                    <h3 style={{
                                        fontSize: '20px',
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

                        {/* Sample Content */}
                        <div style={{
                            backgroundColor: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '24px'
                        }}>
                            <h4 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '12px'
                            }}>Sample Preview:</h4>

                            <div style={{
                                fontFamily: 'Times New Roman, serif',
                                fontSize: '12px',
                                lineHeight: '1.6',
                                color: '#000'
                            }}>
                                {template.id === 'offer_letter' && (
                                    <div>
                                        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{data.companyName}</div>
                                            <div style={{ fontSize: '10px' }}>{data.companyAddress}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', textDecoration: 'underline' }}>
                                            OFFER LETTER
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Date:</strong> {new Date().toLocaleDateString()}
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>To,</strong><br />
                                            <strong>{data.candidateName}</strong>
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Subject: Offer of Employment - {data.position}</strong>
                                        </div>
                                        <div>
                                            Dear {data.candidateName},<br /><br />
                                            We are pleased to offer you employment with {data.companyName} for the position of <strong>{data.position}</strong>...
                                        </div>
                                    </div>
                                )}

                                {template.id === 'appointment_letter' && (
                                    <div>
                                        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{data.companyName}</div>
                                            <div style={{ fontSize: '10px' }}>{data.companyAddress}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', textDecoration: 'underline' }}>
                                            APPOINTMENT LETTER
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Date:</strong> {data.appointmentDate}
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>To,</strong><br />
                                            <strong>{data.employeeName}</strong>
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Subject: Appointment as {data.position}</strong>
                                        </div>
                                        <div>
                                            Dear {data.employeeName},<br /><br />
                                            We are pleased to inform you that you have been appointed as <strong>{data.position}</strong> in the <strong>{data.department}</strong> department...
                                        </div>
                                    </div>
                                )}

                                {template.id === 'experience_certificate' && (
                                    <div>
                                        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{data.companyName}</div>
                                            <div style={{ fontSize: '10px' }}>{data.companyAddress}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', textDecoration: 'underline', border: '2px solid #000', padding: '10px' }}>
                                            EXPERIENCE CERTIFICATE
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>TO WHOM IT MAY CONCERN</strong>
                                        </div>
                                        <div>
                                            This is to certify that <strong>{data.employeeName}</strong> was employed with {data.companyName} as <strong>{data.position}</strong> from {data.joiningDate} to {data.relievingDate}...
                                        </div>
                                    </div>
                                )}

                                {template.id === 'warning_letter' && (
                                    <div>
                                        <div style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', textDecoration: 'underline' }}>
                                            Warning Letter
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>To,</strong><br />
                                            {data.employeeName}<br />
                                            {data.companyName}
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            {new Date().toLocaleDateString()}
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Subject:</strong> Warning against {data.violationType}
                                        </div>
                                        <div>
                                            Dear {data.employeeName},<br /><br />
                                            {data.incidentDescription}...
                                        </div>
                                    </div>
                                )}

                                {!['offer_letter', 'appointment_letter', 'experience_certificate', 'warning_letter'].includes(template.id) && (
                                    <div style={{ textAlign: 'center', color: '#6B7280', fontStyle: 'italic' }}>
                                        Preview for {template.name} will be available soon.<br />
                                        This template includes: {template.fields.join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Required Fields */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>Required Fields:</h4>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '6px'
                            }}>
                                {template.fields.map((field) => (
                                    <span
                                        key={field}
                                        style={{
                                            backgroundColor: template.color + '15',
                                            color: template.color,
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {field}
                                    </span>
                                ))}
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
                                    padding: '10px 20px',
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
                                    padding: '10px 20px',
                                    backgroundColor: template.color,
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

        return (
            <div style={{ padding: '32px' }}>
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
                    }}>Professional templates based on your reference formats</p>
                </div>

                {/* Category Filter */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '32px',
                    flexWrap: 'wrap'
                }}>
                    {Object.entries(templateCategories).map(([key, label]) => (
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
                            onMouseEnter={(e) => {
                                if (selectedCategory !== key) {
                                    e.target.style.borderColor = '#F97316';
                                    e.target.style.color = '#F97316';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedCategory !== key) {
                                    e.target.style.borderColor = '#E5E7EB';
                                    e.target.style.color = '#6B7280';
                                }
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Templates Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '24px'
                }}>
                    {getAllTemplates().map((template) => (
                        <div
                            key={template.id}
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
                                e.target.style.transform = 'translateY(-4px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                                e.target.style.borderColor = template.color;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                                e.target.style.borderColor = '#E5E7EB';
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
                                    backgroundColor: `${template.color}15`,
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
                                        backgroundColor: `${template.color}15`,
                                        color: template.color,
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        display: 'inline-block'
                                    }}>
                                        {templateCategories[Object.keys(templates).find(cat =>
                                            templates[cat].some(t => t.id === template.id)
                                        )]}
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

                            {/* Template Preview */}
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
                                }}>Preview:</div>
                                <div style={{
                                    fontSize: '13px',
                                    color: '#374151',
                                    fontStyle: 'italic'
                                }}>{template.preview}</div>
                            </div>

                            {/* Required Fields */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#9CA3AF',
                                    fontWeight: '500',
                                    marginBottom: '8px'
                                }}>Required Fields:</div>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '4px'
                                }}>
                                    {template.fields.slice(0, 3).map((field) => (
                                        <span
                                            key={field}
                                            style={{
                                                backgroundColor: '#F3F4F6',
                                                color: '#6B7280',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {field}
                                        </span>
                                    ))}
                                    {template.fields.length > 3 && (
                                        <span style={{
                                            color: '#9CA3AF',
                                            fontSize: '11px',
                                            fontWeight: '500'
                                        }}>
                                            +{template.fields.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '8px'
                            }}>
                                <button
                                    onClick={() => handleTemplateSelect(template)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        backgroundColor: template.color,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.opacity = '0.9';
                                        e.target.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.opacity = '1';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    Use Template
                                </button>
                                <button
                                    onClick={() => handlePreviewTemplate(template)}
                                    style={{
                                        padding: '10px 12px',
                                        backgroundColor: 'transparent',
                                        color: template.color,
                                        border: `1px solid ${template.color}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = template.color;
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = template.color;
                                    }}
                                >
                                    <Eye size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Template Statistics */}
                <div style={{
                    marginTop: '48px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '24px'
                }}>
                    {Object.entries(templateCategories).slice(1).map(([key, label]) => {
                        const categoryTemplates = templates[key] || [];
                        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                        const colorIndex = Object.keys(templateCategories).slice(1).indexOf(key);

                        return (
                            <div
                                key={key}
                                style={{
                                    backgroundColor: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: `${colors[colorIndex]}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 12px auto',
                                    fontSize: '20px',
                                    color: colors[colorIndex]
                                }}>
                                    {categoryTemplates.length}
                                </div>
                                <h4 style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#111827',
                                    margin: '0 0 4px 0'
                                }}>{label}</h4>
                                <p style={{
                                    fontSize: '12px',
                                    color: '#6B7280',
                                    margin: 0
                                }}>Available Templates</p>
                            </div>
                        );
                    })}
                </div>

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

    // Main render function
    const renderMainContent = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardOverview />;
            case 'templates':
            case 'create':
            case 'hr':
            case 'legal':
            case 'sales':
            case 'finance':
            case 'compliance':
                return <CreateDocumentPage />;
            case 'generate-document':
                return <DocumentGenerationPage />;
            case 'documents':
                return <MyDocumentsPage />;
            case 'view-document':
                return <DocumentViewerPage />;
            case 'compliance-center': // Renamed to avoid collision with category
                return <ComplianceCenterPage />;
            case 'users':
            case 'settings':
                return (
                    <div style={{
                        padding: '32px',
                        textAlign: 'center',
                        color: '#6B7280',
                        minHeight: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 8px 0' }}>
                            {currentView.charAt(0).toUpperCase() + currentView.slice(1)} Page
                        </h3>
                        <p style={{ fontSize: '16px', margin: 0 }}>This section is under development</p>
                    </div>
                );
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <div style={{
            backgroundColor: '#F8F9FB',
            minHeight: '100vh',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            <Sidebar />
            <div style={{ marginLeft: '280px' }}>
                <TopHeader />
                <main>
                    {renderMainContent()}
                </main>
            </div>
        </div>
    );
}