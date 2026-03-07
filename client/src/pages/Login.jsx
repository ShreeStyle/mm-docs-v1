import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

const LogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L22 10L28 4V24C28 26.2091 26.2091 28 24 28H8C5.79086 28 4 26.2091 4 24V4L10 10L16 4Z" fill="#7C3AED" />
        <path d="M10 12L16 6L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: 'demo@test.com',
        password: 'demo123'
    });
    const [error, setError] = useState('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            console.log('🔐 Attempting login to:', getApiUrl('/api/auth/login'));
            
            const response = await fetch(getApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            console.log('📥 Response status:', response.status);
            console.log('📥 Response headers:', response.headers);

            // Try to parse JSON response
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error('❌ Non-JSON response:', text);
                throw new Error('Server returned an invalid response. Please try again later.');
            }

            if (!response.ok) {
                // Provide more helpful error messages
                if (response.status === 404) {
                    throw new Error(`User not found. Please check your email or sign up first.`);
                } else if (response.status === 400) {
                    throw new Error(data.message || 'Invalid credentials. Please check your email and password.');
                } else if (response.status === 500) {
                    throw new Error(`Server error: ${data.message || 'Please try again later.'}`);
                }
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            console.log('✅ Login successful:', data);
            login(data.user, data.token);
            navigate('/dashboard');
            
        } catch (error) {
            console.error('❌ Login error:', error);
            setError(error.message || 'Error connecting to backend. Please check your internet connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="landing-page login-page-container">
            {/* Mesh Background */}
            <div className="bg-glow glow-1" />
            <div className="bg-glow glow-3" />

            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="auth-header">
                    <Link to="/" className="auth-logo-group">
                        <LogoIcon />
                        <span className="logo-text">MM Docs</span>
                    </Link>
                    
                    <h1>Welcome back</h1>
                    <p>Enter your details to access your documents.</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fee',
                        color: '#c00',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {error}
                        {error.includes('User not found') && (
                            <div style={{ marginTop: '8px' }}>
                                <Link to="/signup" style={{ color: '#7C3AED', textDecoration: 'underline' }}>
                                    Create a new account →
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleLoginSubmit} className="auth-form">
                    <div className="input-group">
                        <label><Mail size={16} /> Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <div className="label-row">
                            <label><Lock size={16} /> Password</label>
                            <Link to="#" className="forgot-pass">Forgot?</Link>
                        </div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="auth-footer">
                    New to MM Docs? <Link to="/signup">Register</Link>
                </div>
            </motion.div>
        </div>
    );
}
