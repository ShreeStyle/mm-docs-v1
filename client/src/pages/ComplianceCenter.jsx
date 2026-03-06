import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, AlertCircle, TrendingUp, ArrowLeft } from 'lucide-react';
import { api } from '../utils/api';

const ComplianceCenter = () => {
    const navigate = useNavigate();
    const [complianceData, setComplianceData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplianceData();
    }, []);

    const fetchComplianceData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/compliance/check');
            setComplianceData(response);
        } catch (error) {
            console.error('Error fetching compliance data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p>Loading compliance data...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px', backgroundColor: '#F8F9FB', minHeight: '100vh' }}>
            <button
                onClick={() => navigate('/dashboard')}
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
                Back to Dashboard
            </button>

            <div style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0
                }}>Compliance Center</h1>
                <p style={{
                    fontSize: '16px',
                    color: '#6B7280',
                    margin: '8px 0 0 0'
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
                        <TrendingUp size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
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
                                {check.status === 'passed' ? (
                                    <CheckCircle size={24} color="#10B981" />
                                ) : (
                                    <AlertCircle size={24} color="#F59E0B" />
                                )}

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
};

export default ComplianceCenter;
