import { Plug, Zap } from 'lucide-react';

const IntegrationsPage = () => {
    const integrations = [
        { name: 'Stripe', description: 'Payment processing', icon: '💳', status: 'Available' },
        { name: 'Salesforce', description: 'CRM integration', icon: '☁️', status: 'Available' },
        { name: 'DocuSign', description: 'E-signature service', icon: '✍️', status: 'Available' },
        { name: 'Slack', description: 'Team communication', icon: '💬', status: 'Coming Soon' },
        { name: 'Google Drive', description: 'Cloud storage', icon: '📁', status: 'Coming Soon' },
        { name: 'Zapier', description: 'Workflow automation', icon: '⚡', status: 'Coming Soon' }
    ];

    return (
        <div style={{ padding: '32px', minHeight: '100vh', background: '#F8F9FB' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                        Integrations
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                        Connect your favorite tools and services
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {integrations.map((integration, i) => (
                        <div key={i} style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            border: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: '#F9FAFB',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                                flexShrink: 0
                            }}>
                                {integration.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                                    {integration.name}
                                </h3>
                                <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 8px 0' }}>
                                    {integration.description}
                                </p>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 10px',
                                    background: integration.status === 'Available' ? '#DCFCE7' : '#F3F4F6',
                                    color: integration.status === 'Available' ? '#16A34A' : '#6B7280',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    {integration.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IntegrationsPage;
