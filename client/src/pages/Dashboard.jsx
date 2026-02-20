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
    ChevronRight, Layout, LogOut
} from 'lucide-react';

const LogoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L22 10L28 4V24C28 26.2091 26.2091 28 24 28H8C5.79086 28 4 26.2091 4 24V4L10 10L16 4Z" fill="#7C3AED" />
    </svg>
);

export default function Dashboard() {
    const { user, logout, login, token } = useAuth();
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState('Home'); // Home, Settings, Templates, Trash, Search, Inbox
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [aiMode, setAiMode] = useState('Ask'); // Ask, Research, Build
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDoc, setGeneratedDoc] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarWidth, setSidebarWidth] = useState(240);
    const [isResizing, setIsResizing] = useState(false);
    const [docs, setDocs] = useState([]);
    const [brandKit, setBrandKit] = useState(null);
    const [error, setError] = useState(null);
    const [isPro, setIsPro] = useState(user?.plan === 'pro');
    const [selectedDocType, setSelectedDocType] = useState(null);
    const [quotationData, setQuotationData] = useState({ clientName: '', projectScope: '', amount: '' });
    const [proposalData, setProposalData] = useState({ clientName: '', industryFocus: '', coreModules: '' });
    const [emailData, setEmailData] = useState({ targetAudience: '', valueProposition: '', callToAction: '' });
    const [profileData, setProfileData] = useState({ companyName: '', coreFocus: '', vision: '' });
    const [pitchData, setPitchData] = useState({ productName: '', targetMarket: '', competitiveAdvantage: '' });
    const sidebarRef = useRef(null);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async () => {
        const res = await loadRazorpayScript();
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        try {
            const order = await api.post('/payments/create-order', {});

            const options = {
                key: "rzp_test_YourKeyId",
                amount: order.amount,
                currency: order.currency,
                name: "MM Docs",
                description: "Pro Plan Subscription",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/payments/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        alert(verifyRes.message);
                        setIsPro(true);

                        if (user && token) {
                            const updatedUser = { ...user, plan: 'pro' };
                            login(updatedUser, token);
                        }
                    } catch (err) {
                        alert("Payment Verification Failed!");
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: { color: "#7c3aed" }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        } catch (error) {
            console.error("Payment init error:", error);
            alert("Could not initiate payment");
        }
    };

    const handleTemplateClick = (template) => {
        setAiMode('Build');
        setPrompt(`Create a ${template} for `);
        setCurrentView('Home');
        setGeneratedDoc(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const fetchData = async () => {
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
                setError(err.message);
            }
        };
        fetchData();
    }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!selectedDocType && !prompt.trim()) return;

        setIsGenerating(true);
        setError(null);
        try {
            let finalPrompt = prompt;
            let finalType = aiMode.toLowerCase();

            if (selectedDocType === 'quotation') {
                finalType = 'quotation';
                finalPrompt = `Client Name: ${quotationData.clientName} | Scope: ${quotationData.projectScope} | Amount: ${quotationData.amount}`;
            } else if (selectedDocType === 'proposal') {
                finalType = 'proposal';
                finalPrompt = `Client Name: ${proposalData.clientName} | Industry Focus: ${proposalData.industryFocus} | Core Modules/Services: ${proposalData.coreModules}`;
            } else if (selectedDocType === 'email') {
                finalType = 'sales email';
                finalPrompt = `Target Audience: ${emailData.targetAudience} | Value Proposition: ${emailData.valueProposition} | Call to Action: ${emailData.callToAction}`;
            } else if (selectedDocType === 'profile') {
                finalType = 'profile';
                finalPrompt = `Company Name/Entity: ${profileData.companyName} | Core Focus: ${profileData.coreFocus} | Vision/Goal: ${profileData.vision}`;
            } else if (selectedDocType === 'pitch') {
                finalType = 'pitch deck outline';
                finalPrompt = `Product/Service Name: ${pitchData.productName} | Target Market: ${pitchData.targetMarket} | Competitive Advantage: ${pitchData.competitiveAdvantage}`;
            }

            const result = await api.post('/ai/generate-document', {
                type: finalType,
                topic: finalPrompt,
                title: finalPrompt.length > 30 ? finalPrompt.substring(0, 30) + '...' : finalPrompt
            });

            console.log("Generation result:", result);
            setIsGenerating(false);
            setGeneratedDoc(result.document);
            // Refresh documents list
            const updatedDocs = await api.get('/documents');
            setDocs(updatedDocs);
        } catch (err) {
            console.error("Generation error:", err);
            setIsGenerating(false);
            setError(err.message || "Failed to generate document");
        }
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleDownload = async (id, format) => {
        try {
            const token = localStorage.getItem('token');
            const url = `http://localhost:5000/api/documents/${id}/${format === 'pdf' ? 'download' : 'download-docx'}`;

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
            a.download = `${generatedDoc.title.replace(/[^a-z0-9]/gi, '_')}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download Error:", err);
            alert("Failed to download document");
        }
    };

    const saveBrandKit = async (data) => {
        try {
            let updatedKit;
            if (brandKit) {
                updatedKit = await api.put('/brand-kit', data);
            } else {
                updatedKit = await api.post('/brand-kit', data);
            }
            setBrandKit(updatedKit);
            alert("Brand Kit saved successfully! ✨");
        } catch (err) {
            console.error("Brand Kit save error:", err);
            alert("Failed to save Brand Kit: " + (err.response?.data?.message || err.message));
        }
    };

    const startResizing = useCallback((mouseDownEvent) => {
        setIsResizing(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }, []);

    const resize = useCallback((mouseMoveEvent) => {
        if (isResizing) {
            const newWidth = mouseMoveEvent.clientX;
            if (newWidth > 160 && newWidth < 480) {
                setSidebarWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    const privateDocs = {
        'strategy': {
            title: 'Q1 Growth Strategy',
            icon: '🎯',
            content: 'Our Q1 strategy focuses on aggressive market penetration through AI-optimized customer acquisition. Key pillars include scaling the document template library, enhancing SEO-driven landing pages, and implementing a high-conversion onboarding flow for SME founders.'
        },
        'vision': {
            title: 'MM Docs – Product Vision',
            icon: '🚀',
            content: `1. Product Overview \nMM Docs is an AI-powered SaaS that enables businesses to create professional, brand-consistent documents in minutes instead of days.\n\n2. Problem Statement \nBusinesses struggle with slow document creation, inconsistent branding, weak language, formatting issues, and outdated templates. These inefficiencies result in lost time, reduced credibility, and missed deals.\n\n3. Solution \nMM Docs provides AI-generated, structured business documents with professional language, automatic branding, and client-ready exports.\n\n4. Target Users \nFounders, sales teams, agencies, freelancers, SMEs, and enterprises across all industries and regions.\n\n5. Core Use Cases \nBusiness proposals, quotations, company profiles, sales emails, and pitch outlines.\n\n6. Branding System \nUsers set a one-time brand kit including name, logo, color, font preference, and description. Branding is automatically applied to all documents.`
        },
        'welcome': {
            title: 'Welcome to MM Docs!',
            icon: '👋',
            content: 'Welcome to your new workspace! MM Docs is designed to help you organize your thoughts, collaborate with your team, and generate professional documents with the help of AI. Explore the templates, start a search, or simply begin drafting your first document.'
        }
    };

    const renderMainContent = () => {
        const brandColor = brandKit?.colors?.[0] || '#7c3aed';

        if (generatedDoc && currentView === 'Home') {
            const renderObjectContent = (obj) => {
                return Object.entries(obj).map(([key, value]) => {
                    const label = key.replace(/([A-Z])/g, ' $1').trim().toUpperCase();

                    // Specialized rendering for list of objects (Table or Cards)
                    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                        // Check if it's a simple key-value table (like investment or items)
                        const keys = Object.keys(value[0]);
                        if (keys.length <= 4) {
                            return (
                                <div key={key} className="doc-section-container">
                                    <span className="doc-section-label" style={{ color: brandColor }}>{label}</span>
                                    <table className="doc-table">
                                        <thead>
                                            <tr>{keys.map(k => <th key={k}>{k.toUpperCase()}</th>)}</tr>
                                        </thead>
                                        <tbody>
                                            {value.map((item, i) => (
                                                <tr key={i}>{keys.map(k => <td key={k}>{item[k]}</td>)}</tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        }

                        // Otherwise render as grid of cards (like methodology or methodology)
                        return (
                            <div key={key} className="doc-section-container">
                                <span className="doc-section-label" style={{ color: brandColor }}>{label}</span>
                                <div className="doc-card-grid">
                                    {value.map((item, i) => (
                                        <div key={i} className="doc-card">
                                            {item.phase || item.role || item.title || item.name || item.service ? (
                                                <div className="doc-card-title" style={{ color: brandColor }}>
                                                    {item.phase || item.role || item.title || item.name || item.service}
                                                </div>
                                            ) : null}
                                            <div className="doc-card-content">
                                                {Object.entries(item)
                                                    .filter(([k]) => !['phase', 'role', 'title', 'name', 'service'].includes(k))
                                                    .map(([k, v]) => (
                                                        <div key={k} style={{ marginBottom: '4px' }}>
                                                            {Array.isArray(v) ? (
                                                                <ul style={{ paddingLeft: '14px', marginTop: '4px' }}>
                                                                    {v.map((li, idx) => <li key={idx} style={{ marginBottom: '2px' }}>{li}</li>)}
                                                                </ul>
                                                            ) : <p>{v}</p>}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    // Specialized Scope Rendering (Included / Excluded)
                    if (key === 'scope' && typeof value === 'object') {
                        return (
                            <div key={key} className="doc-section-container">
                                <span className="doc-section-label" style={{ color: brandColor }}>PROJECT SCOPE</span>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="doc-card" style={{ borderLeft: `4px solid #10b981` }}>
                                        <h4 style={{ margin: '0 0 10px', color: '#10b981', fontSize: '14px', textTransform: 'uppercase' }}>✅ Included</h4>
                                        <ul style={{ paddingLeft: '16px', margin: 0 }}>
                                            {value.included?.map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)}
                                        </ul>
                                    </div>
                                    <div className="doc-card" style={{ borderLeft: `4px solid #ef4444` }}>
                                        <h4 style={{ margin: '0 0 10px', color: '#ef4444', fontSize: '14px', textTransform: 'uppercase' }}>❌ Excluded</h4>
                                        <ul style={{ paddingLeft: '16px', margin: 0 }}>
                                            {value.excluded?.map((item, i) => <li key={i} style={{ marginBottom: '6px' }}>{item}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Nested object (like targetAudience or personalInfo)
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        return (
                            <div key={key} className="doc-section-container">
                                <span className="doc-section-label" style={{ color: brandColor }}>{label}</span>
                                <div className="doc-card" style={{ borderLeft: `4px solid ${brandColor}` }}>
                                    {Object.entries(value).map(([innerK, innerV]) => (
                                        <div key={innerK} style={{ marginBottom: '8px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#999', textTransform: 'uppercase' }}>{innerK}</span>
                                            <p style={{ margin: 0, fontSize: '15px' }}>{innerV}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    // Standard Array of Strings
                    if (Array.isArray(value)) {
                        return (
                            <div key={key} className="doc-section-container">
                                <span className="doc-section-label" style={{ color: brandColor }}>{label}</span>
                                {value.map((item, i) => (
                                    <div key={i} className="doc-list-item" style={{ '--color-brand-purple': brandColor }}>{item}</div>
                                ))}
                            </div>
                        );
                    }

                    // Default string/number
                    return (
                        <div key={key} className="doc-section-container">
                            <span className="doc-section-label" style={{ color: brandColor }}>{label}</span>
                            <p style={{ margin: 0 }}>{value}</p>
                        </div>
                    );
                });
            };

            return (
                <motion.div
                    className="document-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <button className="back-btn" style={{ margin: 0 }} onClick={() => setGeneratedDoc(null)}>← Back to Home</button>
                        {generatedDoc._id && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="sidebar-btn" style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: '600' }} onClick={() => handleDownload(generatedDoc._id, 'pdf')}>↓ PDF</button>
                                <button className="sidebar-btn" style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: '600' }} onClick={() => handleDownload(generatedDoc._id, 'docx')}>↓ DOCX</button>
                            </div>
                        )}
                    </div>

                    <div className="doc-meta-header">
                        <div>
                            <span className="doc-brand-badge" style={{ background: brandColor }}>
                                {brandKit?.name || "MM Docs"}
                            </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#999', fontWeight: '500' }}>
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    <h1 className="doc-title" style={{ fontSize: '42px', letterSpacing: '-0.02em', marginBottom: '32px' }}>
                        {generatedDoc.title}
                    </h1>

                    <div className="doc-content">
                        {typeof generatedDoc.content === 'object' && generatedDoc.content !== null ?
                            renderObjectContent(generatedDoc.content) :
                            (typeof generatedDoc.content === 'string' ?
                                generatedDoc.content.split('\n').map((line, i) => <p key={i}>{line}</p>) :
                                <p>{String(generatedDoc.content)}</p>
                            )
                        }
                    </div>

                    <div style={{ marginTop: '80px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#ccc' }}>Generated with MM Docs AI • {brandKit?.name || "Professional"} Workspace</p>
                    </div>
                </motion.div>
            );
        }

        if (isGenerating) {
            return (
                <motion.div
                    className="generating-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="ai-loader">
                        <Sparkles className="sparkle-icon" />
                        <h2>AI is crafting your document...</h2>
                        <div className="progress-bar">
                            <motion.div
                                className="progress-fill"
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 3 }}
                            />
                        </div>
                    </div>
                </motion.div>
            );
        }

        switch (currentView) {
            case 'Search':
                return (
                    <motion.div className="feature-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="view-header">
                            <h1>Search</h1>
                            <p>Find documents, pages, and everything in your workspace.</p>
                        </div>
                        <div className="search-container">
                            <div className="search-bar-expanded">
                                <Search size={20} />
                                <input
                                    type="text"
                                    placeholder="Search for documents..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="search-results">
                                {searchQuery ? (
                                    <div className="results-list">
                                        <div className="result-item">
                                            <FileText size={16} />
                                            <span>SLMobbin Creative Strat...</span>
                                        </div>
                                        <div className="result-item">
                                            <Globe size={16} />
                                            <span>Document Hub</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="search-empty">
                                        <Search size={48} />
                                        <p>Type something to search your workspace</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            case 'Inbox':
                return (
                    <motion.div className="feature-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="view-header">
                            <h1>Inbox</h1>
                            <p>Stay updated with your latest notifications and comments.</p>
                        </div>
                        <div className="inbox-list">
                            {[
                                { title: 'Welcome to MM Docs', time: '2h ago', content: 'Explore our features and get started with AI documents.', unread: true },
                                { title: 'Collaboration invite', time: 'Yesterday', content: 'Shree invited you to edit "Creative Strategy".', unread: false }
                            ].map((msg, i) => (
                                <div key={i} className={`inbox-item ${msg.unread ? 'unread' : ''}`}>
                                    <div className="inbox-item-header">
                                        <h4>{msg.title}</h4>
                                        <span>{msg.time}</span>
                                    </div>
                                    <p>{msg.content}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'Settings':
                return (
                    <motion.div className="feature-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="view-header">
                            <h1>Settings</h1>
                            <p>Manage your account preferences and brand kit.</p>
                        </div>
                        <div className="settings-grid">
                            <div className="settings-card">
                                <h3>Brand Kit</h3>
                                <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Your brand kit is automatically applied to all AI-generated documents.</p>
                                <form className="brand-kit-form" onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    saveBrandKit({
                                        name: formData.get('companyName'),
                                        colors: [formData.get('brandColor'), '#ffffff'],
                                        description: formData.get('description'),
                                        logo: formData.get('logo'),
                                        fonts: {
                                            primary: formData.get('primaryFont'),
                                            secondary: formData.get('secondaryFont')
                                        }
                                    });
                                }}>
                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '8px', color: '#999', textTransform: 'uppercase' }}>Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            defaultValue={brandKit?.name || "MediaaMasala"}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee', background: '#f9f9f8' }}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '8px', color: '#999', textTransform: 'uppercase' }}>Brand Color</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <input
                                                    type="color"
                                                    name="brandColor"
                                                    defaultValue={brandKit?.colors?.[0] || "#7C3AED"}
                                                    style={{ width: '40px', height: '40px', padding: '0', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                                />
                                                <span style={{ fontSize: '13px', color: '#333', fontWeight: '600' }}>{brandKit?.colors?.[0] || "#7C3AED"}</span>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '8px', color: '#999', textTransform: 'uppercase' }}>Primary Font</label>
                                            <select
                                                name="primaryFont"
                                                defaultValue={brandKit?.fonts?.primary || "Inter"}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#f9f9f8' }}
                                            >
                                                <option>Inter</option>
                                                <option>Outfit</option>
                                                <option>Roboto</option>
                                                <option>System Default</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '8px', color: '#999', textTransform: 'uppercase' }}>Logo URL</label>
                                        <input
                                            type="text"
                                            name="logo"
                                            placeholder="https://example.com/logo.png"
                                            defaultValue={brandKit?.logo || ""}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee', background: '#f9f9f8' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '8px', color: '#999', textTransform: 'uppercase' }}>Company Description</label>
                                        <textarea
                                            name="description"
                                            placeholder="Describe your brand values and tone..."
                                            defaultValue={brandKit?.description || "AI Business Document SaaS for internal alignment, investor reference, and product execution."}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #eee', background: '#f9f9f8', minHeight: '100px', fontFamily: 'inherit' }}
                                        />
                                    </div>
                                    <button type="submit" className="primary-btn sm" style={{ marginTop: '20px', width: '100%', padding: '12px 0' }}>Save Brand Kit ✨</button>
                                </form>
                            </div>
                            <div className="settings-card">
                                <h3>Subscription</h3>
                                <div className="pricing-card" style={{ padding: '20px', background: '#f9f9f8', borderRadius: '12px', border: '1px solid #eee', marginTop: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: 0 }}>Pro Plan</h4>
                                            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#666' }}>₹999 / month</p>
                                        </div>
                                        {isPro ? (
                                            <span style={{ padding: '4px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Active</span>
                                        ) : (
                                            <button type="button" onClick={handleUpgrade} className="primary-btn sm" style={{ padding: '8px 16px' }}>Upgrade Now</button>
                                        )}
                                    </div>
                                    {!isPro && <p style={{ fontSize: '12px', color: '#666', marginTop: '12px', paddingBottom: '0' }}>Upgrade to unlock watermark-free exports and full AI context mapping.</p>}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'Templates':
                return (
                    <motion.div className="feature-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="view-header">
                            <h1>Templates</h1>
                            <p>Professional structures for every business need.</p>
                        </div>
                        <div className="templates-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                            {['Business Proposal', 'Quotation', 'Company Profile', 'Sales Email', 'Pitch Outline'].map(template => (
                                <div
                                    key={template}
                                    className="template-card"
                                    onClick={() => handleTemplateClick(template)}
                                    style={{ padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #eee', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                    <FileText size={24} color="#7c3aed" />
                                    <h4 style={{ marginTop: '12px', marginBottom: '8px' }}>{template}</h4>
                                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>AI-optimized structure</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            case 'Trash':
                return (
                    <motion.div className="feature-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="view-header">
                            <h1>Trash</h1>
                            <p>Recently deleted entries.</p>
                        </div>
                        <div className="empty-state" style={{ textAlign: 'center', padding: '100px 0' }}>
                            <Trash2 size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                            <p style={{ color: '#999' }}>No items in trash.</p>
                        </div>
                    </motion.div>
                );
            default:
                return (
                    <motion.div
                        className="home-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="greeting">
                            <div className="greeting-icon">🪄</div>
                            <h1>Good evening, {user?.name?.split(' ')[0]}</h1>
                        </div>

                        {/* AI Command Center / Document Generator */}
                        <div className="ai-command-center" style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                            {!selectedDocType ? (
                                <div>
                                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>What would you like to create?</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                        <button className="doc-type-btn" onClick={() => setSelectedDocType('quotation')} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>💰</span>
                                            <span style={{ fontWeight: '600', color: '#0f172a', display: 'block' }}>Quotation</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Detailed pricing proposals</span>
                                        </button>
                                        <button className="doc-type-btn" onClick={() => setSelectedDocType('proposal')} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📄</span>
                                            <span style={{ fontWeight: '600', color: '#0f172a', display: 'block' }}>Proposal</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Strategic business proposals</span>
                                        </button>
                                        <button className="doc-type-btn" onClick={() => setSelectedDocType('email')} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>✉️</span>
                                            <span style={{ fontWeight: '600', color: '#0f172a', display: 'block' }}>Sales Email</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Conversion-optimized outreach</span>
                                        </button>
                                        <button className="doc-type-btn" onClick={() => setSelectedDocType('profile')} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🏢</span>
                                            <span style={{ fontWeight: '600', color: '#0f172a', display: 'block' }}>Company Profile</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Corporate overviews</span>
                                        </button>
                                        <button className="doc-type-btn" onClick={() => setSelectedDocType('pitch')} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>📊</span>
                                            <span style={{ fontWeight: '600', color: '#0f172a', display: 'block' }}>Pitch Deck</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Investor-ready outlines</span>
                                        </button>
                                        <button className="doc-type-btn" onClick={() => setSelectedDocType('other')} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>⚡</span>
                                            <span style={{ fontWeight: '600', color: '#0f172a', display: 'block' }}>Custom</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Anything else</span>
                                        </button>
                                    </div>
                                </div>
                            ) : selectedDocType === 'quotation' ? (
                                <form onSubmit={handleGenerate}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Create Quotation</h3>
                                        <button type="button" onClick={() => setSelectedDocType(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>← Back</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Client Name</label>
                                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={quotationData.clientName} onChange={(e) => setQuotationData({ ...quotationData, clientName: e.target.value })} placeholder="e.g. Acme Corp" required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Project Scope / Description</label>
                                            <textarea style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', minHeight: '80px', fontFamily: 'inherit' }} value={quotationData.projectScope} onChange={(e) => setQuotationData({ ...quotationData, projectScope: e.target.value })} placeholder="e.g. Full website redesign including 10 pages and SEO setup." required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Total Package Amount (optional)</label>
                                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={quotationData.amount} onChange={(e) => setQuotationData({ ...quotationData, amount: e.target.value })} placeholder="e.g. $5,000" />
                                        </div>
                                        <button type="submit" className="primary-btn" style={{ marginTop: '8px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                            <Sparkles size={16} /> Generate Quotation
                                        </button>
                                    </div>
                                </form>
                            ) : selectedDocType === 'proposal' ? (
                                <form onSubmit={handleGenerate}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Create Business Proposal</h3>
                                        <button type="button" onClick={() => setSelectedDocType(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>← Back</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Client / Prospect Name</label>
                                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={proposalData.clientName} onChange={(e) => setProposalData({ ...proposalData, clientName: e.target.value })} placeholder="e.g. Globex Inc." required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Industry / Focus Area</label>
                                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={proposalData.industryFocus} onChange={(e) => setProposalData({ ...proposalData, industryFocus: e.target.value })} placeholder="e.g. Healthcare Logistics" required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Core Modules / Services Offered</label>
                                            <textarea style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', minHeight: '80px', fontFamily: 'inherit' }} value={proposalData.coreModules} onChange={(e) => setProposalData({ ...proposalData, coreModules: e.target.value })} placeholder="e.g. Fleet tracking, predictive maintenance..." required />
                                        </div>
                                        <button type="submit" className="primary-btn" style={{ marginTop: '8px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                            <Sparkles size={16} /> Generate Proposal
                                        </button>
                                    </div>
                                </form>
                            ) : selectedDocType === 'email' ? (
                                <form onSubmit={handleGenerate}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Create Sales Email</h3>
                                        <button type="button" onClick={() => setSelectedDocType(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>← Back</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Target Audience</label>
                                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={emailData.targetAudience} onChange={(e) => setEmailData({ ...emailData, targetAudience: e.target.value })} placeholder="e.g. VP of Sales in SaaS companies" required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Core Value Proposition</label>
                                            <textarea style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', minHeight: '80px', fontFamily: 'inherit' }} value={emailData.valueProposition} onChange={(e) => setEmailData({ ...emailData, valueProposition: e.target.value })} placeholder="e.g. Reduce churn by 15% using predictive AI." required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Call to Action (CTA)</label>
                                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={emailData.callToAction} onChange={(e) => setEmailData({ ...emailData, callToAction: e.target.value })} placeholder="e.g. Schedule a 10-minute demo this Thursday." required />
                                        </div>
                                        <button type="submit" className="primary-btn" style={{ marginTop: '8px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                            <Sparkles size={16} /> Generate Email
                                        </button>
                                    </div>
                                </form>
                            ) : selectedDocType === 'profile' ? (
                                <form onSubmit={handleGenerate}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Create Company Profile</h3>
                                        <button type="button" onClick={() => setSelectedDocType(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>← Back</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Company Name / Focus Entity</label>
                                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={profileData.companyName} onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })} placeholder="e.g. FinTech Innovations Ltd." required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Core Focus Area</label>
                                            <textarea style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', minHeight: '80px', fontFamily: 'inherit' }} value={profileData.coreFocus} onChange={(e) => setProfileData({ ...profileData, coreFocus: e.target.value })} placeholder="e.g. Next-generation blockchain payments for B2B." required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Company Vision</label>
                                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={profileData.vision} onChange={(e) => setProfileData({ ...profileData, vision: e.target.value })} placeholder="e.g. To decentralize global transactions." required />
                                        </div>
                                        <button type="submit" className="primary-btn" style={{ marginTop: '8px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                            <Sparkles size={16} /> Generate Profile
                                        </button>
                                    </div>
                                </form>
                            ) : selectedDocType === 'pitch' ? (
                                <form onSubmit={handleGenerate}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Create Pitch Deck Outline</h3>
                                        <button type="button" onClick={() => setSelectedDocType(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>← Back</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Product / Project Name</label>
                                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={pitchData.productName} onChange={(e) => setPitchData({ ...pitchData, productName: e.target.value })} placeholder="e.g. SmartServe POS" required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Target Market</label>
                                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} value={pitchData.targetMarket} onChange={(e) => setPitchData({ ...pitchData, targetMarket: e.target.value })} placeholder="e.g. QSRs and independent cafes." required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Competitive Advantage / Innovation</label>
                                            <textarea style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', minHeight: '80px', fontFamily: 'inherit' }} value={pitchData.competitiveAdvantage} onChange={(e) => setPitchData({ ...pitchData, competitiveAdvantage: e.target.value })} placeholder="e.g. Cloud-first architecture with instant offline sync." required />
                                        </div>
                                        <button type="submit" className="primary-btn" style={{ marginTop: '8px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                            <Sparkles size={16} /> Generate Pitch Outline
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleGenerate} className="ai-input-wrapper">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', position: 'absolute', top: '-40px', width: '100%' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748b' }}>Creating: {selectedDocType === 'proposal' ? 'Business Proposal' : 'Custom Document'}</span>
                                        <button type="button" onClick={() => setSelectedDocType(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>← Back</button>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={`Describe the ${selectedDocType} you want to create...`}
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                    <div className="ai-input-controls">
                                        <div className="control-icons" style={{ marginLeft: 'auto' }}>
                                            <button type="submit" className="send-btn" disabled={!prompt.trim()}>
                                                <ArrowUp size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Recently Visited Grid */}
                        <section className="content-section">
                            <div className="section-header">
                                <Clock size={16} />
                                <span>Recently visited</span>
                            </div>
                            <div className="recent-grid">
                                {docs.length > 0 ? docs.map((doc) => (
                                    <div key={doc._id} className="recent-card" onClick={() => setGeneratedDoc(doc)}>
                                        <div className={`card-thumb thumb-${doc.type === 'proposal' ? 'abstract' : 'light'}`} />
                                        <div className="card-info">
                                            <div className="card-title-row">
                                                <span className="card-emoji">{doc.type === 'proposal' ? '👀' : '👋'}</span>
                                                <span className="card-name">{doc.title}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="empty-docs-state">
                                        <p>No documents yet. Try generating one!</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Upcoming Events and Tasks */}
                        <div className="dashboard-grid-footer">
                            <section className="footer-section">
                                <div className="section-header">
                                    <Calendar size={16} />
                                    <span>Upcoming events</span>
                                </div>
                                <div className="event-list">
                                    <div className="event-item">
                                        <span className="event-date">Today July 11</span>
                                        <span className="event-dot purple" />
                                        <span className="event-title">Landing page</span>
                                    </div>
                                    <div className="event-item">
                                        <span className="event-date">Saturday July 12</span>
                                        <span className="event-dot purple" />
                                        <span className="event-title">Flag Banner</span>
                                    </div>
                                </div>
                            </section>

                            <section className="footer-section">
                                <div className="section-header">
                                    <div className="header-left">
                                        <CheckSquare size={16} />
                                        <span>My tasks</span>
                                    </div>
                                    <div className="header-right">
                                        <div className="task-controls">
                                            <Search size={14} />
                                            <ChevronRight size={14} />
                                            <Plus size={14} />
                                            <button className="new-task-btn">New task</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="task-list">
                                    <div className="task-item">
                                        <div className="task-checkbox-group">
                                            <div className="checkbox" />
                                            <FileText size={14} />
                                            <span>Landing page</span>
                                        </div>
                                        <span className="task-date">July 11, 2025</span>
                                    </div>
                                    <div className="task-item">
                                        <div className="task-checkbox-group">
                                            <div className="checkbox" />
                                            <FileText size={14} />
                                            <span>Ad Spot</span>
                                        </div>
                                        <span className="task-date">July 15, 2025</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <div className="mm-dashboard">
            {/* Mobile Top Navigation */}
            <div className="mobile-nav-top">
                <button className="menu-toggle" onClick={toggleMobileMenu}>
                    <ArrowUp className={isMobileMenuOpen ? 'rotate-180' : ''} style={{ transform: isMobileMenuOpen ? 'rotate(180deg)' : 'none' }} />
                </button>
                <div className="mobile-logo">MM Docs</div>
                <div className="spacer" />
                <Bot size={20} />
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <motion.div
                    className="sidebar-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={toggleMobileMenu}
                />
            )}

            <aside
                className={`mm-sidebar ${isMobileMenuOpen ? 'open' : ''}`}
                style={{ width: isMobileMenuOpen ? undefined : `${sidebarWidth}px`, minWidth: isMobileMenuOpen ? undefined : `${sidebarWidth}px` }}
            >
                <div className="sidebar-resize-handle" onMouseDown={startResizing} />
                <div className="sidebar-header">
                    <div className="workspace-selector">
                        <div className="workspace-icon">D</div>
                        <span className="workspace-name">{user?.name}'s Workspace</span>
                        <div className="workspace-chevron">
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>
                <div className="sidebar-main-links">
                    <button
                        className={`sidebar-btn ${currentView === 'Search' ? 'active' : ''}`}
                        onClick={() => { setCurrentView('Search'); setGeneratedDoc(null); setIsMobileMenuOpen(false); }}
                    ><Search size={18} /> Search</button>
                    <button
                        className={`sidebar-btn ${currentView === 'Home' ? 'active' : ''}`}
                        onClick={() => { setCurrentView('Home'); setGeneratedDoc(null); setIsMobileMenuOpen(false); }}
                    ><Home size={18} /> Home</button>
                    <button
                        className={`sidebar-btn ${currentView === 'Inbox' ? 'active' : ''}`}
                        onClick={() => { setCurrentView('Inbox'); setGeneratedDoc(null); setIsMobileMenuOpen(false); }}
                    ><Inbox size={18} /> Inbox</button>
                </div>

                <div className="sidebar-section">
                    <div className="section-title">STRATEGY</div>
                    <button className="sidebar-btn" onClick={() => { setGeneratedDoc(privateDocs['vision']); setCurrentView('Home'); setIsMobileMenuOpen(false); }}><Sparkles size={16} color="#7c3aed" /> Product Vision</button>
                    <button className="sidebar-btn" onClick={() => { setGeneratedDoc(privateDocs['strategy']); setCurrentView('Home'); setIsMobileMenuOpen(false); }}><span className="emoji-icon">🎯</span> Growth Strategy</button>
                    <button className="sidebar-btn" onClick={() => { setGeneratedDoc(privateDocs['welcome']); setCurrentView('Home'); setIsMobileMenuOpen(false); }}><span className="emoji-icon">👋</span> Getting Started</button>
                </div>

                <div className="sidebar-section">
                    <div className="section-title">DRAFTS</div>
                    {docs.slice(0, 3).map(doc => (
                        <button key={doc._id} className="sidebar-btn" onClick={() => { setGeneratedDoc(doc); setCurrentView('Home'); setIsMobileMenuOpen(false); }}>
                            <FileText size={16} /> {doc.title.length > 20 ? doc.title.substring(0, 20) + '...' : doc.title}
                        </button>
                    ))}
                    {docs.length === 0 && <p style={{ fontSize: '11px', color: '#999', padding: '0 12px' }}>No recent drafts</p>}
                </div>

                <div className="sidebar-section">
                    <div className="section-title">Shared</div>
                    <button className="sidebar-btn action-btn"><Plus size={18} /> Start collaborating</button>
                </div>

                <div className="sidebar-bottom">
                    <button
                        className={`sidebar-btn ${currentView === 'Settings' ? 'active' : ''}`}
                        onClick={() => { setCurrentView('Settings'); setGeneratedDoc(null); setIsMobileMenuOpen(false); }}
                    ><Settings size={18} /> Settings</button>
                    <button
                        className={`sidebar-btn ${currentView === 'Templates' ? 'active' : ''}`}
                        onClick={() => { setCurrentView('Templates'); setGeneratedDoc(null); setIsMobileMenuOpen(false); }}
                    ><Layers size={18} /> Templates</button>
                    <button
                        className={`sidebar-btn ${currentView === 'Trash' ? 'active' : ''}`}
                        onClick={() => { setCurrentView('Trash'); setGeneratedDoc(null); setIsMobileMenuOpen(false); }}
                    ><Trash2 size={18} /> Trash</button>
                    <button className="sidebar-btn action-btn"><UserPlus size={18} /> Invite members</button>
                    <button onClick={handleLogout} className="sidebar-btn logout-link" style={{ color: '#ef4444', marginTop: '12px' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="mm-content">
                <header className="content-header">
                    <div className="header-breadcrumbs">
                        <span>{user?.name}'s Workspace</span>
                        <ChevronRight size={14} />
                        <span className="active">{currentView}</span>
                    </div>
                    <div className="header-actions">
                        <Clock size={18} />
                        <MoreHorizontal size={18} />
                    </div>
                </header>

                <div className="content-scrollable">
                    <AnimatePresence mode="wait">
                        {renderMainContent()}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
