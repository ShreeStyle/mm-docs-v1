import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { getApiUrl, BASE_URL } from '../config/api';
import {
    Search, Home, Inbox, Settings, Layers, Trash2,
    UserPlus, ChevronDown, Plus, Sparkles, Clock,
    Calendar, CheckSquare, MoreHorizontal, ArrowUp,
    Paperclip, AtSign, Globe, FileText, Bot, Zap,
    ChevronRight, Layout, LogOut, BarChart, Star,
    TrendingUp, DollarSign, Shield, Users, Bell,
    Filter, Download, Eye, Edit3, Archive, User, Menu, X
} from 'lucide-react';

const LogoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L22 10L28 4V24C28 26.2091 26.2091 28 24 28H8C5.79086 28 4 26.2091 4 24V4L10 10L16 4Z" fill="#F97316" />
    </svg>
);

export default function Dashboard() {
    const { user, logout, login, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
        period: '', companyName: '', details: '',
        companyEmail: '', companyPhone: '', reportingTime: '', reportingLocation: '',
        managerEmail: '', managerPhone: '', hrContactPerson: '', hrEmail: '', hrPhone: '',
        dresscode: '', workingHours: ''
    });

    // Validation state
    const [validationErrors, setValidationErrors] = useState([]);

    const [isPro, setIsPro] = useState(user?.plan === 'pro');

    // Responsive state
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            setIsMobile(w <= 768);
            setIsTablet(w <= 1024);
            if (w > 768) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Document viewing and downloading functions
    const handleViewDocument = (doc) => {
        console.log('Viewing document:', doc);
        setGeneratedDoc(doc);
        setCurrentView('view-document');
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
    // Sidebar menu items - active state based on current route
    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, active: location.pathname === '/dashboard' },
        { id: 'create', label: 'Create Document', icon: Plus, active: location.pathname === '/documents/create' },
        { id: 'documents', label: 'My Documents', icon: FileText, active: location.pathname === '/documents' },
        { id: 'templates', label: 'Template Library', icon: Layers, active: location.pathname === '/templates' },
        { id: 'compliance-center', label: 'Compliance Center', icon: Shield, active: location.pathname === '/compliance' },
        { id: 'settings', label: 'Settings', icon: Settings, active: location.pathname === '/settings' }
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

    // Set initial view based on URL path
    useEffect(() => {
        if (location.pathname === '/dashboard' || location.pathname === '/') {
            setCurrentView('dashboard');
        } else if (location.pathname === '/documents/create') {
            setCurrentView('create');
        } else if (location.pathname === '/documents') {
            setCurrentView('documents');
        } else if (location.pathname === '/templates' || location.pathname === '/dashboard/templates') {
            setCurrentView('templates');
        } else if (location.pathname === '/compliance') {
            setCurrentView('compliance-center');
        } else if (location.pathname === '/settings') {
            setCurrentView('settings');
        }
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    // Sidebar Component
    const Sidebar = () => (
        <>
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999
                    }}
                />
            )}
            <div style={{
                width: '280px',
                height: '100vh',
                backgroundColor: '#FAFAFA',
                borderRight: '1px solid #E5E7EB',
                position: 'fixed',
                left: isMobile ? (sidebarOpen ? '0' : '-280px') : '0',
                top: 0,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                transition: 'left 0.3s ease',
                overflowY: 'auto'
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
                    <div style={{ flex: 1 }}>
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
                    {isMobile && (
                        <button
                            onClick={() => setSidebarOpen(false)}
                            style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '6px', color: '#6B7280', display: 'flex', alignItems: 'center' }}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Navigation Menu */}
                <nav style={{ flex: 1, padding: '24px 16px' }}>
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    // Navigate to proper routes
                                    if (item.id === 'dashboard') {
                                        navigate('/dashboard');
                                    } else if (item.id === 'documents') {
                                        navigate('/documents');
                                    } else if (item.id === 'compliance-center') {
                                        navigate('/compliance');
                                    } else if (item.id === 'settings') {
                                        navigate('/settings');
                                    } else if (item.id === 'templates') {
                                        navigate('/templates');
                                    } else if (item.id === 'create') {
                                        navigate('/documents/create');
                                    }
                                    if (isMobile) setSidebarOpen(false);
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
        </>
    );
    // Top Header Component
    const TopHeader = () => (
        <div style={{
            height: isMobile ? '60px' : '80px',
            backgroundColor: 'white',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 16px' : '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isMobile && (
                    <button
                        onClick={() => setSidebarOpen(true)}
                        style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Menu size={24} color="#374151" />
                    </button>
                )}
                <div>
                    <h1 style={{
                        fontSize: isMobile ? '18px' : '28px',
                        fontWeight: '700',
                        color: '#111827',
                        margin: 0,
                        textTransform: 'capitalize'
                    }}>{currentView === 'dashboard' ? 'Dashboard' : currentView.replace(/([A-Z])/g, ' $1').trim()}</h1>
                    {currentView === 'dashboard' && !isMobile && (
                        <p style={{
                            fontSize: '16px',
                            color: '#6B7280',
                            margin: '4px 0 0 0'
                        }}>Good evening, {user?.name?.split(' ')[0]} – MM Docs Excellence & Strategic Mastery</p>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
                {/* Search Bar - hidden on mobile */}
                {!isMobile && <div style={{
                    position: 'relative',
                    width: isTablet ? '200px' : '320px'
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
                </div>}

                {/* Notifications */}
                <button style={{
                    width: isMobile ? '36px' : '44px',
                    height: isMobile ? '36px' : '44px',
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
                    <Bell size={isMobile ? 18 : 20} color="#6B7280" />
                    <div style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '7px',
                        height: '7px',
                        backgroundColor: '#EF4444',
                        borderRadius: '50%'
                    }} />
                </button>

                {/* Profile Avatar */}
                <div style={{
                    width: isMobile ? '36px' : '44px',
                    height: isMobile ? '36px' : '44px',
                    borderRadius: '12px',
                    backgroundColor: '#F97316',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: isMobile ? '14px' : '16px',
                    cursor: 'pointer'
                }}>
                    {user?.name?.charAt(0) || 'U'}
                </div>
            </div>
        </div>
    );
    // Dashboard Overview Page
    const DashboardOverview = () => (
        <div style={{ padding: isMobile ? '16px' : '32px' }}>
            {/* Overview Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: isMobile ? '12px' : '24px',
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
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '2fr 1fr', gap: isMobile ? '16px' : '32px' }}>
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

                    <div style={{
                        padding: '0',
                        maxHeight: '500px',
                        overflowY: 'auto'
                    }}>
                        {docs.length > 0 ? (
                            docs.map((doc, index) => (
                                <div
                                    key={doc._id || index}
                                    onClick={() => handleViewDocument(doc)}
                                    style={{
                                        padding: '16px 24px',
                                        borderBottom: index < docs.length - 1 ? '1px solid #F3F4F6' : 'none',
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
    const CreateDocumentPage = () => {
        // Document categories definition
        const categories = [
            {
                id: 'hr',
                name: 'HR Documents',
                icon: Users,
                description: 'Employment letters and HR forms',
                color: '#6366F1',
                bgColor: '#EEF2FF'
            },
            {
                id: 'legal',
                name: 'Legal Documents',
                icon: Shield,
                description: 'Contracts and legal agreements',
                color: '#8B5CF6',
                bgColor: '#F5F3FF'
            },
            {
                id: 'sales',
                name: 'Sales Documents',
                icon: TrendingUp,
                description: 'Proposals and sales agreements',
                color: '#0EA5E9',
                bgColor: '#F0F9FF'
            },
            {
                id: 'finance',
                name: 'Finance Documents',
                icon: DollarSign,
                description: 'Invoices and financial records',
                color: '#10B981',
                bgColor: '#F0FDF4'
            },
            {
                id: 'compliance',
                name: 'Compliance Documents',
                icon: CheckSquare,
                description: 'Regulatory and compliance filings',
                color: '#F59E0B',
                bgColor: '#FFFBEB'
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
            legal: [
                { label: 'NDA', type: 'nda' },
                { label: 'Service Agreement', type: 'service_agreement' },
                { label: 'Terms of Service', type: 'terms_of_service' },
                { label: 'Privacy Policy', type: 'privacy_policy' },
                { label: 'MOU', type: 'mou' }
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
        if (['hr', 'legal', 'sales', 'finance', 'compliance'].includes(currentView)) {
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
                                            setSelectedCategory(currentView);
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

        // Otherwise, show category selection (Step 1)
        return (
            <div style={{
                padding: isMobile ? '16px' : '32px',
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
                <div style={{ 
                    marginBottom: '32px',
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.02em'
                    }}>Create Document</h2>
                    <p style={{
                        fontSize: '16px',
                        color: '#6B7280',
                        margin: 0
                    }}>Select a document category to get started</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                    gap: '20px'
                }}>
                    {categories.map((category) => {
                        const CategoryIcon = category.icon;
                        return (
                            <button
                                key={category.id}
                                onClick={() => setCurrentView(category.id)}
                                style={{
                                    padding: '28px 24px',
                                    backgroundColor: 'white',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px',
                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = category.color;
                                    e.currentTarget.style.backgroundColor = category.bgColor;
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                }}
                            >
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '12px',
                                    backgroundColor: category.bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: category.color
                                }}>
                                    <CategoryIcon size={28} strokeWidth={2} />
                                </div>
                                <div>
                                    <h4 style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#111827',
                                        margin: '0 0 6px 0',
                                        letterSpacing: '-0.01em'
                                    }}>{category.name}</h4>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#6B7280',
                                        margin: 0,
                                        lineHeight: '1.5'
                                    }}>{category.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };
    // My Documents Page
    const MyDocumentsPage = () => {
        console.log('Documents in MyDocumentsPage:', docs);

        return (
            <div style={{ padding: isMobile ? '16px' : '32px' }}>
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
                            {/* Table Header - hidden on mobile, use card view instead */}
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

                            {/* Table Rows */}
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
                    { id: 'purpose', label: 'Purpose/Project', type: 'textarea', placeholder: 'Brief description of the purpose or project', required: true }
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
                    { id: 'restrictions', label: 'Restrictions', type: 'textarea', placeholder: 'Prohibited activities and restrictions', required: true }
                ],
                privacy_policy: [
                    ...commonFields,
                    { id: 'serviceName', label: 'Service/Product Name', type: 'text', placeholder: 'e.g. MyApp Platform', required: true },
                    { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
                    { id: 'dataCollected', label: 'Data Collected', type: 'textarea', placeholder: 'Types of data collected from users', required: true },
                    { id: 'dataUsage', label: 'Data Usage', type: 'textarea', placeholder: 'How user data will be used', required: true },
                    { id: 'dataSecurity', label: 'Security Measures', type: 'textarea', placeholder: 'Security measures to protect user data', required: true },
                    { id: 'contactEmail', label: 'Privacy Contact Email', type: 'email', placeholder: 'e.g. privacy@company.com', required: true }
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
                sales_contract: [
                    ...commonFields,
                    { id: 'buyerName', label: 'Buyer Name', type: 'text', placeholder: 'e.g. ABC Corporation', required: true },
                    { id: 'buyerAddress', label: 'Buyer Address', type: 'textarea', placeholder: 'Complete buyer address', required: true },
                    { id: 'productDescription', label: 'Product/Service Description', type: 'textarea', placeholder: 'Detailed description of goods or services', required: true },
                    { id: 'quantity', label: 'Quantity', type: 'text', placeholder: 'e.g. 100 units', required: true },
                    { id: 'totalAmount', label: 'Total Contract Value (₹)', type: 'number', placeholder: 'e.g. 2500000', required: true },
                    { id: 'deliveryDate', label: 'Delivery Date', type: 'date', required: true },
                    { id: 'paymentTerms', label: 'Payment Terms', type: 'textarea', placeholder: 'e.g. 30% advance, 70% on delivery', required: true }
                ],
                partnership_agreement: [
                    ...commonFields,
                    { id: 'partnerName', label: 'Partner Name', type: 'text', placeholder: 'e.g. John Doe / XYZ Corp', required: true },
                    { id: 'partnerAddress', label: 'Partner Address', type: 'textarea', placeholder: 'Complete partner address', required: true },
                    { id: 'businessName', label: 'Partnership Business Name', type: 'text', placeholder: 'e.g. ABC & XYZ Partners', required: true },
                    { id: 'businessType', label: 'Business Type', type: 'text', placeholder: 'e.g. Consulting Services', required: true },
                    { id: 'capitalContribution', label: 'Capital Contribution (₹)', type: 'number', placeholder: 'e.g. 1000000', required: true },
                    { id: 'profitSharingRatio', label: 'Profit Sharing Ratio', type: 'text', placeholder: 'e.g. 50:50 or 60:40', required: true },
                    { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true }
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
                purchase_order: [
                    ...commonFields,
                    { id: 'vendorName', label: 'Vendor Name', type: 'text', placeholder: 'e.g. ABC Suppliers Pvt. Ltd.', required: true },
                    { id: 'vendorAddress', label: 'Vendor Address', type: 'textarea', placeholder: 'Complete vendor address', required: true },
                    { id: 'poNumber', label: 'Purchase Order Number', type: 'text', placeholder: 'e.g. PO-2026-001', required: true },
                    { id: 'poDate', label: 'PO Date', type: 'date', required: true },
                    { id: 'deliveryDate', label: 'Expected Delivery Date', type: 'date', required: true },
                    { id: 'itemDescription', label: 'Items Description', type: 'textarea', placeholder: 'Detailed description of items to be purchased', required: true },
                    { id: 'totalAmount', label: 'Total Amount (₹)', type: 'number', placeholder: 'e.g. 500000', required: true }
                ],
                receipt: [
                    ...commonFields,
                    { id: 'customerName', label: 'Customer Name', type: 'text', placeholder: 'e.g. Rajesh Kumar', required: true },
                    { id: 'receiptNumber', label: 'Receipt Number', type: 'text', placeholder: 'e.g. REC-2026-001', required: true },
                    { id: 'receiptDate', label: 'Receipt Date', type: 'date', required: true },
                    { id: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer', 'Cheque'], required: true },
                    { id: 'amount', label: 'Amount Received (₹)', type: 'number', placeholder: 'e.g. 50000', required: true },
                    { id: 'paymentFor', label: 'Payment For', type: 'text', placeholder: 'e.g. Invoice INV-2026-001', required: true },
                    { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief description of the payment', required: true }
                ],
                credit_note: [
                    ...commonFields,
                    { id: 'clientName', label: 'Client Name', type: 'text', placeholder: 'e.g. XYZ Corporation', required: true },
                    { id: 'clientAddress', label: 'Client Address', type: 'textarea', placeholder: 'Complete client address', required: true },
                    { id: 'creditNoteNumber', label: 'Credit Note Number', type: 'text', placeholder: 'e.g. CN-2026-001', required: true },
                    { id: 'creditNoteDate', label: 'Credit Note Date', type: 'date', required: true },
                    { id: 'invoiceNumber', label: 'Original Invoice Number', type: 'text', placeholder: 'e.g. INV-2025-999', required: true },
                    { id: 'creditAmount', label: 'Credit Amount (₹)', type: 'number', placeholder: 'e.g. 10000', required: true },
                    { id: 'reason', label: 'Reason for Credit', type: 'textarea', placeholder: 'e.g. Product return / Overcharge / Discount', required: true }
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

            return fieldsByType[selectedDocType] || commonFields;
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
                }
            };

            return previews[selectedDocType] || {
                title: selectedDocType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                content: 'Document preview will appear here as you fill the form...'
            };
        };

        const handleGenerate = async () => {
            setIsGenerating(true);
            setValidationErrors([]); // Clear previous errors

            try {
                // Validate required fields
                const requiredFields = formFields.filter(field => field.required);
                const missingFields = requiredFields.filter(field => !formData[field.id] || formData[field.id].toString().trim() === '');

                if (missingFields.length > 0) {
                    const errorMessages = missingFields.map(f => f.label);
                    setValidationErrors(errorMessages);
                    alert(`❌ Please fill in all required fields:\n\n${errorMessages.join('\n')}\n\nDocument generation is blocked until all required information is provided.`);
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
            <div style={{ padding: isMobile ? '16px' : '20px', maxHeight: '100vh', overflow: 'hidden' }}>
                {/* Compact Header */}
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: isMobile ? '12px' : '0',
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
                                                            {value.map((item, index) => {
                                                                // Special handling for section objects {heading, content}
                                                                if (typeof item === 'object' && item !== null && item.heading && item.content) {
                                                                    return (
                                                                        <div key={index} style={{ marginBottom: '16px' }}>
                                                                            <h4 style={{
                                                                                fontSize: '13px',
                                                                                fontWeight: '700',
                                                                                color: '#111827',
                                                                                marginBottom: '4px'
                                                                            }}>{item.heading}</h4>
                                                                            <p style={{
                                                                                fontSize: '12px',
                                                                                color: '#374151',
                                                                                lineHeight: '1.5',
                                                                                margin: 0,
                                                                                whiteSpace: 'pre-wrap'
                                                                            }}>{item.content}</p>
                                                                        </div>
                                                                    );
                                                                }

                                                                return (
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
                                                                );
                                                            })}
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
        const [templates, setTemplates] = useState([]);
        const [loading, setLoading] = useState(true);

        // Fetch templates from API on mount
        useEffect(() => {
            fetchTemplatesFromAPI();
        }, [selectedCategory]);

        const fetchTemplatesFromAPI = async () => {
            try {
                setLoading(true);
                const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
                const response = await api.get(`/templates${params}`);
                
                if (response.success) {
                    console.log('✅ Fetched templates:', response.data);
                    setTemplates(response.data);
                } else {
                    console.error('Failed to fetch templates:', response);
                }
            } catch (error) {
                console.error('Error fetching templates:', error);
            } finally {
                setLoading(false);
            }
        };

        // Debug logging for preview mode
        useEffect(() => {
            console.log('📊 PreviewMode changed:', previewMode);
            console.log('📋 SelectedTemplate:', selectedTemplate?.name || 'null');
        }, [previewMode, selectedTemplate]);

        const templateCategories = {
            all: 'All Templates',
            hr: 'HR Documents',
            legal: 'Legal Documents',
            sales: 'Sales Documents',
            finance: 'Finance Documents',
            compliance: 'Compliance Documents'
        };

        const getAllTemplates = () => {
            return templates;
        };

        const handleTemplateSelect = (template) => {
            // For PDF templates, download directly
            if (template.templateType === 'pdf') {
                console.log('📥 Downloading PDF template:', template.pdfUrl);
                const link = document.createElement('a');
                link.href = `${BASE_URL}${template.pdfUrl}`;
                link.download = `${template.name}.pdf`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }

            console.log('🔴 REDIRECTING TO EDITOR:', template.name);
            console.trace('Called from:');
            // Find the category for this template
            const templateCategory = template.category;

            // Set the states in the main Dashboard component
            setSelectedCategory(templateCategory);
            setSelectedDocType(template.id);
            // Go directly to document generation page with form
            setCurrentView('generate-document');
        };

        const handlePreviewTemplate = (template) => {
            console.log('🟢 OPENING PREVIEW MODAL:', template.name);
            console.log('Current previewMode:', previewMode);
            setSelectedTemplate(template);
            setPreviewMode(true);
            console.log('PreviewMode set to true');
        };

        const closePreview = () => {
            setSelectedTemplate(null);
            setPreviewMode(false);
        };

        // Preview Modal Component
        const PreviewModal = ({ template, onClose }) => {
            console.log('🎭 PreviewModal rendering with template:', template?.name || 'null');
            if (!template) return null;

            // Sample data for template preview (realistic examples)
            const placeholderData = {
                offer_letter: {
                    candidateName: 'Sarah Johnson',
                    position: 'Senior Software Engineer',
                    salary: '$120,000 per annum',
                    startDate: 'April 15, 2026',
                    department: 'Engineering',
                    companyName: 'Tech Innovations Inc.',
                    companyAddress: '123 Silicon Valley Blvd, San Francisco, CA 94105'
                },
                appointment_letter: {
                    employeeName: 'Michael Chen',
                    position: 'Project Manager',
                    department: 'Operations',
                    appointmentDate: 'March 10, 2026',
                    companyName: 'Global Solutions Ltd.',
                    companyAddress: '456 Business Park, New York, NY 10001'
                },
                experience_certificate: {
                    employeeName: 'Priya Sharma',
                    position: 'Marketing Specialist',
                    joiningDate: 'January 15, 2023',
                    relievingDate: 'February 28, 2026',
                    companyName: 'Digital Marketing Hub',
                    companyAddress: '789 Corporate Ave, Austin, TX 78701'
                },
                warning_letter: {
                    employeeName: 'James Wilson',
                    violationType: 'Repeated Tardiness',
                    incidentDescription: 'This letter is to formally address concerns regarding your repeated late arrivals to work over the past three weeks.',
                    companyName: 'Professional Services Corp.',
                    companyAddress: '321 Executive Plaza, Boston, MA 02101'
                },
                onboarding_letter: {
                    employeeName: 'Emily Martinez',
                    position: 'Data Analyst',
                    startDate: 'April 1, 2026',
                    orientation: 'Your orientation will take place on April 1st at 9:00 AM in Conference Room A. You will meet with HR, IT, and your team lead.',
                    companyName: 'Analytics Pro Inc.',
                    companyAddress: '555 Data Drive, Seattle, WA 98101'
                },
                nda: {
                    partyName: 'Acme Technologies LLC',
                    effectiveDate: 'March 1, 2026',
                    duration: '3 years',
                    purpose: 'Protection of confidential business information and trade secrets related to software development projects',
                    companyName: 'SecureCode Solutions',
                    companyAddress: '888 Privacy Lane, Denver, CO 80202'
                },
                terms_of_service: {
                    serviceName: 'CloudSync Platform',
                    effectiveDate: 'January 1, 2026',
                    serviceDescription: 'Cloud-based file synchronization and collaboration platform for teams',
                    userObligations: 'Users must maintain account security, use service lawfully, and respect intellectual property rights',
                    restrictions: 'No unauthorized access, no malicious uploads, no redistribution of licensed content',
                    companyName: 'CloudSync Inc.',
                    companyAddress: '777 Cloud Street, Portland, OR 97201'
                },
                privacy_policy: {
                    serviceName: 'DataGuard App',
                    effectiveDate: 'February 1, 2026',
                    dataCollected: 'Name, email address, usage data, device information, cookies',
                    dataUsage: 'Service improvement, personalization, analytics, customer support',
                    dataSecurity: 'AES-256 encryption, secure servers, regular security audits, GDPR compliance',
                    contactEmail: 'privacy@dataguard.com',
                    companyName: 'DataGuard Technologies',
                    companyAddress: '999 Security Blvd, Chicago, IL 60601'
                },
                mou: {
                    partyName: 'Innovation Labs Ltd.',
                    partyAddress: '234 Research Park, Cambridge, MA 02139',
                    effectiveDate: 'March 15, 2026',
                    purpose: 'Collaborative research and development in artificial intelligence applications',
                    duration: '2 years with option to extend',
                    companyName: 'Future Tech Corp.',
                    companyAddress: '456 Innovation Way, Palo Alto, CA 94301'
                },
                service_agreement: {
                    clientName: 'Retail Solutions Inc.',
                    serviceType: 'IT Infrastructure Management and Support',
                    duration: '12 months',
                    terms: 'Monthly retainer of $5,000, 24/7 support, 4-hour response time, quarterly reviews',
                    companyName: 'TechSupport Pro',
                    companyAddress: '678 Service Road, Dallas, TX 75201'
                },
                business_proposal: {
                    clientName: 'Metro City Council',
                    projectTitle: 'Smart City Infrastructure Deployment',
                    projectValue: '$2.5 Million',
                    timeline: '18 months from project initiation',
                    companyName: 'Urban Tech Solutions',
                    companyAddress: '890 City Center, Los Angeles, CA 90012'
                },
                sales_contract: {
                    buyerName: 'Greenfield Manufacturing Co.',
                    buyerAddress: '432 Industrial Park, Detroit, MI 48201',
                    productDescription: '500 Units of Premium Steel Components (Model XB-2000)',
                    quantity: '500 units',
                    totalAmount: '$85,000',
                    deliveryDate: 'May 30, 2026',
                    paymentTerms: '50% advance, 50% upon delivery',
                    companyName: 'Superior Components Inc.',
                    companyAddress: '111 Manufacturing Ave, Pittsburgh, PA 15201'
                },
                partnership_agreement: {
                    partnerName: 'Jennifer Thompson',
                    partnerAddress: '789 Business Square, Miami, FL 33101',
                    businessName: 'Coastal Ventures LLC',
                    businessType: 'Real Estate Development',
                    capitalContribution: 'Partner A: $200,000, Partner B: $200,000',
                    profitSharingRatio: '50:50',
                    effectiveDate: 'April 1, 2026',
                    companyName: 'Coastal Ventures LLC',
                    companyAddress: '789 Business Square, Miami, FL 33101'
                },
                quotation: {
                    clientName: 'Bright Future Enterprises',
                    quotationNumber: 'QT-2026-0145',
                    totalAmount: '$15,750',
                    validUntil: 'April 15, 2026',
                    companyName: 'Professional Services Ltd.',
                    companyAddress: '222 Commerce Street, Phoenix, AZ 85001'
                },
                invoice: {
                    clientName: 'Sunshine Retail Corp.',
                    invoiceNumber: 'INV-2026-0892',
                    totalAmount: '$8,500',
                    dueDate: 'April 5, 2026',
                    companyName: 'Quality Supplies Inc.',
                    companyAddress: '333 Trade Center, Atlanta, GA 30301'
                },
                purchase_order: {
                    vendorName: 'Office Essentials Suppliers',
                    vendorAddress: '444 Warehouse Drive, Houston, TX 77001',
                    poNumber: 'PO-2026-3421',
                    poDate: 'March 10, 2026',
                    deliveryDate: 'March 25, 2026',
                    itemDescription: 'Office furniture - 20 ergonomic chairs, 10 standing desks',
                    totalAmount: '$12,400',
                    companyName: 'Growing Business Inc.',
                    companyAddress: '555 Corporate Plaza, Philadelphia, PA 19101'
                },
                receipt: {
                    customerName: 'David Anderson',
                    receiptNumber: 'RCP-2026-5678',
                    receiptDate: 'March 5, 2026',
                    paymentMethod: 'Credit Card (Visa ending 4532)',
                    amount: '$2,350',
                    paymentFor: 'Professional consulting services - February 2026',
                    description: 'Strategic business consulting and market analysis',
                    companyName: 'Consulting Experts LLC',
                    companyAddress: '666 Advisor Lane, San Diego, CA 92101'
                },
                credit_note: {
                    clientName: 'Premier Products Ltd.',
                    clientAddress: '777 Customer Road, Nashville, TN 37201',
                    creditNoteNumber: 'CN-2026-0234',
                    creditNoteDate: 'March 8, 2026',
                    invoiceNumber: 'INV-2026-0756',
                    creditAmount: '$1,200',
                    reason: 'Product return - 3 defective units (Model Z-100)',
                    companyName: 'Quality Manufacturing Co.',
                    companyAddress: '888 Factory Lane, Cleveland, OH 44101'
                },
                gst_invoice: {
                    clientName: 'Global Traders Pvt. Ltd.',
                    gstNumber: '29ABCDE1234F1Z5',
                    baseAmount: '₹50,000',
                    invoiceDate: 'March 12, 2026',
                    companyName: 'Tech Solutions India',
                    companyAddress: 'Plot 45, Sector 18, Gurgaon, Haryana 122001, India'
                },
                audit_report: {
                    auditPeriod: 'January 1 - December 31, 2025',
                    auditType: 'Internal Financial Audit',
                    auditorName: 'Anderson & Associates CPAs',
                    findings: 'Overall financial controls are adequate with minor recommendations for improvement in inventory management',
                    companyName: 'Reliable Business Solutions',
                    companyAddress: '999 Audit Plaza, Minneapolis, MN 55401'
                },
                gst_filing_summary: {
                    gstNumber: '27AAAAA0000A1Z5',
                    filingPeriod: 'February 2026',
                    returnType: 'GSTR-3B',
                    totalSales: '₹15,50,000',
                    totalPurchases: '₹8,75,000',
                    outputTax: '₹2,79,000',
                    inputTax: '₹1,57,500',
                    companyName: 'Indian Enterprises Pvt. Ltd.',
                    companyAddress: 'Block B, Tech Park, Bangalore, Karnataka 560001, India'
                },
                policy_document: {
                    policyTitle: 'Remote Work Policy',
                    policyNumber: 'HR-POL-2026-08',
                    effectiveDate: 'April 1, 2026',
                    department: 'Human Resources',
                    policyObjective: 'Establish guidelines for remote work arrangements and maintain productivity standards',
                    policyScope: 'All full-time employees eligible for remote work',
                    policyGuidelines: 'Maintain regular hours, secure internet connection required, daily check-ins with supervisor',
                    companyName: 'Modern Workplace Inc.',
                    companyAddress: '147 Progressive Ave, San Francisco, CA 94102'
                },
                regulatory_filing: {
                    filingType: 'Annual Compliance Report',
                    filingNumber: 'ACR-2026-8765',
                    regulatoryBody: 'Securities and Exchange Commission',
                    filingDate: 'March 15, 2026',
                    filingPeriod: 'Fiscal Year 2025',
                    filingDetails: 'Annual financial statements, management discussion, governance disclosure',
                    companyName: 'Public Corporation Ltd.',
                    companyAddress: '258 Wall Street, New York, NY 10005'
                }
            };

            const data = placeholderData[template.id] || {};

            // For Letter of Recommendation, show the actual PDF
            if (template.id === 'letter-of-recommendation-001') {
                return (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            maxWidth: '1100px',
                            width: '95%',
                            height: '90vh',
                            position: 'relative',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    backgroundColor: '#EF4444',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    zIndex: 10
                                }}
                            >
                                ×
                            </button>

                            {/* Template Header */}
                            <div style={{ marginBottom: '16px' }}>
                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#111827',
                                    margin: '0 0 4px 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span>{template.icon}</span>
                                    {template.name}
                                </h3>
                                <p style={{
                                    fontSize: '13px',
                                    color: '#6B7280',
                                    margin: 0
                                }}>{template.description}</p>
                            </div>

                            {/* PDF Viewer */}
                            <div style={{ flex: 1, overflow: 'hidden', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                <iframe
                                    src="/uploads/template-previews/letter-of-recommendation-preview.pdf"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none'
                                    }}
                                    title="Letter of Recommendation Preview"
                                />
                            </div>

                            {/* Use Template Button */}
                            <button
                                onClick={() => {
                                    onClose();
                                    handleTemplateSelect(template);
                                }}
                                style={{
                                    marginTop: '16px',
                                    width: '100%',
                                    padding: '14px',
                                    backgroundColor: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Use This Template
                            </button>
                        </div>
                    </div>
                );
            }

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
                        maxWidth: '900px',
                        width: '90%',
                        maxHeight: '90vh',
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

                        {/* Template Structure Preview */}
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
                                marginBottom: '8px'
                            }}>Template Preview (Sample Data):</h4>
                            <p style={{
                                fontSize: '12px',
                                color: '#6B7280',
                                marginBottom: '12px',
                                fontStyle: 'italic'
                            }}>
                                Below is a preview with realistic sample data. Click "Use This Template" below to create your own document with your actual data.
                            </p>

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
                                            <strong>Date:</strong> March 5, 2026
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>To,</strong><br />
                                            <strong>{data.candidateName}</strong>
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Subject: Offer of Employment - {data.position}</strong>
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            Dear {data.candidateName},
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            We are pleased to offer you the position of <strong>{data.position}</strong> with {data.companyName}. We believe your skills and experience will be a valuable asset to our team.
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Position Details:</strong><br />
                                            • Position: {data.position}<br />
                                            • Department: {data.department}<br />
                                            • Reporting To: Head of Engineering<br />
                                            • Start Date: {data.startDate}<br />
                                            • Location: San Francisco, CA
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Compensation & Benefits:</strong><br />
                                            • Annual Salary: {data.salary}<br />
                                            • Sign-on Bonus: $10,000<br />
                                            • Stock Options: 5,000 shares (4-year vesting)<br />
                                            • Health Insurance: Medical, Dental, Vision<br />
                                            • 401(k) matching up to 6%<br />
                                            • Paid Time Off: 20 days annually<br />
                                            • Professional Development Budget: $2,000/year
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Employment Terms:</strong><br />
                                            This is a full-time position. Your employment will be at-will, meaning either you or the company may terminate the relationship at any time, with or without cause.
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            Please sign and return this letter by March 12, 2026, to confirm your acceptance. We look forward to welcoming you to our team!
                                        </div>
                                        <div style={{ marginTop: '30px' }}>
                                            Sincerely,<br /><br />
                                            <strong>John Smith</strong><br />
                                            Chief Technology Officer<br />
                                            {data.companyName}
                                        </div>
                                        <div style={{ marginTop: '40px', borderTop: '1px solid #000', paddingTop: '20px' }}>
                                            <strong>Acceptance:</strong><br />
                                            I, {data.candidateName}, accept the above offer of employment.<br /><br />
                                            Signature: __________________ Date: __________
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
                                        <div style={{ marginBottom: '15px' }}>
                                            Dear {data.employeeName},
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            We are pleased to inform you that you have been appointed as <strong>{data.position}</strong> in the <strong>{data.department}</strong> department of {data.companyName}, effective from {data.appointmentDate}.
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Terms of Appointment:</strong>
                                        </div>
                                        <div style={{ marginBottom: '15px', marginLeft: '20px' }}>
                                            1. <strong>Position:</strong> {data.position}<br />
                                            2. <strong>Department:</strong> {data.department}<br />
                                            3. <strong>Work Location:</strong> New York, NY<br />
                                            4. <strong>Working Hours:</strong> 9:00 AM to 6:00 PM (Mon-Fri)<br />
                                            5. <strong>Probation Period:</strong> 3 months<br />
                                            6. <strong>Notice Period:</strong> 30 days
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Roles & Responsibilities:</strong>
                                        </div>
                                        <div style={{ marginBottom: '15px', marginLeft: '20px' }}>
                                            • Managing and coordinating project activities<br />
                                            • Leading team meetings and planning sessions<br />
                                            • Ensuring project deliverables meet quality standards<br />
                                            • Reporting to senior management on project progress<br />
                                            • Managing stakeholder communications
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            Your performance will be reviewed periodically, and you will be eligible for performance-based incentives as per company policy.
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            We are confident that you will be a valuable member of our team and contribute to the company's continued success.
                                        </div>
                                        <div style={{ marginTop: '30px' }}>
                                            Sincerely,<br /><br />
                                            <strong>HR Department</strong><br />
                                            {data.companyName}
                                        </div>
                                        <div style={{ marginTop: '40px', borderTop: '1px solid #000', paddingTop: '20px' }}>
                                            <strong>Acknowledgement:</strong><br />
                                            I, {data.employeeName}, acknowledge receipt of this appointment letter and accept the terms mentioned above.<br /><br />
                                            Signature: __________________ Date: __________
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
                                            <strong>Date:</strong> March 2, 2026
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>TO WHOM IT MAY CONCERN</strong>
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            This is to certify that <strong>{data.employeeName}</strong> was employed with {data.companyName} as <strong>{data.position}</strong> from <strong>{data.joiningDate}</strong> to <strong>{data.relievingDate}</strong>.
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            During their tenure with us, {data.employeeName} demonstrated excellent professional skills and dedication to their work. They were responsible for:
                                        </div>
                                        <div style={{ marginBottom: '15px', marginLeft: '20px' }}>
                                            • Developing and executing marketing campaigns<br />
                                            • Managing social media presence and content strategy<br />
                                            • Conducting market research and competitor analysis<br />
                                            • Coordinating with cross-functional teams<br />
                                            • Contributing to brand development initiatives
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            {data.employeeName} displayed high levels of professionalism, integrity, and commitment throughout their employment. Their contributions were valuable to our team's success.
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            We wish them all the best in their future endeavors.
                                        </div>
                                        <div style={{ marginTop: '40px' }}>
                                            <strong>For {data.companyName}</strong><br /><br /><br />
                                            _______________________<br />
                                            <strong>Authorized Signatory</strong><br />
                                            HR Manager<br />
                                            {data.companyName}
                                        </div>
                                        <div style={{ marginTop: '20px', fontSize: '10px', color: '#666' }}>
                                            <strong>Note:</strong> This certificate is issued upon request and does not constitute a recommendation or endorsement.
                                        </div>
                                    </div>
                                )}

                                {template.id === 'warning_letter' && (
                                    <div>
                                        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{data.companyName}</div>
                                            <div style={{ fontSize: '10px' }}>{data.companyAddress}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', textDecoration: 'underline', color: '#DC2626' }}>
                                            WARNING LETTER
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Date:</strong> March 2, 2026
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>To,</strong><br />
                                            {data.employeeName}<br />
                                            Employee ID: EMP-2456<br />
                                            Operations Department
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Subject: Warning Notice - {data.violationType}</strong>
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            Dear {data.employeeName},
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            {data.incidentDescription}
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Incidents Recorded:</strong>
                                        </div>
                                        <div style={{ marginBottom: '15px', marginLeft: '20px' }}>
                                            • February 5, 2026 - Arrived 45 minutes late<br />
                                            • February 12, 2026 - Arrived 30 minutes late<br />
                                            • February 19, 2026 - Arrived 50 minutes late<br />
                                            • February 26, 2026 - Arrived 40 minutes late
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            This behavior is unacceptable and violates our company's attendance policy. Punctuality is essential for maintaining team productivity and ensuring smooth business operations.
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>Expected Improvement:</strong>
                                        </div>
                                        <div style={{ marginBottom: '15px', marginLeft: '20px' }}>
                                            You are expected to:<br />
                                            • Arrive at work on time (9:00 AM) daily<br />
                                            • Inform your supervisor in advance if you anticipate being late<br />
                                            • Demonstrate improved commitment to company policies
                                        </div>
                                        <div style={{ marginBottom: '15px', backgroundColor: '#FEF2F2', padding: '10px', border: '1px solid #DC2626' }}>
                                            <strong>Warning:</strong> Failure to improve your attendance may result in further disciplinary action, including suspension or termination of employment.
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            We trust that you will take this matter seriously and demonstrate immediate improvement.
                                        </div>
                                        <div style={{ marginTop: '30px' }}>
                                            Sincerely,<br /><br />
                                            <strong>Sarah Johnson</strong><br />
                                            HR Manager<br />
                                            {data.companyName}
                                        </div>
                                        <div style={{ marginTop: '40px', borderTop: '1px solid #000', paddingTop: '20px' }}>
                                            <strong>Employee Acknowledgement:</strong><br />
                                            I acknowledge receipt of this warning letter.<br /><br />
                                            Employee Signature: __________________ Date: __________
                                        </div>
                                    </div>
                                )}

                                {template.id === 'invoice' && (
                                    <div>
                                        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '3px solid #000', paddingBottom: '15px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{data.companyName}</div>
                                            <div style={{ fontSize: '10px' }}>{data.companyAddress}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#3B82F6' }}>
                                            INVOICE
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                            <div>
                                                <strong>Bill To:</strong><br />
                                                {data.clientName}<br />
                                                789 Customer Street<br />
                                                Atlanta, GA 30301
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <strong>Invoice #:</strong> {data.invoiceNumber}<br />
                                                <strong>Date:</strong> March 2, 2026<br />
                                                <strong>Due Date:</strong> {data.dueDate}
                                            </div>
                                        </div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #000' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#F3F4F6' }}>
                                                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Description</th>
                                                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Qty</th>
                                                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Rate</th>
                                                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '8px' }}>Premium Product Supplies</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>50</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$100.00</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$5,000.00</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '8px' }}>Professional Services</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>20</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$150.00</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$3,000.00</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '8px' }}>Shipping & Handling</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>1</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$500.00</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$500.00</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                            <div style={{ marginBottom: '5px' }}>Subtotal: $8,500.00</div>
                                            <div style={{ marginBottom: '5px' }}>Tax (0%): $0.00</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold', paddingTop: '10px', borderTop: '2px solid #000' }}>
                                                Total Due: {data.totalAmount}
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '30px', fontSize: '11px' }}>
                                            <strong>Payment Terms:</strong> Payment is due within 30 days of invoice date.<br />
                                            <strong>Payment Methods:</strong> Bank Transfer, Check, Credit Card<br />
                                            <strong>Late Fee:</strong> 1.5% per month on overdue balances<br /><br />
                                            <strong>Bank Details:</strong><br />
                                            Bank Name: First National Bank<br />
                                            Account Number: 1234567890<br />
                                            Routing Number: 987654321<br />
                                            Account Name: {data.companyName}
                                        </div>
                                        <div style={{ marginTop: '20px', fontSize: '10px', textAlign: 'center', color: '#666' }}>
                                            Thank you for your business!
                                        </div>
                                    </div>
                                )}

                                {template.id === 'nda' && (
                                    <div>
                                        <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', textDecoration: 'underline' }}>
                                            NON-DISCLOSURE AGREEMENT (NDA)
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            This Non-Disclosure Agreement ("Agreement") is entered into on <strong>{data.effectiveDate}</strong> by and between:
                                        </div>
                                        <div style={{ marginBottom: '15px', marginLeft: '20px' }}>
                                            <strong>Disclosing Party:</strong> {data.companyName}<br />
                                            Address: {data.companyAddress}<br /><br />
                                            <strong>Receiving Party:</strong> {data.partyName}
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>1. PURPOSE</strong><br />
                                            The purpose of this Agreement is to protect confidential information disclosed between the parties for: {data.purpose}.
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>2. CONFIDENTIAL INFORMATION</strong><br />
                                            "Confidential Information" means any and all information disclosed by the Disclosing Party, including but not limited to:<br />
                                            \u2022 Technical data, trade secrets, and know-how<br />
                                            \u2022 Business operations, strategies, and plans<br />
                                            \u2022 Customer lists and supplier information<br />
                                            \u2022 Financial information and projections<br />
                                            \u2022 Software code, algorithms, and technical specifications
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>3. OBLIGATIONS</strong><br />
                                            The Receiving Party agrees to:<br />
                                            a) Maintain confidentiality of all Confidential Information<br />
                                            b) Use the information solely for the agreed purpose<br />
                                            c) Not disclose information to third parties without written consent<br />
                                            d) Implement reasonable security measures to protect the information<br />
                                            e) Return or destroy all confidential materials upon request
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>4. TERM</strong><br />
                                            This Agreement shall remain in effect for a period of <strong>{data.duration}</strong> from the Effective Date.
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>5. EXCEPTIONS</strong><br />
                                            This Agreement does not apply to information that:<br />
                                            \u2022 Is or becomes publicly available through no breach of this Agreement<br />
                                            \u2022 Was rightfully in possession prior to disclosure<br />
                                            \u2022 Is independently developed without use of Confidential Information<br />
                                            \u2022 Is required to be disclosed by law or court order
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong>6. GOVERNING LAW</strong><br />
                                            This Agreement shall be governed by and construed in accordance with the laws of California, United States.
                                        </div>
                                        <div style={{ marginTop: '40px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div>
                                                    <strong>DISCLOSING PARTY</strong><br /><br />
                                                    Signature: __________________<br />
                                                    Name: {data.companyName}<br />
                                                    Date: __________
                                                </div>
                                                <div>
                                                    <strong>RECEIVING PARTY</strong><br /><br />
                                                    Signature: __________________<br />
                                                    Name: {data.partyName}<br />
                                                    Date: __________
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {template.id === 'quotation' && (
                                    <div>
                                        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '3px solid #000', paddingBottom: '15px' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{data.companyName}</div>
                                            <div style={{ fontSize: '10px' }}>{data.companyAddress}</div>
                                        </div>
                                        <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#10B981' }}>
                                            QUOTATION
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                            <div>
                                                <strong>To:</strong><br />
                                                {data.clientName}<br />
                                                567 Business Avenue<br />
                                                Phoenix, AZ 85001
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <strong>Quotation #:</strong> {data.quotationNumber}<br />
                                                <strong>Date:</strong> March 2, 2026<br />
                                                <strong>Valid Until:</strong> {data.validUntil}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '20px' }}>
                                            Dear {data.clientName},<br /><br />
                                            Thank you for your inquiry. We are pleased to provide you with the following quotation for our professional services:
                                        </div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #000' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#F3F4F6' }}>
                                                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Item Description</th>
                                                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Quantity</th>
                                                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Unit Price</th>
                                                    <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '8px' }}>Website Development - E-commerce Platform</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>1</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$8,500.00</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$8,500.00</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '8px' }}>SEO Optimization - 6 Months</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>1</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$4,500.00</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$4,500.00</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '8px' }}>Content Management System Setup</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>1</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$2,250.00</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$2,250.00</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ border: '1px solid #000', padding: '8px' }}>Training & Support - 3 Months</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>1</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$500.00</td>
                                                    <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$500.00</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                            <div style={{ marginBottom: '5px' }}>Subtotal: $15,750.00</div>
                                            <div style={{ marginBottom: '5px' }}>Discount (0%): $0.00</div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold', paddingTop: '10px', borderTop: '2px solid #000' }}>
                                                Total Quote: {data.totalAmount}
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '20px', fontSize: '11px' }}>
                                            <strong>Terms & Conditions:</strong><br />
                                            • This quotation is valid until {data.validUntil}<br />
                                            • 50% advance payment required to commence work<br />
                                            • Estimated project completion: 8-10 weeks<br />
                                            • Payment terms: 50% advance, 25% at milestone, 25% on completion<br />
                                            • Prices are in USD and exclude applicable taxes
                                        </div>
                                        <div style={{ marginTop: '20px' }}>
                                            We look forward to working with you. Please contact us if you have any questions.<br /><br />
                                            Best regards,<br />
                                            <strong>{data.companyName}</strong>
                                        </div>
                                    </div>
                                )}

                                {!['offer_letter', 'appointment_letter', 'experience_certificate', 'warning_letter', 'invoice', 'nda', 'quotation'].includes(template.id) && (
                                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>{template.icon}</div>
                                        <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '10px' }}>
                                            {template.name}
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
                                            {template.description}
                                        </div>
                                        <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
                                            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '15px' }}>
                                                <strong>This template includes:</strong>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                                {template.fields.map((field) => (
                                                    <span
                                                        key={field}
                                                        style={{
                                                            backgroundColor: 'white',
                                                            border: '1px solid #E5E7EB',
                                                            color: '#374151',
                                                            padding: '6px 12px',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        {field}
                                                    </span>
                                                ))}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '20px', fontStyle: 'italic' }}>
                                                Click "Use This Template" below to create your personalized document with all fields filled in.
                                            </div>
                                        </div>
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
            <div style={{ padding: '20px' }}>
                {/* Header */}
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 6px 0'
                    }}>Document Templates</h2>
                    <p style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        margin: 0
                    }}>Ready-to-use document structures. Select a template to create a document with your data.</p>
                </div>

                {/* Templates Grid - All Templates Displayed */}
                <div style={{ marginBottom: '16px' }}>
                    <p style={{
                        fontSize: '13px',
                        color: '#6B7280',
                        margin: 0
                    }}>Showing all {getAllTemplates().length} templates</p>
                </div>

                {/* Templates Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '10px'
                }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', gridColumn: '1 / -1' }}>
                            <div style={{ fontSize: '14px', color: '#6B7280' }}>Loading templates...</div>
                        </div>
                    ) : getAllTemplates().map((template) => (
                        <div
                            key={template.templateId}
                            onClick={(e) => {
                                if (!e.target.closest('button')) {
                                    handleTemplateSelect(template);
                                }
                            }}
                            style={{
                                backgroundColor: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                padding: '8px',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.06)';
                            }}
                        >
                            {/* Featured Badge */}
                            {template.metadata?.featured && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '10px',
                                    backgroundColor: '#F97316',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '8px',
                                    fontSize: '9px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px',
                                    boxShadow: '0 1px 4px rgba(249, 115, 22, 0.3)',
                                    zIndex: 10
                                }}>
                                    ⭐ Featured
                                </div>
                            )}

                            {/* Visual Document Preview */}
                            <div style={{
                                width: '100%',
                                height: '110px',
                                backgroundColor: '#F9FAFB',
                                borderRadius: '4px',
                                marginBottom: '6px',
                                overflow: 'hidden',
                                border: '1px solid #E5E7EB',
                                position: 'relative'
                            }}>
                                {template.templateType === 'pdf' ? (
                                    <>
                                        {/* PDF Preview - YOUR GREEN GREY PDF! */}
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
                                        {/* PandaDoc-style badge */}
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
                                        {template.icon || '📄'}
                                    </div>
                                )}
                            </div>

                            {/* Template Title */}
                            <h3 style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0 0 4px 0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>{template.name}</h3>

                            {/* Creator info */}
                            <div style={{
                                fontSize: '9px',
                                color: '#9CA3AF',
                                marginBottom: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1px'
                            }}>
                                <div>Prepared for: <span style={{ color: '#6B7280' }}>Your Company</span></div>
                                <div>Created by: <span style={{ color: '#6B7280' }}>{templateCategories[template.category] || 'Professional'}</span></div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTemplateSelect(template);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '6px',
                                    backgroundColor: '#F97316',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '11px',
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
                                {template.templateType === 'pdf' ? 'Download PDF' : 'Use this template'}
                            </button>
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
                        const categoryTemplates = templates.filter(t => t.category === key);
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
                return <TemplatesPage />;
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
            case 'settings':
                return (
                    <div style={{ padding: '32px', maxWidth: '1200px' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                                Settings
                            </h2>
                            <p style={{ fontSize: '16px', color: '#6B7280' }}>
                                Manage your account and application preferences
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '24px'
                        }}>
                            {/* Brand Settings Card */}
                            <motion.div
                                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
                                onClick={() => navigate('/settings/brand')}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '16px'
                                }}>
                                    <span style={{ fontSize: '24px' }}>🎨</span>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                                    Brand Kit
                                </h3>
                                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                                    Customize your brand colors, logo, fonts, and footer details for all documents
                                </p>
                                <div style={{
                                    marginTop: '16px',
                                    color: '#667eea',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    Configure Branding <ChevronRight size={16} />
                                </div>
                            </motion.div>

                            {/* Account Settings Card */}
                            <motion.div
                                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: 0.6
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '16px'
                                }}>
                                    <User size={24} color="white" />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                                    Account Settings
                                </h3>
                                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                                    Manage your profile, email, password, and account preferences
                                </p>
                                <div style={{
                                    marginTop: '16px',
                                    color: '#9CA3AF',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Coming Soon
                                </div>
                            </motion.div>

                            {/* Notifications Card */}
                            <motion.div
                                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: 0.6
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '16px'
                                }}>
                                    <Bell size={24} color="white" />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                                    Notifications
                                </h3>
                                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                                    Configure email and in-app notification preferences
                                </p>
                                <div style={{
                                    marginTop: '16px',
                                    color: '#9CA3AF',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}>
                                    Coming Soon
                                </div>
                            </motion.div>
                        </div>
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
            <div style={{ marginLeft: isMobile ? '0' : '280px' }}>
                <TopHeader />
                <main>
                    {renderMainContent()}
                </main>
            </div>
        </div>
    );
}