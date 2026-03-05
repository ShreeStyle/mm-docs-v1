import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FileText, 
    TrendingUp, 
    Clock,
    Layers,
    Calendar,
    CheckCircle,
    AlertCircle,
    Users,
    BarChart3,
    Activity
} from 'lucide-react';
import '../styles/DashboardOverview.css';

const API_URL = 'http://localhost:5000/api';

const DashboardOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get(`${API_URL}/analytics/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Fallback to mock data
            setStats({
                overview: {
                    totalDocuments: 45,
                    documentsThisMonth: 12,
                    documentsChange: 23,
                    avgGenerationTime: 45,
                    templatesUsed: 8,
                    pendingApprovals: 3
                },
                recentDocuments: [],
                topTemplates: [
                    { name: 'NDA', count: 15 },
                    { name: 'Employment Contract', count: 12 },
                    { name: 'Sales Proposal', count: 10 },
                    { name: 'Invoice', count: 8 }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-overview loading">
                <div className="loading-spinner">
                    <Activity size={48} />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const { overview, recentDocuments, topTemplates } = stats;

    return (
        <div className="dashboard-overview">
            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's what's happening with your documents.</p>
                </div>
                <button className="btn-primary">
                    <FileText size={18} />
                    New Document
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Documents</span>
                        <div className="stat-value">
                            <span className="stat-number">{overview.totalDocuments}</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon green">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Documents This Month</span>
                        <div className="stat-value">
                            <span className="stat-number">{overview.documentsThisMonth}</span>
                            <span className={`stat-change ${overview.documentsChange >= 0 ? 'positive' : 'negative'}`}>
                                {overview.documentsChange >= 0 ? '+' : ''}{overview.documentsChange}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Avg Generation Time</span>
                        <div className="stat-value">
                            <span className="stat-number">{overview.avgGenerationTime}s</span>
                            <span className="stat-change negative">-15%</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Layers size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Templates Used</span>
                        <div className="stat-value">
                            <span className="stat-number">{overview.templatesUsed}</span>
                            <span className="stat-change positive">+8%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-content">
                {/* Recent Documents */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Recent Documents</h2>
                        <a href="/dashboard/documents/all" className="view-all">View All</a>
                    </div>
                    <div className="documents-list">
                        {recentDocuments && recentDocuments.length > 0 ? (
                            recentDocuments.map(doc => (
                                <div key={doc._id} className="document-item">
                                    <div className="document-icon">
                                        <FileText size={20} />
                                    </div>
                                    <div className="document-info">
                                        <h4>{doc.title}</h4>
                                        <span className="document-meta">
                                            {doc.type} · {new Date(doc.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className={`document-status ${doc.category}`}>
                                        {doc.category || 'other'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <FileText size={48} />
                                <p>No recent documents</p>
                                <button className="btn-secondary">Create Your First Document</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Approvals */}
                {overview.pendingApprovals > 0 && (
                    <div className="dashboard-section pending">
                        <div className="section-header">
                            <h2>
                                <AlertCircle size={20} />
                                Pending Approvals
                            </h2>
                            <span className="badge">{overview.pendingApprovals}</span>
                        </div>
                        <div className="approval-list">
                            <div className="approval-item">
                                <div>
                                    <h4>Employment Contract - John Doe</h4>
                                    <span className="approval-meta">Waiting for HR approval</span>
                                </div>
                                <div className="approval-actions">
                                    <button className="btn-sm btn-outline">View</button>
                                    <button className="btn-sm btn-primary">Approve</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Templates */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Most Used Templates</h2>
                        <a href="/dashboard/templates" className="view-all">View All</a>
                    </div>
                    <div className="templates-grid">
                        {topTemplates.map((template, index) => (
                            <div key={index} className="template-item">
                                <div className="template-rank">#{index + 1}</div>
                                <div className="template-info">
                                    <h4>{template.name}</h4>
                                    <span className="template-usage">{template.count} documents</span>
                                </div>
                                <div className="template-bar">
                                    <div 
                                        className="template-bar-fill" 
                                        style={{ width: `${(template.count / topTemplates[0].count) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-section actions">
                    <div className="section-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="actions-grid">
                        <button className="action-card" onClick={() => window.location.href = '/dashboard/ai-generator'}>
                            <div className="action-icon blue">
                                <FileText size={24} />
                            </div>
                            <div className="action-content">
                                <h4>Generate Document</h4>
                                <p>Create a new document with AI</p>
                            </div>
                        </button>
                        <button className="action-card" onClick={() => window.location.href = '/dashboard/templates'}>
                            <div className="action-icon orange">
                                <Layers size={24} />
                            </div>
                            <div className="action-content">
                                <h4>Browse Templates</h4>
                                <p>Choose from pre-built templates</p>
                            </div>
                        </button>
                        <button className="action-card" onClick={() => window.location.href = '/dashboard/analytics'}>
                            <div className="action-icon purple">
                                <BarChart3 size={24} />
                            </div>
                            <div className="action-content">
                                <h4>View Analytics</h4>
                                <p>See your document insights</p>
                            </div>
                        </button>
                        <button className="action-card" onClick={() => window.location.href = '/dashboard/catalog'}>
                            <div className="action-icon green">
                                <Layers size={24} />
                            </div>
                            <div className="action-content">
                                <h4>Manage Catalog</h4>
                                <p>Add products and services</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
