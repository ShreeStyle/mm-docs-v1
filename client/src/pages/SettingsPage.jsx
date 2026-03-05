import { Settings as SettingsIcon, User, Shield, Palette, Bell, Plug } from 'lucide-react';

const SettingsPage = () => {
    const settingsSections = [
        { 
            title: 'Account Settings', 
            description: 'Manage your personal account information',
            icon: User,
            color: '#3B82F6'
        },
        { 
            title: 'Security', 
            description: 'Password, 2FA, and security preferences',
            icon: Shield,
            color: '#10B981'
        },
        { 
            title: 'Branding', 
            description: 'Customize your brand colors, logo, and templates',
            icon: Palette,
            color: '#F97316'
        },
        { 
            title: 'Integrations', 
            description: 'Connect CRM, HRMS, and other third-party tools',
            icon: Plug,
            color: '#8B5CF6'
        },
        { 
            title: 'Notifications', 
            description: 'Email and in-app notification preferences',
            icon: Bell,
            color: '#EF4444'
        }
    ];

    return (
        <div style={{ padding: '32px', minHeight: '100vh', background: '#F8F9FB' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
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
                        <div key={i} style={{
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
                        }}>
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
            </div>
        </div>
    );
};

export default SettingsPage;
