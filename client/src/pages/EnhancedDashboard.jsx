import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
    Home, FileText, Users, Bot, Zap, BarChart, Shield, 
    MessageSquare, PenTool, CheckSquare, Clock, TrendingUp,
    FileCheck, AlertTriangle, Sparkles, Menu, X, ChevronRight,
    Bell, Search, Plus, Settings, LogOut, Archive, Layers
} from 'lucide-react';
import AIDocumentChat from '../components/AIDocumentChat';
import '../styles/EnhancedDashboard.css';

export default function EnhancedDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [currentView, setCurrentView] = useState('home');
    const [sidebarExpanded, setSidebarExpanded] = useState (true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [pendingSignatures, setPendingSignatures] = useState([]);
    const [notifications, setNotifications] = useState([]);
    
    // Fetch dashboard data
    useEffect(() => {
        fetchDashboardData();
    }, []);
    
    const fetchDashboardData = async () => {
        try {
            const [analyticsData, approvals, signatures] = await Promise.all([
                api.get('/analytics/dashboard'),
                api.get('/workflows/pending/me'),
                api.get('/signatures/user/pending')
            ]);
            
            setAnalytics(analyticsData);
            setPendingApprovals(approvals.workflows || []);
            setPendingSignatures(signatures.signatures || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };
    
    const navigationSections = [
        {
            title: 'Main',
            items: [
                { id: 'home', label: 'Dashboard', icon: Home, badge: null },
                { id: 'documents', label: 'My Documents', icon: FileText, badge: analytics?.overview?.totalDocuments },
                { id: 'templates', label: 'Templates', icon: Layers, badge: null },
                { id: 'create', label: 'Create New', icon: Plus, badge: null, primary: true }
            ]
        },
        {
            title: 'Smart Features',
            items: [
                { id: 'ai-chat', label: 'AI Document Chat', icon: Bot, badge: null },
                { id: 'clause-library', label: 'Clause Library', icon: Shield, badge: null },
                { id: 'risk-analysis', label: 'Risk Analysis', icon: AlertTriangle, badge: null },
                { id: 'workflows', label: 'Approvals', icon: CheckSquare, badge: pendingApprovals.length || null }
            ]
        },
        {
            title: 'Collaboration',
            items: [
                { id: 'signatures', label: 'E-Signatures', icon: PenTool, badge: pendingSignatures.length || null },
                { id: 'collaboration', label: 'Shared Docs', icon: Users, badge: null },
                { id: 'comments', label: 'Comments', icon: MessageSquare, badge: null }
            ]
        },
        {
            title: 'Insights',
            items: [
                { id: 'analytics', label: 'Analytics', icon: BarChart, badge: null },
                { id: 'memory', label: 'Smart Memory', icon: Sparkles, badge: null },
                { id: 'automation', label: 'Automations', icon: Zap, badge: null }
            ]
        }
    ];
    
    const Sidebar = () => (
        <motion.div 
            className={`enhanced-sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="sidebar-header">
                <div className="logo-section">
                    <div className="logo-icon">MM</div>
                    {sidebarExpanded && <h2>MM Docs</h2>}
                </div>
                <button 
                    className="collapse-btn"
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                >
                    <ChevronRight className={sidebarExpanded ? 'rotated' : ''} />
                </button>
            </div>
            
            <div className="sidebar-content">
                {navigationSections.map((section, idx) => (
                    <div key={idx} className="nav-section">
                        {sidebarExpanded && <h4 className="section-title">{section.title}</h4>}
                        {section.items.map(item => (
                            <button
                                key={item.id}
                                className={`nav-item ${currentView === item.id ? 'active' : ''} ${item.primary ? 'primary' : ''}`}
                                onClick={() => setCurrentView(item.id)}
                                title={!sidebarExpanded ? item.label : ''}
                            >
                                <item.icon size={20} />
                                {sidebarExpanded && <span>{item.label}</span>}
                                {item.badge && sidebarExpanded && (
                                    <span className="badge">{item.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
            
            <div className="sidebar-footer">
                <button className="nav-item" onClick={() => navigate('/settings')}>
                    <Settings size={20} />
                    {sidebarExpanded && <span>Settings</span>}
                </button>
                <button className="nav-item" onClick={logout}>
                    <LogOut size={20} />
                    {sidebarExpanded && <span>Logout</span>}
                </button>
            </div>
        </motion.div>
    );
    
    const TopBar = () => (
        <div className="enhanced-topbar">
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
            
            <div className="search-bar">
                <Search size={18} />
                <input type="text" placeholder="Search documents, templates, people..." />
            </div>
            
            <div className="topbar-actions">
                <button className="icon-btn" title="Notifications">
                    <Bell size={20} />
                    {(pendingApprovals.length + pendingSignatures.length) > 0 && (
                        <span className="notification-dot">{pendingApprovals.length + pendingSignatures.length}</span>
                    )}
                </button>
                
                <div className="user-menu">
                    <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                        <span className="user-plan">{user?.plan === 'pro' ? 'Pro' : 'Free'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
    
    const DashboardHome = () => (
        <div className="dashboard-home">
            <div className="welcome-section">
                <h1>Welcome back, {user?.name}! 👋</h1>
                <p>Here's what's happening with your documents today</p>
            </div>
            
            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{analytics?.overview?.totalDocuments || 0}</h3>
                        <p>Documents Created</p>
                        <span className="stat-change positive">+12% this month</span>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon green">
                        <FileCheck size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{analytics?.overview?.signaturesCompleted || 0}</h3>
                        <p>Signed Documents</p>
                        <span className="stat-change positive">+5 this week</span>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>{Math.floor((analytics?.overview?.timeSavedMinutes || 0) / 60)}h</h3>
                        <p>Time Saved</p>
                        <span className="stat-subtitle">vs manual creation</span>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>95%</h3>
                        <p>Productivity Score</p>
                        <span className="stat-change positive">Excellent!</span>
                    </div>
                </div>
            </div>
            
            {/* Pending Actions */}
            {(pendingApprovals.length > 0 || pendingSignatures.length > 0) && (
                <div className="pending-section">
                    <h2>Action Required</h2>
                    <div className="pending-grid">
                        {pendingApprovals.length > 0 && (
                            <div className="pending-card">
                                <div className="pending-header">
                                    <CheckSquare size={20} />
                                    <h3>Pending Approvals</h3>
                                    <span className="badge">{pendingApprovals.length}</span>
                                </div>
                                <p>{pendingApprovals.length} document{pendingApprovals.length !== 1 ? 's' : ''} waiting for your review</p>
                                <button className="action-btn" onClick={() => setCurrentView('workflows')}>
                                    Review Now <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                        
                        {pendingSignatures.length > 0 && (
                            <div className="pending-card">
                                <div className="pending-header">
                                    <PenTool size={20} />
                                    <h3>Pending Signatures</h3>
                                    <span className="badge">{pendingSignatures.length}</span>
                                </div>
                                <p>{pendingSignatures.length} document{pendingSignatures.length !== 1 ? 's' : ''} waiting for your signature</p>
                                <button className="action-btn" onClick={() => setCurrentView('signatures')}>
                                    Sign Now <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Recent Activity */}
            <div className="recent-section">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                    {analytics?.recentActivity?.map((doc, idx) => (
                        <div key={idx} className="activity-item">
                            <div className="activity-icon">
                                <FileText size={18} />
                            </div>
                            <div className="activity-content">
                                <h4>{doc.title}</h4>
                                <p>{doc.type} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button className="activity-action">View</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
    
    const renderView = () => {
        switch (currentView) {
            case 'home':
                return <DashboardHome />;
            case 'documents':
                return <div className="view-placeholder">My Documents View - Coming Soon</div>;
            case 'templates':
                return <div className="view-placeholder">Templates View - Coming Soon</div>;
            case 'ai-chat':
                return <AIDocumentChat />;
            case 'clause-library':
                return <div className="view-placeholder">Clause Library - Coming Soon</div>;
            case 'risk-analysis':
                return <div className="view-placeholder">Risk Analysis - Coming Soon</div>;
            case 'workflows':
                return <div className="view-placeholder">Workflows & Approvals - Coming Soon</div>;
            case 'signatures':
                return <div className="view-placeholder">E-Signatures - Coming Soon</div>;
            case 'analytics':
                return <div className="view-placeholder">Analytics Dashboard - Coming Soon</div>;
            default:
                return <DashboardHome />;
        }
    };
    
    return (
        <div className="enhanced-dashboard">
            <Sidebar />
            <div className="dashboard-main">
                <TopBar />
                <div className="dashboard-content">
                    {renderView()}
                </div>
            </div>
        </div>
    );
}
