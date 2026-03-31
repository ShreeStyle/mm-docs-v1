import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, FileText, Plus, Star, Clock, DollarSign,
    Bell, MoreHorizontal, ArrowUp, X, Zap, Wand2,
    LayoutGrid, FilePlus, Layers, Package, GitBranch,
    BarChart, Menu, ChevronRight, Edit3, Download,
    Filter, Eye, AlertCircle, Users, TrendingUp,
    CheckSquare, Shield, Settings, LogOut, FileSpreadsheet, Save
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { getApiUrl } from '../config/api';
import LegacyCreateDocumentFlow from '../components/LegacyCreateDocumentFlow';
import TemplatesPage from './TemplatesPage';


// ─── helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    if (diff < 172800) return 'Yesterday';
    return `${Math.floor(diff / 86400)} days ago`;
}

// ─── weekly chart data helper ────────────────────────────────────────────────
function buildWeekData(docs) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0);
    const now = new Date();
    docs.forEach(d => {
        const created = new Date(d.createdAt);
        const diffDays = Math.floor((now - created) / 86400000);
        if (diffDays < 7) {
            const idx = created.getDay();
            counts[idx]++;
        }
    });
    return days.map((day, i) => ({ day, count: counts[i] }));
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Dashboard() {
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [docs, setDocs] = useState([]);
    const [organization, setOrganization] = useState(null);
    const [brandKit, setBrandKit] = useState(null);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // current inner view (only used for views that stay within dashboard shell)
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedDocType, setSelectedDocType] = useState(null);

    // ── resize ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── auth guard ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
    }, [token, navigate]);

    // ── fetch data ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!token) { return; }
        setError(null);
        (async () => {
            try {
                const fetchedDocs = await api.get('/documents');
                setDocs(Array.isArray(fetchedDocs) ? fetchedDocs : []);
            } catch (err) {
                if (err.message?.includes('Access Denied') || err.message?.includes('Invalid Token')) {
                    setError('Session expired. Please log in again.');
                } else {
                    setError('Error connecting to server. Please try again.');
                }
            }
            try {
                const [bk, org] = await Promise.all([api.get('/brand-kit'), api.get('/organization')]);
                setBrandKit(bk);
                setOrganization(org);
            } catch (_) { /* optional */ }
        })();
    }, [token]);

    // ── URL → view ────────────────────────────────────────────────────────────
    useEffect(() => {
        const p = location.pathname;
        if (p === '/dashboard' || p === '/') setCurrentView('dashboard');
        else if (p === '/documents/create') setCurrentView('create');
        else if (p === '/documents') setCurrentView('documents');
        else if (p === '/templates' || p === '/dashboard/templates') setCurrentView('templates');
        else if (p === '/compliance') setCurrentView('compliance');
    }, [location.pathname]);

    // ── download ──────────────────────────────────────────────────────────────
    const handleDownload = useCallback(async (docId, fmt = 'pdf') => {
        try {
            const url = getApiUrl(`/api/documents/${docId}/${fmt === 'pdf' ? 'download' : 'download-docx'}`);
            const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            if (!res.ok) throw new Error('Download failed');
            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            const doc = docs.find(d => d._id === docId);
            link.download = `${doc ? doc.title.replace(/[^a-z0-9]/gi, '_') : 'document'}.${fmt}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
        } catch (e) { alert('Download failed. Please try again.'); }
    }, [docs]);

    const handleLogout = () => { logout(); navigate('/'); };

    // ══════════════════════════════════════════════════════════════════════════
    // SIDEBAR
    // ══════════════════════════════════════════════════════════════════════════
    const mainNav = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
        { id: 'create', label: 'Generate Document', icon: FilePlus, path: '/documents/create' },
        { id: 'templates', label: 'Templates', icon: Layers, path: '/templates' },
        { id: 'catalog', label: 'Industry Packs', icon: Package, path: '/dashboard/catalog' },
        { id: 'documents', label: 'My Documents', icon: FileText, path: '/documents' },
    ];
    const otherNav = [
        { id: 'workflows', label: 'Workflows', icon: GitBranch, path: '/workflows' },
        { id: 'analytics', label: 'Analytics', icon: BarChart, path: '/analytics' },
    ];

    const Sidebar = () => (
        <>
            {/* mobile overlay */}
            {isMobile && sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 998
                }} />
            )}

            <aside style={{
                width: 220, minHeight: '100vh',
                backgroundColor: '#fff', borderRight: '1px solid #E5E7EB',
                display: 'flex', flexDirection: 'column', zIndex: 999,
                position: 'fixed', top: 0, left: isMobile ? (sidebarOpen ? 0 : -220) : 0,
                transition: 'left 0.3s ease', overflowY: 'auto',
                fontFamily: 'Inter, sans-serif'
            }}>
                {/* logo */}
                <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <FileText size={17} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#111827', letterSpacing: '-0.02em' }}>MM Docs</span>
                    {isMobile && (
                        <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={18} color="#6B7280" />
                        </button>
                    )}
                </div>

                {/* nav */}
                <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* MAIN MENU */}
                    <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 10 }}>MAIN MENU</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {mainNav.map(item => {
                                const isActive = currentView === item.id;
                                const Icon = item.icon;
                                return (
                                    <button key={item.id}
                                        onClick={() => { navigate(item.path); if (isMobile) setSidebarOpen(false); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '9px 12px', borderRadius: 10, border: 'none',
                                            background: isActive ? '#5C67F2' : 'transparent',
                                            color: isActive ? '#fff' : '#4B5563',
                                            fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                                            transition: 'all 0.18s', width: '100%'
                                        }}
                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F3F4F6'; }}
                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* OTHERS */}
                    <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 10 }}>OTHERS</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {otherNav.map(item => {
                                const isActive = currentView === item.id;
                                const Icon = item.icon;
                                return (
                                    <button key={item.id}
                                        onClick={() => { navigate(item.path); if (isMobile) setSidebarOpen(false); }}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '9px 12px', borderRadius: 10, border: 'none',
                                            background: isActive ? '#5C67F2' : 'transparent',
                                            color: isActive ? '#fff' : '#4B5563',
                                            fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                                            transition: 'all 0.18s', width: '100%'
                                        }}
                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F3F4F6'; }}
                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* upgrade banner */}
                {showUpgradeBanner && (
                    <div style={{
                        margin: '0 10px 16px', padding: '16px 14px',
                        border: '1px solid #E5E7EB', borderRadius: 14,
                        background: '#fff', position: 'relative',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                        <button onClick={() => setShowUpgradeBanner(false)} style={{
                            position: 'absolute', top: 10, right: 10,
                            background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2
                        }}><X size={13} /></button>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: 'rgba(92,103,242,0.1)', color: '#5C67F2',
                            borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, marginBottom: 8
                        }}>
                            <Zap size={12} fill="#5C67F2" /> 20 days left
                        </div>
                        <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.6, margin: '0 0 12px', fontWeight: 500 }}>
                            Upgrade to premium and enjoy the benefits for a long time
                        </p>
                        <button style={{
                            width: '100%', padding: '9px', background: '#fff',
                            border: '1px solid #E5E7EB', borderRadius: 9,
                            fontSize: 12, fontWeight: 700, color: '#374151', cursor: 'pointer',
                            transition: 'background 0.15s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >View Plan</button>
                    </div>
                )}
            </aside>
        </>
    );

    // ══════════════════════════════════════════════════════════════════════════
    // TOP HEADER
    // ══════════════════════════════════════════════════════════════════════════
    const TopHeader = () => (
        <header style={{
            height: 64, background: '#fff', borderBottom: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 28px', position: 'sticky', top: 0, zIndex: 100, gap: 16,
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {isMobile && (
                    <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                        <Menu size={22} color="#374151" />
                    </button>
                )}
                <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                    Dashboard
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 420, marginLeft: 'auto' }}>
                {!isMobile && (
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input
                            type="text"
                            placeholder="Search documents, templates..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '9px 14px 9px 40px',
                                border: '1px solid #E5E7EB', borderRadius: 10,
                                fontSize: 13, background: '#F9FAFB', outline: 'none',
                                color: '#374151', transition: 'all 0.2s', boxSizing: 'border-box'
                            }}
                            onFocus={e => { e.target.style.borderColor = '#5C67F2'; e.target.style.boxShadow = '0 0 0 3px rgba(92,103,242,0.12)'; e.target.style.background = '#fff'; }}
                            onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F9FAFB'; }}
                        />
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
                {/* Bell */}
                <div style={{ position: 'relative', cursor: 'pointer' }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10, border: '1px solid #E5E7EB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#fff', transition: 'background 0.15s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                        <Bell size={18} color="#374151" />
                    </div>
                    <span style={{
                        position: 'absolute', top: 8, right: 8,
                        width: 8, height: 8, background: '#EF4444',
                        borderRadius: '50%', border: '2px solid #fff'
                    }} />
                </div>

                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                    onClick={handleLogout}
                    title="Click to logout"
                >
                    {!isMobile && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{user?.name || 'Audrey Lay'}</div>
                            <div style={{ fontSize: 11, color: '#6B7280' }}>{user?.email || 'user@email.com'}</div>
                        </div>
                    )}
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 14
                    }}>
                        {(user?.name?.charAt(0) || 'A').toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );

    // ══════════════════════════════════════════════════════════════════════════
    // DASHBOARD OVERVIEW (matches mockup exactly)
    // ══════════════════════════════════════════════════════════════════════════
    const DashboardOverview = () => {
        const weekData = buildWeekData(docs);

        // derive stats from real data
        const totalDocs = docs.length;
        const recentDocs = [...docs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

        // most used doc type
        const typeCounts = docs.reduce((acc, d) => {
            const t = d.type || 'other';
            acc[t] = (acc[t] || 0) + 1;
            return acc;
        }, {});
        const mostUsed = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
        const mostUsedLabel = mostUsed
            ? mostUsed[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, 8)
            : 'NDA';

        const placeholderRecentDocs = [
            { title: 'Employment Contract', status: 'Download', time: '1 hour ago', icon: FileText },
            { title: 'Invoice Downloaded', status: 'Download', time: 'Yesterday', icon: FileSpreadsheet },
            { title: 'Offer Letter Generated', status: 'Download', time: '2 days ago', icon: Edit3 },
            { title: 'Employment Contract', status: 'Download', time: '3 days ago', icon: FileText },
        ];

        const displayedRecentDocs = recentDocs.length > 0
            ? recentDocs.map(d => ({
                title: d.title,
                status: 'Download',
                time: timeAgo(d.createdAt),
                icon: FileText,
                id: d._id
            }))
            : placeholderRecentDocs;

        return (
            <div style={{ padding: isMobile ? '16px' : '24px 28px', fontFamily: 'Inter, sans-serif' }}>

                {/* ── Stat Cards ─────────────────────────────────────────── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ staggerChildren: 0.1 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                        gap: isMobile ? 12 : 20,
                        marginBottom: 24
                    }}
                >
                    {[
                        { label: 'Total Documents Created', value: totalDocs || 12, icon: FileText, color: '#6366F1', bg: '#EEF2FF', trend: '+15%' },
                        { label: 'Monthly Revenue', value: '$150', icon: DollarSign, color: '#10B981', bg: '#ECFDF5', badge: '+10.2%' },
                        { label: 'Most Used Category', value: mostUsedLabel, icon: Star, color: '#8B5CF6', bg: '#F5F3FF', trend: 'Trending' },
                        { label: 'Estimated Time Saved', value: `${Math.max(1, Math.floor(totalDocs * 0.5))} hrs`, icon: Clock, color: '#F59E0B', bg: '#FFFBEB', badge: '+2 hrs' },
                    ].map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(12px)',
                                    borderRadius: 16, 
                                    padding: '20px',
                                    border: '1px solid rgba(229, 231, 235, 0.5)',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                                    cursor: 'default',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Decorative gradient blob */}
                                <div style={{
                                    position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                                    background: `radial-gradient(circle, ${card.color}20 0%, transparent 70%)`,
                                    borderRadius: '50%'
                                }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        background: card.bg, color: card.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Icon size={20} />
                                    </div>
                                    <div style={{ color: '#9CA3AF', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
                                        <MoreHorizontal size={16} />
                                    </div>
                                </div>
                                <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {card.value}
                                    {(card.badge || card.trend) && (
                                        <span style={{ fontSize: 11, fontWeight: 700, color: card.badge ? '#10B981' : '#6366F1', display: 'flex', alignItems: 'center', gap: 2, background: card.badge ? '#ECFDF5' : '#EEF2FF', padding: '2px 8px', borderRadius: 12 }}>
                                            {card.badge && <ArrowUp size={11} />}
                                            {card.badge || card.trend}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginTop: 4 }}>{card.label}</div>
                                
                                {/* Tiny sparkline placeholder */}
                                <svg width="100%" height="20" viewBox="0 0 100 20" style={{ marginTop: 12, opacity: 0.5 }}>
                                    <path d="M0,15 Q10,5 20,10 T40,10 T60,5 T80,12 T100,5" fill="none" stroke={card.color} strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ── Middle Row: Recent Docs hero + AI Assistant ────────── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
                        gap: 20,
                        marginBottom: 20
                    }}
                >
                    {/* Recent Documents hero */}
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>Recent Documents</h3>
                        <div style={{
                            background: 'linear-gradient(160deg, #F8F9FF 0%, #F3F4FF 100%)',
                            border: '1px dashed #C7D2FE', borderRadius: 14,
                            padding: '36px 24px', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', textAlign: 'center'
                        }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: 14, background: '#EEF2FF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
                            }}>
                                <FileText size={28} color="#6366F1" />
                            </div>
                            <h4 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
                                {docs.length === 0 ? 'Create Your First Document' : 'Generate a New Document'}
                            </h4>
                            <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 24px', maxWidth: 340, lineHeight: 1.6 }}>
                                Generate contracts, invoices, or HR documents in seconds.
                            </p>
                            <button onClick={() => navigate('/documents/create')} style={{
                                padding: '12px 28px', background: '#5C67F2', color: '#fff',
                                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                                cursor: 'pointer', boxShadow: '0 4px 14px rgba(92,103,242,0.35)',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(92,103,242,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(92,103,242,0.35)'; }}
                            >
                                Generate Document
                            </button>
                        </div>
                    </div>

                    {/* AI Assistant */}
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>AI Assistant</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                            {[
                                'Create HR offer letter',
                                'Generate NDA',
                                'Review Legal document'
                            ].map((action, i) => (
                                <div key={i}
                                    onClick={() => navigate('/documents/create')}
                                    style={{
                                        padding: '13px 16px', background: '#F5F3FF',
                                        borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
                                        cursor: 'pointer', transition: 'all 0.18s', border: '1px solid transparent'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#EDE9FE'; e.currentTarget.style.borderColor = '#C4B5FD'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#F5F3FF'; e.currentTarget.style.borderColor = 'transparent'; }}
                                >
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366F1', flexShrink: 0 }} />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#4B5563' }}>{action}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => navigate('/documents/create')} style={{
                            marginTop: 16, padding: '13px', background: '#5C67F2', color: '#fff',
                            border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            cursor: 'pointer', transition: 'opacity 0.2s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            <Wand2 size={16} /> Ask AI
                        </button>
                    </div>
                </motion.div>

                {/* ── Bottom Row: Recent Docs list + Chart + Live Activity ──────────────── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.5fr 1fr',
                        gap: 20
                    }}
                >
                    {/* Live Activity Feed */}
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block', flexShrink: 0, padding: 0 }} />
                                Live Activity
                            </h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, position: 'relative' }}>
                            {/* vertical line */}
                            <div style={{ position: 'absolute', left: 15, top: 15, bottom: 15, width: 2, background: '#F3F4F6', zIndex: 0 }} />
                            
                            {[
                                { action: 'Document Generated', target: 'Offer Letter', time: 'Just now', icon: FilePlus, color: '#10B981', bg: '#D1FAE5' },
                                { action: 'Template Viewed', target: 'NDA Standard', time: '10 mins ago', icon: Eye, color: '#8B5CF6', bg: '#EDE9FE' },
                                { action: 'Draft Saved', target: 'Service Agreement', time: '1 hour ago', icon: Save, color: '#F59E0B', bg: '#FEF3C7' },
                                { action: 'Login Successful', target: user?.name || 'User', time: '2 hours ago', icon: Shield, color: '#6366F1', bg: '#E0E7FF' },
                            ].map((act, i) => {
                                const Icon = act.icon;
                                return (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 1 }}
                                    >
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: act.bg, color: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #fff' }}>
                                            <Icon size={14} strokeWidth={2.5} />
                                        </div>
                                        <div style={{ flex: 1, marginTop: 4 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', lineHeight: 1.3 }}>
                                                {act.action} <span style={{ color: '#111827', fontWeight: 700 }}>{act.target}</span>
                                            </div>
                                            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{act.time}</div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Documents list */}
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Documents</h3>
                            <button onClick={() => navigate('/documents')} style={{
                                background: 'none', border: 'none', color: '#6366F1', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                            }}>View all</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {displayedRecentDocs.map((doc, i) => {
                                const Icon = doc.icon || FileText;
                                return (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 0',
                                        borderBottom: i < displayedRecentDocs.length - 1 ? '1px solid #F3F4F6' : 'none'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{
                                                width: 42, height: 42, borderRadius: 10, background: '#EEF2FF',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1', flexShrink: 0
                                            }}>
                                                <Icon size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{doc.title}</div>
                                                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{doc.status}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500, whiteSpace: 'nowrap' }}>{doc.time}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Weekly Chart */}
                    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 20px' }}>Documents Generated This Week</h3>
                        <div style={{ flex: 1, minHeight: 200 }}>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={weekData} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} allowDecimals={false} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: 12, fontSize: 12, fontWeight: 600, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                        cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone" dataKey="count"
                                        stroke="#6366F1" strokeWidth={3}
                                        fill="url(#docGrad)"
                                        dot={{ fill: '#fff', stroke: '#6366F1', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#6366F1', stroke: '#fff', strokeWidth: 3 }}
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    // ══════════════════════════════════════════════════════════════════════════
    // MY DOCUMENTS VIEW (inline minimal)
    // ══════════════════════════════════════════════════════════════════════════
    const MyDocumentsView = () => (
        <div style={{ padding: isMobile ? 16 : '24px 28px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>My Documents</h2>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0' }}>Manage and organize your generated documents</p>
                </div>
                <button onClick={() => navigate('/documents/create')} style={{
                    padding: '10px 18px', background: '#5C67F2', color: '#fff',
                    border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}>
                    <Plus size={15} /> New Document
                </button>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                {docs.length > 0 ? (
                    <>
                        {!isMobile && (
                            <div style={{
                                display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 120px',
                                padding: '12px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
                                fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                                <div>Document</div><div>Created</div><div>Status</div><div>Actions</div>
                            </div>
                        )}
                        {docs.map((doc, idx) => (
                            <div key={doc._id || idx} style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '2.5fr 1fr 1fr 120px',
                                alignItems: 'center', gap: 12, padding: '14px 20px',
                                borderBottom: idx < docs.length - 1 ? '1px solid #F3F4F6' : 'none',
                                transition: 'background 0.15s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1', flexShrink: 0 }}>
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{doc.title}</div>
                                        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{(doc.type || 'document').replace(/_/g, ' ')}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 13, color: '#6B7280' }}>{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', background: '#DCFCE7', padding: '3px 10px', borderRadius: 20, display: 'inline-block' }}>Completed</div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => navigate(`/document/editor/${doc._id}`)} style={{ padding: 6, background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, cursor: 'pointer', color: '#6B7280' }} title="Edit">
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => handleDownload(doc._id, 'pdf')} style={{ padding: 6, background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, cursor: 'pointer', color: '#6B7280' }} title="Download">
                                        <Download size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div style={{ padding: '60px 24px', textAlign: 'center', color: '#6B7280' }}>
                        <FileText size={56} color="#D1D5DB" style={{ marginBottom: 16 }} />
                        <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', color: '#374151' }}>No documents yet</h3>
                        <p style={{ fontSize: 14, margin: '0 0 24px' }}>Create your first document to get started</p>
                        <button onClick={() => navigate('/documents/create')} style={{
                            padding: '11px 22px', background: '#5C67F2', color: '#fff',
                            border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer'
                        }}>Create Document</button>
                    </div>
                )}
            </div>
        </div>
    );

    // ══════════════════════════════════════════════════════════════════════════
    // RENDER CONTENT
    // ══════════════════════════════════════════════════════════════════════════
    const renderContent = () => {
        switch (currentView) {
            case 'dashboard': return <DashboardOverview />;
            case 'documents': return <MyDocumentsView />;
            case 'templates': return <TemplatesPage />;
            case 'create':
            case 'hr':
            case 'sales':
            case 'finance':
            case 'compliance':
            case 'generate-document':
                return (
                    <LegacyCreateDocumentFlow 
                         currentView={currentView}
                         setCurrentView={setCurrentView}
                         selectedDocType={selectedDocType}
                         setSelectedDocType={setSelectedDocType}
                         user={user}
                         brandKit={brandKit}
                         organization={organization}
                         isMobile={isMobile}
                         isTablet={window.innerWidth <= 1024}
                         docs={docs}
                         setDocs={setDocs}
                         setError={setError}
                         token={token}
                    />
                );
            default: return <DashboardOverview />;
        }
    };

    // ══════════════════════════════════════════════════════════════════════════
    // ROOT LAYOUT
    // ══════════════════════════════════════════════════════════════════════════
    return (
        <div style={{
            display: 'flex', minHeight: '100vh',
            background: '#F8F9FB',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: #F3F4F6; }
                ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
            `}</style>

            <Sidebar />

            <div style={{ marginLeft: isMobile ? 0 : 220, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <TopHeader />
                <main style={{ flex: 1 }}>
                    {error && (
                        <div style={{
                            margin: '12px 28px', padding: '12px 16px',
                            background: '#FEF2F2', border: '1px solid #FECACA',
                            borderRadius: 10, color: '#B91C1C',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B91C1C', fontSize: 18, lineHeight: 1 }}>×</button>
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}