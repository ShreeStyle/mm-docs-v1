import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Shield, Palette, Bell, Plug, ArrowLeft, Save, Check, Key, Smartphone } from 'lucide-react';
import { api } from '../utils/api';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('menu');
    const [accountData, setAccountData] = useState(null);
    const [integrations, setIntegrations] = useState(null);
    const [notifications, setNotifications] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (activeSection === 'account') {
            fetchAccountSettings();
        } else if (activeSection === 'integrations') {
            fetchIntegrations();
        } else if (activeSection === 'notifications') {
            fetchNotifications();
        }
    }, [activeSection]);

    const fetchAccountSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/settings/account');
            setAccountData(response.settings);
        } catch (error) {
            console.error('Error fetching account settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchIntegrations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/settings/integrations');
            setIntegrations(response.integrations);
        } catch (error) {
            console.error('Error fetching integrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/settings/notifications');
            setNotifications(response.settings);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await api.put('/settings/account', accountData);
            setMessage({ type: 'success', text: 'Account settings updated successfully' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update account settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleIntegration = async (integrationName, enabled) => {
        try {
            await api.put('/settings/integrations', {
                integration: integrationName,
                enabled
            });
            setIntegrations(prev => ({
                ...prev,
                [integrationName]: { ...prev[integrationName], enabled, connected: enabled }
            }));
            setMessage({ type: 'success', text: `${integrationName} ${enabled ? 'enabled' : 'disabled'}` });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update integration' });
        }
    };

    const handleUpdateNotifications = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.put('/settings/notifications', notifications);
            setMessage({ type: 'success', text: 'Notification preferences updated' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update notifications' });
        } finally {
            setLoading(false);
        }
    };

    const settingsSections = [
        { 
            id: 'account',
            title: 'Account Settings', 
            description: 'Manage your personal account information',
            icon: User,
            color: '#3B82F6'
        },
        { 
            id: 'security',
            title: 'Security', 
            description: 'Password, 2FA, and security preferences',
            icon: Shield,
            color: '#10B981'
        },
        { 
            id: 'branding',
            title: 'Branding', 
            description: 'Customize your brand colors, logo, and templates',
            icon: Palette,
            color: '#F97316'
        },
        { 
            id: 'integrations',
            title: 'Integrations', 
            description: 'Connect CRM, HRMS, and other third-party tools',
            icon: Plug,
            color: '#8B5CF6'
        },
        { 
            id: 'notifications',
            title: 'Notifications', 
            description: 'Email and in-app notification preferences',
            icon: Bell,
            color: '#EF4444'
        }
    ];

    // Account Settings Section
    const renderAccountSection = () => (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                    Account Settings
                </h2>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                    Manage your personal account information
                </p>
            </div>
            
            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading...</div>
            ) : accountData ? (
                <form onSubmit={handleUpdateAccount} style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={accountData.name || ''}
                            onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={accountData.email || ''}
                            onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '20px', padding: '16px', background: '#F9FAFB', borderRadius: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Plan</div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', textTransform: 'capitalize' }}>
                                    {accountData.plan || 'Free'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Status</div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: accountData.subscriptionStatus === 'active' ? '#10B981' : '#6B7280', textTransform: 'capitalize' }}>
                                    {accountData.subscriptionStatus || 'Active'}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Documents This Month</div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                                    {accountData.documentsGeneratedThisMonth || 0}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            background: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Save size={16} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            ) : null}
        </div>
    );

    // Security Section
    const renderSecuritySection = () => (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                    Security
                </h2>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                    Manage your password and security settings
                </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', background: '#10B98115', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Key size={24} color="#10B981" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                                Password
                            </h3>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                Last changed 30 days ago
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setMessage({ type: 'info', text: 'Password change feature coming soon' })}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            color: '#3B82F6',
                            border: '1px solid #3B82F6',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Change Password
                    </button>
                </div>
                
                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', background: '#8B5CF615', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Smartphone size={24} color="#8B5CF6" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                                Two-Factor Authentication
                            </h3>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                Add an extra layer of security
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setMessage({ type: 'info', text: '2FA feature coming soon' })}
                        style={{
                            padding: '10px 20px',
                            background: '#8B5CF6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Enable 2FA
                    </button>
                </div>
            </div>
        </div>
    );

    // Integrations Section
    const renderIntegrationsSection = () => {
        const integrationList = [
            { name: 'stripe', label: 'Stripe', description: 'Payment processing', color: '#635BFF' },
            { name: 'salesforce', label: 'Salesforce', description: 'CRM integration', color: '#00A1E0' },
            { name: 'docusign', label: 'DocuSign', description: 'E-signature platform', color: '#FFB900' },
            { name: 'slack', label: 'Slack', description: 'Team communication', color: '#4A154B' },
            { name: 'googleDrive', label: 'Google Drive', description: 'Cloud storage', color: '#4285F4' },
            { name: 'zapier', label: 'Zapier', description: 'Workflow automation', color: '#FF4A00' }
        ];

        return (
            <div>
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                        Integrations
                    </h2>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                        Connect your favorite tools and services
                    </p>
                </div>
                
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading...</div>
                ) : integrations ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {integrationList.map(int => (
                            <div key={int.name} style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '20px',
                                border: '1px solid #E5E7EB'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', background: `${int.color}15`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Plug size={20} color={int.color} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{int.label}</div>
                                            <div style={{ fontSize: '12px', color: '#6B7280' }}>{int.description}</div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleIntegration(int.name, !integrations[int.name]?.enabled)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: integrations[int.name]?.enabled ? '#10B98115' : 'transparent',
                                        color: integrations[int.name]?.enabled ? '#10B981' : '#6B7280',
                                        border: `1px solid ${integrations[int.name]?.enabled ? '#10B981' : '#D1D5DB'}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {integrations[int.name]?.enabled ? 'Connected' : 'Connect'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    };

    // Notifications Section
    const renderNotificationsSection = () => (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                    Notifications
                </h2>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                    Manage your notification preferences
                </p>
            </div>
            
            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading...</div>
            ) : notifications ? (
                <form onSubmit={handleUpdateNotifications}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Email Notifications</h3>
                        {Object.keys(notifications.email || {}).map(key => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                                <span style={{ fontSize: '14px', color: '#374151', textTransform: 'capitalize' }}>
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.email[key]}
                                    onChange={(e) => setNotifications({
                                        ...notifications,
                                        email: { ...notifications.email, [key]: e.target.checked }
                                    })}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                            </label>
                        ))}
                    </div>
                    
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E7EB', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>In-App Notifications</h3>
                        {Object.keys(notifications.inApp || {}).map(key => (
                            <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
                                <span style={{ fontSize: '14px', color: '#374151', textTransform: 'capitalize' }}>
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={notifications.inApp[key]}
                                    onChange={(e) => setNotifications({
                                        ...notifications,
                                        inApp: { ...notifications.inApp, [key]: e.target.checked }
                                    })}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                            </label>
                        ))}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            background: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Save size={16} />
                        {loading ? 'Saving...' : 'Save Preferences'}
                    </button>
                </form>
            ) : null}
        </div>
    );

    return (
        <div style={{ padding: '32px', minHeight: '100vh', background: '#F8F9FB' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <button
                    onClick={() => activeSection === 'menu' ? navigate('/dashboard') : setActiveSection('menu')}
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
                    {activeSection === 'menu' ? 'Back to Dashboard' : 'Back to Settings'}
                </button>
                
                {message.text && (
                    <div style={{
                        padding: '12px 16px',
                        background: message.type === 'success' ? '#10B98115' : message.type === 'error' ? '#EF444415' : '#3B82F615',
                        color: message.type === 'success' ? '#10B981' : message.type === 'error' ? '#EF4444' : '#3B82F6',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {message.type === 'success' && <Check size={16} />}
                        {message.text}
                    </div>
                )}

                {activeSection === 'menu' ? (
                    <>
                        <div style={{ marginBottom: '32px' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                                Settings
                            </h1>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                Manage your workspace configuration
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {settingsSections.map((section, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => {
                                        if (section.id === 'branding') {
                                            navigate('/settings/brand');
                                        } else {
                                            setActiveSection(section.id);
                                        }
                                    }}
                                    style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        padding: '24px',
                                        border: '1px solid #E5E7EB',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = section.color;
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                        e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                >
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        background: `${section.color}15`,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <section.icon size={28} color={section.color} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                                            {section.title}
                                        </h3>
                                        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                                            {section.description}
                                        </p>
                                    </div>
                                    <div style={{ color: '#9CA3AF' }}>→</div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : activeSection === 'account' ? (
                    renderAccountSection()
                ) : activeSection === 'security' ? (
                    renderSecuritySection()
                ) : activeSection === 'integrations' ? (
                    renderIntegrationsSection()
                ) : activeSection === 'notifications' ? (
                    renderNotificationsSection()
                ) : null}
            </div>
        </div>
    );
};

export default SettingsPage;
