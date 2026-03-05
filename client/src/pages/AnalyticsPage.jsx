import { BarChart3, TrendingUp, FileText, Clock } from 'lucide-react';

const AnalyticsPage = () => {
    return (
        <div style={{ padding: '32px', minHeight: '100vh', background: '#F8F9FB' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                        Analytics Dashboard
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                        Track document performance and business insights
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    {[
                        { icon: FileText, label: 'Total Documents', value: '1,234', change: '+12%' },
                        { icon: TrendingUp, label: 'Documents This Month', value: '89', change: '+23%' },
                        { icon: Clock, label: 'Avg. Generation Time', value: '2.3s', change: '-15%' },
                        { icon: BarChart3, label: 'Templates Used', value: '45', change: '+8%' }
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '24px',
                            border: '1px solid #E5E7EB'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: '#FEF3E2',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <stat.icon size={24} color="#F97316" />
                                </div>
                                <span style={{ color: '#10B981', fontSize: '14px', fontWeight: '600' }}>
                                    {stat.change}
                                </span>
                            </div>
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    border: '1px solid #E5E7EB',
                    textAlign: 'center'
                }}>
                    <BarChart3 size={64} color="#D1D5DB" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                        Detailed Analytics Coming Soon
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                        Advanced charts, reports, and business intelligence features
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
