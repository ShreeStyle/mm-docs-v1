import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, FileText, Sparkles, Shield, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

const LogoIcon = () => (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#5C67F2" />
        <path d="M10 8h8l4 4v12H10V8z" fill="white" opacity="0.9" />
        <path d="M18 8v4h4" fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="13" y1="14" x2="19" y2="14" stroke="#5C67F2" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="13" y1="17" x2="19" y2="17" stroke="#5C67F2" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="13" y1="20" x2="16" y2="20" stroke="#5C67F2" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const features = [
    { icon: FileText, text: 'Generate professional documents in seconds' },
    { icon: Sparkles, text: 'AI-powered templates for every need' },
    { icon: Shield, text: 'Secure and compliant document storage' },
    { icon: TrendingUp, text: 'Track document activity and insights' },
];

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(getApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                throw new Error('Server returned an invalid response. Please try again later.');
            }

            if (!response.ok) {
                let errorMessage = data.message || `HTTP error! status: ${response.status}`;
                if (data.hint) errorMessage += `\n\n${data.hint}`;
                if (response.status === 404) throw new Error(errorMessage || 'User not found. Please check your email or sign up first.');
                else if (response.status === 400) throw new Error(errorMessage || 'Invalid credentials. Please check your email and password.');
                else if (response.status === 503) throw new Error(errorMessage || 'Service temporarily unavailable. Please try again in a moment.');
                else if (response.status === 500) throw new Error(errorMessage || 'Server error. Please try again later.');
                throw new Error(errorMessage);
            }

            login(data.user, data.token);
            navigate('/dashboard');
        } catch (error) {
            setError(error.message || 'Error connecting to backend. Please check your internet connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Left Panel — Branding */}
            <div style={{
                width: '45%', background: 'linear-gradient(135deg, #4F46E5 0%, #5C67F2 50%, #818CF8 100%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start',
                padding: '60px', position: 'relative', overflow: 'hidden',
                '@media (max-width: 768px)': { display: 'none' }
            }} className="auth-left-panel">
                {/* Background decorations */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ position: 'absolute', top: '50%', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                <div style={{ position: 'relative', zIndex: 2, maxWidth: '380px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                                <path d="M10 8h8l4 4v12H10V8z" fill="white" />
                                <path d="M18 8v4h4" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
                            </svg>
                        </div>
                        <span style={{ fontSize: '22px', fontWeight: '700', color: 'white', letterSpacing: '-0.02em' }}>MM Docs</span>
                    </div>

                    <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'white', margin: '0 0 16px', lineHeight: 1.2, letterSpacing: '-0.03em' }}>
                        Create documents<br />at the speed of AI
                    </h1>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: '0 0 48px', lineHeight: 1.7 }}>
                        Generate professional documents, contracts, and reports in seconds. Trusted by thousands of businesses.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {features.map(({ icon: Icon, text }, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon size={18} color="white" />
                                </div>
                                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel — Login Form */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 24px', backgroundColor: '#F8F9FB' }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    {/* Mobile Logo */}
                    <div className="auth-mobile-logo" style={{ display: 'none', marginBottom: '32px', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                        <LogoIcon />
                        <span style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>MM Docs</span>
                    </div>

                    <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Welcome back</h2>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Enter your details to access your documents.</p>
                        </div>

                        {error && (
                            <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', border: '1px solid #FECACA', lineHeight: 1.5 }}>
                                {error}
                                {error.includes('User not found') && (
                                    <div style={{ marginTop: '8px' }}>
                                        <Link to="/signup" style={{ color: '#5C67F2', textDecoration: 'underline', fontWeight: '600' }}>Create a new account →</Link>
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                    <Mail size={14} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                                    onFocus={e => e.target.style.borderColor = '#5C67F2'}
                                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                                        <Lock size={14} /> Password
                                    </label>
                                    <Link to="#" style={{ fontSize: '13px', color: '#5C67F2', textDecoration: 'none', fontWeight: '500' }}>Forgot?</Link>
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                                    onFocus={e => e.target.style.borderColor = '#5C67F2'}
                                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%', padding: '13px', backgroundColor: isLoading ? '#A5B4FC' : '#5C67F2',
                                    color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600',
                                    cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: '8px', transition: 'all 0.2s', letterSpacing: '-0.01em'
                                }}
                                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#4F46E5'; }}
                                onMouseLeave={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#5C67F2'; }}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6B7280' }}>
                            New to MM Docs?{' '}
                            <Link to="/signup" style={{ color: '#5C67F2', fontWeight: '600', textDecoration: 'none' }}>Create account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
