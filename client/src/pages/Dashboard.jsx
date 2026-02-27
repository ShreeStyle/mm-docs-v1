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
    // Sidebar menu items
    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, active: currentView === 'dashboard' },
        { id: 'create', label: 'Create Document', icon: Plus, active: currentView === 'create' },
        { id: 'documents', label: 'My Documents', icon: FileText, active: currentView === 'documents' },
        { id: 'compliance', label: 'Compliance Center', icon: Shield, active: currentView === 'compliance' },
        { id: 'templates', label: 'Templates', icon: Layers, active: currentView === 'templates' },
        { id: 'users', label: 'Users', icon: Users, active: currentView === 'users' },
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
                                setCurrentView(item.id);
                                setSelectedCategory(null);
                                setSelectedDocType(null);
                                setGeneratedDoc(null);
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
                                <div key={doc._id || index} style={{
                                    padding: '16px 24px',
                                    borderBottom: index < 4 ? '1px solid #F3F4F6' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
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
                                    onClick={() => setSelectedCategory(category.id)}
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
                        margin: '0 0 32px 0',
                        textTransform: 'capitalize'
                    }}>
                        {selectedCategory} Documents
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '16px'
                    }}>
                        {/* Document type buttons would go here - simplified for brevity */}
                        <div style={{ 
                            padding: '40px', 
                            textAlign: 'center', 
                            gridColumn: '1 / -1',
                            color: '#6B7280'
                        }}>
                            Document type selection for {selectedCategory} category would be implemented here
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    // My Documents Page
    const MyDocumentsPage = () => (
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
                                    <button style={{
                                        padding: '6px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        color: '#6B7280'
                                    }}>
                                        <Eye size={14} />
                                    </button>
                                    <button style={{
                                        padding: '6px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        color: '#6B7280'
                                    }}>
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
                            onClick={() => setCurrentView('create')}
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

    // Main render function
    const renderMainContent = () => {
        switch (currentView) {
            case 'dashboard':
                return <DashboardOverview />;
            case 'create':
                return <CreateDocumentPage />;
            case 'documents':
                return <MyDocumentsPage />;
            case 'compliance':
                return <ComplianceCenterPage />;
            case 'templates':
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