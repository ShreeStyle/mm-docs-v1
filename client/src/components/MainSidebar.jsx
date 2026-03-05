import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard,
    FileText,
    Layout,
    Sparkles,
    Package,
    BarChart3,
    Settings,
    Menu,
    X
} from 'lucide-react';
import '../styles/MainSidebar.css';

const MainSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navigationItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard',
            badge: null
        },
        {
            id: 'documents',
            label: 'Documents',
            icon: FileText,
            path: '/dashboard/documents/all',
            badge: null
        },
        {
            id: 'templates',
            label: 'Templates',
            icon: Layout,
            path: '/dashboard/templates',
            badge: null
        },
        {
            id: 'ai-generator',
            label: 'AI Generator',
            icon: Sparkles,
            path: '/dashboard/ai-generator',
            badge: null
        },
        {
            id: 'catalog',
            label: 'Catalog',
            icon: Package,
            path: '/dashboard/catalog',
            badge: null
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChart3,
            path: '/dashboard/analytics',
            badge: null
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            path: '/dashboard/settings',
            badge: null
        }
    ];

    const handleNavigation = (path) => {
        navigate(path);
        setIsMobileOpen(false);
    };

    return (
        <>
            {/* Mobile Menu Toggle */}
            <button 
                className="mobile-menu-toggle"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="mobile-overlay"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`main-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                {/* Logo Section */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">
                            <FileText size={24} />
                        </div>
                        {!isCollapsed && (
                            <div className="logo-text">
                                <h2>MM Docs</h2>
                                <span>Document Platform</span>
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <button 
                            className="collapse-btn"
                            onClick={() => setIsCollapsed(true)}
                            title="Collapse sidebar"
                        >
                            <ChevronRight size={18} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {navigationItems.map(item => (
                            <li key={item.id} className="nav-item">
                                <button
                                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => handleNavigation(item.path)}
                                >
                                    <span className="nav-icon">
                                        <item.icon size={20} />
                                    </span>
                                    {!isCollapsed && (
                                        <span className="nav-label">{item.label}</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Expand Button (when collapsed) */}
                {isCollapsed && (
                    <button 
                        className="expand-btn"
                        onClick={() => setIsCollapsed(false)}
                        title="Expand sidebar"
                    >
                        <Menu size={20} />
                    </button>
                )}

                {/* Footer */}
                {!isCollapsed && (
                    <div className="sidebar-footer">
                        <div className="footer-content">
                            <p>© 2026 MM Docs</p>
                            <span>Version 2.0</span>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default MainSidebar;
