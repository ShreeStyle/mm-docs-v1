import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User, Mail, Lock, CheckCircle2, X, Globe, FileText, Sparkles, Shield, TrendingUp } from 'lucide-react';
import { getApiUrl } from '../config/api';

const COUNTRIES = [
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
];

const stats = [
    { value: '10,000+', label: 'Documents Created' },
    { value: '500+', label: 'Businesses Using MM Docs' },
    { value: '98%', label: 'User Satisfaction' },
];

export default function Signup() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', countryCode: 'IN' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(getApiUrl('/api/auth/signup'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(formData)
            });

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                throw new Error('Server returned an invalid response. Please try again later.');
            }

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => navigate('/login'), 1500);
            } else {
                if (response.status === 400 && data.message?.includes('already registered')) {
                    throw new Error('This email is already registered. Please login instead.');
                } else if (response.status === 500) {
                    throw new Error(`Server error: ${data.message || 'Please try again later.'}`);
                }
                throw new Error(data.message || 'Signup failed. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Error connecting to backend server');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '12px 16px', border: '1.5px solid #E5E7EB', borderRadius: '10px',
        fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s', backgroundColor: 'white'
    };
    const labelStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Left Panel */}
            <div className="auth-left-panel" style={{
                width: '45%', background: 'linear-gradient(135deg, #4F46E5 0%, #5C67F2 50%, #818CF8 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start',
                padding: '60px', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                <div style={{ position: 'relative', zIndex: 2, maxWidth: '380px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                                <path d="M10 8h8l4 4v12H10V8z" fill="white" />
                                <path d="M18 8v4h4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                            </svg>
                        </div>
                        <span style={{ fontSize: '22px', fontWeight: '700', color: 'white', letterSpacing: '-0.02em' }}>MM Docs</span>
                    </div>

                    <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'white', margin: '0 0 16px', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
                        Join thousands of<br />smart businesses
                    </h1>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', margin: '0 0 48px', lineHeight: 1.7 }}>
                        Start generating professional documents, contracts, and reports in seconds. Free to get started.
                    </p>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
                        {stats.map(({ value, label }, i) => (
                            <div key={i} style={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '16px 12px', textAlign: 'center', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{value}</div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '500', lineHeight: 1.3 }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', backgroundColor: ['#A78BFA', '#818CF8', '#6366F1', '#4338CA'][i], marginLeft: i > 0 ? '-10px' : 0 }} />
                        ))}
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginLeft: '4px' }}>+500 businesses joined this month</span>
                    </div>
                </div>
            </div>

            {/* Right Panel — Signup Form */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 24px', backgroundColor: '#F8F9FB', overflowY: 'auto' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                        {isSuccess ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <CheckCircle2 size={64} color="#5C67F2" style={{ margin: '0 auto 20px' }} />
                                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>Welcome aboard!</h2>
                                <p style={{ fontSize: '14px', color: '#6B7280' }}>Redirecting to login...</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '28px' }}>
                                    <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Create your account</h2>
                                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Start generating professional documents in seconds.</p>
                                </div>

                                {error && (
                                    <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', border: '1px solid #FECACA', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                        <span>{error}</span>
                                        <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#DC2626', flexShrink: 0 }}><X size={14} /></button>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                    <div>
                                        <label style={labelStyle}><User size={14} /> Full Name</label>
                                        <input type="text" placeholder="John Doe" required value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#5C67F2'}
                                            onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}><Mail size={14} /> Email Address</label>
                                        <input type="email" placeholder="name@company.com" required value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#5C67F2'}
                                            onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}><Lock size={14} /> Password</label>
                                        <input type="password" placeholder="••••••••" required value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#5C67F2'}
                                            onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}><Globe size={14} /> Country</label>
                                        <select value={formData.countryCode}
                                            onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                                            style={{ ...inputStyle, cursor: 'pointer' }}>
                                            {COUNTRIES.map(c => (
                                                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button type="submit" disabled={isLoading} style={{
                                        width: '100%', padding: '13px', backgroundColor: isLoading ? '#A5B4FC' : '#5C67F2',
                                        color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600',
                                        cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
                                    }}
                                        onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#4F46E5'; }}
                                        onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#5C67F2'; }}>
                                        {isLoading ? 'Creating account...' : 'Get Started'}
                                        {!isLoading && <ArrowRight size={18} />}
                                    </button>
                                </form>

                                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6B7280' }}>
                                    Already have an account?{' '}
                                    <Link to="/login" style={{ color: '#5C67F2', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
